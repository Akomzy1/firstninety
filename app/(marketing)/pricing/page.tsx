/**
 * Pricing page — matches the rendered Pricing prototype.
 *
 * Two-card layout: Free (paper) vs Pro (ink), each with editorial
 * italic tagline + inclusions list + footer CTA. Followed by an
 * "anchor" comparison band that puts the $39.99/mo number next to
 * career-coach + BetterUp + LinkedIn + ChatGPT prices. Then an FAQ
 * section using native <details>/<summary>.
 */
import Link from "next/link";

import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Pricing",
};

const FREE_INCLUSIONS: ReadonlyArray<React.ReactNode> = [
  <>4 Simulator scenarios <span className="text-mute">(lifetime)</span></>,
  "Weeks 1–2 of Mission Track",
  "Basic Playbook access",
  "2 Situation Room sessions per week",
  "5 ad-hoc Coach messages per week",
];

const PRO_INCLUSIONS: ReadonlyArray<React.ReactNode> = [
  "Unlimited Situation Room",
  "Unlimited Scenario Simulator",
  "Full Playbook library",
  "Full 90-day Mission Track",
  "Unlimited Coach",
  "Multi-role support",
  "Survival Report export at Day 90",
];

const COMPARISON: ReadonlyArray<{ label: React.ReactNode; value: string; us?: boolean }> = [
  { label: "One session with a human career coach", value: "$150–$300" },
  {
    label: (
      <>
        BetterUp Plus <span className="text-mute">(monthly)</span>
      </>
    ),
    value: "$149",
  },
  {
    label: (
      <>
        LinkedIn Premium Career <span className="text-mute">(monthly)</span>
      </>
    ),
    value: "~ $30",
  },
  {
    label: (
      <>
        ChatGPT Plus <span className="text-mute">(monthly)</span>
      </>
    ),
    value: "$20",
  },
  {
    label: (
      <>
        FirstNinety Pro{" "}
        <span className="text-mute font-normal text-body-s">(monthly)</span>
      </>
    ),
    value: "$39.99",
    us: true,
  },
];

const FAQ: ReadonlyArray<{ q: string; a: React.ReactNode }> = [
  {
    q: "Why isn't there a cheaper tier?",
    a: (
      <>
        <p>
          Because a cheaper tier would mean cutting the parts that actually
          do the work — the unlimited Situation Room, the full Simulator,
          the 90-day arc. What&rsquo;s left is a chatbot, and a chatbot is
          not what we&rsquo;re selling.
        </p>
        <p>
          The Free plan exists so you can see what FirstNinety is. Pro
          exists for using it through your first 90 days. There is no
          halfway version, because halfway is the version that
          doesn&rsquo;t help.
        </p>
      </>
    ),
  },
  {
    q: "Can I cancel anytime?",
    a: (
      <p>
        Yes. One click in Account &raquo; Billing. No call to retain you,
        no exit survey you can&rsquo;t skip. If you cancel mid-month you
        keep access until the end of the billing period, then drop to
        Free.
      </p>
    ),
  },
  {
    q: "What if my employer wants to pay?",
    a: (
      <>
        <p>
          You can expense it. Many learning &amp; development budgets
          cover tooling under $50 a month without approval; ours is
          designed to fit inside that ceiling on purpose.
        </p>
        <p>
          We don&rsquo;t currently sell team or enterprise seats, and we
          deliberately don&rsquo;t share your usage, prompts, or progress
          with anyone — including a paying employer. Your manager does
          not see your Situation Room transcripts. That is a feature, not
          an oversight.
        </p>
      </>
    ),
  },
  {
    q: "Will you read my work emails or Slack?",
    a: (
      <>
        <p>
          <strong className="text-ink font-medium">No. Never.</strong>{" "}
          FirstNinety does not connect to your email, your calendar, your
          Slack, your Teams, your GitHub, your Jira, or any other
          workplace system. There are no integrations on the roadmap that
          change this.
        </p>
        <p>
          What the coach knows about you is what you have typed into it
          directly, plus the role and week you selected at sign-up.
          That&rsquo;s it.
        </p>
      </>
    ),
  },
  {
    q: "What happens after Day 90?",
    a: (
      <>
        <p>
          On Day 90 we generate a Survival Report — a single document
          summarising what you worked on, the patterns the coach noticed,
          and where you came in stronger than when you started. You can
          export it and keep it.
        </p>
        <p>
          After that, you can stay on Pro (the Situation Room and Coach
          keep working — they&rsquo;re useful past probation), switch to
          Free, or cancel. Most people stay through their first
          promotion conversation, then decide.
        </p>
      </>
    ),
  },
  {
    q: "Do you have a refund policy?",
    a: (
      <>
        <p>
          The 7-day free trial is the refund policy. You don&rsquo;t pay
          until day 8, and you can cancel inside the trial with one click.
        </p>
        <p>
          After that, we don&rsquo;t offer partial-month refunds — but we
          also don&rsquo;t auto-renew an annual plan without warning you
          14 days out. If something has genuinely gone wrong, email us;
          we read every message.
        </p>
      </>
    ),
  },
  {
    q: "Is this only for new graduates?",
    a: (
      <>
        <p>
          No. FirstNinety is for anyone in their first 90 days of a new
          tech role — career changers, returners, people moving from one
          specialism to another, and yes, recent graduates.
        </p>
        <p>
          The system is calibrated by role and by week, not by age or
          years of experience. A senior engineer becoming a Scrum Master
          for the first time gets the same Mission Track as a graduate
          becoming a BA.
        </p>
      </>
    ),
  },
  {
    q: "Is there a student discount?",
    a: (
      <>
        <p>
          Not as a permanent line item. The price is already set against
          a single human coaching session, not against a typical SaaS
          product — discounting it further would make the comparison
          incoherent.
        </p>
        <p>
          If you&rsquo;re enrolled in a partner bootcamp, your cohort may
          have a code. Ask whoever ran your programme.
        </p>
      </>
    ),
  },
];

