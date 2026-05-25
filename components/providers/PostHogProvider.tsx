/**
 * Boots PostHog in the browser. Renders no UI — mount once in the root
 * layout so every client component can call `captureEvent` and have it
 * land in the same identified session.
 */
"use client";

import { useEffect } from "react";

import { initPostHog } from "@/lib/tracing/posthog";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return children;
}
