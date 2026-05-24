/**
 * Supabase server client.
 *
 * Use this from server components, server actions, route handlers, and the
 * Next.js middleware. It binds to the request cookie store so RLS sees the
 * authenticated user. Always create a fresh client per request — never
 * cache the returned instance.
 *
 * Cookie writes from `set()` / `remove()` will throw inside server components
 * (Next.js rule); the wrapper swallows that case because the middleware will
 * refresh the cookies on the next navigation.
 */
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "./types.gen";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Set them in .env.local — see .env.example.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(items) {
        try {
          for (const { name, value, options } of items) {
            cookieStore.set({ name, value, ...(options as CookieOptions) });
          }
        } catch {
          // Server components cannot mutate cookies. The middleware will
          // refresh them on the next request, so this branch is safe to
          // swallow.
        }
      },
    },
  });
}
