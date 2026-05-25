/**
 * Onboarding step 2 — role selection.
 *
 * Six role cards. Picking one auto-submits via a client wrapper, but the
 * form also has a Continue button for keyboard users / non-JS contexts.
 */
import { ensureOnboardingStep } from "@/lib/onboarding/state";

import { RoleForm } from "./RoleForm";

const ROLES: ReadonlyArray<{
  value: "ba" | "pm" | "sm" | "po" | "da" | "aie";
  label: string;
  description: string;
}> = [
  {
    value: "ba",
    label: "Business Analyst",
    description: "Requirements, stakeholders, BRDs, workshops.",
  },
  {
    value: "pm",
    label: "Project Manager",
    description: "Schedule, scope, status, hard conversations.",
  },
  {
    value: "sm",
    label: "Scrum Master",
    description: "Ceremonies, blockers, team health, retros.",
  },
  {
    value: "po",
    label: "Product Owner",
    description: "Backlog, priorities, defending the no.",
  },
  {
    value: "da",
    label: "Data Analyst",
    description: "Dashboards, SQL, the question behind the question.",
  },
  {
    value: "aie",
    label: "AI Engineer",
    description: "Evals, hallucinations, RAG, costs.",
  },
];

export default async function OnboardingStep2Page() {
  const state = await ensureOnboardingStep(2);

  return (
    <div className="flex flex-col gap-5 py-2">
      <header className="text-center flex flex-col gap-3">
        <p className="text-eyebrow">
          <span className="font-mono text-mute-2 mr-3" style={{ fontSize: "11px" }}>
            02 / 04
          </span>
          Your role
        </p>
        <h1 className="text-display text-balance">What&rsquo;s your role?</h1>
        <p className="text-body-l text-mute mt-1 max-w-prose mx-auto">
          The closest one is fine. You can switch later in Settings &raquo; Account.
        </p>
      </header>

      <RoleForm roles={ROLES} initialValue={state.primary_role} />
    </div>
  );
}