export default function PricingPage() {
  return (
    <>
      <HeroBand />
      <CardsBand />
      <AnchorBand />
      <FAQBand />
    </>
  );
}

function HeroBand() {
  return (
    <section className="text-center py-8 mx-auto max-w-(--max-reading)">
      <p className="text-eyebrow">Pricing</p>
      <h1 className="text-display text-balance mt-4 max-w-[18ch] mx-auto">
        One product. One price. No tiers.
      </h1>
      <p className="text-body-l text-mute mt-4 max-w-[56ch] mx-auto">
        FirstNinety is built for the first 90 days in your new role.
        We&rsquo;re not selling you a ladder of features.
      </p>
    </section>
  );
}

function CardsBand() {
  return (
    <section className="pb-8 mx-auto max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        <PricingTier
          tone="paper"
          eyebrow="Free"
          price="$0"
          per="/forever"
          editorial="For seeing what FirstNinety is. Not for sustained daily use."
          inclusions={FREE_INCLUSIONS}
          cta={
            <Link href="/register" className="block">
              <Button variant="secondary" size="lg" className="w-full">
                Begin (free)
              </Button>
            </Link>
          }
        />
        <PricingTier
          tone="ink"
          eyebrow="Pro"
          price="$39.99"
          per="/month"
          subprice="or $399 / year"
          editorial="For your full 90 days, and the rehearsal it takes."
          inclusions={PRO_INCLUSIONS}
          cta={
            <>
              <Link href="/register?plan=pro" className="block">
                <button
                  type="button"
                  className="inline-flex h-12 w-full items-center justify-center bg-paper text-ink font-medium px-4 hover:opacity-95 transition-opacity"
                  style={{ borderRadius: "4px" }}
                >
                  Start a free trial
                </button>
              </Link>
              <p className="text-caption text-paper-3 text-center mt-3">
                7-day free trial. Cancel anytime.
              </p>
            </>
          }
        />
      </div>
    </section>
  );
}

