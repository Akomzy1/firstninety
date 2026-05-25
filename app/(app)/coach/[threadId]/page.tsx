/**
 * Single-thread Coach view — `/coach/[threadId]`.
 *
 * Server-renders the persisted conversation; the client `Conversation`
 * component takes over for streaming the next turn and auto-refreshes
 * via `router.refresh()` after each completed stream so subsequent
 * navigations pick up the persisted assistant message.
 */
import { notFound, redirect } from "next/navigation";

import { Conversation, type PersistedMessage } from "@/components/coach/Conversation";
import { KnowsRail } from "@/components/coach/KnowsRail";
import {
  ThreadSidebar,
  formatThreadWhen,
} from "@/components/coach/ThreadSidebar";
import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";
import { createServiceClient } from "@/lib/db/service";

import { buildKnowsItems } from "../_knows";

type PageProps = {
  params: Promise<{ threadId: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { threadId } = await params;
  return { title: `Coach · ${threadId.slice(0, 8)}` };
}

export default async function CoachThreadPage({ params }: PageProps) {
  const { threadId } = await params;
  const user = await requireAuth();
  const supabase = await createClient();

  // Fetch in parallel: the thread itself (RLS scopes to this user),
  // the thread's messages, the user's full thread list, and the
  // knows-rail context.
  const [threadResult, messagesResult, threadsResult, knowsItems] =
    await Promise.all([
      supabase
        .from("coach_threads")
        .select("id, topic_title, user_id")
        .eq("id", threadId)
        .maybeSingle(),
      supabase
        .from("coach_messages")
        .select("id, role, content, created_at")
        .eq("thread_id", threadId)
        .in("role", ["user", "assistant"])
        .order("created_at", { ascending: true })
        .limit(200),
      supabase
        .from("coach_threads")
        .select("id, topic_title, last_message_at, created_at")
        .eq("user_id", user.id)
        .eq("is_archived", false)
        .order("last_message_at", { ascending: false })
        .limit(20),
      buildKnowsItems(supabase, user.id),
    ]);

  // 404 if the thread doesn't exist OR doesn't belong to this user
  // (defence-in-depth alongside RLS).
  if (!threadResult.data) notFound();
  if (threadResult.data.user_id !== user.id) redirect("/coach");

  // Side query for `flagged_for_safety` (column added by migration
  // 00006_safety_flag.sql). Kept separate from the main select so the
  // typed parser doesn't choke before `npm run db:types` regenerates.
  const flaggedForSafety = await loadFlaggedForSafety(threadId);

  const threads = (threadsResult.data ?? []).map((t) => ({
    id: t.id,
    topic_title: t.topic_title,
    when: formatThreadWhen(t.last_message_at, t.created_at),
  }));

  const initialMessages: PersistedMessage[] = (
    messagesResult.data ?? []
  ).flatMap((m) => {
    if (m.role !== "user" && m.role !== "assistant") return [];
    return [{
      id: m.id,
      role: m.role,
      content: m.content,
      created_at: m.created_at,
    }];
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_280px]">
      <ThreadSidebar threads={threads} activeId={threadId} />
      <Conversation
        threadId={threadId}
        topicTitle={threadResult.data.topic_title}
        initialMessages={initialMessages}
        initialFlaggedForSafety={flaggedForSafety}
      />
      <KnowsRail items={knowsItems} />
    </div>
  );
}

async function loadFlaggedForSafety(threadId: string): Promise<boolean> {
  const service = createServiceClient();
  const { data } = await service
    .from("coach_threads")
    .select("flagged_for_safety")
    .eq("id", threadId)
    .maybeSingle();
  return Boolean(data?.flagged_for_safety);
}
