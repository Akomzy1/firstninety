/**
 * Onboarding step 1 — welcome. No inputs; single CTA to step 2.
 *
 * Per the onboarding prototype: "Welcome" eyebrow, two-minute promise
 * headline ("Two minutes. Then you can begin."), short editorial body
 * about the four questions, single Begin CTA with an arrow-right icon.
 */
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";

import { saveStep1Action } from "../actions";
import { ensureOnboardingStep } from "@/lib/onboarding/state";

export default async function OnboardingStep1Page() {
  await ensureOnboardingStep(1);

  return (
    <div className="flex flex-col items-center gap-6 py-2 text-center">
      <p className="text-eyebrow">
        <span className="font-mono text-mute-2 mr-3" style={{ fontSize: "11px" }}>
          01 / 04
        </span>
        Welcome
      </p>

      <h1 className="text-display text-balance leading-[1.05]">
        Two minutes.
        <br />
        <span className="font-display italic">Then you can begin.</span>
      </h1>

      <div className="flex flex-col gap-4 text-body-l text-mute max-w-prose mx-auto">
        <p>
          We need a few things to make this useful. Your role, where
          you&rsquo;re starting, and what&rsquo;s on your mind this week.
          Nothing more.
        </p>
        <p>Four short questions next. None of them are graded.</p>
      </div>

      <form action={saveStep1Action} className="relative mt-3">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="min-w-[240px] gap-2"
        >
          Begin
          <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
        </Button>
      </form>
    </div>
  );
}
