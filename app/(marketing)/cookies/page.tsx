/**
 * Cookies notice. Placeholder body for Phase 1 — Tokunbo will provide
 * the canonical text pre-launch.
 *
 * FirstNinety's cookie surface is intentionally small: Supabase Auth
 * session cookies + PostHog identification cookies. No advertising
 * cookies, no third-party trackers, no autocapture.
 */
export const metadata = {
  title: "Cookies",
};

export default function CookiesPage() {
  return (
    <article className="mx-auto max-w-(--max-reading) py-8 md:py-7 flex flex-col gap-5">
      <header>
        <p className="text-eyebrow">Cookies</p>
        <h1 className="text-h1 mt-2 text-balance">
          What FirstNinety stores in your browser.
        </h1>
        <p className="text-body-s text-mute mt-2">
          Last updated: placeholder — final text lands pre-launch.
        </p>
      </header>

      <Section title="The short version">
        <p>
          FirstNinety uses two categories of browser storage and that&rsquo;s
          it. No advertising cookies, no third-party trackers, no auto-
          captured DOM events.
        </p>
      </Section>

      <Section title="What we use, and why">
        <p>
          <strong className="text-ink font-medium">
            Supabase Auth session cookies.
          </strong>{" "}
          When you sign in, Supabase sets cookies that prove you&rsquo;re
          you on subsequent requests. Without these, you&rsquo;d need to
          sign in on every page load. They expire when you sign out or
          after the configured session length.
        </p>
        <p>
          <strong className="text-ink font-medium">
            PostHog identification + persistence.
          </strong>{" "}
          PostHog stores a small distinct-id in localStorage and a
          matching cookie so we can stitch your product-usage analytics
          together. We don&rsquo;t use PostHog&rsquo;s autocapture (DOM
          events) or session recording features. See our Privacy notice
          and{" "}
          <a
            href="/posthog-events"
            className="text-ink underline-offset-4 hover:underline"
          >
            tracked events
          </a>{" "}
          for what we actually capture.
        </p>
      </Section>

      <Section title="What we don't use">
        <p>
          We don&rsquo;t set advertising cookies. We don&rsquo;t embed
          third-party tracking pixels (Facebook, LinkedIn, etc.). We
          don&rsquo;t use Google Analytics. We don&rsquo;t use session
          replay or screen recording.
        </p>
      </Section>

      <Section title="How to clear them">
        <p>
          You can clear cookies for firstninety.com (or whatever domain
          you accessed us on) through your browser&rsquo;s privacy
          settings at any time. Doing so will sign you out and reset
          your PostHog distinct-id; the next time you sign in, you
          start a fresh analytics session.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about our cookies approach: reply to any email
          from us or write to privacy@firstninety.com.
        </p>
      </Section>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-h3">{title}</h2>
      <div className="text-body text-mute flex flex-col gap-3">{children}</div>
    </section>
  );
}
