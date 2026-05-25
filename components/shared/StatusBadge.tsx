/**
 * StatusBadge — surface-agnostic status pill.
 *
 * Per Design Brief §6.4: every status indicator carries an icon AND
 * text AND colour — never colour alone (accessibility). Used in:
 *   - Mission cards (in_progress / completed / locked)
 *   - Scenario cards + debrief outcome (green / yellow / red)
 *
 * Visual: rounded chip, 1.5px stroke icon, eyebrow-styled label.
 * Colours come from the system success / warn / danger tokens.
 */
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Lock,
  Play,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export type StatusBadgeStatus =
  | "green"
  | "yellow"
  | "red"
  | "in_progress"
  | "completed"
  | "locked";

type Variant = {
  Icon: LucideIcon;
  text: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
};

const VARIANTS: Record<StatusBadgeStatus, Variant> = {
  green: {
    Icon: CheckCircle2,
    text: "Green",
    textClass: "text-success",
    bgClass: "bg-success/10",
    borderClass: "border-success/30",
  },
  yellow: {
    Icon: AlertTriangle,
    text: "Yellow",
    textClass: "text-warn",
    bgClass: "bg-warn/10",
    borderClass: "border-warn/30",
  },
  red: {
    Icon: XCircle,
    text: "Not yet",
    textClass: "text-danger",
    bgClass: "bg-danger/10",
    borderClass: "border-danger/30",
  },
  in_progress: {
    Icon: Play,
    text: "In progress",
    textClass: "text-ink",
    bgClass: "bg-paper-2",
    borderClass: "border-paper-3",
  },
  completed: {
    Icon: CheckCircle2,
    text: "Completed",
    textClass: "text-mute",
    bgClass: "bg-paper-2",
    borderClass: "border-paper-3",
  },
  locked: {
    Icon: Lock,
    text: "Locked",
    textClass: "text-mute-2",
    bgClass: "bg-transparent",
    borderClass: "border-paper-3",
  },
};

type Props = {
  status: StatusBadgeStatus;
  /** Override the default label without changing the icon / colour. */
  label?: string;
  /** Tiny vs default. The default size matches the eyebrow type scale. */
  size?: "sm" | "md";
  className?: string;
};

export function StatusBadge({
  status,
  label,
  size = "md",
  className = "",
}: Props) {
  const v = VARIANTS[status] ?? VARIANTS.in_progress;
  const padding = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";
  const fontSize = size === "sm" ? "10px" : "11px";
  const iconSize = size === "sm" ? "size-3" : "size-3.5";

  return (
    <span
      role="status"
      aria-label={label ?? v.text}
      className={`inline-flex items-center gap-1.5 border font-body font-semibold uppercase tracking-wider ${padding} ${v.bgClass} ${v.borderClass} ${v.textClass} ${className}`.trim()}
      style={{ borderRadius: "999px", fontSize }}
    >
      <v.Icon className={iconSize} strokeWidth={1.5} aria-hidden />
      {label ?? v.text}
    </span>
  );
}

/**
 * Convenience: an in-flight chip with a slowly-pulsing dot for surfaces
 * that want a softer treatment than the `in_progress` variant.
 */
export function PulsingChip({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1.5 border border-paper-3 bg-paper-2 px-2.5 py-1 font-body font-semibold uppercase tracking-wider text-mute ${className}`.trim()}
      style={{ borderRadius: "999px", fontSize: "11px" }}
    >
      <Circle
        className="size-2.5 animate-pulse fill-mute"
        strokeWidth={0}
        aria-hidden
      />
      {label}
    </span>
  );
}
