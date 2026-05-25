/**
 * Pure pre-flight content checks for user-typed messages.
 *
 * Three independent checks per MVP Spec §4.6:
 *   1. Crisis keywords — categorised so the AI can be primed with the
 *      right additional system message (self-harm vs harassment vs abuse).
 *   2. PII — email addresses + phone numbers.
 *   3. Real-name heuristic — capitalised given names in proximity to
 *      role indicators ("my lead dev Sam"), without false-flagging
 *      bare role mentions ("my lead dev").
 *
 * No I/O, no AI, no `server-only`. Safe in client bundles if needed —
 * the streaming endpoint is the primary caller but the UI may also
 * invoke them for live composer hints.
 */

// --------------------------------------------------------------------- //
// 1. Crisis keywords                                                    //
// --------------------------------------------------------------------- //

export type CrisisCategory = "self_harm" | "harassment" | "abuse";

export type CrisisCheckResult =
  | { matched: false; category: null }
  | { matched: true; category: CrisisCategory };

/**
 * Patterns are intentionally specific. They are *not* a clinical
 * detector — they exist to add a safety overlay when the user uses
 * language that warrants it. False negatives are preferred over false
 * positives; the Coach's voice rules already keep the AI from
 * over-stepping when the model itself notices distress.
 */
const CRISIS_PATTERNS: Array<{ regex: RegExp; category: CrisisCategory }> = [
  // Self-harm / suicidal ideation.
  { regex: /\b(suicide|suicidal|want(ing)? to die|kill myself|end (it|my life)|not want to be alive|harm myself|hurt myself|self[-\s]?harm|cutting myself)\b/i, category: "self_harm" },
  // Harassment — at-work behaviours that warrant guardrail support.
  { regex: /\b(being )?(harassed|harassment|bullied|bullying|stalked|threatened)\b/i, category: "harassment" },
  // Abuse — broader pattern; domestic / relationship / workplace abuse.
  { regex: /\b(abuse(d|r)?|abusive|assault(ed)?|hit me|attacked me)\b/i, category: "abuse" },
];

export function checkForCrisisKeywords(text: string): CrisisCheckResult {
  if (!text) return { matched: false, category: null };
  for (const { regex, category } of CRISIS_PATTERNS) {
    if (regex.test(text)) return { matched: true, category };
  }
  return { matched: false, category: null };
}

// --------------------------------------------------------------------- //
// 2. PII                                                                //
// --------------------------------------------------------------------- //

export type PIIType = "email" | "phone";

export type PIICheckResult = {
  has_pii: boolean;
  types: PIIType[];
};

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
// Generic phone matcher — at least 7 digits, allows + prefix, spaces,
// dashes, parens. Intentionally lenient; better to over-prompt than miss.
const PHONE_PATTERN = /(\+?\d[\d\s().-]{6,}\d)/;

export function checkForPII(text: string): PIICheckResult {
  if (!text) return { has_pii: false, types: [] };
  const types: PIIType[] = [];
  if (EMAIL_PATTERN.test(text)) types.push("email");
  if (PHONE_PATTERN.test(text)) types.push("phone");
  return { has_pii: types.length > 0, types };
}

// --------------------------------------------------------------------- //
// 3. Real-name heuristic                                                //
// --------------------------------------------------------------------- //

export type RealNameCheckResult = {
  has_likely_names: boolean;
  matches: string[];
};

/**
 * Role indicators that, when followed (or preceded) by a capitalised
 * proper-noun-looking word, suggest the user has slipped a real name
 * into their description. Kept narrow on purpose — the goal is to
 * catch high-confidence cases and gently nudge, not to grep every
 * proper noun.
 */
const ROLE_PREFIXES = [
  "my lead dev",
  "my lead developer",
  "my dev",
  "my developer",
  "my pm",
  "my project manager",
  "my product manager",
  "my po",
  "my product owner",
  "my sm",
  "my scrum master",
  "my ba",
  "my business analyst",
  "my da",
  "my data analyst",
  "my manager",
  "my boss",
  "my director",
  "my vp",
  "my cto",
  "my ceo",
  "my sponsor",
  "my tech lead",
  "my engineering manager",
  "my designer",
  "my qa",
  "my qa lead",
  "my analyst",
  "my colleague",
  "my coworker",
  "my teammate",
  "my report",
  "my mentor",
];

/**
 * Common everyday capitalised words that look like names but are not.
 * Doesn't need to be exhaustive — the regex below already requires
 * proximity to a role indicator, which filters most noise.
 */
const NAME_STOPWORDS = new Set([
  "I",
  "I'm",
  "I've",
  "The",
  "But",
  "And",
  "Yes",
  "No",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);

/**
 * Finds capitalised tokens (likely names) appearing within ~3 words of
 * any ROLE_PREFIX. Returns the captured tokens. Conservative on
 * purpose — we want a single example to gently prompt the user, not a
 * list of every cap-letter token in the message.
 */
export function checkForRealNames(text: string): RealNameCheckResult {
  if (!text) return { has_likely_names: false, matches: [] };
  const matches = new Set<string>();
  const lower = text.toLowerCase();

  for (const prefix of ROLE_PREFIXES) {
    let idx = 0;
    while (true) {
      const found = lower.indexOf(prefix, idx);
      if (found === -1) break;
      idx = found + prefix.length;
      // Slice the next ~30 chars from the original (case-preserving) text.
      const window = text.slice(idx, idx + 30);
      const tokenMatch = /\s+([A-Z][a-z]{1,}(?:'s)?)/.exec(window);
      if (tokenMatch && tokenMatch[1]) {
        const token = tokenMatch[1].replace(/'s$/, "");
        if (!NAME_STOPWORDS.has(token)) {
          matches.add(token);
        }
      }
    }
  }

  return {
    has_likely_names: matches.size > 0,
    matches: Array.from(matches),
  };
}
