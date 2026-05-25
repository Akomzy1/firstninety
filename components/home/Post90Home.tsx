/**
 * Post-Day-90 Daily Home.
 *
 * Per PRD v1.8 §6.0 / §7.4 and the rendered prototype
 * (firstninety-daily-home-post-day-90-standalone.html):
 *
 *  - Day eyebrow + editorial banner ("You're past your first 90 days.
 *    The work continues. / Your Survival Report is always here →").
 *  - Mission card is gone. The Situation Room input — now a richer
 *    block with three tabs, shield-anonymise hint, ⌘↵ key, send button —
 *    becomes the centre of gravity.
 *  - An "Or" card sits to the right with three forward links: Open Coach
 *    / Browse Playbooks / Run a Simulator scenario.
 *  - The right rail loses Week-at-a-glance and gains an editorial-style
 *    Recent list (Coach / Room / Simulator entries with flag pips on
 *    Simulator outcomes) plus a small Survival Report "Saved" card at
 *    the bottom.
 *  - On the user's first visit (viewed_post_90_home_at is null), a
 *    one-time "What changed?" message renders above the banner and
 *    dismisses via `dismissPost90WelcomeAction`.
 *
 * Voice on the banner shifts by elapsed time past Day 90:
 *  - Day 91-120  → "You're past your first 90 days. The work continues."
 *  - Day 121-180 → "Six months in. Here for whatever the day needs."
 *  - Day 181+    → "Settled. Here for the day's work."
 */
import Link from "next/link";

import { ArrowRight, Shield } from "lucide-react";

import type { Database } from "@/lib/db/types.gen";
import type { RecentItem } from "@/lib/home/recent";

import { dismissPost90WelcomeAction } from "@/app/(app)/home/actions";

type Responsibility = Pick<
  Database["public"]["Tables"]["user_responsibilities"]["Row"],
  "id" | "description"
>;

type Post90HomeProps = {
  day: number;
  longDate: string; // e.g. "Tuesday, 27 August"
  responsibilities: ReadonlyArray<Responsibility>;
  recent: ReadonlyArray<RecentItem>;
  /** True the first time the user lands on the post-90 home. */
  showWhatChanged: boolean;
};

function chooseBannerLine(day: number): string {
  if (day <= 120) return "You're past your first 90 days. The work continues.";
  if (day <= 180) return "Six months in. Here for whatever the day needs.";
  return "Settled. Here for the day's work.";
}

export function Post90Home({
  day,
  longDate,
  responsibilities,
  recent,
  showWhatChanged,
}: Post90HomeProps) {
  return (
    <section className="mx-auto flex max-w-(--max-page) gap-7 px-4 py-7 md:px-6 md:py-8">
      <div className="flex flex-1 flex-col gap-6 min-w-0">
        <p className="text-eyebrow">{`Day ${day} — ${longDate}`}</p>

        {showWhatChanged ? <WhatChangedCallout /> : null}

        <PostBanner day={day} />

        <div className="flex flex-col lg:flex-row gap-5">
          <SRBlock />
          <OrCard />
        </div>
      </div>

      <Post90RightRail responsibilities={responsibilities} recent={recent} />
    </section>
  );
}

function WhatChangedCallout() {
  return (
    <section
      role="region"
      aria-label="What changed"
      className="border border-paper-3 bg-paper-2 p-5 md:p-6 flex flex-col gap-3 max-w-3xl"
      style={{ borderRadius: "10px" }}
    >
      <p className="text-eyebrow">What changed</p>
      <p className="font-display italic text-body-l text-ink text-balance">
        Today is Day 91. Your structured 90-day curriculum is complete.
        Situation Room, Coach, Playbooks, and Simulator continue
        indefinitely. The Mission Track has concluded — but the work
        continues.
      </p>
      <form action={dismissPost90WelcomeAction}>
        <button
          type="submit"
          className="self-start inline-flex items-center gap-1.5 text-body-s font-medium text-mute hover:text-ink transition-colors px-3 py-1.5 border border-paper-3 hover:border-mute-2"
          style={{ borderRadius: "4px" }}
        >
          Got it
        </button>
      </form>
    </section>
  );
}

function PostBanner({ day }: { day: number }) {
  return (
    <section
      role="region"
      aria-label="Today's note"
      className="border border-paper-3 bg-paper p-5 md:p-6 flex flex-col gap-2 max-w-3xl"
      style={{ borderRadius: "10px" }}
    >
      <p className="font-display text-h3 text-ink text-balance">
        {chooseBannerLine(day)}
      </p>
      <Link
        href="/probation/brief"
        className="self-start font-display italic text-body text-ink underline-offset-4 hover:underline"
      >
        Your Survival Report is always here →
      </Link>
    </section>
  );
}

function SRBlock() {
  return (
    <div
      className="flex-1 flex flex-col gap-3 border border-paper-3 bg-paper p-5 md:p-6"
      style={{ borderRadius: "10px" }}
    >
      <p className="text-eyebrow">Situation Room</p>
      <div role="tablist" className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
        <Tab active>I need help with this</Tab>
        <span aria-hidden className="text-mute-2">
          ·
        </span>
        <Tab>Is this normal?</Tab>
        <span aria-hidden className="text-mute-2">
          ·
        </span>
        <Tab>I just did something</Tab>
      </div>

      <Link
        href="/situation-room"
        className="block"
        aria-label="Open the Situation Room"
      >
        <textarea
          rows={3}
          placeholder="What's on your mind today? Anonymise as you go."
          aria-label="What's on your mind today?"
          className="w-full bg-paper-2 border border-paper-3 px-4 py-3 text-body text-ink placeholder:text-mute resize-none focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 pointer-events-none"
          style={{ borderRadius: "8px" }}
          readOnly
        />
      </Link>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="inline-flex items-center gap-2 text-caption text-mute">
          <Shield className="size-3.5" strokeWidth={1.5} aria-hidden />
          Use roles, not names. Coach won&rsquo;t see the original.
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="font-mono text-caption text-mute-2">⌘↵</span>
          <Link
            href="/situation-room"
            aria-label="Send"
            className="inline-flex size-8 items-center justify-center bg-ink text-paper transition-opacity hover:opacity-90"
            style={{ borderRadius: "4px" }}
          >
            <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
          </Link>
        </span>
      </div>
    </div>
  );
}

