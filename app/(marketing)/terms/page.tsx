/**
 * Terms of Service. Placeholder body for Phase 1 — Tokunbo will
 * provide the canonical text pre-launch via a solicitor. The
 * structural sections are fixed; only the prose changes.
 */
export const metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-(--max-reading) py-8 md:py-7 flex flex-col gap-5">
      <header>
        <p className="text-eyebrow">Terms</p>
        <h1 className="text-h1 mt-2 text-balance">
          The agreement between you and FirstNinety.
        </h1>
        <p className="text-body-s text-mute mt-2">
          Last updated: placeholder — final text lands pre-launch.
        </p>
      </header>

      <Section title="Who runs FirstNinety">
        <p>
          FirstNinety is operated by AkomzyAi Consulting Ltd, a company
          registered in [jurisdiction]. Throughout these Terms we use
          &ldquo;FirstNinety&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;,
          and &ldquo;our&rdquo; to refer to the operating entity.
        </p>
      </Section>

      <Section title="Who can use it">
        <p>
          You must be at least 18 years old and able to enter a legally
          binding contract in your jurisdiction. By signing up, you
          confirm that the information you give us is accurate.
        </p>
      </Section>

      <Section title="What you can expect from us">
        <p>
          We will keep the service available with reasonable effort,
          honour the pricing displayed at sign-up, and treat your
          content as private to you. We will tell you in advance about
          material changes that affect what you&rsquo;re paying for.
        </p>
      </Section>

      <Section title="What we ask of you">
        <p>
          Use the product for its intended purpose. Don&rsquo;t share
          your account with others, attempt to reverse-engineer the
          service, or use it to harm anyone. Anonymise colleagues and
          employers in anything you paste into the product — we&rsquo;ll
          remind you on each surface.
        </p>
      </Section>

      <Section title="Subscriptions, billing, cancellation">
        <p>
          Pricing is shown on the pricing page and at checkout. The
          7-day free trial means no card is charged until day 8. You
          can cancel at any time from Settings &rarr; Billing and
          retain Pro access through the end of your billing period.
          See our refund policy for details.
        </p>
      </Section>

      <Section title="Content + intellectual property">
        <p>
          You own what you write into FirstNinety. We claim only the
          rights needed to operate the service for you — storing,
          processing, and displaying it back to you. We don&rsquo;t
          train models on your content; see the Privacy notice for
          more.
        </p>
      </Section>

      <Section title="Liability">
        <p>
          FirstNinety provides workplace coaching. We are not your
          employer, your legal adviser, your therapist, or your
          accountant. We do our best to be useful; we don&rsquo;t
          guarantee specific outcomes. Our maximum liability to you
          under these Terms is limited to the amount you&rsquo;ve paid
          in the previous 12 months.
        </p>
      </Section>

      <Section title="Changes to these Terms">
        <p>
          We may update these Terms. If a change materially affects
          you, we&rsquo;ll notify you by email at least 14 days before
          it takes effect.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions or concerns: reply to any email from us, or write
          to hello@firstninety.com. We read every message.
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
