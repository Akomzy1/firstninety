/**
 * POST /api/push/subscribe — persist a push subscription for the
 * authenticated user. Upserts on (user_id, endpoint) so the same device
 * resubscribing doesn't create duplicates.
 */
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/db/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  let body: { endpoint?: string; p256dh?: string; auth?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  if (!body.endpoint || !body.p256dh || !body.auth) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: body.endpoint,
      p256dh: body.p256dh,
      auth: body.auth,
      is_active: true,
    },
    { onConflict: "user_id,endpoint" },
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
