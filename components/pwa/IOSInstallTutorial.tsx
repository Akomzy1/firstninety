/**
 * iOS Safari "Add to Home Screen" walkthrough.
 *
 * iOS Safari doesn't fire beforeinstallprompt, so we manually walk users
 * through the Share → Add to Home Screen flow. Shown only when:
 *   - the device is iOS,
 *   - the user is in Safari (not in a standalone PWA already),
 *   - the user has had a meaningful interaction,
 *   - the tutorial hasn't been dismissed in the last 14 days.
 */
"use client";

import { useCallback, useEffect, useState } from "react";

import { X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  hasHadMeaningfulInteraction,
  useMeaningfulInteraction,
} from "@/lib/pwa/meaningful-interaction";
import { isIOS, isStandalone } from "@/lib/pwa/install-prompt";

const DISMISSAL_KEY = "firstninety:ios-tutorial-dismissed-at";
const COOLDOWN_DAYS = 14;

function isInCooldown(): boolean {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(DISMISSAL_KEY);
  if (!raw) return false;
  const last = new Date(raw).getTime();
  if (Number.isNaN(last)) return false;
  return Date.now() - last < COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
}

export function IOSInstallTutorial() {
  const [visible, setVisible] = useState(false);

  const maybeShow = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!isIOS()) return;
    if (isStandalone()) return;
    if (isInCooldown()) return;
    if (!hasHadMeaningfulInteraction()) return;
    setVisible(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- gating logic must run after mount; depends on browser-only state.
    maybeShow();
  }, [maybeShow]);

  useMeaningfulInteraction(maybeShow);

  function dismiss() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISSAL_KEY, new Date().toISOString());
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-paper-3 bg-paper-2 px-4 py-4 shadow-sm md:hidden"
      role="dialog"
      aria-label="Add FirstNinety to your home screen"
    >
      <div className="mx-auto flex max-w-prose items-start gap-3">
        <div className="flex-1">
          <p className="text-eyebrow">Make it an app</p>
          <p className="text-body text-ink mt-1">
            Tap{" "}
            <span className="font-medium">Share</span> in Safari, scroll to{" "}
            <span className="font-medium">Add to Home Screen</span>, then{" "}
            <span className="font-medium">Add</span>. FirstNinety lives next
            to your other apps.
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="ghost" size="sm" onClick={dismiss}>
              Got it
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-mute hover:text-ink"
        >
          <X className="size-5" strokeWidth={1.5} aria-hidden />
        </button>
      </div>
    </div>
  );
}
