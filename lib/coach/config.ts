/**
 * Claude infrastructure config.
 *
 * Centralises the model IDs, per-surface defaults, and circuit-breaker
 * limits used by lib/coach/claude.ts. Keeping the values here so they
 * can be tuned in one place (and so tests can override).
 *
 * Per PRD §9.5: the Coach is the only lightly-agentic surface; tool
 * calls cap at 3 (or 4 when Probation Mode is active). The other AI
 * surfaces (Situation Room, Simulator, debrief, Probation Brief) are
 * features — single-call or streamed-with-no-tools.
 */
import "server-only";

import type { AISurface } from "@/lib/tracing/ai-cost";

/** Canonical model IDs. Kept in sync with .env.example. */
export const MODEL_OPUS = (process.env.CLAUDE_OPUS_MODEL ?? "claude-opus-4-7") as
  | "claude-opus-4-7"
  | "claude-opus-4-7[1m]";
export const MODEL_HAIKU = (process.env.CLAUDE_HAIKU_MODEL ?? "claude-haiku-4-5-20251001") as
  | "claude-haiku-4-5"
  | "claude-haiku-4-5-20251001";

export type ClaudeModel =
  | "claude-opus-4-7"
  | "claude-opus-4-7[1m]"
  | "claude-haiku-4-5"
  | "claude-haiku-4-5-20251001";

/**
 * Per-1M-token rates in USD. Sourced from anthropic.com/pricing. The
 * cost tracker in lib/tracing/ai-cost.ts owns the canonical copy; we
 * mirror them here so per-surface budget logic stays self-contained.
 */
export const TOKEN_RATES_USD_PER_M: Record<ClaudeModel, [number, number]> = {
  "claude-opus-4-7": [15, 75],
  "claude-opus-4-7[1m]": [30, 150],
  "claude-haiku-4-5": [1, 5],
  "claude-haiku-4-5-20251001": [1, 5],
};

/**
 * Circuit-breaker limits per user.
 *
 * `perUserPerHour` is the hard ceiling — once exceeded, the client
 * throws `ClaudeRateLimitError` *before* a call hits Anthropic. Tier
 * enforcement (Prompt 3.2) sits on top of this as a softer
 * weekly-budget gate; this circuit is the cost-runaway protection.
 */
export const CIRCUIT_LIMITS = {
  perUserPerHour: 60,
  /** Global cap across all users in an hour. Tripped → 503 for everyone. */
  globalPerHour: 6_000,
} as const;

/**
 * Per-surface streaming defaults. Each surface tunes these to its own
 * voice: Coach is exploratory and runs longer; Situation Room is short,
 * tight, and warm; Simulator personas reply in a single beat at a time.
 */
export type SurfaceDefaults = {
  model: ClaudeModel;
  /** Max output tokens. Hard cap; the wrapper will pass it through. */
  maxTokens: number;
  /** Sampling temperature. */
  temperature: number;
};

export const SURFACE_DEFAULTS: Record<AISurface, SurfaceDefaults> = {
  coach: {
    model: MODEL_OPUS,
    maxTokens: 1_600,
    temperature: 0.7,
  },
  situation_room: {
    model: MODEL_OPUS,
    maxTokens: 900,
    temperature: 0.7,
  },
  simulator: {
    // Simulator-persona turns are short and in-character; Haiku is
    // calibrated enough at low cost. Opus only for the orchestrator on
    // probation scenarios (handled in Prompt 3.10 via override).
    model: MODEL_HAIKU,
    maxTokens: 600,
    temperature: 0.85,
  },
  simulator_debrief: {
    // Debrief is the differentiator — full Opus, longer output.
    model: MODEL_OPUS,
    maxTokens: 1_400,
    temperature: 0.6,
  },
};

/**
 * Maximum tool calls the Coach can chain in a single response. Bumps to
 * 4 when Probation Mode is active (the conditional `get_probation_evidence`
 * tool registers).
 */
export const COACH_MAX_TOOL_CALLS = {
  standard: 3,
  probation_active: 4,
} as const;

export class ClaudeRateLimitError extends Error {
  constructor(
    public readonly scope: "user" | "global",
    public readonly limit: number,
    public readonly used: number,
  ) {
    super(
      `Claude rate limit (${scope}) reached: used ${used} of ${limit} in the last hour.`,
    );
    this.name = "ClaudeRateLimitError";
  }
}

export class ClaudeConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClaudeConfigError";
  }
}
