/**
 * Right sidebar on the daily home (desktop only).
 *
 * Three short stacks: Week at a glance · What I know · Recent activity.
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

type RightSidebarProps = {
  weekNumber: number;
  weekTheme: string;
  responsibilities: ReadonlyArray<Responsibility>;
  recent: ReadonlyArray<RecentItem>;
};

export function RightSidebar({
  weekNumber,
  weekTheme,
  responsibilities,
  recent,
}: RightSidebarProps) {
  return (
    <aside
      className="hidden lg:flex w-72 shrink-0 flex-col gap-6 pt-1"
      aria-label="Day overview"
    >
      <Panel
        title={`Week ${weekNumber} at a glance`}
        href="/mission-track"
        actionLabel="See the whole map"
      >
        <p className="font-display italic text-body-l text-ink">{weekTheme}</p>
      </Panel>

      <Panel
        title="What I know about you"
        href="/settings/memory"
        actionLabel="Read the margins"
      >
        {responsibilities.length === 0 ? (
          <p className="text-body text-mute italic">
            Nothing yet. You can add details from{" "}
            <Link href="/settings/memory" className="text-ink hover:underline underline-offset-4">
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
