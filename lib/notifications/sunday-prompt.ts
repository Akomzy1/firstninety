/**
 * Sunday recap prompt orchestration.
 *
 * The cron route fires every hour. For each user whose local time is
 * Sunday 18:00 (± the cron tick window) and who hasn't been prompted in
 * the last 24h, we send a push notification (if they have subscriptions)
 * AND an email. The recipient list is small per tick — at most one
 * timezone's worth of Pro users — so the per-user round trips are fine
 * for MVP scale.
 */
import "server-only";

import { createServiceClient } from "@/lib/db/service";
import { sendEmail } from "@/lib/notifications/email";
import { sendPushToUser } from "@/lib/notifications/push";

type Candidate = {
  user_id: string;
  email: string;
  timezone: string;
};

const TARGET_HOUR = 18;
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
    return weekday === TARGET_WEEKDAY && hour === TARGET_HOUR;
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
        const emailResult = await sendEmail({
          to: candidate.email,
          subject: "What's coming up this week?",
          html: sundayPromptHtml(),
          text: sundayPromptText(),
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

function sundayPromptHtml(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://firstninety.app";
  return `<!doctype html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif; background: #FAF7F2; color: #0E1116; padding: 32px;">
    <div style="max-width: 560px; margin: 0 auto;">
      <p style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #6F6A60; margin: 0;">Sunday recap</p>
      <h1 style="font-family: Georgia, serif; font-size: 28px; line-height: 1.25; margin: 12px 0 16px;">What's coming up this week?</h1>
      <p style="font-size: 17px; line-height: 1.55; color: #6F6A60; margin: 0 0 24px;">Any upcoming meetings, deliverables, or conversations on your mind? Tell FirstNinety so the week ahead lands better.</p>
      <p>
        <a href="${appUrl}/home?sundayPrompt=1" style="display: inline-block; background: #0E1116; color: #FAF7F2; padding: 14px 22px; text-decoration: none; font-weight: 500; border-radius: 4px;">
          Tell FirstNinety
        </a>
      </p>
    </div>
  </body>
</html>`;
}

function sundayPromptText(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://firstninety.app";
  return `What's coming up this week?

Any upcoming meetings, deliverables, or conversations on your mind? Tell FirstNinety so the week ahead lands better.

Open: ${appUrl}/home?sundayPrompt=1`;
}
