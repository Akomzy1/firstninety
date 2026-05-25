/**
 * "What I remember" — settings/memory.
 *
 * Editorial document layout faithful to the rendered Memory Settings
 * prototype: breadcrumb eyebrow, H1, coach-voice lede, then four
 * sections (About role + start / What you've told me / What I will
 * never store / Destructive), then a colophon. Each fact list has
 * divider rules; per-row affordances reveal on hover. Section 2 rows
 * carry "Added <day>" date stamps.
 */
import Link from "next/link";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";

import { ContextFacts } from "./ContextFacts";
import { ResponsibilityEditor } from "./ResponsibilityEditor";
import { DeleteAllMemory } from "./DeleteAllMemory";

const ROLE_LABEL: Record<string, string> = {
  ba: "Business Analyst",
  pm: "Project Manager",
  sm: "Scrum Master",
  po: "Product Owner",
  da: "Data Analyst",
  aie: "AI Engineer",
};

export default async function MemorySettingsPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const [contextResult, responsibilitiesResult, userRoleResult] = await Promise.all([
    supabase
      .from("user_context")
      .select("start_date, sector, work_setup, probation_review_date, timezone")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("user_responsibilities")
      .select("id, description, source, created_at, updated_at")
      .eq("user_id", user.id)
      .eq("is_current", true)
      .order("created_at", { ascending: false }),
    supabase.from("users").select("primary_role").eq("id", user.id).single(),
  ]);

  const role = userRoleResult.data?.primary_role ?? null;
  const context = contextResult.data ?? {
    start_date: null,
    sector: null,
    work_setup: null,
    probation_review_date: null,
    timezone: null,
  };
  const responsibilities = responsibilitiesResult.data ?? [];

  return (
    <>
      {/* Top chrome — separate from the settings sub-nav since this surface
          is intentionally framed as a document, not a settings tab. */}
      <nav
        aria-label="Memory chrome"
        className="mb-7 flex items-center justify-between gap-4 text-body-s text-mute"
      >
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 hover:text-ink transition-colors"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
          Back to Settings
        </Link>
        <Link
          href="/settings/privacy"
          className="inline-flex items-center gap-2 text-mute-2 hover:text-ink transition-colors"
        >
          Export everything FirstNinety knows about me
          <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
        </Link>
      </nav>

      <article className="mx-auto max-w-(--max-reading) flex flex-col gap-7 pb-7">
        <header className="flex flex-col gap-5">
          <p className="text-eyebrow text-mute-2">
            Settings <span className="mx-1">→</span> Memory
          </p>
          <h1 className="text-h1 text-balance max-w-[14ch]">
            What I remember.
          </h1>
          <p className="text-body-l text-mute max-w-[56ch]">
            Everything below is what I have stored about you. You told me
            each of these things, and I&rsquo;m keeping them only because
            they help me coach you well. You can edit anything. You can
            delete anything. Nothing here is shared with anyone else.
          </p>
        </header>

        <section className="flex flex-col gap-4 pt-2">
          <p className="text-eyebrow">About your role and start</p>
          <ContextFacts
            roleLabel={role ? (ROLE_LABEL[role] ?? role) : null}
            startDate={context.start_date}
            sector={context.sector}
            workSetup={context.work_setup}
            probationDate={context.probation_review_date}
          />
          <p className="text-body-s text-mute italic">
            These shape everything I do. If something here is wrong, edit
            it — it&rsquo;ll change my missions, my Coach voice, and
            everything in between.
          </p>
        </section>

        <section className="flex flex-col gap-4 pt-2">
          <p className="text-eyebrow">What you&rsquo;ve told me</p>
          <ResponsibilityEditor responsibilities={responsibilities} />
        </section>

        <section className="flex flex-col gap-4 pt-2">
          <p className="text-eyebrow">What I will never store</p>
          <div className="flex flex-col gap-3 text-body text-mute max-w-prose">
            <p>
              <strong className="text-ink font-medium">
                The real names of your colleagues, your manager, your
                stakeholders, or your employer.
              </strong>{" "}
              When you paste anything from work into FirstNinety,
              I&rsquo;ll prompt you to anonymise first.
            </p>
            <p>
              <strong className="text-ink font-medium">
                Content from your employer&rsquo;s systems.
              </strong>{" "}
              I have no access to Jira, Slack, your work email, or your
              work calendar — and I won&rsquo;t ask for it.
            </p>
            <p>
              <strong className="text-ink font-medium">
                Anything you ever tell me to forget.
              </strong>{" "}
              When you delete something, it&rsquo;s gone — from my
              memory, from our database, from every future conversation
              we have.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-4 pt-2 border-t border-paper-3 mt-3">
          <p className="text-eyebrow">Destructive</p>
          <ul className="flex flex-col gap-5">
            <li className="flex flex-col gap-2">
              <DeleteAllMemory />
              <p className="text-body-s text-mute">
                Wipes &ldquo;What you&rsquo;ve told me&rdquo; only. Your
                role, start date, and other immutable facts stay.
              </p>
            </li>
            <li className="flex flex-col gap-2">
              <Link
                href="/settings/privacy"
                className="self-start text-body text-danger hover:underline underline-offset-4"
              >
                Delete my whole FirstNinety account
              </Link>
              <p className="text-body-s text-mute">
                Erases everything. Cancels your subscription. There is no
                undo.
              </p>
            </li>
          </ul>
        </section>

        <footer className="mt-7 pt-5 border-t border-paper-3 flex flex-wrap items-center justify-between gap-3 font-mono text-caption text-mute-2">
          <span>FirstNinety · /settings/memory · v1.0</span>
          <span>Design Brief §10 — signature moment</span>
        </footer>
      </article>
    </>
  );
}
