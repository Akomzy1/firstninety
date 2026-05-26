/**
 * AI Coach surface handler.
 *
 * The only agentic surface in the product at MVP. Pipeline:
 *   1. Load or create the user's `coach_threads` row
 *   2. Pull the last N=20 messages from `coach_messages` for context
 *   3. Compose the system prompt via `buildCoachSystemPrompt`
 *   4. Persist the inbound user message immediately (so a partial
 *      stream still leaves a record)
 *   5. Call `streamClaudeResponse` with the registered tools
 *   6. Yield typed StreamEvents as the SDK stream comes in
 *   7. After each Claude call, if the assistant emitted tool_use
 *      blocks AND we're under the per-response budget, execute the
 *      tools and call Claude again with the tool_result blocks
 *   8. Persist the assistant message once the loop ends
 *   9. Yield the final `message_complete` with **aggregated** usage
 *      across every call in the loop
 *
 * Per MVP Spec §4.2, PRD v1.8 §9.5, SKILL.md v1.2 §8.
 */
import "server-only";

import type {
  ContentBlock,
  MessageParam,
  ToolResultBlockParam,
} from "@anthropic-ai/sdk/resources/messages";

import { createServiceClient } from "@/lib/db/service";
import { captureServerEvent } from "@/lib/tracing/posthog-server";

import { streamClaudeResponse } from "./claude";
import { COACH_MAX_TOOL_CALLS } from "./config";
import type { StreamEvent } from "./stream-types";
import {
  buildCoachSystemPrompt,
  loadCoachContext,
  type CoachContext,
} from "./system-prompt";
import {
  executeToolByName,
  PROBATION_TOOLS,
  STANDARD_TOOLS,
  type ToolContext,
} from "./tools";

const HISTORY_LIMIT = 20;

export type CoachHandlerParams = {
  userId: string;
  /**
   * Existing thread id, or null/undefined to start a fresh thread.
   * The endpoint passes `context_id` from the StreamRequest; the
   * handler treats anything that isn't a known thread id as new.
   */
  threadId: string | null;
  userMessage: string;
  /** Crisis overlay block (between safety_rules and the surface prompt). */
  crisisOverlay?: string;
};

