/**
 * Sign-in surface. Errors from the OAuth callback (e.g. Google misconfigured)
 * surface via the `?error=` query string; we render them inline above the
 * form rather than via a toast.
 */
import Link from "next/link";

import { GoogleButton } from "@/components/auth/GoogleButton";
import { EmailPasswordForm } from "@/components/auth/EmailPasswordForm";

import { signInAction } from "../actions";

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, error } = await searchParams;
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : undefined;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-eyebrow">Sign in</p>
        <h1 className="text-h2 mt-2">Welcome back.</h1>
      </header>

      {error ? (
        <p role="alert" className="text-body-s text-danger">
          {error}
        </p>
      ) : null}

      <EmailPasswordForm mode="sign-in" action={signInAction} next={safeNext} />

      <p className="text-body-s text-mute -mt-1">
        <Link
          href="/reset-password"
          className="text-mute underline-offset-4 hover:text-ink hover:underline"
        >
          Forgot your password?
        </Link>
      </p>

      <div className="relative my-2 flex items-center gap-3">
        <span className="h-px flex-1 bg-paper-3" />
        <span className="text-caption text-mute">or</span>
        <span className="h-px flex-1 bg-paper-3" />
      </div>

      <GoogleButton label="Continue with Google" />

      <p className="text-body-s text-mute mt-3">
        New to FirstNinety?{" "}
        <Link
          href="/register"
          className="text-ink underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
        .
      </p>
    </div>
  );
}
