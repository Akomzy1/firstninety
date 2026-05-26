/**
 * Sign-up surface. Email + password is the primary path; Google OAuth
 * is offered as a secondary option (Supabase project needs Google OAuth
 * configured — see docs/setup-google-oauth.md).
 *
 * On successful sign-up the signup trigger (migration 00002) creates the
 * matching public.users / subscriptions / user_context / usage_limits
 * rows, then the action redirects to /onboarding/step-1.
 */
import Link from "next/link";

import { GoogleButton } from "@/components/auth/GoogleButton";
import { EmailPasswordForm } from "@/components/auth/EmailPasswordForm";

import { signUpAction } from "../actions";

export default async function RegisterPage() {
  // Joberlify cross-sell removed; all signups tag as 'organic'. The
  // signup_source column on `users` is kept for future source tagging
  // (referral programmes, ad campaigns, etc.).
  const signupSource = "organic";

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-eyebrow">Begin</p>
        <h1 className="text-h2 mt-2">Create your account.</h1>
        <p className="text-body text-mute mt-2">
          The first ninety days, with someone in your corner.
        </p>
      </header>

      <EmailPasswordForm
        mode="sign-up"
        action={signUpAction}
        signupSource={signupSource}
      />

      <div className="relative my-2 flex items-center gap-3">
        <span className="h-px flex-1 bg-paper-3" />
        <span className="text-caption text-mute">or</span>
        <span className="h-px flex-1 bg-paper-3" />
      </div>

      <GoogleButton label="Continue with Google" />

      <p className="text-body-s text-mute mt-3">
        Already have an account?{" "}
        <Link href="/login" className="text-ink underline-offset-4 hover:underline">
          Sign in
        </Link>
        .
      </p>
    </div>
  );
}
