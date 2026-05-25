/**
 * Claude AI cost tracking.
 *
 * Two pieces:
 *  1. `calculateClaudeCost(model, inputTokens, outputTokens)` — pure function
 *     that returns USD given current per-1M-token rates.
 *  2. `trackAICall(payload)` — writes a row to `ai_calls` via the service-role
 *     Supabase client AND fires a PostHog event with the same shape.
 *
 * Per PRD §10, cost-per-user is a first-class metric. Every Claude call from
 * Coach, Situation Room, Simulator, and Simulator-debrief surfaces MUST go
 * through `trackAICall` after the response completes. Stubbed callers come
 * online in Phase 3.
 */
import "server-only";

import { createServiceClient } from "@/lib/db/service";
import { captureServerEvent } from "./posthog-server";

/**
 * Per-1M-token rates in USD. Update when Anthropic changes pricing; the
 * canonical source is https://www.anthropic.com/pricing. Values below
 * reflect the published rates for the Opus 4.7 family (1M context tier
 * carries a premium) and the Haiku 4.5 family.
 *
 * Each entry is `[inputPerM, outputPerM]`.
 */
const CLAUDE_RATES_USD_PER_M_TOKENS: Record<string, [number, number]> = {
  // Opus 4.7 — standard context.
  "claude-opus-4-7": [15, 75],
  // Opus 4.7 — 1M context tier; premium pricing.
  "claude-opus-4-7[1m]": [30, 150],
  // Haiku 4.5.
  "claude-haiku-4-5": [1, 5],
  "claude-haiku-4-5-20251001": [1, 5],
};

const UNKNOWN_MODEL_FALLBACK: [number, number] = [15, 75];

export type AISurface =
  | "coach"
  | "situation_room"
  | "simulator"
  | "simulator_debrief";

export type AICallPayload = {
  user_id: string | null;
  surface: AISurface;
  model: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms?: number;
  tool_calls_count?: number;
  error?: string;
};

/**
 * Returns the cost in USD. Always returns a positive number; an unknown
 * model logs to console.warn (so the surface still records something) and
 * falls back to Opus standard rates.
 */
export function calculateClaudeCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const rate = CLAUDE_RATES_USD_PER_M_TOKENS[model];
  if (!rate) {
    console.warn(
      `[ai-cost] Unknown model "${model}" — falling back to Opus standard rates`,
    );
  }
  const [inputRate, outputRate] = rate ?? UNKNOWN_MODEL_FALLBACK;
  const inputCost = (inputTokens / 1_000_000) * inputRate;
  const outputCost = (outputTokens / 1_000_000) * outputRate;
  return roundTo(inputCost + outputCost, 6);
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Persist a Claude call to `ai_calls` and emit a PostHog event with the same
 * payload. Failures are caught and logged but never re-thrown — tracking is
 * never allowed to take the user-facing surface down.
 */
export async function trackAICall(payload: AICallPayload): Promise<void> {
  const cost_usd = calculateClaudeCost(
    payload.model,
    payload.input_tokens,
    payload.output_tokens,
  );

  const row = {
    user_id: payload.user_id,
    surface: payload.surface,
    model: payload.model,
    input_tokens: payload.input_tokens,
    output_tokens: payload.output_tokens,
    cost_usd,
    latency_ms: payload.latency_ms ?? null,
    tool_calls_count: payload.tool_calls_count ?? 0,
    error: payload.error ?? null,
  };

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("ai_calls").insert(row);
    if (error) {
      console.error("[ai-cost] ai_calls insert failed", error);
    }
  } catch (err) {
    console.error("[ai-cost] ai_calls insert threw", err);
  }

  try {
    if (payload.user_id) {
      await captureServerEvent({
        distinctId: payload.user_id,
        event: "ai_call_completed",
        properties: row,
      });
    }
  } catch (err) {
    console.error("[ai-cost] posthog capture threw", err);
  }
}
