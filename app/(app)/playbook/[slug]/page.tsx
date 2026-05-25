/**
 * Playbook detail view (Build Prompt 2.5).
 *
 * Two-column layout on desktop: worked-example markdown on the left
 * (60%), margin annotations as Fraunces italic asides on the right
 * (40%) aligned roughly with their target sections. On mobile,
 * annotations render inline as italic asides between sections.
 *
 * Common mistakes + variant patterns + What to do next sections sit
 * below the two-column block.
 */
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";
import { renderPlaybookMarkdown } from "@/lib/playbooks/markdown";

import { WorkedExampleSwitcher } from "./WorkedExampleSwitcher";

type PageProps = { params: Promise<{ slug: string }> };

const ROLE_LABEL: Record<string, string> = {
  ba: "BA",
  pm: "PM",
  sm: "Scrum Master",
  po: "PO",
  da: "Data Analyst",
  aie: "AI Engineer",
};

type WorkedExampleRow = {
  title: string;
  content_md: string;
  annotations?: Array<{ section_id: string; note: string }>;
};

export default async function PlaybookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  await requireAuth();
  const supabase = await createClient();

  const { data: playbook } = await supabase
    .from("playbooks")
    .select(
      "slug, role, title, variant, artefact_type, description, worked_examples, common_mistakes, variant_patterns, related_scenarios, updated_at",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!playbook) {
    notFound();
  }

  const workedExamples = (playbook.worked_examples ?? []) as WorkedExampleRow[];
  if (workedExamples.length === 0) {
    notFound();
  }

  const examplesPrepared = workedExamples.map((example) => ({
    title: example.title,
    annotations: example.annotations ?? [],
    rendered: renderPlaybookMarkdown(example.content_md),
  }));

  return (
    <article className="mx-auto max-w-(--max-page) px-4 py-7 md:px-6 md:py-8 flex flex-col gap-7">
      <p className="text-body-s text-mute">
        <Link
          href="/playbook"
          className="hover:text-ink underline-offset-4 hover:underline"
        >
          ← Playbook Library
        </Link>
      </p>

      <header className="flex flex-col gap-3 max-w-(--max-reading)">
        <p className="text-eyebrow">
          {ROLE_LABEL[playbook.role] ?? playbook.role.toUpperCase()} · Playbook
          {playbook.variant ? ` · ${playbook.variant} variant` : ""}
        </p>
        <h1 className="text-h1 text-balance">{playbook.title}</h1>
        <p className="font-display italic text-body-l text-mute max-w-prose">
          {playbook.description}
        </p>
        <p className="text-caption text-mute">
          Updated{" "}
          {new Date(playbook.updated_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      <WorkedExampleSwitcher examples={examplesPrepared} />

      {playbook.common_mistakes && playbook.common_mistakes.length > 0 ? (
        <section className="max-w-(--max-reading) flex flex-col gap-3 border-t border-paper-3 pt-7">
          <p className="text-eyebrow">Common mistakes</p>
          <h2 className="text-h2 text-balance">What goes wrong here.</h2>
          {playbook.common_mistakes.map((mistake, idx) => (
            <p key={idx} className="text-body-l text-ink">
              {mistake}
            </p>
          ))}
        </section>
      ) : null}

      {playbook.variant_patterns && playbook.variant_patterns.length > 0 ? (
        <section className="max-w-(--max-reading) flex flex-col gap-3 border-t border-paper-3 pt-7">
          <p className="text-eyebrow">Variant patterns</p>
          <h2 className="text-h2 text-balance">Same shape, different stakes.</h2>
          {playbook.variant_patterns.map((pattern, idx) => (
            <p key={idx} className="text-body-l text-ink">
              {pattern}
            </p>
          ))}
        </section>
      ) : null}

      {playbook.related_scenarios && playbook.related_scenarios.length > 0 ? (
        <section className="max-w-(--max-reading) flex flex-col gap-3 border-t border-paper-3 pt-7">
          <p className="text-eyebrow">What to do next</p>
          <ul className="flex flex-col gap-2">
            {playbook.related_scenarios.map((scenarioSlug) => (
              <li key={scenarioSlug}>
                <Link
                  href={`/simulator/${scenarioSlug}`}
                  className="block border border-paper-3 bg-paper p-4 hover:border-mute transition-colors"
                  style={{ borderRadius: "8px" }}
                >
                  <p className="text-eyebrow">Scenario</p>
                  <p className="text-body text-ink mt-1">{scenarioSlug}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
