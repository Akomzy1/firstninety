/**
 * Inline-editable list of user_responsibilities.
 *
 * Each row supports view → edit → save / delete via server actions.
 * A "Add something else I should know" form sits at the bottom.
 */
"use client";

import { useActionState, useState, useTransition } from "react";

import { Pencil, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import {
  addUserResponsibilityAction,
  deleteUserResponsibilityAction,
  updateUserResponsibilityAction,
  type SettingsActionState,
} from "../actions";

type Responsibility = {
  id: string;
  description: string;
  source: string;
  created_at: string;
};

const SOURCE_LABEL: Record<string, string> = {
  onboarding: "From onboarding",
  sunday_prompt: "From Sunday recap",
  coach_inferred: "From the Coach",
  user_manual: "You added this",
};

export function ResponsibilityEditor({
  responsibilities,
}: {
  responsibilities: Responsibility[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {responsibilities.length === 0 ? (
          <li className="text-body text-mute italic">
            Nothing yet. Add something below — start date plans, the team
            you&rsquo;re joining, what you&rsquo;re trying to learn.
          </li>
        ) : (
          responsibilities.map((row) => (
            <ResponsibilityRow key={row.id} row={row} />
          ))
        )}
      </ul>

      <AddResponsibility />
    </div>
  );
}

function ResponsibilityRow({ row }: { row: Responsibility }) {
  const [editing, setEditing] = useState(false);
  const [pendingUpdate, startUpdate] = useTransition();
  const [updateState, updateAction] = useActionState<SettingsActionState, FormData>(
    updateUserResponsibilityAction,
    null,
  );

  if (!editing) {
    return (
      <li className="group flex items-baseline gap-3">
        <span className="font-display italic text-body-l text-ink flex-1">
          {row.description}
        </span>
        <span className="text-body-s text-mute hidden md:inline">
          {SOURCE_LABEL[row.source] ?? row.source}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-mute hover:text-ink transition-opacity"
          aria-label="Edit"
        >
          <Pencil className="size-4" strokeWidth={1.5} aria-hidden />
        </button>
        <form action={deleteUserResponsibilityAction}>
          <input type="hidden" name="id" value={row.id} />
          <button
            type="submit"
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-mute hover:text-danger transition-opacity"
            aria-label="Delete"
          >
            <Trash2 className="size-4" strokeWidth={1.5} aria-hidden />
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-2">
      <form
        action={(formData) => {
          startUpdate(() => {
            updateAction(formData);
            setEditing(false);
          });
        }}
        className="flex flex-col gap-2 sm:flex-row sm:items-start"
      >
        <input type="hidden" name="id" value={row.id} />
        <Input
          name="description"
          defaultValue={row.description}
          className="sm:flex-1"
          autoFocus
          maxLength={500}
        />
        <div className="flex gap-2">
          <Button type="submit" variant="primary" size="sm" loading={pendingUpdate}>
            Save
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setEditing(false)}
          >
            <X className="size-4" strokeWidth={1.5} aria-hidden />
            <span className="sr-only">Cancel</span>
          </Button>
        </div>
      </form>
      {updateState?.error ? (
        <p role="alert" className="text-body-s text-danger">
          {updateState.error}
        </p>
      ) : null}
    </li>
  );
}

function AddResponsibility() {
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();
  const [state, action] = useActionState<SettingsActionState, FormData>(
    addUserResponsibilityAction,
    null,
  );

  if (!adding) {
    return (
      <Button
        type="button"
        variant="ghost"
        onClick={() => setAdding(true)}
        className="self-start"
      >
        + Add something else I should know
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <form
        action={(formData) => {
          startTransition(() => {
            action(formData);
            setAdding(false);
          });
        }}
        className="flex flex-col gap-2 sm:flex-row sm:items-start"
      >
        <Input
          name="description"
          placeholder="I'm joining a payments team that's mid-migration to a new gateway."
          autoFocus
          required
          maxLength={500}
          className="sm:flex-1"
        />
        <div className="flex gap-2">
          <Button type="submit" variant="primary" size="sm" loading={pending}>
            Remember this
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAdding(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
      {state?.error ? (
        <p role="alert" className="text-body-s text-danger">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
