/**
 * Bridge an Anthropic SDK stream handle into our typed `StreamEvent`
 * union. Used by non-agentic surface handlers (Situation Room,
 * Simulator persona turns) that just need a single Claude call piped
 * through the SSE protocol unchanged.
 *
 * The Coach handler in `handler.ts` does its own translation because
 * it has to manage a tool-calling loop across multiple SDK calls.
 */
import "server-only";

import type { ClaudeStreamHandle } from "./claude";
import type { StreamEvent } from "./stream-types";

export async function* sdkStreamToTypedEvents(
  handle: ClaudeStreamHandle,
): AsyncGenerator<StreamEvent> {
  for await (const event of handle.events) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
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
  yield {
    type: "message_complete",
    stop_reason: finalMessage.stop_reason,
    input_tokens: finalMessage.usage.input_tokens,
    output_tokens: finalMessage.usage.output_tokens,
  };
}
