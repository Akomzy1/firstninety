"use client";

/**
 * Conversation — renders the editorial-layout turns (no chat bubbles)
 * for one Coach thread, plus the composer at the foot of the column.
 *
 * Per the AI Coach prototype:
 *   - User turn: 11px caps "YOU" + 1px mute-2 hairline underneath +
 *     17px body text on paper.
 *   - Coach turn: 11px caps "COACH" in ink + 2px accent-soft underline +
 *     17px body text on paper. Fraunces italic spans are used for
 *     quoted scripts / pull lines that the model marks with quotes.
 *   - Thinking row: three pulsing mute dots + "FirstNinety is thinking…"
 *     label. Renders below the latest turn while a stream is active.
 *   - Composer: textarea with bottom-right send button (arrow), foot
 *     line "Private to you. Encrypted. Deletable." + "⌘ + Enter to send".
 *
 * The hook (`useClaudeStream`) provides text_delta accumulation,
 * tool-call tracking, thread_created (for the new-thread flow), and
 * tier_limit / crisis surfaces.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ArrowRight } from "lucide-react";

import { TierLimitPrompt } from "@/components/billing/TierLimitPrompt";
import { OfflineGate } from "@/components/providers/OfflineGate";
import { CrisisReferral } from "@/components/safety/CrisisReferral";
import { useClaudeStream } from "@/lib/coach/use-stream";

export type PersistedMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

type ConversationProps = {
  threadId: string | null;
  topicTitle: string | null;
  /** Pre-existing turns loaded server-side. The composer's stream
   *  appends to a separate "live" pair so we don't have to refetch
   *  after each turn. */
  initialMessages: ReadonlyArray<PersistedMessage>;
  /** True when the thread row carries `flagged_for_safety = true` —
   *  ensures CrisisReferral renders on subsequent visits, not just
   *  the turn that triggered the flag. */
  initialFlaggedForSafety?: boolean;
};

