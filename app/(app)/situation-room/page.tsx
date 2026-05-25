/**
 * Situation Room — Intake (signature surface).
 *
 * Per the Situation Room prototype, the surface is built around a single
 * oversized textarea. Above it: the three (or four, in Probation Mode)
 * intake-type tabs as quiet toggles. Below: a caption ("FirstNinety will
 * reply in seconds. Anything you type is encrypted, deletable, and never
 * shared.") and two ghost links — "Skip and roleplay instead" + "Open
 * your past sessions".
 *
 * This Phase-2 build delivers the editorial chrome; live AI streaming
 * and session persistence ship in Phase 2A.
 */
import Link from "next/link";

import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";
import { getDayState } from "@/lib/home/day-state";

import { IntakeSurface } from "./IntakeSurface";

export const metadata = {
  title: "Situation Room",
};

export default async function SituationRoomPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: ctx } = await supabase
    .from("user_context")
    .select("start_date, probation_mode_active")
    .eq("user_id", user.id)
    .single();

  const dayState = getDayState(ctx?.start_date ?? null);
  const probationActive = ctx?.probation_mode_active ?? false;

  return (
    <IntakeSurface
      dayLabel={`Day ${dayState.day} — Week ${dayState.week}`}
      probationActive={probationActive}
    />
  );
}
