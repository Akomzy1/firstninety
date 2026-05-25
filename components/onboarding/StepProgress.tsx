/**
 * Onboarding progress dots.
 *
 * Matches the Onboarding Flow prototype: a row of 4 dots connected by
 * solid (past) or dashed (future) lines. Completed dots are --ink
 * filled; the current dot is --ink ring with a hollow centre; future
 * dots are --mute-2 hollow outlines.
 */
type StepProgressProps = {
  current: 1 | 2 | 3 | 4;
};

export function StepProgress({ current }: StepProgressProps) {
  const steps = [1, 2, 3, 4] as const;
  return (
    <ol
      className="flex items-center justify-center gap-0"
      aria-label={`Onboarding progress: step ${current} of 4`}
    >
      {steps.map((step, idx) => {
        const isComplete = step < current;
        const isCurrent = step === current;
        return (
          <li
            key={step}
            className="flex items-center"
            aria-current={isCurrent ? "step" : undefined}
          >
            {idx > 0 ? (
              <span
                aria-hidden
                className={`block h-px w-12 md:w-16 ${
                  step <= current ? "bg-ink" : "border-t border-dashed border-mute-2"
                }`}
              />
            ) : null}
            <span
              aria-hidden
              className={`block ${
                isCurrent
                  ? "size-3 rounded-full border-2 border-ink bg-paper"
                  : isComplete
                    ? "size-3 rounded-full bg-ink"
                    : "size-3 rounded-full border-2 border-mute-2 bg-paper"
              }`}
            />
            <span className="sr-only">
              Step {step}
              {isComplete ? " — complete" : isCurrent ? " — current" : ""}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
