/**
 * Probation settings — capture the review date, override the default
 * 21-day activation window, and manually toggle Probation Mode on/off.
 *
 * The actual Probation Mode UI lands in Prompt 3.14; this surface is
 * what feeds it.
 */
import { ProbationControls } from "./ProbationControls";
import { getProbationStatus } from "./actions";

export default async function ProbationSettingsPage() {
  const status = await getProbationStatus();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-eyebrow">Probation</p>
        <h1 className="text-h1 mt-2 text-balance">Your probation review.</h1>
        <p className="text-body-l text-mute mt-3 max-w-prose">
          Tell us the date your formal review is booked. We&rsquo;ll
          quietly switch on Probation Mode {status.window_days} days
          before. You can override the window — anything from a week to
          three months.
        </p>
      </header>

      <ProbationControls status={status} />
    </div>
  );
}
