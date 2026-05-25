/**
 * Reusable email + password form for sign-in and sign-up. Drives a server
 * action via React 19's `useActionState`; renders inline error / notice
 * states inside the form rather than via toasts.
 */
"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import type { AuthFormState } from "@/app/(auth)/actions";

type Mode = "sign-in" | "sign-up";

type EmailPasswordFormProps = {
  mode: Mode;
  action: (
    state: AuthFormState,
    formData: FormData,
  ) => Promise<AuthFormState>;
  next?: string;
  signupSource?: string;
};

export function EmailPasswordForm({
  mode,
  action,
  next,
  signupSource,
}: EmailPasswordFormProps) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    action,
    null,
  );

  const submitLabel = mode === "sign-up" ? "Begin" : "Sign in";
  const pendingLabel = mode === "sign-up" ? "Creating account…" : "Signing in…";

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-body-s text-mute">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete={mode === "sign-up" ? "email" : "username"}
          required
          aria-invalid={state?.error ? true : undefined}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-body-s text-mute">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          required
          minLength={8}
          aria-invalid={state?.error ? true : undefined}
        />
      </div>

      {next ? <input type="hidden" name="next" value={next} /> : null}
      {signupSource ? (
        <input type="hidden" name="signup_source" value={signupSource} />
      ) : null}

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
        variant="primary"
        loading={pending}
        loadingText={pendingLabel}
      >
        {submitLabel}
      </Button>
    </form>
  );
}
