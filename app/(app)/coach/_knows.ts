/**
 * Builds the "What the Coach knows here" list for the right rail.
 *
 * Pulls from user_context (role, week, probation), recent
 * responsibilities (the things the user has explicitly told us about
 * their work), and the most recent Situation Room session if it's
 * fresh. Per the AI Coach prototype the rail shows ~3-5 sharp lines —
 * not a dump of everything we know.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { getDayState } from "@/lib/home/day-state";

import type { KnowsItem } from "@/components/coach/KnowsRail";

const ROLE_LABEL: Record<string, string> = {
  ba: "Business Analyst",
  pm: "Project Manager",
  sm: "Scrum Master",
  po: "Product Owner",
  da: "Data Analyst",
  aie: "AI Engineer",
};

export async function buildKnowsItems(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  userId: string,
): Promise<KnowsItem[]> {
  const [userResult, ctxResult, respResult] = await Promise.all([
    supabase
      .from("users")
      .select("primary_role")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("user_context")
      .select(
        "start_date, probation_mode_active, probation_review_date",
      )
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("user_responsibilities")
      .select("id, description, updated_at")
      .eq("user_id", userId)
      .eq("is_current", true)
      .order("updated_at", { ascending: false })
      .limit(3),
  ]);

  const items: KnowsItem[] = [];

  const role = userResult.data?.primary_role as string | null | undefined;
  const dayState = getDayState(ctxResult.data?.start_date ?? null);

  if (role && dayState.mode !== "post-90") {
    items.push({
      id: "role-week",
      text: `You're a ${ROLE_LABEL[role] ?? role.toUpperCase()} in week ${dayState.week}.`,
    });
  } else if (role && dayState.mode === "post-90") {
    items.push({
      id: "role-post90",
      text: `You're a ${ROLE_LABEL[role] ?? role.toUpperCase()} past your first 90 days.`,
    });
  }

  if (
    ctxResult.data?.probation_mode_active &&
    ctxResult.data.probation_review_date
  ) {
    try {
      const target = new Date(
        `${ctxResult.data.probation_review_date}T00:00:00Z`,
      ).getTime();
      const diffMs = target - Date.now();
      const days = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
      items.push({
        id: "probation",
        text: `Your probation review is in ${days} day${days === 1 ? "" : "s"}.`,
        emphasis: "probation",
      });
    } catch {
      // ignore — bad date
    }
  }

  for (const r of respResult.data ?? []) {
    items.push({ id: `resp-${r.id}`, text: r.description });
  }

  return items;
}
