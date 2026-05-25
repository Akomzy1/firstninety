/**
 * Right-side slide-in drawer for the mobile "More" tab. Contains the nav
 * items that didn't fit in the four-icon bottom strip plus a sign-out
 * action. Closes when the backdrop is tapped, when Escape is pressed,
 * or when a nav link is selected.
 */
"use client";

import Link from "next/link";
import { useEffect } from "react";

import { LogOut, X } from "lucide-react";

import { MOBILE_MORE_ITEMS } from "@/components/nav/nav-items";
import { signOutAction } from "@/app/(auth)/actions";

type MoreDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export function MoreDrawer({ open, onClose }: MoreDrawerProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-40 transition-opacity ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <aside
        className={`absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col bg-paper border-l border-paper-3 transition-transform duration-200 ${open ? "translate-x-0" : "translate-x-full"}`}
        aria-label="More navigation"
      >
        <header className="flex h-14 items-center justify-between px-3 border-b border-paper-3">
          <span className="text-eyebrow">More</span>
          <button
            type="button"
            onClick={onClose}
            className="text-mute hover:text-ink"
            aria-label="Close"
          >
            <X className="size-5" strokeWidth={1.5} aria-hidden />
          </button>
        </header>
        <nav className="flex flex-col gap-1 p-2">
          {MOBILE_MORE_ITEMS.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex h-10 items-center gap-3 px-2 text-body-s font-medium text-mute hover:text-ink hover:bg-paper-2 transition-colors"
              style={{ borderRadius: "4px" }}
            >
              <Icon className="size-5" strokeWidth={1.5} aria-hidden />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-paper-3 mx-2 my-2" />

        <Link
          href="/settings/memory"
          onClick={onClose}
          className="mx-2 flex flex-col gap-0.5 px-3 py-3 hover:bg-paper-2 transition-colors"
          style={{ borderRadius: "6px" }}
        >
          <span className="text-body-s font-medium text-ink">
            What I know about you
          </span>
          <span className="font-display italic text-caption text-mute">
            read the margins
          </span>
        </Link>

        <div className="mt-auto border-t border-paper-3 p-2 flex flex-col gap-1">
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-2 py-2 text-left text-body-s text-mute hover:text-ink hover:bg-paper-2 transition-colors"
              style={{ borderRadius: "4px" }}
            >
              <LogOut className="size-5" strokeWidth={1.5} aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
