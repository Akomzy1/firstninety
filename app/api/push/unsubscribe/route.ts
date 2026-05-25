/**
 * POST /api/push/unsubscribe — flip is_active=false on the subscription
 * matching (user_id, endpoint). Idempotent.
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

  let body: { endpoint?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  if (!body.endpoint) {
    return NextResponse.json({ error: "missing_endpoint" }, { status: 400 });
  }

  await supabase
    .from("push_subscriptions")
    .update({ is_active: false })
    .eq("user_id", user.id)
    .eq("endpoint", body.endpoint);

  return NextResponse.json({ ok: true });
}
