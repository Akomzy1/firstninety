/**
 * Active scenario session.
 *
 * Light-mode, no app chrome. Loads the run + scenario from the DB,
 * hydrates the persisted transcript, and hands off to the
 * `ActiveSession` client component which handles streaming + composer.
 *
 * If the run is no longer active (completed / abandoned), the page
 * routes the user away to the brief or the library.
 */
import { notFound, redirect } from "next/navigation";

import {
  ActiveSession,
  type TurnRecord,
} from "@/components/simulator/ActiveSession";
import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";

type PageProps = {
  params: Promise<{ scenarioSlug: string; runId: string }>;
};

const ROLE_LABEL: Record<string, string> = {
  ba: "Business Analyst",
  pm: "Project Manager",
  sm: "Scrum Master",
  po: "Product Owner",
  da: "Data Analyst",
  aie: "AI Engineer",
};

type Persona = {
  name: string;
  role: string;
  monogram: string;
  colour: string;
};

export const metadata = { title: "Scenario session" };

export default async function ActiveSessionPage({ params }: PageProps) {
  const { scenarioSlug, runId } = await params;
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: run } = await supabase
    .from("scenario_runs")
    .select(
      "id, user_id, status, transcript, scenario_id, scenarios!inner(slug, role, title, personas, estimated_minutes)",
    )
    .eq("id", runId)
    .maybeSingle();

  if (!run) notFound();
  if (run.user_id !== user.id) redirect(`/simulator/${scenarioSlug}/brief`);

  type ScenarioRef = {
    slug: string;
    role: string;
    title: string;
    personas: Persona[];
    estimated_minutes: number;
  };
  const scenarioRef = (Array.isArray(run.scenarios)
    ? run.scenarios[0]
    : run.scenarios) as ScenarioRef | null;
  if (!scenarioRef) notFound();

  // If the scenario already ended, route to the debrief; if abandoned,
  // back to the library.
  if (run.status === "completed") {
    redirect(`/simulator/${scenarioRef.slug}/run/${runId}/debrief`);
  }
  if (run.status === "abandoned") {
    redirect("/simulator");
  }

  const turns: TurnRecord[] = extractTurns(run.transcript);
  const personas: Persona[] = Array.isArray(scenarioRef.personas)
    ? scenarioRef.personas
    : [];

  // Active session lives in the cinematic group (alongside brief +
  // debrief, which keep the same `[scenarioSlug]` parameter), but is
  // deliberately LIGHT mode per the prototype. The light-theme reset
  // in globals.css flips every Tailwind token back inside this wrapper.
  return (
    <div data-theme="light" className="bg-paper text-ink min-h-screen">
      <ActiveSession
        runId={runId}
        scenarioSlug={scenarioRef.slug}
        scenarioTitle={scenarioRef.title}
        roleLabel={ROLE_LABEL[scenarioRef.role] ?? scenarioRef.role.toUpperCase()}
        personas={personas}
        initialTurns={turns}
        estimatedMinutes={scenarioRef.estimated_minutes}
      />
    </div>
  );
}

function extractTurns(transcript: unknown): TurnRecord[] {
  if (!transcript || typeof transcript !== "object") return [];
  const obj = transcript as Record<string, unknown>;
  if (!Array.isArray(obj.turns)) return [];
  return (obj.turns as unknown[]).flatMap((t) => {
    if (
      t &&
      typeof t === "object" &&
      typeof (t as TurnRecord).speaker === "string" &&
      typeof (t as TurnRecord).content === "string"
    ) {
      return [t as TurnRecord];
    }
    return [];
  });
}
