/**
 * AIE header — sticky, dark, blurred. Mirrors the For-AI-Engineers
 * prototype: First•90_ai wordmark on the left; centered nav text with
 * dot separators on the right; a single Begin primary button.
 *
 * Sticky behaviour: a hairline appears under the header once the user
 * scrolls past 8px. Handled in StickyHairline (client) to keep this
 * component a server boundary.
 */
import Link from "next/link";

import { WordmarkAI } from "@/components/marketing/Wordmark";

import { StickyHairline } from "./StickyHairline";

const NAV_LINKS = [
  { href: "#convos", label: "For AI Engineers", active: true },
  { href: "#whats", label: "What's different" },
  { href: "#pricing", label: "Pricing" },
  { href: "/login", label: "Sign in" },
];

export function AIEHeader() {
  return (
    <>
      <StickyHairline />
      <header
        id="aie-site-header"
        className="sticky top-0 z-50 border-b border-transparent backdrop-blur-md backdrop-saturate-150 transition-colors duration-200"
        style={{ backgroundColor: "rgba(14, 17, 22, 0.78)" }}
      >
        <div className="mx-auto flex h-16 w-full max-w-(--max-page) items-center justify-between px-8">
          <Link
            href="/ai-engineer"
            aria-label="FirstNinety for AI Engineers — home"
            className="inline-flex items-center"
          >
            <WordmarkAI size="md" />
          </Link>

          <div className="flex items-center gap-6">
            <nav
              aria-label="Primary"
              className="hidden items-center gap-4 md:flex"
            >
              {NAV_LINKS.flatMap((item, index) => {
                const link = (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-body-s font-medium transition-colors hover:text-ink ${
                      item.active ? "text-ink" : "text-mute"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
                if (index === NAV_LINKS.length - 1) return [link];
                return [
                  link,
                  <span
                    key={`${item.href}-sep`}
                    aria-hidden
                    className="text-mute-2 select-none"
                  >
                    ·
                  </span>,
                ];
              })}
            </nav>

            <Link
              href="/register?role=aie"
              className="inline-flex h-9 items-center justify-center bg-ink text-paper px-4 text-body-s font-medium transition-opacity hover:opacity-90"
              style={{ borderRadius: "4px" }}
            >
              Begin
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
