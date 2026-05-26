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
import {
  ARCHIVE_NAV,
  PRIMARY_NAV,
  PRIMARY_NAV_POST_90,
  type NavItem,
} from "@/components/nav/nav-items";
import { UserMenu, type UserMenuUser } from "@/components/nav/UserMenu";

type SidebarProps = {
  user: UserMenuUser | null;
  unreadCounts: { situation_room: number };
  /**
   * `post-90` switches the primary nav to PRIMARY_NAV_POST_90 (no Mission
   * Track) and surfaces an Archive section beneath the divider.
   */
  mode?: "default" | "post-90";
};

function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

export function Sidebar({ user, unreadCounts, mode = "default" }: SidebarProps) {
  const pathname = usePathname();
  const isPost90 = mode === "post-90";
  const primary = isPost90 ? PRIMARY_NAV_POST_90 : PRIMARY_NAV;

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
        {primary.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={isActive(pathname, item.href)}
            unread={item.showsUnread ? unreadCounts.situation_room > 0 : false}
          />
        ))}

        {isPost90 ? (
          <div className="mt-4">
            <p className="hidden lg:block text-eyebrow text-mute-2 px-2 mb-1.5">
              Archive
            </p>
            <div className="lg:hidden border-t border-paper-3 mx-2 my-2" />
            <div className="flex flex-col gap-1">
              {ARCHIVE_NAV.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  active={isActive(pathname, item.href)}
                  unread={false}
                  muted
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-auto pt-3">
          <Link
            href="/settings/memory"
            className={`flex flex-col gap-0.5 px-3 py-3 transition-colors group ${
              isActive(pathname, "/settings/memory")
                ? "bg-paper-3"
                : "hover:bg-paper-3"
            }`}
            style={{ borderRadius: "6px" }}
            aria-label="What I know about you"
          >
            <span className="hidden lg:inline text-body-s font-medium text-ink">
              What I know about you
            </span>
            <span className="hidden lg:inline font-display italic text-caption text-mute">
              read the margins
            </span>
            <span className="lg:hidden text-ink text-body-s font-medium" aria-hidden>
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
  muted = false,
}: {
  item: NavItem;
  active: boolean;
  unread: boolean;
  muted?: boolean;
}) {
  const { Icon } = item;
  const inactiveText = muted
    ? "text-mute-2 hover:text-ink"
    : "text-mute hover:bg-paper-3 hover:text-ink";
  return (
    <Link
      href={item.href}
      className={`relative flex items-center gap-3 px-2 lg:px-3 py-2 text-body-s font-medium transition-colors ${
        active ? "bg-paper-3 text-ink" : inactiveText
      }`}
      style={{ borderRadius: "6px" }}
      title={item.label}
      aria-current={active ? "page" : undefined}
    >
      <span className="relative">
        <Icon
          className="size-5 lg:size-[18px] shrink-0"
          strokeWidth={1.5}
          aria-hidden
        />
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
