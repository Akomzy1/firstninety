/**
 * Safety orchestration — runs the three pure checks from
 * `lib/safety/checks.ts` against a user message and returns a combined
 * result. Also vends the crisis-priming system message block that gets
 * prepended (in addition to the standing safety.md rules) when a
 * crisis category fires.
 *
 * Per MVP Spec §4.6.
 */

import {
  checkForCrisisKeywords,
  checkForPII,
  checkForRealNames,
  type CrisisCategory,
  type PIIType,
} from "./checks";

export type PreFlightResult = {
  crisis: {
    matched: boolean;
    category: CrisisCategory | null;
  };
  pii: {
    has_pii: boolean;
    types: PIIType[];
  };
  names: {
    has_likely_names: boolean;
    matches: string[];
  };
};

export function runPreFlightChecks(text: string): PreFlightResult {
  const crisis = checkForCrisisKeywords(text);
  const pii = checkForPII(text);
  const names = checkForRealNames(text);
  return {
    crisis: { matched: crisis.matched, category: crisis.category ?? null },
    pii: { has_pii: pii.has_pii, types: pii.types },
    names: { has_likely_names: names.has_likely_names, matches: names.matches },
  };
}

/**
 * When a crisis category fires, this block is prepended to the
 * surface-specific system prompt (it sits between the safety.md
 * `<safety_rules>` block and the surface prompt body).
 *
 * Voice rules per SKILL §10: don't catastrophise back at the user,
 * don't problem-solve in the clinical lane, never imply the AI can
 * triage. Acknowledge, normalise, surface the referral — that's it.
 */
export function getCrisisSystemMessage(category: CrisisCategory): string {
  const shared =
    "The user's message contains language that may indicate distress or harm. " +
    "Respond with extra care. Do not minimise, do not catastrophise, do not " +
    "diagnose. Acknowledge what they've shared in one or two sentences and " +
    "then pivot to the workplace question, if any, that prompted them to write. " +
    "A crisis-referral surface will render alongside your response, so do NOT " +
    "list helplines in your reply yourself — the UI handles that and a duplicate " +
    "in your prose would feel rote.";

  switch (category) {
    case "self_harm":
      return `<crisis_overlay>\n${shared} The user has used language suggesting self-harm or suicidal ideation. Stay calm, keep the reply short, and prioritise their safety over completing the task they asked about.\n</crisis_overlay>`;
    case "harassment":
      return `<crisis_overlay>\n${shared} The user has described being harassed or bullied. You do not give legal advice (see safety_rules) but you may help them think through next steps that are inside professional tradecraft — documenting what happened, talking to HR, talking to a trusted senior.\n</crisis_overlay>`;
    case "abuse":
      return `<crisis_overlay>\n${shared} The user has described abuse or assault. Decline to investigate or analyse the situation; surface the referral and keep your own reply short and grounded.\n</crisis_overlay>`;
  }
}
