"use client";

/**
 * Renders a thin paper-2 banner at the top of the app shell when the
 * browser reports `navigator.onLine === false`. Auto-dismisses when
 * the connection returns. User can also dismiss explicitly; the
 * dismissal is per-session and re-shows on the next online→offline
 * transition.
 *
 * Mounted at the top of (app)/layout.tsx. SSR-safe: initial render
 * assumes online (most users), then hydrates with the real state.
 */
import { useEffect, useState } from "react";

import { WifiOff, X } from "lucide-react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", () => {
      setOffline(false);
      setDismissed(false);
    });
    window.addEventListener("offline", () => {
      setOffline(true);
      setDismissed(false);
    });
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-paper-2 border-b border-paper-3 px-4 py-2 flex items-center justify-between gap-3 text-body-s text-mute"
    >
      <span className="inline-flex items-center gap-2">
        <WifiOff className="size-3.5" strokeWidth={1.5} aria-hidden />
        You&rsquo;re offline. Some features are unavailable until you
        reconnect.
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-mute hover:text-ink transition-colors"
        aria-label="Dismiss"
      >
        <X className="size-3.5" strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  );
}
