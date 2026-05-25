/**
 * Settings layout — sub-nav down the left, content on the right. The
 * sub-nav lists Memory · Billing · Privacy · Account. Billing + Account
 * surfaces ship in later phases (4.x); Privacy in 1.6. For Phase 1 the
 * inactive items still link out so the chrome is honest.
 */
import Link from "next/link";

const SETTINGS_LINKS = [
  { href: "/settings/memory", label: "Memory" },
  { href: "/settings/billing", label: "Billing" },
  { href: "/settings/privacy", label: "Privacy" },
  { href: "/settings/account", label: "Account" },
] as const;

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-(--max-page) flex-col gap-5 px-4 py-6 md:flex-row md:gap-6 md:px-6 md:py-8">
      <nav
        aria-label="Settings"
        className="md:w-56 shrink-0 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible border-b md:border-b-0 md:border-r border-paper-3 pb-3 md:pb-0 md:pr-4"
      >
        {SETTINGS_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-2 py-2 text-body-s font-medium text-ink hover:bg-paper-2 transition-colors"
            style={{ borderRadius: "4px" }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
