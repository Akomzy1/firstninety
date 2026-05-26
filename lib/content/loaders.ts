/**
 * Disk loaders for the content/ tree.
 *
 *   content/scenarios/{role}/{slug}.json
 *   content/playbooks/{role}/{slug}.json
 *   content/missions/{role}/week-{N}/{seq}-{slug}.json
 *   content/coach-prompts/{slug}.md  (markdown with frontmatter)
 *
 * Each loader walks the matching files, parses them with the Zod
 * schemas, and either returns the typed result + on-disk path OR
 * throws an aggregated error listing every failing file. Callers
 * (typically scripts/seed-content) decide whether to halt or report.
 */
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  CoachPromptSchema,
  MissionSchema,
  PlaybookSchema,
  ROLE_VALUES,
  ScenarioSchema,
  type CoachPrompt,
  type Mission,
  type Playbook,
  type Role,
  type Scenario,
} from "./schemas";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const contentRoot = resolve(__dirname, "..", "..", "content");

export type LoadedItem<T> = { value: T; path: string };

async function exists(path: string) {
  try {
    await readdir(path);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile<T>(path: string, parser: (raw: unknown) => T): Promise<T> {
  const text = await readFile(path, "utf8");
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new Error(
      `Failed to JSON.parse ${relative(contentRoot, path)}: ${(err as Error).message}`,
    );
  }
  return parser(json);
}

async function listFiles(dir: string, pattern: RegExp): Promise<string[]> {
  if (!(await exists(dir))) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await listFiles(full, pattern)));
    } else if (entry.isFile() && pattern.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/* ----------------------------------------------------------------------- *
 * Scenarios
 * ----------------------------------------------------------------------- */

export async function loadScenariosFromDisk(): Promise<LoadedItem<Scenario>[]> {
  const out: LoadedItem<Scenario>[] = [];
  for (const role of ROLE_VALUES) {
    const dir = join(contentRoot, "scenarios", role);
    const files = await listFiles(dir, /\.json$/);
    for (const file of files) {
      const value = await readJsonFile(file, (raw) => ScenarioSchema.parse(raw));
      if (value.role !== (role as Role)) {
        throw new Error(
          `${relative(contentRoot, file)}: declared role "${value.role}" doesn't match directory "${role}".`,
        );
      }
      out.push({ value, path: file });
    }
  }
  return out;
}

/* ----------------------------------------------------------------------- *
 * Playbooks
 * ----------------------------------------------------------------------- */

export async function loadPlaybooksFromDisk(): Promise<LoadedItem<Playbook>[]> {
  const out: LoadedItem<Playbook>[] = [];
  for (const role of ROLE_VALUES) {
    const dir = join(contentRoot, "playbooks", role);
    const files = await listFiles(dir, /\.json$/);
    for (const file of files) {
      const value = await readJsonFile(file, (raw) => PlaybookSchema.parse(raw));
      if (value.role !== (role as Role)) {
        throw new Error(
          `${relative(contentRoot, file)}: declared role "${value.role}" doesn't match directory "${role}".`,
        );
      }
      out.push({ value, path: file });
    }
  }
  return out;
}

/* ----------------------------------------------------------------------- *
 * Missions
 * ----------------------------------------------------------------------- */

export async function loadMissionsFromDisk(): Promise<LoadedItem<Mission>[]> {
  const out: LoadedItem<Mission>[] = [];
  for (const role of ROLE_VALUES) {
    const dir = join(contentRoot, "missions", role);
    const files = await listFiles(dir, /\.json$/);
    for (const file of files) {
      const value = await readJsonFile(file, (raw) => MissionSchema.parse(raw));
      if (value.role !== (role as Role)) {
        throw new Error(
          `${relative(contentRoot, file)}: declared role "${value.role}" doesn't match directory "${role}".`,
        );
      }
      const expectedDir = join(contentRoot, "missions", role, `week-${value.week}`);
      if (dirname(file) !== expectedDir) {
        throw new Error(
          `${relative(contentRoot, file)}: file lives outside its declared week directory (expected ${relative(contentRoot, expectedDir)}).`,
        );
      }
      out.push({ value, path: file });
    }
  }
  return out;
}

/* ----------------------------------------------------------------------- *
 * Coach prompts (markdown with frontmatter)
 * ----------------------------------------------------------------------- */

const FRONTMATTER_RE = /^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/;

function parseFrontmatter(raw: string): { meta: Record<string, unknown>; body: string } {
  const match = FRONTMATTER_RE.exec(raw);
  if (!match) {
    return { meta: {}, body: raw };
  }
  const yaml = match[1] ?? "";
  const body = match[2] ?? "";
  const meta: Record<string, unknown> = {};
  for (const line of yaml.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colon = trimmed.indexOf(":");
    if (colon < 0) continue;
    const key = trimmed.slice(0, colon).trim();
    const rawValue = trimmed.slice(colon + 1).trim().replace(/^['"]|['"]$/g, "");
    if (rawValue === "" || rawValue === "null") {
      meta[key] = null;
    } else if (/^-?\d+$/.test(rawValue)) {
      meta[key] = Number(rawValue);
    } else if (rawValue === "true" || rawValue === "false") {
      meta[key] = rawValue === "true";
    } else {
      meta[key] = rawValue;
    }
  }
  return { meta, body };
}

export async function loadCoachPromptsFromDisk(): Promise<LoadedItem<CoachPrompt>[]> {
  const dir = join(contentRoot, "coach-prompts");
  const files = await listFiles(dir, /\.md$/);
  const out: LoadedItem<CoachPrompt>[] = [];
  for (const file of files) {
    const raw = await readFile(file, "utf8");
    const { meta, body } = parseFrontmatter(raw);
    const value = CoachPromptSchema.parse({ ...meta, body: body.trim() });
    out.push({ value, path: file });
  }
  return out;
}

/* ----------------------------------------------------------------------- *
 * Runtime coach-prompt loader (used by the Coach engine + safety wrapper)
 *
 * `loadCoachPromptsFromDisk()` above enforces the seed-script schema
 * (id / surface / role / version). The Coach engine just needs the
 * markdown body keyed by filename — voice.md, role-ba.md, etc. — so we
 * expose a separate cached loader that doesn't apply the strict schema.
 * ----------------------------------------------------------------------- */

export type LoadedPromptBody = {
  /** The filename without extension, e.g. `voice` or `role-ba`. */
  name: string;
  /** The markdown body, with the frontmatter block stripped. */
  body: string;
  /** The frontmatter as a loose record. May be empty if no frontmatter. */
  frontmatter: Record<string, unknown>;
};

const bodyCache = new Map<string, LoadedPromptBody>();

/**
 * Load a single coach-prompt by its bare name (no `.md`). Cached
 * in-memory after first read. Throws if the file is missing.
 */
export async function loadCoachPromptByName(
  name: string,
): Promise<LoadedPromptBody> {
  const cached = bodyCache.get(name);
  if (cached) return cached;
  const filePath = join(contentRoot, "coach-prompts", `${name}.md`);
  const raw = await readFile(filePath, "utf8");
  const { meta, body } = parseFrontmatter(raw);
  const result: LoadedPromptBody = {
    name,
    body: body.trim(),
    frontmatter: meta as Record<string, unknown>,
  };
  bodyCache.set(name, result);
  return result;
}

/**
 * Convenience: return just the body string. Most runtime callers
 * (system-prompt composer, safety wrapper) only need the body.
 */
export async function loadCoachPromptBody(name: string): Promise<string> {
  const { body } = await loadCoachPromptByName(name);
  return body;
}

const probationBodyCache = new Map<string, string>();

/**
 * Loads a markdown file from `content/probation-prompts/` and returns
 * its body (frontmatter stripped). Used by the Probation Brief
 * generator for the thin-evidence preamble and any future prompt
 * overrides specific to the probation flow.
 */
export async function loadProbationPromptBody(name: string): Promise<string> {
  const cached = probationBodyCache.get(name);
  if (cached) return cached;
  const filePath = join(contentRoot, "probation-prompts", `${name}.md`);
  const raw = await readFile(filePath, "utf8");
  const { body } = parseFrontmatter(raw);
  const trimmed = body.trim();
  probationBodyCache.set(name, trimmed);
  return trimmed;
}
