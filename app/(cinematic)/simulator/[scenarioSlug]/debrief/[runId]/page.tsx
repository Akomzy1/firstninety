/**
 * Scenario debrief view.
 *
 * Cinematic dark canvas (inherits from `(cinematic)/layout.tsx`). Server
 * component: loads the run, generates the debrief on first visit, then
 * renders the structured artefact per SKILL.md §4.3.
 *
 * Layout (Design Prompts C6 / rendered prototype State 02):
 *   - Eyebrow "DEBRIEF — <scenario title> · N turns · M min"
 *   - Single Fraunces H1 judgement (the load-bearing line)
 *   - Body context paragraph
 *   - Three flag sections (Green / Yellow / Not yet) — each a single
 *     paragraph block with NUMBERED PROSE, not bulleted list
 *   - "What this scenario rehearses for"
 *   - "What's next" — 3 one-liner cards
 *   - Bottom: "Mark debrief read" ghost button
 */
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  MessageCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";

import { markDebriefReadAction } from "@/app/(app)/simulator/actions";
import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";
import {
  generateDebrief,
  type DebriefData,
} from "@/lib/simulator/debrief";

type PageProps = {
  params: Promise<{ scenarioSlug: string; runId: string }>;
};

export const metadata = { title: "Debrief" };

export default async function DebriefPage({ params }: PageProps) {
  const { scenarioSlug, runId } = await params;
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: run } = await supabase
    .from("scenario_runs")
    .select(
      "id, user_id, status, outcome, debrief, transcript, started_at, ended_at, scenarios!inner(slug, title, estimated_minutes)",
    )
    .eq("id", runId)
    .maybeSingle();

  if (!run) notFound();
  if (run.user_id !== user.id) {
    redirect(`/simulator/${scenarioSlug}/brief`);
  }

  // If the scenario is still active, kick the user back to the session.
  if (run.status === "active") {
    redirect(`/simulator/${scenarioSlug}/run/${runId}`);
  }

  type ScenarioRef = {
    slug: string;
    title: string;
    estimated_minutes: number;
  };
  const scenarioRef = (Array.isArray(run.scenarios)
    ? run.scenarios[0]
    : run.scenarios) as ScenarioRef | null;
  if (!scenarioRef) notFound();

  // Generate the debrief on first visit. `generateDebrief` is
  // idempotent — re-visits hit the persisted JSONB without re-billing.
  // Loading.tsx covers the wait while this resolves.
  let debrief: DebriefData;
  try {
    debrief = await generateDebrief(runId);
  } catch (err) {
    console.error("[debrief] generation failed", err);
    return <DebriefError />;
  }

  const userTurnCount = countUserTurns(run.transcript);
  const minutesLabel = describeDuration(run.started_at, run.ended_at);

  return (
    <main className="mx-auto w-full max-w-[720px] px-6 md:px-8 py-16 md:py-20 flex flex-col gap-9">
      <p className="text-eyebrow text-mute-2">
        Debrief &mdash; {scenarioRef.title}
        <span className="ml-3 text-mute font-normal normal-case tracking-normal text-body-s">
          {userTurnCount} turns &middot; {minutesLabel}
        </span>
      </p>

      <h1
        className="font-display font-normal text-balance text-ink"
        style={{
          fontSize: "clamp(2.25rem, 4.5vw, 3.25rem)",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
        }}
      >
        {debrief.judgement}
      </h1>

      {debrief.context_paragraph ? (
        <p
          className="text-mute max-w-prose"
          style={{ fontSize: "19px", lineHeight: 1.65 }}
        >
          {debrief.context_paragraph}
        </p>
      ) : null}

      <FlagSection
        tone="green"
        Icon={CheckCircle2}
        label="Green flags"
        items={debrief.green_flags}
      />
      <FlagSection
        tone="yellow"
        Icon={AlertTriangle}
        label="Yellow flags"
        items={debrief.yellow_flags}
      />
      <FlagSection
        tone="red"
        Icon={XCircle}
        label="Not yet"
        items={debrief.red_flags}
      />

      {debrief.rehearses_for ? (
        <section className="flex flex-col gap-3 pt-4 border-t border-paper-3">
          <p className="text-eyebrow text-mute-2">
            What this scenario rehearses for
          </p>
          <p
            className="text-mute max-w-prose"
            style={{ fontSize: "19px", lineHeight: 1.65 }}
          >
            {debrief.rehearses_for}
          </p>
        </section>
      ) : null}

      {debrief.whats_next.length > 0 ? (
        <section className="flex flex-col gap-4 pt-4 border-t border-paper-3">
          <p className="text-eyebrow text-mute-2">What&rsquo;s next</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {debrief.whats_next.map((n) => (
              <NextCard key={n.label} label={n.label} url={n.url} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-4 flex items-center gap-3">
        {debrief.read_at ? (
          <p className="inline-flex items-center gap-1.5 text-body-s text-mute">
            <Check className="size-4" strokeWidth={1.5} aria-hidden />
            Debrief marked read.
          </p>
        ) : (
          <form action={markDebriefReadAction}>
            <input type="hidden" name="run_id" value={runId} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 border border-paper-3 px-4 py-2 text-body-s font-medium text-mute hover:text-ink hover:bg-paper-2 transition-colors"
              style={{ borderRadius: "4px" }}
            >
              <Check className="size-4" strokeWidth={1.5} aria-hidden />
              Mark debrief read
            </button>
          </form>
        )}
        <Link
          href="/simulator"
          className="inline-flex items-center gap-1.5 text-body-s text-mute hover:text-ink transition-colors"
        >
          Back to the library
          <ArrowRight
            className="size-3.5 group-hover:translate-x-0.5 transition-transform"
            strokeWidth={1.5}
            aria-hidden
          />
        </Link>
      </div>
    </main>
  );
}

function FlagSection({
  tone,
  Icon,
  label,
  items,
}: {
  tone: "green" | "yellow" | "red";
  Icon: React.ElementType;
  label: string;
  items: Array<{ text: string; ranked: number }>;
}) {
  if (items.length === 0) return null;
  const color =
    tone === "green"
      ? "text-success"
      : tone === "yellow"
        ? "text-warn"
        : "text-danger";
  const dotColor =
    tone === "green"
      ? "bg-success"
      : tone === "yellow"
        ? "bg-warn"
        : "bg-danger";

  // Sort by ranked ascending so the load-bearing item lands first.
  const sorted = [...items].sort((a, b) => a.ranked - b.ranked);

  return (
    <section className="flex flex-col gap-3">
      <p className={`inline-flex items-center gap-2 text-eyebrow ${color}`}>
        <Icon className="size-4" strokeWidth={1.5} aria-hidden />
        <span aria-hidden className={`block size-1.5 rounded-full ${dotColor}`} />
        {label}
      </p>
      <p
        className="text-ink max-w-prose"
        style={{ fontSize: "18px", lineHeight: 1.7 }}
      >
        {sorted.map((item, i) => (
          <span key={i}>
            <span className="text-mute-2 font-mono mr-1.5">{i + 1}.</span>
            {item.text}
            {i < sorted.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
    </section>
  );
}

function NextCard({ label, url }: { label: string; url: string }) {
  const Icon = pickNextIcon(label);
  return (
    <Link
      href={url}
      className="group flex items-center justify-between gap-3 border border-paper-3 bg-paper p-4 text-body-s text-ink hover:border-ink hover:bg-paper-2 transition-colors"
      style={{ borderRadius: "8px" }}
    >
      <span>{label}</span>
      <Icon
        className="size-4 text-mute group-hover:text-ink shrink-0 transition-colors"
        strokeWidth={1.5}
        aria-hidden
      />
    </Link>
  );
}

function pickNextIcon(label: string): React.ElementType {
  const lower = label.toLowerCase();
  if (lower.startsWith("replay") || lower.includes("again")) return RotateCcw;
  if (lower.includes("coach")) return MessageCircle;
  if (lower.includes("playbook")) return BookOpen;
  return ArrowRight;
}

function DebriefError() {
  return (
    <main className="mx-auto w-full max-w-[720px] px-6 md:px-8 py-20 flex flex-col gap-6">
      <p className="text-eyebrow text-mute-2">Debrief</p>
      <h1
        className="font-display font-normal text-ink text-balance"
        style={{ fontSize: "clamp(2rem, 4vw, 2.5rem)", lineHeight: 1.1 }}
      >
        We couldn&rsquo;t put a debrief together this time.
      </h1>
      <p className="text-mute max-w-prose" style={{ fontSize: "19px", lineHeight: 1.65 }}>
        The transcript is saved. You can replay the scenario or come back
        in a few minutes &mdash; the generator will try again on your
        next visit.
      </p>
      <Link
        href="/simulator"
        className="self-start inline-flex items-center gap-1.5 text-body-s text-mute hover:text-ink transition-colors"
      >
        Back to the library
        <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden />
      </Link>
    </main>
  );
}

function countUserTurns(transcript: unknown): number {
  if (!transcript || typeof transcript !== "object") return 0;
  const turns = (transcript as { turns?: unknown }).turns;
  if (!Array.isArray(turns)) return 0;
  return turns.filter(
    (t) =>
      t &&
      typeof t === "object" &&
      (t as { speaker?: unknown }).speaker === "You",
  ).length;
}

function describeDuration(startISO: string, endISO: string | null): string {
  if (!endISO) return "—";
  try {
    const ms = new Date(endISO).getTime() - new Date(startISO).getTime();
    const minutes = Math.max(1, Math.round(ms / 60_000));
    return `${minutes} min`;
  } catch {
    return "—";
  }
}
