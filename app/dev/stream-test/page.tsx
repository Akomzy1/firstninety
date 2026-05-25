/**
 * Dev-only end-to-end test for /api/claude/stream + useClaudeStream.
 *
 * Renders a tiny composer + transcript. Surface is fixed to "coach"
 * (placeholder handler in surface-handlers.ts) — the form posts to the
 * unified endpoint, the hook accumulates text_delta events into the
 * visible transcript, tier_limit / error events surface inline.
 *
 * Use this to verify Prompt 3.3 end-to-end before any real surface is
 * wired up. Returns 404 in production via the layout-level guard.
 */
import { notFound } from "next/navigation";

import { StreamTestClient } from "./StreamTestClient";

export const metadata = { title: "Stream test" };

export default async function StreamTestPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto w-full max-w-(--max-reading) px-6 py-12">
      <header className="mb-8">
        <p className="text-eyebrow text-mute-2">Dev tools / Stream test</p>
        <h1 className="text-h2 mt-2 text-balance">
          /api/claude/stream — Coach placeholder handler.
        </h1>
        <p className="text-body text-mute mt-3 max-w-prose">
          Verifies the SSE endpoint, the typed event protocol, the
          tier-allowance gate, and the <code className="font-mono">useClaudeStream</code>{" "}
          hook end-to-end before any product surface is wired in.
        </p>
      </header>

      <StreamTestClient />
    </main>
  );
}
