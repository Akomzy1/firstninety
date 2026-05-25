"use server";

/**
 * Simulator — server actions.
 *
 * `startScenarioRunAction` creates a `scenario_runs` row and redirects
 * the user into the active session. Pipeline:
 *   1. Auth
 *   2. Resolve scenario row by slug
 *   3. Tier gate (free-tier: 4 lifetime simulator runs)
 *   4. Insert scenario_runs row (status=active, started_at=now())
 *      — the trigger from Prompt 0.3 increments
 *        `usage_limits.simulator_runs_lifetime`
 *   5. Redirect to /simulator/[slug]/run/[runId]
 *
 * The trigger does the counter bookkeeping; this action only reads
 * the tier state and writes the run row.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/server";
import { checkTierAllowance } from "@/lib/billing/tier";
import { createServiceClient } from "@/lib/db/service";
import { markDebriefRead } from "@/lib/simulator/debrief";

/**
 * Stamp `scenario_runs.debrief.read_at` on a completed run so the
 * history view can show a "debrief read" state. Idempotent.
 */
export async function markDebriefReadAction(formData: FormData): Promise<void> {
  const user = await requireAuth();
  const runId = String(formData.get("run_id") ?? "").trim();
  if (!runId) return;

  const supabase = createServiceClient();
  const { data: run } = await supabase
    .from("scenario_runs")
    .select("id, user_id, scenarios!inner(slug)")
    .eq("id", runId)
    .maybeSingle();
  if (!run || run.user_id !== user.id) return;

  await markDebriefRead(runId);

  type ScenarioRef = { slug: string };
  const ref = (Array.isArray(run.scenarios)
    ? run.scenarios[0]
    : run.scenarios) as ScenarioRef | null;
  if (ref?.slug) {
    revalidatePath(`/simulator/${ref.slug}/debrief/${runId}`);
  }
}

/**
 * "Exit scenario" — flips the run to `abandoned` and routes the user
 * back to the library. No debrief is generated. Idempotent: re-calling
 * on a non-active run is a no-op redirect.
 */
export async function abandonScenarioRunAction(
  formData: FormData,
): Promise<void> {
  const user = await requireAuth();
  const runId = String(formData.get("run_id") ?? "").trim();
  if (!runId) redirect("/simulator");

  const supabase = createServiceClient();
  const { data: run } = await supabase
    .from("scenario_runs")
    .select("id, user_id, status")
    .eq("id", runId)
    .maybeSingle();

  if (run && run.user_id === user.id && run.status === "active") {
    await supabase
      .from("scenario_runs")
      .update({
        status: "abandoned",
        ended_at: new Date().toISOString(),
      })
      .eq("id", runId);
  }

  redirect("/simulator");
}

/**
 * Failure paths redirect with a `?denied=…` query string so the brief
 * page can render the matching denial surface on next load. Success
 * redirects into the run. JSX `<form action>` requires void.
 */
export async function startScenarioRunAction(
  formData: FormData,
): Promise<void> {
  const user = await requireAuth();
  const slug = String(formData.get("scenario_slug") ?? "").trim();

  if (!slug) redirect("/simulator");

  const supabase = createServiceClient();
  const { data: scenario, error: scenarioErr } = await supabase
    .from("scenarios")
    .select("id, slug")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (scenarioErr || !scenario) {
    redirect("/simulator?denied=not_found");
  }

  const allowance = await checkTierAllowance(user.id, "simulator");
  if (!allowance.allowed) {
    redirect(`/simulator/${slug}/brief?denied=tier`);
  }

  const { data: run, error: runErr } = await supabase
    .from("scenario_runs")
    .insert({
      user_id: user.id,
      scenario_id: scenario.id,
      status: "active",
    })
    .select("id")
    .single();
  if (runErr || !run) {
    console.error("[simulator] scenario_runs insert failed", runErr);
    redirect(`/simulator/${slug}/brief?denied=error`);
  }

  redirect(`/simulator/${slug}/run/${run.id}`);
}
