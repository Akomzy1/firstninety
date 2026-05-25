/**
 * CrisisReferral — renders below an AI response when the parent surface
 * has been flagged for safety. Per MVP Spec §4.6 + SKILL §10:
 *
 *   - Always renders when flagged; never gated on user behaviour.
 *   - The eyebrow is plain and direct: "IF YOU NEED IMMEDIATE SUPPORT".
 *   - Helplines are a small static list (Samaritans UK + 988 US for MVP;
 *     a curated "Find local services →" link will land in Phase 2A).
 *   - Voice rules: no exclamation, no faux-empathy, no "we're here for
 *     you" energy. State the facts, list the number, get out of the way.
 *
 * `category` is read for accessibility labelling but does not change
 * what's rendered — the surface is intentionally the same regardless
 * of which crisis pattern fired.
 */
import Link from "next/link";

import { ArrowRight } from "lucide-react";

import type { CrisisCategory } from "@/lib/safety/checks";

type CrisisReferralProps = {
  category: CrisisCategory;
  className?: string;
};

const HELPLINES: ReadonlyArray<{
  region: string;
  name: string;
  number: string;
  href?: string;
}> = [
  {
    region: "UK",
    name: "Samaritans",
    number: "116 123",
    href: "https://www.samaritans.org",
  },
  {
    region: "US",
    name: "988 Suicide & Crisis Lifeline",
    number: "988",
    href: "https://988lifeline.org",
  },
  {
    region: "International",
    name: "Find a Helpline",
    number: "findahelpline.com",
    href: "https://findahelpline.com",
  },
];

export function CrisisReferral({ category, className = "" }: CrisisReferralProps) {
  return (
    <section
      role="complementary"
      aria-label={`Crisis support resources for ${category}`}
      className={`flex flex-col gap-3 border border-paper-3 bg-paper-2 p-5 md:p-6 max-w-prose ${className}`.trim()}
      style={{ borderRadius: "10px" }}
    >
      <p className="text-eyebrow">If you need immediate support</p>
      <p className="text-body text-ink">
        You don&rsquo;t need to use FirstNinety for this. Talk to a real
        person who can help right now. These services are free, confidential,
        and answered by people trained for the conversation.
      </p>

      <ul className="flex flex-col gap-2 list-none p-0 m-0 mt-1">
        {HELPLINES.map((line) => (
          <li
            key={line.region}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5"
          >
            <span className="text-caption text-mute-2 uppercase tracking-wider min-w-[64px]">
              {line.region}
            </span>
            <span className="text-body-s text-ink font-medium">
              {line.name}
            </span>
            {line.href ? (
              <Link
                href={line.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-ink underline-offset-4 hover:underline"
                style={{ fontSize: "13px" }}
              >
                {line.number}
              </Link>
            ) : (
              <span
                className="font-mono text-ink"
                style={{ fontSize: "13px" }}
              >
                {line.number}
              </span>
            )}
          </li>
        ))}
      </ul>

      <Link
        href="/safety"
        className="inline-flex items-center gap-1.5 text-body-s font-medium text-ink hover:text-mute transition-colors mt-1"
      >
        Find local services
        <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden />
      </Link>
    </section>
  );
}
