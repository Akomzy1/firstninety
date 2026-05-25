/**
 * Authenticated app layout.
 *
 * Build Prompt 0.5: sidebar (240px desktop, 64px icon-only tablet, hidden
 * mobile) + bottom nav (mobile only, 5 icons). Active states use --paper-3
 * since the sidebar itself sits on --paper-2 (Build Prompt 1.4 clarifies).
 * The production version with user menu dropdown, unread indicators, and
 * tablet-hover labels lands in Build Prompt 1.4.
 */
import Link from "next/link";

import {
  Book,
  Compass,
  Home,
  MessageSquare,
  Play,
  Sparkles,
} from "lucide-react";

import { Wordmark } from "@/components/marketing/Wordmark";

const SIDEBAR_ITEMS = [
  { href: "/home", label: "Home", Icon: Home },
  { href: "/mission-track", label: "Mission Track", Icon: Compass },
  { href: "/situation-room", label: "Situation Room", Icon: MessageSquare },
  { href: "/simulator", label: "Simulator", Icon: Play },
  { href: "/coach", label: "Coach", Icon: Sparkles },
  { href: "/playbook", label: "Playbook", Icon: Book },
] as const;

const BOTTOM_NAV_ITEMS = [
  { href: "/home", label: "Home", Icon: Home },
  { href: "/mission-track", label: "Track", Icon: Compass },
  { href: "/situation-room", label: "Situation", Icon: MessageSquare },
  { href: "/simulator", label: "Simulator", Icon: Play },
  { href: "/more", label: "More", Icon: Book },
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-paper">
      {/* Sidebar — hidden < md, 64px md, 240px lg */}
      <aside
        className="hidden md:flex md:w-16 lg:w-60 shrink-0 flex-col border-r border-paper-3 bg-paper-2"
        aria-label="Primary"
      >
        <div className="flex h-16 items-center px-3 lg:px-4">
          <Link href="/home" className="inline-flex items-center" aria-label="FirstNinety home">
            {/* On tablet (64px) we hide the wordmark text; just show a tight monogram. */}
            <span className="lg:hidden font-display font-semibold text-h3 text-ink">F</span>
            <span className="hidden lg:inline-flex">
              <Wordmark size="md" />
            </span>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-2 py-2">
          {SIDEBAR_ITEMS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex h-10 items-center gap-3 px-2 text-body-s font-medium text-ink hover:bg-paper-3 transition-colors"
              style={{ borderRadius: "4px" }}
              title={label}
            >
              <Icon className="size-5 shrink-0" strokeWidth={1.5} aria-hidden />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          ))}

          {/* Memory link — Fraunces italic body-s per Design Brief signature surface */}
          <div className="mt-auto border-t border-paper-3 pt-2">
            <Link
              href="/settings/memory"
              className="block px-2 py-2 font-display italic text-body-s text-mute hover:text-ink transition-colors"
            >
              <span className="hidden lg:inline">What I know about you</span>
              <span className="lg:hidden" aria-label="What I know about you">·</span>
            </Link>
          </div>
        </nav>

        {/* User-menu placeholder — replaced with monogram + dropdown in 1.4. */}
        <div className="border-t border-paper-3 p-3">
          <div className="flex items-center gap-2">
            <div
              className="size-8 shrink-0 rounded-full bg-paper-3"
              aria-hidden
            />
            <span className="hidden lg:inline text-body-s text-mute">
              Sign in
            </span>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex flex-1 flex-col">
        {/* Mobile top bar — minimal: wordmark only. Sidebar lives in bottom nav. */}
        <header className="flex h-14 items-center justify-between border-b border-paper-3 px-4 md:hidden">
          <Link href="/home" aria-label="FirstNinety home">
            <Wordmark size="sm" />
          </Link>
        </header>

        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        {/* Mobile bottom nav */}
        <nav
          className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-paper-3 bg-paper md:hidden"
          aria-label="Primary"
        >
          {BOTTOM_NAV_ITEMS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex h-full flex-1 flex-col items-center justify-center gap-1 text-mute hover:text-ink"
              aria-label={label}
            >
              <Icon className="size-5" strokeWidth={1.5} aria-hidden />
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
