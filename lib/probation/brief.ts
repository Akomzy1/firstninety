/**
 * Probation Brief generator.
 *
 * Single non-streaming Opus call. Pulls the user's probation evidence
 * (via `get_probation_evidence` server-side), composes a one-page
 * structured Brief per the Probation Prep Pack template, persists into
 * `probation_artefacts` with `artefact_type = 'brief'` and
 * `is_current = true` (prior currents flipped to false).
 *
 * Rate-limited: max 3 active generations per user (MVP Spec §11 open
 * question recommendation). The cap counts current + historical
 * artefact rows of type `brief`.
 *
 * Per PRD §6.6, SKILL §7.1, MVP Spec §2.5.
 */
import "server-only";

import { nonStreamClaudeCall } from "@/lib/coach/claude";
import { execute as getProbationEvidence } from "@/lib/coach/tools/get-probation-evidence";
import {
  loadCoachPromptBody,
  loadProbationPromptBody,
} from "@/lib/content/loaders";
import { createServiceClient } from "@/lib/db/service";
import { getDayState } from "@/lib/home/day-state";
import { captureServerEvent } from "@/lib/tracing/posthog-server";

export type ProbationBriefData = {
  byline: string;
  generated_at: string;
  delivered: { title: string; body: string };
  learned: { title: string; body: string };
  want_next: { title: string; body: string };
  evidence: Array<{ title: string; body: string }>;
  questions: string[];
  /** Per-section user edits keyed by section name, applied on render. */
  user_edits?: Record<string, string>;
  read_at?: string | null;
};

export type GenerateBriefResult =
  | { ok: true; artefactId: string; brief: ProbationBriefData }
  | { ok: false; reason: "limit"; used: number; limit: number }
  | { ok: false; reason: "not_in_probation_mode" }
  | { ok: false; reason: "error"; message: string };

const MAX_GENERATIONS = 3;

