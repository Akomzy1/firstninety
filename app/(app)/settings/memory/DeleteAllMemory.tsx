/**
 * "Delete everything I've told you" — destructive ghost button with a
 * native <dialog> confirmation. Calls deleteAllMemoryAction which
 * soft-deletes every user_responsibilities row and clears the editable
 * user_context fields (sector / work_setup / probation_review_date /
 * focus_areas). Role + start_date stay.
 */
"use client";

import { useRef, useTransition } from "react";

import { Button } from "@/components/ui/Button";

import { deleteAllMemoryAction } from "../actions";

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
      <Button
        type="button"
        variant="ghost"
        tone="destructive"
        onClick={open}
        className="self-start"
      >
        Delete everything I&rsquo;ve told you
      </Button>

      <dialog
        ref={dialogRef}
        className="bg-paper text-ink border border-paper-3 p-6 max-w-md backdrop:bg-ink/40"
        style={{ borderRadius: "8px" }}
      >
        <h2 className="text-h3 mb-3">Delete everything you&rsquo;ve told me?</h2>
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
