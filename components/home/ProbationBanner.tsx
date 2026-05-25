/**
 * Probation banner — rendered on /home when probation_mode_active.
 *
 * Per the Daily Home (Probation Active) prototype: eyebrow with coral
 * pip + "Probation — N days to review", a short directive headline that
 * shifts by phase of probation, a meta line linking to settings.
 *
 * The banner does NOT colour-flood; it sits as a subtle paper-2 card
 * with a left ink rule (consistent with the prototype's "we're saying
 * probation matters and the user doesn't need to perform panic to prove
 * it" voice).
 */
import Link from "next/link";

type ProbationBannerProps = {
  daysToReview: number | null;
  briefGenerated: boolean;
};

function chooseDirective(days: number | null, briefGenerated: boolean): string {
  if (days === null) return "Probation Mode is on. Set a review date in Settings.";
  if (days <= 0) return "Your review is today. The work is already done. Bring the brief.";
  if (days <= 3) {
    return briefGenerated
      ? "Re-read the brief. Edit one sentence so it sounds like you."
      : "Generate your probation brief. Three sentences each, no headings.";
  }
  if (days <= 7) {
    return "This week: rehearse the conversation. Once out loud is worth ten in your head.";
  }
  if (days <= 14) {
    return "This week: gather your evidence. Don't over-prepare.";
  }
  return "Mode is on — the coach starts pulling probation-aware threads. No panic required.";
}

export function ProbationBanner({
  daysToReview,
  briefGenerated,
}: ProbationBannerProps) {
  const eyebrow =
    daysToReview === null
      ? "Probation — review date not set"
      : daysToReview <= 0
        ? "Probation — review today"
        : `Probation — ${daysToReview} day${daysToReview === 1 ? "" : "s"} to review`;

  return (
    <section
      className="bg-paper-2 border border-paper-3 border-l-2 border-l-ink p-5 md:p-6 flex flex-col gap-2 max-w-3xl"
      style={{ borderRadius: "10px" }}
      aria-label="Probation status"
    >
      <p className="text-eyebrow inline-flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-accent" aria-hidden />
        {eyebrow}
      </p>
      <p className="font-display text-h3 text-ink text-balance">
        {chooseDirective(daysToReview, briefGenerated)}
      </p>
      <p className="text-body-s text-mute mt-1">
        Probation Mode is on.{" "}
        <Link
          href="/settings/probation"
          className="text-ink underline-offset-4 hover:underline"
        >
          Adjust in Settings
        </Link>
        .
      </p>
    </section>
  );
}
