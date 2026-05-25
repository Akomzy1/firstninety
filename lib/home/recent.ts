/**
 * Post-90 "Recent" rail loader.
 *
 * Pulls the last Coach thread, the last Situation Room session, and
 * the last Simulator run (with its outcome flag) for the user so the
 * Day 91+ Daily Home rail can render a real activity list rather than
 * the empty-state placeholder.
 *
 * Each row carries:
 *   - kind:     "coach" | "room" | "simulator"
 *   - title:    the human-readable line (topic / summary / scenario title)
 *   - href:     where clicking lands
 *   - timestamp: ISO string used for the "Yesterday / 3 Sep" label
 *   - outcome:  green/yellow/red for simulator rows, null otherwise
 *
 * Returns at most three rows total (one per surface). Surfaces with no
 * history simply don't appear.
 */
import "server-only";

import { createServiceClient } from "@/lib/db/service";

export type RecentKind = "coach" | "room" | "simulator";
export type RecentOutcome = "green" | "yellow" | "red";

export type RecentItem = {
  kind: RecentKind;
  title: string;
  href: string;
  timestamp: string;
  outcome: RecentOutcome | null;
};

export async function loadPost90Recent(userId: string): Promise<RecentItem[]> {
  const supabase = createServiceClient();

  const [coachResult, situationResult, runResult] = await Promise.all([
    supabase
      .from("coach_threads")
      .select("id, topic_title, last_message_at")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("last_message_at", { ascending: false })
      .limit(1),
    supabase
      .from("situation_sessions")
      .select("id, situation_summary, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("scenario_runs")
      .select("id, outcome, started_at, ended_at, scenario_id, scenarios(title, slug)")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(1),
  ]);

  const items: RecentItem[] = [];

  const thread = coachResult.data?.[0];
  if (thread) {
    items.push({
      kind: "coach",
      title: thread.topic_title,
      href: `/coach/${thread.id}`,
      timestamp: thread.last_message_at,
      outcome: null,
    });
  }

  const session = situationResult.data?.[0];
  if (session) {
    items.push({
      kind: "room",
      title: session.situation_summary,
      href: `/situation-room/${session.id}`,
      timestamp: session.created_at,
      outcome: null,
    });
  }

  const run = runResult.data?.[0];
  if (run) {
    type ScenarioRef = { title: string; slug: string };
    const sref = run.scenarios as ScenarioRef | ScenarioRef[] | null;
    const scenario = Array.isArray(sref) ? sref[0] : sref;
    items.push({
      kind: "simulator",
      title: scenario?.title ?? "Simulator run",
      href: scenario?.slug
        ? `/simulator/${scenario.slug}/run/${run.id}`
        : "/simulator",
      timestamp: run.ended_at ?? run.started_at,
      outcome: normaliseOutcome(run.outcome),
    });
  }

  return items;
}

function normaliseOutcome(raw: string | null): RecentOutcome | null {
  if (!raw) return null;
  const v = raw.toLowerCase();
  if (v === "green" || v === "yellow" || v === "red") return v;
  return null;
}
