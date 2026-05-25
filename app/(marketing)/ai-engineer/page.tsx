/**
 * Dedicated For-AI-Engineers landing — matches the prototype:
 * dark (--ink) full-bleed hero with the First90 wordmark + Geist Mono
 * "_ai" accent, sparse tagline lines, single paper CTA.
 *
 * Dark mode is the default signal for the AI Engineer track per Design
 * Brief §4.2. Full-content sections (technical reading list, AIE-specific
 * scenarios) land in Build Prompt 4.4.
 */
import Link from "next/link";

export const metadata = {
  title: "For AI Engineers",
};

export default function AIEngineerPage() {
  return (
    // Negative margins pull the section out of the marketing layout's
    // padding so the dark slab goes edge-to-edge.
    <section
      className="-mx-4 md:-mx-6 bg-ink text-paper py-8 md:py-7 flex flex-col items-center gap-7 text-center"
    >
      <p className="text-eyebrow text-paper-3">For AI Engineers</p>

      <h1 className="relative flex items-start gap-3 md:gap-4">
        <span className="font-display font-normal italic text-[14vw] md:text-[10rem] leading-[0.95] text-paper">
          First
        </span>
        <span className="font-display font-semibold text-[14vw] md:text-[10rem] leading-[0.95] text-paper">
          90
        </span>
        <span
          className="pointer-events-none absolute left-[10%] bottom-[10%] size-[4vw] md:size-10 rounded-full bg-accent"
          aria-hidden
        />
        <span className="sr-only">FirstNinety</span>
      </h1>

      <p className="font-mono text-accent text-h2 tracking-[0.1em] uppercase">
        _ai
      </p>

      <p className="font-display italic text-h3 text-paper-3 max-w-prose">
        The first ninety days, calibrated for the people shipping the
        models — not the people writing about them.
      </p>

      <div className="flex flex-col gap-4 text-body-l text-paper-3 max-w-prose">
        <p>
          Most AI engineering training stops at the eval rubric. The job
          starts there. The first failure of an inference pipeline in
          production. The first time a stakeholder asks why a metric you
          do not control moved. The first quarterly that asks for a
          number, not a benchmark.
        </p>
        <p>
          FirstNinety_ai runs on the same coach, the same Situation Room,
          the same Mission Track — calibrated for the AIE role at week 1,
          week 6, week 12. The scenarios are written by practitioners who
          have shipped LLM features behind real SLAs.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/register?role=aie"
          className="inline-flex h-12 items-center justify-center bg-paper text-ink px-5 font-medium hover:opacity-90 transition-opacity min-w-[220px]"
          style={{ borderRadius: "4px" }}
        >
          Begin (free)
        </Link>
        <Link
          href="/#how-it-works"
          className="inline-flex h-12 items-center justify-center px-3 text-body text-paper hover:text-paper-3 transition-colors"
        >
          How it works →
        </Link>
      </div>

      <p className="text-caption text-paper-3 mt-3">
        $39.99 / month after trial · no credit card to start
      </p>
    </section>
  );
}
