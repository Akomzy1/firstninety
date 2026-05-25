/**
 * "Delete everything I've told you" — Fraunces italic 22px danger-coloured
 * link styled per the Memory Settings prototype's `.destructive-link`.
 * Opens a native <dialog> confirmation before firing deleteAllMemoryAction
 * (soft-deletes all user_responsibilities rows and clears editable
 * user_context fields). Role + start_date stay.
 */
"use client";

import { useRef, useTransition } from "react";

import { Button } from "@/components/ui/Button";

import { deleteAllMemoryAction } from "@/app/(app)/settings/actions";

export function DeleteAllMemory() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();

  function open() {
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function confirm() {
    startTransition(async () => {
      await deleteAllMemoryAction();
      close();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="font-display italic text-danger text-left border-b border-dashed border-transparent hover:border-danger transition-colors"
        style={{ fontSize: "22px", lineHeight: 1.4, letterSpacing: "-0.005em" }}
      >
        Delete everything I&rsquo;ve told you
      </button>

      <dialog
        ref={dialogRef}
        className="bg-paper text-ink border border-paper-3 p-6 max-w-md backdrop:bg-ink/40"
        style={{ borderRadius: "8px" }}
      >
        <h2 className="text-h3 mb-3">Forget everything you&rsquo;ve told me?</h2>
        <p className="text-body text-mute mb-5 max-w-prose">
          Your role and start date stay. Everything else — sector, work
          setup, probation date, and the things you&rsquo;ve added — gets
          wiped immediately.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="primary"
            tone="destructive"
            onClick={confirm}
            loading={pending}
            loadingText="Deleting…"
          >
            Delete it all
          </Button>
          <Button type="button" variant="ghost" onClick={close}>
            Cancel
          </Button>
        </div>
      </dialog>
    </>
  );
}
