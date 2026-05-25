/**
 * Reflection + mark-complete form for the mission detail page.
 *
 * The textarea persists the reflection alongside the status flip via
 * completeMissionAction. Once a mission is completed, the form locks
 * to read-only and shows the saved reflection.
 */
"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/Button";

import {
  completeMissionAction,
  type MissionActionState,
} from "../actions";

type Props = {
  missionSlug: string;
  initialReflection: string;
  alreadyCompleted: boolean;
};

export function CompleteMissionForm({
  missionSlug,
  initialReflection,
  alreadyCompleted,
}: Props) {
  const [state, action, pending] = useActionState<MissionActionState, FormData>(
    completeMissionAction,
    null,
  );

  if (alreadyCompleted) {
    return (
      <div
        className="bg-paper-2 border border-paper-3 p-4 text-body text-ink"
        style={{ borderRadius: "8px" }}
      >
        {initialReflection ? (
          <p className="font-display italic">{initialReflection}</p>
        ) : (
          <p className="text-mute italic">No reflection saved.</p>
        )}
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="mission_slug" value={missionSlug} />
      <label htmlFor="reflection" className="sr-only">
        Reflection
      </label>
      <textarea
        id="reflection"
        name="reflection"
        rows={4}
        defaultValue={initialReflection}
        placeholder="Two sentences are enough."
        maxLength={1000}
        className="w-full bg-paper-2 border border-paper-3 p-3 text-body text-ink placeholder:text-mute"
        style={{ borderRadius: "8px" }}
      />
      {state?.error ? (
        <p role="alert" className="text-body-s text-danger">
          {state.error}
        </p>
      ) : null}
      <div>
        <Button
          type="submit"
          variant="primary"
          loading={pending}
          loadingText="Saving…"
        >
          Mark complete
        </Button>
      </div>
    </form>
  );
}
