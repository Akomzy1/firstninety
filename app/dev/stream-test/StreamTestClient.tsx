"use client";

import { useState } from "react";

import { ArrowRight, RotateCcw, Square } from "lucide-react";

import { TierLimitPrompt } from "@/components/billing/TierLimitPrompt";
import { CrisisReferral } from "@/components/safety/CrisisReferral";
import { useClaudeStream } from "@/lib/coach/use-stream";

export function StreamTestClient() {
  const [draft, setDraft] = useState(
    "Pretend I'm a new BA and I have my first 1:1 with my manager tomorrow. What's one thing I should walk in with?",
  );
  const stream = useClaudeStream();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = draft.trim();
    if (!message || stream.isStreaming) return;
    await stream.startStream({
      surface: "coach",
      context_id: "dev-stream-test",
      user_message: message,
    });
  };

  return (
    <section className="flex flex-col gap-6">
      {/* Composer */}
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-3 border border-paper-3 bg-paper p-5"
        style={{ borderRadius: "10px" }}
      >
        <label htmlFor="stream-input" className="text-eyebrow">
          User message
        </label>
        <textarea
          id="stream-input"
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full min-h-[88px] bg-paper-2 border border-paper-3 px-4 py-3 text-body text-ink placeholder:text-mute resize-y focus:outline-none focus:border-ink"
          style={{ borderRadius: "8px" }}
          placeholder="What should the Coach respond to?"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={stream.isStreaming || draft.trim().length === 0}
            className="inline-flex h-10 items-center gap-2 bg-ink text-paper px-4 text-body-s font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
            style={{ borderRadius: "4px" }}
          >
            Send
            <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden />
          </button>
          {stream.isStreaming ? (
            <button
              type="button"
              onClick={stream.stopStream}
              className="inline-flex h-10 items-center gap-2 border border-paper-3 text-mute px-4 text-body-s font-medium hover:text-ink hover:bg-paper-2 transition-colors"
              style={{ borderRadius: "4px" }}
            >
              <Square className="size-3.5" strokeWidth={1.5} aria-hidden />
              Stop
            </button>
          ) : null}
          {stream.events.length > 0 && !stream.isStreaming ? (
            <button
              type="button"
              onClick={stream.resetStream}
              className="inline-flex h-10 items-center gap-2 text-mute px-2 text-body-s hover:text-ink transition-colors"
            >
              <RotateCcw className="size-3.5" strokeWidth={1.5} aria-hidden />
              Reset
            </button>
          ) : null}
        </div>
      </form>

      {/* Soft safety advisories — non-blocking, surface inline below the
          composer, mute-italic per Build Prompt 3.4. */}
      {stream.piiAdvisory ? (
        <p className="font-display italic text-body-s text-mute -mt-3">
          Looks like there&rsquo;s a {stream.piiAdvisory.pii_types.join(" / ")}{" "}
          in your message. Consider removing it before you send next time
          — the Coach doesn&rsquo;t need it.
        </p>
      ) : null}
      {stream.namesAdvisory ? (
        <p className="font-display italic text-body-s text-mute -mt-3">
          Looks like you might be using a real name (
          {stream.namesAdvisory.matches.join(", ")}). &ldquo;My lead
          dev&rdquo; or similar reads better.
        </p>
      ) : null}

      {/* Tier limit */}
      {stream.tierLimit ? (
        <TierLimitPrompt
          allowance={stream.tierLimit.allowance}
          variant="inline"
        />
      ) : null}

      {/* Error */}
      {stream.error && !stream.tierLimit ? (
        <section
          className="border border-danger/40 bg-danger/5 p-4 text-body-s text-ink"
          style={{ borderRadius: "8px" }}
          role="alert"
        >
          <p className="text-eyebrow text-danger mb-1">Stream error</p>
          <p>{stream.error.message}</p>
        </section>
      ) : null}

      {/* Transcript */}
      {stream.text.length > 0 ? (
        <section className="flex flex-col gap-2">
          <p className="text-eyebrow">Coach</p>
          <div
            className="border border-paper-3 bg-paper-2 px-5 py-4 text-body text-ink whitespace-pre-wrap"
            style={{ borderRadius: "10px", fontSize: "17px", lineHeight: 1.65 }}
          >
            {stream.text}
            {stream.isStreaming ? (
              <span className="inline-block align-middle ml-1 size-2 bg-mute animate-pulse" />
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Crisis referral — always renders when flagged, regardless of
          AI response state. Per SKILL §10 + MVP Spec §4.6. */}
      {stream.crisisFlag ? (
        <CrisisReferral category={stream.crisisFlag.category} />
      ) : null}

      {/* Raw event log */}
      {stream.events.length > 0 ? (
        <details className="border-t border-paper-3 pt-4">
          <summary className="cursor-pointer text-body-s font-medium text-mute hover:text-ink transition-colors">
            Raw event log ({stream.events.length})
          </summary>
          <pre
            className="mt-3 bg-paper-2 border border-paper-3 p-3 text-mute overflow-auto"
            style={{ borderRadius: "6px", fontSize: "11px", lineHeight: 1.5, maxHeight: "320px" }}
          >
            {stream.events
              .map((e, i) => `${String(i + 1).padStart(2, "0")} ${JSON.stringify(e)}`)
              .join("\n")}
          </pre>
        </details>
      ) : null}
    </section>
  );
}