function PricingTier({
  tone,
  eyebrow,
  price,
  per,
  subprice,
  editorial,
  inclusions,
  cta,
}: {
  tone: "paper" | "ink";
  eyebrow: string;
  price: string;
  per: string;
  subprice?: string;
  editorial: string;
  inclusions: ReadonlyArray<React.ReactNode>;
  cta: React.ReactNode;
}) {
  const isInk = tone === "ink";
  return (
    <article
      className={`flex h-full flex-col gap-5 p-7 md:p-10 ${
        isInk
          ? "bg-ink text-paper border border-ink"
          : "bg-paper text-ink border border-paper-3"
      }`}
      style={{ borderRadius: "8px" }}
    >
      <p
        className={`text-eyebrow ${isInk ? "text-mute-2" : "text-mute"}`}
      >
        {eyebrow}
      </p>

      <div>
        <div className="flex items-baseline gap-2">
          <span
            className={`font-display text-[clamp(48px,6vw,64px)] leading-none ${isInk ? "text-paper" : "text-ink"}`}
            style={{ letterSpacing: "-0.025em" }}
          >
            {price}
          </span>
          <span
            className={`text-body-s ${isInk ? "text-mute-2" : "text-mute"}`}
          >
            {per}
          </span>
        </div>
        {subprice ? (
          <p
            className={`text-body-s mt-1 ${isInk ? "text-mute-2" : "text-mute"}`}
          >
            {subprice}
          </p>
        ) : null}
      </div>

      <p
        className={`font-display italic text-body-l max-w-[36ch] ${
          isInk ? "text-paper" : "text-ink"
        }`}
      >
        {editorial}
      </p>

      <hr
        className={`border-0 border-t mt-2 ${isInk ? "border-paper/20" : "border-paper-3"}`}
      />

      <ul className="flex flex-col gap-3">
        {inclusions.map((item, idx) => (
          <li
            key={idx}
            className={`text-body ${isInk ? "text-paper" : "text-ink"}`}
          >
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-4">{cta}</div>
    </article>
  );
}

function AnchorBand() {
  return (
    <section className="bg-paper-2 border-t border-b border-paper-3 py-8 -mx-4 md:-mx-6 px-4 md:px-6">
      <div className="text-center mx-auto max-w-(--max-reading)">
        <p className="text-eyebrow">For context</p>
        <h2 className="text-h1 text-balance mt-4 max-w-[22ch] mx-auto">
          What $39.99 a month actually compares to.
        </h2>

        <div className="mt-7 max-w-md mx-auto text-left border-t border-paper-3">
          {COMPARISON.map((row, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-[1fr_auto] gap-6 items-baseline px-1 border-b border-paper-3 ${
                row.us ? "py-5" : "py-4"
              }`}
            >
              <span
                className={`text-body ${
                  row.us ? "text-ink font-medium text-body-l" : "text-ink"
                }`}
              >
                {row.label}
              </span>
              <span
                className={`font-mono text-body-s ${
                  row.us ? "text-ink font-semibold" : "text-mute"
                }`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        <p className="text-body text-mute mt-7 max-w-[60ch] mx-auto">
          <strong className="text-ink font-medium">$39.99</strong> buys you
          a structured 90-day programme, role-specific simulation, and
          on-demand workplace help — not a chatbot, not a course, not a
          calendar invite.
        </p>
      </div>
    </section>
  );
}

function FAQBand() {
  return (
    <section className="py-8 mx-auto max-w-(--max-reading)">
      <header className="mb-7">
        <p className="text-eyebrow">Questions</p>
        <h2 className="text-h1 text-balance mt-4 max-w-[22ch]">
          What people ask before paying.
        </h2>
      </header>

      <div className="border-t border-paper-3">
        {FAQ.map((item) => (
          <details
            key={item.q}
            className="group border-b border-paper-3 [&_summary]:list-none"
          >
            <summary className="cursor-pointer py-5 px-1 flex items-center justify-between gap-5 font-display text-h3 text-ink hover:text-ink/80 focus-visible:outline-2 focus-visible:outline focus-visible:outline-ink focus-visible:outline-offset-2">
              <span>{item.q}</span>
              <span
                className="relative size-5 shrink-0"
                aria-hidden
              >
                <span className="absolute inset-x-0.5 top-1/2 h-px bg-ink -translate-y-1/2" />
                <span className="absolute inset-y-0.5 left-1/2 w-px bg-ink -translate-x-1/2 transition-transform group-open:rotate-90 group-open:opacity-0" />
              </span>
            </summary>
            <div className="pb-6 pt-1 px-1 max-w-[60ch] flex flex-col gap-3 text-body text-mute">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
