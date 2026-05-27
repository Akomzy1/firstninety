/**
 * Probation Brief — the one-page document the user takes into their
 * review.
 *
 * Server-renders the current Brief from `probation_artefacts` (the
 * generator in lib/probation/brief.ts persists structured JSON there).
 * Three states:
 *   - Probation Mode NOT active        → coaching message + return link
 *   - Active but no Brief generated    → "Generate the Brief" CTA
 *   - Active + Brief present           → the full editorial document
 *
 * Edit + PDF export are deferred until later in Phase 3 / 4; the
 * "Regenerate" button is wired (3-generation lifetime cap enforced
 * server-side).
 */
import { redirect } from "next/navigation";

import Link from "next/link";

import {
  ArrowDownToLine,
  ArrowLeft,
  Pencil,
  RefreshCw,
} from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import {
  loadCurrentProbationBrief,
  MAX_GENERATIONS,
  type ProbationBriefData,
} from "@/lib/probation/brief";
import { createServiceClient } from "@/lib/db/service";

import { generateProbationBriefAction } from "../actions";

export const metadata = {
  title: "Probation Brief",
};

const DATE_LONG = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return DATE_LONG.format(new Date(iso));
  } catch {
    return "—";
  }
}

export default async function ProbationBriefPage() {
  const user = await requireAuth();
  const supabase = createServiceClient();

  // Is the user in Probation Mode?
  const { data: ctx } = await supabase
    .from("user_context")
    .select("probation_mode_active, probation_review_date")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!ctx?.probation_mode_active) {
    return <NotInProbationMode />;
  }

  const current = await loadCurrentProbationBrief({ userId: user.id });

  // No Brief yet — render the generation invitation.
  if (!current) {
    return <GenerateInvitation />;
  }

  const used = current.used;
  const limit = current.limit;
  const remaining = Math.max(0, limit - used);
  const brief = current.brief;

  const { data: userRow } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", user.id)
    .single();
  const displayName =
    brief.byline ?? userRow?.display_name ?? "Your brief";

  return (
    <div className="min-h-screen bg-paper-2/50">
      {/* Top chrome */}
      <nav
        aria-label="Brief chrome"
        className="sticky top-0 z-20 border-b border-paper-3 backdrop-blur-md"
        style={{ background: "rgba(250, 247, 242, 0.85)" }}
      >
        <div className="mx-auto flex max-w-(--max-page) items-center justify-between gap-4 px-5 py-3 md:px-8">
          <Link
            href="/settings/probation"
            className="inline-flex items-center gap-2 text-body-s font-medium text-mute hover:text-ink transition-colors"
          >
            <ArrowLeft className="size-3.5" strokeWidth={1.5} aria-hidden />
            Back to Probation
          </Link>
          <div className="flex flex-wrap items-center gap-1">
            {/* Edit + PDF export wired in a later pass. */}
            <ChromeBtn Icon={Pencil} disabled>
              Edit
            </ChromeBtn>
            {remaining > 0 ? (
              <form action={generateProbationBriefAction}>
                <ChromeBtnSubmit Icon={RefreshCw}>
                  Regenerate{" "}
                  <span className="text-mute-2 ml-1">
                    &middot; {used} of {limit} used
                  </span>
                </ChromeBtnSubmit>
              </form>
            ) : (
              <ChromeBtn Icon={RefreshCw} disabled>
                Regenerate &middot; {limit} of {limit} used
              </ChromeBtn>
            )}
            <ChromeBtn Icon={ArrowDownToLine} disabled>
              Export as PDF
            </ChromeBtn>
          </div>
        </div>
      </nav>

      {/* The brief — paper-coloured document on the muted page bg */}
      <main className="mx-auto max-w-[760px] px-4 md:px-0 py-10 md:py-16">
        <BriefDocument
          brief={brief}
          displayName={displayName}
          reviewDate={ctx.probation_review_date}
        />
      </main>
    </div>
  );
}

