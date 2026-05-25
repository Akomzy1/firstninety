/**
 * Onboarding step 1 — welcome. No inputs; single CTA to step 2.
 * Prototype-aligned: centred display headline, brief italic subhead,
 * single primary CTA with coral accent dot.
 */
import { Button } from "@/components/ui/Button";

import { saveStep1Action } from "../actions";
import { ensureOnboardingStep } from "@/lib/onboarding/state";

export default async function OnboardingStep1Page() {
  await ensureOnboardingStep(1);

  return (
    <div className="flex flex-col items-center gap-6 py-2 text-center">
      <h1 className="text-display text-balance">
        The next ninety days,
        <br />
        <span className="font-display italic">with someone in your corner.</span>
      </h1>

      <div className="flex flex-col gap-4 text-body-l text-mute max-w-prose mx-auto">
        <p>
          FirstNinety is for the work that doesn&rsquo;t fit a textbook —
          the meeting you weren&rsquo;t briefed for, the document that
          isn&rsquo;t in the playbook, the silence after you&rsquo;ve
          asked a question.
        </p>
        <p>Four short questions next. None of them are graded.</p>
      </div>

      <form action={saveStep1Action} className="relative mt-3">
        <Button type="submit" variant="primary" size="lg" className="min-w-[240px]">
          Begin
        </Button>
        <span
          className="pointer-events-none absolute -right-2 -top-2 size-2 rounded-full bg-accent"
          aria-hidden
        />
      </form>
    </div>
  );
}
