/**
 * Right sidebar on the daily home (desktop only).
 *
 * Standard stacks: Week at a glance · What I know · Recent activity.
 * When probation mode is active a "Probation at a glance" panel
 * replaces the week-theme panel, per the Daily Home (Probation Active)
 * prototype — four rows: Review date / Days left / Brief generated /
 * Mode active since. The "Days left" row gains the urgent accent
 * treatment when ≤ 3 days remain.
 *
 * Phase 2.2 surfaces are intentionally thin — they fill out as the user
 * generates Mission completions / Situation sessions / Simulator runs
 * in Phase 2.3, 3.7, 3.10.
 */
import Link from "next/link";

import type { Database } from "@/lib/db/types.gen";

type Responsibility = Pick<
  Database["public"]["Tables"]["user_responsibilities"]["Row"],
  "id" | "description"
>;

type RecentItem = {
  href: string;
  eyebrow: string;
  title: string;
};

type ProbationGlance = {
  reviewDate: string | null; // human-readable, e.g. "23 Aug"
  daysLeft: number | null;
  briefGenerated: boolean;
  modeActiveSince: string | null; // human-readable, e.g. "2 Aug"
};

type RightSidebarProps = {
  weekNumber: number;
  weekTheme: string;
  responsibilities: ReadonlyArray<Responsibility>;
  recent: ReadonlyArray<RecentItem>;
  /** When provided, the week-theme panel is replaced by the glance panel. */
  probation?: ProbationGlance | null;
  /**
   * State B only — surfaces "Weeks 1-N available to read" as a quiet
   * sub-line under the week theme. Suppressed for State A/C and
   * suppressed in probation mode.
   */
  pastWeeksAvailable?: number | null;
};

export function RightSidebar({
  weekNumber,
  weekTheme,
  responsibilities,
  recent,
  probation,
  pastWeeksAvailable,
}: RightSidebarProps) {
  return (
    <aside
      className="hidden lg:flex w-72 shrink-0 flex-col gap-6 pt-1"
      aria-label="Day overview"
    >
      {probation ? (
        <ProbationGlancePanel glance={probation} />
      ) : (
        <Panel
          title={`Week ${weekNumber} at a glance`}
          href="/mission-track"
          actionLabel="See the whole map"
        >
          <p className="font-display italic text-body-l text-ink">{weekTheme}</p>
          {pastWeeksAvailable && pastWeeksAvailable >= 1 ? (
            <p className="font-display italic text-body-s text-mute-2 mt-2">
              {pastWeeksAvailable === 1
                ? "Week 1 available to read."
                : `Weeks 1–${pastWeeksAvailable} available to read.`}
            </p>
          ) : null}
        </Panel>
      )}

      <Panel
        title="What I know about you"
        href="/settings/memory"
        actionLabel="Read the margins"
      >
        {responsibilities.length === 0 ? (
          <p className="text-body text-mute italic">
            Nothing yet. You can add details from{" "}
            <Link
              href="/settings/memory"
              className="text-ink hover:underline underline-offset-4"
            >
              memory settings
            </Link>
            .
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {responsibilities.slice(0, 3).map((r) => (
              <li
                key={r.id}
                className="font-display italic text-body text-ink line-clamp-2"
              >
                {r.description}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Recent" href="/situation-room" actionLabel="All sessions">
        {recent.length === 0 ? (
          <p className="text-body text-mute italic">
            Nothing yet. Your Situation Room sessions and Simulator runs
            land here as you use them.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recent.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block hover:bg-paper-2 -mx-2 px-2 py-1 transition-colors"
                  style={{ borderRadius: "4px" }}
                >
                  <p className="text-caption text-mute">{item.eyebrow}</p>
                  <p className="text-body text-ink line-clamp-2">{item.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </aside>
  );
}

function ProbationGlancePanel({ glance }: { glance: ProbationGlance }) {
  const urgent = glance.daysLeft !== null && glance.daysLeft <= 3;
  return (
    <section className="flex flex-col gap-2">
      <header className="flex items-baseline justify-between gap-2">
        <p className="text-eyebrow">Probation at a glance</p>
        <Link
          href="/settings/probation"
          className="text-body-s text-mute hover:text-ink underline-offset-4 hover:underline"
        >
          Manage
        </Link>
      </header>
      <dl className="flex flex-col gap-1.5 text-body-s">
        <GlanceRow
          label="Review date"
          value={glance.reviewDate ?? "Not set"}
          headline
          missing={glance.reviewDate === null}
        />
        <GlanceRow
          label="Days left"
          value={glance.daysLeft === null ? "—" : String(glance.daysLeft)}
          urgent={urgent}
          missing={glance.daysLeft === null}
        />
        <GlanceRow
          label="Brief generated"
          value={glance.briefGenerated ? "Yes" : "Not yet"}
          missing={!glance.briefGenerated}
        />
        <GlanceRow
          label="Mode active since"
          value={glance.modeActiveSince ?? "—"}
          missing={glance.modeActiveSince === null}
        />
      </dl>
    </section>
  );
}

function GlanceRow({
  label,
  value,
  headline = false,
  urgent = false,
  missing = false,
}: {
  label: string;
  value: string;
  headline?: boolean;
  urgent?: boolean;
  missing?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-mute">{label}</dt>
      <dd
        className={
          urgent
            ? "text-accent font-medium"
            : headline
              ? "text-ink font-medium"
              : missing
                ? "text-mute-2 italic"
                : "text-ink"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function Panel({
  title,
  href,
  actionLabel,
  children,
}: {
  title: string;
  href: string;
  actionLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <header className="flex items-baseline justify-between gap-2">
        <p className="text-eyebrow">{title}</p>
        <Link
          href={href}
          className="text-body-s text-mute hover:text-ink underline-offset-4 hover:underline"
        >
          {actionLabel}
        </Link>
      </header>
      {children}
    </section>
  );
}
