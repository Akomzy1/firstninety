/**
 * Sidebar user menu — monogram avatar + display name + role caption that
 * opens a dropdown upward with Account / Billing / Memory & Privacy /
 * Sign out. Uses native <details> for the disclosure so it works without
 * floating-ui or radix.
 */
"use client";

import Link from "next/link";

import { LogOut } from "lucide-react";

import { signOutAction } from "@/app/(auth)/actions";

export type UserMenuUser = {
  id: string;
  email: string;
  display_name: string | null;
  primary_role: string | null;
};

const ROLE_LABEL: Record<string, string> = {
  ba: "Business Analyst",
  pm: "Project Manager",
  sm: "Scrum Master",
  po: "Product Owner",
  da: "Data Analyst",
  aie: "AI Engineer",
};

function monogram(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "·";
  const parts = trimmed.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return "·";
  if (parts.length === 1) {
    const first = parts[0];
    if (!first) return "·";
    return first.slice(0, 2).toUpperCase();
  }
  const first = parts[0];
  const second = parts[1];
  if (!first || !second) return "·";
  return (first[0] ?? "") + (second[0] ?? "");
}

export function UserMenu({ user }: { user: UserMenuUser | null }) {
  if (!user) {
    return (
      <Link
        href="/login"
        className="flex h-10 items-center gap-2 px-2 text-body-s text-mute hover:text-ink transition-colors"
      >
        Sign in
      </Link>
    );
  }

  const label = user.display_name?.trim() || user.email;
  const roleCaption = user.primary_role
    ? (ROLE_LABEL[user.primary_role] ?? user.primary_role)
    : "Setup pending";

  return (
    <details className="group relative">
      <summary
        className="flex h-12 cursor-pointer list-none items-center gap-2 px-2 text-body-s hover:bg-paper-3 transition-colors"
        style={{ borderRadius: "4px" }}
      >
        <span
          className="grid size-8 shrink-0 place-items-center rounded-full font-body font-semibold tracking-wider text-paper"
          style={{ background: "#6F7A86", fontSize: "11px", letterSpacing: "0.04em" }}
        >
          {monogram(label).toUpperCase()}
        </span>
        <span className="hidden lg:flex flex-1 flex-col text-left min-w-0">
          <span className="truncate font-medium text-ink">{label}</span>
          <span className="truncate text-caption text-mute">{roleCaption}</span>
        </span>
      </summary>

      <div
        className="absolute bottom-full left-0 right-0 mb-2 flex flex-col bg-paper border border-paper-3 overflow-hidden"
        style={{
          borderRadius: "8px",
          boxShadow: "0 8px 24px rgba(14, 17, 22, 0.06)",
        }}
      >
        <Link
          href="/settings/account"
          className="px-3 py-2 text-body-s text-ink hover:bg-paper-2"
        >
          Account
        </Link>
        <Link
          href="/settings/billing"
          className="px-3 py-2 text-body-s text-ink hover:bg-paper-2"
        >
          Billing
        </Link>
        <Link
          href="/settings/memory"
          className="px-3 py-2 text-body-s text-ink hover:bg-paper-2"
        >
          Memory &amp; Privacy
        </Link>
        <form action={signOutAction} className="border-t border-paper-3">
          <button
            type="submit"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-body-s text-ink hover:bg-paper-2"
          >
            <LogOut className="size-4" strokeWidth={1.5} aria-hidden />
            Sign out
          </button>
        </form>
      </div>
    </details>
  );
}
