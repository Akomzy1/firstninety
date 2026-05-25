/**
 * Coach tool: `get_situation_history`.
 *
 * Returns up to the user's ten most recent Situation Room sessions.
 * The Coach uses this when the user's question references "what I told
 * you about my manager last week" — situational continuity that the
 * conversation alone wouldn't carry.
 *
 * Per PRD §9.5 + SKILL §8: always-available, third of three Coach tools.
 */
import "server-only";

import type { Tool } from "@anthropic-ai/sdk/resources/messages";

import { createServiceClient } from "@/lib/db/service";

import type { CoachTool, ToolContext } from "./types";

type Input = {
  /** Optional filter — only return sessions matching this entry type. */
  entry_type?: "prep" | "is_this_normal" | "debrief";
  /** Maximum number of sessions to return (1-10). Defaults to 10. */
  limit?: number;
};

type Session = {
  id: string;
  entry_type: string;
  summary: string;
  flagged_for_safety: boolean;
  created_at: string;
};

type Result = {
  sessions: Session[];
};

export const toolSpec: Tool = {
  name: "get_situation_history",
  description:
    "Get the user's recent Situation Room sessions — what they brought to the product the last few times they needed help with a workplace moment. Returns up to 10 most recent sessions with entry type, a one-line summary, and the flagged-for-safety boolean. Call this when the user references something they told you 'before' or when continuity would make your reply land better.",
  input_schema: {
    type: "object",
    properties: {
      entry_type: {
        type: "string",
        enum: ["prep", "is_this_normal", "debrief"],
        description:
          "Optional. Filter by the kind of session: 'prep' (about to happen), 'is_this_normal' (sense-check), or 'debrief' (already happened).",
      },
      limit: {
        type: "integer",
        minimum: 1,
        maximum: 10,
        description: "How many sessions to return. Defaults to 10.",
      },
    },
    additionalProperties: false,
  },
};

export async function execute(
  input: Input,
  context: ToolContext,
): Promise<Result> {
  const supabase = createServiceClient();
  const limit = Math.min(Math.max(input.limit ?? 10, 1), 10);

  let query = supabase
    .from("situation_sessions")
    .select(
      "id, entry_type, situation_summary, flagged_for_safety, created_at",
    )
    .eq("user_id", context.userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (input.entry_type) {
    query = query.eq("entry_type", input.entry_type);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[tool:get_situation_history] query failed", error);
    return { sessions: [] };
  }

  return {
    sessions: (data ?? []).map((row) => ({
      id: row.id,
      entry_type: row.entry_type,
      summary: (row.situation_summary ?? "").slice(0, 200),
      flagged_for_safety: row.flagged_for_safety,
      created_at: row.created_at,
    })),
  };
}

export const tool: CoachTool<Input, Result> = { toolSpec, execute };
