/**
 * Public DPIA summary. Placeholder structure follows ICO guidance for
 * Data Protection Impact Assessments; the content is filled in pre-launch
 * by AkomzyAi Consulting Ltd / Tokunbo.
 */
export const metadata = {
  title: "DPIA",
};

export default function DPIAPage() {
  return (
    <article className="mx-auto max-w-(--max-reading) py-8 md:py-7 flex flex-col gap-5">
      <header>
        <p className="text-eyebrow">Data Protection Impact Assessment</p>
        <h1 className="text-h1 mt-2 text-balance">Risks, mitigations, and decisions.</h1>
        <p className="text-body-s text-mute mt-2">
          Placeholder following the ICO DPIA structure. Final assessment
          completed pre-launch and signed by the data controller.
        </p>
      </header>

      <Section title="1. Identify the need for a DPIA">
        <p>
          FirstNinety processes sensitive workplace context (probation
          status, manager dynamics, mental load) and uses an LLM for
          coaching. Both characteristics trigger an ICO DPIA requirement.
        </p>
      </Section>

      <Section title="2. Describe the processing">
        <p>
          Data subjects: individual paying users. Data categories: name
          (optional), email, declared career context, free-text journal
          entries, AI conversation transcripts. Recipients: Anthropic
          (LLM), Supabase (storage), Resend (transactional email),
          PostHog (analytics). Retention: until the user deletes their
          account.
        </p>
      </Section>

      <Section title="3. Consultation">
        <p>
          Documented in pre-launch consultations with three pilot users
          and the data controller. Findings folder maintained internally.
        </p>
      </Section>

      <Section title="4. Necessity and proportionality">
        <p>
          The processing is necessary to deliver role-aware coaching at
          all — generic LLM access without context does not constitute
          coaching. We minimise by never ingesting from employer systems,
          never storing real names of third parties, and never training
          models on user content.
        </p>
      </Section>

      <Section title="5. Identified risks">
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>Re-identification of colleagues via narrative content.</li>
          <li>Inappropriate AI advice on legal or medical questions.</li>
          <li>Inappropriate retention beyond the user&rsquo;s active use.</li>
        </ul>
      </Section>

      <Section title="6. Mitigations">
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>Active onboarding prompt to anonymise third parties.</li>
          <li>Safety guardrails on Coach + Situation Room with fixed referral pathways for crisis, harassment, and discrimination topics.</li>
          <li>One-tap delete of all account data from Settings &raquo; Privacy.</li>
          <li>Row-level security on every user-owned table; service-role usage logged.</li>
        </ul>
      </Section>

      <Section title="7. Sign-off">
        <p>
          Reviewed and signed by the data controller (AkomzyAi
          Consulting Ltd) prior to public launch. Re-reviewed on each
          significant feature change.
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
