/**
 * Quick Simulator orchestrator — `/simulator/quick?from=situation:[id]`.
 *
 * No UI of its own. Server-side:
 *   1. Tier-gates against the simulator counter (quick runs still
 *      count against the 4-lifetime free-tier limit — no special
 *      unlimited bucket per PRD §6.5.1).
 *   2. Generates the ad-hoc scenario from the Situation Room session
 *      via Haiku (`generateQuickScenarioFromSituation`).
 *   3. Creates a `scenario_runs` row referencing the new scenario.
 *   4. Redirects into the standard active-session route. The
 *      coordinator + debrief generators sniff the `quick-` slug
 *      prefix to apply the shorter caps automatically.
 *
 * If the `?from=` param is missing or malformed, falls back to the
 * scenario library (the user must come in from a real SR session).
 */
import { redirect } from "next/navigation";

import { TierLimitPrompt } from "@/components/billing/TierLimitPrompt";
import { requireAuth } from "@/lib/auth/server";
import { checkTierAllowance } from "@/lib/billing/tier";
import { createServiceClient } from "@/lib/db/service";
import { generateQuickScenarioFromSituation } from "@/lib/simulator/quick-scenario";

export const metadata = { title: "Quick rehearsal" };

type PageProps = {
  searchParams: Promise<{ from?: string }>;
};

function parseFrom(value: string | undefined): string | null {
  if (!value) return null;
  // Expected shape: `situation:<uuid>`.
  const match = /^situation:([0-9a-f-]{8,})$/i.exec(value);
  return match ? (match[1] ?? null) : null;
}

export default async function QuickSimulatorPage({ searchParams }: PageProps) {
  const { from } = await searchParams;
  const sessionId = parseFrom(from);

  // Without a SR session we can't build a quick scenario — back to
  // the library.
  if (!sessionId) redirect("/simulator");

  const user = await requireAuth();

  // ---- Tier gate ------------------------------------------------- //
  const allowance = await checkTierAllowance(user.id, "simulator");
  if (!allowance.allowed) {
    return (
      <main className="mx-auto w-full max-w-prose px-6 md:px-8 py-12 md:py-16 flex flex-col gap-6">
        <p className="text-eyebrow text-mute-2">Quick rehearsal</p>
        <h1 className="text-h1 text-balance">
          Your free Simulator runs are spent.
        </h1>
        <p className="text-body-l text-mute">
          Quick rehearsals count against the same 4-per-lifetime limit
          on the free tier. Pro unlocks them all.
        </p>
        <TierLimitPrompt allowance={allowance} variant="inline" />
      </main>
    );
  }

  // ---- Draft the ad-hoc scenario --------------------------------- //
  const drafted = await generateQuickScenarioFromSituation({
    userId: user.id,
    sessionId,
  });
  if ("error" in drafted) {
    return (
      <main className="mx-auto w-full max-w-prose px-6 md:px-8 py-12 md:py-16 flex flex-col gap-6">
        <p className="text-eyebrow text-mute-2">Quick rehearsal</p>
        <h1 className="text-h1 text-balance">
          We couldn&rsquo;t draft a rehearsal this time.
        </h1>
        <p className="text-body-l text-mute">{drafted.error}</p>
        <p className="text-body-s text-mute">
          Head back to{" "}
          <a
            href={`/situation-room/${sessionId}`}
            className="text-ink underline-offset-4 hover:underline"
          >
            the situation
          </a>{" "}
          and try again, or talk it through with the Coach.
        </p>
      </main>
    );
  }

  // ---- Create the run ------------------------------------------- //
  const supabase = createServiceClient();
  const { data: run, error: runErr } = await supabase
    .from("scenario_runs")
    .insert({
      user_id: user.id,
      scenario_id: drafted.scenarioId,
      status: "active",
    })
    .select("id")
    .single();
  if (runErr || !run) {
    console.error("[quick-simulator] run insert failed", runErr);
    redirect("/simulator?denied=error");
  }

  redirect(`/simulator/${drafted.slug}/run/${run.id}`);
}
