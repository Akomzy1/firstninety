/**
 * Client-side role picker. Renders six selectable cards; selecting one
 * highlights it, and Continue posts to the saveStep2Action server action.
 */
"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/Button";

import { saveStep2Action, type OnboardingFormState } from "../actions";

type Role = {
  value: "ba" | "pm" | "sm" | "po" | "da" | "aie";
  label: string;
  description: string;
};

type RoleFormProps = {
  roles: ReadonlyArray<Role>;
  initialValue: Role["value"] | null;
};

export function RoleForm({ roles, initialValue }: RoleFormProps) {
  const [selected, setSelected] = useState<Role["value"] | null>(initialValue);
  const [state, action, pending] = useActionState<OnboardingFormState, FormData>(
    saveStep2Action,
    null,
  );

  return (
    <form action={action} className="flex flex-col gap-6">
      {/* Prototype: cards in a 2-col grid on tablet, 3-col on desktop.
          Selected card flips to --ink filled with --paper text. */}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => {
          const checked = selected === role.value;
          return (
            <li key={role.value}>
              <label
                className={`flex aspect-square cursor-pointer flex-col gap-1 p-4 transition-colors ${
                  checked
                    ? "bg-ink text-paper"
                    : "bg-paper border border-paper-3 hover:border-mute"
                }`}
                style={{ borderRadius: "8px" }}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={checked}
                  onChange={() => setSelected(role.value)}
                  className="sr-only"
                />
                <span
                  className={`font-display text-h4 ${checked ? "text-paper" : "text-ink"}`}
                >
                  {role.label}
                </span>
                <span
                  className={`text-body-s mt-auto ${checked ? "text-paper/70" : "text-mute"}`}
                >
                  {role.description}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {state?.error ? (
        <p role="alert" className="text-body-s text-danger text-center">
          {state.error}
        </p>
      ) : null}

      <div className="relative self-center">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!selected}
          loading={pending}
          loadingText="Saving…"
          className="min-w-[240px]"
        >
          Continue
        </Button>
        {selected ? (
          <span
            className="pointer-events-none absolute -right-2 -top-2 size-2 rounded-full bg-accent"
            aria-hidden
          />
        ) : null}
      </div>
    </form>
  );
}
