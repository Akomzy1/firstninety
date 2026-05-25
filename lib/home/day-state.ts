/**
 * Daily-home day-state derivation.
 *
 * `current_day = floor((today - start_date) / 1 day) + 1`
 * `current_week = ceil(current_day / 7)`
 *
 * If the user has no start_date, treat today as Day 1.
 * If `current_day > 90`, the user is in the post-90 state (Prompt 3.16).
 */
import "server-only";

export type DayMode = "day-1" | "day-n" | "post-90";

export type DayState = {
  mode: DayMode;
  day: number;
  week: number;
  weekday: string;
  dateLabel: string;
};

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function getDayState(
  startDate: string | null,
  now: Date = new Date(),
): DayState {
  let day = 1;
  if (startDate) {
    try {
      const start = new Date(`${startDate}T00:00:00Z`);
      if (!Number.isNaN(start.getTime())) {
        const startUtc = Date.UTC(
          start.getUTCFullYear(),
          start.getUTCMonth(),
          start.getUTCDate(),
        );
        const nowUtc = Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
        );
        const diffDays = Math.floor((nowUtc - startUtc) / (24 * 60 * 60 * 1000));
        day = Math.max(1, diffDays + 1);
      }
    } catch {
      // fall through to day=1
    }
  }

  const week = Math.ceil(day / 7);
  const weekdayIdx = now.getDay();
  const weekday = WEEKDAYS[weekdayIdx] ?? "—";
  const dateLabel = now.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });

  let mode: DayMode = "day-n";
  if (day === 1) mode = "day-1";
  else if (day > 90) mode = "post-90";

  return { mode, day, week, weekday, dateLabel };
}
