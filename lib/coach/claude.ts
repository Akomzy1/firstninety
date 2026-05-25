/**
 * Canonical Claude client + streaming wrapper.
 *
 * Every AI surface in the product goes through this file. Two entry
 * points:
 *
 *   - `streamClaudeResponse(params)` — SSE streaming. Used by Coach,
 *     Situation Room, Simulator persona turns. Returns the SDK's stream
 *     iterator + a `finalize()` Promise that resolves once the stream
 *     ends, the cost tracker has fired, and the circuit-breaker count
 *     has incremented.
 *
 *   - `nonStreamClaudeCall(params)` — one-shot. Used by Simulator
 *     debrief, Probation Brief generation, and any other surface that
 *     needs the full response before rendering.
 *
 * Both entry points:
 *   1. Prepend the safety system block (see content/coach-prompts/safety.md).
 *   2. Check circuit limits in `ai_calls` for the last hour; throw
 *      `ClaudeRateLimitError` if exceeded.
 *   3. After completion, call `trackAICall` from lib/tracing/ai-cost
 *      with usage data + latency.
 */
import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import Anthropic from "@anthropic-ai/sdk";
import type {
  Message,
  MessageParam,
  Tool,
  ToolChoice,
} from "@anthropic-ai/sdk/resources/messages";

import { createServiceClient } from "@/lib/db/service";
import {
  trackAICall,
  type AICallPayload,
  type AISurface,
} from "@/lib/tracing/ai-cost";

import {
  CIRCUIT_LIMITS,
  ClaudeConfigError,
  ClaudeRateLimitError,
  SURFACE_DEFAULTS,
  type ClaudeModel,
} from "./config";

// --------------------------------------------------------------------- //
// Client factory                                                        //
// --------------------------------------------------------------------- //

let cachedClient: Anthropic | null = null;

export function createClaudeClient(): Anthropic {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new ClaudeConfigError(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local before calling Claude.",
    );
  }
  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

// --------------------------------------------------------------------- //
// Safety prompt                                                         //
// --------------------------------------------------------------------- //

let cachedSafetyBlock: string | null = null;

async function getSafetyBlock(): Promise<string> {
  if (cachedSafetyBlock) return cachedSafetyBlock;
  const path = join(process.cwd(), "content", "coach-prompts", "safety.md");
  const raw = await readFile(path, "utf8");
  // Strip the leading HTML comment header authors use to document the
  // file — the model doesn't need it.
  const stripped = raw.replace(/^<!--[\s\S]*?-->\s*/m, "").trim();
  cachedSafetyBlock = `<safety_rules>\n${stripped}\n</safety_rules>`;
  return cachedSafetyBlock;
}

/**
 * Prepend the safety block to the surface-specific system prompt. The
 * caller passes the raw, voice-specific prompt; this function returns
 * `<safety_rules>…</safety_rules>\n\n<surface prompt>`.
 *
 * Exported for tests and for ad-hoc dev scripts; the streaming + non-
 * streaming entry points call it for you.
 */
export async function buildSystemPrompt(
  surfacePrompt: string,
): Promise<string> {
  const safety = await getSafetyBlock();
  return `${safety}\n\n${surfacePrompt.trim()}`;
}

// --------------------------------------------------------------------- //
// Circuit breaker                                                       //
// --------------------------------------------------------------------- //

async function assertWithinCircuit(userId: string | null): Promise<void> {
  const supabase = createServiceClient();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  // Per-user — only checked when we have a user id (system-driven calls
  // skip this and rely on the global cap).
  if (userId) {
    const { count, error } = await supabase
      .from("ai_calls")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", since);
    if (error) {
      console.error("[claude] circuit-check user query failed", error);
    } else if ((count ?? 0) >= CIRCUIT_LIMITS.perUserPerHour) {
      throw new ClaudeRateLimitError(
        "user",
        CIRCUIT_LIMITS.perUserPerHour,
        count ?? 0,
      );
    }
  }

  // Global — runs on every call. Cheap because `ai_calls` is indexed on
  // `created_at`.
  const { count: globalCount, error: globalErr } = await supabase
    .from("ai_calls")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);
  if (globalErr) {
    console.error("[claude] circuit-check global query failed", globalErr);
  } else if ((globalCount ?? 0) >= CIRCUIT_LIMITS.globalPerHour) {
    throw new ClaudeRateLimitError(
      "global",
      CIRCUIT_LIMITS.globalPerHour,
      globalCount ?? 0,
    );
  }
}

