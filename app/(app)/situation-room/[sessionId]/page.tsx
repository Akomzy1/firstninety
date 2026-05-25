/**
 * Situation Room — session view.
 *
 * Server-loads the session row + decides whether the Coach response is
 * already persisted, then hands off to the `SessionView` client
 * component which streams a fresh response on first visit or renders
 * the persisted one on subsequent visits.
 *
 * Per MVP Spec §4.3 (Situation Room) + Design Prompts C4 state 2.
 */
import { notFound, redirect } from "next/navigation";

import { SessionView } from "@/components/situation-room/SessionView";
import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";
import type { CrisisCategory } from "@/lib/safety/checks";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export const metadata = {
  title: "Situation",
};

const TIME_FMT = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
});

export default async function SituationSessionPage({ params }: PageProps) {
  const { sessionId } = await params;
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("situation_sessions")
    .select(
      "id, user_id, entry_type, situation_summary, transcript, flagged_for_safety, created_at",
    )
    .eq("id", sessionId)
    .maybeSingle();

  if (!session) notFound();
  if (session.user_id !== user.id) redirect("/situation-room");

  const transcript =
    session.transcript && typeof session.transcript === "object"
      ? (session.transcript as Record<string, unknown>)
      : {};
  const opening =
    typeof transcript.opening === "string"
      ? (transcript.opening as string)
      : session.situation_summary;
  const uiEntry = (typeof transcript.ui_entry_type === "string"
    ? transcript.ui_entry_type
    : session.entry_type) as
    | "prep"
    | "is_this_normal"
    | "debrief"
    | "probation";

  const persistedResponse = (() => {
    const cr = transcript.coach_response as { content?: string } | undefined;
    if (cr && typeof cr.content === "string" && cr.content.length > 0) {
      return cr.content;
    }
    return null;
  })();

  const crisisCategory = (() => {
    const preFlight = transcript.pre_flight as
      | { crisis?: { category?: string | null } }
      | undefined;
    const cat = preFlight?.crisis?.category;
    if (cat === "self_harm" || cat === "harassment" || cat === "abuse") {
      return cat as CrisisCategory;
    }
    return null;
  })();

  return (
    <SessionView
      sessionId={sessionId}
      opening={opening}
      uiEntryType={uiEntry}
      createdAtLabel={TIME_FMT.format(new Date(session.created_at))}
      initialResponse={persistedResponse}
      flaggedForSafety={session.flagged_for_safety}
      crisisCategory={crisisCategory}
    />
  );
}
