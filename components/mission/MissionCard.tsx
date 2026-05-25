/**
 * Mission card — used on the daily home and on the Mission Track week
 * view. Three variants matching Build Prompt 2.3 + the prototype:
 *
 *   active    — TODAY — DAY N eyebrow, ink title, Begin CTA
 *   completed — same shape but title in --mute, "Completed N days ago"
 *   locked    — fully muted, lock icon, "Available Day N" tooltip
 *
 * Layout matches the Daily Home prototype: rounded 10px, --paper bg
 * inside a 2px --paper-3 border, generous internal padding.
 */
import Link from "next/link";

import { Check, Lock } from "lucide-react";

import { Button } from "@/components/ui/Button";

type MissionStatus = "active" | "completed" | "locked";

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

      <div className="mt-2 flex items-center gap-3">
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
        <span className="text-caption text-mute">{estimatedMinutes} min</span>
        {statusLabel ? (
          <span className="text-caption text-mute">{statusLabel}</span>
        ) : null}
      </div>
    </article>
  );
}
