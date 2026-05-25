/**
 * AIE footer — dark, four-column grid + bottom legal row with explicit
 * theme toggle and the editorial tagline. Mirrors the For-AI-Engineers
 * prototype footer exactly: blurb, Product / Roles / Company columns,
 * Terms · Privacy · DPA · toggle, "For the engineers responsible for
 * the room." tagline.
 */
import Link from "next/link";

import { WordmarkAI } from "@/components/marketing/Wordmark";

import { ThemeToggle } from "./ThemeToggle";

const PRODUCT_LINKS = [
  { href: "#convos", label: "Six conversations" },
  { href: "#whats", label: "What's different" },
  { href: "/situation-room", label: "Situation Room" },
  { href: "/playbooks", label: "Playbook Library" },
  { href: "/missions", label: "Mission Track" },
  { href: "#pricing", label: "Pricing" },
];

const ROLE_LINKS = [
  { href: "/?role=ba", label: "Business Analyst" },
  { href: "/?role=pm", label: "Project Manager" },
  { href: "/?role=sm", label: "Scrum Master" },
  { href: "/?role=po", label: "Product Owner" },
  { href: "/?role=da", label: "Data Analyst" },
  { href: "/ai-engineer", label: "AI Engineer", current: true },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/manifesto", label: "Manifesto" },
  { href: "/changelog", label: "Changelog" },
  { href: "/contact", label: "Contact" },
];

export function AIEFooter() {
  return (
    <footer className="pt-24 pb-12 border-t border-paper-3">
      <div className="mx-auto w-full max-w-(--max-page) px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] pb-16">
          <div className="flex flex-col">
            <Link
              href="/ai-engineer"
              aria-label="FirstNinety home"
              className="mb-4 inline-flex"
            >
              <WordmarkAI size="lg" />
            </Link>
            <p className="text-body-s text-mute leading-snug max-w-[30ch]">
              The workplace coach for your first 90 days as an AI engineer.
              Authored, not generated.
            </p>
          </div>

          <FooterColumn title="Product" links={PRODUCT_LINKS} />
          <FooterColumn title="Roles" links={ROLE_LINKS} />
          <FooterColumn title="Company" links={COMPANY_LINKS} />
        </div>

        <div className="grid items-center gap-4 pt-8 border-t border-paper-3 md:grid-cols-[1fr_auto_1fr]">
          <span className="text-caption text-mute tracking-wide">
            © 2026 AkomzyAi Consulting Ltd. All rights reserved.
          </span>

          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center gap-4 text-caption text-mute"
          >
            <Link href="/terms" className="hover:text-ink transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-ink transition-colors">
              Privacy
            </Link>
            <Link href="/dpa" className="hover:text-ink transition-colors">
              DPA
            </Link>
            <ThemeToggle />
          </nav>

          <p className="font-display italic text-body text-ink md:text-right">
            For the engineers responsible for the room.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; current?: boolean }[];
}) {
  return (
    <div className="flex flex-col">
      <h4 className="text-eyebrow mb-4">{title}</h4>
      <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`text-body-s transition-colors hover:text-mute ${
                link.current ? "text-ink" : "text-ink"
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
