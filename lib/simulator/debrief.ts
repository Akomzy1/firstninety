/**
 * Simulator debrief generator — the most important AI surface in the
 * product per SKILL.md §4.3.
 *
 * Single non-streaming Opus call. Reads the finished run's transcript +
 * the scenario's rubric + outcome, returns a structured JSON debrief
 * with: one load-bearing judgement line, a context paragraph, green /
 * yellow / red flag lists (each item a single editorial line, ranked),
 * a "rehearses_for" sentence, and three "what's next" cards.
 *
 * Voice rules per SKILL.md §4.3 are baked into the system prompt:
 * honest, calibrated, never sycophantic. The judgement line is the
 * test — "You held the room. Just." passes; "Great work, you did
 * amazing!" fails.
 *
 * Persists into `scenario_runs.debrief` (JSONB). Idempotent: if the
 * row already has a `debrief.judgement`, the function returns the
 * persisted object without re-calling Claude.
 */
import "server-only";

import { nonStreamClaudeCall } from "@/lib/coach/claude";
import { loadCoachPromptBody } from "@/lib/content/loaders";
import { createServiceClient } from "@/lib/db/service";

import { isQuickScenarioSlug } from "./quick-scenario";

export type DebriefFlag = {
  text: string;
  /** 1-indexed display rank, top item is the load-bearing one. */
  ranked: number;
};

export type DebriefNextLink = {
  label: string;
  url: string;
};

export type DebriefData = {
  judgement: string;
  context_paragraph: string;
  green_flags: DebriefFlag[];
  yellow_flags: DebriefFlag[];
  red_flags: DebriefFlag[];
  rehearses_for: string;
  whats_next: DebriefNextLink[];
  /** Set when the user clicks "Mark debrief read". ISO timestamp. */
  read_at?: string | null;
  /** Wall-clock timestamp the generator ran. */
  generated_at?: string;
};

type RunRow = {
  id: string;
  user_id: string;
  transcript: unknown;
  outcome: string | null;
  debrief: unknown;
  scenarios: ScenarioRef | ScenarioRef[] | null;
};

type ScenarioRef = {
  slug: string;
  title: string;
  brief: string;
  objective: string;
  rubric: { green: string[]; yellow: string[]; red: string[] };
};

const OUTCOME_LABEL: Record<string, "green" | "yellow" | "red"> = {
  end_success: "green",
  end_yellow: "yellow",
  end_red: "red",
};

const FALLBACK_NEXT_LINKS: DebriefNextLink[] = [
  { label: "Replay this scenario", url: "REPLAY" },
  { label: "Open the Coach", url: "/coach/new" },
  { label: "Browse Playbooks", url: "/playbook" },
];

export async function generateDebrief(runId: string): Promise<DebriefData> {
  const supabase = createServiceClient();

  const { data: run, error } = await supabase
    .from("scenario_runs")
    .select(
      "id, user_id, transcript, outcome, debrief, scenarios!inner(slug, title, brief, objective, rubric)",
    )
    .eq("id", runId)
    .maybeSingle<RunRow>();

  if (error || !run) {
    throw new Error(
      `Failed to load scenario run for debrief: ${error?.message ?? "not found"}`,
    );
  }

  // Idempotency — never re-bill on revisit.
  const existing = parseDebrief(run.debrief);
  if (existing) return existing;

  const scenario = (Array.isArray(run.scenarios)
    ? run.scenarios[0]
    : run.scenarios) as ScenarioRef | null;
  if (!scenario) {
    throw new Error(`Run ${runId} is missing its scenario join.`);
  }

  let outcomeColour: "green" | "yellow" | "red" = "yellow";
  if (run.outcome === "end_success") outcomeColour = "green";
  else if (run.outcome === "end_red") outcomeColour = "red";
  else if (run.outcome === "end_yellow") outcomeColour = "yellow";
  const turns = extractTurns(run.transcript);

  const voiceBlock = await loadCoachPromptBody("voice");
  // Quick rehearsals run shorter; the debrief follows suit per
  // Build Prompt 3.13 — 1 H1 line + ~2 green + ~1 yellow + a
  // suggestion to discuss with Coach.
  const quick = isQuickScenarioSlug(scenario.slug);
  const system = buildSystemPrompt(voiceBlock, scenario, outcomeColour, quick);
  const userBlock = buildUserBlock(scenario, turns, outcomeColour);

  const response = await nonStreamClaudeCall({
    userId: run.user_id,
    surface: "simulator_debrief",
    system,
    messages: [{ role: "user", content: userBlock }],
    maxTokens: quick ? 700 : 1500,
  });

  const raw = response.content
    .filter((c) => c.type === "text")
    .map((c) => ("text" in c ? c.text : ""))
    .join("");
  const parsed = parseDebriefJson(raw, scenario);

  const debriefData: DebriefData = {
    ...parsed,
    generated_at: new Date().toISOString(),
    read_at: null,
  };

  // Persist back into the row.
  await supabase
    .from("scenario_runs")
    .update({ debrief: debriefData as never })
    .eq("id", runId);

  return debriefData;
}

