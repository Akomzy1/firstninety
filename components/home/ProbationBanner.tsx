/**
 * Probation banner — rendered on /home when probation_mode_active.
 *
 * Per the Daily Home (Probation Active) prototype: eyebrow with coral pip
 * + "Probation — N days to review" (eyebrow is mute by default; flips to
 * accent when daysToReview ≤ 3 via the urgent variant), a short
 * directive headline that shifts by phase of probation, and a meta line
 * linking to Settings.
 *
 * The banner does NOT colour-flood. It sits as a subtle paper-2 card
 * with a left ink rule (consistent with the SKILL §10.4 counterweight:
 * "probation matters and the user doesn't need to perform panic to
 * prove it").
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
      ? "Three days. Re-read the brief and edit one sentence so it sounds like you. That's enough."
      : "Three days. Generate your Brief and edit it once. That's enough.";
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
  const urgent = daysToReview !== null && daysToReview <= 3;

  const eyebrow =
    daysToReview === null
      ? "Probation — review date not set"
      : daysToReview <= 0
        ? "Probation — review today"
        : `Probation — ${daysToReview} day${daysToReview === 1 ? "" : "s"} to review`;

  return (
    <section
      className="bg-paper-2 border border-paper-3 border-l-2 border-l-ink p-5 md:p-6 flex flex-col gap-2"
      style={{ borderRadius: "10px" }}
      aria-label="Probation status"
    >
      <p
        className={`text-eyebrow inline-flex items-center gap-2 ${
          urgent ? "text-accent" : ""
        }`}
      >
        <span
          aria-hidden
          className={`block size-1.5 rounded-full ${urgent ? "bg-accent" : "bg-mute-2"}`}
        />
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
