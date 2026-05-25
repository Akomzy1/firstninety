/**
 * Coach tool: `get_probation_evidence`.
 *
 * Conditional fourth tool — only registered when
 * `user_context.probation_mode_active = true`. The Coach calls it
 * when helping the user assemble (or recall) the receipts they bring
 * into their probation review.
 *
 * Returns a structured snapshot of the user's evidence trail:
 *   - completed missions across the first 90 days
 *   - green-scored Simulator runs
 *   - Situation Room sessions (one-line summaries)
 *   - reflection journal entries from mission completions
 *   - any persisted Probation Brief
 *
 * Per PRD §9.5 + MVP Spec §4.2 — when this tool registers, the Coach's
 * per-response tool budget bumps from 3 → 4.
 */
import "server-only";

import type { Tool } from "@anthropic-ai/sdk/resources/messages";

import { createServiceClient } from "@/lib/db/service";

import type { CoachTool, ToolContext } from "./types";

type Input = Record<string, never>;

type EvidenceMission = {
  slug: string;
  title: string;
  week: number;
  completed_at: string | null;
  reflection: string | null;
};

type EvidenceScenarioRun = {
  scenario_slug: string;
  scenario_title: string;
  outcome: string | null;
  judgement: string | null;
  ended_at: string | null;
};

type EvidenceSituation = {
  id: string;
  entry_type: string;
  summary: string;
  flagged_for_safety: boolean;
  created_at: string;
};

type Result = {
  probation: {
    review_date: string | null;
    days_to_review: number | null;
    brief_generated_at: string | null;
    brief_exists: boolean;
  };
  completed_missions: EvidenceMission[];
  green_scenario_runs: EvidenceScenarioRun[];
  yellow_scenario_runs: EvidenceScenarioRun[];
  recent_situations: EvidenceSituation[];
};

export const toolSpec: Tool = {
  name: "get_probation_evidence",
  description:
    "Get a structured snapshot of the user's probation-relevant evidence trail: completed missions, green-scored Simulator runs, recent Situation Room sessions, and the state of their Probation Brief. Use when helping the user assemble (or recall) the receipts they bring into their review. Returns review date + days-to-review at the top so you can calibrate timing in your reply.",
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

  const [ctxResult, missionsResult, runsResult, situationsResult, briefResult] =
    await Promise.all([
      supabase
        .from("user_context")
        .select(
          "probation_review_date, probation_brief_generated_at",
        )
        .eq("user_id", context.userId)
        .maybeSingle(),
      supabase
        .from("mission_completions")
        .select(
          "completed_at, reflection_response, missions!inner(slug, title, week)",
        )
        .eq("user_id", context.userId)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(20),
      supabase
        .from("scenario_runs")
        .select(
          "outcome, debrief, ended_at, scenarios!inner(slug, title)",
        )
        .eq("user_id", context.userId)
        .eq("status", "completed")
        .in("outcome", ["end_success", "end_yellow"])
        .order("ended_at", { ascending: false })
        .limit(10),
      supabase
        .from("situation_sessions")
        .select(
          "id, entry_type, situation_summary, flagged_for_safety, created_at",
        )
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("probation_artefacts")
        .select("id, artefact_type, generated_at, is_current")
        .eq("user_id", context.userId)
        .eq("artefact_type", "brief")
        .eq("is_current", true)
        .maybeSingle(),
    ]);

  // --- review date + days to review --------------------------------- //
  const reviewDate = ctxResult.data?.probation_review_date ?? null;
  let daysToReview: number | null = null;
  if (reviewDate) {
    try {
      const target = new Date(`${reviewDate}T00:00:00Z`).getTime();
      const diffMs = target - Date.now();
      daysToReview = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
    } catch {
      daysToReview = null;
    }
  }

  // --- missions ---------------------------------------------------- //
  type MissionRow = {
    completed_at: string | null;
    reflection_response: string | null;
    missions:
      | { slug: string; title: string; week: number }
      | { slug: string; title: string; week: number }[]
      | null;
  };
  const completed_missions: EvidenceMission[] = (
    (missionsResult.data ?? []) as MissionRow[]
  ).flatMap((row) => {
    const m = row.missions;
    if (!m) return [];
    const arr = Array.isArray(m) ? m : [m];
    return arr.map((mission) => ({
      slug: mission.slug,
      title: mission.title,
      week: mission.week,
      completed_at: row.completed_at,
      reflection: row.reflection_response,
    }));
  });

  // --- scenario runs (green/yellow) ------------------------------- //
  type RunRow = {
    outcome: string | null;
    debrief: { judgement?: string } | null;
    ended_at: string | null;
    scenarios:
      | { slug: string; title: string }
      | { slug: string; title: string }[]
      | null;
  };
  const allRuns: EvidenceScenarioRun[] = (
    (runsResult.data ?? []) as RunRow[]
  ).flatMap((row) => {
    const s = row.scenarios;
    if (!s) return [];
    const ref = Array.isArray(s) ? s[0] : s;
    if (!ref) return [];
    return [
      {
        scenario_slug: ref.slug,
        scenario_title: ref.title,
        outcome: row.outcome,
        judgement: row.debrief?.judgement ?? null,
        ended_at: row.ended_at,
      },
    ];
  });
  const green_scenario_runs = allRuns.filter((r) => r.outcome === "end_success");
  const yellow_scenario_runs = allRuns.filter((r) => r.outcome === "end_yellow");

  // --- situations --------------------------------------------------- //
  type SituationRow = {
    id: string;
    entry_type: string;
    situation_summary: string | null;
    flagged_for_safety: boolean;
    created_at: string;
  };
  const recent_situations: EvidenceSituation[] = (
    (situationsResult.data ?? []) as SituationRow[]
  ).map((row) => ({
    id: row.id,
    entry_type: row.entry_type,
    summary: (row.situation_summary ?? "").slice(0, 200),
    flagged_for_safety: row.flagged_for_safety,
    created_at: row.created_at,
  }));

  return {
    probation: {
      review_date: reviewDate,
      days_to_review: daysToReview,
      brief_generated_at: ctxResult.data?.probation_brief_generated_at ?? null,
      brief_exists: Boolean(briefResult.data),
    },
    completed_missions,
    green_scenario_runs,
    yellow_scenario_runs,
    recent_situations,
  };
}

export const tool: CoachTool<Input, Result> = { toolSpec, execute };
