/**
 * Worked-example switcher + two-column reading layout.
 *
 * Multiple worked examples expose a small pill-style switcher; the
 * selected example renders its markdown on the left and its margin
 * annotations on the right, each annotation aligned with its target
 * section via a shared two-column grid row.
 *
 * Mobile collapses to single column with annotations rendered as
 * inline italic asides after the matching section.
 */
"use client";

import { useMemo, useState } from "react";

type Section = { id: string; index: number; title: string };
type Annotation = { section_id: string; note: string };

type Example = {
  title: string;
  annotations: Annotation[];
  rendered: { html: string; sections: Section[] };
};

type Props = { examples: Example[] };

export function WorkedExampleSwitcher({ examples }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = examples[activeIdx] ?? examples[0];
  if (!active) return null;

  return (
    <section className="flex flex-col gap-5">
      {examples.length > 1 ? (
        <nav
          className="flex flex-wrap gap-2"
          aria-label="Worked example switcher"
        >
          {examples.map((example, idx) => (
            <button
              key={example.title}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`px-3 py-1.5 border text-body-s transition-colors ${
                idx === activeIdx
                  ? "border-ink bg-ink text-paper"
                  : "border-paper-3 text-ink hover:border-mute"
              }`}
              style={{ borderRadius: "4px" }}
            >
              {example.title}
            </button>
          ))}
        </nav>
      ) : null}

      <TwoColumnReader example={active} />
    </section>
  );
}

function TwoColumnReader({ example }: { example: Example }) {
  // Build a map from section_id -> the annotation(s) that target it.
  const annotationMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const a of example.annotations) {
      const arr = map.get(a.section_id) ?? [];
      arr.push(a.note);
      map.set(a.section_id, arr);
    }
    return map;
  }, [example.annotations]);

  // Slice the rendered HTML into per-section chunks so each section
  // can sit in its own grid row alongside its annotation.
  const sectionChunks = useMemo(
    () => sliceSections(example.rendered.html, example.rendered.sections),
    [example.rendered.html, example.rendered.sections],
  );

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-x-8 gap-y-3 max-w-(--max-page)"
    >
      {sectionChunks.preamble ? (
        <div className="lg:col-span-2 prose-readable">
          <div dangerouslySetInnerHTML={{ __html: sectionChunks.preamble }} />
        </div>
      ) : null}

      {sectionChunks.sections.map((chunk) => (
        <div key={chunk.id} className="contents">
          <div className="prose-readable" id={chunk.id}>
            <div dangerouslySetInnerHTML={{ __html: chunk.html }} />
            {/* Mobile-only inline annotations */}
            {(annotationMap.get(chunk.id) ?? []).length > 0 ? (
              <aside className="lg:hidden mt-3 border-l-2 border-paper-3 pl-3">
                {(annotationMap.get(chunk.id) ?? []).map((note, idx) => (
                  <p
                    key={idx}
                    className="font-display italic text-body-s text-mute mt-2 first:mt-0"
                  >
                    {note}
                  </p>
                ))}
              </aside>
            ) : null}
          </div>

          <aside className="hidden lg:block border-l border-paper-3 pl-4 pt-2">
            {(annotationMap.get(chunk.id) ?? []).length > 0 ? (
              (annotationMap.get(chunk.id) ?? []).map((note, idx) => (
                <p
                  key={idx}
                  className="font-display italic text-body-s text-mute mt-3 first:mt-0"
                >
                  {note}
                </p>
              ))
            ) : null}
          </aside>
        </div>
      ))}
    </div>
  );
}

/**
 * Split a wrapped HTML string by `<section id="...">…</section>` blocks.
 * Anything before the first <section> becomes the preamble; each section
 * is returned in order with its id + inner html.
 */
function sliceSections(
  html: string,
  sections: Section[],
): { preamble: string; sections: Array<{ id: string; html: string }> } {
  const chunks: Array<{ id: string; html: string }> = [];
  const regex = /<section id="([^"]+)">([\s\S]*?)<\/section>/g;
  let match: RegExpExecArray | null;
  let firstIndex = -1;
  while ((match = regex.exec(html)) !== null) {
    if (firstIndex < 0) firstIndex = match.index;
    chunks.push({ id: match[1]!, html: match[2]! });
  }
  const preamble = firstIndex > 0 ? html.slice(0, firstIndex) : firstIndex < 0 ? html : "";
  void sections;
  return { preamble, sections: chunks };
}
