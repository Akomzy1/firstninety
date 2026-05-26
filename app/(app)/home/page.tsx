/**
 * Daily home — Day 1, Day N within 90, and Probation Active states
 * (Phase 2.2 / per PRD §6.6).
 *
 * Layout follows the Daily Home prototypes:
 *  - Standard state: stacked two-line Fraunces H1, single mission card,
 *    Situation Room input + Week-at-a-glance sidebar.
 *  - Probation Active: the headline-as-signature gets out of the way.
 *    A small "Day N — Weekday, Month" eyebrow leads; the probation
 *    banner becomes the lead voice; the Brief-generation prompt is the
 *    only --ink surface, visible when days_to_review ≤ 7 and the brief
 *    has not yet been generated. The right rail swaps Week-at-a-glance
 *    for Probation-at-a-glance.
 *
 * Mission ordering is fixed at MVP — `week ASC, sequence_in_week ASC`.
 * Today's missions are the first not-yet-completed missions for the
 * current week. In probation mode we show up to three; the day before
 * the review (≤ 3 days) we narrow to one so the page isn't a checklist.
 */
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { BriefGenerationPrompt } from "@/components/home/BriefGenerationPrompt";
import { MidJourneyWelcomeCard } from "@/components/home/MidJourneyWelcomeCard";
import { MissionCard } from "@/components/mission/MissionCard";
import { Post90Home } from "@/components/home/Post90Home";
import { ProbationBanner } from "@/components/home/ProbationBanner";
import { RightSidebar } from "@/components/home/RightSidebar";
import { SituationRoomInput } from "@/components/home/SituationRoomInput";
import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";
import type { Database } from "@/lib/db/types.gen";
import { getDayState, type DayState } from "@/lib/home/day-state";
import { loadPost90Recent } from "@/lib/home/recent";

type Role = Database["public"]["Enums"]["role_enum"];

import { SundayPromptModal } from "./SundayPromptModal";

type HomePageProps = {
  searchParams: Promise<{ sundayPrompt?: string; view?: string }>;
};

type MissionRow = {
  slug: string;
  title: string;
  why_matters: string;
  estimated_minutes: number;
  sequence_in_week: number;
  week: number;
};

function isRecent(timestamp: string | null): boolean {
  if (!timestamp) return false;
  const last = new Date(timestamp).getTime();
  if (Number.isNaN(last)) return false;
  return Date.now() - last < 24 * 60 * 60 * 1000;
}

/** Heuristic: probation-themed mission for the chip on the home card. */
function isProbationMission(mission: MissionRow): boolean {
  if (mission.slug.toLowerCase().includes("probation")) return true;
  if (mission.slug.toLowerCase().includes("self-assessment")) return true;
  if (mission.slug.toLowerCase().includes("pre-review")) return true;
  if (mission.slug.toLowerCase().includes("evidence-portfolio")) return true;
  return mission.week >= 13;
}

const WEEK_THEMES: Record<number, string> = {
  1: "Land softly. Map the room.",
  2: "Find your rhythm; ask the dumb question.",
  3: "Make your first deliverable visible.",
  4: "Find the disagreement; name it.",
  5: "Run a meeting on your own terms.",
  6: "Make something stakeholders fight over.",
  7: "Turn a mistake into a small system.",
  8: "Carry a piece of the team load.",
  9: "Show your range across two domains.",
  10: "Anchor a decision with evidence.",
  11: "Surface a risk no one's tracking.",
  12: "Build a portfolio piece you'd show outside.",
  13: "Probation prep. Make the case.",
};

const DATE_SHORT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
});

const DATE_LONG = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function formatShort(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return DATE_SHORT.format(new Date(`${iso}T00:00:00Z`));
  } catch {
    return null;
  }
}

