/**
 * Simulator active-session orchestrator.
 *
 * One stream request per user turn. Pipeline:
 *   1. Load the run + scenario, refuse if not active or wrong user.
 *   2. Append the user's turn to `scenario_runs.transcript`.
 *   3. Call the coordinator (Haiku, non-streaming). It decides whether
 *      to continue, fire the curveball, or end the scenario.
 *   4. If `end_*` → update status, yield `scenario_end`, return.
 *   5. Otherwise → stream the next persona response. Parse the leading
 *      `SPEAKER: <name>` line, emit `persona_turn_start`, forward the
 *      rest as text_delta. After the stream ends, persist the persona
 *      turn into the transcript.
 *
 * Per MVP Spec §4.4. Each call writes two ai_calls rows: one for the
 * coordinator (surface=simulator, Haiku), one for the persona stream
 * (surface=simulator, Opus). The wrapper's finalize() handles both.
 */
import "server-only";

import { createServiceClient } from "@/lib/db/service";
import type { StreamEvent } from "@/lib/coach/stream-types";
import { captureServerEvent } from "@/lib/tracing/posthog-server";

import { runCoordinator, HARD_TURN_CAP } from "./coordinator";
import { streamPersonaTurn, type Persona } from "./persona-handler";
import { isQuickScenarioSlug } from "./quick-scenario";

const QUICK_TURN_CAP = 8;

export type SimulatorHandlerParams = {
  userId: string;
  /** `context_id` from the streaming endpoint — the scenario_runs.id. */
  runId: string;
  /** The user's new turn — required for every call. */
  userMessage: string;
  /**
   * Crisis overlay block from `getCrisisSystemMessage()` — prepended
   * to the persona system prompt when pre-flight detected a crisis
   * category. Crisis content during a roleplay must break frame.
   */
  crisisOverlay?: string;
};

type Turn = { speaker: string; content: string };

type RunTranscript = {
  turns: Turn[];
  curveball_fired?: boolean;
};

const USER_SPEAKER = "You";

