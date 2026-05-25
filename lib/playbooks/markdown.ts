/**
 * Markdown → HTML converter for playbook content.
 *
 * Wraps each top-level (## H2) section in a <section id="section-N"> so
 * the playbook detail page can position margin annotations next to
 * their target sections. The id sequence is order-based: section-1,
 * section-2, etc. — matching the section_id convention authors use in
 * the annotations array.
 */
import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

export type ParsedMarkdown = {
  html: string;
  sections: Array<{ id: string; index: number; title: string }>;
};

export function renderPlaybookMarkdown(md: string): ParsedMarkdown {
  // Split on H2 boundaries so we can wrap each chunk.
  const tokens = marked.lexer(md);
  const sections: ParsedMarkdown["sections"] = [];
  let currentSection: { id: string; title: string; html: string[] } | null = null;
  let leadingHtml = "";
  let counter = 0;

  for (const token of tokens) {
    if (token.type === "heading" && token.depth === 2) {
      // Flush previous section
      if (currentSection) {
        sections.push({
          id: currentSection.id,
          index: sections.length + 1,
          title: currentSection.title,
        });
      }
      counter += 1;
      const id = `section-${counter}`;
      currentSection = {
        id,
        title: token.text,
        html: [marked.parser([token])],
      };
    } else if (currentSection) {
      currentSection.html.push(marked.parser([token]));
    } else {
      leadingHtml += marked.parser([token]);
    }
  }
  if (currentSection) {
    sections.push({
      id: currentSection.id,
      index: sections.length + 1,
      title: currentSection.title,
    });
  }

  // Re-render with section wrappers. Easier to do a second pass than to
  // weave wrappers into the lexer flow above.
  let wrappedHtml = leadingHtml;
  let cursor = 0;
  let pending: { id: string; html: string[] } | null = null;

  for (const token of tokens) {
    if (token.type === "heading" && token.depth === 2) {
      if (pending) {
        wrappedHtml += `<section id="${pending.id}">${pending.html.join("")}</section>`;
      }
      cursor += 1;
      pending = { id: `section-${cursor}`, html: [marked.parser([token])] };
    } else if (pending) {
      pending.html.push(marked.parser([token]));
    }
  }
  if (pending) {
    wrappedHtml += `<section id="${pending.id}">${pending.html.join("")}</section>`;
  }

  return { html: wrappedHtml, sections };
}
