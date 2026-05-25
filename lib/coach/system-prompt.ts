/**
 * Coach system-prompt composer.
 *
 * Assembles the Coach's voice + behaviour stack from the markdown
 * blocks in content/coach-prompts/ plus a runtime-generated user
 * context block (role, week, day, recent activity, probation state).
 *
 * Block order, top-down (the `<safety_rules>` block is prepended later
 * by lib/coach/claude.ts on the way to the SDK):
 *
 *   1. Role priming        — content/coach-prompts/role-{role}.md
 *   2. Voice & behaviour   — content/coach-prompts/voice.md
 *   3. Day-state priming   — generated; selects Days-1-90 vs Day-91+
 *                            framing per SKILL §8.2
 *   4. Probation overlay   — content/coach-prompts/probation-voice.md,
 *                            only when probation_mode_active
 *   5. Current context     — generated from user_context + recent rows
 *   6. Tool reminder       — short note that tool calls are budgeted
 *
 * Per MVP Spec §4.2, PRD v1.8 §9.5, SKILL.md v1.2 §8.
 */
import "server-only";

import { createServiceClient } from "@/lib/db/service";
import { loadCoachPromptBody } from "@/lib/content/loaders";
import { getDayState } from "@/lib/home/day-state";

type Role = "ba" | "pm" | "sm" | "po" | "da" | "aie";

export type CoachContext = {
  userId: string;
  role: Role | null;
  currentWeek: number;
  currentDay: number;
  dayMode: "day-1" | "day-n" | "post-90";
  probationModeActive: boolean;
  probationReviewDate: string | null;
  daysToReview: number | null;
};

/**
 * Loads the user's runtime context once per request. Other callers
 * (system-prompt composer + tools) read from the returned object so we
 * don't repeat the DB hit.
 */
export async function loadCoachContext(userId: string): Promise<CoachContext> {
  const supabase = createServiceClient();

  const [userResult, ctxResult] = await Promise.all([
    supabase.from("users").select("primary_role").eq("id", userId).single(),
    supabase
      .from("user_context")
      .select(
        "start_date, probation_mode_active, probation_review_date",
      )
      .eq("user_id", userId)
      .single(),
  ]);

  const role = (userResult.data?.primary_role ?? null) as Role | null;
  const startDate = ctxResult.data?.start_date ?? null;
  const dayState = getDayState(startDate);
  const probationModeActive = ctxResult.data?.probation_mode_active ?? false;
  const probationReviewDate = ctxResult.data?.probation_review_date ?? null;

  let daysToReview: number | null = null;
  if (probationReviewDate) {
    try {
      const target = new Date(`${probationReviewDate}T00:00:00Z`).getTime();
      const diffMs = target - Date.now();
      daysToReview = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
    } catch {
      daysToReview = null;
    }
  }

  return {
    userId,
    role,
    currentWeek: dayState.week,
    currentDay: dayState.day,
    dayMode: dayState.mode,
    probationModeActive,
    probationReviewDate,
    daysToReview,
  };
}

/**
 * Build the surface-specific system prompt (without the safety block —
 * lib/coach/claude.ts prepends that). Returns a single string ready to
 * pass to `streamClaudeResponse({system, …})`.
 */
export async function buildCoachSystemPrompt(
  context: CoachContext,
): Promise<string> {
  const blocks: string[] = [];

  // 1. Role priming. Day-state determines *which* file we read:
  //    - Days 1-90 → `role-{role}.md`            (first-90 framing)
  //    - Day 91+    → `post-90-context.md`        (post-90 framing,
  //                   single file with six role sections keyed by slug)
  //    Falls back to a tight "role unknown" sentence so we never block on
  //    a missing primary_role.
  if (context.role) {
    blocks.push(await loadRolePrimingBlock(context.role, context.dayMode));
  } else {
    blocks.push(
      "The user has not picked a role yet. Coach them in the senior-colleague register and gently steer them to set their role in Settings → Account so role-specific priming kicks in.",
    );
  }

  // 2. Core voice + behaviour.
  blocks.push(await loadCoachPromptBody("voice"));

  // 3. Day-state priming. Two variants per SKILL §8.2.
  blocks.push(buildDayStateBlock(context));

  // 4. Probation overlay (only when active).
  if (context.probationModeActive) {
    blocks.push(await loadCoachPromptBody("probation-voice"));
  }

  // 5. Current context summary (always — keeps replies grounded).
  blocks.push(buildContextSummary(context));

  // 6. Tool budget reminder.
  blocks.push(buildToolReminder(context.probationModeActive));

  return blocks.join("\n\n---\n\n");
}

