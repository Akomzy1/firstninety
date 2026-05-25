/**
 * Daily home — Phase 0.5 placeholder content + the Sunday recap modal.
 * Real Day-1 / Day-N / Day-91+ states land in Build Prompts 2.2 and 3.16.
 *
 * The modal opens when ?sundayPrompt=1 is present AND we haven't prompted
 * this user in the last 24h. The query string is removed by the modal
 * itself after submit / skip / close.
 */
import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";

import { SundayPromptModal } from "./SundayPromptModal";

type HomePageProps = {
  searchParams: Promise<{ sundayPrompt?: string }>;
};

function isRecent(timestamp: string | null): boolean {
  if (!timestamp) return false;
  const last = new Date(timestamp).getTime();
  if (Number.isNaN(last)) return false;
  return Date.now() - last < 24 * 60 * 60 * 1000;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const user = await requireAuth();
  const { sundayPrompt } = await searchParams;

  let promptOpen = false;
  if (sundayPrompt === "1") {
    const supabase = await createClient();
    const { data } = await supabase
      .from("user_context")
      .select("last_sunday_prompt_at")
      .eq("user_id", user.id)
      .single();
    promptOpen = !isRecent(data?.last_sunday_prompt_at ?? null);
  }

  return (
    <section className="px-4 py-6 md:px-6 md:py-8">
      <p className="text-eyebrow">Daily home</p>
      <h1 className="text-h1 mt-2 text-balance">Daily home coming soon.</h1>
      <p className="text-body-l text-mute mt-3 max-w-prose">
        Placeholder for Phase 0.5. The Day-1 signature surface, the populated
        Day-N home, and the Day-91+ post-90 home all ship in later prompts.
      </p>

      <SundayPromptModal open={promptOpen} />
    </section>
  );
}
