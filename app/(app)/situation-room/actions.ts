"use server";

/**
 * Situation Room — server actions.
 *
 * `submitSituation` is the only public entry. The intake form posts the
 * user's anonymised summary + chosen entry_type; the action:
 *   1. Validates auth.
 *   2. Tier-gates via `checkTierAllowance("situation_room")`.
 *   3. Validates the payload.
 *   4. Runs pre-flight safety checks (PII / real-name / crisis).
 *   5. Inserts the `situation_sessions` row (the trigger from Prompt 0.3
 *      increments `usage_limits.situation_sessions_week`).
 *   6. Returns either a redirect target or a structured denial that the
 *      client can render via TierLimitPrompt.
 *
 * The session view (`/situation-room/[sessionId]`) ships fully in
 * Prompt 3.8; today a placeholder lives at that path.
 */
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/server";
import {
  checkTierAllowance,
  type TierAllowance,
} from "@/lib/billing/tier";
import { createServiceClient } from "@/lib/db/service";
import { runPreFlightChecks } from "@/lib/safety/guardrails";

export type SituationEntryType =
  | "prep"
  | "is_this_normal"
  | "debrief"
  | "probation";

/**
 * On success the action `redirect()`s to /situation-room/[id], so the
 * client never receives an `{ok: true}` payload — only denials.
 */
export type SubmitSituationResult =
  | {
      ok: false;
      reason: "tier_limit";
      allowance: Exclude<TierAllowance, { allowed: true }>;
    }
  | { ok: false; reason: "invalid"; message: string };

function toDbEntryType(
  ui: SituationEntryType,
): "prep" | "is_this_normal" | "debrief" | "probation" {
  return ui;
}

const MIN_BODY = 4;
const MAX_BODY = 6000;

export async function submitSituationAction(
  formData: FormData,
): Promise<SubmitSituationResult> {
  const user = await requireAuth();

  // ----- Tier gate -------------------------------------------------- //
  const allowance = await checkTierAllowance(user.id, "situation_room");
  if (!allowance.allowed) {
    return { ok: false, reason: "tier_limit", allowance };
  }

  // ----- Payload validation ---------------------------------------- //
  const rawType = String(formData.get("intake_type") ?? "");
  const rawBody = String(formData.get("body") ?? "").trim();

  if (
    rawType !== "prep" &&
    rawType !== "is_this_normal" &&
    rawType !== "debrief" &&
    rawType !== "probation"
  ) {
    return {
      ok: false,
      reason: "invalid",
      message: "Pick one of the four intake types before sending.",
    };
  }
  if (rawBody.length < MIN_BODY) {
    return {
      ok: false,
      reason: "invalid",
      message: "Describe what's happening — a sentence or two is enough.",
    };
  }
  if (rawBody.length > MAX_BODY) {
    return {
      ok: false,
      reason: "invalid",
      message: "That's a lot — trim to the essentials and we'll send.",
    };
  }

  // ----- Pre-flight safety ----------------------------------------- //
  const preFlight = runPreFlightChecks(rawBody);
  const flaggedForSafety = preFlight.crisis.matched;

  // ----- Insert the session row ------------------------------------ //
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("situation_sessions")
    .insert({
      user_id: user.id,
      entry_type: toDbEntryType(rawType as SituationEntryType),
      situation_summary: rawBody.slice(0, 240),
      transcript: {
        opening: rawBody,
        ui_entry_type: rawType,
        pre_flight: preFlight,
      },
      flagged_for_safety: flaggedForSafety,
      safety_referral_shown: false,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[situation-room] insert failed", error);
    return {
      ok: false,
      reason: "invalid",
      message:
        "Something went wrong saving your session. Try again in a moment.",
    };
  }

  // Note: returning is fine for the client, but the build prompt also
  // wants a direct redirect path on success — we do that here so the
  // server takes the user straight to the session view without an
  // extra round trip.
  redirect(`/situation-room/${data.id}`);
}
