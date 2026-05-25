/**
 * "Meaningful interaction" event bus.
 *
 * The notification permission prompt and the iOS install tutorial both
 * wait for this signal before showing themselves (per MVP Spec §5.5).
 * Phase 1.5's Coach / Situation Room / Simulator surfaces dispatch this
 * event when their flows complete; consumers listen via the
 * `useMeaningfulInteraction` hook below.
 */
"use client";

import { useEffect } from "react";

export const MEANINGFUL_INTERACTION_EVENT = "firstninety:meaningful-interaction";
export const MEANINGFUL_INTERACTION_FLAG = "firstninety:has-had-meaningful-interaction";

export type MeaningfulInteractionKind =
  | "mission_completed"
  | "situation_session_completed"
  | "simulator_run_completed"
  | "sunday_prompt_submitted";

/**
 * Fire from a client component whose action constitutes a meaningful
 * interaction. Sets a localStorage flag so future page loads know we've
 * already had one.
 */
export function dispatchMeaningfulInteraction(kind: MeaningfulInteractionKind) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MEANINGFUL_INTERACTION_FLAG, "true");
  } catch {
    /* localStorage may be unavailable (private mode); harmless */
  }
  window.dispatchEvent(
    new CustomEvent(MEANINGFUL_INTERACTION_EVENT, { detail: { kind } }),
  );
}

export function hasHadMeaningfulInteraction(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MEANINGFUL_INTERACTION_FLAG) === "true";
  } catch {
    return false;
  }
}

export function useMeaningfulInteraction(
  callback: (kind: MeaningfulInteractionKind) => void,
) {
  useEffect(() => {
    function handler(event: Event) {
      const detail = (event as CustomEvent<{ kind: MeaningfulInteractionKind }>)
        .detail;
      if (detail?.kind) callback(detail.kind);
    }
    window.addEventListener(MEANINGFUL_INTERACTION_EVENT, handler);
    return () => window.removeEventListener(MEANINGFUL_INTERACTION_EVENT, handler);
  }, [callback]);
}
