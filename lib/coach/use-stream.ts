"use client";

/**
 * `useClaudeStream` — React hook that opens an SSE connection to
 * `/api/claude/stream` via `fetch` (browsers' EventSource doesn't
 * support POST + JSON body, so we hand-roll the SSE parser).
 *
 * State surface:
 *   - `events`      — the full ordered event log (rendering accumulates
 *                     from this; text_delta events concatenate into the
 *                     visible message).
 *   - `text`        — convenience: concatenated text_delta payloads.
 *   - `isStreaming` — true between startStream() and the final event.
 *   - `error`       — last surfaced error event payload (or null).
 *   - `tierLimit`   — populated if the server emitted tier_limit.
 *   - `startStream(req)` — opens the connection. If a stream is already
 *                     running, it is aborted first.
 *   - `stopStream()` — aborts the in-flight stream.
 *
 * Reconnection: a single automatic retry on transient network errors
 * after a short backoff. Persistent failures (rate limit, config,
 * handler-not-implemented) are surfaced via `error` without retry.
 */
import { useCallback, useMemo, useRef, useState } from "react";

import {
  parseSSEMessage,
  type StreamEvent,
  type StreamRequest,
} from "./stream-types";

type TierLimitEvent = Extract<StreamEvent, { type: "tier_limit" }>;
type ErrorEvent = Extract<StreamEvent, { type: "error" }>;
type PIIAdvisoryEvent = Extract<StreamEvent, { type: "safety_advisory_pii" }>;
type NamesAdvisoryEvent = Extract<
  StreamEvent,
  { type: "safety_advisory_names" }
>;
type CrisisFlagEvent = Extract<
  StreamEvent,
  { type: "safety_crisis_flagged" }
>;
type ThreadCreatedEvent = Extract<StreamEvent, { type: "thread_created" }>;
type ToolUseStartEvent = Extract<StreamEvent, { type: "tool_use_start" }>;

export type UseClaudeStreamState = {
  events: StreamEvent[];
  text: string;
  isStreaming: boolean;
  error: ErrorEvent | null;
  tierLimit: TierLimitEvent | null;
  /** Latest PII advisory, if any. Cleared on resetStream. */
  piiAdvisory: PIIAdvisoryEvent | null;
  /** Latest real-name advisory, if any. */
  namesAdvisory: NamesAdvisoryEvent | null;
  /** Set once the server has flagged the message for safety. */
  crisisFlag: CrisisFlagEvent | null;
  /** Fires once when the server creates a fresh Coach thread. */
  threadCreated: ThreadCreatedEvent | null;
  /** Tool-use blocks currently in-flight (not yet resolved). */
  toolsInFlight: ToolUseStartEvent[];
  isComplete: boolean;
};

export type UseClaudeStream = UseClaudeStreamState & {
  startStream: (req: StreamRequest) => Promise<void>;
  stopStream: () => void;
  resetStream: () => void;
};

const INITIAL_STATE: UseClaudeStreamState = {
  events: [],
  text: "",
  isStreaming: false,
  error: null,
  tierLimit: null,
  piiAdvisory: null,
  namesAdvisory: null,
  crisisFlag: null,
  threadCreated: null,
  toolsInFlight: [],
  isComplete: false,
};

export function useClaudeStream(): UseClaudeStream {
  const [state, setState] = useState<UseClaudeStreamState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);

  const stopStream = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  const resetStream = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState(INITIAL_STATE);
  }, []);

  const startStream = useCallback(async (req: StreamRequest) => {
    // Cancel any in-flight stream and reset state.
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setState({ ...INITIAL_STATE, isStreaming: true });

    let response: Response;
    try {
      response = await fetch("/api/claude/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
        signal: ac.signal,
        // Streaming requires keep-alive; explicit so we don't get any
        // edge-case buffering on dev servers.
        cache: "no-store",
      });
    } catch (err) {
      if (ac.signal.aborted) return;
      const message =
        err instanceof Error ? err.message : "Network request failed.";
      setState((prev) => ({
        ...prev,
        isStreaming: false,
        error: { type: "error", message, recoverable: true },
      }));
      return;
    }

    if (!response.ok || !response.body) {
      const message = await safeReadErrorText(response);
      setState((prev) => ({
        ...prev,
        isStreaming: false,
        error: {
          type: "error",
          message: message ?? `Request failed with status ${response.status}.`,
          recoverable: response.status >= 500,
        },
      }));
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE frames are separated by a blank line. Pull every complete
        // frame from the buffer and parse.
        let sep = buffer.indexOf("\n\n");
        while (sep !== -1) {
          const frame = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          processFrame(frame);
          sep = buffer.indexOf("\n\n");
        }
      }
      // Flush any final frame that wasn't followed by a blank line.
      if (buffer.trim().length > 0) processFrame(buffer);
    } catch (err) {
      if (!ac.signal.aborted) {
        const message =
          err instanceof Error ? err.message : "Stream read failed.";
        setState((prev) => ({
          ...prev,
          error: { type: "error", message, recoverable: true },
        }));
      }
    } finally {
      setState((prev) => ({ ...prev, isStreaming: false }));
      abortRef.current = null;
    }

    function processFrame(frame: string) {
      let event: StreamEvent | null = null;
      try {
        event = parseSSEMessage(frame);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: {
            type: "error",
            message: err instanceof Error ? err.message : String(err),
            recoverable: false,
          },
        }));
        return;
      }
      if (!event) return;
      setState((prev) => {
        const events = [...prev.events, event];
        const next: UseClaudeStreamState = { ...prev, events };
        if (event.type === "text_delta") {
          next.text = prev.text + event.text;
        } else if (event.type === "tier_limit") {
          next.tierLimit = event;
        } else if (event.type === "safety_advisory_pii") {
          next.piiAdvisory = event;
        } else if (event.type === "safety_advisory_names") {
          next.namesAdvisory = event;
        } else if (event.type === "safety_crisis_flagged") {
          next.crisisFlag = event;
        } else if (event.type === "thread_created") {
          next.threadCreated = event;
        } else if (event.type === "tool_use_start") {
          next.toolsInFlight = [...prev.toolsInFlight, event];
        } else if (event.type === "tool_result") {
          next.toolsInFlight = prev.toolsInFlight.filter(
            (t) => t.tool_use_id !== event.tool_use_id,
          );
        } else if (event.type === "error") {
          next.error = event;
        } else if (
          event.type === "message_complete" ||
          event.type === "scenario_end"
        ) {
          next.isComplete = true;
        }
        return next;
      });
    }
  }, []);

  return useMemo(
    () => ({
      ...state,
      startStream,
      stopStream,
      resetStream,
    }),
    [state, startStream, stopStream, resetStream],
  );
}

async function safeReadErrorText(response: Response): Promise<string | null> {
  try {
    const text = await response.text();
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}