// --------------------------------------------------------------------- //
// Mark-read                                                              //
// --------------------------------------------------------------------- //

/**
 * Stamp `debrief.read_at` on the run. Idempotent on already-read.
 * Caller is expected to have already authorised access to the run.
 */
export async function markDebriefRead(runId: string): Promise<void> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("scenario_runs")
    .select("debrief")
    .eq("id", runId)
    .maybeSingle();
  const current = parseDebrief(data?.debrief);
  if (!current) return;
  if (current.read_at) return;
  const next: DebriefData = {
    ...current,
    read_at: new Date().toISOString(),
  };
  await supabase
    .from("scenario_runs")
    .update({ debrief: next as never })
    .eq("id", runId);
}

// --------------------------------------------------------------------- //
// Prompt construction                                                    //
// --------------------------------------------------------------------- //

function buildSystemPrompt(
  voiceBlock: string,
  scenario: ScenarioRef,
  outcome: "green" | "yellow" | "red",
  quick: boolean,
): string {
  // Quick rehearsals get the **shorter** form per Build Prompt 3.13:
  // one judgement line, ~2 green + ~1 yellow flags, no rehearses_for
  // ("the user just lived it"), one whats_next pointing them at the
  // Coach. Full scenarios keep the canonical structure.
  const flagGuidance = quick
    ? "Quick rehearsal — keep it tight: ~2 green flags + ~1 yellow flag total. Skip red flags unless the user genuinely fumbled. `rehearses_for` is a single sentence or empty string."
    : "Standard scenario — green outcomes typically carry 3 greens + 1-2 yellows + 0 reds; yellow outcomes 1-2 + 2-3 + 0-1; red outcomes 0-1 + 1-2 + 2-3. Always at least one item in each non-empty bucket; never more than four.";

  const nextHint = quick
    ? "For `whats_next`, surface ONE link only: a `COACH` placeholder that the caller rewrites to /coach/new. The user just rehearsed; a single onward thread is enough."
    : "For `whats_next` URLs, use the literal placeholders REPLAY / PLAYBOOK / COACH — the caller substitutes the real routes. You may include a 1-2 word topic next to PLAYBOOK if a specific playbook fits.";

  return [
    voiceBlock,
    "",
    "---",
    "",
    "## Your job in this call",
    "",
    "You are writing the **debrief** for a scenario the user just finished.",
    "The debrief is the single most important piece of editorial work in",
    "the product. It is honest, calibrated, never sycophantic.",
    quick
      ? "\nThis is a QUICK five-minute rehearsal from the Situation Room. Keep the debrief proportionate — a tight read of what just happened, not a full structural breakdown."
      : "",
    "",
    "Read the transcript. Compare it to the scenario's rubric below.",
    `The scenario's outcome was a ${outcome}-flag result — calibrate the`,
    "judgement and the flag distribution accordingly.",
    "",
    "## Scenario rubric (canonical signals to look for)",
    "",
    "Green:",
    ...scenario.rubric.green.map((g) => `- ${g}`),
    "Yellow:",
    ...scenario.rubric.yellow.map((y) => `- ${y}`),
    "Red:",
    ...scenario.rubric.red.map((r) => `- ${r}`),
    "",
    "## Output format — MANDATORY",
    "",
    "Return a single JSON object, no prose around it. Schema:",
    "",
    "```",
    "{",
    '  "judgement": "single line. Fraunces-italic register. Examples that pass: \\"You held the room. Just.\\" / \\"You stumbled on Marcus.\\" / \\"You read Sam, then lost Priya.\\" Examples that fail: anything with an exclamation mark, anything starting with \\"Great\\".",',
    '  "context_paragraph": "2-3 sentences naming what happened. Specific to this run, not generic. No flattery.",',
    '  "green_flags": [ {"text": "one editorial line, behaviour-anchored", "ranked": 1}, ... ],',
    '  "yellow_flags": [ {"text": "...", "ranked": 1}, ... ],',
    '  "red_flags": [ {"text": "...", "ranked": 1}, ... ],',
    '  "rehearses_for": "one sentence naming the broader workplace pattern this scenario rehearses for",',
    '  "whats_next": [',
    '    {"label": "Replay this scenario", "url": "REPLAY"},',
    '    {"label": "Read the X playbook", "url": "PLAYBOOK"},',
    '    {"label": "Ask the Coach about your specific situation", "url": "COACH"}',
    "  ]",
    "}",
    "```",
    "",
    flagGuidance,
    "",
    nextHint,
  ].join("\n");
}

