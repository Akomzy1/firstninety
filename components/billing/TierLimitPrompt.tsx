/**
 * TierLimitPrompt — surfaces when a free-tier user hits a quota.
 *
 * Two variants:
 *   `inline`  — renders as a paper-2 card inside the page flow. Use this
 *               when the limit is hit during a task (e.g. inside the
 *               Coach composer after submit).
 *   `modal`   — renders as a centred dialog over an ink-tinted backdrop.
 *               Use this when the limit is hit at entry-time (e.g. user
 *               opens /simulator/[slug] and clicks Begin).
 *
 * Copy comes from `tierDenialCopy()` in lib/billing/tier.ts; the UI is
 * intentionally quiet. No exclamation marks, no "supercharge!" energy.
 */
import Link from "next/link";

import { ArrowRight } from "lucide-react";

import {
  tierDenialCopy,
  type TierAllowance,
} from "@/lib/billing/tier-types";

type Denial = Exclude<TierAllowance, { allowed: true }>;

type TierLimitPromptProps = {
  allowance: Denial;
  /** Inline card by default; modal overlays the page. */
  variant?: "inline" | "modal";
  /** Modal close handler (only meaningful when variant === "modal"). */
  onClose?: () => void;
  className?: string;
};

export function TierLimitPrompt({
  allowance,
  variant = "inline",
  onClose,
  className = "",
}: TierLimitPromptProps) {
  const copy = tierDenialCopy(allowance);

  const card = (
    <section
      role="alertdialog"
      aria-live="polite"
      aria-labelledby="tier-limit-title"
      className={`flex flex-col gap-3 border border-paper-3 bg-paper-2 p-5 md:p-6 max-w-prose ${className}`.trim()}
      style={{ borderRadius: "10px" }}
    >
      <p className="text-eyebrow inline-flex items-center gap-2">
        <span aria-hidden className="block size-1.5 rounded-full bg-mute" />
        {allowance.used} of {allowance.limit} used
      </p>
      <h3
        id="tier-limit-title"
        className="font-display font-normal text-ink text-balance"
        style={{ fontSize: "22px", lineHeight: 1.3 }}
      >
        {copy.title}
      </h3>
      <p className="text-body text-mute max-w-prose">{copy.body}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Link
          href={allowance.upgrade_url}
          className="inline-flex h-10 items-center justify-center gap-2 bg-ink text-paper px-4 text-body-s font-medium transition-opacity hover:opacity-90"
          style={{ borderRadius: "4px" }}
        >
          {copy.cta}
          <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden />
        </Link>
        {variant === "modal" && onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="text-body-s text-mute hover:text-ink transition-colors"
          >
            Not now
          </button>
        ) : null}
      </div>
    </section>
  );

  if (variant === "inline") return card;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <div className="relative w-full max-w-md">{card}</div>
    </div>
  );
}
