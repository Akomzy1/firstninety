#!/usr/bin/env tsx
/**
 * Test all seven transactional email templates against a real inbox.
 *
 * Usage:
 *   pnpm test:emails                          # send all 7 to TEST_EMAIL_TO
 *   pnpm test:emails -- --to you@example.com  # explicit recipient
 *   pnpm test:emails -- --only welcome        # send just one
 *   pnpm test:emails -- --dry                 # render to console + write
 *                                                lib/email/_preview.html
 *                                                without calling Resend
 *
 * Loads env from .env.local. Requires RESEND_API_KEY + RESEND_FROM_EMAIL
 * unless --dry is set. Throws if recipient unset.
 *
 * The dry-run path is useful for previewing rendering changes without
 * burning Resend credit or filling your inbox.
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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

function parseArgs(argv: string[]) {
  let to: string | null = null;
  let only: string | null = null;
  let dry = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--to") to = argv[++i] ?? null;
    else if (a === "--only") only = argv[++i] ?? null;
    else if (a === "--dry") dry = true;
  }
  return { to, only, dry };
}

async function main() {
  loadEnvLocal();
  const args = parseArgs(process.argv.slice(2));

  const {
    welcomeEmail,
    sundayRecapEmail,
    probationActivationEmail,
    trialEndingEmail,
    cancellationConfirmEmail,
    dataExportReadyEmail,
    passwordResetEmail,
  } = await import("../lib/email/templates");

  const templates = {
    welcome: () => welcomeEmail({ firstName: "Tokunbo" }),
    "sunday-recap": () => sundayRecapEmail(),
    "probation-activation": () => probationActivationEmail({ daysToReview: 21 }),
    "trial-ending": () =>
      trialEndingEmail({
        trialEndIso: new Date(Date.now() + 2 * 86400000).toISOString(),
      }),
    cancellation: () =>
      cancellationConfirmEmail({
        accessUntilIso: new Date(Date.now() + 14 * 86400000).toISOString(),
      }),
    "data-export": () =>
      dataExportReadyEmail({
        downloadUrl: "https://firstninety.vercel.app/exports/test-export.zip",
        expiresHours: 48,
      }),
    "password-reset": () =>
      passwordResetEmail({
        resetUrl: "https://firstninety.vercel.app/reset?token=test_token_abc",
      }),
  } as const;

  const names = Object.keys(templates) as Array<keyof typeof templates>;
  const selected = args.only
    ? names.filter((n) => n === args.only)
    : names;

  if (selected.length === 0) {
    console.error(
      `No matching template. Available: ${names.join(", ")}`,
    );
    process.exit(1);
  }

  // Dry-run path: render templates, write a multi-section preview HTML
  // so you can eyeball them in a browser. No Resend call.
  if (args.dry) {
    console.log("DRY RUN — no email will be sent.\n");
    const previewParts: string[] = [];
    for (const name of selected) {
      const tpl = templates[name]();
      console.log(`--- ${name} ---`);
      console.log(`subject: ${tpl.subject}`);
      console.log(`text length: ${tpl.text.length} chars`);
      console.log(`html length: ${tpl.html.length} chars\n`);
      previewParts.push(
        `<div style="border:2px solid #ccc;margin:32px 0;padding:16px;background:white;">
<h2 style="font-family:sans-serif;color:#333;">${name} — subject: ${tpl.subject}</h2>
${tpl.html}
</div>`,
      );
    }
    const previewPath = resolve(repoRoot, "lib/email/_preview.html");
    writeFileSync(
      previewPath,
      `<!DOCTYPE html>
<html><body style="background:#eee;padding:32px;">
${previewParts.join("\n")}
</body></html>`,
    );
    console.log(`Wrote preview to ${previewPath}`);
    console.log("Open it in a browser to eyeball the rendering.");
    return;
  }

  // Live send path
  const to =
    args.to ??
    process.env.TEST_EMAIL_TO ??
    process.env.RESEND_FROM_EMAIL ??
    null;
  if (!to) {
    console.error(
      "Recipient required. Pass --to <email>, or set TEST_EMAIL_TO / RESEND_FROM_EMAIL in .env.local.",
    );
    process.exit(1);
  }

  if (!process.env.RESEND_API_KEY) {
    console.error(
      "RESEND_API_KEY is not set in .env.local. Either set it (real Resend key) or use --dry to preview without sending.",
    );
    process.exit(1);
  }

  const { sendEmail } = await import("../lib/notifications/email");
  console.log(`Sending ${selected.length} test email(s) to ${to}\n`);

  let succeeded = 0;
  let failed = 0;
  for (const name of selected) {
    const tpl = templates[name]();
    try {
      const result = await sendEmail({
        to,
        subject: `[TEST] ${tpl.subject}`,
        html: tpl.html,
        text: tpl.text,
      });
      if (result.sent) {
        console.log(`OK  ${name}  id=${result.id}`);
        succeeded += 1;
      } else if ("skipped" in result && result.skipped) {
        console.log(`SKIP ${name}  (RESEND_API_KEY not configured)`);
      } else {
        console.error(
          `FAIL ${name}  ${"error" in result ? result.error : "unknown"}`,
        );
        failed += 1;
      }
    } catch (err) {
      console.error(`FAIL ${name}  ${(err as Error).message}`);
      failed += 1;
    }
  }

  console.log(`\nDone — ${succeeded} sent, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err?.message ?? err);
  process.exit(1);
});
