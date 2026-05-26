/**
 * Probation server actions (Build Prompt 1.8 plumbing).
 *
 * Actual Probation Mode UI (banner, Brief generation, fourth Situation
 * entry, fourth Coach tool) ships in Prompt 3.14. Phase 1 wires the
 * date capture, window override, and manual activation toggle.
 */
"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";
import { captureServerEvent } from "@/lib/tracing/posthog-server";

export type ProbationActionState = { error?: string; notice?: string } | null;

export type ProbationStatus = {
  active: boolean;
  days_to_review: number | null;
  window_days: number;
  brief_generated: boolean;
  review_date: string | null;
};

const MIN_WINDOW = 7;
const MAX_WINDOW = 90;

function daysBetween(today: Date, target: Date): number {
  const ms = target.getTime() - today.getTime();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

export async function getProbationStatus(): Promise<ProbationStatus> {
  const user = await requireAuth();
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_context")
    .select(
      "probation_review_date, probation_mode_active, probation_window_days, probation_brief_generated_at",
    )
    .eq("user_id", user.id)
    .single();

  const reviewDate = data?.probation_review_date ?? null;
  let daysToReview: number | null = null;
  if (reviewDate) {
    const target = new Date(`${reviewDate}T00:00:00Z`);
    if (!Number.isNaN(target.getTime())) {
      daysToReview = daysBetween(new Date(), target);
    }
  }

  return {
    active: Boolean(data?.probation_mode_active),
    days_to_review: daysToReview,
    window_days: data?.probation_window_days ?? 21,
    brief_generated: Boolean(data?.probation_brief_generated_at),
    review_date: reviewDate,
  };
}

export async function setProbationReviewDateAction(
  _prev: ProbationActionState,
  formData: FormData,
): Promise<ProbationActionState> {
  const raw = formData.get("review_date")?.toString().trim() ?? "";
  const user = await requireAuth();
  const supabase = await createClient();

  let value: string | null;
  if (raw === "") {
    value = null;
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return { error: "Use a YYYY-MM-DD date." };
  } else {
    value = raw;
  }

  const { error } = await supabase
    .from("user_context")
    .update({ probation_review_date: value })
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/settings/probation");
  return { notice: value ? "Saved." : "Date cleared." };
}

export async function setProbationWindowAction(
  _prev: ProbationActionState,
  formData: FormData,
): Promise<ProbationActionState> {
  const raw = Number(formData.get("window_days"));
  if (!Number.isFinite(raw) || !Number.isInteger(raw)) {
    return { error: "Window must be a whole number of days." };
  }
  if (raw < MIN_WINDOW || raw > MAX_WINDOW) {
    return { error: `Window must be between ${MIN_WINDOW} and ${MAX_WINDOW} days.` };
  }

  const user = await requireAuth();
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_context")
    .update({ probation_window_days: raw })
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/settings/probation");
  return { notice: "Window updated." };
}

export async function activateProbationModeAction(): Promise<void> {
  const user = await requireAuth();
  const supabase = await createClient();
  await supabase
    .from("user_context")
    .update({ probation_mode_active: true })
    .eq("user_id", user.id);

  try {
    await captureServerEvent({
      distinctId: user.id,
      event: "probation_mode_activated",
      properties: { source: "settings_page" },
    });
  } catch (err) {
    console.warn("[probation] settings activate event capture failed", err);
  }

  revalidatePath("/settings/probation");
  revalidatePath("/home");
}

export async function deactivateProbationModeAction(): Promise<void> {
  const user = await requireAuth();
  const supabase = await createClient();
  await supabase
    .from("user_context")
    .update({ probation_mode_active: false })
    .eq("user_id", user.id);
  revalidatePath("/settings/probation");
  revalidatePath("/home");
}
