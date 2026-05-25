"use client";

/**
 * Active scenario session — light-mode page used inside the (focus)
 * route group. Per the Simulator Session prototype:
 *
 *   - Header strip: eyebrow "[role] — <scenario title> — Turn N of ~M"
 *     on the left, "Exit scenario" link on the right.
 *   - Conversation rendered top-down. Each persona turn carries a
 *     monogram + name on the left and the message on the right. User
 *     turns are NOT differentiated by colour or bubble — "You" is one
 *     voice in the room (`PersonaMonogram` with the teal palette).
 *   - Composer at the foot of the column. "What do you say next?"
 *     textarea + bottom-right send glyph + ⌘ + Enter caption.
 *
 * The hook (`useClaudeStream`) accumulates the live persona turn from
 * `persona_turn_start` + `text_delta` events; when `message_complete`
 * fires we `router.refresh()` so the persisted turn lands as part of
 * the server-rendered transcript on the next paint and the live pair
 * clears.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { ArrowRight, VolumeX } from "lucide-react";

import {
  PersonaMonogram,
  type PersonaColour,
} from "@/components/simulator/PersonaMonogram";
import { abandonScenarioRunAction } from "@/app/(app)/simulator/actions";
import { useClaudeStream } from "@/lib/coach/use-stream";

export type TurnRecord = {
  speaker: string;
  content: string;
};

type Persona = {
  name: string;
  role: string;
  monogram: string;
  colour: string;
};

type ActiveSessionProps = {
  runId: string;
  scenarioSlug: string;
  scenarioTitle: string;
  roleLabel: string;
  /** All personas in the scenario, keyed by name for monogram lookup. */
  personas: Persona[];
  /** Persisted transcript. */
  initialTurns: TurnRecord[];
  estimatedMinutes: number;
};

const USER_SPEAKER = "You";
const TARGET_TURNS = 12;