export async function* handleCoachStream(
  params: CoachHandlerParams,
): AsyncGenerator<StreamEvent> {
  const supabase = createServiceClient();
  const coachContext = await loadCoachContext(params.userId);

  // ---- 1. Resolve / create the thread -------------------------------- //
  const { threadId, isNew, topicTitle } = await resolveThreadId(
    params.userId,
    params.threadId,
    params.userMessage,
  );

  // Fire `thread_created` BEFORE any text streams so a brand-new
  // /coach/new page can swap the URL to /coach/[threadId] without
  // dropping the user-visible message in-flight.
  if (isNew) {
    yield {
      type: "thread_created",
      thread_id: threadId,
      topic_title: topicTitle,
    };
    try {
      await captureServerEvent({
        distinctId: params.userId,
        event: "coach_thread_created",
        properties: {
          thread_id: threadId,
          probation_mode_active: coachContext.probationModeActive,
        },
      });
    } catch (err) {
      console.warn("[coach] coach_thread_created capture failed", err);
    }
  }

  // ---- 2. Load message history --------------------------------------- //
  const history = await loadThreadHistory(threadId);

  // ---- 3. Compose system prompt -------------------------------------- //
  const surfacePrompt = await buildCoachSystemPrompt(coachContext);
  const system = params.crisisOverlay
    ? `${params.crisisOverlay}\n\n${surfacePrompt}`
    : surfacePrompt;

  // When the endpoint passed a crisis overlay, stamp the thread so the
  // Conversation view renders CrisisReferral on subsequent reloads
  // (column added by migration 00006_safety_flag.sql).
  if (params.crisisOverlay) {
    await supabase
      .from("coach_threads")
      .update({ flagged_for_safety: true })
      .eq("id", threadId);
  }

  // ---- 4. Persist the user message immediately ----------------------- //
  await persistMessage({
    threadId,
    userId: params.userId,
    role: "user",
    content: params.userMessage,
  });
  try {
    await captureServerEvent({
      distinctId: params.userId,
      event: "coach_message_sent",
      properties: {
        thread_id: threadId,
        message_length: params.userMessage.length,
        probation_mode_active: coachContext.probationModeActive,
        is_new_thread: isNew,
      },
    });
  } catch (err) {
    console.warn("[coach] coach_message_sent capture failed", err);
  }

  // ---- 5–7. Tool-calling loop ---------------------------------------- //
  const messages: MessageParam[] = [
    ...history,
    { role: "user", content: params.userMessage },
  ];

  const tools = coachContext.probationModeActive
    ? PROBATION_TOOLS
    : STANDARD_TOOLS;
  const maxToolCalls = coachContext.probationModeActive
    ? COACH_MAX_TOOL_CALLS.probation_active
    : COACH_MAX_TOOL_CALLS.standard;
  const toolContext: ToolContext = {
    userId: params.userId,
    role: coachContext.role,
    currentWeek: coachContext.currentWeek,
    currentDay: coachContext.currentDay,
  };

  let toolCallsUsed = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let lastStopReason: string | null = null;
  let assistantTextBuffer = "";
  const persistedToolCalls: Array<{
    tool_use_id: string;
    name: string;
    input: unknown;
    result: unknown;
  }> = [];

  // Hard ceiling on loop iterations beyond the tool budget — paranoia
  // guard against infinite tool→tool→tool cycles.
  const MAX_LOOPS = 6;
  for (let loop = 0; loop < MAX_LOOPS; loop++) {
    const handle = await streamClaudeResponse({
      userId: params.userId,
      surface: "coach",
      system,
      messages,
      tools,
    });

    // Forward SDK events as typed StreamEvents.
    for await (const event of handle.events) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        assistantTextBuffer += event.delta.text;
        yield { type: "text_delta", text: event.delta.text };
      } else if (
        event.type === "content_block_start" &&
        event.content_block.type === "tool_use"
      ) {
        yield {
          type: "tool_use_start",
          tool_name: event.content_block.name,
          tool_use_id: event.content_block.id,
        };
      } else if (
        event.type === "content_block_delta" &&
        event.delta.type === "input_json_delta"
      ) {
        yield {
          type: "tool_use_input",
          tool_use_id: "",
          partial_json: event.delta.partial_json,
        };
      }
    }

    const finalMessage = await handle.finalize();
    totalInputTokens += finalMessage.usage.input_tokens;
    totalOutputTokens += finalMessage.usage.output_tokens;
    lastStopReason = finalMessage.stop_reason;

    // Push the assistant turn into local history so the next Claude call
    // sees its own previous tool_use blocks.
    messages.push({ role: "assistant", content: finalMessage.content });

    // Decide whether to loop or stop.
    const toolUses = finalMessage.content.filter(
      (c): c is Extract<ContentBlock, { type: "tool_use" }> =>
        c.type === "tool_use",
    );
    if (toolUses.length === 0) break;

    // Budget enforcement — if executing every requested tool would push
    // us past the per-response cap, stop and let the model finish with
    // whatever it has.
    if (toolCallsUsed + toolUses.length > maxToolCalls) {
      // Emit an error so the client knows we capped, but don't fail —
      // the assistant content already streamed is still valid.
      yield {
        type: "error",
        message: `Tool call budget exceeded (${maxToolCalls}). Stopping.`,
        recoverable: true,
      };
      break;
    }

    // Execute each tool use, emit tool_result events, accumulate the
    // tool_result blocks for the next Claude call.
    const toolResultBlocks: ToolResultBlockParam[] = [];
    for (const toolUse of toolUses) {
      toolCallsUsed++;
      let result: unknown;
      try {
        result = await executeToolByName(
          toolUse.name,
          toolUse.input,
          toolContext,
          coachContext.probationModeActive,
        );
      } catch (err) {
        console.error(`[coach] tool ${toolUse.name} threw`, err);
        result = {
          error: err instanceof Error ? err.message : "tool execution failed",
        };
      }
      yield {
        type: "tool_result",
        tool_use_id: toolUse.id,
        tool_name: toolUse.name,
        result,
      };
      persistedToolCalls.push({
        tool_use_id: toolUse.id,
        name: toolUse.name,
        input: toolUse.input,
        result,
      });
      toolResultBlocks.push({
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: JSON.stringify(result ?? null),
      });
    }

    messages.push({ role: "user", content: toolResultBlocks });
  }

  // ---- 8. Persist the assistant message ----------------------------- //
  await persistMessage({
    threadId,
    userId: params.userId,
    role: "assistant",
    content: assistantTextBuffer,
    toolCalls: persistedToolCalls.length > 0 ? persistedToolCalls : null,
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
  });

  // ---- 9. Bump thread last_message_at ------------------------------- //
  await supabase
    .from("coach_threads")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", threadId);

  // ---- 10. Aggregated message_complete ------------------------------ //
  yield {
    type: "message_complete",
    stop_reason: lastStopReason,
    input_tokens: totalInputTokens,
    output_tokens: totalOutputTokens,
  };

  // Silence unused-var lints for coachContext + supabase across the
  // long body — used above.
  void coachContext;
  void supabase;
}

