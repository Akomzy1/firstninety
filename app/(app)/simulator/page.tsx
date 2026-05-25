/**
 * Simulator — scenario library.
 *
 * Lists the published scenarios for the user's role. Each card opens
 * the cinematic brief at `/simulator/<slug>/brief`. Scenario rows live
 * in the `scenarios` table (seeded from content/scenarios/<role>/*.json
 * via scripts/seed-content).
 */
import Link from "next/link";

import { Clock } from "lucide-react";

import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";

export const metadata = {
  title: "Simulator",
};

const ROLE_LABEL: Record<string, string> = {
  ba: "Business Analyst",
  pm: "Project Manager",
  sm: "Scrum Master",
  po: "Product Owner",
  da: "Data Analyst",
  aie: "AI Engineer",
};

export default async function SimulatorIndexPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: userRow } = await supabase
    .from("users")
    .select("primary_role")
    .eq("id", user.id)
    .single();
  const role = userRow?.primary_role as
    | "ba"
    | "pm"
    | "sm"
    | "po"
    | "da"
    | "aie"
    | null;

  const scenarios = role
    ? (
        await supabase
          .from("scenarios")
          .select("slug, role, title, one_liner, estimated_minutes, difficulty")
          .eq("role", role)
          .eq("is_published", true)
          .order("difficulty", { ascending: true })
          .order("title", { ascending: true })
      ).data ?? []
    : [];

  const roleLabel = role
    ? ROLE_LABEL[role] ?? role.toUpperCase()
    : null;

  return (
    <section className="mx-auto w-full max-w-(--max-page) px-4 md:px-6 py-7 md:py-12">
      <header className="mb-10 flex flex-col gap-2 max-w-prose">
        {roleLabel ? (
          <p className="text-eyebrow">
            {roleLabel} &middot; Simulator
          </p>
        ) : (
          <p className="text-eyebrow">Simulator</p>
        )}
        <h1 className="text-h1 text-balance">
          Rehearse the rooms you&rsquo;re about to walk into.
        </h1>
        <p className="text-body-l text-mute mt-2">
          Short AI roleplays of the conversations you&rsquo;ll actually have.
          Each one is fifteen minutes; each one ends with an honest debrief.
        </p>
      </header>

      {role === null ? (
        <p className="text-body text-mute">
          Pick a role from{" "}
          <Link
            href="/settings/account"
            className="text-ink underline-offset-4 hover:underline"
          >
            Settings &raquo; Account
          </Link>{" "}
          to see your scenarios.
        </p>
      ) : scenarios.length === 0 ? (
        <p className="font-display italic text-body-l text-mute max-w-prose">
          No scenarios seeded for the {roleLabel} role yet. They land once
          content for this role is published.
        </p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-5 list-none p-0">
          {scenarios.map((scenario) => (
            <li key={scenario.slug}>
              <Link
                href={`/simulator/${scenario.slug}/brief`}
                className="block h-full border border-paper-3 bg-paper p-6 hover:border-ink transition-colors"
                style={{ borderRadius: "10px" }}
              >
                <p className="text-eyebrow mb-3">
                  {roleLabel} &mdash; Scenario
                </p>
                <h3
                  className="font-display font-normal text-ink mb-3 text-balance"
                  style={{
                    fontSize: "22px",
                    lineHeight: 1.25,
                    letterSpacing: "-0.005em",
                  }}
                >
                  {scenario.title}
                </h3>
                <p className="text-body-s text-mute mb-4 line-clamp-3">
                  {scenario.one_liner}
                </p>
                <p className="inline-flex items-center gap-2 text-caption text-mute">
                  <Clock className="size-3.5" strokeWidth={1.5} aria-hidden />
                  {scenario.estimated_minutes} min
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