export async function generateProbationBrief({
  userId,
}: {
  userId: string;
}): Promise<GenerateBriefResult> {
  const supabase = createServiceClient();

  // 1. Load context + user — refuse if probation mode isn't active.
  const [ctxResult, userRowResult] = await Promise.all([
    supabase
      .from("user_context")
      .select(
        "probation_mode_active, start_date, probation_review_date, created_at, entry_state",
      )
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("users")
      .select("display_name, email, primary_role")
      .eq("id", userId)
      .maybeSingle(),
  ]);
  if (!ctxResult.data?.probation_mode_active) {
    return { ok: false, reason: "not_in_probation_mode" };
  }

  // 2. 3-generation rate limit (active + historical).
  const { count } = await supabase
    .from("probation_artefacts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("artefact_type", "brief");
  const usedCount = count ?? 0;
  if (usedCount >= MAX_GENERATIONS) {
    return {
      ok: false,
      reason: "limit",
      used: usedCount,
      limit: MAX_GENERATIONS,
    };
  }

  // 3. Pull the evidence via the same tool the Coach uses.
  const dayState = getDayState(ctxResult.data.start_date ?? null);
  const evidence = await getProbationEvidence(
    {},
    {
      userId,
      role: (userRowResult.data?.primary_role ?? null) as
        | "ba"
        | "pm"
        | "sm"
        | "po"
        | "da"
        | "aie"
        | null,
      currentDay: dayState.day,
      currentWeek: dayState.week,
    },
  );

  // 3.5. Evidence-depth check. A user with zero completed missions AND
  // fewer than 5 combined simulator runs + situation sessions is in
  // "thin evidence" territory — typically State C users who joined
  // FirstNinety after their first 90 days had already passed. The
  // Brief generator's standard prompt assumes the user ran the
  // curriculum; for thin-evidence users we prepend an editorial
  // override that reframes the Brief honestly.
  const simulatorRunCount =
    evidence.green_scenario_runs.length +
    evidence.yellow_scenario_runs.length;
  const isThinEvidence =
    evidence.completed_missions.length === 0 &&
    simulatorRunCount + evidence.recent_situations.length < 5;
  const daysSinceSignup = ctxResult.data.created_at
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(ctxResult.data.created_at).getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  // 4. Compose the system + user prompts.
  const voice = await loadCoachPromptBody("voice");
  const probationVoice = await loadCoachPromptBody("probation-voice");
  const thinEvidencePreamble = isThinEvidence
    ? await loadProbationPromptBody("brief-thin-evidence-preamble").catch(
        (err) => {
          console.warn(
            "[probation-brief] thin-evidence preamble missing; falling back to standard prompt",
            err,
          );
          return null;
        },
      )
    : null;
  const system = buildSystemPrompt(voice, probationVoice, thinEvidencePreamble);
  const userBlock = buildUserBlock(
    userRowResult.data,
    evidence,
    isThinEvidence ? { daysSinceSignup } : null,
  );

  let raw: string;
  try {
    const response = await nonStreamClaudeCall({
      userId,
      surface: "coach", // Brief is Coach-voiced; categorised as coach for cost tracking.
      system,
      messages: [{ role: "user", content: userBlock }],
      maxTokens: 1800,
    });
    raw = response.content
      .filter((c) => c.type === "text")
      .map((c) => ("text" in c ? c.text : ""))
      .join("");
  } catch (err) {
    console.error("[probation-brief] generation failed", err);
    return {
      ok: false,
      reason: "error",
      message:
        err instanceof Error
          ? err.message
          : "We couldn't draft the Brief right now.",
    };
  }

  const parsed = parseBrief(raw);
  if (!parsed) {
    return {
      ok: false,
      reason: "error",
      message: "The generator returned an unreadable response. Try again.",
    };
  }

  const byline =
    parsed.byline?.trim() ||
    (userRowResult.data?.display_name ??
      userRowResult.data?.email?.split("@")[0] ??
      "Your brief");
  const generatedAt = new Date().toISOString();
  const briefData: ProbationBriefData = {
    byline,
    generated_at: generatedAt,
    delivered: parsed.delivered,
    learned: parsed.learned,
    want_next: parsed.want_next,
    evidence: parsed.evidence,
    questions: parsed.questions,
    user_edits: {},
    read_at: null,
  };

  // 5. Flip prior currents off, then insert as current.
  await supabase
    .from("probation_artefacts")
    .update({ is_current: false })
    .eq("user_id", userId)
    .eq("artefact_type", "brief")
    .eq("is_current", true);

  const { data: inserted, error: insertErr } = await supabase
    .from("probation_artefacts")
    .insert({
      user_id: userId,
      artefact_type: "brief",
      content: briefData as never,
      is_current: true,
      generated_at: generatedAt,
      version: usedCount + 1,
    })
    .select("id")
    .single();
  if (insertErr || !inserted) {
    console.error("[probation-brief] insert failed", insertErr);
    return {
      ok: false,
      reason: "error",
      message: "Couldn't save the Brief. Try again in a moment.",
    };
  }

  // 6. Stamp user_context.probation_brief_generated_at so other surfaces
  //    can show the "brief generated" state.
  await supabase
    .from("user_context")
    .update({ probation_brief_generated_at: generatedAt })
    .eq("user_id", userId);

  try {
    await captureServerEvent({
      distinctId: userId,
      event: "probation_brief_generated",
      properties: {
        generation_number: usedCount + 1,
        days_to_review: dayState.day > 90 ? null : 90 - dayState.day,
      },
    });
  } catch (err) {
    console.warn("[probation-brief] event capture failed", err);
  }

  return { ok: true, artefactId: inserted.id, brief: briefData };
}

/**
 * Load the user's current Probation Brief (if any). Used by
 * /probation/brief on render.
 */
export async function loadCurrentProbationBrief({
  userId,
}: {
  userId: string;
}): Promise<{
  brief: ProbationBriefData;
  artefactId: string;
  used: number;
  limit: number;
} | null> {
  const supabase = createServiceClient();
  const [briefResult, countResult] = await Promise.all([
    supabase
      .from("probation_artefacts")
      .select("id, content, generated_at")
      .eq("user_id", userId)
      .eq("artefact_type", "brief")
      .eq("is_current", true)
      .maybeSingle(),
    supabase
      .from("probation_artefacts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("artefact_type", "brief"),
  ]);
  if (!briefResult.data) return null;
  const content = briefResult.data.content as unknown;
  if (!content || typeof content !== "object") return null;
  const data = content as ProbationBriefData;
  return {
    brief: data,
    artefactId: briefResult.data.id,
    used: countResult.count ?? 0,
    limit: MAX_GENERATIONS,
  };
}

export { MAX_GENERATIONS };

// --------------------------------------------------------------------- //
// Prompts                                                                //
// --------------------------------------------------------------------- //

function buildSystemPrompt(
  voice: string,
  probationVoice: string,
  thinEvidencePreamble: string | null,
): string {
  const blocks: string[] = [voice, "", "---", "", probationVoice];
  if (thinEvidencePreamble) {
    blocks.push("", "---", "", thinEvidencePreamble);
  }
  return [
    ...blocks,
    "",
    "---",
    "",
    "## Your job in this call",
    "",
    "You are drafting the user's Probation Brief — a one-page document",
    "they will take into their formal probation review. The Brief is the",
    "canonical Probation Prep Pack artefact (Skill §7.1).",
    "",
    "Voice rules apply (calm senior colleague, no exclamation, no",
    "'Great work', no celebration). The voice is the user's own — write",
    "in first person, present tense, as if the user is speaking the",
    "Brief aloud to their manager.",
    "",
    "## Structure — MANDATORY",
    "",
    "Return a single JSON object, no prose around it:",
    "",
    "```",
    "{",
    '  "byline": "user\'s display name or empty string",',
    '  "delivered": { "title": "Delivered.", "body": "1-2 short paragraphs in first person, specific deliverables named, with quiet receipts. No adjectives where verbs would do." },',
    '  "learned": { "title": "Learned.", "body": "1-2 short paragraphs. INCLUDES something the user misjudged or got wrong, and what changed because of it." },',
    '  "want_next": { "title": "Want next.", "body": "1-2 short paragraphs. Ends with one specific thing the user wants from the manager to make the next 90 days possible." },',
    '  "evidence": [',
    '    { "title": "Short title, period-terminated.", "body": "2-3 sentences naming when, who (anonymised), what happened, why it counts." }',
    "  ],",
    '  "questions": [',
    '    "Three questions the user will bring to the review. Each one a single sentence. The first asks the manager what they want from the next 90 days; the second asks for a sharpness they want; the third surfaces a stretch piece of work."',
    "  ]",
    "}",
    "```",
    "",
    "Constraints:",
    "- 3 evidence items, no more, no less.",
    "- 3 questions, no more, no less.",
    "- Every body field uses two short paragraphs separated by a single",
    "  blank line. The user reads this on screen and on paper.",
    "- Anonymise every colleague reference. Say 'my lead dev' / 'the",
    "  sponsor' / 'my manager'. Never a name from the user's evidence.",
    "- If the evidence trail is thin, say so honestly in the Learned",
    "  section ('I have less to show in week 4 than I thought I would.')",
    "  — do NOT fabricate accomplishments.",
  ].join("\n");
}

function buildUserBlock(
  user: { display_name: string | null; primary_role: string | null } | null | undefined,
  evidence: Awaited<ReturnType<typeof getProbationEvidence>>,
  thinEvidence: { daysSinceSignup: number | null } | null,
): string {
  const role = user?.primary_role?.toUpperCase() ?? "(role unknown)";
  const evidenceWindowLine = thinEvidence
    ? `- Evidence window inside FirstNinety: ${
        thinEvidence.daysSinceSignup === null
          ? "(unknown)"
          : `${thinEvidence.daysSinceSignup} day${thinEvidence.daysSinceSignup === 1 ? "" : "s"}`
      } (user joined after their first 90 days had already passed; no Mission Track history to draw from)`
    : null;
  return [
    `# User snapshot`,
    "",
    `- Name: ${user?.display_name ?? "(not set)"}`,
    `- Role: ${role}`,
    `- Days to review: ${evidence.probation.days_to_review ?? "(not set)"}`,
    ...(evidenceWindowLine ? [evidenceWindowLine] : []),
    "",
    `# Completed missions (last 90 days, most recent first)`,
    ...(evidence.completed_missions.length === 0
      ? ["(none)"]
      : evidence.completed_missions.map(
          (m) =>
            `- Week ${m.week}: ${m.title} — reflection: ${m.reflection ?? "(none)"}`,
        )),
    "",
    `# Green-scored Simulator runs`,
    ...(evidence.green_scenario_runs.length === 0
      ? ["(none)"]
      : evidence.green_scenario_runs.map(
          (r) =>
            `- ${r.scenario_title}${r.judgement ? ` — debrief: ${r.judgement}` : ""}`,
        )),
    "",
    `# Yellow-scored Simulator runs (for "Learned")`,
    ...(evidence.yellow_scenario_runs.length === 0
      ? ["(none)"]
      : evidence.yellow_scenario_runs.map(
          (r) =>
            `- ${r.scenario_title}${r.judgement ? ` — debrief: ${r.judgement}` : ""}`,
        )),
    "",
    `# Recent Situation Room sessions`,
    ...(evidence.recent_situations.length === 0
      ? ["(none)"]
      : evidence.recent_situations
          .slice(0, 6)
          .map(
            (s) => `- [${s.entry_type}] ${s.summary}`,
          )),
    "",
    "Draft the Brief per the schema in your system prompt. JSON only.",
  ].join("\n");
}

// --------------------------------------------------------------------- //
// Parsing                                                                //
// --------------------------------------------------------------------- //

type ParsedBrief = {
  byline: string;
  delivered: { title: string; body: string };
  learned: { title: string; body: string };
  want_next: { title: string; body: string };
  evidence: Array<{ title: string; body: string }>;
  questions: string[];
};

function parseBrief(raw: string): ParsedBrief | null {
  const candidates = [raw.trim()];
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) candidates.push(match[0]);

  for (const c of candidates) {
    try {
      const obj = JSON.parse(c) as Record<string, unknown>;
      const parsed = coerce(obj);
      if (parsed) return parsed;
    } catch {
      // try next
    }
  }
  return null;
}

function coerce(obj: Record<string, unknown>): ParsedBrief | null {
  const delivered = coerceSection(obj.delivered);
  const learned = coerceSection(obj.learned);
  const want_next = coerceSection(obj.want_next);
  if (!delivered || !learned || !want_next) return null;

  const evidence: Array<{ title: string; body: string }> = [];
  if (Array.isArray(obj.evidence)) {
    for (const item of obj.evidence) {
      const section = coerceSection(item);
      if (section) evidence.push(section);
    }
  }
  // The schema asks for 3; tolerate 1-4 but never empty.
  if (evidence.length === 0) return null;

  const questions: string[] = [];
  if (Array.isArray(obj.questions)) {
    for (const q of obj.questions) {
      if (typeof q === "string" && q.trim().length > 0) {
        questions.push(q.trim());
      }
    }
  }
  if (questions.length === 0) return null;

  return {
    byline:
      typeof obj.byline === "string" && obj.byline.trim().length > 0
        ? obj.byline.trim()
        : "",
    delivered,
    learned,
    want_next,
    evidence,
    questions,
  };
}

function coerceSection(
  raw: unknown,
): { title: string; body: string } | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const title =
    typeof obj.title === "string" && obj.title.trim().length > 0
      ? obj.title.trim()
      : null;
  const body =
    typeof obj.body === "string" && obj.body.trim().length > 0
      ? obj.body.trim()
      : null;
  if (!title || !body) return null;
  return { title, body };
}
