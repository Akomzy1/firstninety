/**
 * Dev-only end-to-end test of the Claude streaming wrapper.
 *
 * GET /api/dev/test-claude → streams a short "say hello as if you were
 * the Coach" response back as SSE. Verifies that:
 *   - ANTHROPIC_API_KEY is set
 *   - safety.md loads and prepends to the system prompt
 *   - circuit-breaker check runs without erroring
 *   - trackAICall fires after the stream completes (a row should appear
 *     in `ai_calls` afterwards)
 *
 * Gated by NODE_ENV !== 'production'. Returns 404 in production.
 */
import { NextResponse } from "next/server";

import { streamClaudeResponse } from "@/lib/coach/claude";
import {
  ClaudeConfigError,
  ClaudeRateLimitError,
} from "@/lib/coach/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  let handle;
  try {
    handle = await streamClaudeResponse({
      userId: null,
      surface: "coach",
      system:
        "You are the FirstNinety Coach in a developer smoke test. Reply in two short sentences saying hello and noting today's date. Do not use exclamation marks.",
      messages: [
        {
          role: "user",
          content: "Say hello and acknowledge that the wrapper is working.",
        },
      ],
      maxTokens: 200,
    });
  } catch (err) {
    if (err instanceof ClaudeConfigError) {
      return NextResponse.json(
        { error: "config", message: err.message },
        { status: 500 },
      );
    }
    if (err instanceof ClaudeRateLimitError) {
      return NextResponse.json(
        {
          error: "rate_limit",
          scope: err.scope,
          limit: err.limit,
          used: err.used,
        },
        { status: 429 },
      );
    }
    throw err;
  }

  const encoder = new TextEncoder();

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of handle.events) {
          // Only forward content deltas + the final message_stop. The
          // SDK emits other event types (e.g. `ping`) that we don't
          // need here.
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(
                `event: text_delta\ndata: ${JSON.stringify({
                  text: event.delta.text,
                })}\n\n`,
              ),
            );
          } else if (event.type === "message_stop") {
            controller.enqueue(
              encoder.encode(`event: message_stop\ndata: {}\n\n`),
            );
          }
        }

        const finalMessage = await handle.finalize();
        controller.enqueue(
          encoder.encode(
            `event: message_complete\ndata: ${JSON.stringify({
              stop_reason: finalMessage.stop_reason,
              input_tokens: finalMessage.usage.input_tokens,
              output_tokens: finalMessage.usage.output_tokens,
            })}\n\n`,
          ),
        );
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({
              message: err instanceof Error ? err.message : String(err),
            })}\n\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
