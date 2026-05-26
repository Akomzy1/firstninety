/**
 * Health-check endpoint.
 *
 * Probes the four production dependencies (Supabase, Anthropic,
 * Stripe, Resend) and returns 200 if all reachable, 503 with the
 * per-probe details if any fail. Used by Vercel monitoring + external
 * uptime services (UptimeRobot, Better Uptime, etc.).
 *
 * Auth: requires `Authorization: Bearer <CRON_SECRET>` so it's not
 * a public surface — health detail (model availability, Stripe key
 * validity) shouldn't be probe-able by anonymous traffic.
 *
 * Cost budget: each call costs ~$0.0001 (one 1-token Haiku completion
 * to verify the Anthropic key). Probing every minute = ~$4.50/month.
 * Supabase / Stripe / Resend probes are free (read-only API calls).
 *
 * Time budget: 5-second hard timeout per probe; total response under
 * ~6s in the worst case.
 */
import { NextResponse, type NextRequest } from "next/server";

import { Resend } from "resend";
import Stripe from "stripe";

import { createServiceClient } from "@/lib/db/service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ProbeResult =
  | { ok: true; ms: number }
  | { ok: false; ms: number; error: string };

const TIMEOUT_MS = 5000;

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]);
}

async function probeSupabase(): Promise<ProbeResult> {
  const start = Date.now();
  try {
    const client = createServiceClient();
    // Read-only count against a known table. Cheap, doesn't allocate
    // rows back to us. Service role bypasses RLS. Wrapped in an async
    // IIFE so withTimeout's Promise.race gets a real Promise (the
    // Supabase query builder is thenable but not Promise-typed).
    const { error } = await withTimeout(
      (async () =>
        client
          .from("users")
          .select("id", { count: "exact", head: true })
          .limit(1))(),
      TIMEOUT_MS,
      "supabase",
    );
    if (error) throw new Error(error.message);
    return { ok: true, ms: Date.now() - start };
  } catch (err) {
    return {
      ok: false,
      ms: Date.now() - start,
      error: (err as Error).message,
    };
  }
}

async function probeAnthropic(): Promise<ProbeResult> {
  const start = Date.now();
  try {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
    // Defer the SDK import so this route's cold start stays small for
    // health-only callers (e.g. uptime monitors).
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: key });
    const result = await withTimeout(
      client.messages.create({
        model: process.env.CLAUDE_HAIKU_MODEL ?? "claude-haiku-4-5-20251001",
        max_tokens: 1,
        messages: [{ role: "user", content: "health" }],
      }),
      TIMEOUT_MS,
      "anthropic",
    );
    if (!result?.id) throw new Error("Anthropic returned an empty response");
    return { ok: true, ms: Date.now() - start };
  } catch (err) {
    return {
      ok: false,
      ms: Date.now() - start,
      error: (err as Error).message,
    };
  }
}

async function probeStripe(): Promise<ProbeResult> {
  const start = Date.now();
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    const stripe = new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
    await withTimeout(
      stripe.products.list({ limit: 1 }),
      TIMEOUT_MS,
      "stripe",
    );
    return { ok: true, ms: Date.now() - start };
  } catch (err) {
    return {
      ok: false,
      ms: Date.now() - start,
      error: (err as Error).message,
    };
  }
}

async function probeResend(): Promise<ProbeResult> {
  const start = Date.now();
  try {
    const key = process.env.RESEND_API_KEY;
    if (!key || key.startsWith("placeholder")) {
      throw new Error("RESEND_API_KEY is not set or is a placeholder");
    }
    const resend = new Resend(key);
    // domains.list is a cheap read-only call that proves the key is
    // accepted by Resend; doesn't send anything.
    await withTimeout(resend.domains.list(), TIMEOUT_MS, "resend");
    return { ok: true, ms: Date.now() - start };
  } catch (err) {
    return {
      ok: false,
      ms: Date.now() - start,
      error: (err as Error).message,
    };
  }
}

function isAuthorised(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest): Promise<Response> {
  if (!isAuthorised(req)) {
    // 401 rather than 404 so monitors get a clear signal that the
    // endpoint exists but they need to authenticate.
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const start = Date.now();
  const [supabase, anthropic, stripe, resend] = await Promise.all([
    probeSupabase(),
    probeAnthropic(),
    probeStripe(),
    probeResend(),
  ]);
  const total = Date.now() - start;

  const checks = { supabase, anthropic, stripe, resend };
  const allOk = Object.values(checks).every((c) => c.ok);

  const body = {
    status: allOk ? "ok" : "degraded",
    total_ms: total,
    checks,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(body, {
    status: allOk ? 200 : 503,
  });
}
