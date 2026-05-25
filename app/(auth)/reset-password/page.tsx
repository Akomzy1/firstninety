/**
 * Password reset.
 *
 * Two states share this URL:
 *   - Unauthenticated: shows the request-reset form (enter email).
 *   - Authenticated (just clicked an email reset link): shows the
 *     update-password form. Supabase delivers a session via the
 *     /auth/callback handler when the user arrives from the email link.
 *
 * Middleware leaves /reset-password unguarded in both states.
 */
"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/db/client";

import {
  requestPasswordResetAction,
  updatePasswordAction,
  type AuthFormState,
} from "../actions";

export default function ResetPasswordPage() {
  const [mode, setMode] = useState<"loading" | "request" | "update">("loading");

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setMode(data.user ? "update" : "request");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (mode === "loading") {
    return (
      <p className="text-body text-mute" role="status">
        Loading…
      </p>
    );
  }

  return mode === "request" ? <RequestResetForm /> : <UpdatePasswordForm />;
}

function RequestResetForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    requestPasswordResetAction,
    null,
  );

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-eyebrow">Reset password</p>
        <h1 className="text-h2 mt-2">We&rsquo;ll email you a link.</h1>
        <p className="text-body text-mute mt-2">
          Enter the email you registered with. The link expires in an hour.
        </p>
      </header>
      <form action={action} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-body-s text-mute">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={state?.error ? true : undefined}
          />
        </div>
        {state?.error ? (
          <p role="alert" className="text-body-s text-danger">
            {state.error}
          </p>
        ) : null}
        {state?.notice ? (
          <p role="status" className="text-body-s text-mute">
            {state.notice}
          </p>
        ) : null}
        <Button
          type="submit"
          loading={pending}
          loadingText="Sending…"
        >
          Send reset link
        </Button>
      </form>
    </div>
  );
}

function UpdatePasswordForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    updatePasswordAction,
    null,
  );

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-eyebrow">Reset password</p>
        <h1 className="text-h2 mt-2">Set a new password.</h1>
        <p className="text-body text-mute mt-2">
          Eight characters or more.
        </p>
      </header>
      <form action={action} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-body-s text-mute">
            New password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            aria-invalid={state?.error ? true : undefined}
          />
        </div>
        {state?.error ? (
          <p role="alert" className="text-body-s text-danger">
            {state.error}
          </p>
        ) : null}
        <Button
          type="submit"
          loading={pending}
          loadingText="Saving…"
        >
          Save password
        </Button>
      </form>
    </div>
  );
}
