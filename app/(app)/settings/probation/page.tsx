/**
 * Probation settings — editorial-row layout per the Probation prototype.
 *
 * Reads top-to-bottom like a paragraph that happens to have controls.
 * Each row carries the fact in plain prose with a hover-revealed
 * "Change" link on the right; clicking the link (or the underlined
 * token in the prose) swaps to an inline-edit affordance with check /
 * x buttons. No form-based always-on input chrome.
 *
 * Empty state (no review date) renders a chip-driven empty-prompt
 * instead of the editorial rows.
 */
import { ProbationControls } from "./ProbationControls";
import { getProbationStatus } from "./actions";

export const metadata = {
  title: "Probation",
};

const DATE_LONG = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function formatLong(value: string | null): string | null {
  if (!value) return null;
  try {
    return DATE_LONG.format(new Date(`${value}T00:00:00Z`));
  } catch {
    return value;
  }
}

export default async function ProbationSettingsPage() {
  const status = await getProbationStatus();
  const reviewLong = formatLong(status.review_date);

  return (
    <div className="flex flex-col gap-7 max-w-(--max-reading)">
      <header className="flex flex-col gap-3">
        <p className="text-eyebrow text-mute-2">Settings &rarr; Probation</p>
        <h1 className="text-h1 text-balance">Your probation review.</h1>
        {reviewLong ? (
          <p
            className="font-display italic text-ink"
            style={{ fontSize: "22px", lineHeight: 1.4, letterSpacing: "-0.005em" }}
          >
            On {reviewLong}.
            {status.days_to_review !== null
              ? ` That's ${status.days_to_review} day${
                  status.days_to_review === 1 ? "" : "s"
                } away.`
              : ""}
          </p>
        ) : (
          <p className="text-body-l text-mute max-w-prose">
            Want to switch on Probation Mode? For the next three weeks,
            FirstNinety will sharpen everything around the review &mdash;
            missions, scenarios, the Coach. You can switch it off any
            time.
          </p>
        )}
      </header>

      <ProbationControls status={status} reviewDateLong={reviewLong} />
    </div>
  );
}
