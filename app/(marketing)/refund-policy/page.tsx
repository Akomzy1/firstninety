/**
 * Refund policy. Placeholder body for Phase 1 — Tokunbo will provide
 * the canonical text pre-launch.
 *
 * FirstNinety's refund stance: 7-day trial means most users won't
 * need refunds; outside the trial we don't offer refunds for past
 * billing periods but cancellation is one click. Honest, no
 * retention theatre.
 */
export const metadata = {
  title: "Refund policy",
};

export default function RefundPolicyPage() {
  return (
    <article className="mx-auto max-w-(--max-reading) py-8 md:py-7 flex flex-col gap-5">
      <header>
        <p className="text-eyebrow">Refund policy</p>
        <h1 className="text-h1 mt-2 text-balance">
          How refunds work at FirstNinety.
        </h1>
        <p className="text-body-s text-mute mt-2">
          Last updated: placeholder — final text lands pre-launch.
        </p>
      </header>

      <Section title="The short version">
        <p>
          The 7-day free trial is the refund policy. You don&rsquo;t
          pay until day 8, and you can cancel inside the trial with
          one click from Settings &rarr; Billing. After that, we
          don&rsquo;t refund past billing periods — but you can cancel
          at any time and you&rsquo;ll keep Pro access until the end of
          your current period.
        </p>
      </Section>

      <Section title="Inside the trial">
        <p>
          Cancellation during the 7-day trial stops any charge. The
          cancel button is in Settings &rarr; Billing; no calls, no
          retention forms, no &ldquo;wait, before you go&rdquo; emails.
          You keep access through the trial-end date and then drop
          back to the Free tier.
        </p>
      </Section>

      <Section title="Outside the trial — monthly subscription">
        <p>
          We don&rsquo;t offer partial-month refunds. If you cancel
          mid-month, you keep Pro access until the end of the billing
          period (the date shown on Settings &rarr; Billing). After
          that you drop to Free — your account history, Coach threads,
          and Survival Report stay with you.
        </p>
      </Section>

      <Section title="Outside the trial — annual subscription">
        <p>
          Annual subscriptions are non-refundable after the first 14
          days. If you cancel within the first 14 days of an annual
          subscription, we&rsquo;ll refund the full amount. Cancellation
          beyond that retains access through the end of your annual
          term.
        </p>
      </Section>

      <Section title="When we make exceptions">
        <p>
          We genuinely do read every support email. If something has
          gone meaningfully wrong — extended downtime that affected
          your access, a billing error on our side, an outright fraud
          situation — write to us at support@tryfirst90.com and
          we&rsquo;ll work it out. We don&rsquo;t have a script for
          this; we have a person who reads the email.
        </p>
      </Section>

      <Section title="How to cancel">
        <p>
          From inside the app: Settings &rarr; Billing &rarr; Manage
          subscription &rarr; Cancel. The Stripe Customer Portal opens
          and the cancellation takes one click. You&rsquo;ll receive a
          confirmation email; access continues until the period end.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Reach us at support@tryfirst90.com. We aim to reply within
          one business day.
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