function BriefDocument({
  brief,
  displayName,
  reviewDate,
}: {
  brief: ProbationBriefData;
  displayName: string;
  reviewDate: string | null;
}) {
  void reviewDate; // surfaced in a future iteration

  const numbered: Array<{ title: string; body: string }> = [
    brief.delivered,
    brief.learned,
    brief.want_next,
  ];

  return (
    <article
      className="bg-paper border border-paper-3 px-8 md:px-16 py-12 md:py-20 flex flex-col gap-12"
      style={{ borderRadius: "10px" }}
    >
      <div className="flex flex-col gap-2">
        <p
          className="font-mono text-mute uppercase tracking-wider"
          style={{ fontSize: "11px" }}
        >
          Probation Brief &middot; {displayName} &middot;{" "}
          {formatDate(brief.generated_at)}
        </p>
        <hr className="border-paper-3 border-t" />
      </div>

      <header className="flex flex-col gap-3">
        <p className="text-eyebrow">For your probation review</p>
        <h1
          className="font-display font-normal text-balance leading-[1.1] text-ink"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.25rem)", letterSpacing: "-0.02em" }}
        >
          Where I am, 90 days in.
        </h1>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 pt-2 border-t border-paper-3">
        {numbered.map((block, i) => (
          <div key={i} className="flex flex-col gap-3">
            <p className="flex items-baseline gap-3">
              <span
                className="font-display text-mute-2"
                style={{ fontSize: "32px", lineHeight: 1 }}
              >
                {i + 1}.
              </span>
              <span
                className="font-display italic text-ink"
                style={{ fontSize: "22px", lineHeight: 1.35 }}
              >
                {block.title}
              </span>
            </p>
            <p className="text-body text-ink leading-relaxed whitespace-pre-wrap">
              {block.body}
            </p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-5 pt-2 border-t border-paper-3">
        <p className="text-eyebrow">What I&rsquo;m drawing on</p>
        <div className="flex flex-col gap-4">
          {brief.evidence.map((item, i) => (
            <p key={i} className="text-body text-ink leading-relaxed">
              <span className="font-display italic text-ink mr-1">
                {item.title}
              </span>{" "}
              {item.body}
            </p>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 pt-2 border-t border-paper-3">
        <p className="text-eyebrow">
          Three questions I&rsquo;ll bring to the review
        </p>
        <ol className="flex flex-col gap-3 list-none p-0">
          {brief.questions.map((q, i) => (
            <li
              key={i}
              className="flex items-baseline gap-3 font-display italic text-ink"
              style={{ fontSize: "20px", lineHeight: 1.4 }}
            >
              <span className="text-mute-2 not-italic font-body">
                {i + 1}.
              </span>
              <span>{q}</span>
            </li>
          ))}
        </ol>
      </section>

      <footer className="flex flex-col gap-3 pt-6">
        <hr className="border-paper-3 border-t" />
        <p className="text-caption text-mute">
          Drafted with FirstNinety. Generated {formatDate(brief.generated_at)}.
        </p>
        <p
          className="font-mono text-mute-2 uppercase tracking-wider"
          style={{ fontSize: "11px" }}
        >
          tryfirst90.com
        </p>
      </footer>
    </article>
  );
}

function GenerateInvitation() {
  return (
    <main className="mx-auto max-w-prose px-6 md:px-8 py-16 md:py-24 flex flex-col gap-6">
      <p className="text-eyebrow text-mute-2">Probation Brief</p>
      <h1 className="text-h1 text-balance">
        Ready when you are.
      </h1>
      <p className="text-body-l text-mute">
        A one-page document drawn from what you&rsquo;ve done these 90
        days &mdash; deliveries, lessons, what you want next, three
        questions for the review. You&rsquo;ll be able to edit it, then
        take it into the room.
      </p>
      <p className="text-body-s text-mute">
        Takes about 30 seconds. You can regenerate up to {MAX_GENERATIONS}
        times in total &mdash; the cap is deliberate; the version after
        your first careful edit is usually the one you keep.
      </p>
      <form action={generateProbationBriefAction}>
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 bg-ink text-paper px-5 font-medium transition-opacity hover:opacity-90"
          style={{ borderRadius: "4px" }}
        >
          Generate the Brief
          <ArrowDownToLine className="size-4" strokeWidth={1.5} aria-hidden />
        </button>
      </form>
      <Link
        href="/settings/probation"
        className="self-start inline-flex items-center gap-2 text-body-s text-mute hover:text-ink transition-colors"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.5} aria-hidden />
        Back to Probation
      </Link>
    </main>
  );
}

function NotInProbationMode(): never {
  redirect("/settings/probation?reason=brief_requires_probation");
}

function ChromeBtn({
  Icon,
  children,
  disabled,
}: {
  Icon: React.ElementType;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="inline-flex items-center gap-1.5 text-body-s font-medium text-mute hover:text-ink hover:bg-paper-2 transition-colors px-3 py-1.5 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-mute"
      style={{ borderRadius: "4px" }}
    >
      <Icon className="size-3.5" strokeWidth={1.5} aria-hidden />
      {children}
    </button>
  );
}

function ChromeBtnSubmit({
  Icon,
  children,
}: {
  Icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className="inline-flex items-center gap-1.5 text-body-s font-medium text-mute hover:text-ink hover:bg-paper-2 transition-colors px-3 py-1.5"
      style={{ borderRadius: "4px" }}
    >
      <Icon className="size-3.5" strokeWidth={1.5} aria-hidden />
      {children}
    </button>
  );
}
