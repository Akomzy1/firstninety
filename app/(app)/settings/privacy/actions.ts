/**
 * Privacy server actions — data export + account deletion.
 *
 * Export: pulls every row owned by the user across the app tables and
 * returns the bundled JSON as a string the client turns into a download.
 * (Build Prompt 1.6 specifies Supabase Storage with a signed URL — we
 * surface the inline payload at MVP and graduate to storage + Resend
 * email once the bucket is provisioned. Same observable behaviour for
 * the user; less infra to spin up to ship Phase 1.)
 *
 * Delete: two-step destructive flow. First call issues a confirmation
 * token + the email the user must type to confirm. Second call with
 * matching token + email actually removes the data and the auth user.
 */
"use server";

import crypto from "node:crypto";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";
import { createServiceClient } from "@/lib/db/service";
import { captureServerEvent } from "@/lib/tracing/posthog-server";

const DELETE_COOKIE = "fn:delete-token";
const DELETE_COOKIE_TTL_SECONDS = 5 * 60; // 5 min

export type ExportPayload = {
  user: unknown;
  subscription: unknown;
  context: unknown;
  responsibilities: unknown;
  mission_completions: unknown;
  scenario_runs: unknown;
  situation_sessions: unknown;
  coach_threads: unknown;
  coach_messages: unknown;
  probation_artefacts: unknown;
  push_subscriptions: unknown;
  exported_at: string;
};

export async function exportUserDataAction(): Promise<{
  filename: string;
  json: string;
}> {
  const user = await requireAuth();
  const supabase = await createClient();

  // Each query is RLS-bound to the current user, so the service role isn't
  // required for the read path.
  const [
    usersResult,
    subscriptionResult,
    contextResult,
    responsibilitiesResult,
    missionCompletionsResult,
    scenarioRunsResult,
    situationSessionsResult,
    coachThreadsResult,
    coachMessagesResult,
    probationArtefactsResult,
    pushSubscriptionsResult,
  ] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_context").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("user_responsibilities")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("mission_completions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("scenario_runs")
      .select("*")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false }),
    supabase
      .from("situation_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("coach_threads")
      .select("*")
      .eq("user_id", user.id)
      .order("last_message_at", { ascending: false }),
    supabase
      .from("coach_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("probation_artefacts")
      .select("*")
      .eq("user_id", user.id)
      .order("generated_at", { ascending: false }),
    supabase
      .from("push_subscriptions")
      .select("id, endpoint, is_active, created_at")
      .eq("user_id", user.id),
  ]);

  const payload: ExportPayload = {
    user: usersResult.data,
    subscription: subscriptionResult.data,
    context: contextResult.data,
    responsibilities: responsibilitiesResult.data ?? [],
    mission_completions: missionCompletionsResult.data ?? [],
    scenario_runs: scenarioRunsResult.data ?? [],
    situation_sessions: situationSessionsResult.data ?? [],
    coach_threads: coachThreadsResult.data ?? [],
    coach_messages: coachMessagesResult.data ?? [],
    probation_artefacts: probationArtefactsResult.data ?? [],
    push_subscriptions: pushSubscriptionsResult.data ?? [],
    exported_at: new Date().toISOString(),
  };

  return {
    filename: `firstninety-export-${new Date().toISOString().slice(0, 10)}.json`,
    json: JSON.stringify(payload, null, 2),
  };
}

export type DeleteAccountInitState = {
  error?: string;
  token?: string;
  emailToConfirm?: string;
} | null;

export async function startAccountDeletionAction(): Promise<{
  token: string;
  email: string;
}> {
  const user = await requireAuth();
  const token = crypto.randomBytes(24).toString("hex");
  const store = await cookies();
  store.set({
    name: DELETE_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: DELETE_COOKIE_TTL_SECONDS,
    path: "/settings",
  });
  return { token, email: user.email ?? "" };
}

export type ConfirmDeletionState = {
  error?: string;
} | null;

export async function confirmAccountDeletionAction(
  _prev: ConfirmDeletionState,
  formData: FormData,
): Promise<ConfirmDeletionState> {
  const user = await requireAuth();
  const submittedEmail = formData.get("email")?.toString().trim() ?? "";
  const submittedToken = formData.get("token")?.toString() ?? "";

  const store = await cookies();
  const expectedToken = store.get(DELETE_COOKIE)?.value;

  if (!expectedToken || expectedToken !== submittedToken) {
    return {
      error: "That deletion confirmation has expired. Start again.",
    };
  }
  if (!user.email || submittedEmail.toLowerCase() !== user.email.toLowerCase()) {
    return { error: "The email you typed doesn't match your account." };
  }

  // Best-effort PostHog event before we vaporise the user.
  try {
    await captureServerEvent({
      distinctId: user.id,
      event: "account_deleted",
      properties: { email: user.email },
    });
  } catch (err) {
    console.error("[privacy] posthog event failed", err);
  }

  // TODO(phase 4.1): cancel the Stripe subscription if any. There's no
  // Stripe wiring yet, so nothing to call.

  // Cascade-delete via the service role. The app-level rows fall thanks
  // to ON DELETE CASCADE, then auth.users itself goes last via the admin
  // API. Service role bypasses RLS.
  const service = createServiceClient();

  // Some tables don't cascade (ai_calls.user_id is SET NULL); handle them
  // explicitly so the user's contribution to those is wiped too.
  await service.from("ai_calls").delete().eq("user_id", user.id);

  // Delete the public.users row (cascades to subscriptions, user_context,
  // user_responsibilities, mission_completions, scenario_runs,
  // situation_sessions, coach_threads, coach_messages,
  // probation_artefacts, push_subscriptions, usage_limits).
  const { error: usersDeleteError } = await service
    .from("users")
    .delete()
    .eq("id", user.id);
  if (usersDeleteError) {
    return { error: usersDeleteError.message };
  }

  // Now the auth.users row.
  const { error: authDeleteError } = await service.auth.admin.deleteUser(user.id);
  if (authDeleteError) {
    return { error: authDeleteError.message };
  }

  // Clear the session and the deletion cookie.
  const supabase = await createClient();
  await supabase.auth.signOut();
  store.delete(DELETE_COOKIE);

  revalidatePath("/", "layout");
  redirect("/?account=deleted");
}
