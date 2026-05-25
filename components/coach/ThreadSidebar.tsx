/**
 * Left rail for /coach surfaces: "Recent threads" list per the AI Coach
 * prototype. Active thread gets `bg-paper-3` highlight; "+ New thread"
 * ghost button sits at the bottom of the column.
 *
 * Server component — receives the already-fetched threads from the
 * caller so it can render in any /coach/* route without re-querying.
 */
import Link from "next/link";

import { Plus } from "lucide-react";

export type ThreadListItem = {
  id: string;
  topic_title: string;
  /** Human-readable relative-time label (e.g. "2 days ago"). */
  when: string;
};

type ThreadSidebarProps = {
  threads: ReadonlyArray<ThreadListItem>;
  activeId: string | null;
};

export function ThreadSidebar({ threads, activeId }: ThreadSidebarProps) {
  return (
    <aside
      aria-label="Recent threads"
      className="hidden md:flex flex-col border-r border-paper-3 bg-paper-2/50 px-5 py-6 gap-3 min-h-[calc(100vh-4rem)]"
    >
      <p className="text-eyebrow">Recent threads</p>

      {threads.length === 0 ? (
        <p className="font-display italic text-body-s text-mute py-2">
          No threads yet. Start one below.
        </p>
      ) : (
        <ul className="flex flex-col gap-1 list-none p-0 m-0" role="list">
          {threads.map((thread) => {
            const active = thread.id === activeId;
            return (
              <li key={thread.id}>
                <Link
                  href={`/coach/${thread.id}`}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col gap-0.5 px-3 py-2.5 transition-colors ${
                    active
                      ? "bg-paper-3 text-ink"
                      : "text-ink hover:bg-paper-3"
                  }`}
                  style={{ borderRadius: "6px" }}
                >
                  <span
                    className="font-display italic text-body-s line-clamp-2"
                    style={{ lineHeight: 1.35, letterSpacing: "-0.005em" }}
                  >
                    {thread.topic_title}
                  </span>
                  <span className="text-caption text-mute">{thread.when}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-auto pt-3 border-t border-paper-3">
        <Link
          href="/coach/new"
          className="inline-flex items-center gap-2 text-body-s text-mute hover:text-ink transition-colors"
        >
          <Plus className="size-4" strokeWidth={1.5} aria-hidden />
          New thread
        </Link>
      </div>
    </aside>
  );
}

/**
 * Format the relative-time label per prototype examples:
 *   "Started Monday" (within last 7 days), "2 days ago", "Last Tuesday",
 *   "Week 4", or the calendar date for older threads.
 */
export function formatThreadWhen(
  lastMessageAt: string,
  createdAt: string,
): string {
  const last = new Date(lastMessageAt);
  if (Number.isNaN(last.getTime())) return "recently";
  const now = new Date();
  const ms = now.getTime() - last.getTime();
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days <= 0) {
    return `Started ${last.toLocaleDateString(undefined, { weekday: "long" })}`;
  }
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) {
    return `Last ${last.toLocaleDateString(undefined, { weekday: "long" })}`;
  }
  // Fall back to calendar date for older threads.
  const created = new Date(createdAt);
  return created.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}
