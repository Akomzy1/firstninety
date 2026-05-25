/**
 * Sunday recap cron.
 *
 * Vercel cron hits this every hour; the handler filters down to users
 * whose local time is currently Sunday 18:00. Auth is a shared
 * CRON_SECRET in the Authorization header.
 */
import { NextResponse, type NextRequest } from "next/server";

import { runSundayPromptTick } from "@/lib/notifications/sunday-prompt";

export const dynamic = "force-dynamic";

function isAuthorised(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  if (!header) return false;
  // Vercel cron sends `Bearer <secret>`.
  return header === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorised(request)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }
  const stats = await runSundayPromptTick();
  return NextResponse.json({ ok: true, ...stats });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
