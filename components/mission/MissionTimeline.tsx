/**
 * Horizontal 90-day timeline (Mission Track prototype).
 *
 * Nine milestone dots spread across Day 1 → Day 90 with the current day
 * marker carrying the coral accent. Completed milestones fill solid
 * ink; upcoming render outlined --mute. Day labels in Geist Mono below.
 *
 * Phase 2.3 view-model only — dots are visual anchors, not clickable
 * filters. Mission cards live below the timeline.
 */
const MILESTONES = [1, 3, 5, 6, 10, 20, 45, 75, 90] as const;

type MissionTimelineProps = {
  currentDay: number;
  completedDays: ReadonlyArray<number>;
};

export function MissionTimeline({
  currentDay,
  completedDays,
}: MissionTimelineProps) {
  const completedSet = new Set(completedDays);
  return (
    <div className="relative pt-6 pb-7 max-w-4xl">
      {/* timeline rule */}
      <div
        className="absolute left-0 right-0 top-1/2 h-px bg-paper-3"
        aria-hidden
      />
      <div className="relative flex justify-between">
        {MILESTONES.map((day) => {
          const isCurrent =
            day === currentDay ||
            (day === closestMilestone(currentDay) && !completedSet.has(day));
          const isCompleted = completedSet.has(day) || day < currentDay;
          return (
            <div
              key={day}
              className="flex flex-col items-center"
              aria-current={isCurrent ? "step" : undefined}
            >
              {isCurrent ? (
                <span
                  className="relative grid size-8 place-items-center rounded-full bg-paper border-2 border-ink"
                  aria-label={`Currently around Day ${day}`}
                >
                  <span className="size-2 rounded-full bg-accent" aria-hidden />
                </span>
              ) : isCompleted ? (
                <span
                  className="size-3 rounded-full bg-ink"
                  aria-label={`Day ${day} completed`}
                />
              ) : (
                <span
                  className="size-3 rounded-full bg-paper border-2 border-mute-2"
                  aria-label={`Day ${day} upcoming`}
                />
              )}
              <span
                className={`mt-3 font-mono text-caption ${
                  isCurrent ? "text-ink font-medium" : "text-mute"
                }`}
              >
                Day {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function closestMilestone(day: number): number {
  let best: number = MILESTONES[0];
  let bestDist = Math.abs(day - best);
  for (const m of MILESTONES) {
    const d = Math.abs(day - m);
    if (d < bestDist) {
      best = m;
      bestDist = d;
    }
  }
  return best;
}
