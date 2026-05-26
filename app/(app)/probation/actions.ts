"use server";

/**
 * Probation Mode server actions.
 *
 * `generateProbationBriefAction` — kicks the Opus brief generator and
 * revalidates the page. UI surfaces denial reasons (limit reached,
 * not in probation mode) via a fresh page render reading `loadCurrent
 * ProbationBrief`.
 *
 * `captureProbationOutcomeAction` — records the user's review outcome
 * (`continued` / `extended` / `ended` / `prefer_not_to_say`),
 * deactivates Probation Mode (the formal review is over either way),
 * and — for the three non-private outcomes — auto-creates a Coach
 * thread voiced for the captured outcome per SKILL §8.3. Redirects
 * the user into that thread.
 */
import crypto from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/server";
import { createServiceClient } from "@/lib/db/service";
import { generateProbationBrief } from "@/lib/probation/brief";
import { captureServerEvent } from "@/lib/tracing/posthog-server";

export type ProbationOutcome =
  | "continued"
  | "extended"
  | "ended"
  | "prefer_not_to_say";

// --------------------------------------------------------------------- //
// Brief generation                                                       //
// --------------------------------------------------------------------- //

export async function generateProbationBriefAction(): Promise<void> {
  const user = await requireAuth();
  await generateProbationBrief({ userId: user.id });
  // The page reads the current brief on render — revalidating is
  // enough; denial reasons surface as the page's own state.
  revalidatePath("/probation/brief");
}

// --------------------------------------------------------------------- //
// Outcome capture                                                        //
// --------------------------------------------------------------------- //

const OUTCOME_TOPIC: Record<Exclude<ProbationOutcome, "prefer_not_to_say">, string> = {
  continued: "After my probation review — continued",
  extended: "After my probation review — extended",
  ended: "After my probation review",
};

function isValidOutcome(value: string): value is ProbationOutcome {
  return (
    value === "continued" ||
    value === "extended" ||
    value === "ended" ||
    value === "prefer_not_to_say"
  );
}

export async function captureProbationOutcomeAction(
  formData: FormData,
): Promise<void> {
  const user = await requireAuth();
  const raw = String(formData.get("outcome") ?? "").trim();
  if (!isValidOutcome(raw)) redirect("/probation/outcome");

  const supabase = createServiceClient();

  // 1. Stamp the user_context with the outcome + capture timestamp +
  //    deactivate the mode (the review is over either way).
  await supabase
    .from("user_context")
    .update({
      probation_outcome: raw,
      probation_outcome_captured_at: new Date().toISOString(),
      probation_mode_active: false,
    })
    .eq("user_id", user.id);

  try {
    await captureServerEvent({
      distinctId: user.id,
      event: "probation_outcome_captured",
      properties: { outcome: raw },
    });
  } catch (err) {
    console.warn("[probation] outcome event capture failed", err);
  }

  // 2. "Prefer not to say" routes straight home — no follow-up thread,
  //    no outcome-specific Coach voice, full respect for the user's
  //    decision not to engage.
  if (raw === "prefer_not_to_say") {
    revalidatePath("/probation/outcome");
    redirect("/home");
  }

  // 3. Auto-create a Coach thread for the other three outcomes.
  const topic = OUTCOME_TOPIC[raw as Exclude<ProbationOutcome, "prefer_not_to_say">];
  const { data: thread, error: threadErr } = await supabase
    .from("coach_threads")
    .insert({
      user_id: user.id,
      topic_title: topic,
    })
    .select("id")
    .single();
  if (threadErr || !thread) {
    console.error("[probation-outcome] thread create failed", threadErr);
    redirect("/home");
  }

  // 4. Seed the thread with a Coach message voiced for the outcome.
  //    Voice per SKILL §8.3 — forward-looking for Continued, calm
  //    practical for Extended, deeply respectful for Ended. These are
  //    canonical opening lines; the user's follow-up turns will run
  //    through the standard Coach engine which already carries the
  //    probation-aware system prompt.
  const seedContent = buildOutcomeSeedMessage(raw);

  // The user's outcome is now on user_context; a synthetic user
  // message acts as the "trigger" the assistant is responding to so
  // the thread reads naturally on load. Both rows insert atomically
  // enough — if either fails the thread already exists and the user
  // can keep going.
  await supabase.from("coach_messages").insert([
    {
      thread_id: thread.id,
      user_id: user.id,
      role: "user" as const,
      content: `[Outcome captured: ${raw}]`,
    },
    {
      thread_id: thread.id,
      user_id: user.id,
      role: "assistant" as const,
      content: seedContent,
    },
  ]);

  await supabase
    .from("coach_threads")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", thread.id);

  redirect(`/coach/${thread.id}`);
}

function buildOutcomeSeedMessage(
  outcome: Exclude<ProbationOutcome, "prefer_not_to_say">,
): string {
  switch (outcome) {
    case "continued":
      return [
        "You're on the team. The first 90 days are over and you didn't drown — that's a real thing, and worth letting yourself feel for a moment.",
        "",
        "The next quarter is different work. Now that you're not being assessed against probation criteria, you're being assessed against whether you become someone the team actually relies on. The shift is from \"showing competence\" to \"building trust.\" Those aren't the same thing.",
        "",
        "What's the first piece of work on your plate now that the review is behind you?",
      ].join("\n");
    case "extended":
      return [
        "Extended isn't ended. The next 30 days are a recalibration, and they're survivable. Three things worth knowing.",
        "",
        "First: extensions usually happen because a manager wants to see one specific thing change — not because they've decided against you. Find out what that one thing is. The question to ask is \"what specifically would you need to see in the next 30 days for this to land as continued?\" — not \"is there anything I can improve?\" One forces a concrete answer. The other doesn't.",
        "",
        "Second: don't try to be a different person for 30 days. Try to be more legible. Most of the time the gap isn't performance, it's visibility — your manager doesn't see enough of what you're actually doing. That's a fixable problem.",
        "",
        "Third: 30 days is short. Pick two things to do well, not seven. Tell me what you think those two should be and we'll work through them.",
      ].join("\n");
    case "ended":
      return [
        "That is hard. There is no way to dress it up.",
        "",
        "Whatever your manager said, and whatever you're telling yourself right now, here is what is also true: you did the work of the first 90 days inside a real organisation. You learned things this quarter that nobody who hasn't been in the seat can teach you. Those things travel with you to the next role.",
        "",
        "We don't need to talk through next steps today. Take a few days. When you want to start thinking about what comes next, come back and tell me what you're noticing.",
        "",
        "In the meantime, the one thing worth doing this week is writing down what you learned about yourself in these 90 days — not what you delivered, what you learned. Even rough notes. We'll work from those when you're ready.",
      ].join("\n");
  }
}

// --------------------------------------------------------------------- //
// Activation toggle (referenced from the future activation banner)       //
// --------------------------------------------------------------------- //

export async function activateProbationModeAction(): Promise<void> {
  const user = await requireAuth();
  const supabase = createServiceClient();
  await supabase
    .from("user_context")
    .update({ probation_mode_active: true })
    .eq("user_id", user.id);

  try {
    await captureServerEvent({
      distinctId: user.id,
      event: "probation_mode_activated",
      properties: { source: "probation_banner" },
    });
  } catch (err) {
    console.warn("[probation] activate event capture failed", err);
  }

  revalidatePath("/home");
  revalidatePath("/settings/probation");
}

// Silence unused-import lint when crypto isn't used (the file imports it
// for potential future use in token-based outcome capture).
void crypto;
