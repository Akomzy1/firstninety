/**
 * 404 — page not found.
 *
 * Top-level not-found UI rendered by Next.js when no matching route
 * is found OR when a server component calls `notFound()`. Editorial
 * tone per SKILL §2: senior colleague, no humour, no images.
 */
import Link from "next/link";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-prose flex-col items-start justify-center gap-5 px-6 py-12">
      <p className="text-eyebrow">404</p>
      <h1
        className="font-display italic font-normal text-ink"
        style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.15 }}
      >
        We can&rsquo;t find that page.
      </h1>
      <p className="text-body-l text-mute max-w-prose">
        The link may be stale, or the page may have moved during a
        recent change. Head back to the home, or try one of the main
        surfaces.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-5 text-body">
        <Link
          href="/home"
          className="inline-flex h-11 items-center justify-center gap-2 bg-ink text-paper px-5 font-medium transition-opacity hover:opacity-90"
          style={{ borderRadius: "4px" }}
        >
          Back home &rarr;
        </Link>
        <Link
          href="/"
          className="text-body text-ink hover:text-mute underline-offset-4 hover:underline"
        >
          Marketing site
        </Link>
      </div>
    </main>
  );
}