export function ActiveSession({
  runId,
  scenarioSlug,
  scenarioTitle,
  roleLabel,
  personas,
  initialTurns,
  estimatedMinutes,
}: ActiveSessionProps) {
  const router = useRouter();
  const stream = useClaudeStream();
  const [draft, setDraft] = useState("");
  // Capture the user's submitted turn locally so the live pair includes
  // it even before the server refresh lands the persisted row.
  const [pendingUser, setPendingUser] = useState<string | null>(null);
  // Live persona turn (from persona_turn_start + accumulating deltas).
  const [livePersona, setLivePersona] = useState<{
    name: string;
    monogram: string;
    colour: string;
  } | null>(null);

  // Reset the persona pip whenever the stream resets / completes.
  useEffect(() => {
    if (!stream.isStreaming && stream.isComplete) {
      // Persisted turn lands on refresh; clear the local live pair.
      router.refresh();
      setPendingUser(null);
      setLivePersona(null);
      stream.resetStream();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream.isComplete, stream.isStreaming]);

  // Capture persona_turn_start from the events list.
  useEffect(() => {
    const last = stream.events[stream.events.length - 1];
    if (!last) return;
    if (last.type === "persona_turn_start") {
      setLivePersona({
        name: last.speaker_name,
        monogram: last.monogram,
        colour: last.colour,
      });
    } else if (last.type === "scenario_end") {
      // Route to debrief; 3.11 builds the real page.
      router.replace(
        `/simulator/${scenarioSlug}/run/${runId}/debrief`,
      );
    }
  }, [stream.events, scenarioSlug, runId, router]);

  const userTurns = initialTurns.filter((t) => t.speaker === USER_SPEAKER).length
    + (pendingUser ? 1 : 0);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = draft.trim();
    if (!message || stream.isStreaming) return;
    setPendingUser(message);
    setLivePersona(null);
    setDraft("");
    await stream.startStream({
      surface: "simulator_persona",
      context_id: runId,
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
    <main className="mx-auto w-full max-w-[880px] px-6 md:px-8 py-8 md:py-12 flex flex-col gap-8 min-h-[100vh]">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-eyebrow">
          {roleLabel} &middot; {scenarioTitle} &middot; Turn {userTurns} of ~
          {TARGET_TURNS}
        </p>
        <form action={abandonScenarioRunAction}>
          <input type="hidden" name="run_id" value={runId} />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 text-body-s text-mute hover:text-ink transition-colors"
            aria-label="Exit scenario"
          >
            <VolumeX className="size-3.5" strokeWidth={1.5} aria-hidden />
            Exit scenario
          </button>
        </form>
      </header>

      <div
        role="log"
        aria-live="polite"
        className="flex flex-col gap-7"
      >
        {initialTurns.map((t, i) => (
          <Turn key={`p:${i}`} speaker={t.speaker} content={t.content} personas={personas} />
        ))}

        {pendingUser ? (
          <Turn
            key="live-user"
            speaker={USER_SPEAKER}
            content={pendingUser}
            personas={personas}
          />
        ) : null}

        {livePersona || stream.text.length > 0 ? (
          <Turn
            key="live-persona"
            speaker={livePersona?.name ?? "…"}
            content={stream.text + (stream.isStreaming ? " ▍" : "")}
            personas={personas}
            overrideMonogram={livePersona?.monogram}
            overrideColour={livePersona?.colour}
          />
        ) : null}

        {stream.isStreaming && !livePersona && stream.text.length === 0 ? (
          <ThinkingRow />
        ) : null}

        {stream.error ? (
          <p
            role="alert"
            className="text-body-s text-danger border border-danger/40 bg-danger/5 px-4 py-2"
            style={{ borderRadius: "6px" }}
          >
            {stream.error.message}
          </p>
        ) : null}
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-auto pt-7 border-t border-paper-3"
      >
        <div className="relative">
          <label htmlFor="reply-input" className="sr-only">
            What do you say next?
          </label>
          <textarea
            id="reply-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            rows={3}
            placeholder="What do you say next?"
            disabled={stream.isStreaming}
            spellCheck
            className="block w-full bg-paper border border-paper-3 px-4 py-3.5 pr-16 text-body text-ink placeholder:text-mute placeholder:italic focus:outline-none focus:border-mute-2 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 resize-y disabled:opacity-50"
            style={{ borderRadius: "10px", fontSize: "17px", lineHeight: 1.55, minHeight: "100px" }}
          />
          <button
            type="submit"
            disabled={stream.isStreaming || draft.trim().length === 0}
            aria-label="Send reply"
            className="absolute bottom-3 right-3 inline-flex size-10 items-center justify-center text-mute-2 hover:text-ink hover:bg-paper-2 transition-colors disabled:opacity-40"
            style={{ borderRadius: "999px" }}
          >
            <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
          </button>
        </div>
        <p className="mt-2.5 text-caption text-mute italic">
          You can pause and resume any time.{" "}
          <span className="font-mono not-italic" style={{ fontSize: "11px" }}>
            Cmd-K
          </span>{" "}
          to exit. Estimated {estimatedMinutes} min.
        </p>
      </form>
    </main>
  );
}

function Turn({
  speaker,
  content,
  personas,
  overrideMonogram,
  overrideColour,
}: {
  speaker: string;
  content: string;
  personas: Persona[];
  overrideMonogram?: string;
  overrideColour?: string;
}) {
  const isUser = speaker === USER_SPEAKER;
  const persona =
    !isUser && personas.find((p) => p.name === speaker) ? personas.find((p) => p.name === speaker)! : null;
  const monogram = isUser ? "YO" : overrideMonogram ?? persona?.monogram ?? "—";
  const colour =
    (isUser
      ? "teal"
      : (overrideColour as PersonaColour | undefined) ??
        (persona?.colour as PersonaColour | undefined)) ?? "slate";

  return (
    <article className="grid grid-cols-[48px_1fr] gap-4">
      <PersonaMonogram initials={monogram} colour={colour} size="md" />
      <div className="flex flex-col gap-1.5 min-w-0">
        <p className="text-eyebrow">{speaker}</p>
        <p
          className="text-ink whitespace-pre-wrap"
          style={{ fontSize: "17px", lineHeight: 1.65 }}
        >
          {content}
        </p>
      </div>
    </article>
  );
}

function ThinkingRow() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid grid-cols-[48px_1fr] gap-4 items-center"
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
      <span className="text-body-s text-mute italic">
        Picking up the thread&hellip;
      </span>
    </div>
  );
}
