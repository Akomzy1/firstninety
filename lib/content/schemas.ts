/**
 * Content schemas. Used to validate every JSON / markdown file in
 * `content/` before seeding. Each schema matches the corresponding
 * Postgres column shapes exactly so a parsed value can be handed
 * straight to a Supabase `.insert(...)`.
 *
 * Source of truth: MVP Spec §6.1–§6.4 + the database migration 00001.
 * Update both this file and the migration if either changes.
 */
import { z } from "zod";

export const ROLE_VALUES = ["ba", "pm", "sm", "po", "da", "aie"] as const;
export const RoleSchema = z.enum(ROLE_VALUES);
export type Role = z.infer<typeof RoleSchema>;

/* ----------------------------------------------------------------------- *
 * Scenario
 * ----------------------------------------------------------------------- */

export const PersonaSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  position: z.string().min(1),
  fear: z.string().min(1),
  monogram: z
    .string()
    .min(1)
    .max(3)
    .describe("1-3 letter monogram for the avatar"),
  colour: z.string().min(1).optional(),
});

export const RubricSchema = z.object({
  green: z.array(z.string().min(1)).min(1),
  yellow: z.array(z.string().min(1)).min(1),
  red: z.array(z.string().min(1)).min(1),
});

export const ScenarioSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "slug must be kebab-case lowercase"),
  role: RoleSchema,
  title: z.string().min(1),
  one_liner: z
    .string()
    .min(1)
    .max(200, "one_liner stays around 15-25 words"),
  brief: z.string().min(1),
  objective: z.string().min(1),
  curveball: z.string().min(1),
  personas: z.array(PersonaSchema).min(1).max(6),
  rubric: RubricSchema,
  estimated_minutes: z.number().int().positive().default(12),
  difficulty: z.number().int().min(1).max(5).default(2),
  career_stage: z.string().default("first_90_days"),
  version: z.number().int().positive().default(1),
});
export type Scenario = z.infer<typeof ScenarioSchema>;

/* ----------------------------------------------------------------------- *
 * Playbook
 * ----------------------------------------------------------------------- */

export const PlaybookAnnotationSchema = z.object({
  section_id: z.string().min(1),
  note: z.string().min(1),
});

export const WorkedExampleSchema = z.object({
  title: z.string().min(1),
  content_md: z.string().min(1),
  annotations: z.array(PlaybookAnnotationSchema).default([]),
});

export const PlaybookSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "slug must be kebab-case lowercase"),
  role: RoleSchema,
  artefact_type: z.string().min(1),
  title: z.string().min(1),
  variant: z.string().min(1).optional().nullable(),
  description: z.string().min(1),
  empty_template_md: z.string().min(1),
  worked_examples: z.array(WorkedExampleSchema).min(1),
  common_mistakes: z.array(z.string().min(1)).min(1),
  variant_patterns: z.array(z.string().min(1)).optional().nullable(),
  related_scenarios: z.array(z.string().min(1)).optional().nullable(),
  career_stage: z.string().default("first_90_days"),
  version: z.number().int().positive().default(1),
});
export type Playbook = z.infer<typeof PlaybookSchema>;

/* ----------------------------------------------------------------------- *
 * Mission
 * ----------------------------------------------------------------------- */

export const ResourceRefsSchema = z
  .object({
    playbook_slugs: z.array(z.string()).default([]),
    scenario_slugs: z.array(z.string()).default([]),
  })
  .optional()
  .nullable();

export const MissionSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "slug must be kebab-case lowercase"),
  role: RoleSchema,
  week: z.number().int().min(1).max(13),
  sequence_in_week: z.number().int().min(1).max(4),
  title: z.string().min(1),
  why_matters: z.string().min(1),
  steps: z.array(z.string().min(1)).min(1),
  resource_refs: ResourceRefsSchema,
  success_criteria: z.string().min(1),
  reflection_prompt: z.string().min(1),
  estimated_minutes: z.number().int().positive(),
  prerequisites: z.array(z.string()).optional().nullable(),
  career_stage: z.string().default("first_90_days"),
});
export type Mission = z.infer<typeof MissionSchema>;

/* ----------------------------------------------------------------------- *
 * Coach prompt
 *
 * Each prompt block is a Markdown file with frontmatter:
 *   ---
 *   id: situation-prep
 *   surface: situation_room
 *   role: any | ba | pm | …
 *   version: 1
 *   ---
 *   <markdown body>
 *
 * The loader parses frontmatter; this schema is what comes out.
 * ----------------------------------------------------------------------- */

export const CoachPromptSchema = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "id must be kebab-case lowercase"),
  surface: z.enum([
    "coach",
    "situation_room",
    "simulator",
    "simulator_debrief",
    "shared",
  ]),
  role: z.union([z.literal("any"), RoleSchema]).default("any"),
  version: z.number().int().positive().default(1),
  body: z.string().min(1),
});
export type CoachPrompt = z.infer<typeof CoachPromptSchema>;
