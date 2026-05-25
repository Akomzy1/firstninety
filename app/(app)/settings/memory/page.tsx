/**
 * "What FirstNinety knows about you" — settings/memory.
 *
 * Per the Memory Settings prototype:
 *   - Eyebrow: MEMORY · WHAT I KNOW ABOUT YOU
 *   - H1: "Read the margins."
 *   - Subhead in Fraunces italic: "Edit anything. Delete anything."
 *   - Row-based list with each fact in body L, source eyebrow above
 *   - Footer: Geist Mono entry counter on the right, "Forget everything"
 *     destructive link on the left
 *
 * Facts render in Fraunces italic body L. Inline edit + delete per row.
 */
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

function formatLastUpdated(value: string | null): string {
  if (!value) return "no updates yet";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "no updates yet";
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) {
      return `last updated ${d.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })}`;
    }
    return `last updated ${d.toLocaleDateString(undefined, {
      weekday: "short",
    })}`;
  } catch {
    return "no updates yet";
  }
}

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
  const lastUpdated =
    responsibilities[0]?.updated_at ?? responsibilities[0]?.created_at ?? null;
  const entryCount = responsibilities.length;

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-2">
        <p className="text-eyebrow">Memory · What I know about you</p>
        <h1 className="text-h1 text-balance">Read the margins.</h1>
        <p className="font-display italic text-h3 text-mute">
          Edit anything. Delete anything.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <p className="text-eyebrow">About your role and start</p>
        <ContextFacts
          roleLabel={role ? (ROLE_LABEL[role] ?? role) : "—"}
          startDate={context.start_date}
          sector={context.sector}
          workSetup={context.work_setup}
          probationDate={context.probation_review_date}
        />
      </section>

      <section className="flex flex-col gap-4">
        <p className="text-eyebrow">What you&rsquo;ve told me</p>
        <ResponsibilityEditor responsibilities={responsibilities} />
      </section>

      <section className="flex flex-col gap-4 border-t border-paper-3 pt-5">
        <p className="text-body text-mute max-w-prose">
          We will not store the names of your colleagues, your manager,
          your stakeholders, or your employer. To remove something, edit
          it or delete it — it disappears from our memory immediately.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <DeleteAllMemory />
          <p className="font-mono text-caption text-mute">
            {entryCount} {entryCount === 1 ? "entry" : "entries"}
            {" · "}
            {formatLastUpdated(lastUpdated)}
          </p>
        </div>
      </section>
    </div>
  );
}
