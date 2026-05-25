/**
 * Marketing layout — slim top bar + page content. Used for the landing page,
 * the AI Engineer dedicated landing, pricing, and the privacy/DPIA pages.
 *
 * Build Prompt 0.5: max-width 1280 page, wordmark left, text nav + single
 * primary "Begin" right. No footer until Phase 4.3.
 */
import Link from "next/link";

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
    <div className="bg-paper min-h-screen">
      <header className="mx-auto flex h-16 max-w-(--max-page) items-center justify-between px-4 md:px-6">
        <Link href="/" className="inline-flex items-center" aria-label="FirstNinety home">
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
            className="inline-flex h-10 items-center justify-center bg-ink px-3 text-paper text-body-s font-medium transition-colors hover:opacity-90"
            style={{ borderRadius: "4px" }}
          >
            Begin
          </Link>
        </nav>

        {/* Mobile: just the Begin button. Full mobile nav lands in Phase 4.3. */}
        <Link
          href="/register"
          className="inline-flex h-10 items-center justify-center bg-ink px-3 text-paper text-body-s font-medium md:hidden"
          style={{ borderRadius: "4px" }}
        >
          Begin
        </Link>
      </header>

      <main className="mx-auto max-w-(--max-page) px-4 md:px-6">{children}</main>
    </div>
  );
}
