/**
 * Marketing landing — matches the Marketing Landing v2.0 prototype.
 *
 * Sections: Hero · Why this exists · Six tools (How it works) · Pricing.
 * Footer + header chrome come from the (marketing) layout.
 */
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { ScrollDepthTracker } from "@/components/marketing/ScrollDepthTracker";

const TRACKED_SECTIONS = [
  "hero",
  "why-this-exists",
  "how-it-works",
  "tool-situation-room",
  "tool-simulator",
  "tool-coach",
  "tool-playbook",
  "tool-mission-track",
  "tool-probation-prep",
  "pricing",
] as const;

export default function MarketingLandingPage() {
  return (
    <>
      <HeroSection />
      <WhyThisExistsSection />
      <SixToolsSection />
      <PricingSection />
      <ScrollDepthTracker sectionIds={TRACKED_SECTIONS} />
    </>
  );
}

/* ----------------------------------------------------------------------- *
 * Hero
 * ----------------------------------------------------------------------- */

function HeroSection() {
  return (
    <section
      id="hero"
      className="mx-auto max-w-(--max-reading) py-7 md:py-8 text-center flex flex-col items-center gap-5"
    >
      <p className="text-eyebrow inline-flex items-center gap-2 justify-center">
        <span className="size-1.5 rounded-full bg-accent" aria-hidden />
        For your first 90 days in a new tech role
      </p>

      <h1 className="text-display text-balance leading-[1.02]">
        The 90 days nobody
        <br />
        trained you for.
      </h1>

      <p className="text-body-l text-mute max-w-prose mt-2">
        FirstNinety is a private workplace coach for newly trained{" "}
        <strong className="text-ink font-medium">Business Analysts</strong>,{" "}
        <strong className="text-ink font-medium">Project Managers</strong>,{" "}
        <strong className="text-ink font-medium">Scrum Masters</strong>,{" "}
        <strong className="text-ink font-medium">Product Owners</strong>,{" "}
        <strong className="text-ink font-medium">Data Analysts</strong>, and{" "}
        <strong className="text-ink font-medium">AI Engineers</strong>.
        Available the moment you need it. Calibrated to your role, your
        week, and the review at the end of it.
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
        <Link href="/register">
          <Button variant="primary" size="lg" className="min-w-[180px]">
            Begin (free)
          </Button>
        </Link>
        <Link
          href="#how-it-works"
          className="inline-flex h-12 items-center justify-center px-3 text-body text-ink hover:text-mute transition-colors"
        >
          How it works →
        </Link>
      </div>

      <p className="text-caption text-mute mt-3 flex flex-wrap items-center justify-center gap-2">
        <span>· No credit card to start</span>
        <span>· Cancel any time</span>
        <span>· $39.99 / month after trial</span>
      </p>
    </section>
  );
}

/* ----------------------------------------------------------------------- *
 * Why this exists
 * ----------------------------------------------------------------------- */

function WhyThisExistsSection() {
  return (
    <section
      id="why-this-exists"
      className="mx-auto max-w-(--max-reading) py-7 md:py-8 flex flex-col gap-5 border-t border-paper-3"
    >
      <header className="flex flex-col gap-2">
        <p className="text-eyebrow">Why this exists</p>
        <h2 className="text-h1 text-balance">
          Training ends. The job doesn&rsquo;t.
        </h2>
      </header>

      <div className="flex flex-col gap-5 text-body-l text-ink">
        <p>
          On Monday morning you are asked for a business requirements
          document, a sprint backlog, a dashboard spec — something you have
          studied but never produced under pressure.{" "}
          <em className="font-display italic">The page is blank.</em> Your
          bootcamp showed you the finished artefact; it could not show you
          how senior practitioners actually start, which paragraph to
          write first, or what to do when the sponsor cannot articulate
          what they want.
        </p>
        <p>
          Twenty minutes before a workshop the questions sharpen. The lead
          developer thinks the meeting is a waste of time. Compliance has
          not been briefed. Two stakeholders will arrive late.{" "}
          <em className="font-display italic">You are walking in live</em>,
          and the calm advice in the textbook is not pitched at thirty
          minutes from now. You need a sentence to open the room and a way
          to land the requirement that matters before scope is hijacked by
          the loudest voice.
        </p>
        <p>
          Then comes the quiet kind of doubt that does not surface in
          standups. Your manager said something terse in 1:1. A peer was
          promoted off the team. The Slack channel went silent after your
          last update.{" "}
          <em className="font-display italic">
            Is this normal, or is this a signal?
          </em>{" "}
          You cannot ask the people around you without admitting you do
          not know — so you ask no one, and the worry compounds.
        </p>
        <p>
          And then, somewhere around Day 70, a single conversation gets
          booked into your calendar — the one that decides whether you
          keep the job.{" "}
          <em className="font-display italic">
            The first 90 days are the rehearsal. Your probation review is
            the performance.
          </em>
        </p>
      </div>

      <p className="font-display italic text-body-l text-mute pt-4 border-t border-paper-3 mt-2">
        FirstNinety is built for this gap.
      </p>
    </section>
  );
}

