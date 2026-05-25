/**
 * Coach tool registry.
 *
 * The Coach handler picks tools to register on each Claude call based
 * on user state (probation vs. not). This file exposes:
 *
 *   - `STANDARD_TOOLS` — the three tools registered on every Coach call
 *   - `PROBATION_TOOLS` — STANDARD_TOOLS plus the conditional fourth
 *     `get_probation_evidence` tool (added in Prompt 3.14)
 *   - `executeToolByName(name, input, context)` — runtime dispatch the
 *     handler calls when the SDK reports a tool_use block
 *
 * Per PRD §9.5: the Coach is the only agentic surface and tool calls
 * cap at 3 (or 4 during Probation Mode). Both budgets are enforced by
 * the handler, not here — this registry just supplies the implementations.
 */
import "server-only";

import type { Tool } from "@anthropic-ai/sdk/resources/messages";

import { tool as getSituationHistoryTool } from "./get-situation-history";
import { tool as getProbationEvidenceTool } from "./get-probation-evidence";
import { tool as getUserContextTool } from "./get-user-context";
import { tool as searchPlaybooksTool } from "./search-playbooks";
import type { CoachTool, ToolContext } from "./types";

const STANDARD_TOOL_REGISTRY: Record<string, CoachTool> = {
  get_user_context: getUserContextTool as CoachTool,
  search_playbooks: searchPlaybooksTool as CoachTool,
  get_situation_history: getSituationHistoryTool as CoachTool,
};

export const STANDARD_TOOLS: Tool[] = Object.values(STANDARD_TOOL_REGISTRY).map(
  (t) => t.toolSpec,
);

/**
 * Probation tools = standard tools + `get_probation_evidence`. The
 * Coach handler reads this registry when `user_context.probation_mode_active`
 * is true and bumps the per-response tool-call budget to 4
 * (`COACH_MAX_TOOL_CALLS.probation_active`).
 */
export const PROBATION_TOOL_REGISTRY: Record<string, CoachTool> = {
  ...STANDARD_TOOL_REGISTRY,
  get_probation_evidence: getProbationEvidenceTool as CoachTool,
};

export const PROBATION_TOOLS: Tool[] = Object.values(
  PROBATION_TOOL_REGISTRY,
).map((t) => t.toolSpec);

/**
 * Look up a tool by name and execute it with the given input + context.
 * `probationMode` selects between the two registries — the probation
 * variant *adds* tools, it doesn't remove any standard ones.
 *
 * Returns the JSON-serialisable result, or null if the tool name is
 * unknown (the handler emits an error result back to the model in that
 * case so the conversation can continue).
 */
export async function executeToolByName(
  name: string,
  input: unknown,
  context: ToolContext,
  probationMode: boolean,
): Promise<unknown | null> {
  const registry = probationMode
    ? PROBATION_TOOL_REGISTRY
    : STANDARD_TOOL_REGISTRY;
  const tool = registry[name];
  if (!tool) return null;
  return tool.execute(input, context);
}

export type { CoachTool, ToolContext };
