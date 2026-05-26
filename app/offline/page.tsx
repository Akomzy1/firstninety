"use client";

/**
 * Offline landing page — served by the Serwist service worker as the
 * fallback when navigation fails due to no network. Also rendered
 * directly if a user explicitly navigates to /offline.
 *
 * Voice per SKILL §2: calm, specific about what works and what
 * doesn't. No apology, no humour.
 *
 * Client component because the "Try again" button calls
 * window.location.reload(). Metadata moved to layout-level title.
 */
import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-prose flex-col items-start justify-center gap-5 px-6 py-12">
      <p className="text-eyebrow">Offline</p>
      <h1
        className="font-display italic font-normal text-ink"
        style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.15 }}
      >
        You&rsquo;re offline.
      </h1>
      <p className="text-body-l text-mute max-w-prose">
        Some of FirstNinety needs a connection. The Coach, Situation
        Room, and Simulator all require live model calls and won&rsquo;t
        work until you&rsquo;re reconnected.
      </p>
      <p className="text-body-l text-mute max-w-prose">
        Other surfaces will work from the local cache: any{" "}
        <strong className="text-ink font-medium">Playbook</strong> you
        recently opened, your{" "}
        <strong className="text-ink font-medium">past Situation Room
        sessions</strong>, and{" "}
        <strong className="text-ink font-medium">missions</strong> the
        Mission Track has already loaded.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-5 text-body">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") window.location.reload();
          }}
          className="inline-flex h-11 items-center justify-center gap-2 bg-ink text-paper px-5 font-medium transition-opacity hover:opacity-90"
          style={{ borderRadius: "4px" }}
        >
          Try again
        </button>
        <Link
          href="/home"
          className="text-body text-ink hover:text-mute underline-offset-4 hover:underline"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