// --------------------------------------------------------------------- //
// Streaming                                                             //
// --------------------------------------------------------------------- //

export type ClaudeStreamParams = {
  userId: string | null;
  surface: AISurface;
  /** Raw, voice-specific system prompt. Safety rules will be prepended. */
  system: string;
  messages: MessageParam[];
  /** Optional tool list. Only the Coach surface ships tools at MVP. */
  tools?: Tool[];
  toolChoice?: ToolChoice;
  /** Override per-surface defaults if needed (rare). */
  model?: ClaudeModel;
  maxTokens?: number;
  temperature?: number;
};

export type ClaudeStreamHandle = {
  /**
   * Async iterator of SDK stream events. Caller pipes these to the
   * client (typically over SSE).
   */
  events: AsyncIterable<Anthropic.MessageStreamEvent>;
  /**
   * Resolves once the stream completes, `trackAICall` has fired, and
   * any post-stream bookkeeping is done. Resolves to the final assembled
   * `Message` so callers can persist tool calls / final text.
   */
  finalize: () => Promise<Message>;
};

export async function streamClaudeResponse(
  params: ClaudeStreamParams,
): Promise<ClaudeStreamHandle> {
  await assertWithinCircuit(params.userId);

  const surfaceDefaults = SURFACE_DEFAULTS[params.surface];
  const model = params.model ?? surfaceDefaults.model;
  const maxTokens = params.maxTokens ?? surfaceDefaults.maxTokens;
  // `temperature` is deprecated on the Claude 4.x family. We keep it on
  // the params + config so callers can supply intent, but only forward
  // it for legacy models that still accept it (none at MVP).
  const temperature = params.temperature ?? surfaceDefaults.temperature;
  void temperature;

  const system = await buildSystemPrompt(params.system);
  const client = createClaudeClient();
  const startedAt = Date.now();

  const stream = client.messages.stream({
    model,
    system,
    messages: params.messages,
    max_tokens: maxTokens,
    ...(params.tools ? { tools: params.tools } : {}),
    ...(params.toolChoice ? { tool_choice: params.toolChoice } : {}),
  });

  let finalized = false;
  let finalMessage: Message | null = null;

  const finalize = async (): Promise<Message> => {
    if (finalized && finalMessage) return finalMessage;
    finalized = true;
    finalMessage = await stream.finalMessage();
    const latencyMs = Date.now() - startedAt;
    const usage = finalMessage.usage;
    const toolCallsCount = finalMessage.content.filter(
      (c) => c.type === "tool_use",
    ).length;
    const payload: AICallPayload = {
      user_id: params.userId,
      surface: params.surface,
      model,
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      latency_ms: latencyMs,
      tool_calls_count: toolCallsCount,
    };
    await trackAICall(payload);
    return finalMessage;
  };

  return {
    events: stream as AsyncIterable<Anthropic.MessageStreamEvent>,
    finalize,
  };
}

// --------------------------------------------------------------------- //
// Non-streaming                                                         //
// --------------------------------------------------------------------- //

export type ClaudeOneShotParams = Omit<ClaudeStreamParams, "tools" | "toolChoice">;

export async function nonStreamClaudeCall(
  params: ClaudeOneShotParams,
): Promise<Message> {
  await assertWithinCircuit(params.userId);

  const surfaceDefaults = SURFACE_DEFAULTS[params.surface];
  const model = params.model ?? surfaceDefaults.model;
  const maxTokens = params.maxTokens ?? surfaceDefaults.maxTokens;
  const temperature = params.temperature ?? surfaceDefaults.temperature;
  void temperature; // deprecated on Claude 4.x; see streamClaudeResponse.

  const system = await buildSystemPrompt(params.system);
  const client = createClaudeClient();
  const startedAt = Date.now();

  let response: Message;
  try {
    response = await client.messages.create({
      model,
      system,
      messages: params.messages,
      max_tokens: maxTokens,
    });
  } catch (err) {
    await trackAICall({
      user_id: params.userId,
      surface: params.surface,
      model,
      input_tokens: 0,
      output_tokens: 0,
      latency_ms: Date.now() - startedAt,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }

  await trackAICall({
    user_id: params.userId,
    surface: params.surface,
    model,
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
    latency_ms: Date.now() - startedAt,
    tool_calls_count: 0,
  });

  return response;
}
