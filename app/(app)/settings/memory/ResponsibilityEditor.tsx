/**
 * Section 2 — Free-form facts ("What you've told me") as a divider-ruled
 * list. Each row: "You said [editable text]." in Fraunces italic body L,
 * "Added <day>" date stamp on the right (mute-2; fades on row hover),
 * pencil + trash affordances revealed on hover.
 *
 * Bottom row: a single "Tell FirstNinety something else" button that
 * expands to a textarea + Save / Cancel pair.
 */
"use client";

import { useActionState, useState, useTransition } from "react";

import { Pencil, Plus, Trash2, X } from "lucide-react";

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
  updated_at?: string | null;
};

function formatAddedDate(timestamp: string): string {
  const then = new Date(timestamp);
  if (Number.isNaN(then.getTime())) return "recently";
  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Added today";
  if (diffDays === 1) return "Added yesterday";
  if (diffDays < 7) {
    return `Added ${then.toLocaleDateString(undefined, { weekday: "long" })}`;
  }
  return `Added ${then.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
  })}`;
}

export function ResponsibilityEditor({
  responsibilities,
}: {
  responsibilities: Responsibility[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col border-t border-paper-3 list-none p-0 m-0">
        {responsibilities.length === 0 ? (
          <li className="border-b border-paper-3 py-4 text-body text-mute italic">
            Nothing yet. Add something below — your start date plans, the
            team you&rsquo;re joining, what you&rsquo;re trying to learn.
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

  if (editing) {
    return (
      <li className="border-b border-paper-3 py-4 flex flex-col gap-2">
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

  const addedAt = row.updated_at ?? row.created_at;
  return (
    <li className="group border-b border-paper-3 py-4 flex items-baseline gap-3 justify-between">
      <span className="font-display italic text-body-l text-ink flex-1">
        You said{" "}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="font-display italic underline decoration-mute-2 decoration-dashed underline-offset-4 hover:decoration-ink hover:decoration-solid focus-visible:decoration-ink focus-visible:decoration-solid transition-colors cursor-text text-left"
        >
          {row.description}
        </button>
        .
      </span>

      <span className="shrink-0 inline-flex items-center gap-2 text-caption text-mute-2 transition-opacity group-hover:opacity-40">
        {formatAddedDate(addedAt)}
      </span>

      <span className="shrink-0 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="p-1.5 text-mute hover:text-ink hover:bg-paper-2 transition-colors"
          style={{ borderRadius: "4px" }}
          aria-label="Edit"
        >
          <Pencil className="size-4" strokeWidth={1.5} aria-hidden />
        </button>
        <form action={deleteUserResponsibilityAction}>
          <input type="hidden" name="id" value={row.id} />
          <button
            type="submit"
            className="p-1.5 text-mute hover:text-danger hover:bg-paper-2 transition-colors"
            style={{ borderRadius: "4px" }}
            aria-label="Delete"
          >
            <Trash2 className="size-4" strokeWidth={1.5} aria-hidden />
          </button>
        </form>
      </span>
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
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="self-start inline-flex items-center gap-2 text-body text-mute hover:text-ink transition-colors"
      >
        <Plus className="size-4" strokeWidth={1.5} aria-hidden />
        Tell FirstNinety something else
      </button>
    );
  }

  return (
    <div
      className="flex flex-col gap-3 border border-paper-3 bg-paper-2 p-4"
      style={{ borderRadius: "8px" }}
    >
      <form
        action={(formData) => {
          startTransition(() => {
            action(formData);
            setAdding(false);
          });
        }}
        className="flex flex-col gap-3"
      >
        <textarea
          name="description"
          rows={3}
          placeholder="Tell me something else that would help me coach you better. One thing at a time is best."
          autoFocus
          required
          maxLength={500}
          className="w-full bg-paper border border-paper-3 p-3 text-body text-ink placeholder:text-mute"
          style={{ borderRadius: "6px" }}
        />
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAdding(false)}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={pending}>
            Save
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
