/**
 * Shared types for Coach tools.
 *
 * Each tool ships:
 *   - `toolSpec` — the Anthropic SDK `Tool` describing name, description,
 *     and JSON-schema-shaped input.
 *   - `execute(input, context)` — async function that runs the tool
 *     against the user's data and returns a JSON-serialisable result.
 *
 * The handler in lib/coach/handler.ts looks tools up by name in the
 * registry and routes execution through them.
 */
import "server-only";

import type { Tool } from "@anthropic-ai/sdk/resources/messages";

import type { Database } from "@/lib/db/types.gen";

export type Role = Database["public"]["Enums"]["role_enum"];

export type ToolContext = {
  userId: string;
  role: Role | null;
  /**
   * The user's current_week derived from start_date; supplied by the
   * handler so tools don't have to re-query the day-state util.
   */
  currentWeek: number;
  currentDay: number;
};

export type CoachTool<Input = unknown, Result = unknown> = {
  toolSpec: Tool;
  execute(input: Input, context: ToolContext): Promise<Result>;
};