/* ----------------------------------------------------------------------- *
 * Six tools. One purpose.
 * ----------------------------------------------------------------------- */

function SixToolsSection() {
  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-(--max-page) py-7 md:py-8 flex flex-col gap-7 border-t border-paper-3"
    >
      <header className="max-w-(--max-reading) flex flex-col gap-2">
        <p className="text-eyebrow">How it works</p>
        <h2 className="text-h1 text-balance">Six tools. One purpose.</h2>
        <p className="text-body-l text-mute mt-2 max-w-prose">
          A small, deliberate kit for the moments training did not prepare
          you for — running on the same coach, calibrated to your role and
          the week you are on.
        </p>
      </header>

      <div className="flex flex-col gap-7 mt-4">
        <ToolRow
          id="tool-situation-room"
          number="01"
          tag="On-demand"
          title="Situation Room"
          body={
            <>
              <p>
                One field. Three soft labels above it —{" "}
                <em className="font-display italic">
                  I need help with this, is this normal?, I just did
                  something
                </em>
                .{" "}
                <strong className="text-ink font-medium">
                  You write the sentence you would otherwise text a senior
                  colleague
                </strong>
                , and the coach answers in their register, not a chatbot&rsquo;s.
              </p>
              <p>
                It is built for the twenty minutes before a workshop and
                the twenty minutes after a 1:1 went strangely. No chrome,
                no menu, no warm-up. Just the question and an answer that
                respects your time.
              </p>
            </>
          }
          illustration={<SituationRoomCard />}
        />

        <ToolRow
          id="tool-simulator"
          number="02"
          tag="Rehearsal"
          title="Scenario Simulator"
          body={
            <>
              <p>
                Rehearse the meeting before you walk in. Each scenario is
                a piece of editorial fiction with a specific objective, a
                specific antagonist, and a rubric —{" "}
                <strong className="text-ink font-medium">
                  green flags, yellow flags, red flags
                </strong>{" "}
                — so the debrief tells you, honestly, what you did and
                what to try next time.
              </p>
              <p>
                Personas are archetypes, not characters. The hostile lead
                dev. The vague sponsor. The cautious compliance lead. They
                stay in role; they will not magically agree because you
                are polite.
              </p>
            </>
          }
          illustration={<SimulatorCard />}
          illustrationFirst
        />

        <ToolRow
          id="tool-coach"
          number="03"
          tag="Conversation"
          title="AI Coach"
          body={
            <>
              <p>
                The engine underneath the rest. It speaks like a senior
                colleague who has watched you survive the bad day before —{" "}
                <strong className="text-ink font-medium">
                  direct, dry, occasionally warm, never patronising
                </strong>
                . It will disagree with you when it should.
              </p>
              <p>
                No &ldquo;great question.&rdquo; No life-advice mode. No
                emoji. It stays scoped to tradecraft and to the role and
                week you are in, and defaults to specific examples over
                abstract advice.
              </p>
            </>
          }
          illustration={<CoachCard />}
        />

        <ToolRow
          id="tool-playbook"
          number="04"
          tag="Worked examples"
          title="Playbook Library"
          body={
            <>
              <p>
                Worked examples, not empty templates. A BRD is generic;{" "}
                <strong className="text-ink font-medium">
                  a BRD with margin notes explaining why each section is
                  written the way it is
                </strong>{" "}
                — that&rsquo;s the Playbook. Annotations are written in
                the voice of a senior practitioner showing their
                reasoning, not lecturing.
              </p>
              <p>
                Two variants per artefact, at minimum: greenfield and
                regulatory. Plus the common mistakes a junior is most
                likely to make, named by name.
              </p>
            </>
          }
          illustration={<PlaybookCard />}
          illustrationFirst
        />

        <ToolRow
          id="tool-mission-track"
          number="05"
          tag="90-day programme"
          title="90-Day Mission Track"
          body={
            <>
              <p>
                Thirteen weeks of structured missions, each 15 to 30
                minutes, sequenced to where you actually are.{" "}
                <strong className="text-ink font-medium">
                  Week 1 is &ldquo;land softly&rdquo;.
                </strong>{" "}
                Week 7 is the mid-probation recalibration. Week 12 is your
                end-of-probation prep.
              </p>
              <p>
                Day 1 is almost entirely empty by design — a single
                mission card, the rest of the week visible but greyed. We
                are not throwing 90 days at you. We are starting with
                today.
              </p>
            </>
          }
          illustration={<MissionTrackCard />}
        />

        <ToolRow
          id="tool-probation-prep"
          number="06"
          tag="For the final 21 days"
          title="Probation Prep Mode."
          body={
            <>
              <p>
                Three weeks before your probation review, FirstNinety
                sharpens around the conversation. The Coach changes voice.
                The Mission Track changes shape.{" "}
                <strong className="text-ink font-medium">
                  A one-page Brief gets drafted from everything you have
                  done these 90 days
                </strong>{" "}
                — the work, the conversations, the moments that mattered.
              </p>
              <p>
                Most probation reviews are decided weeks before the review
                itself. The conversation just confirms what your manager
                already thinks.{" "}
                <em className="font-display italic">
                  The 21 days that matter most are the ones before the
                  room.
                </em>
              </p>
            </>
          }
          illustration={<ProbationBriefCard />}
          illustrationFirst
        />
      </div>
    </section>
  );
}

