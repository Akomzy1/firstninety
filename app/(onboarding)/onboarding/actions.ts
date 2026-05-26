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
import { sendEmail } from "@/lib/notifications/email";
import { welcomeEmail } from "@/lib/email/templates";
import { captureServerEvent } from "@/lib/tracing/posthog-server";

type Role = Database["public"]["Enums"]["role_enum"];
type WorkSetup = Database["public"]["Enums"]["work_setup_enum"];
type EntryState = Database["public"]["Enums"]["entry_state_enum"];

/**
 * MVP Spec v1.3 §3 — three-entry-state model.
 *
 *   A (fresh start)        — start_date is today, yesterday, or up to 3 days ago
 *   B (mid-journey)        — start_date is 4-89 days ago
 *   C (joined post-Day-90) — start_date is 90+ days ago
 *
 * Boundaries match the spec exactly: State A includes days 0-3; State B
 * includes days 4-89; State C is day 90+.
 */
function computeEntryState(startDate: Date, now: Date): EntryState {
  const startUtc = Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate(),
  );
  const nowUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const daysSinceStart = Math.floor(
    (nowUtc - startUtc) / (1000 * 60 * 60 * 24),
  );
  if (daysSinceStart <= 3) return "A";
  if (daysSinceStart <= 89) return "B";
  return "C";
}

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

  // Load what step-3 wrote so we can compute the entry state + seed
  // responsibility hints.
  const [{ data: userRow }, { data: contextRow }] = await Promise.all([
    supabase.from("users").select("primary_role").eq("id", user.id).single(),
    supabase
      .from("user_context")
      .select("sector, work_setup, start_date")
      .eq("user_id", user.id)
      .single(),
  ]);

  if (!userRow?.primary_role) {
    // Step gating should have prevented this, but bounce back as a safety net.
    redirect("/onboarding/step-2");
  }

  const role = userRow.primary_role as Role;

  // ---- Compute entry state (MVP Spec v1.3 §3) ----------------------- //
  // start_date is optional at step 3. When it's null we treat the user as
  // State A — they'll fill it in via Settings later and the home page's
  // day-state computation handles a missing date as Day 1.
  const now = new Date();
  let entryState: EntryState = "A";
  let currentDay = 1;
  let currentWeek = 1;
  if (contextRow?.start_date) {
    const startDate = new Date(`${contextRow.start_date}T00:00:00Z`);
    if (!Number.isNaN(startDate.getTime())) {
      entryState = computeEntryState(startDate, now);
      const daysSinceStart = Math.floor(
        (Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) -
          Date.UTC(
            startDate.getUTCFullYear(),
            startDate.getUTCMonth(),
            startDate.getUTCDate(),
          )) /
          (1000 * 60 * 60 * 24),
      );
      currentDay = Math.max(1, daysSinceStart + 1);
      currentWeek = Math.max(1, Math.ceil(currentDay / 7));
    }
  }

  // ---- Persist entry_state + computed day/week --------------------- //
  // Sequential calls match the rest of the codebase's pattern; Supabase
  // JS doesn't expose transactions client-side. Partial-failure
  // scenarios:
  //   - context update fails    → user_context entry_state unchanged,
  //                               onboarding not marked complete, action
  //                               returns with redirect to error state
  //   - backfill fails          → entry_state set + onboarding still
  //                               proceeds; user lands on home with
  //                               State B but no skipped_pre_signup rows
  //                               yet. Reconciled on next render or by a
  //                               re-run of the backfill.
  // The risk is acceptable because the rows are idempotent (upsert on
  // user_id+mission_id) and the user can always replay via Settings.
  const { error: contextError } = await supabase
    .from("user_context")
    .update({
      entry_state: entryState,
      current_day: currentDay,
      current_week: currentWeek,
    })
    .eq("user_id", user.id);
  if (contextError) {
    redirect(
      `/onboarding/step-4?error=${encodeURIComponent(contextError.message)}`,
    );
  }

  // ---- State B: backfill skipped_pre_signup rows ------------------- //
  // Per MVP Spec v1.3 §3 — for State B users, mark all published
  // missions in weeks 1 through (current_week - 1) for their role as
  // `skipped_pre_signup`. This is the "system-skipped because you
  // weren't here yet" status, distinct from user-initiated `skipped`.
  // State C users get no backfill: they never had a Mission Track.
  if (entryState === "B" && currentWeek > 1) {
    const { data: priorMissions } = await supabase
      .from("missions")
      .select("id")
      .eq("role", role)
      .eq("is_published", true)
      .lt("week", currentWeek);
    if (priorMissions && priorMissions.length > 0) {
      const backfillRows = priorMissions.map((m) => ({
        user_id: user.id,
        mission_id: m.id,
        status: "skipped_pre_signup" as const,
        completed_at: now.toISOString(),
      }));
      const { error: backfillError } = await supabase
        .from("mission_completions")
        .upsert(backfillRows, { onConflict: "user_id,mission_id" });
      if (backfillError) {
        // Log only — don't abort onboarding. The user still completes
        // and the partial state is recoverable.
        console.error(
          "[onboarding] mid-journey backfill partial failure",
          backfillError,
        );
      }
    }
  }

  // ---- Mark onboarding complete ------------------------------------ //
  const { error: completionError } = await supabase
    .from("users")
    .update({ onboarding_completed_at: now.toISOString() })
    .eq("id", user.id);
  if (completionError) {
    redirect(
      `/onboarding/step-4?error=${encodeURIComponent(completionError.message)}`,
    );
  }

  // ---- Seed declared-memory responsibilities ----------------------- //
  // (Existing behaviour — unchanged. Source-tagged so the Coach can
  // weight onboarding entries differently than ongoing Sunday prompts.)
  const seedRows: {
    user_id: string;
    description: string;
    source: Database["public"]["Enums"]["memory_source_enum"];
  }[] = [];
  if (contextRow?.sector) {
    seedRows.push({
      user_id: user.id,
      description: `Working in the ${contextRow.sector} sector.`,
      source: "onboarding",
    });
  }
  if (contextRow?.work_setup) {
    const label =
      contextRow.work_setup === "remote" ? "fully remote" : contextRow.work_setup;
    seedRows.push({
      user_id: user.id,
      description: `Working ${label}.`,
      source: "onboarding",
    });
  }
  if (seedRows.length > 0) {
    await supabase.from("user_responsibilities").insert(seedRows);
  }

  // onboarding_completed event — fires alongside the welcome email,
  // for the same reason (we want the analytics event to represent a
  // user who confirmed + finished step 4, not one who started signup).
  try {
    await captureServerEvent({
      distinctId: user.id,
      event: "onboarding_completed",
      properties: {
        entry_state: entryState,
        role,
        sector: contextRow?.sector ?? null,
        work_setup: contextRow?.work_setup ?? null,
        current_day: currentDay,
        current_week: currentWeek,
      },
    });
  } catch (err) {
    console.warn("[onboarding] event capture failed", err);
  }

  // Welcome email — fires after the user is confirmed + committed
  // (rather than at signUpAction, which would email accounts that
  // never complete email confirmation). Best-effort: log but don't
  // block onboarding if Resend is down.
  try {
    const { data: emailUser } = await supabase
      .from("users")
      .select("email, display_name")
      .eq("id", user.id)
      .single();
    if (emailUser?.email) {
      const tpl = welcomeEmail({
        firstName: emailUser.display_name?.split(" ")[0] ?? null,
      });
      await sendEmail({
        to: emailUser.email,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
      });
    }
  } catch (err) {
    console.error("[onboarding] welcome email failed", err);
  }

  // The Daily Home reads entry_state + day-mode and renders the right
  // state (Day 1 / mid-journey / post-90). No special routing per state
  // is needed here.
  redirect("/home");
}
