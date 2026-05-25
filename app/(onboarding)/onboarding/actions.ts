/**
 * Onboarding server actions.
 *
 * Each step writes to the database immediately, so a user who abandons mid-
 * flow resumes where they left off. Step 4's `completeOnboardingAction`
 * sets `users.onboarding_completed_at` which gates access to /home.
 */
"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/db/server";
import { requireAuth } from "@/lib/auth/server";
import type { Database } from "@/lib/db/types.gen";

type Role = Database["public"]["Enums"]["role_enum"];
type WorkSetup = Database["public"]["Enums"]["work_setup_enum"];

const ROLE_VALUES: ReadonlyArray<Role> = ["ba", "pm", "sm", "po", "da", "aie"];
const WORK_SETUP_VALUES: ReadonlyArray<WorkSetup> = ["remote", "hybrid", "office"];

export type OnboardingFormState = {
  error?: string;
} | null;

function parseRole(value: FormDataEntryValue | null): Role | null {
  const str = typeof value === "string" ? value : "";
  return (ROLE_VALUES as ReadonlyArray<string>).includes(str) ? (str as Role) : null;
}

function parseWorkSetup(value: FormDataEntryValue | null): WorkSetup | null {
  const str = typeof value === "string" ? value : "";
  return (WORK_SETUP_VALUES as ReadonlyArray<string>).includes(str)
    ? (str as WorkSetup)
    : null;
}

function trimmedOrNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function dateOrNull(value: FormDataEntryValue | null): string | null {
  const str = trimmedOrNull(value);
  if (!str) return null;
  // Native <input type="date"> emits YYYY-MM-DD.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  return str;
}

// `saveStep1Action`, `completeOnboardingAction` are passed directly to
// <form action={…}>, which requires `Promise<void>`. The redirect() call
// throws, so we never reach a return statement.

export async function saveStep1Action(): Promise<void> {
  await requireAuth();
  redirect("/onboarding/step-2");
}

export async function saveStep2Action(
  _prev: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const user = await requireAuth();
  const role = parseRole(formData.get("role"));
  if (!role) return { error: "Pick the role that best describes the work you're about to do." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({ primary_role: role })
    .eq("id", user.id);
  if (error) return { error: error.message };

  redirect("/onboarding/step-3");
}

export async function saveStep3Action(
  _prev: OnboardingFormState,
  formData: FormData,
): Promise<OnboardingFormState> {
  const user = await requireAuth();
  const start_date = dateOrNull(formData.get("start_date"));
  const sector = trimmedOrNull(formData.get("sector"));
  const work_setup = parseWorkSetup(formData.get("work_setup"));
  const probation_review_date = dateOrNull(formData.get("probation_review_date"));
  const timezone = trimmedOrNull(formData.get("timezone"));

  // Step 3 is mostly optional; only start_date is suggested. We accept all
  // empty if the user wants to skip — onboarding still completes.

  const supabase = await createClient();
  const { error } = await supabase
    .from("user_context")
    .update({
      start_date,
      sector,
      work_setup,
      probation_review_date,
      timezone: timezone ?? "UTC",
    })
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  redirect("/onboarding/step-4");
}

export async function completeOnboardingAction(): Promise<void> {
  const user = await requireAuth();
  const supabase = await createClient();

  // Load what we've gathered so we can derive initial responsibility hints.
  const [{ data: userRow }, { data: contextRow }] = await Promise.all([
    supabase.from("users").select("primary_role").eq("id", user.id).single(),
    supabase
      .from("user_context")
      .select("sector, work_setup")
      .eq("user_id", user.id)
      .single(),
  ]);

  if (!userRow?.primary_role) {
    // Step gating should have prevented this, but bounce back as a safety net.
    redirect("/onboarding/step-2");
  }

  // Mark onboarding complete.
  const { error: completionError } = await supabase
    .from("users")
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq("id", user.id);
  if (completionError) {
    // Bounce back to step 4 with the error in the URL so the page can
    // render it. (We avoid the useActionState path here since the form has
    // no inputs.)
    redirect(`/onboarding/step-4?error=${encodeURIComponent(completionError.message)}`);
  }

  // Seed an initial declared-memory entry from the sector tag if present.
  // We're explicit about source so the Coach (Phase 3) can weight onboarding
  // entries differently than ongoing Sunday-prompt entries.
  const seedRows: { user_id: string; description: string; source: Database["public"]["Enums"]["memory_source_enum"] }[] = [];
  if (contextRow?.sector) {
    seedRows.push({
      user_id: user.id,
      description: `Working in the ${contextRow.sector} sector.`,
      source: "onboarding",
    });
  }
  if (contextRow?.work_setup) {
    const label = contextRow.work_setup === "remote" ? "fully remote" : contextRow.work_setup;
    seedRows.push({
      user_id: user.id,
      description: `Working ${label}.`,
      source: "onboarding",
    });
  }
  if (seedRows.length > 0) {
    await supabase.from("user_responsibilities").insert(seedRows);
  }

  redirect("/home");
}
