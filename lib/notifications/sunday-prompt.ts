/**
 * Sunday recap prompt orchestration.
 *
 * The cron route fires weekly on Sunday at 22:00 UTC. The handler picks
 * up any onboarded user whose local Sunday afternoon-or-evening window
 * (16:00-22:00 local) is currently active AND who hasn't been prompted
 * in the last 24h. A weekly UTC firing catches both UK (Sun 22:00
 * local) and US (Sun 14:00-18:00 local) launch markets in a single
 * pass, which is the Hobby-tier-compatible compromise — the original
 * design fired hourly so each timezone hit its local Sunday 18:00
 * exactly. Revisit if/when we upgrade Vercel to Pro.
 *
 * Per user we send a push notification (if they have subscriptions)
 * AND an email. The recipient list is small per tick so the per-user
 * round trips are fine for MVP scale.
 */
import "server-only";

import { createServiceClient } from "@/lib/db/service";
import { sendEmail } from "@/lib/notifications/email";
import { sendPushToUser } from "@/lib/notifications/push";
import { sundayRecapEmail } from "@/lib/email/templates";

type Candidate = {
  user_id: string;
  email: string;
  timezone: string;
};

const TARGET_HOUR_MIN = 16;
const TARGET_HOUR_MAX = 22;
const TARGET_WEEKDAY = "Sun";

function isSundayEveningInZone(now: Date, timezone: string): boolean {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      hour: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const weekday = parts.find((p) => p.type === "weekday")?.value;
    const hourStr = parts.find((p) => p.type === "hour")?.value;
    const hour = hourStr ? Number(hourStr) : NaN;
    if (weekday !== TARGET_WEEKDAY) return false;
    if (Number.isNaN(hour)) return false;
    return hour >= TARGET_HOUR_MIN && hour <= TARGET_HOUR_MAX;
  } catch {
    // Unknown timezone — skip rather than crash.
    return false;
  }
}

function isStale(lastPromptAt: string | null, now: Date): boolean {
  if (!lastPromptAt) return true;
  const last = new Date(lastPromptAt).getTime();
  if (Number.isNaN(last)) return true;
  return now.getTime() - last > 24 * 60 * 60 * 1000;
}

export async function runSundayPromptTick(now: Date = new Date()): Promise<{
  scanned: number;
  prompted: number;
  push_sent: number;
  email_sent: number;
}> {
  const supabase = createServiceClient();

  // Pull every onboarded user with their timezone + last prompt time. The
  // user count at MVP is small; revisit pagination only if this gets slow.
  const { data: rows, error } = await supabase
    .from("user_context")
    .select(
      "user_id, timezone, last_sunday_prompt_at, users:users!inner(email, onboarding_completed_at)",
    )
    .not("timezone", "is", null);

  if (error) {
    console.error("[sunday-prompt] failed to load candidates", error);
    return { scanned: 0, prompted: 0, push_sent: 0, email_sent: 0 };
  }

  type RowWithUser = {
    user_id: string;
    timezone: string | null;
    last_sunday_prompt_at: string | null;
    users:
      | { email: string; onboarding_completed_at: string | null }
      | { email: string; onboarding_completed_at: string | null }[]
      | null;
  };

  const candidates: Candidate[] = [];
  for (const row of (rows ?? []) as RowWithUser[]) {
    if (!row.timezone) continue;
    if (!isStale(row.last_sunday_prompt_at, now)) continue;
    if (!isSundayEveningInZone(now, row.timezone)) continue;

    // The embedded relation may come back as an object or a single-element
    // array depending on PostgREST version; normalise.
    const userRel = Array.isArray(row.users) ? row.users[0] : row.users;
    if (!userRel) continue;
    if (!userRel.onboarding_completed_at) continue;

    candidates.push({
      user_id: row.user_id,
      email: userRel.email,
      timezone: row.timezone,
    });
  }

  let push_sent = 0;
  let email_sent = 0;

  await Promise.all(
    candidates.map(async (candidate) => {
      try {
        const pushResult = await sendPushToUser(candidate.user_id, {
          title: "What's coming up this week?",
          body: "Anything on your mind for next week? Two sentences are enough.",
          url: "/home?sundayPrompt=1",
          tag: "sunday-prompt",
        });
        push_sent += pushResult.sent;
      } catch (err) {
        console.error("[sunday-prompt] push failed", candidate.user_id, err);
      }

      try {
        const tpl = sundayRecapEmail();
        const emailResult = await sendEmail({
          to: candidate.email,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
        });
        if (emailResult.sent) email_sent += 1;
      } catch (err) {
        console.error("[sunday-prompt] email failed", candidate.email, err);
      }

      await supabase
        .from("user_context")
        .update({ last_sunday_prompt_at: now.toISOString() })
        .eq("user_id", candidate.user_id);
    }),
  );

  return {
    scanned: (rows ?? []).length,
    prompted: candidates.length,
    push_sent,
    email_sent,
  };
}

// Inline html/text helpers removed; sundayRecapEmail() in
// lib/email/templates.ts now owns the template.
