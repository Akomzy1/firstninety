/**
 * Mission Track week view.
 *
 * Layout follows the Mission Track prototype:
 *   - `.week-head` strip with role-eyebrow ("Mission Track" + role-mark
 *     with persona-slate left rule), Fraunces 32px week title, and a
 *     navigator (· Prev · current · Next ·) on the right.
 *   - `.mission-row` grid: 4 columns @ desktop, 2 @ tablet, 1 @ mobile.
 *   - `.reflection-strip` with eyebrow + Fraunces italic prompt and a
 *     text-link to the journal on the right.
 *   - `.week-foot` "View whole 90-day map →" muted text link.
 *
 * The MissionTimeline lives below the week-foot as an in-page 90-day
 * map — same source of truth as the timeline rendered in /home Day-1
 * mode, exposing the rest of the journey without leaving the page.
 */
import Link from "next/link";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { MissionCard } from "@/components/mission/MissionCard";
import { MissionTimeline } from "@/components/mission/MissionTimeline";
import { createClient } from "@/lib/db/server";
import { requireAuth } from "@/lib/auth/server";
import { getDayState } from "@/lib/home/day-state";
import { getMissionTrackState, pickWeekMissions } from "@/lib/mission-track/state";

type PageProps = {
  searchParams: Promise<{ week?: string }>;
};

const ROLE_LABEL: Record<string, string> = {
  ba: "Business Analyst",
  pm: "Project Manager",
  sm: "Scrum Master",
  po: "Product Owner",
  da: "Data Analyst",
  aie: "AI Engineer",
};

const WEEK_THEMES: Record<number, string> = {
  1: "Land softly.",
  2: "Find your rhythm.",
  3: "Make your first deliverable visible.",
  4: "Find the disagreement.",
  5: "Run a meeting on your own terms.",
  6: "Lead from the front.",
  7: "Turn a mistake into a small system.",
  8: "Carry a piece of the team load.",
  9: "Show your range.",
  10: "Anchor a decision with evidence.",
  11: "Surface a risk.",
  12: "Build a portfolio piece.",
  13: "Make the case.",
};

