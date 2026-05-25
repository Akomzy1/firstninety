/**
 * Desktop / tablet sidebar.
 *  - 240px width on lg+
 *  - 64px icon-only on md
 *  - Hidden < md (mobile uses BottomNav)
 *
 * Active state is `--paper-3` since the sidebar sits on `--paper-2`
 * (Build Prompt 1.4: "active uses --paper-3 when sidebar bg is
 * --paper-2"). No coral accent in chrome — accent stays reserved for the
 * unread dot on Situation Room.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Wordmark } from "@/components/marketing/Wordmark";
import { PRIMARY_NAV, type NavItem } from "@/components/nav/nav-items";
import { UserMenu, type UserMenuUser } from "@/components/nav/UserMenu";

type SidebarProps = {
  user: UserMenuUser | null;
  unreadCounts: { situation_room: number };
};

function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

export function Sidebar({ user, unreadCounts }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex md:w-16 lg:w-60 shrink-0 flex-col border-r border-paper-3 bg-paper"
      aria-label="Primary"
    >
      <div className="flex h-16 items-center px-3 lg:px-4">
        <Link
          href="/home"
          className="inline-flex items-center"
          aria-label="FirstNinety home"
        >
          {/* Tablet (64px): show a tight italic "F" with the accent dot — the
              same lockup language as the full mark at lg+. */}
          <span className="lg:hidden inline-flex items-start gap-1 font-display font-semibold text-h3 text-ink">
            <span className="font-normal italic">F</span>
            <span className="mt-1 size-1.5 rounded-full bg-accent" aria-hidden />
          </span>
          <span className="hidden lg:inline-flex">
            <Wordmark size="md" />
          </span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 py-2">
        {PRIMARY_NAV.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={isActive(pathname, item.href)}
            unread={item.showsUnread ? unreadCounts.situation_room > 0 : false}
          />
        ))}

        <div className="mt-auto border-t border-paper-3 pt-2">
          <Link
            href="/settings/memory"
            className={`block px-2 py-2 font-display italic text-body-s transition-colors ${
              isActive(pathname, "/settings")
                ? "text-ink"
                : "text-mute hover:text-ink"
            }`}
          >
            <span className="hidden lg:inline">What I know about you</span>
            <span className="lg:hidden" aria-label="What I know about you">
              ·
            </span>
          </Link>
        </div>
      </nav>

      <div className="border-t border-paper-3 p-2">
        <UserMenu user={user} />
      </div>
    </aside>
  );
}

function SidebarLink({
  item,
  active,
  unread,
}: {
  item: NavItem;
  active: boolean;
  unread: boolean;
}) {
  const { Icon } = item;
  return (
    <Link
      href={item.href}
      className={`relative flex h-10 items-center gap-3 px-2 text-body-s font-medium transition-colors ${
        active ? "bg-paper-3 text-ink" : "text-ink hover:bg-paper-3"
      }`}
      style={{ borderRadius: "4px" }}
      title={item.label}
      aria-current={active ? "page" : undefined}
    >
      <span className="relative">
        <Icon className="size-5 shrink-0" strokeWidth={1.5} aria-hidden />
        {unread ? (
          <span
            className="absolute -right-1 -top-1 size-2 rounded-full bg-accent"
            aria-label="Unread"
          />
        ) : null}
      </span>
      <span className="hidden lg:inline">{item.label}</span>
    </Link>
  );
}