export function Conversation({
  threadId,
  topicTitle,
  initialMessages,
  initialFlaggedForSafety = false,
}: ConversationProps) {
  const router = useRouter();
  const stream = useClaudeStream();
  const [draft, setDraft] = useState("");
  /**
   * The in-flight pair: once the user hits Send, we capture their
   * message locally (because the stream doesn't echo it) and let the
   * hook stream the Coach reply into `stream.text`.
   */
  const [pendingUser, setPendingUser] = useState<string | null>(null);

  // When the server creates a fresh thread, swap the URL so refreshes
  // land on /coach/[threadId]. Use router.replace to avoid a history
  // entry for /coach/new.
  useEffect(() => {
    if (stream.threadCreated) {
      router.replace(`/coach/${stream.threadCreated.thread_id}`);
    }
  }, [stream.threadCreated, router]);

  // After the stream completes on an existing thread, refresh the
  // route's server data so the persisted assistant message lands as
  // part of `initialMessages` on the next render (replacing the live
  // pair below).
  useEffect(() => {
    if (stream.isComplete && threadId) {
      router.refresh();
    }
  }, [stream.isComplete, threadId, router]);

  const isStreaming = stream.isStreaming;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = draft.trim();
    if (!message || isStreaming) return;
    setPendingUser(message);
    setDraft("");
    await stream.startStream({
      surface: "coach",
      // null/empty context_id triggers fresh-thread creation server-side.
      context_id: threadId ?? "",
      user_message: message,
    });
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
    }
  };

  return (
    <section
      aria-label={topicTitle ? `Thread: ${topicTitle}` : "New Coach thread"}
      className="flex flex-col px-6 py-7 md:px-10 md:py-10 min-w-0 min-h-[calc(100vh-4rem)]"
    >
      {topicTitle ? (
        <header className="mb-12">
          <p className="text-eyebrow line-clamp-2">{topicTitle}</p>
        </header>
      ) : (
        <header className="mb-12">
          <p className="text-eyebrow text-mute-2">New thread</p>
          <h2 className="font-display font-normal text-ink mt-2 text-balance"
              style={{ fontSize: "26px", lineHeight: 1.25 }}>
            What&rsquo;s on your mind?
          </h2>
        </header>
      )}

      {/* Soft safety advisories — non-blocking. */}
      {stream.piiAdvisory ? (
        <p className="font-display italic text-body-s text-mute mb-4">
          Looks like there&rsquo;s a {stream.piiAdvisory.pii_types.join(" / ")}{" "}
          in your message — consider removing it; the Coach doesn&rsquo;t
          need it.
        </p>
      ) : null}
      {stream.namesAdvisory ? (
        <p className="font-display italic text-body-s text-mute mb-4">
          Looks like you might be using a real name (
          {stream.namesAdvisory.matches.join(", ")}). &ldquo;My lead
          dev&rdquo; or similar reads better.
        </p>
      ) : null}

      {/* Conversation log */}
      <div
        role="log"
        aria-live="polite"
        className="flex flex-col gap-12 mb-12 max-w-[64ch]"
      >
        {initialMessages.map((m) =>
          m.role === "user" ? (
            <UserTurn key={m.id}>{m.content}</UserTurn>
          ) : (
            <CoachTurn key={m.id}>
              <RichBody text={m.content} />
            </CoachTurn>
          ),
        )}

        {/* Live pair while a stream is in flight or just-completed but
            router.refresh() hasn't landed the persisted rows yet. */}
        {pendingUser ? <UserTurn>{pendingUser}</UserTurn> : null}

        {stream.text.length > 0 || stream.toolsInFlight.length > 0 ? (
          <CoachTurn>
            {stream.toolsInFlight.length > 0 && stream.text.length === 0 ? (
              <ToolInFlight names={stream.toolsInFlight.map((t) => t.tool_name)} />
            ) : null}
            {stream.text.length > 0 ? <RichBody text={stream.text} /> : null}
            {isStreaming && stream.text.length > 0 ? (
              <span className="inline-block align-middle ml-1 size-2 bg-mute animate-pulse" />
            ) : null}
          </CoachTurn>
        ) : null}

        {isStreaming && stream.text.length === 0 && stream.toolsInFlight.length === 0 ? (
          <Thinking />
        ) : null}
      </div>

      {/* Tier limit + Crisis referral inline */}
      {stream.tierLimit ? (
        <TierLimitPrompt
          allowance={stream.tierLimit.allowance}
          variant="inline"
          className="mb-6"
        />
      ) : null}
      {stream.crisisFlag ? (
        <CrisisReferral
          category={stream.crisisFlag.category}
          className="mb-6"
        />
      ) : initialFlaggedForSafety ? (
        // Thread was previously flagged. The CrisisReferral is a
        // persistent affordance, not a one-shot — show it on reload too.
        <CrisisReferral category="self_harm" className="mb-6" />
      ) : null}
      {stream.error && !stream.tierLimit ? (
        <section
          className="border border-danger/40 bg-danger/5 p-4 text-body-s text-ink mb-6"
          style={{ borderRadius: "8px" }}
          role="alert"
        >
          <p className="text-eyebrow text-danger mb-1">Stream error</p>
          <p>{stream.error.message}</p>
        </section>
      ) : null}

      {/* Composer */}
      <div className="mt-auto pt-7 border-t border-paper-3 max-w-[64ch]">
      <OfflineGate surface="coach">
      <form onSubmit={onSubmit}>
        <div className="relative">
          <label htmlFor="coach-input" className="sr-only">
            Write to your coach
          </label>
          <textarea
            id="coach-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            rows={2}
            placeholder="Write the next thing on your mind. Anonymise as you go &mdash; &ldquo;my manager&rdquo;, not their name."
            spellCheck
            disabled={isStreaming}
            className="block w-full min-h-[84px] bg-paper border border-paper-3 px-4 py-4 pr-14 text-body text-ink placeholder:text-mute placeholder:italic focus:outline-none focus:border-mute-2 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 resize-y disabled:opacity-50"
            style={{ borderRadius: "8px", fontSize: "17px", lineHeight: 1.55 }}
          />
          <button
            type="submit"
            disabled={isStreaming || draft.trim().length === 0}
            aria-label="Send"
            className="absolute bottom-3 right-3 inline-flex size-9 items-center justify-center text-mute-2 hover:text-ink hover:bg-paper-2 transition-colors disabled:opacity-40"
            style={{ borderRadius: "999px" }}
          >
            <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
          </button>
        </div>
        <div className="flex items-baseline justify-between mt-2.5">
          <span className="text-caption text-mute-2">
            Private to you. Encrypted. Deletable.
          </span>
          <span className="font-mono text-mute-2" style={{ fontSize: "11px" }}>
            &#8984; + Enter to send
          </span>
        </div>
      </form>
      </OfflineGate>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------- //
// Editorial turn primitives                                              //
// --------------------------------------------------------------------- //

function UserTurn({ children }: { children: React.ReactNode }) {
  return (
    <article className="flex flex-col max-w-[64ch]">
      <span className="self-start inline-block relative font-body font-semibold text-[11px] uppercase tracking-[0.12em] text-mute pb-1.5 mb-3.5 border-b border-mute-2/60">
        You
      </span>
      <div
        className="text-ink leading-relaxed whitespace-pre-wrap"
        style={{ fontSize: "17px", lineHeight: 1.7 }}
      >
        {children}
      </div>
    </article>
  );
}

function CoachTurn({ children }: { children: React.ReactNode }) {
  return (
    <article className="flex flex-col max-w-[64ch]">
      <span className="self-start inline-block relative font-body font-semibold text-[11px] uppercase tracking-[0.12em] text-ink pb-1.5 mb-3.5 border-b-2 border-accent-soft">
        Coach
      </span>
      <div
        className="text-ink space-y-3.5"
        style={{ fontSize: "17px", lineHeight: 1.7 }}
      >
        {children}
      </div>
    </article>
  );
}

function Thinking() {
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
      <span className="text-body-s text-mute">FirstNinety is thinking&hellip;</span>
    </div>
  );
}

function ToolInFlight({ names }: { names: string[] }) {
  const friendly = names.map(friendlyToolName).join(" + ");
  return (
    <p className="text-body-s text-mute italic">
      Checking your {friendly}&hellip;
    </p>
  );
}

function friendlyToolName(name: string): string {
  switch (name) {
    case "get_user_context":
      return "context";
    case "search_playbooks":
      return "Playbook Library";
    case "get_situation_history":
      return "Situation Room history";
    case "get_probation_evidence":
      return "probation evidence";
    default:
      return name.replace(/_/g, " ");
  }
}

/**
 * Lightweight rendering for Coach turn bodies: paragraph breaks on
 * double-newline, italicises straight double-quoted spans (Coach voice
 * marks them per voice.md). Markdown-grade rendering can swap in later
 * if the model starts emitting more complex formatting.
 */
function RichBody({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/);
  return (
    <>
      {paragraphs.map((para, i) => (
        <p key={i} className="whitespace-pre-wrap">
          {renderInlineQuotes(para)}
        </p>
      ))}
    </>
  );
}

function renderInlineQuotes(text: string): React.ReactNode {
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