function formatLongFromTs(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return DATE_SHORT.format(new Date(iso));
  } catch {
    return null;
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const user = await requireAuth();
  const { sundayPrompt, view } = await searchParams;
  const supabase = await createClient();

  const [contextResult, responsibilitiesResult] = await Promise.all([
    supabase
      .from("user_context")
      .select(
        "start_date, current_day, current_week, probation_mode_active, probation_review_date, probation_brief_generated_at, probation_activation_prompted_at, last_sunday_prompt_at, viewed_post_90_home_at, viewed_mid_journey_welcome_at, entry_state",
      )
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("user_responsibilities")
      .select("id, description")
      .eq("user_id", user.id)
      .eq("is_current", true)
      .order("updated_at", { ascending: false })
      .limit(3),
  ]);

  const context = contextResult.data;
  if (!context) {
    redirect("/onboarding/step-1");
  }

  let dayState = getDayState(context.start_date);

  // Dev-only override so we can test the post-90 home without
  // backdating start_date. Honored only when NODE_ENV !== "production"
  // and only via the explicit `?view=post-90` query string.
  if (process.env.NODE_ENV !== "production" && view === "post-90") {
    dayState = { ...dayState, mode: "post-90", day: Math.max(dayState.day, 91) } as DayState;
  }

  // v1.3 fix: probation surfaces take precedence over post-Day-90 layout (per audit Area 2)
  // A State C user (joined post-Day-90) whose probation review is coming
  // up needs the probation banner + Brief CTA, not the post-90 "the work
  // continues" layout. The probation rendering path lives below this
  // early-return, so gating the early-return on !probation_mode_active
  // lets State C probation-active users fall through into it. The
  // standard Day-91+ layout still renders for non-probation post-90
  // users (the common case).
  if (dayState.mode === "post-90" && !context.probation_mode_active) {
    const longDate = new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date());
    const recent = await loadPost90Recent(user.id);
    const showWhatChanged = !context.viewed_post_90_home_at;
    return (
      <Post90Home
        day={dayState.day}
        longDate={longDate}
        responsibilities={responsibilitiesResult.data ?? []}
        recent={recent}
        showWhatChanged={showWhatChanged}
      />
    );
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("primary_role")
    .eq("id", user.id)
    .single();
  const role = userRow?.primary_role as Role | null | undefined;

  const probationActive = context.probation_mode_active ?? false;
  const daysToReview = probationActive
    ? daysUntil(context.probation_review_date)
    : null;
  const briefGenerated = Boolean(context.probation_brief_generated_at);

  // Today's missions. In probation mode, pull up to three (probation
  // missions surface alongside the week's regular mission). Outside
  // probation mode, the standard home shows the next-active one only.
  // Within 3 days of review, narrow back to one to honour the SKILL §10.4
  // counterweight — don't load the day before a review.
  const missionLimit = probationActive
    ? daysToReview !== null && daysToReview <= 3
      ? 1
      : 3
    : 1;
  const todayMissions = await loadNextMissions(
    supabase,
    user.id,
    role,
    dayState.week,
    missionLimit,
  );

  let promptOpen = false;
  if (sundayPrompt === "1") {
    promptOpen = !isRecent(context.last_sunday_prompt_at ?? null);
  }

  // The eyebrow always shows the day; the probation banner sits above
  // the headline (as a separate card) per the prototype — it's an
  // invitation, not a header replacement.
  const dayEyebrow = probationActive
    ? `Day ${dayState.day} — ${DATE_LONG.format(new Date())}`
    : `Day ${dayState.day} of 90 · ${dayState.weekday}`;

  const headline = chooseHeadline({
    dayState,
    mission: todayMissions[0] ?? null,
  });

  const weekTheme = WEEK_THEMES[dayState.week] ?? "Keep going.";

  // Whether to render the Brief generation prompt: ≤7 days, not yet
  // generated, in probation mode.
  const showBriefPrompt =
    probationActive &&
    !briefGenerated &&
    daysToReview !== null &&
    daysToReview <= 7;

  // Probation glance — only built when in probation mode.
  const probationGlance = probationActive
    ? {
        reviewDate: formatShort(context.probation_review_date),
        daysLeft: daysToReview,
        briefGenerated,
        modeActiveSince: formatLongFromTs(
          context.probation_activation_prompted_at,
        ),
      }
    : null;

  // State B first-visit welcome card — renders once for a State B user
  // (entry_state === 'B') who hasn't yet seen the card. Suppressed in
  // probation mode (the probation overlay takes precedence) and on
  // Day 1 (no past weeks to acknowledge).
  const showMidJourneyWelcome =
    !probationActive &&
    context.entry_state === "B" &&
    !context.viewed_mid_journey_welcome_at &&
    dayState.mode !== "day-1";

  return (
    <section className="mx-auto flex max-w-(--max-page) gap-7 px-4 py-7 md:px-6 md:py-8">
      <div className="flex flex-1 flex-col gap-6 min-w-0">
        {probationActive ? (
          <>
            <p className="text-eyebrow">{dayEyebrow}</p>
            <ProbationBanner
              daysToReview={daysToReview}
              briefGenerated={briefGenerated}
            />
            {showBriefPrompt ? <BriefGenerationPrompt /> : null}
          </>
        ) : (
          <header className="flex flex-col gap-3">
            <p className="text-eyebrow">{dayEyebrow}</p>
            <h1
              className="text-display text-balance leading-[1.05] max-w-[20ch]"
              style={{ textWrap: "balance" }}
            >
              {headline.line1}
              <br />
              <span className="font-display italic">{headline.line2}</span>
            </h1>
          </header>
        )}

        {showMidJourneyWelcome ? (
          <MidJourneyWelcomeCard currentWeek={dayState.week} />
        ) : null}

        {todayMissions.length > 0 ? (
          <div className="flex flex-col gap-4">
            {probationActive ? (
              <p className="text-eyebrow mt-2">
                {todayMissions.length === 1
                  ? "Today's mission"
                  : "Today's missions"}
              </p>
            ) : null}
            {todayMissions.map((mission, index) => (
              <MissionCard
                key={mission.slug}
                missionSlug={mission.slug}
                title={mission.title}
                description={mission.why_matters}
                day={dayState.day}
                estimatedMinutes={mission.estimated_minutes}
                status={index === 0 ? "active" : "active"}
                isProbation={probationActive && isProbationMission(mission)}
                className="max-w-3xl"
              />
            ))}
          </div>
        ) : (
          <EmptyMissionState dayState={dayState} />
        )}

        <div className="mt-2">
          <SituationRoomInput probationActive={probationActive} />
        </div>

        {dayState.mode === "day-1" ? (
          <p className="text-caption text-mute mt-2">
            More missions unlock as you progress this week.
          </p>
        ) : null}
      </div>

      <RightSidebar
        weekNumber={dayState.week}
        weekTheme={weekTheme}
        responsibilities={responsibilitiesResult.data ?? []}
        recent={[]}
        probation={probationGlance}
        pastWeeksAvailable={
          context.entry_state === "B" && dayState.week > 1
            ? dayState.week - 1
            : null
        }
      />

      <SundayPromptModal open={promptOpen} />
    </section>
  );
}

