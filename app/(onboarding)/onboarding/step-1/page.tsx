/**
 * Onboarding step 1 — welcome.
 *
 * No inputs. Single CTA that forwards to step 2. If the user has already
 * completed onboarding, they're bounced to /home.
 */
import { Button } from "@/components/ui/Button";

import { saveStep1Action } from "../actions";
import { ensureOnboardingStep } from "@/lib/onboarding/state";

export default async function OnboardingStep1Page() {
  await ensureOnboardingStep(1);

  return (
    <div className="flex flex-col gap-5 py-6 md:py-8">
      <header>
        <p className="text-eyebrow">Step 1 of 4</p>
        <h1 className="text-h1 mt-2 text-balance">
          The next ninety days, with someone in your corner.
        </h1>
      </header>

      <div className="flex flex-col gap-4 text-body-l text-mute max-w-prose">
        <p>
          FirstNinety is for the work that doesn&rsquo;t fit a textbook —
          the meeting you weren&rsquo;t briefed for, the document that
          isn&rsquo;t in the playbook, the silence after you&rsquo;ve asked
          a question.
        </p>
        <p>
          Four short questions next. None of them are graded.
        </p>
      </div>

      <form action={saveStep1Action} className="mt-2">
        <Button type="submit" variant="primary" size="lg">
          Begin
        </Button>
      </form>
    </div>
  );
}
