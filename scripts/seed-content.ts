#!/usr/bin/env tsx
/**
 * Content seeder. Reads every JSON / Markdown file in `content/`, validates
 * each against the Zod schemas in `lib/content/schemas.ts`, and upserts
 * only the rows whose content hash has changed.
 *
 * Run: `pnpm seed`
 *
 * The script uses the Supabase service-role key + the same env-loading
 * pattern as `scripts/db.mjs`, so it works against the cloud project
 * without needing Docker.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { readdirSync, readFileSync as readFileSyncFs } from "node:fs";
import { join } from "node:path";

import { createClient } from "@supabase/supabase-js";

import { contentHash } from "../lib/content/hash";
import {
  contentRoot,
  loadCoachPromptsFromDisk,
  loadMissionsFromDisk,
  loadPlaybooksFromDisk,
  loadScenariosFromDisk,
} from "../lib/content/loaders";
import {
  CoachPromptSchema,
  MissionSchema,
  PlaybookSchema,
  ScenarioSchema,
} from "../lib/content/schemas";
import type { Database } from "../lib/db/types.gen";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

function loadEnvLocal() {
  const path = resolve(repoRoot, ".env.local");
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function makeServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.",
    );
  }
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

type SeedResult = {
  inserted: number;
  updated: number;
  unchanged: number;
  total: number;
};

async function seedScenarios(client: ReturnType<typeof makeServiceClient>): Promise<SeedResult> {
  const items = await loadScenariosFromDisk();
  const { data: existing, error } = await client
    .from("scenarios")
    .select("slug, content_hash");
  if (error) throw new Error(`scenarios fetch failed: ${error.message}`);
  const existingMap = new Map((existing ?? []).map((r) => [r.slug, r.content_hash]));

  let inserted = 0;
  let updated = 0;
  let unchanged = 0;

  for (const { value, path } of items) {
    const hash = contentHash(value);
    const prior = existingMap.get(value.slug);
    if (prior && prior === hash) {
      unchanged += 1;
      continue;
    }
    const { error: upsertError } = await client.from("scenarios").upsert(
      {
        slug: value.slug,
        role: value.role,
        title: value.title,
        one_liner: value.one_liner,
        brief: value.brief,
        objective: value.objective,
        curveball: value.curveball,
        personas: value.personas,
        rubric: value.rubric,
        estimated_minutes: value.estimated_minutes,
        difficulty: value.difficulty,
        career_stage: value.career_stage,
        version: value.version,
        is_published: true,
        content_hash: hash,
      },
      { onConflict: "slug" },
    );
    if (upsertError) {
      throw new Error(
        `scenarios upsert failed for ${relative(contentRoot, path)}: ${upsertError.message}`,
      );
    }
    if (prior == null) inserted += 1;
    else updated += 1;
  }

  return { inserted, updated, unchanged, total: items.length };
}

async function seedPlaybooks(client: ReturnType<typeof makeServiceClient>): Promise<SeedResult> {
  const items = await loadPlaybooksFromDisk();
  const { data: existing, error } = await client
    .from("playbooks")
    .select("slug, content_hash");
  if (error) throw new Error(`playbooks fetch failed: ${error.message}`);
  const existingMap = new Map((existing ?? []).map((r) => [r.slug, r.content_hash]));

  let inserted = 0;
  let updated = 0;
  let unchanged = 0;

  for (const { value, path } of items) {
    const hash = contentHash(value);
    const prior = existingMap.get(value.slug);
    if (prior && prior === hash) {
      unchanged += 1;
      continue;
    }
    const { error: upsertError } = await client.from("playbooks").upsert(
      {
        slug: value.slug,
        role: value.role,
        artefact_type: value.artefact_type,
        title: value.title,
        variant: value.variant ?? null,
        description: value.description,
        empty_template_md: value.empty_template_md,
        worked_examples: value.worked_examples,
        common_mistakes: value.common_mistakes,
        variant_patterns: value.variant_patterns ?? null,
        related_scenarios: value.related_scenarios ?? null,
        career_stage: value.career_stage,
        version: value.version,
        is_published: true,
        content_hash: hash,
      },
      { onConflict: "slug" },
    );
    if (upsertError) {
      throw new Error(
        `playbooks upsert failed for ${relative(contentRoot, path)}: ${upsertError.message}`,
      );
    }
    if (prior == null) inserted += 1;
    else updated += 1;
  }

  return { inserted, updated, unchanged, total: items.length };
}

async function seedMissions(client: ReturnType<typeof makeServiceClient>): Promise<SeedResult> {
  const items = await loadMissionsFromDisk();
  const { data: existing, error } = await client
    .from("missions")
    .select("slug, content_hash");
  if (error) throw new Error(`missions fetch failed: ${error.message}`);
  const existingMap = new Map((existing ?? []).map((r) => [r.slug, r.content_hash]));

  let inserted = 0;
  let updated = 0;
  let unchanged = 0;

  for (const { value, path } of items) {
    const hash = contentHash(value);
    const prior = existingMap.get(value.slug);
    if (prior && prior === hash) {
      unchanged += 1;
      continue;
    }
    const { error: upsertError } = await client.from("missions").upsert(
      {
        slug: value.slug,
        role: value.role,
        week: value.week,
        sequence_in_week: value.sequence_in_week,
        title: value.title,
        why_matters: value.why_matters,
        steps: value.steps,
        resource_refs: value.resource_refs ?? null,
        success_criteria: value.success_criteria,
        reflection_prompt: value.reflection_prompt,
        estimated_minutes: value.estimated_minutes,
        prerequisites: value.prerequisites ?? null,
        career_stage: value.career_stage,
        is_published: true,
        content_hash: hash,
      },
      { onConflict: "slug" },
    );
    if (upsertError) {
      throw new Error(
        `missions upsert failed for ${relative(contentRoot, path)}: ${upsertError.message}`,
      );
    }
    if (prior == null) inserted += 1;
    else updated += 1;
  }

  return { inserted, updated, unchanged, total: items.length };
}

/**
 * Coach prompts don't have a dedicated DB table at MVP — they live in
 * git and are read at request time by the Coach engine (Prompt 3.5).
 * The seed step still validates them so a malformed prompt halts the
 * deploy, but persistence is the filesystem.
 */
