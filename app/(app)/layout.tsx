/**
 * Authenticated app layout.
 *
 * Server component: fetches the user row + unread counts and hands them
 * to the client-side Sidebar / BottomNav components, which own the
 * active-state logic via usePathname.
 *
 * Onboarding gate: anyone authenticated but without onboarding_completed_at
 * bounces back into the flow.
 */
import Link from "next/link";
import { redirect } from "next/navigation";

import { Wordmark } from "@/components/marketing/Wordmark";
import { BottomNav } from "@/components/nav/BottomNav";
import { Sidebar } from "@/components/nav/Sidebar";
import { createClient } from "@/lib/db/server";
import { getUnreadCounts } from "@/lib/nav/unread";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userMenuUser: {
    id: string;
    email: string;
    display_name: string | null;
    primary_role: string | null;
  } | null = null;

  if (user) {
    const { data: row } = await supabase
      .from("users")
      .select("display_name, email, primary_role, onboarding_completed_at")
      .eq("id", user.id)
      .single();
    if (row && !row.onboarding_completed_at) {
      redirect("/onboarding/step-1");
    }
    userMenuUser = {
      id: user.id,
      email: row?.email ?? user.email ?? "",
      display_name: row?.display_name ?? null,
      primary_role: row?.primary_role ?? null,
    };
  }

  const unreadCounts = user
    ? await getUnreadCounts(user.id)
    : { situation_room: 0 };

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar user={userMenuUser} unreadCounts={unreadCounts} />

      <div className="flex flex-1 flex-col">
        {/* Mobile top bar — minimal wordmark only. */}
        <header className="flex h-14 items-center justify-between border-b border-paper-3 px-4 md:hidden">
          <Link href="/home" aria-label="FirstNinety home">
            <Wordmark size="sm" />
          </Link>
        </header>

        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        <BottomNav unreadCounts={unreadCounts} />
      </div>
    </div>
  );
}
