/**
 * Step-3 context form: start date (with quick presets), sector (fixed
 * select), work setup (pill group), optional probation date. Includes
 * a hidden timezone field populated client-side from
 * `Intl.DateTimeFormat().resolvedOptions()`.
 *
 * Per the onboarding prototype the field labels are uppercase eyebrows
 * (not muted body-s) and the work-setup row is a pill-group component
 * (rounded capsule toggles) rather than rectangular bordered radios.
 */
"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";

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
  { value: "remote", label: "Fully remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "office", label: "Fully in-office" },
];

const SECTORS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "financial-services", label: "Financial services" },
  { value: "tech", label: "Tech" },
  { value: "public-sector", label: "Public sector" },
  { value: "healthcare", label: "Healthcare" },
  { value: "retail", label: "Retail / e-commerce" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other" },
];

function isoFor(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

function daysUntilNextMonday(): number {
  const day = new Date().getDay(); // 0=Sun .. 6=Sat
  // Monday is 1. If today is Monday, jump to *next* Monday (+7).
  const diff = (1 - day + 7) % 7;
  return diff === 0 ? 7 : diff;
}

export function ContextForm({ initial }: ContextFormProps) {
  const [tz, setTz] = useState<string>("UTC");
  const [startDate, setStartDate] = useState<string>(initial.start_date ?? "");
  const [workSetup, setWorkSetup] = useState<WorkSetup | "">(
    initial.work_setup ?? "",
  );
  const [state, action, pending] = useActionState<OnboardingFormState, FormData>(
    saveStep3Action,
    null,
  );

  useEffect(() => {
    try {
      const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (resolved) setTz(resolved);
    } catch {
      // Older browsers — stay on UTC.
    }
  }, []);

  const presets = useMemo(
    () => [
      { label: "Today", value: isoFor(0) },
      { label: "This Monday", value: isoFor(daysUntilNextMonday() - 7) },
      { label: "Next Monday", value: isoFor(daysUntilNextMonday()) },
    ],
    [],
  );

  return (
    <form action={action} className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <label htmlFor="start_date" className="text-eyebrow">
          Start date
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {presets.map((preset) => {
            const active = startDate === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => setStartDate(preset.value)}
                className={`px-4 py-2 text-body-s font-medium border transition-colors ${
                  active
                    ? "bg-ink text-paper border-ink"
                    : "bg-paper text-ink border-paper-3 hover:border-ink"
                }`}
                style={{ borderRadius: "999px" }}
              >
                {preset.label}
              </button>
            );
          })}
          <input
            id="start_date"
            name="start_date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-10 bg-paper border border-paper-3 px-3 text-body-s text-ink focus:outline-none focus:border-ink"
            style={{ borderRadius: "8px" }}
          />
        </div>
        <p className="text-caption text-mute">
          Your Day 1. Leave it blank if you&rsquo;re still finalising.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="sector" className="text-eyebrow">
          Sector{" "}
          <span className="text-mute-2 font-normal normal-case tracking-normal">
            (optional)
          </span>
        </label>
        <select
          id="sector"
          name="sector"
          defaultValue={initial.sector ?? ""}
          className="h-12 max-w-xs bg-paper border border-paper-3 px-3 text-body text-ink focus:outline-none focus:border-ink"
          style={{ borderRadius: "8px" }}
        >
          <option value="">Pick one (or skip)</option>
          {SECTORS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <p className="text-caption text-mute">
          Never the name of your employer.
        </p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-eyebrow">Where you&rsquo;ll work from</legend>
        <div role="radiogroup" className="flex flex-wrap items-center gap-2">
          {WORK_SETUPS.map((option) => {
            const active = workSetup === option.value;
            return (
              <label
                key={option.value}
                className={`cursor-pointer px-4 py-2 text-body-s font-medium border transition-colors ${
                  active
                    ? "bg-ink text-paper border-ink"
                    : "bg-paper text-ink border-paper-3 hover:border-ink"
                }`}
                style={{ borderRadius: "999px" }}
              >
                <input
                  type="radio"
                  name="work_setup"
                  value={option.value}
                  checked={active}
                  onChange={() => setWorkSetup(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="probation_review_date" className="text-eyebrow">
          Probation review date{" "}
          <span className="text-mute-2 font-normal normal-case tracking-normal">
            (optional)
          </span>
        </label>
        <input
          id="probation_review_date"
          name="probation_review_date"
          type="date"
          defaultValue={initial.probation_review_date ?? ""}
          className="h-12 max-w-xs bg-paper border border-paper-3 px-3 text-body text-ink focus:outline-none focus:border-ink"
          style={{ borderRadius: "8px" }}
        />
        <p className="text-caption text-mute">
          We&rsquo;ll quietly help you prep starting 21 days beforehand.
        </p>
      </div>

      <input type="hidden" name="timezone" value={tz} />

      {state?.error ? (
        <p role="alert" className="text-body-s text-danger">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 self-start mt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={pending}
          loadingText="Saving…"
          className="gap-2 min-w-[200px]"
        >
          Continue
          <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
        </Button>
        <p className="text-caption text-mute">Takes about thirty seconds.</p>
      </div>
    </form>
  );
}
