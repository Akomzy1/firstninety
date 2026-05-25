/**
 * Probation Outcome Capture — the most emotionally calibrated surface
 * in the product (PRD §7.5 + SKILL §10 "Ended voice — extended guidance").
 *
 * Two states:
 *   1. Outcome prompt — four options (Continued / Extended / Ended /
 *      Prefer not to say). No coral on this surface; the options are
 *      Fraunces-italic buttons with a 1px border, the fourth is muted.
 *   2. Post-review thread — Coach voice calibrated to outcome. The
 *      "Ended" variant adds three quiet offerings before the composer
 *      ("what to do in the first week after a probation ends", "Update
 *      your CV...", "Talk to a real person").
 *
 * Selection is via `?outcome=continued|extended|ended` so the page is
 * deep-linkable from the Probation Daily Home or notification. When no
 * outcome is set, the prompt state renders.
 */
import { redirect } from "next/navigation";
import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";

import { captureProbationOutcomeAction } from "../actions";

type Outcome = "continued" | "extended" | "ended" | "prefer_not_to_say";

type Props = {
  searchParams: Promise<{ outcome?: string }>;
};

export const metadata = {
  title: "How did your review go?",
};

function isValidOutcome(v: string | undefined): v is Outcome {
  return (
    v === "continued" ||
    v === "extended" ||
    v === "ended" ||
    v === "prefer_not_to_say"
  );
}

const DATE_LONG = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
});

export default async function OutcomePage({ searchParams }: Props) {
  const { outcome } = await searchParams;
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: ctx } = await supabase
    .from("user_context")
    .select("probation_review_date")
    .eq("user_id", user.id)
    .single();

  const reviewDate = ctx?.probation_review_date
    ? DATE_LONG.format(new Date(`${ctx.probation_review_date}T00:00:00Z`))
    : null;

  if (isValidOutcome(outcome)) {
    if (outcome === "prefer_not_to_say") redirect("/home");
    return (
      <main className="mx-auto max-w-[720px] px-6 md:px-8 py-16 md:py-24">
        <PostReviewThread outcome={outcome} reviewDate={reviewDate} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[640px] px-6 md:px-8 py-16 md:py-24 text-center flex flex-col gap-7">
      {reviewDate ? (
        <p className="text-eyebrow text-mute-2">
          Probation review &mdash; {reviewDate}
        </p>
      ) : (
        <p className="text-eyebrow text-mute-2">Probation review</p>
      )}

      <h1
        className="font-display font-normal text-balance text-ink mx-auto leading-[1.1]"
        style={{
          fontSize: "clamp(2rem, 4.5vw, 3rem)",
          letterSpacing: "-0.015em",
        }}
      >
        How did your review go?
      </h1>

      <p className="text-body-l text-mute max-w-prose mx-auto">
        There&rsquo;s no right answer here. We&rsquo;re asking so we know
        how to be useful next.
      </p>

      <div
        role="radiogroup"
        aria-label="Outcome"
        className="flex flex-col gap-3 mt-4 max-w-md mx-auto w-full"
      >
        <OptionForm outcome="continued">
          Continued &mdash; I&rsquo;m staying.
        </OptionForm>
        <OptionForm outcome="extended">
          Extended &mdash; we&rsquo;re checking in again.
        </OptionForm>
        <OptionForm outcome="ended">
          Ended &mdash; I&rsquo;m moving on.
        </OptionForm>
        <OptionForm outcome="prefer_not_to_say" muted>
          Prefer not to say.
        </OptionForm>
      </div>

      <p
        className="font-display italic text-mute mx-auto mt-4 max-w-prose"
        style={{ fontSize: "14px", lineHeight: 1.55 }}
      >
        Whatever you choose, we&rsquo;ll change what we say next
        accordingly. There&rsquo;s no scoring here.
      </p>
    </main>
  );
}

function OptionForm({
  outcome,
  muted = false,
  children,
}: {
  outcome: "continued" | "extended" | "ended" | "prefer_not_to_say";
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <form action={captureProbationOutcomeAction}>
      <input type="hidden" name="outcome" value={outcome} />
      <button
        type="submit"
        role="radio"
        aria-checked="false"
        className={`block w-full border px-6 py-5 text-center font-display italic transition-colors ${
          muted
            ? "border-paper-3 text-mute hover:text-ink hover:border-mute"
            : "border-paper-3 text-ink hover:bg-ink hover:text-paper hover:border-ink"
        }`}
        style={{ borderRadius: "6px", fontSize: "20px", lineHeight: 1.45 }}
      >
        {children}
      </button>
    </form>
  );
}

function PostReviewThread({
  outcome,
  reviewDate,
}: {
  outcome: "continued" | "extended" | "ended";
  reviewDate: string | null;
}) {
  const label =
    outcome === "continued"
      ? "Continued"
      : outcome === "extended"
        ? "Extended"
        : "Ended";

  const placeholder =
    outcome === "continued"
      ? "Tell me what's on your plate now."
      : outcome === "extended"
        ? "Tell me what your manager said."
        : "Take your time. There's no rush.";

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-eyebrow">Post-review &mdash; {label}</p>
        {reviewDate ? (
          <p className="text-body-s text-mute italic">
            Started after your review on {reviewDate}.
          </p>
        ) : null}
      </header>

      <article className="flex flex-col">
        <span className="self-start inline-block relative font-body font-semibold text-[11px] uppercase tracking-[0.12em] text-ink pb-1.5 mb-3.5 border-b-2 border-paper-3">
          Coach
        </span>
        <div
          className="text-ink space-y-3.5 max-w-prose"
          style={{ fontSize: "17px", lineHeight: 1.7 }}
        >
          {outcome === "continued" ? <ContinuedBody /> : null}
          {outcome === "extended" ? <ExtendedBody /> : null}
          {outcome === "ended" ? <EndedBody /> : null}
        </div>
      </article>

      {outcome === "ended" ? <EndedOfferings /> : null}

      <Composer placeholder={placeholder} />
    </section>
  );
}

