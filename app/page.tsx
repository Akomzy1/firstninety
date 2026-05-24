/**
 * Design system reference page.
 *
 * Temporary surface used during Phase 0 to verify Design Brief tokens are
 * live: colour palette, type scale, three button variants. Replaced by the
 * real marketing landing in Prompt 4.3.
 */

const swatches = [
  { name: "ink", token: "--ink", desc: "Primary text, dark surfaces, CTA bg" },
  { name: "paper", token: "--paper", desc: "Page background — warm bone" },
  { name: "paper-2", token: "--paper-2", desc: "Elevated card surfaces" },
  { name: "paper-3", token: "--paper-3", desc: "Borders, dividers, muted UI" },
  { name: "mute", token: "--mute", desc: "Secondary text, captions" },
  { name: "mute-2", token: "--mute-2", desc: "Tertiary, disabled" },
  { name: "accent", token: "--accent", desc: "Warm coral — used sparingly" },
  { name: "accent-soft", token: "--accent-soft", desc: "Accent backgrounds" },
  { name: "success", token: "--success", desc: "Completion / green-flag" },
  { name: "warn", token: "--warn", desc: "Yellow-flag / attention" },
  { name: "danger", token: "--danger", desc: "Errors, destructive actions" },
] as const;

const typeSamples = [
  { utility: "text-display", label: "Display", sample: "Survive the first ninety." },
  { utility: "text-h1", label: "H1", sample: "Today is about landing softly." },
  { utility: "text-h2", label: "H2", sample: "What I remember." },
  { utility: "text-h3", label: "H3", sample: "Week six — second sprint." },
  { utility: "text-h4", label: "H4", sample: "Mission three of four." },
  {
    utility: "text-body-l",
    label: "Body L",
    sample:
      "You don't need to do everything today. You need to land softly, listen carefully, and notice what's actually being asked of you.",
  },
  {
    utility: "text-body",
    label: "Body",
    sample:
      "FirstNinety helps freshly trained tech professionals survive their first 90 days in a new role.",
  },
  {
    utility: "text-body-s",
    label: "Body S",
    sample: "Used for dense lists, table cells, and secondary surfaces where space is tight.",
  },
  { utility: "text-caption", label: "Caption", sample: "Completed three days ago" },
  { utility: "text-eyebrow", label: "Eyebrow", sample: "Day 1 — week 1" },
] as const;

export default function DesignSystemReferencePage() {
  return (
    <main className="mx-auto max-w-(--max-page) px-4 py-6 md:px-6 md:py-8">
      <header className="mb-6">
        <p className="text-eyebrow">Design system reference</p>
        <h1 className="text-h1 mt-2 text-balance">FirstNinety design system.</h1>
        <p className="text-body-l mt-3 max-w-(--max-reading) text-mute">
          Temporary surface for Phase 0. Verifies that Design Brief tokens are
          live: paper sits at <code className="font-mono text-body-s">#FAF7F2</code>,
          ink at <code className="font-mono text-body-s">#0E1116</code>, Fraunces on
          the H1, Inter on this paragraph. Replaced by the real marketing landing
          in Prompt 4.3.
        </p>
      </header>

      {/* Colour palette — 11 swatches */}
      <section className="mt-7">
        <p className="text-eyebrow">Colour</p>
        <h2 className="text-h2 mt-2">Palette.</h2>
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {swatches.map((s) => (
            <li
              key={s.name}
              className="rounded-lg border border-paper-3 bg-paper p-3"
            >
              <div
                className="h-16 rounded-md border border-paper-3"
                style={{ background: `var(${s.token})` }}
                aria-hidden
              />
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span className="text-body font-mono">{s.name}</span>
                <span className="text-body-s font-mono text-mute">{s.token}</span>
              </div>
              <p className="text-body-s mt-1 text-mute">{s.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Type scale — all 10 utilities */}
      <section className="mt-7">
        <p className="text-eyebrow">Type</p>
        <h2 className="text-h2 mt-2">Scale.</h2>
        <ul className="mt-4 divide-y divide-paper-3 border-y border-paper-3">
          {typeSamples.map((t) => (
            <li
              key={t.utility}
              className="grid grid-cols-[8rem_1fr] gap-3 py-3 md:gap-4"
            >
              <span className="text-caption text-mute self-center font-mono">
                {t.label}
              </span>
              <p className={t.utility}>{t.sample}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Buttons — three variants, hand-rolled until shadcn lands */}
      <section className="mt-7 mb-8">
        <p className="text-eyebrow">Components</p>
        <h2 className="text-h2 mt-2">Buttons.</h2>
        <p className="text-body mt-2 text-mute">
          Three variants only. No rounded-pill. No drop shadow.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex h-12 items-center justify-center bg-ink px-3 text-paper transition-colors hover:opacity-90"
            style={{ borderRadius: "4px" }}
          >
            Primary
          </button>
          <button
            type="button"
            className="inline-flex h-12 items-center justify-center border border-ink bg-transparent px-3 text-ink transition-colors hover:bg-ink hover:text-paper"
            style={{ borderRadius: "4px" }}
          >
            Secondary
          </button>
          <button
            type="button"
            className="inline-flex h-12 items-center justify-center bg-transparent px-3 text-ink transition-colors hover:bg-paper-2"
            style={{ borderRadius: "4px" }}
          >
            Ghost
          </button>
        </div>
      </section>
    </main>
  );
}
