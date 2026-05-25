/**
 * Onboarding step 3 — where you're starting.
 *
 * All fields are optional. Probation date is the one PRD §6.6 calls out;
 * it gates Probation Mode auto-activation later. Timezone is read from the
 * browser via a hidden client field so cron triggers fire at sensible
 * local hours.
 */
import { ensureOnboardingStep } from "@/lib/onboarding/state";

import { ContextForm } from "./ContextForm";

export default async function OnboardingStep3Page() {
  const state = await ensureOnboardingStep(3);

  return (
    <div className="flex flex-col gap-6 py-2">
      <header className="text-center flex flex-col gap-3">
        <p className="text-eyebrow">
          <span className="font-mono text-mute-2 mr-3" style={{ fontSize: "11px" }}>
            03 / 04
          </span>
          Where you&rsquo;re starting
        </p>
        <h1 className="text-display text-balance">
          Where you&rsquo;re starting.
        </h1>
        <p className="text-body-l text-mute mt-1 max-w-prose mx-auto">
          A few details so the missions and playbooks fit your week.
          Anything you skip is editable later from Settings &raquo; Memory.
        </p>
      </header>

      <ContextForm
        initial={{
          start_date: state.start_date,
          sector: state.sector,
          work_setup: state.work_setup,
          probation_review_date: state.probation_review_date,
        }}
      />
    </div>
  );
}
