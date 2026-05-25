/**
 * Sunday recap prompt — modal rendered on /home when ?sundayPrompt=1 is
 * present AND last_sunday_prompt_at is null or > 24h ago.
 *
 * Two paths:
 *   "Remember this" — saves the recap as a user_responsibilities row.
 *   "Not this week" — bumps last_sunday_prompt_at so we don't re-prompt
 *   in the next 24h.
 *
 * Auto-opens on mount; the URL is cleaned up after either path so the
 * modal doesn't re-show on refresh.
 */
"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { dispatchMeaningfulInteraction } from "@/lib/pwa/meaningful-interaction";

import {
  skipSundayPromptAction,
  submitSundayPromptAction,
  type SundayPromptState,
} from "./actions";

export function SundayPromptModal({ open }: { open: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [skipping, startSkip] = useTransition();
  const [state, action, pending] = useActionState<SundayPromptState, FormData>(
    submitSundayPromptAction,
    null,
  );
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (open && !closed) {
      if (!dialogRef.current.open) dialogRef.current.showModal();
    } else if (dialogRef.current.open) {
      dialogRef.current.close();
    }
  }, [open, closed]);

  useEffect(() => {
    if (state?.saved) {
      dispatchMeaningfulInteraction("sunday_prompt_submitted");
      handleClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.saved]);

  function handleClose() {
    setClosed(true);
    // Strip ?sundayPrompt=1 so refresh doesn't re-open the modal.
    const next = new URLSearchParams(searchParams);
    next.delete("sundayPrompt");
    const qs = next.toString();
    router.replace(qs ? `/home?${qs}` : "/home", { scroll: false });
  }

  function handleSkip() {
    startSkip(async () => {
      await skipSundayPromptAction();
      handleClose();
    });
  }

  return (
    <dialog
      ref={dialogRef}
      className="bg-paper text-ink border border-paper-3 p-6 max-w-lg w-full mx-auto backdrop:bg-ink/40"
      style={{ borderRadius: "8px" }}
      onClose={handleClose}
    >
      <p className="text-eyebrow">Sunday recap</p>
      <h2 className="text-h3 mt-2">What&rsquo;s coming up this week?</h2>
      <p className="text-body text-mute mt-2 max-w-prose">
        Any upcoming meetings, deliverables, or conversations on your mind?
      </p>

      <form action={action} className="mt-5 flex flex-col gap-3">
        <label htmlFor="sunday-response" className="sr-only">
          What&rsquo;s coming up this week?
        </label>
        <textarea
          id="sunday-response"
          name="response"
          rows={4}
          required
          minLength={3}
          maxLength={1000}
          placeholder="Two sentences are enough."
          className="w-full bg-paper-2 border border-paper-3 p-3 text-body text-ink placeholder:text-mute"
          style={{ borderRadius: "8px" }}
        />
        {state?.error ? (
          <p role="alert" className="text-body-s text-danger">
            {state.error}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" variant="primary" loading={pending}>
            Remember this →
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
            loading={skipping}
          >
            Not this week
          </Button>
        </div>
      </form>
    </dialog>
  );
}
