/**
 * Client-side role picker. Renders six selectable cards; selecting one
 * highlights it, and Continue posts to the saveStep2Action server action.
 */
"use client";

import { useActionState, useState } from "react";

import { ArrowRight } from "lucide-react";

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
                className={`flex cursor-pointer flex-col gap-2 p-5 transition-colors ${
                  checked
                    ? "bg-ink text-paper"
                    : "bg-paper border border-paper-3 hover:border-ink"
                }`}
                style={{ borderRadius: "8px", aspectRatio: "4/3" }}
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

      <div className="flex flex-col items-center gap-2 self-center">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!selected}
          loading={pending}
          loadingText="Saving…"
          className="min-w-[240px] gap-2"
        >
          Continue
          <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
        </Button>
        <p className="text-caption text-mute">
          {selected ? "Press Enter to continue" : "Pick one to continue"}
        </p>
      </div>
    </form>
  );
}
