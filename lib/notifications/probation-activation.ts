/**
 * Probation activation cron orchestration.
 *
 * Fires daily at 14:00 UTC (Hobby-tier compatible). Two passes per user:
 *   1. Auto-deactivate anyone past their review date with Probation Mode
 *      still on (cleanup; the spec says mode is time-bound).
 *   2. Find users in the activation window who haven't been prompted
 *      yet and whose local time is in waking hours — push + email them.
 *
 * The local-hour window is intentionally wide (08:00-22:00) because a
 * single daily UTC firing only catches one timezone if the window is
 * narrow. Wide window + the `probation_activation_prompted_at` once-per-
 * user gate means at most one nudge ever lands per user, on the first
 * daily tick that catches their waking-hours window. Revisit narrowing
 * if/when we upgrade Vercel to Pro and can fire hourly again.
 */
import "server-only";

import { createServiceClient } from "@/lib/db/service";
import { sendEmail } from "@/lib/notifications/email";
import { sendPushToUser } from "@/lib/notifications/push";
import { probationActivationEmail } from "@/lib/email/templates";

type Row = {
  user_id: string;
  timezone: string | null;
  probation_review_date: string | null;
  probation_window_days: number;
  probation_mode_active: boolean;
  probation_activation_prompted_at: string | null;
  users:
    | { email: string; onboarding_completed_at: string | null }
    | { email: string; onboarding_completed_at: string | null }[]
    | null;
};

const TARGET_HOUR_MIN = 8;
const TARGET_HOUR_MAX = 22;

function isNinePmInZone(now: Date, timezone: string): boolean {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    }).formatToParts(now);
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? NaN);
    if (Number.isNaN(hour)) return false;
    return hour >= TARGET_HOUR_MIN && hour <= TARGET_HOUR_MAX;
  } catch {
    return false;
  }
}

function daysUntil(today: Date, target: Date): number {
  const ms = target.getTime() - today.getTime();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

export async function runProbationActivationTick(now: Date = new Date()): Promise<{
  scanned: number;
  prompted: number;
  auto_deactivated: number;
}> {
  const supabase = createServiceClient();

  const { data: rows, error } = await supabase
    .from("user_context")
    .select(
      "user_id, timezone, probation_review_date, probation_window_days, probation_mode_active, probation_activation_prompted_at, users:users!inner(email, onboarding_completed_at)",
    )
    .not("probation_review_date", "is", null);

  if (error) {
    console.error("[probation-cron] candidate load failed", error);
    return { scanned: 0, prompted: 0, auto_deactivated: 0 };
  }

  let prompted = 0;
  let auto_deactivated = 0;
  const candidates = (rows ?? []) as Row[];

  for (const row of candidates) {
    if (!row.probation_review_date) continue;
    const reviewDate = new Date(`${row.probation_review_date}T00:00:00Z`);
    if (Number.isNaN(reviewDate.getTime())) continue;

    // Pass 1 — auto-deactivate past the review date.
    if (row.probation_mode_active && reviewDate.getTime() < now.getTime()) {
      await supabase
        .from("user_context")
        .update({ probation_mode_active: false })
        .eq("user_id", row.user_id);
      auto_deactivated += 1;
      continue;
    }

    // Pass 2 — activation prompt window (T-window_days .. T-1).
    const daysToReview = daysUntil(now, reviewDate);
    if (daysToReview <= 0) continue;
    if (daysToReview > row.probation_window_days) continue;
    if (row.probation_mode_active) continue;
    if (row.probation_activation_prompted_at) continue;
    if (!row.timezone) continue;
    if (!isNinePmInZone(now, row.timezone)) continue;

    const userRel = Array.isArray(row.users) ? row.users[0] : row.users;
    if (!userRel) continue;
    if (!userRel.onboarding_completed_at) continue;

    const days = daysToReview;
    try {
      await sendPushToUser(row.user_id, {
        title: "Probation review approaching",
        body: `Your review is in ${days} day${days === 1 ? "" : "s"}. Want to switch on Probation Mode?`,
        url: "/settings/probation",
        tag: "probation-activation",
      });
    } catch (err) {
      console.error("[probation-cron] push failed", row.user_id, err);
    }

    try {
      const tpl = probationActivationEmail({ daysToReview: days });
      await sendEmail({
        to: userRel.email,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
      });
    } catch (err) {
      console.error("[probation-cron] email failed", userRel.email, err);
    }

    await supabase
      .from("user_context")
      .update({ probation_activation_prompted_at: now.toISOString() })
      .eq("user_id", row.user_id);

    prompted += 1;
  }

  return { scanned: candidates.length, prompted, auto_deactivated };
}
