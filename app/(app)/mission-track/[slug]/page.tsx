/**
 * Mission detail (Build Prompt 2.3).
 *
 * Reading column max-width 720px. Five sections with eyebrow + prose
 * (NOT bullets) bodies:
 *   1. Why this matters
 *   2. What you'll do (steps)
 *   3. What to use (linked resources)
 *   4. Success looks like
 *   5. Reflection (eyebrow + textarea)
 *
 * Mark complete saves the reflection alongside the status flip.
 */
import { notFound } from "next/navigation";
import Link from "next/link";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";

import { CompleteMissionForm } from "./CompleteMissionForm";
import { startMissionAction, skipMissionAction } from "../actions";

type PageProps = { params: Promise<{ slug: string }> };

const ROLE_LABEL: Record<string, string> = {
  ba: "BA",
  pm: "PM",
  sm: "Scrum Master",
  po: "PO",
  da: "Data Analyst",
  aie: "AI Engineer",
};

export default async function MissionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: mission } = await supabase
    .from("missions")
    .select(
      "id, slug, role, week, sequence_in_week, title, why_matters, steps, resource_refs, success_criteria, reflection_prompt, estimated_minutes",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!mission) {
    notFound();
  }

  const { data: completionRow } = await supabase
    .from("mission_completions")
    .select("status, reflection_response, completed_at")
    .eq("user_id", user.id)
    .eq("mission_id", mission.id)
    .maybeSingle();

  const completed = completionRow?.status === "completed";

  const totalMissionsInWeek =
    (
      await supabase
        .from("missions")
        .select("id", { count: "exact", head: true })
        .eq("role", mission.role)
        .eq("week", mission.week)
        .eq("is_published", true)
    ).count ?? 0;

  const day = (mission.week - 1) * 7 + mission.sequence_in_week;
  const resourceRefs = (mission.resource_refs ?? {}) as {
    playbook_slugs?: string[];
    scenario_slugs?: string[];
  };
  const playbookSlugs = resourceRefs.playbook_slugs ?? [];
  const scenarioSlugs = resourceRefs.scenario_slugs ?? [];

  return (
    <article className="mx-auto max-w-(--max-reading) py-7 md:py-8 px-4 md:px-6 flex flex-col gap-7">
      <p className="text-body-s text-mute">
        <Link
          href="/mission-track"
          className="hover:text-ink underline-offset-4 hover:underline"
        >
          ← Mission Track
        </Link>
      </p>

      <header className="flex flex-col gap-3">
        <p className="text-eyebrow">
          Day {day} · Week {mission.week} · Mission {mission.sequence_in_week} of {totalMissionsInWeek} · {ROLE_LABEL[mission.role] ?? mission.role}
        </p>
        <h1 className="text-h1 text-balance">{mission.title}</h1>
        <p className="text-caption text-mute">
          {mission.estimated_minutes} min · {mission.steps.length} step{mission.steps.length === 1 ? "" : "s"}
          {completed ? " · ✓ Completed" : ""}
        </p>
      </header>

      <Section eyebrow="Why this matters">
        <p>{mission.why_matters}</p>
      </Section>

      <Section eyebrow="What you'll do">
        {mission.steps.map((step, idx) => (
          <p key={idx}>{step}</p>
        ))}
      </Section>

      {(playbookSlugs.length > 0 || scenarioSlugs.length > 0) && (
        <Section eyebrow="What to use">
          <ul className="flex flex-col gap-2">
            {playbookSlugs.map((s) => (
              <ResourceLink key={`p:${s}`} href={`/playbook/${s}`} label={`Playbook: ${s}`} />
            ))}
            {scenarioSlugs.map((s) => (
              <ResourceLink key={`s:${s}`} href={`/simulator/${s}`} label={`Scenario: ${s}`} />
            ))}
          </ul>
        </Section>
      )}

      <Section eyebrow="Success looks like">
        <p>{mission.success_criteria}</p>
      </Section>

      <Section eyebrow="Reflection">
        <p>{mission.reflection_prompt}</p>
        <CompleteMissionForm
          missionSlug={mission.slug}
          initialReflection={completionRow?.reflection_response ?? ""}
          alreadyCompleted={completed}
        />
      </Section>

      {!completed ? (
        <div className="flex flex-wrap gap-3 border-t border-paper-3 pt-5">
          <form action={startMissionAction}>
            <input type="hidden" name="mission_slug" value={mission.slug} />
            <Button type="submit" variant="ghost">
              Mark in progress
            </Button>
          </form>
          <form action={skipMissionAction}>
            <input type="hidden" name="mission_slug" value={mission.slug} />
            <Button type="submit" variant="ghost">
              Skip this mission
            </Button>
          </form>
        </div>
      ) : (
        <div className="border-t border-paper-3 pt-5">
          <p className="inline-flex items-center gap-2 text-body-s text-mute">
            <Check className="size-4" strokeWidth={1.5} aria-hidden />
            Completed{completionRow?.completed_at ? ` ${new Date(completionRow.completed_at).toLocaleDateString()}` : ""}.
          </p>
        </div>
      )}
    </article>
  );
}

function Section({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <p className="text-eyebrow">{eyebrow}</p>
      <div className="flex flex-col gap-3 text-body-l text-ink">{children}</div>
    </section>
  );
}

function ResourceLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="block border border-paper-3 bg-paper p-3 hover:border-mute transition-colors"
        style={{ borderRadius: "8px" }}
      >
        <span className="text-body text-ink">{label}</span>
      </Link>
    </li>
  );
}
