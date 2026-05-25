/**
 * Server-side auth helpers. Call from server components, server actions, and
 * route handlers. Each helper creates its own Supabase server client (cheap;
 * cookies-bound) so the per-request user identity is always fresh.
 *
 * `requirePro` and `getTierAllowance` are stubbed for Phase 1 — full tier
 * enforcement wires up in Build Prompt 3.2.
 */
import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/db/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Throws (via redirect) if the user is not authenticated. Returns the user
 * otherwise. Use in server actions and server components that should only
 * be reachable when logged in.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Throws (via redirect to /pricing) if the user is not on the Pro tier.
 * Phase 1 stub — the production check reads subscriptions.tier and lands in
 * Build Prompt 3.2.
 */
export async function requirePro() {
  const user = await requireAuth();
  // TODO(phase 3.2): read public.subscriptions.tier; redirect to /pricing if free.
  return user;
}

export type TierAllowance =
  | { allowed: true }
  | { allowed: false; reason: string; limit: number; used: number };

/**
 * Returns the user's remaining allowance for a tier-gated AI surface. Phase
 * 3.2 wires this against usage_limits + subscriptions.tier; until then any
 * caller will throw if it relies on the result.
 */
export async function getTierAllowance(
  _userId: string,
  _surface: "simulator" | "situation_room" | "coach_adhoc",
): Promise<TierAllowance> {
  throw new Error(
    "getTierAllowance is not implemented yet — wired up in Build Prompt 3.2.",
  );
}
