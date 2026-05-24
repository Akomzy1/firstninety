/**
 * Supabase browser client.
 *
 * Use this in client components (`"use client"`). It reads + writes the same
 * auth cookies as the server client and the Next.js middleware, so a session
 * established on the server is immediately visible in the browser.
 *
 * Never import this from server-only code — use `@/lib/db/server` instead.
 */
import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./types.gen";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Set them in .env.local — see .env.example.",
    );
  }

  return createBrowserClient<Database>(url, anonKey);
}
