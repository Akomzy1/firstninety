/**
 * Mission Track index — prototype's two-line italic headline + horizontal
 * 90-day timeline + the user's current-week missions stacked below.
 *
 * The week navigator + "view whole 90-day map" cross-link from Build
 * Prompt 2.3 collapse into the timeline itself; the timeline is the map.
 * Week selection is via the ?week=N query param; default = current week.
 */
import Link from "next/link";

import { MissionCard } from "@/components/mission/MissionCard";
import { MissionTimeline } from "@/components/mission/MissionTimeline";
import { createClient } from "@/lib/db/server";
import { requireAuth } from "@/lib/auth/server";
import { getDayState } from "@/lib/home/day-state";
import { getMissionTrackState, pickWeekMissions } from "@/lib/mission-track/state";

type PageProps = {
  searchParams: Promise<{ week?: string }>;
};

function parseWeekParam(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return fallback;
  if (n < 1 || n > 13) return fallback;
  return n;
}

export default async function MissionTrackPage({ searchParams }: PageProps) {
  const { week: weekParam } = await searchParams;
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: context } = await supabase
    .from("user_context")
    .select("start_date")
    .eq("user_id", user.id)
    .single();

  const dayState = getDayState(context?.start_date ?? null);
  const week = parseWeekParam(weekParam, dayState.week);
  const state = await getMissionTrackState();
  const weekMissions = pickWeekMissions(state, week);
  const completedDays = state.missions
    .filter((m) => m.status === "completed")
    .map((m) => m.display_day);

  return (
    <section className="mx-auto flex max-w-(--max-page) flex-col gap-7 px-4 py-7 md:px-6 md:py-8">
      <header className="flex flex-col gap-2 max-w-3xl">
        <p className="text-eyebrow">Mission Track</p>
        <h1 className="text-display text-balance leading-[1.05]">
          90 days. Six chapters.
          <br />
          <span className="font-display italic">One mission at a time.</span>
        </h1>
      </header>

      <MissionTimeline currentDay={dayState.day} completedDays={completedDays} />

      <div className="flex flex-wrap items-baseline justify-between gap-2 max-w-3xl">
        <h2 className="text-h3">
          Week {week}{" "}
          <span className="text-mute font-normal text-body-l">
            of 13
          </span>
        </h2>
        <WeekNavigator week={week} />
      </div>

      {state.role === null ? (
        <p className="text-body text-mute">
          Pick a role from{" "}
          <Link href="/settings/account" className="text-ink underline-offset-4 hover:underline">
            Settings &raquo; Account
          </Link>{" "}
          to unlock missions.
        </p>
      ) : weekMissions.length === 0 ? (
        <EmptyWeek week={week} role={state.role} />
      ) : (
        <ul className="flex flex-col gap-4 max-w-3xl">
          {weekMissions.map((mission) => (
            <li key={mission.id}>
              <MissionCard
                missionSlug={mission.slug}
                title={mission.title}
                description={mission.why_matters}
                day={mission.display_day}
                estimatedMinutes={mission.estimated_minutes}
                status={
                  mission.status === "completed"
                    ? "completed"
                    : mission.status === "locked"
                      ? "locked"
                      : "active"
                }
                statusLabel={
                  mission.status === "locked"
                    ? `Unlocks after ${mission.prerequisites.length} prior mission${mission.prerequisites.length === 1 ? "" : "s"}`
                    : mission.completed_at
                      ? `Completed ${formatRelative(mission.completed_at)}`
                      : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function WeekNavigator({ week }: { week: number }) {
  const prev = Math.max(1, week - 1);
  const next = Math.min(13, week + 1);
  return (
    <nav className="flex items-center gap-1 text-body-s" aria-label="Week navigator">
      <Link
        href={week > 1 ? `/mission-track?week=${prev}` : "#"}
        className={`px-2 py-1 ${week > 1 ? "text-ink hover:bg-paper-2" : "text-mute-2 pointer-events-none"}`}
        style={{ borderRadius: "4px" }}
        aria-disabled={week === 1}
      >
        ← Week {prev}
      </Link>
      <Link
        href={week < 13 ? `/mission-track?week=${next}` : "#"}
        className={`px-2 py-1 ${week < 13 ? "text-ink hover:bg-paper-2" : "text-mute-2 pointer-events-none"}`}
        style={{ borderRadius: "4px" }}
        aria-disabled={week === 13}
      >
        Week {next} →
      </Link>
    </nav>
  );
}

function EmptyWeek({ week, role }: { week: number; role: string }) {
  return (
    <div
      className="flex flex-col gap-2 border border-paper-3 bg-paper p-5 md:p-6 max-w-3xl"
      style={{ borderRadius: "10px" }}
    >
      <p className="text-eyebrow">Week {week}</p>
      <p className="font-display text-h3 text-ink">
        No missions seeded for this week yet.
      </p>
      <p className="text-body text-mute">
        Content for the {role.toUpperCase()} role lands in Prompt 2.6;
        once seeded, the week&rsquo;s missions show up here in
        sequence-order.
      </p>
    </div>
  );
}

function formatRelative(timestamp: string): string {
  const then = new Date(timestamp).getTime();
  if (Number.isNaN(then)) return "recently";
  const diffDays = Math.floor((Date.now() - then) / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 7)} weeks ago`;
}
