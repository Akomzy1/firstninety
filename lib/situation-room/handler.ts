/**
 * Situation Room surface handler.
 *
 * Single-turn Claude call per session: the user submitted their
 * opening at intake-time (in `submitSituationAction`); we load that
 * row, pick the entry-type-specific system prompt, stream Claude's
 * response, and persist the result back into the session's
 * `transcript` JSON.
 *
 * Per MVP Spec §4.3 the Situation Room is a *feature*, not an agent —
 * no tool calls. The Coach engine in `lib/coach/handler.ts` owns the
 * agentic surface.
 */
import "server-only";

import { createServiceClient } from "@/lib/db/service";
import { streamClaudeResponse } from "@/lib/coach/claude";
import { loadCoachPromptBody } from "@/lib/content/loaders";
import { sdkStreamToTypedEvents } from "@/lib/coach/stream-bridge";
import type { StreamEvent } from "@/lib/coach/stream-types";
import {
  buildCoachSystemPrompt,
  loadCoachContext,
} from "@/lib/coach/system-prompt";

export type SituationHandlerParams = {
  userId: string;
  /** `context_id` from the streaming endpoint — the session row id. */
  sessionId: string;
  /** UI entry type ("probation" falls back to is_this_normal in DB). */
  entryType?: "prep" | "is_this_normal" | "debrief" | "probation";
  crisisOverlay?: string;
};

const PROMPT_FILE: Record<
  "prep" | "is_this_normal" | "debrief" | "probation",
  string
> = {
  prep: "situation-prep",
  is_this_normal: "situation-normal",
  debrief: "situation-debrief",
  probation: "situation-probation",
};

export async function* handleSituationStream(
  params: SituationHandlerParams,
): AsyncGenerator<StreamEvent> {
  const supabase = createServiceClient();

  // ----- 1. Load the session row ------------------------------------ //
  const { data: session, error: sessionErr } = await supabase
    .from("situation_sessions")
    .select(
      "id, user_id, entry_type, situation_summary, transcript",
    )
    .eq("id", params.sessionId)
    .maybeSingle();

  if (sessionErr || !session) {
    yield {
      type: "error",
      message: "We couldn't find that Situation Room session.",
      recoverable: false,
    };
    return;
  }
  if (session.user_id !== params.userId) {
    yield {
      type: "error",
      message: "That session belongs to a different account.",
      recoverable: false,
    };
    return;
  }

  // If the Coach response is already persisted, do not re-bill the
  // user — yield a synthetic message_complete so the client falls
  // through to the persisted-render path.
  const transcript = (session.transcript ?? {}) as Record<string, unknown>;
  const existing = transcript.coach_response as
    | { content?: string }
    | undefined;
  if (existing?.content && existing.content.length > 0) {
    yield { type: "text_delta", text: existing.content };
    yield {
      type: "message_complete",
      stop_reason: "end_turn",
      input_tokens: 0,
      output_tokens: 0,
    };
    return;
  }

  // ----- 2. Build the system prompt --------------------------------- //
  const uiEntry =
    params.entryType ??
    (typeof transcript.ui_entry_type === "string"
      ? (transcript.ui_entry_type as
          | "prep"
          | "is_this_normal"
          | "debrief"
          | "probation")
      : session.entry_type);

  const [coachContext, modeBlock] = await Promise.all([
    loadCoachContext(params.userId),
    loadCoachPromptBody(PROMPT_FILE[uiEntry] ?? "situation-normal"),
  ]);
  const coachSurfacePrompt = await buildCoachSystemPrompt(coachContext);

  // Mode-specific overlay sits BETWEEN the core voice/role/context
  // block and any crisis overlay supplied by the endpoint.
  const baseSystemPrompt = `${coachSurfacePrompt}\n\n---\n\n${modeBlock}`;
  const systemPrompt = params.crisisOverlay
    ? `${params.crisisOverlay}\n\n${baseSystemPrompt}`
    : baseSystemPrompt;

  // ----- 3. Stream Claude ------------------------------------------- //
  const userPrompt = String(transcript.opening ?? session.situation_summary);
  const handle = await streamClaudeResponse({
    userId: params.userId,
    surface: "situation_room",
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  let assistantText = "";
  // Re-emit text deltas as we go so we can also accumulate them for
  // persistence; everything else passes through unchanged.
  for await (const event of sdkStreamToTypedEvents(handle)) {
    if (event.type === "text_delta") assistantText += event.text;
    yield event;
  }

  // ----- 4. Persist back into transcript ---------------------------- //
  const nextTranscript = {
    ...transcript,
    coach_response: {
      content: assistantText,
      generated_at: new Date().toISOString(),
    },
  };
  const { error: updateErr } = await supabase
    .from("situation_sessions")
    .update({ transcript: nextTranscript })
    .eq("id", params.sessionId);
  if (updateErr) {
    console.error("[situation-room] persist transcript failed", updateErr);
  }
}
