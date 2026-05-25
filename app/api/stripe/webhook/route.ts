/**
 * Stripe webhook handler.
 *
 * Verifies the request signature against `STRIPE_WEBHOOK_SECRET`,
 * then routes the event into a focused handler that updates the
 * `subscriptions` row. The service-role Supabase client is used
 * because webhook calls are unauthenticated (Stripe → us, no user
 * session attached); the user identity is recovered from the
 * subscription's `metadata.user_id` or by looking up the customer id
 * we cached during Checkout.
 *
 * Events handled (per Prompt 4.2 / MVP Spec §3.2):
 *   - customer.subscription.created   → flip to pro, status from event
 *   - customer.subscription.updated   → tier / status / period end / cancel flag
 *   - customer.subscription.deleted   → tier=free, status=canceled
 *   - customer.subscription.trial_will_end → analytics only (no DB write)
 *   - invoice.payment_failed          → status=past_due
 *   - invoice.payment_succeeded       → status=active (clears past_due)
 *
 * Every event is captured to PostHog under `stripe_webhook` so we
 * can debug missed updates without trawling Stripe Dashboard.
 *
 * IMPORTANT: returns 200 on intentional no-op events (e.g. customers
 * created outside our flow) so Stripe doesn't keep retrying. Errors
 * return 500 *only* for genuine signature / DB failures; the handler
 * never throws on missing-but-expected fields.
 */
import { NextResponse } from "next/server";

import Stripe from "stripe";

import { getStripeClient } from "@/lib/billing/stripe";
import { createServiceClient } from "@/lib/db/service";
import { captureServerEvent } from "@/lib/tracing/posthog-server";
import type { Database } from "@/lib/db/types.gen";

type SubStatus = Database["public"]["Enums"]["subscription_status_enum"];

// Stripe API can return any of these on a subscription; we collapse
// them into our smaller enum.
function mapStripeStatus(status: Stripe.Subscription.Status): SubStatus {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
    case "paused":
      return "canceled";
    case "incomplete":
      return "incomplete";
    default:
      return "incomplete";
  }
}

function isoFromUnix(seconds: number | null | undefined): string | null {
  if (!seconds) return null;
  try {
    return new Date(seconds * 1000).toISOString();
  } catch {
    return null;
  }
}

/**
 * Recovers our `users.id` from a Stripe subscription. Prefer the
 * `metadata.user_id` we set in createCheckoutSession; fall back to
 * the customer id cached in `subscriptions` if metadata is missing
 * (e.g. subscriptions seeded outside Checkout).
 */
async function resolveUserIdFromSubscription(
  sub: Stripe.Subscription,
): Promise<string | null> {
  const fromMeta = (sub.metadata?.user_id ?? "").trim();
  if (fromMeta) return fromMeta;

  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.user_id ?? null;
}

async function resolveUserIdFromCustomerId(
  customerId: string,
): Promise<string | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.user_id ?? null;
}

async function upsertSubscriptionFromStripeSub(
  userId: string,
  sub: Stripe.Subscription,
) {
  const supabase = createServiceClient();
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const periodEnd = isoFromUnix(
    // Stripe added subscription-level period end at the item level in
    // newer APIs; fall back to the first item if the top-level field
    // is undefined.
    (sub as unknown as { current_period_end?: number }).current_period_end ??
      sub.items.data[0]?.current_period_end,
  );

  await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        tier: "pro",
        status: mapStripeStatus(sub.status),
        current_period_end: periodEnd,
        trial_end: isoFromUnix(sub.trial_end),
        cancel_at_period_end: sub.cancel_at_period_end ?? false,
      },
      { onConflict: "user_id" },
    );
}

async function markSubscriptionCanceled(userId: string, sub: Stripe.Subscription) {
  const supabase = createServiceClient();
  await supabase
    .from("subscriptions")
    .update({
      tier: "free",
      status: "canceled",
      stripe_subscription_id: sub.id,
      cancel_at_period_end: false,
    })
    .eq("user_id", userId);
}

async function setStatus(userId: string, status: SubStatus) {
  const supabase = createServiceClient();
  await supabase
    .from("subscriptions")
    .update({ status })
    .eq("user_id", userId);
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 500 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 },
    );
  }

  // Must verify against the *raw* body bytes — never the parsed JSON.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed", err);
    return NextResponse.json(
      { error: "Invalid signature." },
      { status: 400 },
    );
  }

  try {
    await handleEvent(event);
  } catch (err) {
    console.error(`[stripe-webhook] handler crashed on ${event.type}`, err);
    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = await resolveUserIdFromSubscription(sub);
      if (!userId) {
        await trace(event, null, "no_user_id_resolvable");
        return;
      }
      await upsertSubscriptionFromStripeSub(userId, sub);
      await trace(event, userId, "ok", {
        status: sub.status,
        cancel_at_period_end: sub.cancel_at_period_end,
      });
      return;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = await resolveUserIdFromSubscription(sub);
      if (!userId) {
        await trace(event, null, "no_user_id_resolvable");
        return;
      }
      await markSubscriptionCanceled(userId, sub);
      await trace(event, userId, "ok");
      return;
    }

    case "customer.subscription.trial_will_end": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = await resolveUserIdFromSubscription(sub);
      await trace(event, userId, "ok", {
        trial_end: sub.trial_end,
        // Phase 5 will hook an email here; today the event is logged
        // so we have the data when the email surface lands.
      });
      return;
    }

    case "invoice.payment_failed":
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id ?? null;
      if (!customerId) {
        await trace(event, null, "no_customer_id");
        return;
      }
      const userId = await resolveUserIdFromCustomerId(customerId);
      if (!userId) {
        await trace(event, null, "no_user_id_resolvable");
        return;
      }
      if (event.type === "invoice.payment_failed") {
        await setStatus(userId, "past_due");
      } else {
        await setStatus(userId, "active");
      }
      await trace(event, userId, "ok");
      return;
    }

    default:
      // Unhandled but expected event types (customer.created, etc.).
      await trace(event, null, "unhandled");
      return;
  }
}

async function trace(
  event: Stripe.Event,
  userId: string | null,
  outcome: string,
  extra?: Record<string, unknown>,
): Promise<void> {
  try {
    await captureServerEvent({
      distinctId: userId ?? "stripe-webhook-anonymous",
      event: "stripe_webhook",
      properties: {
        event_type: event.type,
        event_id: event.id,
        outcome,
        livemode: event.livemode,
        ...(extra ?? {}),
      },
    });
  } catch (err) {
    // PostHog should never break webhook processing.
    console.warn("[stripe-webhook] posthog capture failed", err);
  }
}
