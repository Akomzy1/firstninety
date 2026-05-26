"use client";

/**
 * Top-level error boundary for the App Router.
 *
 * Next.js renders this when an uncaught error escapes a server or
 * client component within the root segment. Logs to PostHog via the
 * client-side captureEvent + console (the auto-capture exception
 * channel will also receive it via `capture_exceptions: true` in the
 * PostHog init config, but the explicit event lets us filter on
 * `route_error_boundary_hit` in dashboards).
 *
 * Editorial tone per SKILL §2: senior-colleague register, no humour,
 * no apology theatre.
 */
import { useEffect } from "react";
import Link from "next/link";

import { captureEvent } from "@/lib/tracing/posthog";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    try {
      captureEvent("route_error_boundary_hit", {
        message: error.message,
        digest: error.digest ?? null,
      });
    } catch {
      // PostHog should never re-throw inside the error boundary.
    }
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-prose flex-col items-start justify-center gap-5 px-6 py-12">
      <p className="text-eyebrow">Something went wrong</p>
      <h1
        className="font-display italic font-normal text-ink"
        style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.15 }}
      >
        Something went wrong on our side.
      </h1>
      <p className="text-body-l text-mute max-w-prose">
        We&rsquo;ve been told. Try again, or come back in a few minutes.
        If it keeps happening on the same page, let us know — we&rsquo;d
        rather hear about it than not.
      </p>
      {error.digest ? (
        <p className="text-caption font-mono text-mute-2">
          Reference: {error.digest}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-5 text-body">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex h-11 items-center justify-center gap-2 bg-ink text-paper px-5 font-medium transition-opacity hover:opacity-90"
          style={{ borderRadius: "4px" }}
        >
          Try again
        </button>
        <Link
          href="/support"
          className="text-body text-ink hover:text-mute underline-offset-4 hover:underline"
        >
          Contact support
        </Link>
      </div>
    </main>
  );
}
