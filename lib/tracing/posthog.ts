/**
 * PostHog client integration.
 *
 * Browser-side singleton that boots on first import in a client component.
 * Server-side init lives in `posthog-server.ts` and uses the Node SDK.
 *
 * Disabled in dev unless `NEXT_PUBLIC_POSTHOG_ENABLED_DEV=true` so local
 * exploration doesn't poison production analytics.
 */
"use client";

import posthog from "posthog-js";

let initialised = false;

function isDev() {
  if (typeof process === "undefined") return false;
  return process.env.NODE_ENV !== "production";
}

export function initPostHog() {
  if (typeof window === "undefined") return;
  if (initialised) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  const enabledInDev = process.env.NEXT_PUBLIC_POSTHOG_ENABLED_DEV === "true";

  if (!key || !host) return;
  if (isDev() && !enabledInDev) return;

  posthog.init(key, {
    api_host: host,
    capture_pageview: "history_change",
    capture_pageleave: true,
    capture_exceptions: true,
    autocapture: false,
    person_profiles: "identified_only",
    persistence: "localStorage+cookie",
    disable_session_recording: true,
  });

  initialised = true;
}

export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  if (!initialised) return;
  posthog.identify(userId, properties);
}

export function resetIdentity() {
  if (typeof window === "undefined") return;
  if (!initialised) return;
  posthog.reset();
}

export function captureEvent(
  name: string,
  properties?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  if (!initialised) return;
  posthog.capture(name, properties);
}

export { posthog };
