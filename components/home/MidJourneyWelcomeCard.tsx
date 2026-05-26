/**
 * State B mid-journey welcome card.
 *
 * Renders once for a State B user (start_date 4-89 days before signup)
 * on their first visit to the Daily Home, above the standard Day N
 * content. Dismissed via dismissMidJourneyWelcomeAction which stamps
 * user_context.viewed_mid_journey_welcome_at and revalidates /home.
 *
 * Mirrors the WhatChangedCallout pattern from Post90Home.tsx so the
 * two dismissable callouts feel consistent.
 */
import { dismissMidJourneyWelcomeAction } from "@/app/(app)/home/actions";

type Props = {
  /** Current week (1-13). One paragraph references weeks 1 through (N-1). */
  currentWeek: number;
};

export function MidJourneyWelcomeCard({ currentWeek }: Props) {
  // For week 1 there are no prior weeks; this card shouldn't render
  // in that case, but defend against it.
  const pastWeeksText =
    currentWeek <= 1
      ? "Past weeks"
      : currentWeek === 2
        ? "Week 1"
        : `Weeks 1–${currentWeek - 1}`;

  return (
    <section
      role="region"
      aria-label="About the weeks you lived through"
      className="border border-paper-3 bg-paper-2 p-5 md:p-6 flex flex-col gap-3 max-w-3xl"
      style={{ borderRadius: "10px" }}
    >
      <p className="text-eyebrow">About the weeks you lived through</p>
      <p className="font-display italic text-body-l text-mute text-balance">
        {pastWeeksText}{" "}
        {currentWeek > 2 ? "are" : "is"} available to read if you want —
        they&rsquo;re the structured missions for the parts of your role
        you&rsquo;ve already done. They&rsquo;re not blocking anything.
        The current week is the focus.
      </p>
      <form
        action={dismissMidJourneyWelcomeAction}
        className="self-end"
      >
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 text-body-s font-medium text-mute hover:text-ink transition-colors px-3 py-1.5 border border-paper-3 hover:border-mute-2"
          style={{ borderRadius: "4px" }}
        >
          Got it
        </button>
      </form>
    </section>
  );
}
