/**
 * Fresh-thread Coach view — `/coach/new`.
 *
 * Same chrome as `/coach/[threadId]`, but the Conversation component
 * starts with no thread and no prior messages. On the first submit the
 * server creates a `coach_threads` row, emits a `thread_created` event,
 * and the Conversation client swaps the URL to `/coach/[threadId]` so
 * a refresh lands on the right page.
 */
import { Conversation } from "@/components/coach/Conversation";
import { KnowsRail } from "@/components/coach/KnowsRail";
import {
  ThreadSidebar,
  formatThreadWhen,
} from "@/components/coach/ThreadSidebar";
import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";

import { buildKnowsItems } from "../_knows";

export const metadata = {
  title: "New thread",
};

export default async function CoachNewThreadPage() {
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
      <Conversation
        threadId={null}
        topicTitle={null}
        initialMessages={[]}
      />
      <KnowsRail items={knowsItems} />
    </div>
  );
}
