/**
 * Playbook Library index (Build Prompt 2.4, Playbook Library prototype).
 *
 * Two-line italic display headline ("Documents," / italic "with the
 * margins kept in."), 3-column grid of doc-style cards on desktop,
 * stacked on mobile.
 *
 * Probation Mode active surfaces the Probation Prep Pack at the top of
 * the grid with a special eyebrow badge — content for that playbook
 * ships in Phase 5.
 */
import Link from "next/link";

import { PlaybookCard } from "@/components/playbook/PlaybookCard";
import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";
import type { Database } from "@/lib/db/types.gen";

type WorkedExample = { annotations?: Array<{ section_id: string; note: string }> };

function countAnnotations(workedExamples: unknown): number {
  if (!Array.isArray(workedExamples)) return 0;
  let total = 0;
  for (const example of workedExamples as WorkedExample[]) {
    total += example?.annotations?.length ?? 0;
  }
  return total;
}

export default async function PlaybookLibraryPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  const [userRowResult, contextResult] = await Promise.all([
    supabase.from("users").select("primary_role").eq("id", user.id).single(),
    supabase
      .from("user_context")
      .select("probation_mode_active")
      .eq("user_id", user.id)
      .single(),
  ]);

  const role = userRowResult.data?.primary_role as
    | Database["public"]["Enums"]["role_enum"]
    | null;
  const probationActive = contextResult.data?.probation_mode_active ?? false;

  let playbooks: Array<{
    slug: string;
    role: string;
    title: string;
    variant: string | null;
    artefact_type: string;
    description: string;
    worked_examples: unknown;
  }> = [];

  if (role) {
    const { data } = await supabase
      .from("playbooks")
      .select(
        "slug, role, title, variant, artefact_type, description, worked_examples",
      )
      .eq("role", role)
      .eq("is_published", true)
      .order("title", { ascending: true });
    playbooks = data ?? [];
  }

  return (
    <section className="mx-auto flex max-w-(--max-page) flex-col gap-7 px-4 py-7 md:px-6 md:py-8">
      <header className="flex flex-col gap-2 max-w-3xl">
        <p className="text-eyebrow">Playbook Library</p>
        <h1 className="text-display text-balance leading-[1.05]">
          Documents,
          <br />
          <span className="font-display italic">with the margins kept in.</span>
        </h1>
        <p className="text-body-l text-mute mt-3 max-w-prose">
          Annotated worked examples, not empty templates. Each playbook
          carries the small things real practitioners did to make the
          document land.
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
          to see your playbooks.
        </p>
      ) : playbooks.length === 0 ? (
        <EmptyLibrary role={role} probationActive={probationActive} />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {playbooks.map((p) => (
            <li key={p.slug}>
              <PlaybookCard
                slug={p.slug}
                role={p.role}
                title={p.title}
                variant={p.variant}
                artefactType={p.artefact_type}
                description={p.description}
                annotationCount={countAnnotations(p.worked_examples)}
                isProbationPack={
                  probationActive && p.slug.includes("probation-prep")
                }
              />
            </li>
          ))}
        </ul>
      )}

      <p className="font-display italic text-body text-mute mt-2 max-w-prose">
        More playbooks are added every week.{" "}
        <span className="text-mute-2">Suggest one — coming soon.</span>
      </p>
    </section>
  );
}

function EmptyLibrary({
  role,
  probationActive,
}: {
  role: string;
  probationActive: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-2 border border-paper-3 bg-paper p-5 md:p-6 max-w-3xl"
      style={{ borderRadius: "10px" }}
    >
      <p className="text-eyebrow">
        {probationActive ? "Probation prep pending" : "Library pending"}
      </p>
      <p className="font-display text-h3 text-ink">
        No playbooks seeded for {role.toUpperCase()} yet.
      </p>
      <p className="text-body text-mute">
        Playbook content for the {role.toUpperCase()} role lands in
        Prompt 2.6; once seeded, this grid populates automatically.
      </p>
    </div>
  );
}
