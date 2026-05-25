/**
 * Polite notification permission prompt.
 *
 * Shown when:
 *   - Notifications are supported,
 *   - permission is currently 'default' (not granted / denied),
 *   - the user has had at least one "meaningful interaction"
 *     (mission complete, situation session, simulator run, Sunday
 *     prompt submission),
 *   - the prompt hasn't been dismissed in the last 14 days.
 *
 * Mounted once inside the (app) layout so it can listen across the app.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Bell } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  hasHadMeaningfulInteraction,
  useMeaningfulInteraction,
} from "@/lib/pwa/meaningful-interaction";
import {
  getPushPermission,
  requestPushPermission,
  subscribeToPush,
} from "@/lib/pwa/push";

const DISMISSAL_KEY = "firstninety:notification-prompt-dismissed-at";
const COOLDOWN_DAYS = 14;

function isInCooldown(): boolean {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(DISMISSAL_KEY);
  if (!raw) return false;
  const last = new Date(raw).getTime();
  if (Number.isNaN(last)) return false;
  return Date.now() - last < COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
}

export function NotificationPermissionPrompt() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [eligible, setEligible] = useState(false);
  const [pending, setPending] = useState(false);

  const maybeShow = useCallback(() => {
    if (typeof window === "undefined") return;
    if (getPushPermission() !== "default") return;
    if (isInCooldown()) return;
    if (!hasHadMeaningfulInteraction()) return;
    setEligible(true);
    dialogRef.current?.showModal();
  }, []);

  // Re-check on initial mount in case the user previously had a meaningful
  // interaction in an earlier session.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gating logic must run after mount; setState is conditional on browser state we can only read client-side.
    maybeShow();
  }, [maybeShow]);

  useMeaningfulInteraction(maybeShow);

  async function handleEnable() {
    setPending(true);
    try {
      const result = await requestPushPermission();
      if (result === "granted") {
        await subscribeToPush();
      } else {
        recordDismissal();
      }
    } finally {
      setPending(false);
      close();
    }
  }

  function handleNotNow() {
    recordDismissal();
    close();
  }

  function close() {
    dialogRef.current?.close();
    setEligible(false);
  }

  function recordDismissal() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DISMISSAL_KEY, new Date().toISOString());
  }

  if (!eligible) return null;

  return (
    <dialog
      ref={dialogRef}
      className="bg-paper text-ink border border-paper-3 p-6 max-w-md w-full mx-auto backdrop:bg-ink/40"
      style={{ borderRadius: "8px" }}
    >
      <div className="flex items-center gap-2 text-ink mb-3">
        <Bell className="size-5" strokeWidth={1.5} aria-hidden />
        <p className="text-eyebrow">Stay close to the week</p>
      </div>
      <h2 className="text-h3">Mind a small Sunday nudge?</h2>
      <p className="text-body text-mute mt-2 max-w-prose">
        A reminder of the Sunday recap; a follow-up after a Situation
        Room session; nothing else. No marketing, no &ldquo;we miss
        you&rdquo;.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="primary"
          onClick={handleEnable}
          loading={pending}
          loadingText="Subscribing…"
        >
          Yes, enable notifications
        </Button>
        <Button type="button" variant="ghost" onClick={handleNotNow}>
          Not now
        </Button>
      </div>
    </dialog>
  );
}
