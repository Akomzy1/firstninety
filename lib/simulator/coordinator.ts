/**
 * Simulator coordinator — the narrative-integrity decision call.
 *
 * Runs AFTER each user turn and BEFORE the next persona response.
 * Reads the scenario brief + rubric + full transcript and decides:
 *
 *   - `continue`         → keep going; the persona handler picks a speaker
 *   - `fire_curveball`   → keep going AND the next persona response must
 *                          surface the scenario's curveball
 *   - `end_success`      → green-flag outcome; scenario ends
 *   - `end_yellow`       → mixed outcome; scenario ends
 *   - `end_red`          → red-flag outcome; scenario ends
 *
 * Implemented per MVP Spec §4.4. Haiku 4.5 at low temperature so the
 * decision is consistent across re-runs.
 */
import "server-only";

import { nonStreamClaudeCall } from "@/lib/coach/claude";
import { MODEL_HAIKU } from "@/lib/coach/config";

export type CoordinatorDecision =
  | "continue"
  | "fire_curveball"
  | "end_success"
  | "end_yellow"
  | "end_red";

export type CoordinatorResult = {
  action: CoordinatorDecision;
  reasoning: string;
};

export type CoordinatorInput = {
  userId: string;
  scenarioTitle: string;
  scenarioBrief: string;
  scenarioObjective: string;
  scenarioCurveball: string;
  scenarioRubric: {
    green: string[];
    yellow: string[];
    red: string[];
  };
  /** Full transcript so far, including the user turn that just landed. */
  transcript: Array<{ speaker: string; content: string }>;
  /** Current turn count (post-user-turn). */
  turn: number;
  /** True when this scenario has already fired the curveball. */
  curveballFired: boolean;
  /**
   * Override the default 20-turn ceiling. Quick scenarios cap at 8 per
   * Build Prompt 3.13; the orchestrator passes 8 when the slug carries
   * the `quick-` prefix.
   */
  maxTurns?: number;
};

const DEFAULT_HARD_TURN_CAP = 20;
const HARD_TURN_CAP = DEFAULT_HARD_TURN_CAP;

const SYSTEM_PROMPT = [
  "You are the silent coordinator of a workplace-scenario roleplay.",
  "You never speak in-character. You read the transcript and decide what",
  "happens next.",
  "",
  "Your output is always a single JSON object with two keys:",
  '{ "action": one of "continue" | "fire_curveball" | "end_success" | "end_yellow" | "end_red",',
  '  "reasoning": one short sentence (<= 140 chars) explaining the call }.',
  "",
  "Decision rules:",
  '- "continue" — the conversation is making progress toward the objective.',
  '- "fire_curveball" — choose this AT MOST ONCE per scenario, around turn',
  "  4-7, to inject the scripted curveball. Pick the moment when the user",
  "  is most settled into the room.",
  '- "end_success" — the user has met the objective AND avoided the red',
  "  rubric items. Pick this only when the scenario has a natural close.",
  '- "end_yellow" — the user has partly met the objective but tripped one',
  "  or more yellow rubric items. Wrap the scenario.",
  '- "end_red" — the user has clearly missed the objective or tripped a red',
  "  rubric item.",
  "",
  "Hard rule: at turn 20 you MUST pick one of end_success / end_yellow / end_red.",
  "",
  "Do not output anything outside the JSON object. No prose, no markdown,",
  "no explanation around the JSON. Just the object.",
].join("\n");

export async function runCoordinator(
  input: CoordinatorInput,
): Promise<CoordinatorResult> {
  const turnCap = input.maxTurns ?? DEFAULT_HARD_TURN_CAP;

  const userBlock = [
    `## Scenario: ${input.scenarioTitle}`,
    "",
    `### Objective`,
    input.scenarioObjective,
    "",
    `### Curveball${input.curveballFired ? " (already fired — never fire again)" : ""}`,
    input.scenarioCurveball,
    "",
    `### Rubric`,
    "Green:",
    ...input.scenarioRubric.green.map((g) => `- ${g}`),
    "Yellow:",
    ...input.scenarioRubric.yellow.map((y) => `- ${y}`),
    "Red:",
    ...input.scenarioRubric.red.map((r) => `- ${r}`),
    "",
    `### Transcript so far (turn ${input.turn} of max ${turnCap})`,
    ...input.transcript.map(
      (t, i) => `[${i + 1}] ${t.speaker}: ${t.content}`,
    ),
    "",
    "### Brief",
    input.scenarioBrief,
  ].join("\n");

  const response = await nonStreamClaudeCall({
    userId: input.userId,
    surface: "simulator",
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userBlock }],
    model: MODEL_HAIKU,
    maxTokens: 200,
  });

  const text = response.content
    .filter((c) => c.type === "text")
    .map((c) => ("text" in c ? c.text : ""))
    .join("");

  const decision = parseDecision(text);

  // Hard turn cap — never let the coordinator say "continue" past the
  // ceiling (20 for normal scenarios, 8 for quick rehearsals).
  if (input.turn >= turnCap && decision.action === "continue") {
    return {
      action: "end_yellow",
      reasoning: `Hard cap reached at turn ${input.turn}; forced wrap.`,
    };
  }
  if (input.turn >= turnCap && decision.action === "fire_curveball") {
    return {
      action: "end_yellow",
      reasoning: `Hard cap reached at turn ${input.turn}; forced wrap.`,
    };
  }

  // Refuse a second curveball.
  if (decision.action === "fire_curveball" && input.curveballFired) {
    return {
      action: "continue",
      reasoning: "Curveball already fired; coordinator coerced to continue.",
    };
  }

  return decision;
}

function parseDecision(raw: string): CoordinatorResult {
  // Try strict JSON first. If the model wrapped it in prose, pull the
  // first {...} block we can find.
  const trimmed = raw.trim();
  const candidates = [trimmed];
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (match) candidates.push(match[0]);

  for (const c of candidates) {
    try {
      const parsed = JSON.parse(c) as {
        action?: unknown;
        reasoning?: unknown;
      };
      if (
        typeof parsed.action === "string" &&
        (parsed.action === "continue" ||
          parsed.action === "fire_curveball" ||
          parsed.action === "end_success" ||
          parsed.action === "end_yellow" ||
          parsed.action === "end_red")
      ) {
        return {
          action: parsed.action,
          reasoning:
            typeof parsed.reasoning === "string"
              ? parsed.reasoning
              : "(no reasoning)",
        };
      }
    } catch {
      // try the next candidate
    }
  }

  // Fall back to continue rather than failing — the next coordinator
  // call will get another chance to wrap the scenario.
  return {
    action: "continue",
    reasoning: `Coordinator output didn't parse as JSON: ${trimmed.slice(0, 100)}`,
  };
}

export { HARD_TURN_CAP };
