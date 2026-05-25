/**
 * Auth middleware.
 *
 * Two responsibilities:
 *  1. Refresh the Supabase session cookie on every request so server
 *     components and server actions see a fresh user identity.
 *  2. Redirect unauthenticated users away from app surfaces, and
 *     authenticated users away from the auth surfaces.
 *
 * The redirect logic uses pathname prefixes so adding new app/auth routes
 * doesn't require touching this file.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const APP_PREFIXES = ["/home", "/mission-track", "/situation-room", "/simulator", "/coach", "/playbook", "/settings"];
const AUTH_PREFIXES = ["/login", "/register"];
// /reset-password is reachable in both states — the page renders the
// request-reset form for anonymous users, the update-password form when
// the user has just arrived via the email-reset callback.
const ONBOARDING_PREFIX = "/onboarding";

function startsWithAny(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // Without Supabase configured, gating is pointless — let everything through.
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(items) {
        for (const { name, value } of items) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of items) {
          response.cookies.set({ name, value, ...options });
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAppRoute = startsWithAny(pathname, APP_PREFIXES);
  const isAuthRoute = startsWithAny(pathname, AUTH_PREFIXES);
  const isOnboardingRoute = pathname === ONBOARDING_PREFIX || pathname.startsWith(`${ONBOARDING_PREFIX}/`);

  if (!user && (isAppRoute || isOnboardingRoute)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/home";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on every request except:
     *  - Next.js internals (_next/static, _next/image)
     *  - Static assets in /public served at the root
     *  - The Supabase auth callback (handled directly by the route handler)
     */
    "/((?!_next/static|_next/image|favicon.ico|icons/|fonts/|manifest.json|sw.js|sw.js.map).*)",
  ],
};
