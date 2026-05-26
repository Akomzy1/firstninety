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
  "Probation Prep Mode",
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
      <p>
        Because the value at $39.99 is already the cheaper tier.
        We&rsquo;re not selling you a path up — we&rsquo;re selling you
        the whole product, once.
      </p>
    ),
  },
  {
    q: "Can I cancel anytime?",
    a: (
      <p>
        Yes. From your account settings. Your access continues until the
        end of the billing period.
      </p>
    ),
  },
  {
    q: "What if my employer wants to pay?",
    a: (
      <p>
        For now, you&rsquo;d expense it yourself and your employer
        reimburses. Direct invoicing for institutions is coming in Phase
        2.
      </p>
    ),
  },
  {
    q: "Will you read my work emails or Slack?",
    a: (
      <p>
        <strong className="text-ink font-medium">No. Never.</strong> We
        never ask for access to your work systems. When you paste
        anything from work into FirstNinety, we&rsquo;ll prompt you to
        anonymise first. See our memory model — Level 1 declared only,
        never Level 3 workplace ingestion.
      </p>
    ),
  },
  {
    q: "What happens after Day 90?",
    a: (
      <p>
        The Mission Track concludes — it&rsquo;s a 13-week curriculum by
        design. Situation Room, Coach, Playbook Library, and Simulator
        continue indefinitely as long as you&rsquo;re subscribed. Your
        Day 90 Survival Report is yours to keep. The product transforms
        from structured curriculum to sustained on-demand workplace
        partner.
      </p>
    ),
  },
  {
    q: "Does FirstNinety work if my probation is longer than 90 days?",
    a: (
      <p>
        Yes. Probation Prep Mode is independent of the 90-day Mission
        Track — it activates 21 days before any probation review you
        have coming up, whether that&rsquo;s at the end of your first
        90 days or six months in. You can set or adjust your probation
        date anytime in Settings. The window length is customisable
        from 7 to 90 days for industries with extended probations.
      </p>
    ),
  },
  {
    q: "What if I joined FirstNinety after my first 90 days at this role?",
    a: (
      <p>
        You can still use it. We&rsquo;ll start where you are — no
        catch-up curriculum, no pretending you&rsquo;re starting fresh.
        You&rsquo;ll have full access to Situation Room, Coach,
        Playbooks, and Simulator. If you have a probation review coming
        up — even at month 5 or 6 — Probation Prep Mode will activate
        at the right time.
      </p>
    ),
  },
  {
    q: "Do you have a refund policy?",
    a: (
      <p>
        The 7-day free trial means most users won&rsquo;t need refunds.
        Outside the trial, we don&rsquo;t offer refunds for past billing
        periods — but you can cancel anytime to stop future charges.
      </p>
    ),
  },
  {
    q: "Is there a student discount?",
    a: (
      <p>
        Not at MVP. Institutional partnerships with bootcamps and
        training programs are coming in Phase 2 — if you&rsquo;re a
        current student, your program may be able to provide access.
      </p>
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

        <p className="text-body-l text-mute mt-5 max-w-[60ch] mx-auto">
          The first three months of FirstNinety cost $120. The difference
          between losing your first tech job and keeping it costs less
          than one human coaching session per month.{" "}
          <strong className="text-ink font-medium">
            That&rsquo;s the comparison worth making.
          </strong>
        </p>

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
