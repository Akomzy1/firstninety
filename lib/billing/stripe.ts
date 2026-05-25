/**
 * Stripe client + helpers.
 *
 * Used by the billing server actions (lib/billing/actions / app/(app)/
 * settings/billing/actions.ts) and the webhook handler (Prompt 4.2).
 *
 * Per PRD §8.1 + MVP Spec §1.1:
 *   - Two recurring prices: monthly ($39.99) and yearly ($399).
 *   - 7-day free trial on first paid subscription (configured at
 *     Checkout session creation, not on the Price object — so we can
 *     turn it off without re-creating the Price if needed).
 *   - Customer Portal handles plan change / cancel / payment method /
 *     invoices. Configure it manually in the Stripe Dashboard.
 *
 * The customer record is keyed by Supabase `users.id` (carried in
 * `metadata.user_id`) and reflected back into `subscriptions.
 * stripe_customer_id` once the webhook fires.
 */
import "server-only";

import Stripe from "stripe";

import { createServiceClient } from "@/lib/db/service";

let _client: Stripe | null = null;

/**
 * Lazy singleton — we only instantiate on the first call so unit tests
 * and code paths that never touch billing don't require the env var.
 */
export function getStripeClient(): Stripe {
  if (_client) return _client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY. Add it to .env.local — see .env.example.",
    );
  }
  _client = new Stripe(key, {
    // Pin the API version so a Stripe-side upgrade doesn't silently
    // break our webhook + types. Bump deliberately, alongside `stripe`
    // package upgrades.
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  });
  return _client;
}

export type CheckoutPlan = "monthly" | "yearly";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function priceIdForPlan(plan: CheckoutPlan): string {
  const id =
    plan === "monthly"
      ? process.env.STRIPE_PRO_PRICE_ID_MONTHLY
      : process.env.STRIPE_PRO_PRICE_ID_YEARLY;
  if (!id) {
    throw new Error(
      `Missing STRIPE_PRO_PRICE_ID_${plan.toUpperCase()}. ` +
        "Create the Product 'FirstNinety Pro' in the Stripe Dashboard, " +
        "capture the price IDs for monthly + yearly, and add them to .env.local.",
    );
  }
  return id;
}

/**
 * Returns (or lazily creates) the Stripe Customer for this user. The
 * customer is keyed by user_id via metadata so the webhook can resolve
 * the user back from a Customer object alone.
 *
 * Writes the customer id back onto `subscriptions.stripe_customer_id`
 * so subsequent calls hit the cached id. The webhook will overwrite
 * the row authoritatively when the subscription is created.
 */
async function ensureCustomerForUser(userId: string): Promise<string> {
  const supabase = createServiceClient();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (sub?.stripe_customer_id) return sub.stripe_customer_id;

  const { data: userRow } = await supabase
    .from("users")
    .select("email, display_name")
    .eq("id", userId)
    .single();

  const stripe = getStripeClient();
  const customer = await stripe.customers.create({
    email: userRow?.email ?? undefined,
    name: userRow?.display_name ?? undefined,
    metadata: { user_id: userId },
  });

  // Upsert so a missing subscriptions row still becomes "free + customer".
  await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: customer.id,
        tier: "free",
        status: "free",
      },
      { onConflict: "user_id" },
    );

  return customer.id;
}

/**
 * Creates a Checkout session for the chosen plan. Returns the
 * hosted-checkout URL — the action redirects the browser to it.
 *
 * Trial is configured at session creation (7 days). Stripe will charge
 * automatically when the trial ends unless the user cancels first.
 */
export async function createCheckoutSession(
  userId: string,
  plan: CheckoutPlan,
): Promise<{ url: string }> {
  const stripe = getStripeClient();
  const customerId = await ensureCustomerForUser(userId);
  const priceId = priceIdForPlan(plan);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 7,
      metadata: { user_id: userId },
    },
    metadata: { user_id: userId, plan },
    success_url: `${APP_URL}/home?checkout=success`,
    cancel_url: `${APP_URL}/pricing?checkout=cancelled`,
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw new Error("Stripe returned a Checkout session without a URL.");
  }
  return { url: session.url };
}

/**
 * Creates a Customer Portal session so the user can change plan,
 * cancel, update payment method, or view invoices. The Portal itself
 * is configured in the Stripe Dashboard (Settings → Billing → Customer
 * Portal); we just mint a session URL here.
 */
export async function createPortalSession(
  userId: string,
): Promise<{ url: string }> {
  const stripe = getStripeClient();
  const customerId = await ensureCustomerForUser(userId);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${APP_URL}/settings/billing`,
  });

  return { url: session.url };
}
