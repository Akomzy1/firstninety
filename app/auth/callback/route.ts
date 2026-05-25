/**
 * OAuth + email-confirmation callback.
 *
 * Supabase Auth redirects here after Google sign-in, email verification, or
 * password-reset confirmation. The handler exchanges the `code` query
 * parameter for a session, then forwards to the `next` path (or /home).
 *
 * Lives under `app/auth/` (no parens) so it's a real URL segment exempt from
 * the (auth) layout chrome — bare route handler, no UI.
 */
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/db/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/home";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/home";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