export async function* handleSimulatorStream(
  params: SimulatorHandlerParams,
): AsyncGenerator<StreamEvent> {
  const supabase = createServiceClient();

  // ----- 1. Load run + scenario ------------------------------------- //
  const { data: run, error: runErr } = await supabase
    .from("scenario_runs")
    .select(
      "id, user_id, scenario_id, transcript, status, scenarios!inner(slug, title, brief, objective, curveball, personas, rubric)",
    )
    .eq("id", params.runId)
    .maybeSingle();

  if (runErr || !run) {
    yield {
      type: "error",
      message: "We couldn't find that scenario run.",
      recoverable: false,
    };
    return;
  }
  if (run.user_id !== params.userId) {
    yield {
      type: "error",
      message: "That scenario run belongs to a different account.",
      recoverable: false,
    };
    return;
  }
  if (run.status !== "active") {
    yield {
      type: "error",
      message: `This scenario already ended (${run.status}).`,
      recoverable: false,
    };
    return;
  }

  type ScenarioRef = {
    slug: string;
    title: string;
    brief: string;
    objective: string;
    curveball: string;
    personas: Persona[];
    rubric: { green: string[]; yellow: string[]; red: string[] };
  };
  const scenarioRef = (Array.isArray(run.scenarios)
    ? run.scenarios[0]
    : run.scenarios) as ScenarioRef | null;
  if (!scenarioRef) {
    yield {
      type: "error",
      message: "Scenario content is missing for this run.",
      recoverable: false,
    };
    return;
  }

  // ----- 2. Append the user's turn ---------------------------------- //
  const transcript = normaliseTranscript(run.transcript);
  transcript.turns.push({
    speaker: USER_SPEAKER,
    content: params.userMessage,
  });

  // ----- 3. Coordinator decision ------------------------------------ //
  // Quick rehearsals cap at 8 turns; full scenarios use the default 20.
  const isQuick = isQuickScenarioSlug(scenarioRef.slug);
  const maxTurns = isQuick ? QUICK_TURN_CAP : undefined;

  const decision = await runCoordinator({
    userId: params.userId,
    scenarioTitle: scenarioRef.title,
    scenarioBrief: scenarioRef.brief,
    scenarioObjective: scenarioRef.objective,
    scenarioCurveball: scenarioRef.curveball,
    scenarioRubric: scenarioRef.rubric,
    transcript: transcript.turns,
    turn: transcript.turns.length,
    curveballFired: transcript.curveball_fired ?? false,
    maxTurns,
  });

  // ----- 4. End-of-scenario branch ---------------------------------- //
  if (
    decision.action === "end_success" ||
    decision.action === "end_yellow" ||
    decision.action === "end_red"
  ) {
    // Persist transcript + final status, then yield scenario_end.
    const userTurnsCount = transcript.turns.filter(
      (t) => t.speaker === USER_SPEAKER,
    ).length;

    await supabase
      .from("scenario_runs")
      .update({
        transcript,
        status: "completed",
        outcome: decision.action,
        ended_at: new Date().toISOString(),
        duration_seconds: null, // computed off started_at if needed later
      })
      .eq("id", params.runId);

    try {
      await captureServerEvent({
        distinctId: params.userId,
        event: "scenario_run_completed",
        properties: {
          run_id: params.runId,
          scenario_slug: scenarioRef.slug,
          scenario_id: run.scenario_id,
          outcome: decision.action,
          turns: userTurnsCount,
        },
      });
    } catch (err) {
      console.warn("[simulator] scenario_run_completed capture failed", err);
    }

    yield {
      type: "scenario_end",
      run_id: params.runId,
      turns: userTurnsCount,
      outcome: decision.action,
    };
    return;
  }

  const fireCurveball = decision.action === "fire_curveball";

  // ----- 5. Persona stream ----------------------------------------- //
  const handle = await streamPersonaTurn({
    userId: params.userId,
    scenarioTitle: scenarioRef.title,
    scenarioBrief: scenarioRef.brief,
    scenarioObjective: scenarioRef.objective,
    personas: scenarioRef.personas,
    transcript: transcript.turns,
    fireCurveball,
    scenarioCurveball: scenarioRef.curveball,
    crisisOverlay: params.crisisOverlay,
  });

  // Strip the `SPEAKER: <name>\n\n` prefix off the streaming output.
  // First we accumulate until we see two consecutive newlines; then we
  // emit persona_turn_start and start forwarding remaining text as
  // text_delta deltas.
  let prefixBuffer = "";
  let prefixDone = false;
  let assistantText = "";
  let resolvedPersona: Persona | null = null;

  for await (const event of handle.events) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      const chunk = event.delta.text;
      if (!prefixDone) {
        prefixBuffer += chunk;
        const splitIdx = prefixBuffer.indexOf("\n\n");
        if (splitIdx === -1) continue;
        // Prefix has landed.
        const prefixRaw = prefixBuffer.slice(0, splitIdx);
        const remainder = prefixBuffer.slice(splitIdx + 2);
        const speaker = parseSpeakerLine(prefixRaw);
        resolvedPersona =
          findPersona(scenarioRef.personas, speaker) ?? fallbackPersona(speaker);
        yield {
          type: "persona_turn_start",
          speaker_name: resolvedPersona.name,
          monogram: resolvedPersona.monogram,
          colour: resolvedPersona.colour,
        };
        prefixDone = true;
        if (remainder.length > 0) {
          assistantText += remainder;
          yield { type: "text_delta", text: remainder };
        }
      } else {
        assistantText += chunk;
        yield { type: "text_delta", text: chunk };
      }
    }
  }

  // If the stream ended without producing two newlines, treat whatever
  // we got as the persona's content under "Unknown speaker".
  if (!prefixDone) {
    const speaker = parseSpeakerLine(prefixBuffer) ?? "Unknown speaker";
    resolvedPersona =
      findPersona(scenarioRef.personas, speaker) ?? fallbackPersona(speaker);
    yield {
      type: "persona_turn_start",
      speaker_name: resolvedPersona.name,
      monogram: resolvedPersona.monogram,
      colour: resolvedPersona.colour,
    };
    assistantText = prefixBuffer;
    if (prefixBuffer.length > 0) {
      yield { type: "text_delta", text: prefixBuffer };
    }
  }

  const finalMessage = await handle.finalize();

  // ----- 6. Persist persona turn + bookkeeping --------------------- //
  transcript.turns.push({
    speaker: resolvedPersona?.name ?? "Unknown speaker",
    content: assistantText.trim(),
  });
  if (fireCurveball) transcript.curveball_fired = true;

  await supabase
    .from("scenario_runs")
    .update({ transcript })
    .eq("id", params.runId);

  yield {
    type: "message_complete",
    stop_reason: finalMessage.stop_reason,
    input_tokens: finalMessage.usage.input_tokens,
    output_tokens: finalMessage.usage.output_tokens,
  };
}

// --------------------------------------------------------------------- //
// Helpers                                                               //
// --------------------------------------------------------------------- //

function normaliseTranscript(raw: unknown): RunTranscript {
  if (!raw || typeof raw !== "object") return { turns: [] };
  const obj = raw as Record<string, unknown>;
  const turns = Array.isArray(obj.turns)
    ? (obj.turns as unknown[]).filter(
        (t): t is Turn =>
          !!t &&
          typeof t === "object" &&
          typeof (t as Turn).speaker === "string" &&
          typeof (t as Turn).content === "string",
      )
    : [];
  return {
    turns,
    curveball_fired: typeof obj.curveball_fired === "boolean"
      ? obj.curveball_fired
      : false,
  };
}

function parseSpeakerLine(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  const match = /^SPEAKER\s*:\s*(.+)$/im.exec(trimmed);
  if (match && match[1]) return match[1].trim();
  // The model may emit just the name on its own line as a degenerate
  // fallback — use the whole thing.
  const firstLine = trimmed.split("\n")[0]?.trim();
  return firstLine && firstLine.length < 80 ? firstLine : null;
}

function findPersona(
  personas: Persona[],
  speaker: string | null,
): Persona | null {
  if (!speaker) return null;
  const lower = speaker.toLowerCase();
  return (
    personas.find((p) => p.name.toLowerCase() === lower) ??
    personas.find((p) => lower.startsWith(p.name.toLowerCase())) ??
    null
  );
}

function fallbackPersona(speaker: string | null): Persona {
  const name = speaker ?? "Unknown speaker";
  const monogram = name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return {
    name,
    role: "Persona",
    position: "",
    fear: "",
    monogram: monogram.length > 0 ? monogram : "?",
    colour: "slate",
  };
}

export { HARD_TURN_CAP };
