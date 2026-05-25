/**
 * Shared nav metadata for the desktop sidebar + mobile bottom nav. One
 * file so adding / renaming a surface only touches one place.
 *
 * Lucide icons render at 1.5px stroke / 20px default per Design Brief §6.5.
 */
import {
  Book,
  Compass,
  Home,
  MessageSquare,
  Play,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  Icon: LucideIcon;
  /**
   * `true` if this surface can carry an unread dot. The actual count comes
   * from `getUnreadCounts` in lib/nav/unread.ts.
   */
  showsUnread?: boolean;
};

export const PRIMARY_NAV: ReadonlyArray<NavItem> = [
  { href: "/home", label: "Home", shortLabel: "Home", Icon: Home },
  { href: "/mission-track", label: "Mission Track", shortLabel: "Track", Icon: Compass },
  {
    href: "/situation-room",
    label: "Situation Room",
    shortLabel: "Situation",
    Icon: MessageSquare,
    showsUnread: true,
  },
  { href: "/simulator", label: "Simulator", shortLabel: "Simulator", Icon: Play },
  { href: "/coach", label: "Coach", shortLabel: "Coach", Icon: Sparkles },
  { href: "/playbook", label: "Playbook", shortLabel: "Playbook", Icon: Book },
];

/**
 * Items shown in the mobile bottom nav (first four = primary nav minus
 * Coach + Playbook; "More" opens a drawer with the rest).
 */
export const MOBILE_BOTTOM_PRIMARY: ReadonlyArray<NavItem> = PRIMARY_NAV.slice(0, 4);

/**
 * Items shown in the mobile "More" drawer.
 */
export const MOBILE_MORE_ITEMS = [
  { href: "/coach", label: "Coach", Icon: Sparkles },
  { href: "/playbook", label: "Playbook", Icon: Book },
  { href: "/settings/memory", label: "Settings", Icon: Home },
] as const;
