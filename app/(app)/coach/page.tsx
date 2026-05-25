/**
 * Coach index — `/coach`.
 *
 * Two-rail layout per the AI Coach prototype: thread list on the left,
 * main column showing an empty-state with a CTA into `/coach/new`, and
 * the "What the Coach knows here" rail on the right. When the user has
 * threads we also surface a one-line invitation to pick one up.
 */
import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { KnowsRail } from "@/components/coach/KnowsRail";
import { ThreadSidebar, formatThreadWhen } from "@/components/coach/ThreadSidebar";
import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";

import { buildKnowsItems } from "./_knows";

export const metadata = {
  title: "Coach",
};

export default async function CoachIndexPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const [threadsResult, knowsItems] = await Promise.all([
    supabase
      .from("coach_threads")
      .select("id, topic_title, last_message_at, created_at")
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .order("last_message_at", { ascending: false })
      .limit(20),
    buildKnowsItems(supabase, user.id),
  ]);

  const threads = (threadsResult.data ?? []).map((t) => ({
    id: t.id,
    topic_title: t.topic_title,
    when: formatThreadWhen(t.last_message_at, t.created_at),
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_280px]">
      <ThreadSidebar threads={threads} activeId={null} />
      <section className="flex flex-col px-6 py-12 md:px-10 md:py-16 min-w-0 min-h-[calc(100vh-4rem)] justify-center">
        <div className="max-w-prose flex flex-col gap-5">
          <p className="text-eyebrow">Coach</p>
          <h1 className="text-h1 text-balance">
            {threads.length === 0
              ? "Start your first thread."
              : "Pick up where you left off, or start fresh."}
          </h1>
          <p className="text-body-l text-mute">
            {threads.length === 0
              ? "Anything on your mind that doesn't fit a Playbook or a Situation Room moment goes here. Think of it as talking to a senior colleague who's done your job for ten years."
              : "Open a recent thread on the left, or open a new one for something different."}
          </p>
          <Link
            href="/coach/new"
            className="inline-flex h-12 w-fit items-center justify-center gap-2 bg-ink text-paper px-5 font-medium transition-opacity hover:opacity-90"
            style={{ borderRadius: "4px" }}
          >
            Start a new thread
            <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
          </Link>
        </div>
      </section>
      <KnowsRail items={knowsItems} />
    </div>
  );
}
