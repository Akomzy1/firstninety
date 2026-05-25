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
    description: "Bridging requirements between business and engineering.",
  },
  {
    value: "pm",
    label: "Project Manager",
    description: "Holding schedule, scope, and stakeholders together.",
  },
  {
    value: "sm",
    label: "Scrum Master",
    description: "Removing blockers; coaching the team through delivery.",
  },
  {
    value: "po",
    label: "Product Owner",
    description: "Owning the backlog and the value the product delivers.",
  },
  {
    value: "da",
    label: "Data Analyst",
    description: "Turning questions into queries, queries into answers.",
  },
  {
    value: "aie",
    label: "Junior / Associate AI Engineer",
    description: "Shipping ML and AI features in real production.",
  },
];

export default async function OnboardingStep2Page() {
  const state = await ensureOnboardingStep(2);

  return (
    <div className="flex flex-col gap-5 py-6 md:py-8">
      <header>
        <p className="text-eyebrow">Step 2 of 4</p>
        <h1 className="text-h1 mt-2 text-balance">What are you stepping into?</h1>
        <p className="text-body-l text-mute mt-3 max-w-prose">
          The closest one is fine. You can switch later in Settings &raquo; Account.
        </p>
      </header>

      <RoleForm roles={ROLES} initialValue={state.primary_role} />
    </div>
  );
}
