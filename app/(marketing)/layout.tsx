/**
 * Marketing layout — slim top bar, page content, footer chrome.
 *
 * Per the Marketing Landing v2.0 prototype: wordmark left, text nav
 * (How it works · For AI Engineers · Pricing · Sign in) plus a single
 * "Begin" primary on the right. Footer with the three-column link grid
 * + tagline + copyright is rendered for every public page.
 */
import Link from "next/link";

import { MarketingFooter } from "@/components/marketing/Footer";
import { Wordmark } from "@/components/marketing/Wordmark";

const NAV_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/ai-engineer", label: "For AI Engineers" },
  { href: "/pricing", label: "Pricing" },
  { href: "/login", label: "Sign in" },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-paper min-h-screen flex flex-col">
      <header className="mx-auto w-full flex h-16 max-w-(--max-page) items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="inline-flex items-center"
          aria-label="FirstNinety home"
        >
          <Wordmark size="md" />
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-body-s text-mute hover:text-ink transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center bg-ink px-4 text-paper text-body-s font-medium transition-colors hover:opacity-90"
            style={{ borderRadius: "4px" }}
          >
            Begin
          </Link>
        </nav>

        <Link
          href="/register"
          className="inline-flex h-10 items-center justify-center bg-ink px-4 text-paper text-body-s font-medium md:hidden"
          style={{ borderRadius: "4px" }}
        >
          Begin
        </Link>
      </header>

      <main className="mx-auto w-full max-w-(--max-page) px-4 md:px-6 flex-1">
        {children}
      </main>

      <MarketingFooter />
    </div>
  );
}
