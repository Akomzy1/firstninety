/**
 * Server actions for the daily home — currently just the Sunday recap
 * submission. The recap body is stored as a single user_responsibilities
 * row with source='sunday_prompt' so the Coach (Phase 3) can weight it
 * separately from manual additions.
 */
"use server";

import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";

export type SundayPromptState = {
  error?: string;
  saved?: boolean;
} | null;

export async function submitSundayPromptAction(
  _prev: SundayPromptState,
  formData: FormData,
): Promise<SundayPromptState> {
  const response = formData.get("response")?.toString().trim() ?? "";
  if (response.length < 3) {
    return { error: "Two sentences are enough — please tell me something." };
  }
  if (response.length > 1000) {
    return { error: "Try shortening to a couple of sentences." };
  }

  const user = await requireAuth();
  const supabase = await createClient();

  const [{ error: insertError }, { error: updateError }] = await Promise.all([
    supabase.from("user_responsibilities").insert({
      user_id: user.id,
      description: response,
      source: "sunday_prompt",
    }),
    supabase
      .from("user_context")
      .update({ last_sunday_prompt_at: new Date().toISOString() })
      .eq("user_id", user.id),
  ]);

  if (insertError) return { error: insertError.message };
  if (updateError) return { error: updateError.message };

  revalidatePath("/home");
  revalidatePath("/settings/memory");
  return { saved: true };
}

export async function skipSundayPromptAction(): Promise<void> {
  const user = await requireAuth();
  const supabase = await createClient();
  await supabase
    .from("user_context")
    .update({ last_sunday_prompt_at: new Date().toISOString() })
    .eq("user_id", user.id);
  revalidatePath("/home");
}

/**
 * Stamps `viewed_post_90_home_at` so the one-time "What changed?"
 * callout on the post-Day-90 Daily Home does not show again. Per Prompt
 * 3.16 / PRD v1.8 §7.4.
 */
export async function dismissPost90WelcomeAction(): Promise<void> {
  const user = await requireAuth();
  const supabase = await createClient();
  await supabase
    .from("user_context")
    .update({ viewed_post_90_home_at: new Date().toISOString() })
    .eq("user_id", user.id);
  revalidatePath("/home");
}

/**
 * Stamps `viewed_mid_journey_welcome_at` so the State B one-time
 * mid-journey welcome card does not show again. Per Retrofit 2 / MVP
 * Spec v1.3 §9 (State B welcome state).
 */
export async function dismissMidJourneyWelcomeAction(): Promise<void> {
  const user = await requireAuth();
  const supabase = await createClient();
  await supabase
    .from("user_context")
    .update({ viewed_mid_journey_welcome_at: new Date().toISOString() })
    .eq("user_id", user.id);
  revalidatePath("/home");
}
