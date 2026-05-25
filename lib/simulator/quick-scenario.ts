/**
 * Quick Simulator — generate an ad-hoc scenario from a Situation Room
 * session and insert it into the `scenarios` table.
 *
 * Per Build Prompt 3.13 / PRD §6.5.1: the "Roleplay it now" path in a
 * Situation Room session takes the user from a real workplace moment
 * directly into a short rehearsal of that exact moment. Haiku 4.5 is
 * cheap and fast enough to draft the scenario synchronously while the
 * user waits on the orchestrator route.
 *
 * The generated scenario:
 *   - Lives in `scenarios` with `slug = quick-<short-id>`,
 *     `is_published = false`, `career_stage = "quick"` (the marker the
 *     coordinator + debrief generators sniff for to apply the 8-turn
 *     cap and the shorter debrief).
 *   - Has 1-2 personas (not three), one objective, and a brief that's
 *     literally the user's anonymised situation rewritten as a "the
 *     room" paragraph.
 *   - Has no curveball (`curveball: ""`).
 *   - Estimated minutes: 5.
 */
import "server-only";

import { randomBytes } from "node:crypto";

import { nonStreamClaudeCall } from "@/lib/coach/claude";
import { MODEL_HAIKU } from "@/lib/coach/config";
import { createServiceClient } from "@/lib/db/service";
import type { Database } from "@/lib/db/types.gen";

type Role = Database["public"]["Enums"]["role_enum"];

type Persona = {
  name: string;
  role: string;
  position: string;
  fear: string;
  monogram: string;
  colour: string;
};

type ScenarioDraft = {
  title: string;
  one_liner: string;
  brief: string;
  objective: string;
  personas: Persona[];
};

type Rubric = {
  green: string[];
  yellow: string[];
  red: string[];
};

const PERSONA_PALETTE = ["slate", "rose", "ochre", "teal", "moss", "plum"] as const;

const SYSTEM_PROMPT = [
  "You are drafting a SHORT workplace-rehearsal scenario from a real",
  "situation the user is about to walk into. Goal: give them five",
  "minutes of rehearsal that actually moves them forward.",
  "",
  "Output: a single JSON object with this shape (no prose around it):",
  "",
  "{",
  '  "title": "5-8 words, evocative, period-terminated. e.g. \\"The conversation you keep avoiding.\\"",',
  '  "one_liner": "single sentence, 15-25 words, sets the room",',
  '  "brief": "TWO short paragraphs. Para 1 = the room (who is in it, where, when). Para 2 = the user\'s job in the next 5 minutes. Markdown allowed; use \\"## The room\\" and \\"## Your turn\\" headings.",',
  '  "objective": "single sentence, action-led, what \\"well-played\\" looks like",',
  '  "personas": [',
  '    { "name": "Plausible name", "role": "Their role title", "position": "What they want in this moment (1 sentence)", "fear": "What they\'re scared of (1 sentence)", "monogram": "2-letter initials", "colour": "slate | rose | ochre | teal | moss | plum" }',
  "  ]",
  "}",
  "",
  "Constraints:",
  "- 1 or 2 personas only. NEVER three. Quick scenarios are tight.",
  "- Each persona has a *position* and a *fear*. Both are required —",
  "  the simulator engine needs them to keep the persona in character.",
  "- Use the persona palette colours exactly as listed; pick distinct",
  "  colours per persona.",
  "- Title and objective each end with a period.",
  "- Do not reference the simulator, the user, or the product. The",
  "  brief is editorial fiction — a paragraph someone could read aloud.",
  "- Output JSON only. No preamble, no markdown fences.",
].join("\n");

/**
 * Generate + persist a quick scenario from a Situation Room session.
 * Returns the new scenario row's slug so the caller can create a
 * `scenario_runs` row referencing it.
 */
export async function generateQuickScenarioFromSituation({
  userId,
  sessionId,
}: {
  userId: string;
  sessionId: string;
}): Promise<{ scenarioId: string; slug: string } | { error: string }> {
  const supabase = createServiceClient();

  // ---- 1. Load the SR session + the user's role ------------------- //
  const [sessionResult, userRowResult] = await Promise.all([
    supabase
      .from("situation_sessions")
      .select("id, user_id, entry_type, situation_summary, transcript")
      .eq("id", sessionId)
      .maybeSingle(),
    supabase.from("users").select("primary_role").eq("id", userId).single(),
  ]);

  if (!sessionResult.data) return { error: "Situation session not found." };
  if (sessionResult.data.user_id !== userId) {
    return { error: "That session belongs to a different account." };
  }
  const role = userRowResult.data?.primary_role as Role | null;
  if (!role) return { error: "Pick a role in Settings first." };

  const transcript = (sessionResult.data.transcript ?? {}) as Record<
    string,
    unknown
  >;
  const opening =
    typeof transcript.opening === "string"
      ? (transcript.opening as string)
      : sessionResult.data.situation_summary;

  // ---- 2. Draft the scenario via Haiku ---------------------------- //
  const draft = await draftScenario({
    userId,
    role,
    entryType: sessionResult.data.entry_type,
    opening,
  });
  if ("error" in draft) return { error: draft.error };

  // ---- 3. Insert into `scenarios` --------------------------------- //
  const shortId = randomBytes(4).toString("hex");
  const slug = `quick-${shortId}`;

  const rubric: Rubric = buildDefaultRubric();

  const { data: scenario, error: insertErr } = await supabase
    .from("scenarios")
    .insert({
      slug,
      role,
      title: draft.title,
      one_liner: draft.one_liner,
      brief: draft.brief,
      objective: draft.objective,
      curveball: "",
      personas: draft.personas as never,
      rubric: rubric as never,
      estimated_minutes: 5,
      difficulty: 1,
      career_stage: "quick",
      is_published: false,
    })
    .select("id")
    .single();
  if (insertErr || !scenario) {
    console.error("[quick-scenario] insert failed", insertErr);
    return { error: "Couldn't save the scenario. Try again in a moment." };
  }

  return { scenarioId: scenario.id, slug };
}

