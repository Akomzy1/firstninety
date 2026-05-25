/**
 * Coach tool: `search_playbooks`.
 *
 * Returns up to five published playbooks for the user's role that match
 * the query. MVP search is naive — ilike against title + description —
 * which is fine at the seeded-content scale. When the playbook table
 * has 50+ rows per role we'll swap to pg_trgm or pgvector.
 *
 * Per PRD §9.5: this is one of three always-available Coach tools.
 */
import "server-only";

import type { Tool } from "@anthropic-ai/sdk/resources/messages";

import { createServiceClient } from "@/lib/db/service";

import type { CoachTool, ToolContext } from "./types";

type Input = {
  query: string;
};

type Match = {
  slug: string;
  title: string;
  description: string;
  variant: string | null;
};

type Result = {
  matches: Match[];
};

export const toolSpec: Tool = {
  name: "search_playbooks",
  description:
    "Search the user's role-specific Playbook Library for documents matching a topical query. Each match returns title, slug, one-line description, and any variant tag. Call this when pointing the user at a specific worked example would add weight to your reply (BRD walk-through, RAID register example, stakeholder pushback playbook). Pass a focused 2-6 word query — broader queries surface less useful matches.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "Short topical query — e.g. 'requirements workshop', 'stakeholder pushback', 'compliance review'.",
        minLength: 2,
        maxLength: 80,
      },
    },
    required: ["query"],
    additionalProperties: false,
  },
};

export async function execute(
  input: Input,
  context: ToolContext,
): Promise<Result> {
  if (!context.role) return { matches: [] };

  const supabase = createServiceClient();
  const query = input.query.trim();
  if (query.length === 0) return { matches: [] };

  // Escape `%` and `_` so a user query like "50%" doesn't widen the search.
  const safe = query.replace(/[\\%_]/g, (m) => `\\${m}`);
  const pattern = `%${safe}%`;

  const { data, error } = await supabase
    .from("playbooks")
    .select("slug, title, description, variant")
    .eq("role", context.role)
    .eq("is_published", true)
    .or(`title.ilike.${pattern},description.ilike.${pattern}`)
    .order("title", { ascending: true })
    .limit(5);

  if (error) {
    console.error("[tool:search_playbooks] query failed", error);
    return { matches: [] };
  }

  return {
    matches: (data ?? []).map((row) => ({
      slug: row.slug,
      title: row.title,
      description: row.description,
      variant: row.variant,
    })),
  };
}

export const tool: CoachTool<Input, Result> = { toolSpec, execute };
