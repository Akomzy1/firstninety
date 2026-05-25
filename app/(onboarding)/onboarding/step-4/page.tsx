/**
 * Onboarding step 4 — memory introduction (signature design moment,
 * Design Brief §10). Renders the user's declared facts in Fraunces italic
 * body L with quiet pencil-edit links to the relevant earlier step,
 * followed by the privacy commitment paragraph and the "Begin Day 1" CTA.
 */
import Link from "next/link";

import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ensureOnboardingStep } from "@/lib/onboarding/state";

import { completeOnboardingAction } from "../actions";

const ROLE_LABEL: Record<string, string> = {
  ba: "Business Analyst",
  pm: "Project Manager",
  sm: "Scrum Master",
  po: "Product Owner",
  da: "Data Analyst",
  aie: "AI Engineer",
};

const WORK_SETUP_LABEL: Record<string, string> = {
  remote: "remote",
  hybrid: "hybrid",
  office: "in-office",
};

function formatDate(value: string | null): string | null {
  if (!value) return null;
  try {
    return new Date(`${value}T00:00:00Z`).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

export default async function OnboardingStep4Page() {
  const state = await ensureOnboardingStep(4);

  const facts: Array<{ text: string; editHref: string }> = [];

  if (state.primary_role) {
    facts.push({
      text: `You're starting as a ${ROLE_LABEL[state.primary_role] ?? state.primary_role}.`,
      editHref: "/onboarding/step-2",
    });
  }

  const startDate = formatDate(state.start_date);
  if (startDate) {
    facts.push({
      text: `You start on ${startDate}.`,
      editHref: "/onboarding/step-3",
    });
  }

  if (state.sector) {
    facts.push({
      text: `You're working in the ${state.sector} sector.`,
      editHref: "/onboarding/step-3",
    });
  }

  if (state.work_setup) {
    facts.push({
      text: `You're ${WORK_SETUP_LABEL[state.work_setup] ?? state.work_setup}.`,
      editHref: "/onboarding/step-3",
    });
  }

  const probationDate = formatDate(state.probation_review_date);
  if (probationDate) {
    facts.push({
      text: `Your probation review is on ${probationDate}.`,
      editHref: "/onboarding/step-3",
    });
  }

  return (
    <div className="flex flex-col gap-6 py-2">
      <header>
        <p className="text-eyebrow">Memory</p>
        <h1 className="text-h2 mt-2 text-balance">
          This is what I&rsquo;ll remember about you.
        </h1>
      </header>

      <ul className="flex flex-col gap-3">
        {facts.map((fact, idx) => (
          <li
            key={idx}
            className="group flex items-baseline gap-3 text-balance"
          >
            <span className="font-display italic text-body-l text-ink">
              {fact.text}
            </span>
            <Link
              href={fact.editHref}
              className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-mute hover:text-ink transition-opacity"
              aria-label={`Edit: ${fact.text}`}
            >
              <Pencil className="size-4" strokeWidth={1.5} aria-hidden />
            </Link>
          </li>
        ))}
      </ul>

      <div className="border-t border-paper-3 pt-5">
        <p className="text-eyebrow">Privacy</p>
        <div className="flex flex-col gap-3 text-body text-mute mt-3 max-w-prose">
          <p>
            We will not store the names of your colleagues, your manager,
            your stakeholders, or your employer. When you tell me about a
            situation, I&rsquo;ll quietly anonymise it for you.
          </p>
          <p>
            Everything I remember sits in your account. You can read,
            edit, or delete any of it from Settings &raquo; Memory at any
            time, and the change takes effect immediately.
          </p>
        </div>
      </div>

      <form action={completeOnboardingAction} className="relative mt-2 self-start">
        <Button type="submit" variant="primary" size="lg" className="min-w-[240px]">
          Begin Day 1
        </Button>
        <span
          className="pointer-events-none absolute -right-2 -top-2 size-2 rounded-full bg-accent"
          aria-hidden
        />
      </form>
    </div>
  );
}