// --------------------------------------------------------------------- //
// Internals                                                              //
// --------------------------------------------------------------------- //

async function draftScenario({
  userId,
  role,
  entryType,
  opening,
}: {
  userId: string;
  role: Role;
  entryType: string;
  opening: string;
}): Promise<ScenarioDraft | { error: string }> {
  const userBlock = [
    `Role: ${role.toUpperCase()}`,
    `Entry type: ${entryType}`,
    "",
    "Situation the user shared (anonymised by them):",
    opening,
    "",
    "Draft a 5-minute rehearsal scenario per the schema in your system",
    "prompt. Tightly scoped — this is the conversation about to happen,",
    "not the entire arc.",
  ].join("\n");

  const response = await nonStreamClaudeCall({
    userId,
    surface: "simulator",
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userBlock }],
    model: MODEL_HAIKU,
    maxTokens: 800,
  });

  const text = response.content
    .filter((c) => c.type === "text")
    .map((c) => ("text" in c ? c.text : ""))
    .join("");

  return parseScenarioDraft(text);
}

function parseScenarioDraft(
  raw: string,
): ScenarioDraft | { error: string } {
  const candidates = [raw.trim()];
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) candidates.push(match[0]);

  for (const c of candidates) {
    try {
      const parsed = JSON.parse(c) as Record<string, unknown>;
      const draft = coerceDraft(parsed);
      if (draft) return draft;
    } catch {
      // try next
    }
  }
  return { error: "Quick scenario draft didn't parse as JSON." };
}

function coerceDraft(obj: Record<string, unknown>): ScenarioDraft | null {
  if (
    typeof obj.title !== "string" ||
    typeof obj.one_liner !== "string" ||
    typeof obj.brief !== "string" ||
    typeof obj.objective !== "string" ||
    !Array.isArray(obj.personas) ||
    obj.personas.length === 0
  ) {
    return null;
  }
  const personas: Persona[] = [];
  for (const p of obj.personas as unknown[]) {
    if (!p || typeof p !== "object") continue;
    const pp = p as Record<string, unknown>;
    if (
      typeof pp.name !== "string" ||
      typeof pp.role !== "string" ||
      typeof pp.position !== "string" ||
      typeof pp.fear !== "string"
    ) {
      continue;
    }
    const initials =
      typeof pp.monogram === "string"
        ? pp.monogram.slice(0, 2).toUpperCase()
        : pp.name
            .split(/\s+/)
            .map((s) => s[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase();
    const colour =
      typeof pp.colour === "string" &&
      (PERSONA_PALETTE as readonly string[]).includes(pp.colour)
        ? pp.colour
        : pickColour(personas.length);
    personas.push({
      name: pp.name,
      role: pp.role,
      position: pp.position,
      fear: pp.fear,
      monogram: initials.length > 0 ? initials : "??",
      colour,
    });
    if (personas.length >= 2) break;
  }
  if (personas.length === 0) return null;
  return {
    title: ensurePeriod(obj.title as string),
    one_liner: (obj.one_liner as string).trim(),
    brief: (obj.brief as string).trim(),
    objective: ensurePeriod(obj.objective as string),
    personas,
  };
}

function pickColour(index: number): string {
  return PERSONA_PALETTE[index % PERSONA_PALETTE.length] ?? "slate";
}

function ensurePeriod(s: string): string {
  const trimmed = s.trim();
  if (/[.!?]$/.test(trimmed)) return trimmed;
  return `${trimmed}.`;
}

function buildDefaultRubric(): Rubric {
  return {
    green: [
      "Opened with a specific question that named the situation rather than dancing around it.",
      "Listened more than they spoke for the first half of the rehearsal.",
      "Held their position when the persona pushed back, without escalating.",
    ],
    yellow: [
      "Filled silence with their own answers instead of waiting.",
      "Capitulated to the persona's framing in the first two turns.",
      "Asked closed yes/no questions where an open one would have yielded more.",
    ],
    red: [
      "Promised something specific without confirming the constraint.",
      "Let the persona dominate the conversation without redirecting.",
      "Apologised for asking — undermined their own standing in the room.",
    ],
  };
}

/**
 * Recognise an ad-hoc scenario from its slug. Used by the coordinator
 * (to cap turns at 8) and the debrief generator (to emit a shorter
 * structured output).
 */
export function isQuickScenarioSlug(slug: string): boolean {
  return slug.startsWith("quick-");
}