async function loadNextMissions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  role: Role | null | undefined,
  currentWeek: number,
  limit: number,
): Promise<MissionRow[]> {
  if (!role) return [];

  const { data: weekMissions } = await supabase
    .from("missions")
    .select("slug, title, why_matters, estimated_minutes, sequence_in_week, week")
    .eq("role", role)
    .eq("week", currentWeek)
    .eq("is_published", true)
    .order("sequence_in_week", { ascending: true });

  if (!weekMissions || weekMissions.length === 0) return [];

  const { data: completions } = await supabase
    .from("mission_completions")
    .select("mission_id, missions!inner(slug)")
    .eq("user_id", userId);

  type CompletionRow = {
    missions: { slug: string } | { slug: string }[] | null;
  };
  const completedSlugs = new Set<string>(
    ((completions ?? []) as CompletionRow[]).flatMap((row) => {
      const mref = row.missions;
      if (!mref) return [];
      if (Array.isArray(mref)) return mref.map((m) => m.slug);
      return [mref.slug];
    }),
  );

  return weekMissions
    .filter((m) => !completedSlugs.has(m.slug))
    .slice(0, limit);
}

function chooseHeadline({
  dayState,
  mission,
}: {
  dayState: ReturnType<typeof getDayState>;
  mission: { title: string } | null;
}): { line1: string; line2: string } {
  if (dayState.mode === "post-90") {
    return { line1: "You've made it through.", line2: "Keep going." };
  }
  if (dayState.mode === "day-1") {
    return { line1: "Today is about", line2: "landing softly." };
  }
  if (mission) {
    return splitTwoLines(`Today: ${mission.title.toLowerCase()}.`);
  }
  return { line1: "Today is yours to shape.", line2: "Take one step." };
}

function splitTwoLines(text: string): { line1: string; line2: string } {
  if (text.length <= 22) return { line1: text, line2: "" };
  const mid = Math.floor(text.length / 2);
  let breakAt = text.indexOf(" ", mid);
  if (breakAt < 0) breakAt = text.lastIndexOf(" ", mid);
  if (breakAt < 0) return { line1: text, line2: "" };
  return {
    line1: text.slice(0, breakAt),
    line2: text.slice(breakAt + 1),
  };
}

function EmptyMissionState({
  dayState,
}: {
  dayState: ReturnType<typeof getDayState>;
}) {
  return (
    <article
      className="flex flex-col gap-3 border border-paper-3 bg-paper p-5 md:p-6 max-w-3xl"
      style={{ borderRadius: "10px" }}
    >
      <p className="text-eyebrow">Day {dayState.day}</p>
      <h3 className="font-display text-h3 text-ink">
        Your first mission is on its way.
      </h3>
      <p className="text-body text-mute">
        Mission Track content lands per role; once it&rsquo;s seeded, the
        right mission for today shows up here automatically.
      </p>
      <div>
        <Button variant="secondary" size="md">
          Browse the map
        </Button>
      </div>
    </article>
  );
}

function daysUntil(reviewDate: string | null): number | null {
  if (!reviewDate) return null;
  try {
    const target = new Date(`${reviewDate}T00:00:00Z`);
    const diff = target.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  } catch {
    return null;
  }
}
