/**
 * Onboarding resume / gating logic.
 *
 * Returns the authenticated user's onboarding state and a helper to pick
 * the next incomplete step. Each onboarding page calls this and redirects
 * if the user has wandered past their current progress (or if they've
 * already finished and shouldn't be in the flow at all).
 */
import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/db/server";
import { requireAuth } from "@/lib/auth/server";
import type { Database } from "@/lib/db/types.gen";

type Role = Database["public"]["Enums"]["role_enum"];
type WorkSetup = Database["public"]["Enums"]["work_setup_enum"];

export type OnboardingState = {
  user_id: string;
  email: string;
  primary_role: Role | null;
  start_date: string | null;
  sector: string | null;
  work_setup: WorkSetup | null;
  probation_review_date: string | null;
  timezone: string | null;
  completed_at: string | null;
};

export async function getOnboardingState(): Promise<OnboardingState> {
  const user = await requireAuth();
  const supabase = await createClient();

  const [{ data: userRow }, { data: contextRow }] = await Promise.all([
    supabase
      .from("users")
      .select("email, primary_role, onboarding_completed_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("user_context")
      .select("start_date, sector, work_setup, probation_review_date, timezone")
      .eq("user_id", user.id)
      .single(),
  ]);

  return {
    user_id: user.id,
    email: userRow?.email ?? user.email ?? "",
    primary_role: userRow?.primary_role ?? null,
    start_date: contextRow?.start_date ?? null,
    sector: contextRow?.sector ?? null,
    work_setup: contextRow?.work_setup ?? null,
    probation_review_date: contextRow?.probation_review_date ?? null,
    timezone: contextRow?.timezone ?? null,
    completed_at: userRow?.onboarding_completed_at ?? null,
  };
}

/**
 * Returns the path the user should be on. Use to gate each onboarding step
 * page; if the returned path doesn't match the page's own, redirect.
 *
 * Step 1 is always reachable. Steps 2 / 3 require nothing strict — they can
 * be revisited. Step 4 requires a primary_role.
 */
export function nextOnboardingStepPath(state: OnboardingState): string {
  if (state.completed_at) return "/home";
  if (!state.primary_role) return "/onboarding/step-2";
  return "/onboarding/step-4";
}

/**
 * Wrapper for step pages: returns the state and side-effects a redirect if
 * the user is on the wrong page for their progress.
 *
 * `currentStep` is the page calling this — e.g. on step-3, pass 3.
 */
export async function ensureOnboardingStep(currentStep: 1 | 2 | 3 | 4) {
  const state = await getOnboardingState();
  if (state.completed_at) redirect("/home");

  // Step 4 needs a role; everything else is open so users can revise.
  if (currentStep === 4 && !state.primary_role) {
    redirect("/onboarding/step-2");
  }
  return state;
}
