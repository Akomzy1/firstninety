/**
 * Two-step deletion flow.
 *
 * Step 1: ghost destructive button → calls startAccountDeletionAction,
 * which sets a short-lived httpOnly cookie containing the confirmation
 * token and returns the user's email.
 *
 * Step 2: a full-screen modal asks the user to type their email +
 * presses the destructive primary. Submission posts the token + typed
 * email to confirmAccountDeletionAction which performs the actual delete
 * and redirects to /?account=deleted.
 */
"use client";

import { useActionState, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import {
  confirmAccountDeletionAction,
  startAccountDeletionAction,
  type ConfirmDeletionState,
} from "./actions";

export function DeleteAccountFlow() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [starting, startStart] = useTransition();
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [confirmState, confirmAction, confirming] = useActionState<
    ConfirmDeletionState,
    FormData
  >(confirmAccountDeletionAction, null);

  function openConfirm() {
    startStart(async () => {
      const { token, email } = await startAccountDeletionAction();
      setToken(token);
      setEmail(email);
      dialogRef.current?.showModal();
    });
  }

  function closeConfirm() {
    dialogRef.current?.close();
    setToken(null);
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        tone="destructive"
        onClick={openConfirm}
        loading={starting}
        className="self-start"
      >
        Delete my account
      </Button>

      <dialog
        ref={dialogRef}
        className="bg-paper text-ink border border-paper-3 p-6 max-w-lg w-full mx-auto backdrop:bg-ink/40"
        style={{ borderRadius: "8px" }}
      >
        <h2 className="text-h2 mb-3">Delete your FirstNinety account.</h2>
        <p className="text-body text-mute mb-4 max-w-prose">
          This is permanent. Every row tied to your account — declared
          memory, mission completions, transcripts, probation artefacts,
          push subscriptions, billing record — disappears immediately.
        </p>
        <p className="text-body text-mute mb-5 max-w-prose">
          To confirm, type your email below.
        </p>

        <form action={confirmAction} className="flex flex-col gap-3">
          {token ? <input type="hidden" name="token" value={token} /> : null}
          <Input
            type="email"
            name="email"
            placeholder={email ?? "you@example.com"}
            autoComplete="off"
            required
          />
          {confirmState?.error ? (
            <p role="alert" className="text-body-s text-danger">
              {confirmState.error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              variant="primary"
              tone="destructive"
              loading={confirming}
              loadingText="Deleting…"
            >
              Permanently delete
            </Button>
            <Button type="button" variant="ghost" onClick={closeConfirm}>
              Cancel
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
