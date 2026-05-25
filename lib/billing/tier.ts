/**
 * Tier enforcement — server-side allowance check that gates every
 * AI-incurring action.
 *
 * Per MVP Spec §3.3, free-tier users have a fixed weekly / lifetime
 * allowance per surface; Pro / trialing users are unbounded. The check
 * runs *before* the Claude SDK is touched so we never burn tokens that
 * the user isn't entitled to.
 *
 * Counter increments are owned by the Postgres triggers seeded in
 * Prompt 0.3 — this module only reads, never writes.
 *
 * Pure types + copy live in `tier-types.ts` so client components can
 * import them without dragging server-only runtime into the bundle.
 */
import "server-only";

import { createServiceClient } from "@/lib/db/service";

import {
  FREE_LIMITS,
  type TierAllowance,
  type TierGatedSurface,
} from "./tier-types";

// Re-export the client-safe surface so callers in /lib/coach/* can keep
// importing types from this module.
export type { TierAllowance, TierGatedSurface, TierReason } from "./tier-types";
export { FREE_LIMITS, tierDenialCopy } from "./tier-types";

/**
 * Subscription statuses that grant Pro access. `past_due` deliberately
 * does NOT grant access — Stripe's grace handling routes the user to
 * the customer portal via the paywall surface.
 */
const PAID_STATUSES = new Set(["active", "trialing"]);

/**
 * Returns whether `userId` may invoke `surface` right now. Does not
 * mutate any state. Callers must use this BEFORE any Claude SDK call.
 *
 * `null` userId means "system or unauth caller" — never allowed
 * through tier gating; callers in that mode (e.g. the dev test
 * endpoint, cron-driven brief regeneration) must bypass this check
 * explicitly.
 */
export async function checkTierAllowance(
  userId: string | null,
  surface: TierGatedSurface,
): Promise<TierAllowance> {
  if (!userId) {
    return {
      allowed: false,
      reason: "subscription_inactive",
      limit: 0,
      used: 0,
      surface,
      upgrade_url: "/settings/billing",
    };
  }

  const supabase = createServiceClient();

  // Subscription state. Missing row = treated as free.
  const { data: sub, error: subErr } = await supabase
    .from("subscriptions")
    .select("tier, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (subErr) {
    console.error("[tier] subscription lookup failed", subErr);
    // Fail closed so a transient db error doesn't grant unlimited access.
    return {
      allowed: false,
      reason: "subscription_inactive",
      limit: 0,
      used: 0,
      surface,
      upgrade_url: "/settings/billing",
    };
  }

  const tier = sub?.tier ?? "free";
  const status = sub?.status ?? "free";

  if (tier === "pro" && PAID_STATUSES.has(status)) {
    return { allowed: true };
  }

  // Free tier — consult the counters.
  const { data: usage, error: usageErr } = await supabase
    .from("usage_limits")
    .select(
      "simulator_runs_lifetime, situation_sessions_week, coach_messages_week",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (usageErr) {
    console.error("[tier] usage_limits lookup failed", usageErr);
    return {
      allowed: false,
      reason: "subscription_inactive",
      limit: 0,
      used: 0,
      surface,
      upgrade_url: "/settings/billing",
    };
  }

  const used = {
    simulator: usage?.simulator_runs_lifetime ?? 0,
    situation_room: usage?.situation_sessions_week ?? 0,
    coach: usage?.coach_messages_week ?? 0,
  } as const;

  if (surface === "simulator") {
    const limit = FREE_LIMITS.simulator_runs_lifetime;
    if (used.simulator >= limit) {
      return {
        allowed: false,
        reason: "free_simulator_lifetime",
        limit,
        used: used.simulator,
        surface,
        upgrade_url: "/settings/billing",
      };
    }
  } else if (surface === "situation_room") {
    const limit = FREE_LIMITS.situation_sessions_week;
    if (used.situation_room >= limit) {
      return {
        allowed: false,
        reason: "free_situation_week",
        limit,
        used: used.situation_room,
        surface,
        upgrade_url: "/settings/billing",
      };
    }
  } else if (surface === "coach") {
    const limit = FREE_LIMITS.coach_messages_week;
    if (used.coach >= limit) {
      return {
        allowed: false,
        reason: "free_coach_week",
        limit,
        used: used.coach,
        surface,
        upgrade_url: "/settings/billing",
      };
    }
  }

  return { allowed: true };
}
