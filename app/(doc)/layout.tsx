/**
 * Editorial-document chrome — a deliberately stripped layout for pages
 * that should read like a one-off document, not an app screen. Used by
 * /settings/memory per the Memory Settings prototype.
 *
 * Auth + onboarding gate mirrors (app)/layout.tsx so authenticated pages
 * in this group still bounce unauthenticated visitors and unfinished
 * onboarders. The visual chrome (Back / Export bar) is rendered by each
 * page so it can be tuned per-doc.
 */
import { redirect } from "next/navigation";

import { createClient } from "@/lib/db/server";

export const dynamic = "force-dynamic";

export default async function DocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: row } = await supabase
    .from("users")
    .select("onboarding_completed_at")
    .eq("id", user.id)
    .single();

  if (row && !row.onboarding_completed_at) {
    redirect("/onboarding/step-1");
  }

  return <div className="min-h-screen bg-paper text-ink">{children}</div>;
}
