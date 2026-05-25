/**
 * Coach tool: `get_user_context`.
 *
 * Returns the user's current role, week, day, and a compact summary of
 * recent activity — most recently completed missions, last Situation
 * Room sessions. The Coach uses this to ground replies in what the user
 * is actually doing this week without forcing them to re-explain.
 *
 * Always-available (registered on every Coach call). Per PRD §9.5 the
 * Coach's tool budget is 3 (or 4 when Probation Mode is active); this
 * is the cheapest of the three so the Coach can lean on it freely.
 */
import "server-only";

import type { Tool } from "@anthropic-ai/sdk/resources/messages";

import { createServiceClient } from "@/lib/db/service";

import type { CoachTool, ToolContext } from "./types";

type Input = Record<string, never>;

type RecentMission = {
  slug: string;
  title: string;
  week: number;
  completed_at: string | null;
};

type RecentSituation = {
  id: string;
  entry_type: string;
  one_line: string;
  created_at: string;
};

type Result = {
  role: string | null;
  current_week: number;
  current_day: number;
  recent_missions: RecentMission[];
  recent_situations: RecentSituation[];
};

export const toolSpec: Tool = {
  name: "get_user_context",
  description:
    "Get the user's current role, week number in their first 90 days, day number, and a short summary of recently completed missions and Situation Room sessions. Call this when grounding advice in what the user is actually doing this week would make your reply tighter and more useful. Cheap; lean on it freely.",
  input_schema: {
    type: "object",
    properties: {},
    additionalProperties: false,
  },
};

export async function execute(
  _input: Input,
  context: ToolContext,
): Promise<Result> {
  const supabase = createServiceClient();

  const [completionsResult, situationsResult] = await Promise.all([
    supabase
      .from("mission_completions")
      .select("completed_at, missions!inner(slug, title, week)")
      .eq("user_id", context.userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(5),
    supabase
      .from("situation_sessions")
      .select("id, entry_type, situation_summary, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  type CompletionRow = {
    completed_at: string | null;
    missions:
      | { slug: string; title: string; week: number }
      | { slug: string; title: string; week: number }[]
      | null;
  };

  const recent_missions: RecentMission[] = (
    (completionsResult.data ?? []) as CompletionRow[]
  ).flatMap((row) => {
    const m = row.missions;
    if (!m) return [];
    const arr = Array.isArray(m) ? m : [m];
    return arr.map((mission) => ({
      slug: mission.slug,
      title: mission.title,
      week: mission.week,
      completed_at: row.completed_at,
    }));
  });

  type SituationRow = {
    id: string;
    entry_type: string;
    situation_summary: string | null;
    created_at: string;
  };

  const recent_situations: RecentSituation[] = (
    (situationsResult.data ?? []) as SituationRow[]
  ).map((row) => ({
    id: row.id,
    entry_type: row.entry_type,
    one_line: (row.situation_summary ?? "").slice(0, 140),
    created_at: row.created_at,
  }));

  return {
    role: context.role,
    current_week: context.currentWeek,
    current_day: context.currentDay,
    recent_missions,
    recent_situations,
  };
}

export const tool: CoachTool<Input, Result> = { toolSpec, execute };
