"use client";

/**
 * Active-session view client component. Renders:
 *   - The user's submitted opening as a Fraunces-italic blockquote
 *     with a left rule in accent-soft.
 *   - The Coach response — streamed live on first visit, or rendered
 *     from `initialResponse` on subsequent visits.
 *   - Three response path cards once the response is complete.
 *   - The CrisisReferral component when the session is safety-flagged.
 *
 * Per the Situation Room prototype (State 02) and MVP Spec §4.3.
 */
import { useEffect, useRef } from "react";

import Link from "next/link";

import { ArrowRight, BookOpen, MessageCircle } from "lucide-react";

import { CrisisReferral } from "@/components/safety/CrisisReferral";
import type { CrisisCategory } from "@/lib/safety/checks";
import { useClaudeStream } from "@/lib/coach/use-stream";

const ENTRY_LABEL: Record<string, string> = {
  prep: "I need help with this",
  is_this_normal: "Is this normal?",
  debrief: "I just did something",
  probation: "This is about my probation",
};

type SessionViewProps = {
  sessionId: string;
  opening: string;
  uiEntryType: "prep" | "is_this_normal" | "debrief" | "probation";
  createdAtLabel: string;
  /** Persisted Coach response, if the stream has already run. */
  initialResponse: string | null;
  flaggedForSafety: boolean;
  crisisCategory: CrisisCategory | null;
};

export function SessionView({
  sessionId,
  opening,
  uiEntryType,
  createdAtLabel,
  initialResponse,
  flaggedForSafety,
  crisisCategory,
}: SessionViewProps) {
  const stream = useClaudeStream();
  const triggered = useRef(false);

  // Kick the stream off exactly once on first mount, but only if the
  // response hasn't been generated yet.
  useEffect(() => {
    if (initialResponse) return;
    if (triggered.current) return;
    triggered.current = true;
    void stream.startStream({
      surface: "situation_room",
      context_id: sessionId,
      entry_type: uiEntryType,
    });
  }, [initialResponse, sessionId, uiEntryType, stream]);

  // Source of truth for what to display:
  //   - persisted response wins (immediate render, no flicker)
  //   - otherwise the live stream text
  const displayedText = initialResponse ?? stream.text;
  const isStreaming = !initialResponse && stream.isStreaming;
  const isComplete = !!initialResponse || stream.isComplete;

  return (
    <main className="mx-auto w-full max-w-[880px] px-6 md:px-8 py-12 md:py-16 flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-eyebrow">Situation &mdash; {createdAtLabel}</p>
        <p className="text-eyebrow text-mute-2">
          {ENTRY_LABEL[uiEntryType] ?? uiEntryType}
        </p>
      </header>

      {/* The user's opening — Fraunces italic with an accent-soft left rule */}
      <blockquote
        className="font-display italic text-ink text-balance pl-5"
        style={{
          fontSize: "22px",
          lineHeight: 1.45,
          letterSpacing: "-0.005em",
          borderLeft: "2px solid var(--accent-soft)",
        }}
      >
        &ldquo;{opening}&rdquo;
      </blockquote>

      {/* Crisis referral — always renders ABOVE the response when flagged. */}
      {flaggedForSafety ? (
        <CrisisReferral category={crisisCategory ?? "self_harm"} />
      ) : null}

      {/* Coach response — streaming or persisted. */}
      <CoachResponse
        text={displayedText}
        isStreaming={isStreaming}
        error={stream.error?.message ?? null}
      />

      {/* Three response paths surface only after the response is complete. */}
      {isComplete && displayedText.length > 0 ? (
        <ResponsePaths sessionId={sessionId} />
      ) : null}

      <Link
        href="/situation-room"
        className="self-start inline-flex items-center gap-2 text-body-s text-mute hover:text-ink transition-colors"
      >
        <span aria-hidden>&larr;</span>
        Back to the Situation Room
      </Link>
    </main>
  );
}

function CoachResponse({
  text,
  isStreaming,
  error,
}: {
  text: string;
  isStreaming: boolean;
  error: string | null;
}) {
  if (error && text.length === 0) {
    return (
      <section
        className="border border-danger/40 bg-danger/5 p-4 text-body-s text-ink"
        style={{ borderRadius: "8px" }}
        role="alert"
      >
        <p className="text-eyebrow text-danger mb-1">Coach response failed</p>
        <p>{error}</p>
      </section>
    );
  }

  if (text.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-4 py-2"
      >
        <span aria-hidden className="inline-flex items-center gap-2">
          <span
            className="block size-1.5 rounded-full bg-mute opacity-60 animate-pulse"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="block size-1.5 rounded-full bg-mute opacity-60 animate-pulse"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="block size-1.5 rounded-full bg-mute opacity-60 animate-pulse"
            style={{ animationDelay: "300ms" }}
          />
        </span>
        <span className="text-body-s text-mute">
          FirstNinety is thinking&hellip;
        </span>
      </div>
    );
  }

  const paragraphs = text.split(/\n\n+/);
  return (
    <div
      className="text-ink space-y-3.5 max-w-prose"
      style={{ fontSize: "17px", lineHeight: 1.7 }}
    >
      {paragraphs.map((p, i) => (
        <p key={i} className="whitespace-pre-wrap">
          {renderInlineItalics(p)}
        </p>
      ))}
      {isStreaming ? (
        <span className="inline-block align-middle ml-1 size-2 bg-mute animate-pulse" />
      ) : null}
    </div>
  );
}

function renderInlineItalics(text: string): React.ReactNode {
  // Coach voice marks quoted scripts with double quotes; flip them to
  // Fraunces italic so the editorial signature reads.
  const out: React.ReactNode[] = [];
  const regex = /"([^"]+)"/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      out.push(<span key={key++}>{text.slice(lastIdx, match.index)}</span>);
    }
    out.push(
      <span key={key++} className="font-display italic text-ink">
        &ldquo;{match[1]}&rdquo;
      </span>,
    );
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) {
    out.push(<span key={key++}>{text.slice(lastIdx)}</span>);
  }
  return out;
}

function ResponsePaths({ sessionId }: { sessionId: string }) {
  const paths: Array<{
    href: string;
    label: string;
    Icon: React.ElementType;
  }> = [
    {
      href: `/playbook?from=situation:${sessionId}`,
      label: "Read more on this",
      Icon: BookOpen,
    },
    {
      href: `/simulator/quick?from=situation:${sessionId}`,
      label: "Roleplay the call now",
      Icon: ArrowRight,
    },
    {
      href: `/coach/new?from=situation:${sessionId}`,
      label: "Talk it through more",
      Icon: MessageCircle,
    },
  ];

  return (
    <section
      role="list"
      aria-label="Next steps"
      className="grid grid-cols-1 md:grid-cols-3 gap-3"
    >
      {paths.map((p) => (
        <Link
          key={p.href}
          role="listitem"
          href={p.href}
          className="group flex items-center justify-between gap-3 border border-paper-3 bg-paper p-4 hover:border-ink hover:bg-paper-2 transition-colors"
          style={{ borderRadius: "8px" }}
        >
          <span className="text-body-s text-ink">{p.label}</span>
          <p.Icon
            className="size-4 text-mute group-hover:text-ink group-hover:translate-x-0.5 transition-transform shrink-0"
            strokeWidth={1.5}
            aria-hidden
          />
        </Link>
      ))}
    </section>
  );
}
