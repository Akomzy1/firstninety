"use client";

/**
 * Pro upgrade form on the Settings → Billing page.
 *
 * Two-state toggle (monthly / yearly) above a single "Start free trial"
 * submit. Yearly is the default — that's the spec, and it matches the
 * pricing page hierarchy.
 *
 * The form posts `plan=monthly|yearly` into `startCheckoutAction`,
 * which redirects to the Stripe Checkout URL on success.
 */
import { useState } from "react";

import { ArrowRight } from "lucide-react";

import { startCheckoutAction } from "./actions";

type Plan = "monthly" | "yearly";

const PRICE_LABEL: Record<Plan, { headline: string; sub: string }> = {
  monthly: { headline: "$39.99 / month", sub: "Billed monthly. Cancel anytime." },
  yearly: { headline: "$399 / year", sub: "Save two months. Billed yearly." },
};

export function BillingForm() {
  const [plan, setPlan] = useState<Plan>("yearly");
  const copy = PRICE_LABEL[plan];

  return (
    <form
      action={startCheckoutAction}
      className="border-t border-paper-3 pt-5 flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <p className="text-eyebrow">Upgrade to Pro</p>
        <p className="font-display text-h3 text-ink">{copy.headline}</p>
        <p className="text-body text-mute">{copy.sub}</p>
      </div>

      <div role="radiogroup" aria-label="Billing frequency" className="flex gap-2">
        <PlanRadio
          plan="yearly"
          selected={plan === "yearly"}
          onSelect={() => setPlan("yearly")}
          label="Yearly"
          note="$399 — best value"
        />
        <PlanRadio
          plan="monthly"
          selected={plan === "monthly"}
          onSelect={() => setPlan("monthly")}
          label="Monthly"
          note="$39.99 / month"
        />
      </div>

      <input type="hidden" name="plan" value={plan} />

      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center gap-2 bg-ink text-paper px-5 text-body-s font-medium transition-opacity hover:opacity-90 self-start"
        style={{ borderRadius: "4px" }}
      >
        Start free trial
        <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden />
      </button>
    </form>
  );
}

function PlanRadio({
  plan,
  selected,
  onSelect,
  label,
  note,
}: {
  plan: Plan;
  selected: boolean;
  onSelect: () => void;
  label: string;
  note: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${label} plan — ${note}`}
      onClick={onSelect}
      data-plan={plan}
      className={`flex-1 flex flex-col gap-1 items-start text-left p-4 border transition-colors ${
        selected
          ? "border-ink bg-paper-2"
          : "border-paper-3 bg-paper hover:border-mute-2"
      }`}
      style={{ borderRadius: "8px" }}
    >
      <span className="text-body font-medium text-ink">{label}</span>
      <span className="text-caption text-mute">{note}</span>
    </button>
  );
}
