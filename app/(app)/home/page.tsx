/**
 * Daily home — Day 1 + Day N states (Phase 2.2). Layout follows the
 * Daily Home prototype: stacked two-line Fraunces H1, single mission
 * card below, Situation Room input + right sidebar on desktop. Probation
 * Mode swaps the banner per Build Prompt 2.2; full Probation surfaces
 * land in Prompt 3.14.
 *
 * Mission ordering is fixed at MVP — `week ASC, sequence_in_week ASC`.
 * Today's mission is the first not-yet-completed mission whose week
 * matches the current week.
 */
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { MissionCard } from "@/components/mission/MissionCard";
import { RightSidebar } from "@/components/home/RightSidebar";
import { SituationRoomInput } from "@/components/home/SituationRoomInput";
import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";
import { getDayState } from "@/lib/home/day-state";

import { SundayPromptModal } from "./SundayPromptModal";

type HomePageProps = {
  searchParams: Promise<{ sundayPrompt?: string }>;
};

function isRecent(timestamp: string | null): boolean {
  if (!timestamp) return false;
  const last = new Date(timestamp).getTime();
  if (Number.isNaN(last)) return false;
  return Date.now() - last < 24 * 60 * 60 * 1000;
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

export default async function HomePage({ searchParams }: HomePageProps) {
  const user = await requireAuth();
  const { sundayPrompt } = await searchParams;
  const supabase = await createClient();

  const [contextResult, responsibilitiesResult] = await Promise.all([
    supabase
      .from("user_context")
      .select(
        "start_date, current_day, current_week, probation_mode_active, probation_review_date, last_sunday_prompt_at",
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
    // User hit /home before user_context provisioned — shouldn't happen
    // post-onboarding, but route back to step 1 just in case.
    redirect("/onboarding/step-1");
  }

  const dayState = getDayState(context.start_date);

  // Load primary_role for mission scoping.
  const { data: userRow } = await supabase
    .from("users")
    .select("primary_role")
    .eq("id", user.id)
    .single();
  const role = userRow?.primary_role;

  // Today's mission = first published mission in current_week not yet
  // completed. Until the BA content is seeded (Prompt 2.6), this returns
  // nothing and we show the Day-1 framing without a card.
  let todayMission: {
    slug: string;
    title: string;
    why_matters: string;
    estimated_minutes: number;
  } | null = null;
  if (role) {
    const { data: weekMissions } = await supabase
      .from("missions")
      .select("slug, title, why_matters, estimated_minutes, sequence_in_week")
      .eq("role", role)
      .eq("week", dayState.week)
      .eq("is_published", true)
      .order("sequence_in_week", { ascending: true });
    if (weekMissions && weekMissions.length > 0) {
      const slugs = weekMissions.map((m) => m.slug);
      const { data: completions } = await supabase
        .from("mission_completions")
        .select("mission_id, missions!inner(slug)")
        .eq("user_id", user.id);
      type CompletionRow = {
        missions: { slug: string } | { slug: string }[] | null;
      };
      const completedSlugs = new Set<string>(
        ((completions ?? []) as CompletionRow[]).flatMap((row) => {
          const mref = row.missions;
          if (!mref) return [];
          if (Array.isArray(mref)) {
            return mref.map((m) => m.slug);
          }
          return [mref.slug];
        }),
      );
      void slugs;
      const nextMission = weekMissions.find((m) => !completedSlugs.has(m.slug));
      if (nextMission) {
        todayMission = {
          slug: nextMission.slug,
          title: nextMission.title,
          why_matters: nextMission.why_matters,
          estimated_minutes: nextMission.estimated_minutes,
        };
      }
    }
  }

  let promptOpen = false;
  if (sundayPrompt === "1") {
    promptOpen = !isRecent(context.last_sunday_prompt_at ?? null);
  }

  const eyebrow = context.probation_mode_active
    ? `Probation — ${daysToReview(context.probation_review_date)} days to review`
    : `Day ${dayState.day} of 90 · ${dayState.weekday}`;

  const headline = chooseHeadline({
    dayState,
    probationActive: context.probation_mode_active ?? false,
    mission: todayMission,
  });

  const weekTheme = WEEK_THEMES[dayState.week] ?? "Keep going.";

  return (
    <section className="mx-auto flex max-w-(--max-page) gap-7 px-4 py-7 md:px-6 md:py-8">
      <div className="flex flex-1 flex-col gap-6 min-w-0">
        <header className="flex flex-col gap-3">
          <p className="text-eyebrow">{eyebrow}</p>
          <h1 className="text-display text-balance leading-[1.05]">
            {headline.line1}
            <br />
            <span className="font-display italic">{headline.line2}</span>
          </h1>
        </header>

        {todayMission ? (
          <MissionCard
            missionSlug={todayMission.slug}
            title={todayMission.title}
            description={todayMission.why_matters}
            day={dayState.day}
            estimatedMinutes={todayMission.estimated_minutes}
            status="active"
            className="max-w-3xl"
          />
        ) : (
          <EmptyMissionState dayState={dayState} />
        )}

        <div className="mt-2">
          <SituationRoomInput />
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
      />

      <SundayPromptModal open={promptOpen} />
    </section>
  );
}

function chooseHeadline({
  dayState,
  probationActive,
  mission,
}: {
  dayState: ReturnType<typeof getDayState>;
  probationActive: boolean;
  mission: { title: string } | null;
}): { line1: string; line2: string } {
  if (probationActive) {
    return {
      line1: "Make the case.",
      line2: "Bring receipts.",
    };
  }
  if (dayState.mode === "post-90") {
    return {
      line1: "You've made it through.",
      line2: "Keep going.",
    };
  }
  if (dayState.mode === "day-1") {
    return {
      line1: "Today is about",
      line2: "landing softly.",
    };
  }
  if (mission) {
    // Two-line stacked headline derived from the mission. Title casing
    // intact; second line italicises to match the prototype.
    return splitTwoLines(`Today: ${mission.title.toLowerCase()}.`);
  }
  return {
    line1: "Today is yours to shape.",
    line2: "Take one step.",
  };
}

function splitTwoLines(text: string): { line1: string; line2: string } {
  // Aim for a balanced break point near the middle, preferring a space.
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

function daysToReview(reviewDate: string | null): number {
  if (!reviewDate) return 0;
  try {
    const target = new Date(`${reviewDate}T00:00:00Z`);
    const diff = target.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  } catch {
    return 0;
  }
}
