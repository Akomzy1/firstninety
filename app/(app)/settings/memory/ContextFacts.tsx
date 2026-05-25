/**
 * Inline-editable user_context facts.
 *
 * Each row is two states: read (Fraunces italic body L with a hover pencil)
 * and edit (input + save/cancel). Save fires updateUserContextFactAction;
 * revalidation on the server re-renders this surface with the fresh value.
 *
 * Role is shown but not editable here — changing role requires re-onboarding.
 */
"use client";

import { useActionState, useState, useTransition } from "react";

import { Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import {
  updateUserContextFactAction,
  type SettingsActionState,
} from "../actions";

type Field = "sector" | "work_setup" | "start_date" | "probation_review_date";

type ContextFactsProps = {
  roleLabel: string;
  startDate: string | null;
  sector: string | null;
  workSetup: "remote" | "hybrid" | "office" | null;
  probationDate: string | null;
};

const WORK_SETUP_LABEL: Record<string, string> = {
  remote: "fully remote",
  hybrid: "hybrid",
  office: "in-office",
};

function formatDate(value: string | null): string | null {
  if (!value) return null;
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

export function ContextFacts({
  roleLabel,
  startDate,
  sector,
  workSetup,
  probationDate,
}: ContextFactsProps) {
  return (
    <ul className="flex flex-col gap-2">
      <li className="font-display italic text-body-l text-ink">
        You&rsquo;re starting as a {roleLabel}.{" "}
        <span className="font-body not-italic text-body-s text-mute">
          Role changes go through re-onboarding.
        </span>
      </li>

      <EditableContextFactRow
        field="start_date"
        type="date"
        inputValue={startDate}
        readonly={false}
        display={
          startDate
            ? `You start on ${formatDate(startDate)}.`
            : "You haven't told me when you start."
        }
        emptyLabel="Add a start date"
      />

      <EditableContextFactRow
        field="sector"
        type="text"
        inputValue={sector}
        readonly={false}
        display={
          sector
            ? `You're working in the ${sector} sector.`
            : "You haven't told me a sector."
        }
        emptyLabel="Add a sector"
      />

      <EditableContextFactRow
        field="work_setup"
        type="select"
        inputValue={workSetup}
        readonly={false}
        display={
          workSetup
            ? `You're working ${WORK_SETUP_LABEL[workSetup] ?? workSetup}.`
            : "You haven't told me your work setup."
        }
        emptyLabel="Add a work setup"
      />

      <EditableContextFactRow
        field="probation_review_date"
        type="date"
        inputValue={probationDate}
        readonly={false}
        display={
          probationDate
            ? `Your probation review is on ${formatDate(probationDate)}.`
            : "You haven't told me your probation review date."
        }
        emptyLabel="Add a probation review date"
      />
    </ul>
  );
}

type EditableContextFactRowProps = {
  field: Field;
  type: "text" | "date" | "select";
  inputValue: string | null;
  readonly: boolean;
  display: string;
  emptyLabel: string;
};

function EditableContextFactRow({
  field,
  type,
  inputValue,
  display,
}: EditableContextFactRowProps) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [state, action] = useActionState<SettingsActionState, FormData>(
    updateUserContextFactAction,
    null,
  );

  if (!editing) {
    return (
      <li className="group flex items-baseline gap-3">
        <span className="font-display italic text-body-l text-ink">
          {display}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-mute hover:text-ink transition-opacity"
          aria-label="Edit"
        >
          <Pencil className="size-4" strokeWidth={1.5} aria-hidden />
        </button>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-2">
      <form
        action={(formData) => {
          startTransition(() => {
            action(formData);
            setEditing(false);
          });
        }}
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <input type="hidden" name="field" value={field} />
        {type === "select" ? (
          <select
            name="value"
            defaultValue={inputValue ?? ""}
            className="h-12 bg-paper-2 border border-paper-3 px-3 text-body text-ink"
            style={{ borderRadius: "8px" }}
          >
            <option value="">(clear)</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="office">In-office</option>
          </select>
        ) : (
          <Input
            type={type}
            name="value"
            defaultValue={inputValue ?? ""}
            className="sm:flex-1"
          />
        )}
        <div className="flex gap-2">
          <Button type="submit" variant="primary" size="sm" loading={pending}>
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
      {state?.error ? (
        <p role="alert" className="text-body-s text-danger">
          {state.error}
        </p>
      ) : null}
    </li>
  );
}
