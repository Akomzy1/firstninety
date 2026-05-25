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
    <div className="flex flex-col gap-5 py-6 md:py-8">
      <header>
        <p className="text-eyebrow">Step 3 of 4</p>
        <h1 className="text-h1 mt-2 text-balance">Where you&rsquo;re starting.</h1>
        <p className="text-body-l text-mute mt-3 max-w-prose">
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
