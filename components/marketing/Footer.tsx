/**
 * Marketing footer.
 *
 * Three-column link grid + tagline + copyright row, matching the
 * Marketing Landing v2.0 prototype. Rendered inside the (marketing)
 * layout so every public page gets the same footer chrome.
 */
import Link from "next/link";

import { Wordmark } from "./Wordmark";

const PRODUCT_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/situation-room", label: "Situation Room" },
  { href: "/simulator", label: "Scenario Simulator" },
  { href: "/playbook", label: "Playbook Library" },
  { href: "/mission-track", label: "Mission Track" },
  { href: "/pricing", label: "Pricing" },
];

const ROLE_LINKS = [
  { href: "/register?role=ba", label: "Business Analyst" },
  { href: "/register?role=pm", label: "Project Manager" },
  { href: "/register?role=sm", label: "Scrum Master" },
  { href: "/register?role=po", label: "Product Owner" },
  { href: "/register?role=da", label: "Data Analyst" },
  { href: "/ai-engineer", label: "AI Engineer →" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/manifesto", label: "Manifesto" },
  { href: "/changelog", label: "Changelog" },
  { href: "/contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/dpia", label: "DPA" },
];

export function MarketingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-7 border-t border-paper-3 bg-paper-2">
      <div className="mx-auto max-w-(--max-page) px-4 md:px-6 py-7">
        <div className="grid grid-cols-1 gap-7 md:grid-cols-[1fr_2fr]">
          <div className="flex flex-col gap-3">
            <Wordmark size="md" />
            <p className="text-body-s text-mute max-w-xs">
              A private workplace coach for the first 90 days in a new
              tech role.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <FooterColumn title="Product" links={PRODUCT_LINKS} />
            <FooterColumn title="Roles" links={ROLE_LINKS} />
            <FooterColumn title="Company" links={COMPANY_LINKS} />
            <FooterColumn title="Legal" links={LEGAL_LINKS} />
          </div>
        </div>

        <div className="mt-7 border-t border-paper-3 pt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-caption text-mute">
            © {year} AkomzyAi Consulting Ltd. All rights reserved.
          </p>
          <p className="font-display italic text-body-s text-mute">
            Built for the moment training ends.
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
  links: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-eyebrow">{title}</p>
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-body-s text-ink hover:text-mute transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
