/**
 * Cinematic route group — full-bleed dark canvas, no app chrome.
 *
 * Used by Simulator brief, active session, and debrief screens. Per
 * Design Brief §10 the Simulator brief is the most cinematic surface
 * in the product; the sidebar / bottom nav / app header would all
 * break that frame. We bypass them by living in a route group outside
 * `(app)`.
 *
 * Auth gate matches `(app)/layout.tsx` so the user still bounces back
 * to login if signed-out and to onboarding if onboarding isn't done.
 * The `data-theme="dark"` wrapper flips every CSS-variable-backed
 * Tailwind utility (bg-paper, text-ink, border-paper-3, …) to the
 * dark palette without hard-coding hex anywhere.
 */
import { redirect } from "next/navigation";

import { createClient } from "@/lib/db/server";

export default async function CinematicLayout({
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
  if (row && !row.onboarding_completed_at) redirect("/onboarding/step-1");

  return (
    <div
      data-theme="dark"
      className="bg-paper text-ink min-h-screen flex flex-col"
    >
      {children}
    </div>
  );
}
