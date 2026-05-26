/**
 * For-AI-Engineers landing — full editorial dark surface that matches
 * `docs/design-prototypes/_rendered/firstninety-for-ai-engineers.html`
 * section-for-section.
 *
 * Sections, top to bottom:
 *  1. Hero: persona eyebrow + display headline + sub + dual CTAs + meta row.
 *  2. Six conversations — numbered editorial list under a coral-underlined H2.
 *  3. What's different — 60/40 grid with three §-keyed paragraphs and an
 *     editorial pull quote sidebar. MCP / LangGraph render as inline code
 *     chips (Geist Mono pill on bg-paper-2).
 *  4. One clarification — "This is not a course." short paragraph.
 *  5. Pricing band — $39.99/mo, three-row compare, primary CTA.
 *
 * The dark chrome (header + footer + theme toggle) is rendered by the
 * (aie) route group's layout.
 */
import Link from "next/link";

import { ScrollDepthTracker } from "@/components/marketing/ScrollDepthTracker";

export const metadata = {
  title: "FirstNinety_ai — The tradecraft no one is documenting yet.",
  description:
    "The workplace coach for new AI engineers — evals you can defend, hallucinations you can explain, costs you can justify, and the probation review you can pass. Authored, not generated.",
};

const TRACKED_SECTIONS = [
  "aie-hero",
  "aie-convos",
  "aie-probation",
  "aie-whats",
  "aie-clarify",
  "aie-pricing",
] as const;

const CONVOS = [
  {
    quote: "“Why isn't it 100% accurate?”",
    attrib: "— from your PM, about the chatbot that just shipped.",
  },
  {
    quote: "“How much will this cost us per user per month?”",
    attrib: "— from your CFO, with a deadline.",
  },
  {
    quote: "“Why don't we just use ChatGPT for this?”",
    attrib:
      "— from your director, who thinks ChatGPT and GPT-4 are the same thing.",
  },
  {
    quote: "“Can you run an eval?”",
    attrib:
      "— from your tech lead, with no shared definition of what that means.",
  },
  {
    quote: "“It hallucinated to a customer.”",
    attrib: "— from your support team, on a Friday afternoon.",
  },
  {
    quote: "“RAG or fine-tune?”",
    attrib: "— from your architect, who already has an opinion.",
  },
];

export default function AIEngineerPage() {
  return (
    <>
      <Hero />
      <Convos />
      <ProbationConversation />
      <Whats />
      <Clarify />
      <PricingBand />
      <ScrollDepthTracker sectionIds={TRACKED_SECTIONS} />
    </>
  );
}

