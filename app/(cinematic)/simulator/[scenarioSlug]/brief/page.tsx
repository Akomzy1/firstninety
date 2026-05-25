/**
 * Simulator brief — the cinematic signature surface.
 *
 * Per Design Brief §10 + Design Prompts C5 / rendered prototype
 * `firstninety-simulator-brief.html`:
 *
 *   - Full-bleed ink canvas (handled by `(cinematic)` layout).
 *   - No header / nav chrome — the route group bypasses (app).
 *   - Single 720px column, generous top/bottom padding.
 *   - Editorial brief copy in Fraunces italic body L, mute paper.
 *   - 80px persona monograms (larger than the active session uses).
 *   - "Begin" is the only CTA — paper border on transparent, hover
 *     flips to paper bg + ink text.
 *
 * Tier gate runs *before* render: free-tier users at the 4-run
 * lifetime ceiling never see the brief; they land on a denial
 * surface that routes them to billing.
 */
import { notFound } from "next/navigation";

import { TierLimitPrompt } from "@/components/billing/TierLimitPrompt";
import { PersonaMonogram } from "@/components/simulator/PersonaMonogram";
import { requireAuth } from "@/lib/auth/server";
import {
  checkTierAllowance,
  type TierAllowance,
} from "@/lib/billing/tier";
import { createClient } from "@/lib/db/server";

import { startScenarioRunAction } from "../../../../(app)/simulator/actions";

type PageProps = {
  params: Promise<{ scenarioSlug: string }>;
};

type Persona = {
  name: string;
  role: string;
  monogram: string;
  colour: string;
};

export async function generateMetadata({ params }: PageProps) {
  const { scenarioSlug } = await params;
  return { title: `Scenario · ${scenarioSlug}` };
}

const ROLE_LABEL: Record<string, string> = {
  ba: "Business Analyst",
  pm: "Project Manager",
  sm: "Scrum Master",
  po: "Product Owner",
  da: "Data Analyst",
  aie: "AI Engineer",
};

export default async function ScenarioBriefPage({ params }: PageProps) {
  const { scenarioSlug } = await params;
  const user = await requireAuth();
  const supabase = await createClient();

  const allowance = await checkTierAllowance(user.id, "simulator");
  const { data: scenario } = await supabase
    .from("scenarios")
    .select(
      "id, slug, role, title, brief, objective, personas, estimated_minutes",
    )
    .eq("slug", scenarioSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (!scenario) notFound();

  const personas = (Array.isArray(scenario.personas)
    ? scenario.personas
    : []) as unknown as Persona[];

  // Brief is markdown-ish with `## Section` headings. Render headings
  // as eyebrows; paragraphs as Fraunces italic body. Keep the renderer
  // tight — the brief field is editorial, not arbitrary markdown.
  const briefBlocks = parseBrief(scenario.brief);

  return (
    <main className="mx-auto w-full max-w-[720px] px-6 md:px-8 py-20 md:py-28 flex flex-col gap-10">
      {!allowance.allowed ? (
        <DenialBlock allowance={allowance} />
      ) : (
        <>
          <header className="flex flex-col gap-6">
            <p className="text-eyebrow text-mute-2">
              {(ROLE_LABEL[scenario.role] ?? scenario.role.toUpperCase()) +
                " — Scenario"}
            </p>
            <h1
              className="font-display font-normal text-balance text-ink leading-[1.05]"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                letterSpacing: "-0.02em",
              }}
            >
              {scenario.title}.
            </h1>
          </header>

          <section className="flex flex-col gap-4">
            {briefBlocks.map((block, i) =>
              block.type === "heading" ? (
                <p key={i} className="text-eyebrow text-mute-2">
                  {block.text}
                </p>
              ) : (
                <p
                  key={i}
                  className="font-display italic text-mute text-balance"
                  style={{
                    fontSize: "19px",
                    lineHeight: 1.55,
                    maxWidth: "65ch",
                  }}
                >
                  {block.text}
                </p>
              ),
            )}
          </section>

          {personas.length > 0 ? (
            <section className="flex flex-col gap-4">
              <p className="text-eyebrow text-mute-2">In the room</p>
              <div className="flex flex-col gap-4">
                {personas.map((p) => (
                  <div key={p.name} className="flex items-center gap-4">
                    <PersonaMonogram
                      initials={p.monogram}
                      colour={p.colour}
                      size="lg"
                    />
                    <div className="flex flex-col">
                      <span
                        className="font-display text-paper"
                        style={{
                          fontSize: "20px",
                          fontWeight: 500,
                          letterSpacing: "-0.005em",
                        }}
                      >
                        {p.name}
                      </span>
                      <span className="text-body-s text-mute">{p.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="flex flex-col gap-3">
            <p className="text-eyebrow text-mute-2">Objective</p>
            <p
              className="font-display italic text-ink text-balance"
              style={{
                fontSize: "22px",
                lineHeight: 1.45,
                letterSpacing: "-0.005em",
              }}
            >
              {scenario.objective}
            </p>
          </section>

          <section className="flex flex-col gap-4 items-start mt-4">
            <form action={startScenarioRunAction}>
              <input
                type="hidden"
                name="scenario_slug"
                value={scenario.slug}
              />
              <button
                type="submit"
                className="inline-flex h-14 items-center justify-center gap-3 px-8 text-body font-medium text-ink bg-paper border border-paper transition-colors hover:bg-transparent hover:text-paper"
                style={{ borderRadius: "4px", minWidth: "200px" }}
                autoFocus
              >
                Begin
                <span aria-hidden>&rarr;</span>
              </button>
            </form>
            <p className="font-display italic text-mute text-caption">
              This will take about {scenario.estimated_minutes}&ndash;
              {scenario.estimated_minutes + 5} minutes.{" "}
              <span
                className="font-mono not-italic"
                style={{ fontSize: "11px" }}
              >
                Cmd-K
              </span>{" "}
              to exit any time.
            </p>
          </section>
        </>
      )}
    </main>
  );
}

function DenialBlock({
  allowance,
}: {
  allowance: Exclude<TierAllowance, { allowed: true }>;
}) {
  return (
    <section className="flex flex-col gap-6 mt-10">
      <p className="text-eyebrow text-mute-2">Simulator</p>
      <h1 className="text-h1 text-balance text-ink">
        Your free Simulator runs are spent.
      </h1>
      <p className="text-body-l text-mute max-w-prose">
        The brief is on the other side of an upgrade. Pro unlocks every
        scenario across every role and the full debrief library &mdash;
        and you can cancel any time.
      </p>
      <div className="mt-2">
        <TierLimitPrompt allowance={allowance} variant="inline" />
      </div>
    </section>
  );
}

type BriefBlock =
  | { type: "heading"; text: string }
  | { type: "para"; text: string };

function parseBrief(brief: string): BriefBlock[] {
  const blocks: BriefBlock[] = [];
  const lines = brief.split(/\r?\n/);
  let buffer: string[] = [];
  const flush = () => {
    if (buffer.length === 0) return;
    const joined = buffer.join("\n").trim();
    if (joined.length > 0) blocks.push({ type: "para", text: joined });
    buffer = [];
  };
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("##")) {
      flush();
      blocks.push({
        type: "heading",
        text: trimmed.replace(/^#+\s*/, ""),
      });
    } else if (trimmed.length === 0) {
      flush();
    } else {
      buffer.push(line);
    }
  }
  flush();
  return blocks;
}
