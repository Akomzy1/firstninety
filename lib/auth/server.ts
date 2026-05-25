/**
 * Server-side auth helpers. Call from server components, server actions, and
 * route handlers. Each helper creates its own Supabase server client (cheap;
 * cookies-bound) so the per-request user identity is always fresh.
 *
 * Tier enforcement lives in lib/billing/tier.ts (built in Prompt 3.2).
 * Import `checkTierAllowance` from there instead of asking auth helpers.
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
