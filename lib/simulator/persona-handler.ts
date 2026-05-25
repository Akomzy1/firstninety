/**
 * Simulator persona handler — generates the next in-character turn.
 *
 * Streaming Opus call. The prompt instructs the model to start its
 * output with `SPEAKER: <persona name>\n\n` and then the in-character
 * line(s). The orchestrator in `handler.ts` reads the streaming
 * tokens, peels the speaker prefix off the first line, emits a
 * `persona_turn_start` event, then forwards the remaining text deltas.
 *
 * Per MVP Spec §4.4 the persona system prompt carries:
 *   - The scenario brief (the room, the situation)
 *   - The full personas array with each persona's position + fear so
 *     the model can stay in-character even under user pressure
 *   - The full transcript so far
 *   - The curveball, when the coordinator has chosen to fire it
 */
import "server-only";

import { streamClaudeResponse, type ClaudeStreamHandle } from "@/lib/coach/claude";

export type Persona = {
  name: string;
  role: string;
  position: string;
  fear: string;
  monogram: string;
  colour: string;
};

export type PersonaHandlerParams = {
  userId: string;
  scenarioTitle: string;
  scenarioBrief: string;
  scenarioObjective: string;
  personas: Persona[];
  transcript: Array<{ speaker: string; content: string }>;
  /** True when the coordinator has instructed the persona to fire the curveball. */
  fireCurveball: boolean;
  scenarioCurveball: string;
  /**
   * Crisis overlay block — when present, the persona must break frame
   * and respond as a colleague, not as the scenario character.
   */
  crisisOverlay?: string;
};

const SYSTEM_PROMPT_BASE = [
  "You are the personas in a workplace-scenario roleplay. There are",
  "multiple speakers in the room; on each call you generate exactly ONE",
  "turn for ONE persona. Stay in character. Maintain each persona's",
  "*position* and *fear* even when the user pushes back; agreement should",
  "be earned, not given.",
  "",
  "Voice rules:",
  "- Persona dialogue is short (1-3 sentences typically). People talk in",
  "  conversation length, not in essays.",
  "- Personas can interrupt themselves, hesitate, change tack mid-thought.",
  "  They are not narrators.",
  "- Do not reference 'the scenario', 'the user', or the simulator frame.",
  "  You are people in a room.",
  "- Do not summarise what happened. Each turn moves the conversation",
  "  forward by one beat.",
  "",
  "Output format — MANDATORY:",
  "Line 1 is exactly:  SPEAKER: <persona name>",
  "Line 2 is blank.",
  "Line 3+ is the persona's spoken line(s) in plain prose. No quotation",
  "marks around the whole line; quote with double quotes only when the",
  "persona is quoting someone else.",
].join("\n");

export async function streamPersonaTurn(
  params: PersonaHandlerParams,
): Promise<ClaudeStreamHandle> {
  const personasBlock = params.personas
    .map(
      (p) =>
        `- ${p.name} (${p.role}). Position: ${p.position}. Fear: ${p.fear}.`,
    )
    .join("\n");

  const transcriptBlock =
    params.transcript.length === 0
      ? "(The user has just opened the room. This is the first persona turn.)"
      : params.transcript
          .map((t, i) => `[${i + 1}] ${t.speaker}: ${t.content}`)
          .join("\n");

  const curveballBlock = params.fireCurveball
    ? [
        "## Curveball instruction",
        "",
        "On THIS turn, surface the following twist through the most",
        "natural persona for it — interrupting the conversation if needed:",
        "",
        params.scenarioCurveball,
      ].join("\n")
    : "";

  const userBlock = [
    `## Scenario: ${params.scenarioTitle}`,
    "",
    "### Brief",
    params.scenarioBrief,
    "",
    "### Personas in the room",
    personasBlock,
    "",
    "### Objective the user is trying to meet",
    params.scenarioObjective,
    "",
    "### Transcript so far",
    transcriptBlock,
    "",
    curveballBlock,
    "",
    "Pick the persona whose turn it is naturally and write their single",
    "next utterance per the output format above. Do not write multiple",
    "personas in one call.",
  ]
    .filter((s) => s.length > 0)
    .join("\n");

  // When pre-flight matched a crisis category, prepend the overlay
  // BEFORE the base prompt so the model sees the crisis context first
  // and breaks frame instead of continuing in-character.
  const systemPrompt = params.crisisOverlay
    ? `${params.crisisOverlay}\n\n${SYSTEM_PROMPT_BASE}`
    : SYSTEM_PROMPT_BASE;

  return streamClaudeResponse({
    userId: params.userId,
    surface: "simulator",
    system: systemPrompt,
    messages: [{ role: "user", content: userBlock }],
    maxTokens: 600,
  });
}
