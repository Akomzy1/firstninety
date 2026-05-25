/**
 * "What I remember" — /settings/memory.
 *
 * Editorial document, faithful to the rendered Memory Settings prototype.
 * Lives in the (doc) route group, intentionally outside (app)'s Sidebar
 * and the Settings sub-nav — the only chrome is a slim sticky top bar
 * with "Back to Settings" left and "Export everything FirstNinety knows
 * about me" right. Beneath that the document itself: breadcrumb eyebrow,
 * H1, coach-voice lede, four sections (role + start / told / never-store
 * / destructive), colophon.
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

export const metadata = {
  title: "Memory",
};

export default async function MemorySettingsPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const [contextResult, responsibilitiesResult, userRoleResult] =
    await Promise.all([
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
      {/* Sticky top chrome — the only chrome on this page. Backdrop-blurred
          paper with a hairline bottom border, mirroring the prototype. */}
      <nav
        aria-label="Memory chrome"
        className="sticky top-0 z-20 border-b border-paper-3 backdrop-blur-md"
        style={{ background: "rgba(250, 247, 242, 0.85)" }}
      >
        <div className="mx-auto flex max-w-(--max-page) items-center justify-between gap-6 px-5 py-3.5 md:px-8">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-1 py-1.5 text-body-s font-medium text-mute hover:text-ink transition-colors"
            style={{ borderRadius: "3px" }}
          >
            <ArrowLeft className="size-3.5" strokeWidth={1.5} aria-hidden />
            Back to Settings
          </Link>
          <Link
            href="/settings/privacy"
            className="inline-flex items-center gap-2 px-1 py-1.5 text-body-s font-medium text-mute-2 hover:text-ink transition-colors"
            style={{ borderRadius: "3px" }}
          >
            <span className="hidden sm:inline">
              Export everything FirstNinety knows about me
            </span>
            <span className="sm:hidden">Export</span>
            <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden />
          </Link>
        </div>
      </nav>

      {/* The editorial document — max 720px, generous vertical space. */}
      <main className="mx-auto max-w-(--max-reading) px-6 pt-16 md:pt-24 pb-32 md:pb-40">
        {/* Breadcrumb / eyebrow */}
        <p className="text-eyebrow text-mute-2 mb-7" style={{ letterSpacing: "0.12em" }}>
          Settings{" "}
          <span className="mx-2 text-mute-2" aria-hidden>
            →
          </span>{" "}
          Memory
        </p>

        {/* H1 */}
        <h1 className="text-h1 text-balance max-w-[14ch] mb-12">
          What I remember.
        </h1>

        {/* Coach-voice lede */}
        <p className="text-body-l text-mute max-w-[56ch] mb-24">
          Everything below is what I have stored about you. You told me each
          of these things, and I&rsquo;m keeping them only because they help
          me coach you well. You can edit anything. You can delete anything.
          Nothing here is shared with anyone else.
        </p>

        {/* Section 1 — About your role and start */}
        <section className="mt-24" aria-labelledby="sec-role">
          <p id="sec-role" className="text-eyebrow mb-6">
            About your role and start
          </p>
          <ContextFacts
            roleLabel={role ? (ROLE_LABEL[role] ?? role) : null}
            startDate={context.start_date}
            sector={context.sector}
            workSetup={context.work_setup}
            probationDate={context.probation_review_date}
          />
          <p className="mt-6 text-body-s text-mute italic max-w-[56ch]">
            These shape everything I do. If something here is wrong, edit
            it — it&rsquo;ll change my missions, my Coach voice, and
            everything in between.
          </p>
        </section>

        {/* Section 2 — What you've told me */}
        <section className="mt-24" aria-labelledby="sec-told">
          <p id="sec-told" className="text-eyebrow mb-6">
            What you&rsquo;ve told me
          </p>
          <ResponsibilityEditor responsibilities={responsibilities} />
        </section>

        {/* Section 3 — What I will never store */}
        <section className="mt-24" aria-labelledby="sec-never">
          <p id="sec-never" className="text-eyebrow mb-6">
            What I will never store
          </p>
          <div className="flex flex-col gap-6 max-w-[60ch]">
            <p className="text-body-l text-mute">
              <strong className="text-ink font-medium">
                The real names of your colleagues, your manager, your
                stakeholders, or your employer.
              </strong>{" "}
              When you paste anything from work into FirstNinety,
              I&rsquo;ll prompt you to anonymise first.
            </p>
            <p className="text-body-l text-mute">
              <strong className="text-ink font-medium">
                Content from your employer&rsquo;s systems.
              </strong>{" "}
              I have no access to Jira, Slack, your work email, or your
              work calendar — and I won&rsquo;t ask for it.
            </p>
            <p className="text-body-l text-mute">
              <strong className="text-ink font-medium">
                Anything you ever tell me to forget.
              </strong>{" "}
              When you delete something, it&rsquo;s gone — from my memory,
              from our database, from every future conversation we have.
            </p>
          </div>
        </section>

        {/* Section 4 — Destructive */}
        <section
          className="mt-24 pt-8 border-t border-paper-3"
          aria-labelledby="sec-destruct"
        >
          <p
            id="sec-destruct"
            className="text-eyebrow text-danger mb-6"
            style={{ opacity: 0.85 }}
          >
            Destructive
          </p>
          <ul className="list-none p-0 m-0">
            <li className="py-6 border-b border-paper-3">
              <DeleteAllMemory />
              <p className="mt-2 text-body-s text-mute max-w-[56ch]">
                Wipes &ldquo;What you&rsquo;ve told me&rdquo; only. Your
                role, start date, and other immutable facts stay.
              </p>
            </li>
            <li className="py-6">
              <Link
                href="/settings/privacy"
                className="inline-block font-display italic text-danger border-b border-dashed border-transparent hover:border-danger transition-colors"
                style={{
                  fontSize: "22px",
                  lineHeight: 1.4,
                  letterSpacing: "-0.005em",
                }}
              >
                Delete my whole FirstNinety account
              </Link>
              <p className="mt-2 text-body-s text-mute max-w-[56ch]">
                Erases everything. Cancels your subscription. There is no
                undo.
              </p>
            </li>
          </ul>
        </section>

        {/* Doc colophon */}
        <footer className="mt-32 pt-8 border-t border-paper-3 flex flex-wrap items-center justify-between gap-3 font-mono text-mute uppercase tracking-wider" style={{ fontSize: "11px" }}>
          <span>FirstNinety · /settings/memory · v1.0</span>
          <span>Design Brief §10 — signature moment</span>
        </footer>
      </main>
    </>
  );
}
