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

import {
  ArrowDownToLine,
  ArrowRight,
  MessageCircle,
  RotateCcw,
} from "lucide-react";

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

  const roleLabel =
    ROLE_LABEL[playbook.role] ?? playbook.role.toUpperCase();

  return (
    <article className="mx-auto max-w-(--max-page) px-4 py-7 md:px-6 md:py-8 flex flex-col gap-7">
      <p className="text-eyebrow text-mute-2">
        <Link
          href="/playbook"
          className="hover:text-ink transition-colors"
        >
          {roleLabel} track{" "}
          <span aria-hidden className="mx-2 text-mute-2">
            /
          </span>{" "}
          Playbook Library
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
          ~{Math.max(5, Math.round(workedExamples.length * 5 + (workedExamples[0]?.annotations?.length ?? 0) * 1.5))} minutes to read
          {" · "}
          Updated{" "}
          {formatUpdatedAt(playbook.updated_at)}
          {" · "}
          Annotated by a senior practitioner
        </p>

        <div className="flex flex-wrap items-center gap-1 mt-3">
          <ActionBtn Icon={ArrowDownToLine}>Download empty template</ActionBtn>
          <ActionBtn Icon={ArrowDownToLine}>Download worked example</ActionBtn>
          <ActionBtn Icon={MessageCircle} href="/coach">
            Discuss with the Coach
          </ActionBtn>
        </div>
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

      <section className="flex flex-col gap-4 border-t border-paper-3 pt-7">
        <p className="text-eyebrow">What to do next</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(playbook.related_scenarios ?? []).slice(0, 3).map((scenarioSlug) => (
            <Link
              key={scenarioSlug}
              href={`/simulator/${scenarioSlug}/brief`}
              className="group flex items-center justify-between gap-3 border border-paper-3 bg-paper p-4 hover:border-ink transition-colors"
              style={{ borderRadius: "8px" }}
            >
              <span className="text-body-s text-ink line-clamp-2">
                Run scenario: {scenarioSlug.replace(/-/g, " ")}
              </span>
              <ArrowRight
                className="size-4 text-mute group-hover:text-ink shrink-0 transition-colors"
                strokeWidth={1.5}
                aria-hidden
              />
            </Link>
          ))}
          {(playbook.related_scenarios?.length ?? 0) < 3 ? (
            <Link
              href="/coach"
              className="group flex items-center justify-between gap-3 border border-paper-3 bg-paper p-4 hover:border-ink transition-colors"
              style={{ borderRadius: "8px" }}
            >
              <span className="text-body-s text-ink">
                Talk this through with the Coach
              </span>
              <MessageCircle
                className="size-4 text-mute group-hover:text-ink shrink-0 transition-colors"
                strokeWidth={1.5}
                aria-hidden
              />
            </Link>
          ) : null}
          {(playbook.related_scenarios?.length ?? 0) < 2 ? (
            <Link
              href="/playbook"
              className="group flex items-center justify-between gap-3 border border-paper-3 bg-paper p-4 hover:border-ink transition-colors"
              style={{ borderRadius: "8px" }}
            >
              <span className="text-body-s text-ink">
                Back to the Library
              </span>
              <RotateCcw
                className="size-4 text-mute group-hover:text-ink shrink-0 transition-colors"
                strokeWidth={1.5}
                aria-hidden
              />
            </Link>
          ) : null}
        </div>
      </section>

      <footer
        className="mt-6 pt-6 border-t border-paper-3 flex flex-wrap items-center justify-between gap-3 font-mono text-mute-2 uppercase tracking-wider"
        style={{ fontSize: "11px" }}
      >
        <span>
          FirstNinety &middot; Playbook Library &middot; {roleLabel} track
        </span>
        <span>Design Brief §7 — annotated artefacts</span>
      </footer>
    </article>
  );
}

function ActionBtn({
  Icon,
  href,
  children,
}: {
  Icon: React.ElementType;
  href?: string;
  children: React.ReactNode;
}) {
  const className =
    "inline-flex items-center gap-1.5 px-3 py-1.5 text-body-s font-medium text-mute hover:text-ink hover:bg-paper-2 transition-colors";
  const style = { borderRadius: "4px" };
  if (href) {
    return (
      <Link href={href} className={className} style={style}>
        <Icon className="size-3.5" strokeWidth={1.5} aria-hidden />
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={className} style={style}>
      <Icon className="size-3.5" strokeWidth={1.5} aria-hidden />
      {children}
    </button>
  );
}

function formatUpdatedAt(timestamp: string): string {
  try {
    const then = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - then.getTime()) / (24 * 60 * 60 * 1000),
    );
    if (diffDays < 14) return "this week";
    if (diffDays < 30) return "this month";
    return then.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    });
  } catch {
    return "recently";
  }
}