const REFLECTION_PROMPTS: Record<number, string> = {
  1: "What surprised you most this week?",
  2: "Which question are you still afraid to ask?",
  3: "What did you have to defend that you didn't expect to?",
  4: "What was harder than you expected this week?",
  5: "Where did your judgement diverge from your manager's?",
  6: "What was harder than you expected this week?",
  7: "What small system did you build out of a mistake?",
  8: "What part of the team load are you carrying that you didn't last month?",
  9: "Where did your range surprise you?",
  10: "What decision do you wish you'd anchored sooner?",
  11: "What risk did you surface that nobody else was tracking?",
  12: "Which piece of work would you show outside the company?",
  13: "What did you learn this quarter that you didn't deliver?",
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

  const roleLabel = state.role ? (ROLE_LABEL[state.role] ?? state.role) : null;
  const theme = WEEK_THEMES[week] ?? "Keep going.";
  const reflectionPrompt =
    REFLECTION_PROMPTS[week] ?? "What was harder than you expected this week?";

  // State B detection — a past week (week < current) containing at
  // least one `skipped_pre_signup` mission. Drives the editorial note
  // above the cards and suppresses the reflection prompt below.
  const isPastWeek =
    week < dayState.week &&
    weekMissions.some((m) => m.status === "skipped_pre_signup");

  return (
    <section className="mx-auto flex max-w-(--max-page) flex-col gap-10 px-4 py-7 md:px-6 md:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-3">
            <span className="text-eyebrow">Mission Track</span>
            {roleLabel ? (
              <span
                className="text-eyebrow"
                style={{
                  color: "#6F7A86",
                  borderLeft: "2px solid #6F7A86",
                  paddingLeft: "10px",
                }}
              >
                {roleLabel}
              </span>
            ) : null}
          </div>
          <h1
            className="font-display font-normal text-balance text-ink"
            style={{ fontSize: "32px", lineHeight: 1.2, letterSpacing: "-0.015em" }}
          >
            Week {week} &mdash; {theme}
          </h1>
        </div>

        <WeekNavigator week={week} />
      </header>

      {state.role === null ? (
        <p className="text-body text-mute">
          Pick a role from{" "}
          <Link
            href="/settings/account"
            className="text-ink underline-offset-4 hover:underline"
          >
            Settings &raquo; Account
          </Link>{" "}
          to unlock missions.
        </p>
      ) : weekMissions.length === 0 ? (
        <EmptyWeek week={week} role={state.role} />
      ) : (
        <>
          {isPastWeek ? (
            <p className="font-display italic text-eyebrow text-mute-2 max-w-prose -mt-4">
              This is from a week you lived through before FirstNinety.
              Read at your own pace.
            </p>
          ) : null}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {weekMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                missionSlug={mission.slug}
                title={mission.title}
                description={mission.why_matters}
                day={mission.display_day}
                estimatedMinutes={mission.estimated_minutes}
                status={
                  mission.status === "completed"
                    ? "completed"
                    : mission.status === "skipped_pre_signup"
                      ? "skipped_pre_signup"
                      : mission.status === "locked"
                        ? "locked"
                        : "active"
                }
                statusLabel={
                  mission.status === "locked"
                    ? `Unlocks Day ${mission.display_day}`
                    : mission.completed_at
                      ? `Completed ${formatRelative(mission.completed_at)}`
                      : undefined
                }
                className="h-full"
              />
            ))}
          </div>
        </>
      )}

      {isPastWeek ? null : (
      <section
        aria-label="Weekly reflection"
        className="flex flex-wrap items-baseline justify-between gap-4 pt-7 border-t border-paper-3"
      >
        <div className="flex flex-col gap-2 max-w-[56ch]">
          <p className="text-eyebrow">Reflection</p>
          <p
            className="font-display italic text-ink text-balance"
            style={{ fontSize: "20px", lineHeight: 1.4 }}
          >
            {reflectionPrompt}
          </p>
        </div>
        <Link
          href="/situation-room"
          className="inline-flex items-center gap-1.5 text-body-s font-medium text-ink hover:text-mute transition-colors group"
        >
          Open journal
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            strokeWidth={1.5}
            aria-hidden
          />
        </Link>
      </section>
      )}

      <details className="border-t border-paper-3 pt-6 group">
        <summary className="cursor-pointer text-body-s font-medium text-mute hover:text-ink transition-colors inline-flex items-center gap-1.5">
          View whole 90-day map
          <ArrowRight
            className="size-3.5 group-open:rotate-90 transition-transform"
            strokeWidth={1.5}
            aria-hidden
          />
        </summary>
        <div className="mt-5">
          <MissionTimeline
            currentDay={dayState.day}
            completedDays={completedDays}
          />
        </div>
      </details>
    </section>
  );
}

function WeekNavigator({ week }: { week: number }) {
  const prev = Math.max(1, week - 1);
  const next = Math.min(13, week + 1);
  return (
    <nav
      className="inline-flex flex-wrap items-center gap-1 text-body-s"
      aria-label="Week navigation"
    >
      {week > 1 ? (
        <Link
          href={`/mission-track?week=${prev}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-ink hover:bg-paper-2 transition-colors"
          style={{ borderRadius: "999px" }}
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.5} aria-hidden />
          Week {prev}
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-mute-2">
          <ArrowLeft className="size-3.5" strokeWidth={1.5} aria-hidden />
          Week {prev}
        </span>
      )}
      <span aria-hidden className="text-mute-2 px-1">
        ·
      </span>
      <span
        className="inline-flex items-center px-3 py-1.5 font-semibold text-ink bg-paper-2 border border-paper-3"
        style={{ borderRadius: "999px" }}
        aria-current="page"
      >
        Week {week}
      </span>
      <span aria-hidden className="text-mute-2 px-1">
        ·
      </span>
      {week < 13 ? (
        <Link
          href={`/mission-track?week=${next}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-ink hover:bg-paper-2 transition-colors"
          style={{ borderRadius: "999px" }}
        >
          Week {next}
          <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-mute-2">
          Week {next}
          <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden />
        </span>
      )}
    </nav>
  );
}

function EmptyWeek({ week, role }: { week: number; role: string }) {
  return (
    <div
      className="flex flex-col gap-2 border border-paper-3 bg-paper p-5 md:p-6"
      style={{ borderRadius: "10px" }}
    >
      <p className="text-eyebrow">Week {week}</p>
      <p
        className="font-display font-normal text-ink"
        style={{ fontSize: "22px", lineHeight: 1.25 }}
      >
        No missions seeded for this week yet.
      </p>
      <p className="text-body-s text-mute">
        Content for the {role.toUpperCase()} role lands once seeded; the
        week&rsquo;s missions show up here in sequence-order.
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