function ContinuedBody() {
  return (
    <>
      <p>
        You&rsquo;re on the team. The first 90 days are over and you
        didn&rsquo;t drown &mdash; that&rsquo;s a real thing, and worth
        letting yourself feel for a moment.
      </p>
      <p>
        The next quarter is different work. Now that you&rsquo;re not
        being assessed against probation criteria, you&rsquo;re being
        assessed against whether you become someone the team actually
        relies on. The shift is from{" "}
        <Italic>showing competence</Italic> to{" "}
        <Italic>building trust.</Italic> Those aren&rsquo;t the same
        thing.
      </p>
      <p>
        What&rsquo;s the first piece of work on your plate now that the
        review is behind you?
      </p>
    </>
  );
}

function ExtendedBody() {
  return (
    <>
      <p>
        Extended isn&rsquo;t ended. The next 30 days are a recalibration,
        and they&rsquo;re survivable. Three things worth knowing.
      </p>
      <p>
        First: extensions usually happen because a manager wants to see
        one specific thing change &mdash; not because they&rsquo;ve
        decided against you. Find out what that one thing is. The
        question to ask is{" "}
        <Italic>
          &ldquo;what specifically would you need to see in the next 30
          days for this to land as continued?&rdquo;
        </Italic>{" "}
        &mdash; not{" "}
        <Italic>&ldquo;is there anything I can improve?&rdquo;</Italic>{" "}
        One forces a concrete answer. The other doesn&rsquo;t.
      </p>
      <p>
        Second: don&rsquo;t try to be a different person for 30 days. Try
        to be more legible. Most of the time the gap isn&rsquo;t
        performance, it&rsquo;s visibility &mdash; your manager
        doesn&rsquo;t see enough of what you&rsquo;re actually doing.
        That&rsquo;s a fixable problem.
      </p>
      <p>
        Third: 30 days is short. Pick two things to do well, not seven.
        Tell me what you think those two should be and we&rsquo;ll work
        through them.
      </p>
    </>
  );
}

function EndedBody() {
  return (
    <>
      <p>That is hard. There is no way to dress it up.</p>
      <p>
        Whatever your manager said, and whatever you&rsquo;re telling
        yourself right now, here is what is also true: you did the work
        of the first 90 days inside a real organisation. You learned
        things this quarter that nobody who hasn&rsquo;t been in the seat
        can teach you. Those things travel with you to the next role.
      </p>
      <p>
        We don&rsquo;t need to talk through next steps today. Take a few
        days. When you want to start thinking about what comes next, come
        back and tell me what you&rsquo;re noticing.
      </p>
      <p>
        In the meantime, the one thing worth doing this week is writing
        down what you learned about yourself in these 90 days &mdash;{" "}
        <Italic>not what you delivered, what you learned.</Italic> Even
        rough notes. We&rsquo;ll work from those when you&rsquo;re ready.
      </p>
    </>
  );
}

function EndedOfferings() {
  return (
    <div
      aria-label="Things you might do when you're ready"
      className="flex flex-col gap-2"
    >
      <Offering href="#">
        Read: what to do in the first week after a probation ends
      </Offering>
      <Offering href="#">Update your CV with what you actually did</Offering>
      <Offering href="#">
        Talk to a real person &mdash; find a coach
      </Offering>
    </div>
  );
}

function Offering({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-3 text-body text-mute hover:text-ink transition-colors"
    >
      <span aria-hidden className="text-mute-2">
        →
      </span>
      {children}
    </Link>
  );
}

function Italic({ children }: { children: React.ReactNode }) {
  return <span className="font-display italic text-ink">{children}</span>;
}

function Composer({ placeholder }: { placeholder: string }) {
  return (
    <div className="pt-6 border-t border-paper-3">
      <div className="relative">
        <label htmlFor="reply-input" className="sr-only">
          Reply to your Coach
        </label>
        <textarea
          id="reply-input"
          rows={2}
          placeholder={placeholder}
          className="block w-full min-h-[84px] bg-paper border border-paper-3 px-4 py-4 pr-14 text-body text-ink placeholder:text-mute placeholder:italic focus:outline-none focus:border-mute-2 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 resize-y"
          style={{ borderRadius: "8px", fontSize: "17px", lineHeight: 1.55 }}
        />
        <button
          type="button"
          aria-label="Send"
          className="absolute bottom-3 right-3 inline-flex size-9 items-center justify-center text-mute-2 hover:text-ink hover:bg-paper-2 transition-colors"
          style={{ borderRadius: "999px" }}
        >
          <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
        </button>
      </div>
      <div className="flex items-baseline justify-between mt-2.5">
        <span className="text-caption text-mute-2">
          Private to you. Encrypted. Deletable.
        </span>
        <span className="font-mono text-mute-2" style={{ fontSize: "11px" }}>
          &#8984; + Enter to send
        </span>
      </div>
    </div>
  );
}
