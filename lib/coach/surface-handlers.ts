/**
 * Surface dispatcher — maps a StreamRequest to an `AsyncIterable<StreamEvent>`.
 *
 * Coach gets the real engine from `lib/coach/handler.ts` (with tool
 * loop + thread persistence). Other surfaces still throw
 * `HandlerNotImplementedError` until their respective Phase-3 prompts
 * land:
 *
 *   - 3.7  Situation Room handler
 *   - 3.10 Simulator persona handler
 *   - 3.11 Simulator debrief handler
 *   - 3.14 Probation Brief generator
 *
 * The endpoint just forwards `StreamEvent`s — each handler owns its own
 * translation from SDK events to our typed protocol, so the endpoint
 * never touches the Anthropic SDK directly.
 */
import "server-only";

import { handleSituationStream } from "@/lib/situation-room/handler";
import { handleSimulatorStream } from "@/lib/simulator/handler";

import { handleCoachStream } from "./handler";
import type { StreamEvent, StreamRequest } from "./stream-types";

export class HandlerNotImplementedError extends Error {
  constructor(surface: StreamRequest["surface"]) {
    super(
      `The "${surface}" surface handler is not implemented yet — lands in a later Phase 3 prompt.`,
    );
    this.name = "HandlerNotImplementedError";
  }
}

export type DispatchOptions = {
  /**
   * Crisis overlay block (e.g. <crisis_overlay>…</crisis_overlay>) to
   * prepend BETWEEN the safety_rules block (added by the wrapper) and
   * the surface-specific system prompt. Populated by the streaming
   * endpoint when `runPreFlightChecks` reports a crisis category.
   */
  crisisOverlay?: string;
};

export function dispatchSurface(
  req: StreamRequest,
  userId: string,
  options: DispatchOptions = {},
): AsyncIterable<StreamEvent> {
  if (req.surface === "coach") {
    const userMessage = req.user_message?.trim();
    if (!userMessage) {
      throw new Error("user_message is required for the Coach surface.");
    }
    return handleCoachStream({
      userId,
      threadId: req.context_id || null,
      userMessage,
      crisisOverlay: options.crisisOverlay,
    });
  }

  if (req.surface === "situation_room") {
    if (!req.context_id) {
      throw new Error("context_id (session id) is required for situation_room.");
    }
    return handleSituationStream({
      userId,
      sessionId: req.context_id,
      entryType: req.entry_type,
      crisisOverlay: options.crisisOverlay,
    });
  }

  if (req.surface === "simulator_persona") {
    if (!req.context_id) {
      throw new Error("context_id (run id) is required for simulator_persona.");
    }
    const userMessage = req.user_message?.trim();
    if (!userMessage) {
      throw new Error("user_message is required for simulator_persona.");
    }
    return handleSimulatorStream({
      userId,
      runId: req.context_id,
      userMessage,
      crisisOverlay: options.crisisOverlay,
    });
  }

  // The remaining surfaces ship their real handlers in subsequent prompts.
  throw new HandlerNotImplementedError(req.surface);
}
