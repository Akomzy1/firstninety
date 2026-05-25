/**
 * Probation date + window + mode controls. Three forms backed by the
 * server actions in ./actions.ts.
 */
"use client";

import { useActionState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import {
  activateProbationModeAction,
  deactivateProbationModeAction,
  setProbationReviewDateAction,
  setProbationWindowAction,
  type ProbationActionState,
  type ProbationStatus,
} from "./actions";

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(`${value}T00:00:00Z`).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

export function ProbationControls({ status }: { status: ProbationStatus }) {
  const [dateState, dateAction, datePending] = useActionState<
    ProbationActionState,
    FormData
  >(setProbationReviewDateAction, null);
  const [windowState, windowAction, windowPending] = useActionState<
    ProbationActionState,
    FormData
  >(setProbationWindowAction, null);
  const [activating, startActivate] = useTransition();
  const [deactivating, startDeactivate] = useTransition();

  return (
    <div className="flex flex-col gap-7">
      <section className="flex flex-col gap-3 max-w-prose">
        <h2 className="text-h3">Review date</h2>
        {status.review_date ? (
          <p className="font-display italic text-body-l text-ink">
            Your probation review is on {formatDate(status.review_date)}.
            {status.days_to_review !== null
              ? ` That's ${status.days_to_review} day${status.days_to_review === 1 ? "" : "s"} away.`
              : ""}
          </p>
        ) : (
          <p className="text-body text-mute italic">
            No review date on file.
          </p>
        )}
        <form action={dateAction} className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <Input
            type="date"
            name="review_date"
            defaultValue={status.review_date ?? ""}
            className="sm:flex-1"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={datePending}
            loadingText="Saving…"
          >
            Save date
          </Button>
        </form>
        {dateState?.error ? (
          <p role="alert" className="text-body-s text-danger">
            {dateState.error}
          </p>
        ) : dateState?.notice ? (
          <p role="status" className="text-body-s text-mute">
            {dateState.notice}
          </p>
        ) : null}
      </section>

      <section className="flex flex-col gap-3 max-w-prose">
        <h2 className="text-h3">Activation window</h2>
        <p className="text-body text-mute">
          Probation Mode switches on this many days before your review.
          Default 21 days. Minimum 7, maximum 90.
        </p>
        <form action={windowAction} className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <Input
            type="number"
            name="window_days"
            defaultValue={status.window_days}
            min={7}
            max={90}
            step={1}
            className="sm:flex-1"
          />
          <Button
            type="submit"
            variant="secondary"
            size="md"
            loading={windowPending}
            loadingText="Saving…"
          >
            Save window
          </Button>
        </form>
        {windowState?.error ? (
          <p role="alert" className="text-body-s text-danger">
            {windowState.error}
          </p>
        ) : windowState?.notice ? (
          <p role="status" className="text-body-s text-mute">
            {windowState.notice}
          </p>
        ) : null}
      </section>

      <section className="flex flex-col gap-3 max-w-prose">
        <h2 className="text-h3">Probation Mode</h2>
        <p className="text-body text-mute">
          {status.active
            ? "Currently active. Probation surfaces — the Brief, the fourth Situation entry, the prep-pack Playbook — are live."
            : "Not active yet. Will activate automatically inside the window above, or switch it on manually."}
        </p>
        <div className="flex flex-wrap gap-2">
          {status.active ? (
            <form
              action={() => {
                startDeactivate(async () => {
                  await deactivateProbationModeAction();
                });
              }}
            >
              <Button
                type="submit"
                variant="secondary"
                tone="destructive"
                loading={deactivating}
              >
                Turn off Probation Mode
              </Button>
            </form>
          ) : (
            <form
              action={() => {
                startActivate(async () => {
                  await activateProbationModeAction();
                });
              }}
            >
              <Button
                type="submit"
                variant="primary"
                loading={activating}
                disabled={!status.review_date}
              >
                Turn on Probation Mode
              </Button>
            </form>
          )}
        </div>
        {!status.review_date ? (
          <p className="text-body-s text-mute">
            Set a review date first to enable manual activation.
          </p>
        ) : null}
      </section>
    </div>
  );
}
