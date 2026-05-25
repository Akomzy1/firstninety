/**
 * Step-3 context form: start date, sector (free text), work setup (3-way
 * radio), optional probation date. Includes a hidden timezone field
 * populated client-side from `Intl.DateTimeFormat().resolvedOptions()`.
 */
"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import { saveStep3Action, type OnboardingFormState } from "../actions";

type WorkSetup = "remote" | "hybrid" | "office";

type ContextFormProps = {
  initial: {
    start_date: string | null;
    sector: string | null;
    work_setup: WorkSetup | null;
    probation_review_date: string | null;
  };
};

const WORK_SETUPS: ReadonlyArray<{ value: WorkSetup; label: string }> = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "office", label: "In-office" },
];

export function ContextForm({ initial }: ContextFormProps) {
  const [tz, setTz] = useState<string>("UTC");
  const [state, action, pending] = useActionState<OnboardingFormState, FormData>(
    saveStep3Action,
    null,
  );

  useEffect(() => {
    try {
      const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot browser probe; SSR safe default is UTC.
      if (resolved) setTz(resolved);
    } catch {
      // Older browsers — stay on UTC.
    }
  }, []);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <label htmlFor="start_date" className="text-body-s text-mute">
          Start date
        </label>
        <Input
          id="start_date"
          name="start_date"
          type="date"
          defaultValue={initial.start_date ?? ""}
        />
        <p className="text-body-s text-mute">
          Your Day 1. Leave it blank if you&rsquo;re still finalising.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="sector" className="text-body-s text-mute">
          Sector{" "}
          <span className="text-mute-2 font-normal">(optional)</span>
        </label>
        <Input
          id="sector"
          name="sector"
          type="text"
          placeholder="financial services, public sector, agency…"
          defaultValue={initial.sector ?? ""}
        />
        <p className="text-body-s text-mute">
          One word or phrase — never the name of your employer.
        </p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-body-s text-mute">
          Where will you be working from?
        </legend>
        <div className="flex flex-col gap-2 sm:flex-row">
          {WORK_SETUPS.map((option) => (
            <label
              key={option.value}
              className={`flex h-12 flex-1 cursor-pointer items-center justify-center border bg-paper px-3 transition-colors ${
                initial.work_setup === option.value
                  ? "border-ink bg-paper-2"
                  : "border-paper-3 hover:border-mute"
              }`}
              style={{ borderRadius: "8px" }}
            >
              <input
                type="radio"
                name="work_setup"
                value={option.value}
                defaultChecked={initial.work_setup === option.value}
                className="sr-only"
              />
              <span className="text-body-s font-medium text-ink">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1">
        <label htmlFor="probation_review_date" className="text-body-s text-mute">
          Probation review date{" "}
          <span className="text-mute-2 font-normal">(optional)</span>
        </label>
        <Input
          id="probation_review_date"
          name="probation_review_date"
          type="date"
          defaultValue={initial.probation_review_date ?? ""}
        />
        <p className="text-body-s text-mute">
          The date your formal probation review is booked. We&rsquo;ll
          quietly help you prep starting 21 days beforehand.
        </p>
      </div>

      <input type="hidden" name="timezone" value={tz} />

      {state?.error ? (
        <p role="alert" className="text-body-s text-danger">
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={pending}
        loadingText="Saving…"
        className="self-start"
      >
        Continue
      </Button>
    </form>
  );
}
