/**
 * Tier-enforcement types + copy.
 *
 * Split out of `lib/billing/tier.ts` so client components (TierLimitPrompt,
 * the stream-types union) can import without dragging the server-only
 * runtime (Supabase service client, DB queries) into the browser bundle.
 *
 * Pure data: no I/O, no `server-only` marker. Safe everywhere.
 */

/**
 * AI surfaces gated by tier limits. `simulator_debrief` is not on its
 * own counter — the parent simulator run already paid the simulator
 * quota, so the debrief inherits its allowance.
 */
export type TierGatedSurface = "coach" | "situation_room" | "simulator";

export type TierReason =
  | "free_simulator_lifetime"
  | "free_situation_week"
  | "free_coach_week"
  | "subscription_inactive";

export type TierAllowance =
  | { allowed: true }
  | {
      allowed: false;
      reason: TierReason;
      limit: number;
      used: number;
      surface: TierGatedSurface;
      upgrade_url: "/settings/billing";
    };

/**
 * Free-tier ceilings. Keep these in sync with the PRD §6 pricing card.
 */
export const FREE_LIMITS = {
  simulator_runs_lifetime: 4,
  situation_sessions_week: 2,
  coach_messages_week: 5,
} as const;

/**
 * Editorial copy block returned alongside a denial — the UI uses this
 * to render the TierLimitPrompt without needing a separate copy file.
 * Voice rules: no exclamation, no shouting, no "upgrade now" energy.
 */
export function tierDenialCopy(
  allowance: Exclude<TierAllowance, { allowed: true }>,
): {
  title: string;
  body: string;
  cta: string;
} {
  switch (allowance.reason) {
    case "free_simulator_lifetime":
      return {
        title: "You've used your four free Simulator runs.",
        body: "Pro unlocks unlimited scenarios across every role, the full debrief library, and the rehearsal-mode replay. £9.99 a week, or £39.99 a month.",
        cta: "Start free trial",
      };
    case "free_situation_week":
      return {
        title: "You've used both your Situation Room sessions this week.",
        body: "Pro unlocks unlimited Situation Room sessions and the full Coach so you can talk anything through, any time. Your weekly quota resets Sunday at midnight.",
        cta: "Upgrade to keep going",
      };
    case "free_coach_week":
      return {
        title: "You've used your five Coach messages this week.",
        body: "Pro removes the weekly cap. £9.99 a week, or £39.99 a month. Cancel any time.",
        cta: "Upgrade to keep going",
      };
    case "subscription_inactive":
      return {
        title: "Your subscription needs attention.",
        body: "We couldn't confirm your subscription status. Pop into Settings → Billing to sort it; everything else is still here when you're back.",
        cta: "Open Billing",
      };
  }
}
