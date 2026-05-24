/**
 * Supabase service-role client.
 *
 * This client bypasses RLS. It must NEVER be imported by client code or by
 * any code that runs in a browser. Use it only for:
 *   - server-side writes to tables that have no user-side write policy
 *     (subscriptions, ai_calls, usage_limits)
 *   - server-side reads that need to span users (cost dashboards, cron jobs)
 *   - Stripe webhook handlers, where there is no Supabase session
 *
 * Importing this from anywhere with `window` defined throws at module load,
 * which surfaces leaks early rather than at runtime in production.
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types.gen";

if (typeof window !== "undefined") {
  throw new Error(
    "lib/db/service.ts imported in a browser context. The service-role key " +
      "must never reach the client — use lib/db/client.ts or lib/db/server.ts instead.",
  );
}

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "Set them in .env.local — see .env.example.",
    );
  }

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
