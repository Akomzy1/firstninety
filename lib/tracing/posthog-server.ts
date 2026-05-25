/**
 * PostHog server-side client. Single shared instance per Node process.
 *
 * Used by `trackAICall` (lib/tracing/ai-cost.ts) and any other server-side
 * surface that needs to emit events outside the browser. Server-side
 * captures bypass the dev-disable flag — server events only fire when code
 * paths run that wouldn't run in casual dev exploration anyway (cron jobs,
 * AI call completions, webhook handlers).
 */
import "server-only";

import { PostHog } from "posthog-node";

let client: PostHog | null = null;

export function getPostHogServer(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!key || !host) return null;

  if (!client) {
    client = new PostHog(key, {
      host,
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return client;
}

export async function captureServerEvent(payload: {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}) {
  const ph = getPostHogServer();
  if (!ph) return;
  ph.capture({
    distinctId: payload.distinctId,
    event: payload.event,
    properties: payload.properties,
  });
  await ph.flush();
}
