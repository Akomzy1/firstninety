/**
 * Section 1 — Role + start facts as a divider-ruled list.
 *
 * Per the Memory Settings prototype each row is "[Sentence with one
 * underlined editable value]." in Fraunces italic body L, with the
 * editable value carrying a dashed underline on row hover, and the
 * pencil affordance fading in on the right.
 *
 * Save fires updateUserContextFactAction; revalidation re-renders the
 * row server-side with the new value.
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
  roleLabel: string | null;
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
      day: "numeric",
      month: "long",
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
    <ul className="flex flex-col border-t border-paper-3 list-none p-0 m-0">
      {/* Role — read-only; changes require re-onboarding. */}
      <li className="border-b border-paper-3 py-4">
        <span className="font-display italic text-body-l text-ink">
          You&rsquo;re working as a{" "}
          <span className="underline decoration-mute-2 decoration-dashed underline-offset-4">
            {roleLabel ?? "—"}
          </span>
          .
        </span>
      </li>

      <EditableContextFactRow
        field="start_date"
        type="date"
        inputValue={startDate}
        prefix="You started on"
        suffix="."
        displayValue={formatDate(startDate)}
        placeholder="a date"
      />

      <EditableContextFactRow
        field="sector"
        type="text"
        inputValue={sector}
        prefix={"You’re working in"}
        suffix="."
        displayValue={sector}
        placeholder="a sector"
      />

      <EditableContextFactRow
        field="work_setup"
        type="select"
        inputValue={workSetup}
        prefix={"You’re working in a"}
        suffix=" setup."
        displayValue={workSetup ? (WORK_SETUP_LABEL[workSetup] ?? workSetup) : null}
        placeholder="setup"
      />

      <EditableContextFactRow
        field="probation_review_date"
        type="date"
        inputValue={probationDate}
        prefix="Your probation review is on"
        suffix="."
        displayValue={formatDate(probationDate)}
        placeholder="a date"
      />
    </ul>
  );
}

type EditableContextFactRowProps = {
  field: Field;
  type: "text" | "date" | "select";
  inputValue: string | null;
  prefix: string;
  suffix: string;
  displayValue: string | null;
  placeholder: string;
};

function EditableContextFactRow({
  field,
  type,
  inputValue,
  prefix,
  suffix,
  displayValue,
  placeholder,
}: EditableContextFactRowProps) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [state, action] = useActionState<SettingsActionState, FormData>(
    updateUserContextFactAction,
    null,
  );

  if (editing) {
    return (
      <li className="border-b border-paper-3 py-4 flex flex-col gap-2">
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
              autoFocus
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

  return (
    <li className="group border-b border-paper-3 py-4 flex items-baseline gap-3 justify-between">
      <span className="font-display italic text-body-l text-ink flex-1">
        {prefix}{" "}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="font-display italic underline decoration-mute-2 decoration-dashed underline-offset-4 hover:decoration-ink hover:decoration-solid focus-visible:decoration-ink focus-visible:decoration-solid transition-colors cursor-text"
        >
          {displayValue ?? (
            <span className="text-mute italic">{placeholder}</span>
          )}
        </button>
        {suffix}
      </span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-mute hover:text-ink transition-opacity"
        aria-label={`Edit ${field}`}
      >
        <Pencil className="size-4" strokeWidth={1.5} aria-hidden />
      </button>
    </li>
  );
}