function Hero() {
  return (
    <section id="aie-hero" className="pt-24 pb-24 md:pt-32">
      <div className="mx-auto w-full max-w-[60rem] px-8 text-center">
        <p className="inline-flex items-center gap-2.5 mb-8 text-caption uppercase tracking-[0.08em] text-mute">
          <span
            aria-hidden
            className="block size-1.5 rounded-full bg-mute-2"
          />
          For your first 90 days as a Junior / Associate AI Engineer
        </p>

        <h1 className="font-display font-normal text-balance leading-[1.05] tracking-tight text-ink mx-auto max-w-[18ch] text-[clamp(2.5rem,6vw,4.5rem)] mb-8">
          The tradecraft no one is documenting yet.
        </h1>

        <p className="font-body text-body-l text-mute mx-auto max-w-[60ch] mb-10 leading-relaxed">
          Evals you can defend. Hallucinations you can explain. Costs you can
          justify.{" "}
          <strong className="text-ink font-medium">
            The probation review you can pass.
          </strong>{" "}
          <strong className="text-ink font-medium">FirstNinety_ai</strong> is
          the workplace coach for new AI engineers, built by people doing this
          work in production.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <Link
            href="/register?role=aie"
            className="inline-flex h-12 items-center justify-center bg-ink text-paper px-5 font-medium transition-opacity hover:opacity-90 min-w-[180px]"
            style={{ borderRadius: "4px" }}
          >
            Begin (free)
          </Link>
          <Link
            href="#whats"
            className="inline-flex h-12 items-center justify-center px-4 text-body text-ink border-b border-paper-3 hover:border-ink transition-colors"
          >
            How this is different <span className="ml-1.5">&rarr;</span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          {[
            "No credit card to start",
            "Cancel any time",
            "$39.99 / month after trial",
          ].map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 text-caption text-mute"
            >
              <span
                aria-hidden
                className="block size-1 rounded-full bg-mute-2"
              />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Convos() {
  return (
    <section id="aie-convos" className="py-24">
      <div className="mx-auto w-full max-w-[45rem] px-8">
        <header className="mb-16 flex flex-col gap-3">
          <span className="text-eyebrow">
            Six conversations you&rsquo;ll have this quarter
          </span>
          <h2 className="relative font-display font-normal text-balance text-ink inline-block max-w-[22ch] text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.2] pb-4">
            And nobody is teaching you how to have them.
            <span
              aria-hidden
              className="absolute left-0 bottom-0 h-0.5 w-32 bg-accent rounded-[1px]"
            />
          </h2>
        </header>

        <ol
          aria-label="Six conversations"
          className="flex flex-col gap-12 list-none m-0 p-0"
        >
          {CONVOS.map((row, i) => (
            <li
              key={i}
              className={`grid grid-cols-[64px_1fr] sm:grid-cols-[90px_1fr] gap-5 sm:gap-6 items-baseline ${
                i === 0 ? "" : "pt-6 border-t border-paper-3"
              }`}
            >
              <span
                aria-hidden
                className="font-display font-medium text-ink tracking-tight"
                style={{
                  fontSize: "clamp(2.75rem, 4vw, 3.5rem)",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-2.5 pt-1">
                <p
                  className="font-display italic text-ink text-balance"
                  style={{
                    fontSize: "clamp(1.25rem, 2.1vw, 1.5rem)",
                    lineHeight: 1.35,
                  }}
                >
                  {row.quote}
                </p>
                <p className="text-body-s text-mute leading-relaxed">
                  {row.attrib}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* Climax — seventh conversation, set apart visually. The
            larger gap + horizontal rule + missing number cue the reader
            that this is qualitatively different from the daily six. */}
        <div className="mt-20 pt-12 border-t border-mute-2/30 flex flex-col gap-3">
          <p
            className="font-display italic text-ink text-balance"
            style={{
              fontSize: "clamp(1.375rem, 2.3vw, 1.625rem)",
              lineHeight: 1.4,
            }}
          >
            And then, three months in:{" "}
            <span className="text-ink">
              &ldquo;How&rsquo;s it going? Should we make this permanent?&rdquo;
            </span>{" "}
            — from your manager, with everything riding on the answer.
          </p>
          <p className="font-display italic text-caption text-mute leading-relaxed">
            The probation review is the one conversation that decides whether
            you keep the job. FirstNinety helps you walk into it ready.
          </p>
        </div>
      </div>
    </section>
  );
}

function ProbationConversation() {
  return (
    <section
      id="aie-probation"
      className="bg-paper-2 border-t border-b border-paper-3 py-24"
    >
      <div className="mx-auto w-full max-w-[45rem] px-8">
        <span className="text-eyebrow block mb-6">
          About that seventh conversation
        </span>
        <h3 className="font-display font-normal text-ink text-balance max-w-[28ch] mb-8 text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.25]">
          Three weeks before your probation review, FirstNinety changes.
        </h3>

        <div className="flex flex-col gap-5 text-body-l text-mute leading-relaxed">
          <p>
            You&rsquo;ve been here twelve weeks. You&rsquo;ve shipped two
            models, written one eval suite, and explained hallucinations to
            your PM more times than you can count. Now your manager wants a
            thirty-minute conversation about whether you stay.
          </p>
          <p>
            FirstNinety&rsquo;s{" "}
            <strong className="text-ink font-medium">
              Probation Prep Mode
            </strong>{" "}
            activates twenty-one days before that conversation. The Coach
            changes voice. Your missions sharpen around evidence-gathering. A
            one-page Brief gets drafted from everything you&rsquo;ve shipped,
            written, and learned — anonymised, exportable, yours to walk into
            the meeting with.{" "}
            <em className="font-display italic text-ink">
              Most probation reviews are decided weeks before the review
              itself. The work is in the preparation, not the room.
            </em>
          </p>
        </div>

        <p className="font-display italic text-body-s text-mute-2 mt-10 pt-6 border-t border-paper-3 max-w-[60ch]">
          This works whether your probation is 90 days or 6 months — Probation
          Mode activates 21 days before your review, regardless of when that
          is.
        </p>
      </div>
    </section>
  );
}

function Whats() {
  return (
    <section id="aie-whats" className="py-24 border-t border-paper-3">
      <div className="mx-auto w-full max-w-[67.5rem] px-8">
        <header className="mb-16 flex flex-col gap-3">
          <span className="text-eyebrow">What's different here</span>
          <h2 className="font-display font-normal text-ink text-balance max-w-[24ch] text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.2]">
            This wasn't written by a content team.
          </h2>
        </header>

        <div className="grid gap-12 lg:grid-cols-[60fr_40fr] items-start">
          <div className="flex flex-col gap-8">
            <Graf keyLabel="§ 01">
              <Lede>Authored by AI engineers who ship to production</Lede>{" "}
              at AkomzyAi Consulting and partner clients. The reference set is
              the one you actually use on a Tuesday — <CodeChip>MCP</CodeChip>,{" "}
              <CodeChip>LangGraph</CodeChip>, eval-driven development — not a
              re-tread of generic prompt-engineering tips you could have found
              in a Medium post.
            </Graf>

            <Graf keyLabel="§ 02">
              <Lede>Playbooks that are actually useful.</Lede> Eval rubrics.
              Prompt versioning docs. RAG architecture decision records.
              Hallucination test plans. Cost analysis templates. The artefacts
              a senior engineer would hand you if you asked — annotated with
              the reasoning, not just the shape. Not &ldquo;tips for working
              with AI.&rdquo;
            </Graf>

            <Graf keyLabel="§ 03">
              <Lede>
                Updated continuously because the field moves weekly.
              </Lede>{" "}
              A static course is dead the day it's published; the eval
              framework you learn on Monday will have a new contender by
              Thursday. FirstNinety_ai is a living surface — the playbook a
              colleague would rewrite for you when the ground shifts, not a
              PDF that ages in a Drive folder.
            </Graf>
          </div>

          <aside
            aria-label="Editorial pull quote"
            className="border-l border-paper-3 pl-8 py-2 flex flex-col gap-4 lg:sticky lg:top-24"
          >
            <p
              className="font-display italic text-ink text-balance relative"
              style={{
                fontSize: "clamp(1.375rem, 2.2vw, 1.625rem)",
                lineHeight: 1.35,
              }}
            >
              <span
                aria-hidden
                className="block font-display text-mute-2 mb-3"
                style={{ fontSize: "60px", lineHeight: 0.6 }}
              >
                &ldquo;
              </span>
              The job is not to know everything. The job is to be the person
              in the room who knows what they don't know — and what to do
              about it.
            </p>
            <p className="font-body text-caption text-mute">
              <span className="text-ink font-medium">Margin note</span> ·
              authored, not generated · v.1.0
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Clarify() {
  return (
    <section id="aie-clarify" className="pt-16 pb-24">
      <div className="mx-auto w-full max-w-[45rem] px-8">
        <div className="border-t border-paper-3 pt-16">
          <span className="text-eyebrow block mb-6">One clarification</span>
          <h3 className="font-display font-normal text-ink text-balance max-w-[26ch] mb-6 text-[clamp(1.75rem,3.2vw,2.25rem)] leading-[1.2]">
            This is not a course.
          </h3>
          <p className="font-body text-body-l text-mute leading-relaxed">
            You've finished a course. You've shipped a side project. You've
            signed an offer.{" "}
            <strong className="text-ink font-medium">
              This is what comes next
            </strong>{" "}
            — the 90 days where you learn to work as an AI engineer inside a
            real organisation, with real stakeholders, real budgets, and real
            consequences. Bootcamp teaches you what AI can do. FirstNinety_ai
            teaches you how to be the person responsible for it in the room.
          </p>
        </div>
      </div>
    </section>
  );
}

function PricingBand() {
  return (
    <section
      id="aie-pricing"
      className="bg-paper-2 border-t border-b border-paper-3 mt-16 py-24 md:py-32"
    >
      <div className="mx-auto w-full max-w-[45rem] px-8 text-center">
        <span className="text-eyebrow block mb-4">Pricing</span>
        <h2 className="font-display font-normal text-ink mx-auto max-w-[18ch] text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.15]">
          $39.99 per month.
        </h2>
        <p className="text-body-l text-mute mx-auto max-w-[60ch] mt-6 mb-10 leading-relaxed">
          The first three months of FirstNinety cost $120. The difference
          between losing your first tech job and keeping it costs less than
          one human coaching session per month.{" "}
          <strong className="text-ink font-medium">
            That&rsquo;s the comparison worth making.
          </strong>
        </p>

        <div className="text-left mx-auto max-w-[540px] mb-10 border-t border-paper-3">
          <CompareRow
            label="One session with a human career coach"
            value="$150–$300"
          />
          <CompareRow label="BetterUp Plus (monthly)" value="$149" />
          <CompareRow label="ChatGPT Plus (monthly)" value="$20" />
          <CompareRow
            label="FirstNinety_ai Pro (monthly)"
            value={
              <>
                <span className="text-accent">$39.99</span>
              </>
            }
            highlight
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register?role=aie"
            className="inline-flex h-12 items-center justify-center bg-ink text-paper px-5 font-medium transition-opacity hover:opacity-90"
            style={{ borderRadius: "4px" }}
          >
            Begin (free)
          </Link>
          <Link
            href="/pricing"
            className="text-body font-medium text-ink border-b border-paper-3 hover:border-ink transition-colors pb-0.5"
          >
            See full pricing <span className="ml-1">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Graf({
  keyLabel,
  children,
}: {
  keyLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[64px_1fr] gap-5 items-baseline pt-6 border-t border-paper-3 first:border-t-0 first:pt-0">
      <span className="font-mono text-caption text-mute-2 tracking-wider pt-2 uppercase">
        {keyLabel}
      </span>
      <p
        className="font-body font-normal text-ink leading-relaxed text-balance"
        style={{ fontSize: "17px", lineHeight: 1.65 }}
      >
        {children}
      </p>
    </div>
  );
}

function Lede({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-display font-normal text-ink"
      style={{ fontSize: "20px", letterSpacing: "-0.005em" }}
    >
      {children}
    </span>
  );
}

function CodeChip({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono not-italic text-ink bg-paper-2 border border-paper-3 px-1.5 py-px text-[0.92em] tracking-normal rounded-[3px]">
      {children}
    </code>
  );
}

function CompareRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-4 border-b border-paper-3">
      <span
        className={`text-body-s ${
          highlight ? "text-ink font-medium" : "text-mute"
        }`}
      >
        {label}
      </span>
      <span
        className={`font-mono tracking-wide ${
          highlight ? "text-ink font-semibold text-body-s" : "text-mute text-caption"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