async function loadRolePrimingBlock(
  role: Role,
  dayMode: CoachContext["dayMode"],
): Promise<string> {
  if (dayMode === "post-90") {
    try {
      const body = await loadCoachPromptBody("post-90-context");
      const section = extractRoleSection(body, role);
      if (section) return section;
    } catch {
      // fall through to the generic fallback below
    }
    return `The user is a ${role.toUpperCase()} who has completed their first 90 days at this organisation. Treat them as a working professional — not new. Post-90 role-specific priming has not been authored for this role; coach in the senior-colleague register.`;
  }

  try {
    return await loadCoachPromptBody(`role-${role}`);
  } catch {
    return `The user's role is ${role.toUpperCase()}. Role-specific priming for this role has not been authored yet — coach them in the senior-colleague register and steer specific tradecraft questions to a Playbook search.`;
  }
}

/**
 * Pulls the section that opens with `## <role>` out of a multi-role
 * markdown file. Returns the body text (trimmed) up to the next H2 or
 * EOF. Returns null if the role's section isn't present.
 */
function extractRoleSection(body: string, role: Role): string | null {
  const lines = body.split(/\r?\n/);
  const headingRe = /^##\s+([a-z]+)\s*$/i;
  let inSection = false;
  const out: string[] = [];
  for (const line of lines) {
    const match = headingRe.exec(line);
    if (match) {
      const key = (match[1] ?? "").toLowerCase();
      if (inSection) break; // hit the next role's section
      if (key === role) {
        inSection = true;
        continue; // skip the heading itself
      }
    } else if (inSection) {
      out.push(line);
    }
  }
  if (!inSection) return null;
  const trimmed = out.join("\n").trim();
  return trimmed.length > 0 ? trimmed : null;
}

function buildDayStateBlock(context: CoachContext): string {
  if (context.dayMode === "post-90") {
    return [
      "## Day-state priming — post-Day-90",
      "",
      `The user completed their first 90 days at this organisation. They are now ${weeksBeyond90(context.currentDay)} weeks into the role beyond probation. They are no longer "new" — treat them as a working professional who is surviving and now wants to be *good* at their job, not just *competent*.`,
      "",
      "Do not suggest the Mission Track — it concluded for this user. Do not use first-90-days framing (\"by week 6 you should…\"). Reach for the surfaces the user still has: Situation Room, Playbook Library, Simulator, Coach itself.",
    ].join("\n");
  }

  return [
    "## Day-state priming — first 90 days",
    "",
    `The user is in Week ${context.currentWeek} of their first 90 days at a new role (Day ${context.currentDay} of 90). Calibrate your replies against this — a week-3 user gets different framing than a week-10 user even for the same question.`,
  ].join("\n");
}

function weeksBeyond90(currentDay: number): number {
  const beyond = currentDay - 90;
  if (beyond <= 0) return 0;
  return Math.max(1, Math.floor(beyond / 7));
}

function buildContextSummary(context: CoachContext): string {
  const lines: string[] = ["## Current context", ""];
  if (context.role) lines.push(`- Role: ${context.role.toUpperCase()}`);
  if (context.dayMode !== "post-90") {
    lines.push(`- Week ${context.currentWeek}, Day ${context.currentDay} of 90`);
  } else {
    lines.push(`- Day ${context.currentDay} (past Day 90)`);
  }
  if (context.probationModeActive) {
    if (context.daysToReview !== null) {
      lines.push(
        `- Probation Mode is **active**. Review in ${context.daysToReview} day${
          context.daysToReview === 1 ? "" : "s"
        }.`,
      );
    } else {
      lines.push(
        "- Probation Mode is **active** but no review date is on file.",
      );
    }
  }
  return lines.join("\n");
}

function buildToolReminder(probationActive: boolean): string {
  const budget = probationActive ? 4 : 3;
  return [
    "## Tools",
    "",
    `You have tools available — \`get_user_context\`, \`search_playbooks\`, \`get_situation_history\`${probationActive ? ", and `get_probation_evidence`" : ""}. Use them when grounding your reply in the user's actual situation would make it tighter and more specific. Maximum ${budget} tool calls per response. Don't tool-call when a plain answer is enough — the user is waiting.`,
  ].join("\n");
}
