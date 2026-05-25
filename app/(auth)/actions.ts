/**
 * Auth server actions.
 *
 * Each action returns a serialisable result `{ error?: string }` rather than
 * throwing, so the calling form component can use React 19's
 * `useActionState` to render the failure inline. Success paths use
 * `redirect()` which is a control-flow throw — handled by Next.js, not
 * surfaced to the caller.
 */
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/db/server";

export type AuthFormState = {
  error?: string;
  notice?: string;
} | null;

const MIN_PASSWORD = 8;

async function getRedirectOrigin() {
  const h = await headers();
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

function safeNextPath(raw: FormDataEntryValue | null) {
  const value = typeof raw === "string" ? raw : "";
  if (!value.startsWith("/")) return "/home";
  if (value.startsWith("//")) return "/home";
  return value;
}

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const signupSource = formData.get("signup_source")?.toString() ?? "organic";

  if (!email) return { error: "Email is required." };
  if (password.length < MIN_PASSWORD) {
    return { error: `Password must be at least ${MIN_PASSWORD} characters.` };
  }

  const supabase = await createClient();
  const origin = await getRedirectOrigin();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding/step-1`,
      data: { signup_source: signupSource },
    },
  });

  if (error) return { error: error.message };

  // If email confirmation is enabled in the Supabase project, the user
  // lands on the login page with a notice. If confirmations are disabled,
  // a session is established immediately and the redirect takes effect.
  redirect("/onboarding/step-1");
}

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const next = safeNextPath(formData.get("next"));

  if (!email) return { error: "Email is required." };
  if (!password) return { error: "Password is required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect(next);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordResetAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = formData.get("email")?.toString().trim() ?? "";
  if (!email) return { error: "Email is required." };

  const supabase = await createClient();
  const origin = await getRedirectOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });
  if (error) return { error: error.message };
  return { notice: "Check your email for a reset link." };
}

export async function updatePasswordAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const password = formData.get("password")?.toString() ?? "";
  if (password.length < MIN_PASSWORD) {
    return { error: `Password must be at least ${MIN_PASSWORD} characters.` };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/home");
}

export async function signInWithGoogleAction() {
  const supabase = await createClient();
  const origin = await getRedirectOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/home`,
    },
  });
  if (error || !data?.url) {
    // Surface a sane error if Google OAuth isn't configured in Supabase.
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "OAuth unavailable")}`);
  }
  redirect(data.url);
}