// --------------------------------------------------------------------- //
// Helpers                                                               //
// --------------------------------------------------------------------- //

type ResolvedThread = {
  threadId: string;
  /** True when this call created a new row in coach_threads. */
  isNew: boolean;
  topicTitle: string;
};

async function resolveThreadId(
  userId: string,
  candidate: string | null,
  firstMessage: string,
): Promise<ResolvedThread> {
  const supabase = createServiceClient();

  if (candidate && isUuid(candidate)) {
    // Verify the thread belongs to this user. If it does, return it.
    const { data } = await supabase
      .from("coach_threads")
      .select("id, user_id, topic_title")
      .eq("id", candidate)
      .maybeSingle();
    if (data && data.user_id === userId) {
      return { threadId: data.id, isNew: false, topicTitle: data.topic_title };
    }
  }

  // Otherwise create a fresh thread with a topic title derived from
  // the first 80 chars of the user's message. Real summarisation can
  // swap in via a follow-up call later.
  const topic = (firstMessage.trim().slice(0, 80) || "New thread").replace(
    /\s+/g,
    " ",
  );
  const { data, error } = await supabase
    .from("coach_threads")
    .insert({ user_id: userId, topic_title: topic })
    .select("id, topic_title")
    .single();
  if (error || !data) {
    throw new Error(
      `Failed to create coach_thread: ${error?.message ?? "unknown"}`,
    );
  }
  return { threadId: data.id, isNew: true, topicTitle: data.topic_title };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function loadThreadHistory(threadId: string): Promise<MessageParam[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("coach_messages")
    .select("role, content")
    .eq("thread_id", threadId)
    .in("role", ["user", "assistant"])
    .order("created_at", { ascending: true })
    .limit(HISTORY_LIMIT);

  return (data ?? [])
    .map((row) => {
      if (row.role === "user" || row.role === "assistant") {
        return { role: row.role, content: row.content } as MessageParam;
      }
      return null;
    })
    .filter((m): m is MessageParam => m !== null);
}

type PersistArgs = {
  threadId: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: unknown;
  inputTokens?: number;
  outputTokens?: number;
};

async function persistMessage(args: PersistArgs): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.from("coach_messages").insert({
    thread_id: args.threadId,
    user_id: args.userId,
    role: args.role,
    content: args.content,
    tool_calls: args.toolCalls ? (args.toolCalls as never) : null,
    input_tokens: args.inputTokens ?? null,
    output_tokens: args.outputTokens ?? null,
  });
  if (error) {
    console.error("[coach] persistMessage failed", error);
  }
}

export type { CoachContext };
