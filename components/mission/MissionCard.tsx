/**
 * Mission card — used on the daily home and on the Mission Track week
 * view. Four variants:
 *
 *   active             — TODAY — DAY N eyebrow, ink title, Begin CTA
 *   completed          — same shape but title in --mute, "Completed N days ago"
 *   locked             — fully muted, lock icon, "Available Day N" tooltip
 *   skipped_pre_signup — italic-mute treatment, "Read →" link, editorial
 *                        caption distinguishing "you lived through this"
 *                        from "this is in your future" (locked). Per
 *                        Retrofit 2 / MVP Spec v1.3 §3.
 *
 * Layout matches the Daily Home prototype: rounded 10px, --paper bg
 * inside a 2px --paper-3 border, generous internal padding.
 */
import Link from "next/link";

import { Check, Lock } from "lucide-react";

import { Button } from "@/components/ui/Button";

type MissionStatus =
  | "active"
  | "completed"
  | "locked"
  | "skipped_pre_signup";

export type MissionCardProps = {
  missionSlug: string;
  title: string;
  description: string;
  day: number;
  estimatedMinutes: number;
  status: MissionStatus;
  /** "Completed 3 days ago" / "Available Day 8" etc. — surface-specific copy. */
  statusLabel?: string;
  /** Renders the coral "Probation" chip on the eyebrow line. */
  isProbation?: boolean;
  className?: string;
};

export function MissionCard({
  missionSlug,
  title,
  description,
  day,
  estimatedMinutes,
  status,
  statusLabel,
  isProbation = false,
  className = "",
}: MissionCardProps) {
  // skipped_pre_signup renders distinctly — italic-mute treatment with
  // a small "Read →" link, no Begin / Open button, editorial caption
  // distinguishing "you lived through this week" from "this is locked".
  if (status === "skipped_pre_signup") {
    return (
      <article
        className={`flex flex-col gap-2 border border-paper-3 bg-paper-2/40 p-5 md:p-6 ${className}`.trim()}
        style={{ borderRadius: "10px" }}
        aria-label={`${title} — read-only (skipped at signup)`}
      >
        <p className="text-eyebrow text-mute-2">Day {day}</p>
        <h3
          className="font-display italic font-normal text-mute"
          style={{ fontSize: "17px", lineHeight: 1.4, letterSpacing: "0" }}
        >
          {title}
        </h3>
        <p className="font-display italic text-caption text-mute-2 max-w-prose">
          From a week you lived through before FirstNinety. Available to
          read if you want.
        </p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="text-caption text-mute-2">{estimatedMinutes} min</span>
          <Link
            href={`/mission-track/${missionSlug}`}
            className="text-body-s text-mute hover:text-ink underline-offset-4 hover:underline"
          >
            Read &rarr;
          </Link>
        </div>
      </article>
    );
  }

  const tone =
    status === "active"
      ? "text-ink"
      : status === "completed"
        ? "text-mute"
        : "text-mute-2";

  const eyebrow =
    status === "active"
      ? `Today — Day ${day}`
      : status === "completed"
        ? `Day ${day}`
        : `Day ${day}`;

  return (
    <article
      className={`flex flex-col gap-3 border bg-paper p-5 md:p-6 ${
        status === "locked" ? "border-paper-3 opacity-60" : "border-paper-3"
      } ${className}`.trim()}
      style={{ borderRadius: "10px" }}
      aria-label={`${title} — ${status}`}
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <p className="text-eyebrow inline-flex items-center gap-2">
          {eyebrow}
          {isProbation ? (
            <span
              className="inline-flex items-center text-accent bg-accent-soft border border-accent-soft px-1.5 py-px text-[10px] font-semibold uppercase tracking-wider not-italic"
              style={{ borderRadius: "3px" }}
            >
              Probation
            </span>
          ) : null}
        </p>
        {status === "completed" ? (
          <span className="inline-flex items-center gap-1 text-caption text-mute">
            <Check className="size-3" strokeWidth={1.5} aria-hidden />
            Completed
          </span>
        ) : status === "locked" ? (
          <span
            className="inline-flex items-center gap-1 text-caption text-mute"
            title={statusLabel ?? `Available Day ${day}`}
          >
            <Lock className="size-3" strokeWidth={1.5} aria-hidden />
            Locked
          </span>
        ) : null}
      </div>

      <h3
        className={`font-display font-normal text-balance ${tone}`}
        style={{ fontSize: "22px", lineHeight: 1.25, letterSpacing: "-0.01em" }}
      >
        {title}
      </h3>
      <p className="text-body-s text-mute max-w-prose leading-snug">
        {description}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 min-w-0">
        {status === "active" ? (
          <Link href={`/mission-track/${missionSlug}`}>
            <Button variant="primary" size="md">
              Begin
            </Button>
          </Link>
        ) : status === "completed" ? (
          <Link href={`/mission-track/${missionSlug}`}>
            <Button variant="ghost" size="sm">
              Open
            </Button>
          </Link>
        ) : null}
        <span className="text-caption text-mute whitespace-nowrap">
          {estimatedMinutes} min
        </span>
        {statusLabel ? (
          <span className="text-caption text-mute whitespace-nowrap">
            {statusLabel}
          </span>
        ) : null}
      </div>
    </article>
  );
}
