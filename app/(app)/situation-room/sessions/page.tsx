/**
 * Past sessions — `/situation-room/sessions`.
 *
 * Per Design Prompts C4 state 3 the list is **editorial rows**, not
 * card chrome. Each row carries the date+time stamp, an entry-type
 * eyebrow tag, the situation summary in Fraunces italic, and a
 * "Reopen →" link on the right.
 *
 * Empty state quietly invites the user back to the intake field
 * rather than scolding them for not using the product.
 */
import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";

export const metadata = {
  title: "Past sessions",
};

const ENTRY_LABEL: Record<string, string> = {
  prep: "I need help with this",
  is_this_normal: "Is this normal?",
  debrief: "I just did something",
};

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
});

export default async function PastSessionsPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("situation_sessions")
    .select("id, entry_type, situation_summary, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = sessions ?? [];

  return (
    <section className="mx-auto w-full max-w-[784px] px-6 md:px-8 py-12 md:py-16 flex flex-col gap-7">
      <header className="flex flex-col gap-2">
        <p className="text-eyebrow">Your past sessions</p>
        <h1 className="text-h2 text-balance">What you&rsquo;ve been through.</h1>
      </header>

      {rows.length === 0 ? (
        <p className="text-body-l text-mute italic max-w-prose">
          Nothing yet. Walk into the next workplace moment and bring it
          here when it&rsquo;s on your mind &mdash; this page fills up as
          you use the Situation Room.
        </p>
      ) : (
        <ul className="flex flex-col list-none p-0 m-0 border-t border-paper-3">
          {rows.map((row) => (
            <li key={row.id} className="border-b border-paper-3">
              <Link
                href={`/situation-room/${row.id}`}
                className="group grid items-baseline gap-x-5 gap-y-1 py-5 md:grid-cols-[140px_140px_1fr_auto] hover:bg-paper-2 -mx-3 px-3 transition-colors"
                style={{ borderRadius: "6px" }}
              >
                <span className="text-caption text-mute-2">
                  {DATE_FMT.format(new Date(row.created_at))}
                </span>
                <span className="text-eyebrow text-mute">
                  {ENTRY_LABEL[row.entry_type] ?? row.entry_type}
                </span>
                <span
                  className="font-display italic text-ink line-clamp-2"
                  style={{ fontSize: "15px", lineHeight: 1.45 }}
                >
                  &ldquo;{row.situation_summary}&rdquo;
                </span>
                <span className="inline-flex items-center gap-1.5 text-body-s text-mute group-hover:text-ink transition-colors">
                  Reopen
                  <ArrowRight
                    className="size-3.5 group-hover:translate-x-0.5 transition-transform"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/situation-room"
        className="self-start inline-flex items-center gap-2 text-body-s text-mute hover:text-ink transition-colors"
      >
        <span aria-hidden>&larr;</span>
        Back to the Situation Room
      </Link>
    </section>
  );
}
