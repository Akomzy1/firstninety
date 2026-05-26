/**
 * Intake surface — the signature single-oversized-input view.
 *
 * Prototype-faithful per `firstninety-situation-room.html` §State 01:
 *   - Eyebrow "Day N — Week N" at the top, dramatic whitespace below.
 *   - Three (or four when Probation Mode is active) intake-type toggles
 *     in a row above the field. Active one carries the ink underline.
 *   - One large `paper-2` textarea, 400px min-height, 12px radius,
 *     32px internal padding, room reserved bottom-right for the submit
 *     glyph. No "Submit" button.
 *   - Caption mute below the textarea + two ghost links at the foot.
 *
 * Submission goes via the `submitSituationAction` server action; on
 * success the action redirects to `/situation-room/[sessionId]`. On
 * denial (free-tier exhaustion / invalid payload) the client renders
 * a TierLimitPrompt or an inline message respectively.
 */
"use client";

import { useActionState, useState } from "react";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { TierLimitPrompt } from "@/components/billing/TierLimitPrompt";
import { OfflineGate } from "@/components/providers/OfflineGate";

import {
  submitSituationAction,
  type SituationEntryType,
  type SubmitSituationResult,
} from "./actions";

type IntakeSurfaceProps = {
  dayLabel: string;
  probationActive: boolean;
};

const TABS: ReadonlyArray<{ value: SituationEntryType; label: string }> = [
  { value: "prep", label: "I need help with this" },
  { value: "is_this_normal", label: "Is this normal?" },
  { value: "debrief", label: "I just did something" },
];

export function IntakeSurface({
  dayLabel,
  probationActive,
}: IntakeSurfaceProps) {
  const [intake, setIntake] = useState<SituationEntryType>("prep");
  const [state, action, pending] = useActionState<
    SubmitSituationResult | null,
    FormData
  >(async (_prev, formData) => submitSituationAction(formData), null);

  return (
    <section
      aria-label="Situation Room — Intake"
      className="mx-auto w-full max-w-[784px] px-4 md:px-8 py-16 md:py-24 flex flex-col min-h-[calc(100vh-4rem)]"
    >
      <div className="mb-16 md:mb-20">
        <p className="text-eyebrow text-mute-2">{dayLabel}</p>
      </div>

      <div className="flex-1 flex flex-col gap-6 justify-center">
        {/* Switcher */}
        <div
          role="tablist"
          aria-label="Intake type"
          className="flex flex-wrap items-center gap-x-1.5 gap-y-2"
        >
          {TABS.map((tab, idx) => (
            <span key={tab.value} className="inline-flex items-center gap-1.5">
              {idx > 0 ? (
                <span aria-hidden className="text-mute-2 select-none">
                  ·
                </span>
              ) : null}
              <button
                type="button"
                role="tab"
                aria-selected={intake === tab.value}
                onClick={() => setIntake(tab.value)}
                className={`bg-transparent border-0 px-2 py-1 text-body font-medium transition-colors ${
                  intake === tab.value
                    ? "text-ink underline underline-offset-8 decoration-2 decoration-ink"
                    : "text-mute hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            </span>
          ))}
          {probationActive ? (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="text-mute-2 select-none">
                ·
              </span>
              <button
                type="button"
                role="tab"
                aria-selected={intake === "probation"}
                onClick={() => setIntake("probation")}
                className={`bg-transparent border-0 px-2 py-1 text-body font-medium font-display italic transition-colors ${
                  intake === "probation"
                    ? "text-accent underline underline-offset-8 decoration-2 decoration-accent"
                    : "text-mute hover:text-ink"
                }`}
              >
                This is about my probation
              </button>
            </span>
          ) : null}
        </div>

        {/* The single oversized field */}
        <OfflineGate surface="situation-room">
        <form action={action} className="relative group" aria-busy={pending}>
          <input type="hidden" name="intake_type" value={intake} />
          <label htmlFor="sr-input" className="sr-only">
            Describe the situation
          </label>
          <textarea
            id="sr-input"
            name="body"
            placeholder="Describe what&rsquo;s happening. Anonymise as you go &mdash; call them &lsquo;my lead dev&rsquo; rather than their name."
            spellCheck
            disabled={pending}
            className="block w-full bg-paper-2 border border-paper-3 text-ink placeholder:text-mute placeholder:italic focus:outline-none focus:border-mute-2 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 resize-y disabled:opacity-70 transition-colors"
            style={{
              borderRadius: "12px",
              fontSize: "20px",
              lineHeight: 1.6,
              minHeight: "400px",
              padding: "32px 80px 80px 32px",
            }}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                (e.currentTarget.form as HTMLFormElement).requestSubmit();
              }
            }}
          />

          {/* Submit glyph — bottom-right of the field, hover-revealed kbd */}
          <div className="absolute bottom-5 right-5 flex items-center gap-2">
            <span
              aria-hidden
              className="hidden sm:inline-block font-mono text-mute-2 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity"
              style={{ fontSize: "11px", letterSpacing: "0.04em" }}
            >
              &#8984; + Enter
            </span>
            <button
              type="submit"
              aria-label="Send to FirstNinety"
              disabled={pending}
              className="inline-flex size-11 items-center justify-center text-mute-2 hover:text-ink hover:bg-paper-3 transition-colors disabled:opacity-40"
              style={{ borderRadius: "999px" }}
            >
              <ArrowRight className="size-5" strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        </form>
        </OfflineGate>

        {/* Caption */}
        <p className="text-caption text-mute max-w-prose">
          FirstNinety will reply in seconds. Anything you type is encrypted,
          deletable, and never shared.
        </p>

        {/* Denial surfaces */}
        {state && !state.ok && state.reason === "tier_limit" ? (
          <TierLimitPrompt allowance={state.allowance} variant="inline" />
        ) : null}
        {state && !state.ok && state.reason === "invalid" ? (
          <p
            role="alert"
            className="text-body-s text-danger"
          >
            {state.message}
          </p>
        ) : null}
      </div>

      {/* Ghost links at the foot */}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-paper-3">
        <Link
          href="/simulator"
          className="inline-flex items-center gap-2 text-body-s text-mute hover:text-ink transition-colors"
        >
          <span aria-hidden>&rarr;</span>
          Skip and roleplay instead
        </Link>
        <Link
          href="/situation-room/sessions"
          className="inline-flex items-center gap-2 text-body-s text-mute hover:text-ink transition-colors"
        >
          <span aria-hidden>&rarr;</span>
          Open your past sessions
        </Link>
      </div>
    </section>
  );
}