function ToolRow({
  id,
  number,
  tag,
  title,
  body,
  illustration,
  illustrationFirst = false,
}: {
  id: string;
  number: string;
  tag: string;
  title: string;
  body: React.ReactNode;
  illustration: React.ReactNode;
  illustrationFirst?: boolean;
}) {
  const text = (
    <div className="flex flex-col gap-3 max-w-(--max-reading)">
      <p className="text-eyebrow flex items-center gap-3">
        <span className="text-mute">{number}</span>
        <span className="text-accent">{tag}</span>
      </p>
      <h3 className="text-h2 text-balance">{title}</h3>
      <div className="flex flex-col gap-3 text-body-l text-ink mt-2">
        {body}
      </div>
    </div>
  );

  return (
    <div
      id={id}
      className="grid grid-cols-1 lg:grid-cols-2 gap-7 items-center border-t border-paper-3 pt-7 first:border-t-0 first:pt-0 scroll-mt-20"
    >
      {illustrationFirst ? (
        <>
          <div className="order-2 lg:order-1">{illustration}</div>
          <div className="order-1 lg:order-2">{text}</div>
        </>
      ) : (
        <>
          {text}
          {illustration}
        </>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------- *
 * Illustration cards — small representational mockups of each surface.
 * ----------------------------------------------------------------------- */

function SituationRoomCard() {
  return (
    <div
      className="bg-paper-2 border border-paper-3 p-5 md:p-6 flex flex-col gap-4"
      style={{ borderRadius: "10px" }}
    >
      <div className="flex items-center justify-between text-caption text-mute font-mono">
        <span className="flex gap-3">
          <span className="text-ink border-b-2 border-ink pb-1">
            I need help with this
          </span>
          <span>Is this normal?</span>
          <span>I just did something</span>
        </span>
        <span className="text-mute-2">situation-room.tsx</span>
      </div>
      <p className="font-display text-h3 text-ink">
        Workshop in 20 min. Lead dev doesn&rsquo;t want to be there<span className="inline-block w-0.5 h-5 bg-ink align-middle animate-pulse" />
      </p>
      <div className="flex items-center justify-between text-body-s text-mute border-t border-paper-3 pt-3">
        <span>Anonymise names. Be specific.</span>
        <span className="border border-paper-3 bg-paper px-2 py-1 font-mono text-caption" style={{ borderRadius: "4px" }}>
          ↵ Enter
        </span>
      </div>
    </div>
  );
}

function SimulatorCard() {
  const PERSONAS: Array<{ initials: string; name: string; role: string; tone: string }> = [
    { initials: "SA", name: "Sam", role: "lead dev", tone: "bg-[#6F7A86]" },
    { initials: "PR", name: "Priya", role: "sponsor", tone: "bg-[#3E6D52]" },
    { initials: "MA", name: "Marcus", role: "compliance", tone: "bg-[#A66A1F]" },
  ];
  return (
    <div
      className="bg-paper-2 border border-paper-3 p-5 md:p-6 flex flex-col gap-4 items-center text-center"
      style={{ borderRadius: "10px" }}
    >
      <div className="w-full flex items-center justify-end text-caption text-mute font-mono">
        scenario · the hostile lead dev
      </div>
      <ul className="flex gap-4 mt-1">
        {PERSONAS.map((p) => (
          <li key={p.initials} className="flex flex-col items-center gap-1">
            <span
              className={`grid size-12 place-items-center rounded-full text-paper font-display ${p.tone}`}
            >
              {p.initials}
            </span>
            <span className="text-caption text-mute">
              {p.name} · {p.role}
            </span>
          </li>
        ))}
      </ul>
      <p className="font-display text-h3 text-ink mt-2 max-w-xs">
        Capture the top five requirements without losing the room.
      </p>
      <p className="text-caption text-mute">30 minutes · BA · week 4</p>
      <Button variant="primary" size="md" className="mt-2 min-w-[120px]">
        Begin
      </Button>
    </div>
  );
}

function CoachCard() {
  return (
    <div
      className="bg-paper-2 border border-paper-3 p-5 md:p-6 flex flex-col gap-4"
      style={{ borderRadius: "10px" }}
    >
      <div className="text-caption text-mute font-mono text-right">
        coach · debrief
      </div>
      <div className="flex justify-end">
        <div className="bg-ink text-paper p-3 max-w-xs" style={{ borderRadius: "8px" }}>
          <p className="text-caption opacity-70 mb-1">YOU</p>
          <p className="text-body-s">The standup ran long again. I let it.</p>
        </div>
      </div>
      <div className="bg-paper border border-paper-3 p-3 max-w-md" style={{ borderRadius: "8px" }}>
        <p className="text-caption text-mute mb-1">COACH</p>
        <p className="font-display italic text-body text-ink">
          &ldquo;You held the room. You also let Marcus&rsquo;s compliance
          question slip — in a real workshop that comes back, often after
          the room is empty.&rdquo;
        </p>
      </div>
      <p className="text-caption text-mute">
        <span className="text-accent">·</span> Pulling the BRD playbook ·
        margin note #2
      </p>
    </div>
  );
}

function PlaybookCard() {
  return (
    <div
      className="bg-paper-2 border border-paper-3 p-5 md:p-6 flex flex-col gap-4"
      style={{ borderRadius: "10px" }}
    >
      <div className="text-caption text-mute font-mono text-right">
        brd · regulatory variant
      </div>
      <div className="grid grid-cols-[1fr_1px_1fr] gap-4">
        <div className="flex flex-col gap-3">
          <h4 className="font-display text-h4 text-ink">
            2. Compliance & data residency
          </h4>
          <div className="space-y-2">
            <div className="h-2 bg-paper-3 rounded" style={{ width: "85%" }} />
            <div className="h-2 bg-paper-3 rounded" style={{ width: "75%" }} />
            <div className="h-2 bg-accent-soft rounded" style={{ width: "60%" }} />
          </div>
          <h4 className="font-display text-h4 text-ink mt-3">3. Stakeholders</h4>
          <div className="space-y-2">
            <div className="h-2 bg-paper-3 rounded" style={{ width: "80%" }} />
            <div className="h-2 bg-paper-3 rounded" style={{ width: "65%" }} />
          </div>
        </div>
        <div className="bg-paper-3" />
        <div className="flex flex-col gap-4 pl-2 border-l border-l-accent">
          <div>
            <p className="text-caption text-accent font-medium font-mono">
              MARGIN · §2
            </p>
            <p className="font-display italic text-body-s text-mute mt-1">
              Lead with the constraint. The sponsor will try to relegate
              this to an appendix; do not let them.
            </p>
          </div>
          <div>
            <p className="text-caption text-accent font-medium font-mono">
              MARGIN · §3
            </p>
            <p className="font-display italic text-body-s text-mute mt-1">
              Name the person who can stop the project. Then name the
              person who will.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MissionTrackCard() {
  return (
    <div
      className="bg-paper-2 border border-paper-3 p-4 md:p-5 flex flex-col gap-3"
      style={{ borderRadius: "10px" }}
    >
      <div className="text-caption text-mute font-mono text-right">
        week 4 · BA
      </div>
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        <article
          className="bg-paper border border-paper-3 p-3 flex flex-col gap-2 opacity-70 min-h-[200px]"
          style={{ borderRadius: "8px" }}
        >
          <p className="text-caption text-mute leading-tight">Mon · day 22</p>
          <p className="font-display text-body-s text-ink leading-snug">
            Send the workshop agenda
          </p>
          <p className="text-caption text-mute mt-auto leading-tight">
            15 min · done
          </p>
          <div className="size-5 rounded-full bg-ink text-paper grid place-items-center text-caption">
            ✓
          </div>
        </article>
        <article
          className="bg-paper border-2 border-ink p-3 flex flex-col gap-2 min-h-[200px]"
          style={{ borderRadius: "8px" }}
        >
          <p className="text-caption text-accent font-medium leading-tight">
            Tue · day 23 · today
          </p>
          <p className="font-display text-body-s text-ink leading-snug">
            Run your first requirements workshop
          </p>
          <p className="text-caption text-mute mt-auto leading-tight">
            30 min · simulator
          </p>
          <span
            className="size-4 rounded-full border-2 border-ink bg-paper"
            aria-hidden
          />
        </article>
        <article
          className="bg-paper border border-paper-3 p-3 flex flex-col gap-2 opacity-50 min-h-[200px]"
          style={{ borderRadius: "8px" }}
        >
          <p className="text-caption text-mute leading-tight">Wed · day 24</p>
          <p className="font-display text-body-s text-mute leading-snug">
            Debrief and circulate
          </p>
          <p className="text-caption text-mute mt-auto leading-tight">15 min</p>
          <span
            className="size-4 rounded-full border border-mute-2 bg-paper"
            aria-hidden
          />
        </article>
      </div>
    </div>
  );
}

function ProbationBriefCard() {
  return (
    <div
      className="bg-paper-2 border border-paper-3 p-5 md:p-6 flex flex-col gap-4"
      style={{ borderRadius: "10px" }}
    >
      <div className="text-caption text-mute font-mono text-right">
        probation-brief · day 78
      </div>
      <div
        className="bg-paper border border-paper-3 p-5 flex flex-col gap-4"
        style={{ borderRadius: "8px" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-eyebrow flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            Probation brief
          </p>
          <p className="text-caption font-mono text-mute">Draft · v2</p>
        </div>
        <h4 className="font-display text-h3 text-ink">
          Three things I have done that prove the hire.
        </h4>
        <ol className="flex flex-col gap-3">
          {[1, 2, 3].map((n) => (
            <li key={n} className="flex items-center gap-3">
              <span className="text-accent font-display text-h4">{n}.</span>
              <span
                className="h-2 bg-paper-3 rounded flex-1"
                style={{ maxWidth: "80%" }}
              />
            </li>
          ))}
        </ol>
        <div className="flex items-center justify-between text-caption text-mute font-mono border-t border-paper-3 pt-3">
          <span>BA · WEEK 12</span>
          <span>12 days to review</span>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- *
 * Pricing
 * ----------------------------------------------------------------------- */

function PricingSection() {
  return (
    <section
      id="pricing"
      className="mx-auto max-w-(--max-reading) py-7 md:py-8 flex flex-col items-center gap-5 text-center border-t border-paper-3"
    >
      <p className="text-eyebrow">Pricing</p>
      <h2 className="text-h1 text-balance">$39.99 per month.</h2>
      <p className="text-body-l text-mute max-w-prose">
        The first three months of FirstNinety cost $120. The difference
        between losing your first tech job and keeping it costs less than
        one human coaching session per month.{" "}
        <strong className="text-ink font-medium">
          That&rsquo;s the comparison worth making.
        </strong>
      </p>

      <div className="w-full max-w-md mt-4 border-t border-b border-paper-3 divide-y divide-paper-3">
        <PriceRow
          label="Human career coach — one session"
          price="$150–$300"
        />
        <PriceRow label="BetterUp Plus" price="$149" unit="/ mo" />
        <PriceRow label="ChatGPT Plus" price="$20" unit="/ mo" />
        <PriceRow
          label="FirstNinety Pro"
          price="$39.99"
          unit="/ mo"
          highlight
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <Link href="/register">
          <Button variant="primary" size="lg" className="min-w-[180px]">
            Begin (free)
          </Button>
        </Link>
        <Link
          href="/pricing"
          className="inline-flex h-12 items-center justify-center px-3 text-body text-ink hover:text-mute transition-colors"
        >
          See full pricing →
        </Link>
      </div>
    </section>
  );
}

function PriceRow({
  label,
  price,
  unit,
  highlight = false,
}: {
  label: string;
  price: string;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between py-3 text-left">
      <span
        className={`text-body ${highlight ? "text-ink font-medium" : "text-mute"}`}
      >
        {label}
      </span>
      <span className="flex items-baseline gap-2">
        <span
          className={`text-body font-medium ${highlight ? "text-accent" : "text-ink"}`}
        >
          {price}
        </span>
        {unit ? (
          <span className="text-body-s text-mute">{unit}</span>
        ) : null}
      </span>
    </div>
  );
}
