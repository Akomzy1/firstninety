#!/usr/bin/env node
/**
 * Thin wrapper around `supabase` CLI that injects --db-url from .env.local.
 *
 * Used by the `db:push`, `db:types`, etc. package.json scripts. The Supabase
 * CLI normally needs either local Docker or `supabase login`; this wrapper
 * lets us point any db-targeted subcommand at the cloud project via a
 * session-pooler connection string instead.
 *
 * Usage:
 *   node scripts/db.mjs push                 # supabase db push --db-url ...
 *   node scripts/db.mjs gen-types            # supabase gen types ... > lib/db/types.gen.ts
 *   node scripts/db.mjs diff                 # supabase db diff --db-url ...
 *   node scripts/db.mjs migration list       # supabase migration list --db-url ...
 *
 * Reads SUPABASE_DB_URL from .env.local. Falls back to constructing the URL
 * from NEXT_PUBLIC_SUPABASE_URL + SUPABASE_DB_PASSWORD + SUPABASE_DB_REGION
 * if SUPABASE_DB_URL is unset.
 */

import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

function loadEnvFile(path) {
  if (!existsSync(path)) return {};
  const text = readFileSync(path, "utf8");
  const env = {};
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
    env[key] = value;
  }
  return env;
}

function resolveDbUrl(env) {
  if (env.SUPABASE_DB_URL) return env.SUPABASE_DB_URL;

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const password = env.SUPABASE_DB_PASSWORD;
  const region = env.SUPABASE_DB_REGION;

  if (!url || !password || !region) {
    throw new Error(
      "Cannot resolve database URL. Set SUPABASE_DB_URL in .env.local, or " +
        "set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_DB_PASSWORD + SUPABASE_DB_REGION.",
    );
  }

  const match = url.match(/^https?:\/\/([^.]+)\.supabase\.co/);
  if (!match) {
    throw new Error(`Unrecognised NEXT_PUBLIC_SUPABASE_URL shape: ${url}`);
  }
  const projectRef = match[1];
  const encodedPassword = encodeURIComponent(password);
  return `postgresql://postgres.${projectRef}:${encodedPassword}@aws-1-${region}.pooler.supabase.com:5432/postgres`;
}

function runSupabase(args, { captureStdoutTo } = {}) {
  return new Promise((resolveRun, reject) => {
    // Use `npx --no-install` so this works whether the consumer
    // package manager is npm, pnpm, or yarn — npx resolves
    // `node_modules/.bin/supabase` first and never auto-downloads.
    const child = spawn("npx", ["--no-install", "supabase", ...args], {
      cwd: repoRoot,
      stdio: captureStdoutTo
        ? ["inherit", "pipe", "inherit"]
        : "inherit",
      shell: true,
    });

    if (captureStdoutTo) {
      const chunks = [];
      child.stdout.on("data", (c) => chunks.push(c));
      child.on("close", (code) => {
        if (code === 0) {
          writeFileSync(captureStdoutTo, Buffer.concat(chunks));
          resolveRun(code);
        } else {
          reject(new Error(`supabase exited with code ${code}`));
        }
      });
    } else {
      child.on("close", (code) => {
        if (code === 0) resolveRun(code);
        else reject(new Error(`supabase exited with code ${code}`));
      });
    }
    child.on("error", reject);
  });
}

async function main() {
  const env = { ...process.env, ...loadEnvFile(resolve(repoRoot, ".env.local")) };
  const dbUrl = resolveDbUrl(env);

  const [subcommand, ...rest] = process.argv.slice(2);
  if (!subcommand) {
    console.error("Usage: node scripts/db.mjs <push|gen-types|diff|migration|reset> [args]");
    process.exit(1);
  }

  switch (subcommand) {
    case "push":
      return runSupabase(["db", "push", "--db-url", dbUrl, "--include-all", ...rest]);

    case "gen-types": {
      const outPath = resolve(repoRoot, "lib/db/types.gen.ts");
      await runSupabase(
        ["gen", "types", "typescript", "--db-url", dbUrl, "--schema", "public", ...rest],
        { captureStdoutTo: outPath },
      );
      console.log(`Wrote ${outPath}`);
      return;
    }

    case "diff":
      return runSupabase(["db", "diff", "--db-url", dbUrl, ...rest]);

    case "migration":
      return runSupabase(["migration", ...rest, "--db-url", dbUrl]);

    case "reset":
      return runSupabase(["db", "reset", "--db-url", dbUrl, ...rest]);

    default:
      console.error(`Unknown subcommand: ${subcommand}`);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