function Tab({
  active,
  children,
}: {
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      role="tab"
      aria-selected={active}
      className={`text-body-s ${
        active ? "text-ink font-medium" : "text-mute"
      }`}
    >
      {children}
    </span>
  );
}

function OrCard() {
  return (
    <aside
      aria-label="Other surfaces"
      className="lg:w-72 shrink-0 flex flex-col gap-2 border border-paper-3 bg-paper-2 p-5 md:p-6"
      style={{ borderRadius: "10px" }}
    >
      <p className="text-eyebrow mb-2">Or</p>
      <div className="flex flex-col divide-y divide-paper-3 -mx-1">
        <OrRow href="/coach">Open Coach</OrRow>
        <OrRow href="/playbook">Browse Playbooks</OrRow>
        <OrRow href="/simulator">Run a Simulator scenario</OrRow>
      </div>
    </aside>
  );
}

function OrRow({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 py-3 px-1 text-body text-ink hover:text-mute transition-colors"
    >
      <span>{children}</span>
      <span aria-hidden className="text-mute-2">
        →
      </span>
    </Link>
  );
}

function Post90RightRail({
  responsibilities,
  recent,
}: {
  responsibilities: ReadonlyArray<Responsibility>;
  recent: ReadonlyArray<RecentItem>;
}) {
  return (
    <aside
      className="hidden lg:flex w-72 shrink-0 flex-col gap-6 pt-1"
      aria-label="Day overview"
    >
      <section className="flex flex-col gap-2">
        <header className="flex items-baseline justify-between gap-2">
          <p className="text-eyebrow">Recent</p>
          <Link
            href="/situation-room"
            className="text-body-s text-mute hover:text-ink underline-offset-4 hover:underline"
          >
            All sessions
          </Link>
        </header>
        {recent.length === 0 ? (
          <p className="text-body text-mute italic">
            Your recent Coach threads, Situation Room sessions, and Simulator
            runs will land here.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-paper-3 -mx-1">
            {recent.map((r) => (
              <RecentRow key={`${r.kind}-${r.timestamp}`} item={r} />
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <header className="flex items-baseline justify-between gap-2">
          <p className="text-eyebrow">What I know</p>
          <Link
            href="/settings/memory"
            className="text-body-s text-mute hover:text-ink underline-offset-4 hover:underline"
          >
            See all
          </Link>
        </header>
        {responsibilities.length === 0 ? (
          <p className="text-body text-mute italic">Nothing yet.</p>
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
      </section>

      <aside
        aria-label="Your Survival Report"
        className="flex flex-col gap-1 border border-paper-3 bg-paper-2 p-4"
        style={{ borderRadius: "10px" }}
      >
        <p className="text-eyebrow">Saved</p>
        <p className="font-display text-body-l text-ink">
          Day 90 — your Survival Report.
        </p>
        <p className="text-body-s text-mute">
          Re-read whenever you need to.
        </p>
        <Link
          href="/probation/brief"
          className="self-start mt-2 text-body-s font-medium text-ink hover:text-mute transition-colors"
        >
          Open →
        </Link>
      </aside>
    </aside>
  );
}

const RECENT_LABEL: Record<RecentItem["kind"], string> = {
  coach: "Coach",
  room: "Room",
  simulator: "Simulator",
};

const FLAG_CLASS: Record<NonNullable<RecentItem["outcome"]>, string> = {
  green: "bg-success",
  yellow: "bg-warn",
  red: "bg-danger",
};

function RecentRow({ item }: { item: RecentItem }) {
  const date = formatRecentTimestamp(item.timestamp);
  return (
    <li>
      <Link
        href={item.href}
        className="flex flex-col gap-1 py-3 px-1 hover:bg-paper-2 transition-colors"
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-eyebrow flex items-center gap-1.5">
            {item.outcome ? (
              <span
                aria-label={`${item.outcome} outcome`}
                className={`inline-block size-1.5 rounded-full ${FLAG_CLASS[item.outcome]}`}
              />
            ) : null}
            {RECENT_LABEL[item.kind]}
          </span>
          <span className="text-caption text-mute-2 whitespace-nowrap">
            {date}
          </span>
        </div>
        <p className="font-display italic text-body-s text-ink line-clamp-2 text-pretty">
          {item.title}
        </p>
      </Link>
    </li>
  );
}

function formatRecentTimestamp(iso: string): string {
  try {
    const then = new Date(iso);
    if (Number.isNaN(then.getTime())) return "—";
    const now = new Date();
    const sameDay =
      then.getFullYear() === now.getFullYear() &&
      then.getMonth() === now.getMonth() &&
      then.getDate() === now.getDate();
    if (sameDay) return "Today";
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      then.getFullYear() === yesterday.getFullYear() &&
      then.getMonth() === yesterday.getMonth() &&
      then.getDate() === yesterday.getDate();
    if (isYesterday) return "Yesterday";
    return then.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return "—";
  }
}
