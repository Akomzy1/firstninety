/**
 * The single SSE streaming endpoint that powers Coach, Situation Room,
 * Simulator, and Probation Brief generation.
 *
 * Pipeline per request:
 *   1. Validate auth (Supabase JWT → user.id)
 *   2. Parse + validate the StreamRequest body
 *   3. Tier-gate via checkTierAllowance — emit `tier_limit` + close on deny
 *   4. Dispatch to the surface handler (lib/coach/surface-handlers.ts)
 *   5. Pipe Anthropic SDK stream events to typed SSE frames
 *   6. After stream ends, finalize() runs → ai_calls row is written
 *
 * Per MVP Spec §3.2 + §4.5.
 *
 * Surface handlers are placeholders for now (Coach gets a generic
 * system prompt; the rest 501). Real handlers land in:
 *   - 3.5 Coach engine + tool implementations
 *   - 3.7 Situation Room intake handler
 *   - 3.10 Simulator persona handler
 *   - 3.11 Simulator debrief handler
 *   - 3.14 Probation Brief generator
 */
import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth/server";
import {
  checkTierAllowance,
  type TierGatedSurface,
} from "@/lib/billing/tier";
import { createServiceClient } from "@/lib/db/service";
import {
  ClaudeConfigError,
  ClaudeRateLimitError,
} from "@/lib/coach/config";
import {
  dispatchSurface,
  HandlerNotImplementedError,
} from "@/lib/coach/surface-handlers";
import {
  encodeSSEFrame,
  type StreamRequest,
  type StreamEvent,
} from "@/lib/coach/stream-types";
import {
  getCrisisSystemMessage,
  runPreFlightChecks,
} from "@/lib/safety/guardrails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Map a streaming surface to its tier-gated counterpart, if any. */
function tierSurfaceFor(
  surface: StreamRequest["surface"],
): TierGatedSurface | null {
  if (surface === "coach") return "coach";
  if (surface === "situation_room") return "situation_room";
  if (surface === "simulator_persona" || surface === "simulator_debrief") {
    return "simulator";
  }
  // probation_brief is gated by feature (probation_mode_active) not tier.
  return null;
}

function isStreamSurface(value: unknown): value is StreamRequest["surface"] {
  return (
    value === "coach" ||
    value === "situation_room" ||
    value === "simulator_persona" ||
    value === "simulator_debrief" ||
    value === "probation_brief"
  );
}

function parseRequest(body: unknown): StreamRequest | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Request body must be a JSON object." };
  }
  const obj = body as Record<string, unknown>;
  if (!isStreamSurface(obj.surface)) {
    return { error: "Missing or invalid `surface`." };
  }
  if (typeof obj.context_id !== "string" || obj.context_id.length === 0) {
    return { error: "Missing `context_id`." };
  }
  const out: StreamRequest = {
    surface: obj.surface,
    context_id: obj.context_id,
  };
  if (typeof obj.user_message === "string") out.user_message = obj.user_message;
  if (typeof obj.scenario_id === "string") out.scenario_id = obj.scenario_id;
  if (
    obj.entry_type === "prep" ||
    obj.entry_type === "is_this_normal" ||
    obj.entry_type === "debrief" ||
    obj.entry_type === "probation"
  ) {
    out.entry_type = obj.entry_type;
  }
  return out;
}

export async function POST(request: NextRequest) {
  // ----- 1. Auth ---------------------------------------------------- //
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  // ----- 2. Body validation ----------------------------------------- //
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body must be valid JSON." },
      { status: 400 },
    );
  }
  const parsed = parseRequest(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const req = parsed;

  // ----- 3. Tier gate ---------------------------------------------- //
  const tierSurface = tierSurfaceFor(req.surface);
  let preStreamEvent: StreamEvent | null = null;
  if (tierSurface) {
    const allowance = await checkTierAllowance(user.id, tierSurface);
    if (!allowance.allowed) {
      preStreamEvent = { type: "tier_limit", allowance };
    }
  }

  // ----- 4. Pre-flight safety checks ------------------------------- //
  // Run only when we actually have a user_message to inspect; system-
  // initiated calls (e.g. Probation Brief generation) skip this.
  const preFlight = req.user_message
    ? runPreFlightChecks(req.user_message)
    : null;

  // Honor the per-user real-name advisory opt-out. PII + crisis are
  // mandatory and are never skipped.
  let disableRealNameAdvisory = false;
  if (preFlight?.names.has_likely_names) {
    const supabase = createServiceClient();
    const { data: ctx } = await supabase
      .from("user_context")
      .select("disable_real_name_advisory")
      .eq("user_id", user.id)
      .maybeSingle();
    disableRealNameAdvisory = Boolean(ctx?.disable_real_name_advisory);
  }

  const advisoryEvents: StreamEvent[] = [];
  let crisisOverlay: string | undefined;
  if (preFlight) {
    if (preFlight.pii.has_pii) {
      advisoryEvents.push({
        type: "safety_advisory_pii",
        pii_types: preFlight.pii.types,
      });
    }
    if (preFlight.names.has_likely_names && !disableRealNameAdvisory) {
      advisoryEvents.push({
        type: "safety_advisory_names",
        matches: preFlight.names.matches,
      });
    }
    if (preFlight.crisis.matched && preFlight.crisis.category) {
      advisoryEvents.push({
        type: "safety_crisis_flagged",
        category: preFlight.crisis.category,
      });
      crisisOverlay = getCrisisSystemMessage(preFlight.crisis.category);
      // Per-surface `flagged_for_safety` writes are now owned by the
      // individual handlers (coach handler stamps coach_threads;
      // situation-room intake stamps situation_sessions at submission).
    }
  }

  // ----- 5. SSE stream --------------------------------------------- //
  const encoder = new TextEncoder();

  const body_stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(encodeSSEFrame(event)));
      };

      // Tier denial — emit then close, never touch Anthropic.
      if (preStreamEvent) {
        emit(preStreamEvent);
        controller.close();
        return;
      }

      // Emit any pre-flight advisories before the stream opens. These
      // are non-blocking — the user's message still goes to Claude.
      for (const advisory of advisoryEvents) emit(advisory);

      try {
        // Each surface handler returns AsyncIterable<StreamEvent>; the
        // endpoint just forwards events. Handlers own their own
        // translation from SDK events to typed events (and, for the
        // Coach, their own tool-calling loop).
        const events = dispatchSurface(req, user.id, { crisisOverlay });
        for await (const event of events) emit(event);
      } catch (err) {
        if (err instanceof ClaudeRateLimitError) {
          emit({
            type: "error",
            message: `Rate limit (${err.scope}). Try again in a few minutes.`,
            recoverable: true,
          });
        } else if (err instanceof ClaudeConfigError) {
          emit({
            type: "error",
            message: err.message,
            recoverable: false,
          });
        } else if (err instanceof HandlerNotImplementedError) {
          emit({
            type: "error",
            message: err.message,
            recoverable: false,
          });
        } else {
          console.error("[stream] unhandled error", err);
          emit({
            type: "error",
            message: err instanceof Error ? err.message : "Stream failed.",
            recoverable: true,
          });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body_stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