function buildUserBlock(
  scenario: ScenarioRef,
  turns: Array<{ speaker: string; content: string }>,
  outcome: "green" | "yellow" | "red",
): string {
  const transcriptBlock = turns
    .map((t, i) => `[${i + 1}] ${t.speaker}: ${t.content}`)
    .join("\n");
  return [
    `## Scenario: ${scenario.title}`,
    "",
    "### Brief",
    scenario.brief,
    "",
    "### Objective",
    scenario.objective,
    "",
    `### Outcome: ${outcome}`,
    "",
    "### Transcript",
    transcriptBlock,
  ].join("\n");
}

// --------------------------------------------------------------------- //
// Parsing                                                                //
// --------------------------------------------------------------------- //

function parseDebrief(raw: unknown): DebriefData | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.judgement !== "string" || obj.judgement.length === 0) {
    return null;
  }
  return {
    judgement: String(obj.judgement),
    context_paragraph: String(obj.context_paragraph ?? ""),
    green_flags: parseFlags(obj.green_flags),
    yellow_flags: parseFlags(obj.yellow_flags),
    red_flags: parseFlags(obj.red_flags),
    rehearses_for: String(obj.rehearses_for ?? ""),
    whats_next: parseNext(obj.whats_next),
    read_at: typeof obj.read_at === "string" ? obj.read_at : null,
    generated_at:
      typeof obj.generated_at === "string" ? obj.generated_at : undefined,
  };
}

function parseFlags(raw: unknown): DebriefFlag[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, idx) => {
      if (typeof item === "string") {
        return { text: item, ranked: idx + 1 };
      }
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        const text = typeof o.text === "string" ? o.text : null;
        if (!text) return null;
        const ranked =
          typeof o.ranked === "number" && Number.isFinite(o.ranked)
            ? o.ranked
            : idx + 1;
        return { text, ranked };
      }
      return null;
    })
    .filter((f): f is DebriefFlag => f !== null);
}

function parseNext(raw: unknown): DebriefNextLink[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        const label = typeof o.label === "string" ? o.label : null;
        const url = typeof o.url === "string" ? o.url : null;
        if (label && url) return { label, url };
      }
      return null;
    })
    .filter((n): n is DebriefNextLink => n !== null);
}

function parseDebriefJson(
  raw: string,
  scenario: ScenarioRef,
): Omit<DebriefData, "read_at" | "generated_at"> {
  const candidates = [raw.trim()];
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) candidates.push(match[0]);

  for (const c of candidates) {
    try {
      const parsed = JSON.parse(c) as Record<string, unknown>;
      const debrief = parseDebrief({ ...parsed, read_at: null });
      if (debrief) {
        return resolveNextLinks(
          {
            judgement: debrief.judgement,
            context_paragraph: debrief.context_paragraph,
            green_flags: debrief.green_flags,
            yellow_flags: debrief.yellow_flags,
            red_flags: debrief.red_flags,
            rehearses_for: debrief.rehearses_for,
            whats_next: debrief.whats_next,
          },
          scenario,
        );
      }
    } catch {
      // try next candidate
    }
  }

  // Hard fallback — generate a quiet, on-voice debrief from the rubric
  // so the user never sees a blank surface if the model misfires.
  return resolveNextLinks(
    {
      judgement: "You finished the scenario.",
      context_paragraph:
        "The debrief generator didn't return a parseable response. The transcript is saved; you can replay the scenario if you want a second read.",
      green_flags: scenario.rubric.green.slice(0, 1).map((text, idx) => ({
        text,
        ranked: idx + 1,
      })),
      yellow_flags: [],
      red_flags: [],
      rehearses_for: scenario.objective,
      whats_next: FALLBACK_NEXT_LINKS,
    },
    scenario,
  );
}

/**
 * The model emits literal "REPLAY" / "PLAYBOOK" / "COACH" placeholders
 * for `whats_next` URLs. Rewrite them to real route paths before
 * persisting.
 */
function resolveNextLinks<
  T extends { whats_next: DebriefNextLink[] },
>(parsed: T, scenario: ScenarioRef): T {
  const next = parsed.whats_next.map((n) => {
    if (n.url === "REPLAY") {
      return { ...n, url: `/simulator/${scenario.slug}/brief` };
    }
    if (n.url === "COACH") {
      return { ...n, url: `/coach/new` };
    }
    if (n.url === "PLAYBOOK") {
      return { ...n, url: `/playbook` };
    }
    return n;
  });
  return { ...parsed, whats_next: next };
}

function extractTurns(
  transcript: unknown,
): Array<{ speaker: string; content: string }> {
  if (!transcript || typeof transcript !== "object") return [];
  const obj = transcript as Record<string, unknown>;
  if (!Array.isArray(obj.turns)) return [];
  return (obj.turns as unknown[]).flatMap((t) => {
    if (
      t &&
      typeof t === "object" &&
      typeof (t as { speaker?: unknown }).speaker === "string" &&
      typeof (t as { content?: unknown }).content === "string"
    ) {
      return [
        {
          speaker: (t as { speaker: string }).speaker,
          content: (t as { content: string }).content,
        },
      ];
    }
    return [];
  });
}
