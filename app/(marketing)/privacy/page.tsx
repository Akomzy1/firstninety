/**
 * Public privacy notice. Placeholder body for Phase 1 — Tokunbo will
 * provide the canonical text pre-launch (ICO + UK / US compliance
 * review). The structural sections are fixed; only the prose changes.
 */
export const metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-(--max-reading) py-8 md:py-7 flex flex-col gap-5">
      <header>
        <p className="text-eyebrow">Privacy</p>
        <h1 className="text-h1 mt-2 text-balance">How FirstNinety handles your data.</h1>
        <p className="text-body-s text-mute mt-2">
          Last updated: placeholder — final text lands pre-launch.
        </p>
      </header>

      <Section title="What we collect">
        <p>
          The minimum we need to give you useful coaching: your email, the
          role you&rsquo;re stepping into, your start date, and anything
          you explicitly tell us in onboarding, in Sunday recaps, or
          inside the Coach / Situation Room. We do not store the names of
          your colleagues, managers, stakeholders, or employer. We do not
          ingest from Slack, Jira, your inbox, or your calendar.
        </p>
      </Section>

      <Section title="What we do with it">
        <p>
          We use it exclusively to coach you, and we tell Claude only the
          parts of it relevant to the question you&rsquo;re asking. We
          don&rsquo;t sell it. We don&rsquo;t mine it. We don&rsquo;t
          train models on it.
        </p>
      </Section>

      <Section title="Where it lives">
        <p>
          On Supabase Postgres, with row-level security so only you can
          read your own rows. Encrypted at rest. Audit logs on the
          service-role key.
        </p>
      </Section>

      <Section title="Your controls">
        <p>
          From Settings &raquo; Privacy you can export every row we hold,
          edit or remove anything we remember about you, or delete your
          account permanently. None of these takes more than a tap.
        </p>
      </Section>

      <Section title="Cookies + analytics">
        <p>
          Supabase session cookies for auth. PostHog for anonymous product
          analytics. No third-party advertising cookies.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Email privacy@firstninety.app. The data controller is AkomzyAi
          Consulting Ltd, registered in the United Kingdom.
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
      <div className="text-body text-mute">{children}</div>
    </section>
  );
}
