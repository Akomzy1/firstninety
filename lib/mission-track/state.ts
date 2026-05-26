/**
 * Mission Track data hydration. Loads:
 *   - every published mission for the user's role
 *   - the user's mission_completions
 *   - then joins them in memory + sorts (week, sequence_in_week)
 *
 * Returns a tidy view-model the timeline + week + detail pages all
 * consume from a single source.
 */
import "server-only";

import { createClient } from "@/lib/db/server";
import { requireAuth } from "@/lib/auth/server";
import type { Database } from "@/lib/db/types.gen";

type Role = Database["public"]["Enums"]["role_enum"];
type MissionStatus =
  | "available"
  | "in_progress"
  | "completed"
  | "skipped"
  | "skipped_pre_signup"
  | "locked";

export type MissionView = {
  id: string;
  slug: string;
  role: Role;
  week: number;
  sequence_in_week: number;
  title: string;
  why_matters: string;
  estimated_minutes: number;
  prerequisites: string[];
  status: MissionStatus;
  completed_at: string | null;
  /** Approximated "Day N" tag = (week - 1) * 7 + sequence_in_week. */
  display_day: number;
};

export type MissionTrackState = {
  user_id: string;
  role: Role | null;
  missions: MissionView[];
};

export async function getMissionTrackState(): Promise<MissionTrackState> {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: userRow } = await supabase
    .from("users")
    .select("primary_role")
    .eq("id", user.id)
    .single();
  const role = (userRow?.primary_role ?? null) as Role | null;

  if (!role) {
    return { user_id: user.id, role: null, missions: [] };
  }

  const [missionsResult, completionsResult] = await Promise.all([
    supabase
      .from("missions")
      .select(
        "id, slug, role, week, sequence_in_week, title, why_matters, estimated_minutes, prerequisites",
      )
      .eq("role", role)
      .eq("is_published", true)
      .order("week", { ascending: true })
      .order("sequence_in_week", { ascending: true }),
    supabase
      .from("mission_completions")
      .select("mission_id, status, completed_at")
      .eq("user_id", user.id),
  ]);

  const completionsByMission = new Map<
    string,
    { status: MissionStatus; completed_at: string | null }
  >();
  for (const c of completionsResult.data ?? []) {
    completionsByMission.set(c.mission_id, {
      status: c.status as MissionStatus,
      completed_at: c.completed_at,
    });
  }

  const slugSet = new Set((missionsResult.data ?? []).map((m) => m.slug));
  const completedSlugs = new Set<string>();
  for (const m of missionsResult.data ?? []) {
    const c = completionsByMission.get(m.id);
    // `skipped_pre_signup` satisfies prereqs the same as `completed` —
    // the user "lived through" the week, so downstream missions
    // shouldn't be locked behind it. The mission's own UI status
    // stays distinct (italic-mute "read-only" treatment vs the
    // completed-check treatment).
    if (c?.status === "completed" || c?.status === "skipped_pre_signup") {
      completedSlugs.add(m.slug);
    }
  }

  const missions: MissionView[] = (missionsResult.data ?? []).map((m) => {
    const completion = completionsByMission.get(m.id);
    const prereqs = (m.prerequisites ?? []).filter((slug) => slugSet.has(slug));
    let status: MissionStatus = "available";
    if (completion?.status === "completed") status = "completed";
    else if (completion?.status === "in_progress") status = "in_progress";
    else if (completion?.status === "skipped") status = "skipped";
    else if (completion?.status === "skipped_pre_signup") status = "skipped_pre_signup";
    else if (prereqs.some((slug) => !completedSlugs.has(slug))) status = "locked";

    return {
      id: m.id,
      slug: m.slug,
      role: m.role,
      week: m.week,
      sequence_in_week: m.sequence_in_week,
      title: m.title,
      why_matters: m.why_matters,
      estimated_minutes: m.estimated_minutes,
      prerequisites: prereqs,
      status,
      completed_at: completion?.completed_at ?? null,
      display_day: (m.week - 1) * 7 + m.sequence_in_week,
    };
  });

  return { user_id: user.id, role, missions };
}

export function pickWeekMissions(
  state: MissionTrackState,
  week: number,
): MissionView[] {
  return state.missions.filter((m) => m.week === week);
}
