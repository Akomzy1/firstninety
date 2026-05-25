/**
 * Settings → Billing.
 *
 * Three render states:
 *   1. **Pro / trialing** — shows current tier, next billing date,
 *      "Manage subscription" → Customer Portal.
 *   2. **Free + Stripe configured** — shows free tier with a
 *      monthly/yearly plan toggle and a "Start free trial" CTA that
 *      kicks Checkout.
 *   3. **Free + Stripe NOT configured** — shows free tier with a
 *      quiet note saying billing isn't configured yet (admin gap).
 *      Used in dev before STRIPE_* env vars are real.
 *
 * The TierLimitPrompt component (already wired in 3.2) routes here for
 * its upgrade CTA — so any free-tier limit drop-in arrives at this page.
 */
import { requireAuth } from "@/lib/auth/server";
import { createServiceClient } from "@/lib/db/service";

import { openCustomerPortalAction } from "./actions";
import { BillingForm } from "./BillingForm";

export const metadata = {
  title: "Billing",
};

const DATE_LONG = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return DATE_LONG.format(new Date(iso));
  } catch {
    return null;
  }
}

export default async function BillingSettingsPage() {
  const user = await requireAuth();
  const supabase = createServiceClient();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select(
      "tier, status, current_period_end, trial_end, cancel_at_period_end",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  const tier = sub?.tier ?? "free";
  const status = sub?.status ?? "free";
  const isPro = tier === "pro" && (status === "active" || status === "trialing");
  const isTrialing = status === "trialing";
  const stripeConfigured = Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRO_PRICE_ID_MONTHLY &&
      process.env.STRIPE_PRO_PRICE_ID_YEARLY,
  );

  const nextBillingDate = formatDate(sub?.current_period_end);
  const trialEnd = formatDate(sub?.trial_end);

  return (
    <div className="flex flex-col gap-7">
      <header>
        <p className="text-eyebrow">Billing</p>
        <h1 className="text-h1 mt-2 text-balance">Your subscription.</h1>
      </header>

      {isPro ? (
        <ProSection
          status={status}
          isTrialing={isTrialing}
          trialEnd={trialEnd}
          nextBillingDate={nextBillingDate}
          cancelAtPeriodEnd={sub?.cancel_at_period_end ?? false}
          stripeConfigured={stripeConfigured}
        />
      ) : (
        <FreeSection stripeConfigured={stripeConfigured} />
      )}
    </div>
  );
}

function FreeSection({ stripeConfigured }: { stripeConfigured: boolean }) {
  return (
    <section
      className="flex flex-col gap-5 border border-paper-3 bg-paper p-5 md:p-6 max-w-2xl"
      style={{ borderRadius: "10px" }}
    >
      <div className="flex flex-col gap-1">
        <p className="text-eyebrow">Current plan</p>
        <p className="font-display text-h3 text-ink">Free</p>
        <p className="text-body text-mute">
          A few Coach messages, a couple of Situation Room sessions, and
          one Simulator run a week. Enough to feel the shape.
        </p>
      </div>

      {stripeConfigured ? (
        <BillingForm />
      ) : (
        <div className="border-t border-paper-3 pt-5 flex flex-col gap-2">
          <p className="text-eyebrow">Pro</p>
          <p className="font-display text-h3 text-ink">
            Billing isn&rsquo;t configured yet.
          </p>
          <p className="text-body text-mute max-w-prose">
            The Stripe product and keys need to be wired before the
            checkout link works. Once they&rsquo;re in, this page
            switches to a monthly / yearly toggle.
          </p>
        </div>
      )}

      <p className="text-caption text-mute">
        7-day free trial. Cancel anytime.
      </p>
    </section>
  );
}

function ProSection({
  status,
  isTrialing,
  trialEnd,
  nextBillingDate,
  cancelAtPeriodEnd,
  stripeConfigured,
}: {
  status: string;
  isTrialing: boolean;
  trialEnd: string | null;
  nextBillingDate: string | null;
  cancelAtPeriodEnd: boolean;
  stripeConfigured: boolean;
}) {
  return (
    <section
      className="flex flex-col gap-5 border border-paper-3 bg-paper p-5 md:p-6 max-w-2xl"
      style={{ borderRadius: "10px" }}
    >
      <div className="flex flex-col gap-1">
        <p className="text-eyebrow">Current plan</p>
        <p className="font-display text-h3 text-ink">
          Pro {isTrialing ? "· trialing" : ""}
        </p>
        <p className="text-body text-mute">
          Unlimited Coach, Situation Room, and Simulator. The product
          works as designed.
        </p>
      </div>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 border-t border-paper-3 pt-5">
        <BillingFact label="Status" value={status} />
        <BillingFact
          label={isTrialing ? "Trial ends" : "Next billing"}
          value={isTrialing ? trialEnd : nextBillingDate}
        />
        {cancelAtPeriodEnd ? (
          <BillingFact label="Scheduled" value="Cancels at period end" />
        ) : null}
      </dl>

      {stripeConfigured ? (
        <form action={openCustomerPortalAction}>
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 bg-ink text-paper px-4 text-body-s font-medium transition-opacity hover:opacity-90"
            style={{ borderRadius: "4px" }}
          >
            Manage subscription
          </button>
        </form>
      ) : (
        <p className="text-caption text-mute">
          Billing isn&rsquo;t configured yet — the portal will open
          once Stripe keys are in.
        </p>
      )}
    </section>
  );
}

function BillingFact({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-eyebrow text-mute-2">{label}</dt>
      <dd className="text-body text-ink">{value ?? "—"}</dd>
    </div>
  );
}

