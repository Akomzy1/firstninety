"use client";

/**
 * Per-surface offline gate. Wraps an interactive region (composer,
 * stream trigger) on a live-network surface — Coach, Situation Room,
 * Simulator — and renders a calm explanatory panel in its place when
 * `navigator.onLine === false`. Historical transcripts / persisted
 * responses still render outside the gate.
 *
 * Companion to the global OfflineBanner (which surfaces the connection
 * state app-wide). This gate disables the input *for the specific
 * thing that won't work*, with surface-specific copy.
 *
 * SSR-safe: assumes online for the initial render, then hydrates with
 * the real state.
 */
import { useEffect, useState } from "react";

import { WifiOff } from "lucide-react";

type Surface = "coach" | "situation-room" | "simulator";

const SURFACE_COPY: Record<Surface, { title: string; body: string }> = {
  coach: {
    title: "Coach needs a connection.",
    body: "Replies come from Claude over the network. Your draft will wait — type it now, send it the moment you're back online.",
  },
  "situation-room": {
    title: "This needs a connection.",
    body: "Situation Room runs each response live. The page will stay where it is; the response will start as soon as you reconnect.",
  },
  simulator: {
    title: "The Simulator needs a connection.",
    body: "Personas reply live. The transcript stays put; the next turn will go through once you're back online.",
  },
};

type OfflineGateProps = {
  surface: Surface;
  children: React.ReactNode;
};

export function OfflineGate({ surface, children }: OfflineGateProps) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline) return <>{children}</>;

  const { title, body } = SURFACE_COPY[surface];
  return (
    <div
      role="status"
      aria-live="polite"
      className="border border-paper-3 bg-paper p-5 flex flex-col gap-2 max-w-prose"
      style={{ borderRadius: "10px" }}
    >
      <span className="inline-flex items-center gap-2 text-eyebrow text-mute">
        <WifiOff className="size-3.5" strokeWidth={1.5} aria-hidden />
        Offline
      </span>
      <p className="font-display text-ink" style={{ fontSize: "20px", lineHeight: 1.3 }}>
        {title}
      </p>
      <p className="text-body-s text-mute">{body}</p>
    </div>
  );
}
