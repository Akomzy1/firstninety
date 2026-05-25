/**
 * Probation activation cron. Vercel hits this hourly; the handler runs
 * the two-pass tick (auto-deactivate past review dates, prompt the
 * activation window). Auth is the shared CRON_SECRET.
 */
import { NextResponse, type NextRequest } from "next/server";

import { runProbationActivationTick } from "@/lib/notifications/probation-activation";

export const dynamic = "force-dynamic";

function isAuthorised(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorised(request)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }
  const stats = await runProbationActivationTick();
  return NextResponse.json({ ok: true, ...stats });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
