/**
 * Shared nav metadata for the desktop sidebar + mobile bottom nav. One
 * file so adding / renaming a surface only touches one place.
 *
 * Icons match the rendered Daily Home / Probation Home prototypes
 * (lucide names: home, target, radio, users, message-circle, book-open).
 * Rendered at 1.5px stroke / 20px default per Design Brief §6.5.
 */
import {
  BookOpen,
  FileText,
  Home,
  MessageCircle,
  Radio,
  Settings,
  Target,
  Users,
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
  { href: "/mission-track", label: "Mission Track", shortLabel: "Track", Icon: Target },
  {
    href: "/situation-room",
    label: "Situation Room",
    shortLabel: "Situation",
    Icon: Radio,
    showsUnread: true,
  },
  { href: "/simulator", label: "Simulator", shortLabel: "Simulator", Icon: Users },
  { href: "/coach", label: "Coach", shortLabel: "Coach", Icon: MessageCircle },
  { href: "/playbook", label: "Playbook", shortLabel: "Playbook", Icon: BookOpen },
];

/**
 * Post-Day-90: Mission Track has concluded by design and moves into an
 * "Archive" section alongside the saved Survival Report. The primary nav
 * loses Mission Track; everything else stays.
 */
export const PRIMARY_NAV_POST_90: ReadonlyArray<NavItem> = PRIMARY_NAV.filter(
  (item) => item.href !== "/mission-track",
);

export const ARCHIVE_NAV: ReadonlyArray<NavItem> = [
  { href: "/mission-track", label: "Mission Track", shortLabel: "Track", Icon: Target },
  {
    href: "/probation/brief",
    label: "Survival Report",
    shortLabel: "Report",
    Icon: FileText,
  },
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
  { href: "/coach", label: "Coach", Icon: MessageCircle },
  { href: "/playbook", label: "Playbook", Icon: BookOpen },
  { href: "/settings/memory", label: "Settings", Icon: Settings },
] as const;
