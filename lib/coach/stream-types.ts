/**
 * Shared SSE event protocol for /api/claude/stream.
 *
 * The endpoint emits these events; the client `useClaudeStream` hook
 * parses them and surfaces the typed union to React components. Both
 * sides import from this file so adding an event variant is a single
 * edit.
 *
 * Per MVP Spec §4.5 (streaming protocol).
 */

import type { TierAllowance } from "@/lib/billing/tier-types";
import type { CrisisCategory, PIIType } from "@/lib/safety/checks";

export type StreamSurface =
  | "coach"
  | "situation_room"
  | "simulator_persona"
  | "simulator_debrief"
  | "probation_brief";

export type StreamRequest = {
  surface: StreamSurface;
  /** thread_id, session_id, run_id, or user_id depending on surface. */
  context_id: string;
  /** Free-text message from the user. Optional for first turn of a new thread. */
  user_message?: string;
  /** Required for simulator surfaces. */
  scenario_id?: string;
  /** Required for situation_room surface. */
  entry_type?: "prep" | "is_this_normal" | "debrief" | "probation";
};

// --------------------------------------------------------------------- //
// Event union                                                           //
// --------------------------------------------------------------------- //

export type StreamEvent =
  | { type: "text_delta"; text: string }
  | { type: "tool_use_start"; tool_name: string; tool_use_id: string }
  | { type: "tool_use_input"; tool_use_id: string; partial_json: string }
  | {
      type: "tool_result";
      tool_use_id: string;
      tool_name: string;
      result: unknown;
    }
  | {
      type: "message_complete";
      stop_reason: string | null;
      input_tokens: number;
      output_tokens: number;
    }
  | {
      type: "scenario_end";
      run_id: string;
      turns: number;
      outcome?: "end_success" | "end_yellow" | "end_red" | "abandoned";
    }
  | {
      type: "persona_turn_start";
      /** Persona name from the scenario row (or "You" for the user echo). */
      speaker_name: string;
      /** Two-letter monogram + persona palette colour for the UI to render. */
      monogram: string;
      colour: string;
    }
  | {
      type: "thread_created";
      /** Newly-created `coach_threads.id` — fires once, before any text. */
      thread_id: string;
      topic_title: string;
    }
  | {
      type: "tier_limit";
      /** Full denial payload from checkTierAllowance. */
      allowance: Exclude<TierAllowance, { allowed: true }>;
    }
  | {
      type: "safety_advisory_pii";
      /** Soft advisory; the message still sends. UI prompts to anonymise. */
      pii_types: PIIType[];
    }
  | {
      type: "safety_advisory_names";
      /** Likely-real-name tokens found near a role indicator. */
      matches: string[];
    }
  | {
      type: "safety_crisis_flagged";
      category: CrisisCategory;
    }
  | { type: "error"; message: string; recoverable?: boolean };

export type StreamEventType = StreamEvent["type"];

// --------------------------------------------------------------------- //
// Server-side helper: format an event as an SSE frame                   //
// --------------------------------------------------------------------- //

/**
 * Encode a typed event as a single SSE frame. `event:` is the type;
 * `data:` is the rest of the event JSON-encoded (the `type` field is
 * stripped because the SSE event name already carries it — keeps the
 * wire smaller).
 */
export function encodeSSEFrame(event: StreamEvent): string {
  const { type, ...rest } = event as StreamEvent & { type: string };
  const dataJson = JSON.stringify(rest);
  return `event: ${type}\ndata: ${dataJson}\n\n`;
}

// --------------------------------------------------------------------- //
// Client-side helper: parse a single SSE frame                          //
// --------------------------------------------------------------------- //

/**
 * Parses a single SSE message into a typed `StreamEvent`. Throws if the
 * frame is malformed (caller usually swallows and emits an error event).
 *
 * Expects the canonical two-line frame: `event: <type>\ndata: <json>`.
 * Comments (`: …`) and unrelated SSE fields are ignored.
 */
export function parseSSEMessage(rawFrame: string): StreamEvent | null {
  let eventType: StreamEventType | null = null;
  let dataLine = "";
  for (const line of rawFrame.split("\n")) {
    if (line.startsWith(":")) continue;
    if (line.startsWith("event:")) {
      eventType = line.slice(6).trim() as StreamEventType;
    } else if (line.startsWith("data:")) {
      dataLine = line.slice(5).trim();
    }
  }
  if (!eventType) return null;
  let payload: Record<string, unknown> = {};
  if (dataLine) {
    try {
      payload = JSON.parse(dataLine) as Record<string, unknown>;
    } catch {
      throw new Error(`Malformed SSE data payload for event "${eventType}"`);
    }
  }
  return { type: eventType, ...payload } as StreamEvent;
}
