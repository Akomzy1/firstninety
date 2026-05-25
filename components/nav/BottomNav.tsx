/**
 * Mobile bottom nav. Four primary items + a "More" tab that opens a
 * right-side slide-in drawer with the rest of the navigation.
 *
 * Active item shows a small ink dot above the icon. No label change; the
 * dot is the only state signal. Visible only on screens < md (sidebar
 * takes over from md+).
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Menu } from "lucide-react";

import {
  MOBILE_BOTTOM_PRIMARY,
  MOBILE_MORE_ITEMS,
} from "@/components/nav/nav-items";
import { MoreDrawer } from "@/components/nav/MoreDrawer";

type BottomNavProps = {
  unreadCounts: { situation_room: number };
};

function isActive(pathname: string, href: string) {
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

export function BottomNav({ unreadCounts }: BottomNavProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const moreItemsActive = MOBILE_MORE_ITEMS.some((item) =>
    isActive(pathname, item.href),
  );

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-paper-3 bg-paper md:hidden"
        aria-label="Primary"
      >
        {MOBILE_BOTTOM_PRIMARY.map(({ href, label, Icon, showsUnread }) => {
          const active = isActive(pathname, href);
          const unread = showsUnread && unreadCounts.situation_room > 0;
          return (
            <Link
              key={href}
              href={href}
              className="relative flex h-full flex-1 flex-col items-center justify-center gap-1"
              aria-label={label}
              aria-current={active ? "page" : undefined}
            >
              <span className="relative flex flex-col items-center">
                {active ? (
                  <span
                    className="absolute -top-2 size-1 rounded-full bg-ink"
                    aria-hidden
                  />
                ) : null}
                <Icon
                  className={`size-5 ${active ? "text-ink" : "text-mute"}`}
                  strokeWidth={1.5}
                  aria-hidden
                />
                {unread ? (
                  <span
                    className="absolute -right-2 -top-1 size-2 rounded-full bg-accent"
                    aria-label="Unread"
                  />
                ) : null}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex h-full flex-1 flex-col items-center justify-center gap-1"
          aria-label="More"
          aria-current={moreItemsActive ? "page" : undefined}
        >
          <span className="relative flex flex-col items-center">
            {moreItemsActive ? (
              <span
                className="absolute -top-2 size-1 rounded-full bg-ink"
                aria-hidden
              />
            ) : null}
            <Menu
              className={`size-5 ${moreItemsActive ? "text-ink" : "text-mute"}`}
              strokeWidth={1.5}
              aria-hidden
            />
          </span>
        </button>
      </nav>

      <MoreDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
