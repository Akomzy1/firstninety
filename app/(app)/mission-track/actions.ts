/**
 * Mission Track server actions.
 *
 * startMission / completeMission / skipMission upsert into
 * mission_completions; getCurrentWeekMissions hydrates the week view.
 * Mission ordering at MVP is fixed by (week, sequence_in_week) — no
 * adaptive ordering until Phase 2B.
 */
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";

export type MissionActionState = { error?: string } | null;

export async function startMissionAction(formData: FormData): Promise<void> {
  const missionSlug = formData.get("mission_slug")?.toString();
  if (!missionSlug) return;

  const user = await requireAuth();
  const supabase = await createClient();

  const { data: mission } = await supabase
    .from("missions")
    .select("id")
    .eq("slug", missionSlug)
    .eq("is_published", true)
    .single();
  if (!mission) return;

  await supabase.from("mission_completions").upsert(
    {
      user_id: user.id,
      mission_id: mission.id,
      status: "in_progress",
    },
    { onConflict: "user_id,mission_id" },
  );

  revalidatePath("/home");
  revalidatePath("/mission-track");
  revalidatePath(`/mission-track/${missionSlug}`);
}

export async function completeMissionAction(
  _prev: MissionActionState,
  formData: FormData,
): Promise<MissionActionState> {
  const missionSlug = formData.get("mission_slug")?.toString();
  const reflection = formData.get("reflection")?.toString().trim() ?? "";
  if (!missionSlug) return { error: "Missing mission." };

  const user = await requireAuth();
  const supabase = await createClient();

  const { data: mission } = await supabase
    .from("missions")
    .select("id")
    .eq("slug", missionSlug)
    .eq("is_published", true)
    .single();
  if (!mission) return { error: "Mission not found." };

  const { error } = await supabase.from("mission_completions").upsert(
    {
      user_id: user.id,
      mission_id: mission.id,
      status: "completed",
      reflection_response: reflection.length > 0 ? reflection : null,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,mission_id" },
  );
  if (error) return { error: error.message };

  revalidatePath("/home");
  revalidatePath("/mission-track");
  revalidatePath(`/mission-track/${missionSlug}`);
  redirect("/mission-track");
}

export async function skipMissionAction(formData: FormData): Promise<void> {
  const missionSlug = formData.get("mission_slug")?.toString();
  if (!missionSlug) return;

  const user = await requireAuth();
  const supabase = await createClient();
  const { data: mission } = await supabase
    .from("missions")
    .select("id")
    .eq("slug", missionSlug)
    .single();
  if (!mission) return;

  await supabase.from("mission_completions").upsert(
    {
      user_id: user.id,
      mission_id: mission.id,
      status: "skipped",
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,mission_id" },
  );

  revalidatePath("/mission-track");
  redirect("/mission-track");
}
