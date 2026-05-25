/**
 * /support — permanent helplines page linked from Privacy settings + the
 * footer of the CrisisReferral component. The voice rules apply (no
 * exclamation, no faux-warmth) — this page lists numbers and gets out
 * of the way.
 *
 * Helplines mirror the static list inside `components/safety/CrisisReferral`
 * so users who land here through other paths see the same numbers.
 */
import Link from "next/link";

import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Support" };

const HELPLINES = [
  {
    region: "UK",
    name: "Samaritans",
    number: "116 123",
    href: "https://www.samaritans.org",
    note: "Free, 24/7, answered by trained volunteers.",
  },
  {
    region: "US",
    name: "988 Suicide & Crisis Lifeline",
    number: "988",
    href: "https://988lifeline.org",
    note: "Call or text 988.",
  },
  {
    region: "International",
    name: "Find a Helpline",
    number: "findahelpline.com",
    href: "https://findahelpline.com",
    note: "Directory of free, confidential lines in every country.",
  },
  {
    region: "Workplace",
    name: "ACAS (UK) / EEOC (US)",
    number: "see links",
    href: "https://www.acas.org.uk",
    note: "For employment-law questions — harassment, discrimination, contract disputes.",
  },
];

export default function SupportPage() {
  return (
    <main className="mx-auto w-full max-w-(--max-reading) px-6 md:px-8 py-12 md:py-16 flex flex-col gap-7">
      <Link
        href="/settings/privacy"
        className="inline-flex items-center gap-2 text-body-s text-mute hover:text-ink transition-colors self-start"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.5} aria-hidden />
        Back to Privacy
      </Link>

      <header className="flex flex-col gap-3">
        <p className="text-eyebrow text-mute-2">Support</p>
        <h1 className="text-h1 text-balance">If you need support.</h1>
        <p className="text-body-l text-mute max-w-prose">
          FirstNinety is workplace coaching. For anything outside that
          lane &mdash; immediate distress, mental-health concerns,
          formal legal or HR questions &mdash; talk to a real person.
          Free, confidential lines below.
        </p>
      </header>

      <section className="flex flex-col gap-5">
        <ul className="flex flex-col gap-4 list-none p-0 m-0">
          {HELPLINES.map((line) => (
            <li
              key={line.region}
              className="flex flex-col gap-1 border-b border-paper-3 pb-4 last:border-b-0"
            >
              <p className="text-caption text-mute-2 uppercase tracking-wider">
                {line.region}
              </p>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="text-body font-medium text-ink">
                  {line.name}
                </span>
                <Link
                  href={line.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-ink underline-offset-4 hover:underline"
                  style={{ fontSize: "13px" }}
                >
                  {line.number}
                </Link>
              </div>
              <p className="text-body-s text-mute">{line.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-body-s text-mute italic max-w-prose">
        If you&rsquo;re a FirstNinety user and a Coach reply has missed
        something important, the Coach is not a replacement for any of
        the above. You can always come back here.
      </p>
    </main>
  );
}