async function validateCoachPrompts(): Promise<SeedResult> {
  const items = await loadCoachPromptsFromDisk();
  return { inserted: 0, updated: 0, unchanged: items.length, total: items.length };
}

/**
 * Validate every file in content/examples/ before going near the cloud DB.
 * The example tree is for content authors to copy from — if it stops
 * parsing, every downstream content author's day is ruined. We don't
 * persist them.
 */
function validateExamples() {
  const dir = join(contentRoot, "examples");
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return; // no examples dir; nothing to do
  }
  for (const name of entries) {
    const full = join(dir, name);
    if (name.endsWith(".scenario.example.json") || name === "scenario.example.json") {
      ScenarioSchema.parse(JSON.parse(readFileSyncFs(full, "utf8")));
    } else if (name.endsWith(".playbook.example.json") || name === "playbook.example.json") {
      PlaybookSchema.parse(JSON.parse(readFileSyncFs(full, "utf8")));
    } else if (name.endsWith(".mission.example.json") || name === "mission.example.json") {
      MissionSchema.parse(JSON.parse(readFileSyncFs(full, "utf8")));
    } else if (name.endsWith(".coach-prompt.example.md") || name === "coach-prompt.example.md") {
      // Reuse the loader's frontmatter parse by reading + parsing inline.
      const raw = readFileSyncFs(full, "utf8");
      const match = /^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
      if (!match) {
        throw new Error(`${name}: missing frontmatter block`);
      }
      const meta: Record<string, unknown> = {};
      const yaml = match[1] ?? "";
      for (const line of yaml.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const colon = trimmed.indexOf(":");
        if (colon < 0) continue;
        const key = trimmed.slice(0, colon).trim();
        const value = trimmed.slice(colon + 1).trim().replace(/^['"]|['"]$/g, "");
        if (/^-?\d+$/.test(value)) {
          meta[key] = Number(value);
        } else if (value === "true" || value === "false") {
          meta[key] = value === "true";
        } else {
          meta[key] = value;
        }
      }
      const body = (match[2] ?? "").trim();
      CoachPromptSchema.parse({ ...meta, body });
    }
  }
}

async function main() {
  loadEnvLocal();
  validateExamples();
  const client = makeServiceClient();

  console.log("seeding content from", contentRoot);

  const scenarios = await seedScenarios(client);
  const playbooks = await seedPlaybooks(client);
  const missions = await seedMissions(client);
  const coachPrompts = await validateCoachPrompts();

  const fmt = (r: SeedResult) =>
    `${r.total} (+${r.inserted} ~${r.updated} =${r.unchanged})`;

  console.log("");
  console.log(`scenarios:     ${fmt(scenarios)}`);
  console.log(`playbooks:     ${fmt(playbooks)}`);
  console.log(`missions:      ${fmt(missions)}`);
  console.log(`coach prompts: ${fmt(coachPrompts)} (validated, not persisted)`);
  console.log("");
  console.log("done.");
}

main().catch((err) => {
  console.error(err?.message ?? err);
  process.exit(1);
});
