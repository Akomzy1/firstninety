/**
 * "What FirstNinety knows about you" — settings/memory.
 *
 * Two sections per Design Brief §10 (signature surface):
 *   1. About your role and start — non-deletable facts on user_context.
 *      Role + start_date can be revised; sector / work setup / probation
 *      date can also be cleared.
 *   2. What you've told me — list of user_responsibilities rows. Each is
 *      editable in place; "Add something else I should know" appends.
 *
 * Facts render in Fraunces italic body L. The privacy commitment + a
 * destructive "delete everything" button live at the bottom.
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
      .select("id, description, source, created_at")
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
    <div className="flex flex-col gap-7">
      <header>
        <p className="text-eyebrow">What FirstNinety knows about you</p>
        <h1 className="text-h1 mt-2 text-balance">What I remember.</h1>
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
        <DeleteAllMemory />
      </section>
    </div>
  );
}
