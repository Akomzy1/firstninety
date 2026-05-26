/**
 * Transactional email templates.
 *
 * Each function returns `{ subject, html, text }` ready to hand to
 * `sendEmail()`. Voice rules per SKILL.md §2: senior colleague,
 * direct, no exclamation marks, no emoji, no marketing-speak.
 *
 * Seven templates:
 *   - welcomeEmail            — sent on signup
 *   - sundayRecapEmail        — sent Sunday eveningish, user-local
 *   - probationActivationEmail — sent at T-21 days from review
 *   - trialEndingEmail        — sent 2 days before Stripe trial ends
 *   - cancellationConfirmEmail — sent on Stripe subscription cancel
 *   - dataExportReadyEmail    — sent when export is generated
 *   - passwordResetEmail      — Supabase Auth template wrapping; the
 *                               real send is configured in Supabase
 *                               Auth's templated emails. This function
 *                               exists so any custom-flow trigger
 *                               (e.g. forced reset from settings)
 *                               renders consistently with the rest.
 *
 * Pure functions — no I/O. Safe to import from Node scripts. The
 * actual send-side runtime enforcement is at `sendEmail` in
 * lib/notifications/email.ts.
 */

import {
  ctaLink,
  divider,
  headline,
  muted,
  paragraph,
  shell,
  type EmailContent,
} from "./render";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ============================================================ //
// 1. Welcome                                                    //
// ============================================================ //

export function welcomeEmail(params: { firstName?: string | null }): EmailContent {
  const greeting = params.firstName
    ? `Welcome, ${params.firstName}.`
    : "Welcome to FirstNinety.";
  const body = [
    headline("Welcome to FirstNinety. Day 1 starts now."),
    paragraph(
      "The first 90 days in a new tech role are when you have the most permission to ask basic questions and the least credibility to assume. FirstNinety is built for the gap between those two truths.",
    ),
    paragraph(
      "Today, you have one mission. Take 25 minutes; come back tomorrow.",
    ),
    ctaLink(`${APP_URL}/home`, "Open Day 1"),
    muted(
      "If you signed up by accident or someone else used your address, just reply and we'll close the account.",
    ),
  ].join("");
  const text = `${greeting}\n\nThe first 90 days in a new tech role are when you have the most permission to ask basic questions and the least credibility to assume. FirstNinety is built for the gap between those two truths.\n\nToday, you have one mission. Take 25 minutes; come back tomorrow.\n\nOpen Day 1: ${APP_URL}/home\n\nIf you signed up by accident, reply and we'll close the account.`;
  const { html, text: full } = shell({
    preheader: "Day 1 of your first 90 starts now. One mission today.",
    body,
    textBody: text,
  });
  return {
    subject: "Welcome to FirstNinety. Day 1 starts now.",
    html,
    text: full,
  };
}

// ============================================================ //
// 2. Sunday recap                                               //
// ============================================================ //

export function sundayRecapEmail(): EmailContent {
  const body = [
    headline("What's coming up this week?"),
    paragraph(
      "Two sentences are enough. The thing on your mind that you're not sure how to handle; what you'd like to be different by Friday. Sunday-evening reflection lands better than Monday-morning planning.",
    ),
    ctaLink(`${APP_URL}/home?sundayPrompt=1`, "Write two sentences"),
    muted(
      "We use what you write to shape your missions and what the Coach suggests in the week ahead. Nothing leaves your account.",
    ),
  ].join("");
  const text = `What's coming up this week?\n\nTwo sentences are enough. The thing on your mind that you're not sure how to handle; what you'd like to be different by Friday. Sunday-evening reflection lands better than Monday-morning planning.\n\nWrite two sentences: ${APP_URL}/home?sundayPrompt=1\n\nWe use what you write to shape your missions and what the Coach suggests. Nothing leaves your account.`;
  const { html, text: full } = shell({
    preheader: "Two sentences. The thing on your mind for the week ahead.",
    body,
    textBody: text,
  });
  return {
    subject: "What's coming up this week?",
    html,
    text: full,
  };
}

// ============================================================ //
// 3. Probation activation                                       //
// ============================================================ //

export function probationActivationEmail(params: {
  daysToReview: number;
}): EmailContent {
  const days = params.daysToReview;
  const dayNoun = days === 1 ? "day" : "days";
  const body = [
    headline(`Your probation review is in ${days} ${dayNoun}.`),
    paragraph(
      "From here, FirstNinety sharpens around the conversation. The Coach changes voice. Your missions shift toward evidence-gathering. A one-page Brief gets drafted from everything you've done these 90 days.",
    ),
    paragraph(
      "Most probation reviews are decided weeks before the review itself. The work is in the preparation, not the room.",
    ),
    ctaLink(`${APP_URL}/settings/probation`, "Switch on Probation Mode"),
    muted(
      "Probation Mode auto-deactivates on the review date. You can also turn it off any time from Settings.",
    ),
  ].join("");
  const text = `Your probation review is in ${days} ${dayNoun}.\n\nFrom here, FirstNinety sharpens around the conversation. The Coach changes voice. Your missions shift toward evidence-gathering. A one-page Brief gets drafted from everything you've done these 90 days.\n\nMost probation reviews are decided weeks before the review itself. The work is in the preparation, not the room.\n\nSwitch on Probation Mode: ${APP_URL}/settings/probation`;
  const { html, text: full } = shell({
    preheader: "Probation Mode is ready when you are. Quietly opt in from Settings.",
    body,
    textBody: text,
  });
  return {
    subject: `Your probation review is in ${days} ${dayNoun}.`,
    html,
    text: full,
  };
}

// ============================================================ //
// 4. Trial ending                                               //
// ============================================================ //

export function trialEndingEmail(params: {
  trialEndIso: string;
}): EmailContent {
  const date = formatDate(params.trialEndIso);
  const body = [
    headline("Your free trial ends in 2 days."),
    paragraph(
      `On ${date} your card will be charged for the first month of FirstNinety Pro. Nothing changes about your account — the same Coach, the same Situation Room, the same missions.`,
    ),
    paragraph(
      "If you'd rather not continue, you can cancel before the trial ends and you'll keep Pro access until then. No retention dance.",
    ),
    ctaLink(`${APP_URL}/settings/billing`, "Manage subscription"),
  ].join("");
  const text = `Your free trial ends in 2 days.\n\nOn ${date} your card will be charged for the first month of FirstNinety Pro. Nothing changes about your account — the same Coach, the same Situation Room, the same missions.\n\nIf you'd rather not continue, you can cancel before the trial ends and you'll keep Pro access until then. No retention dance.\n\nManage subscription: ${APP_URL}/settings/billing`;
  const { html, text: full } = shell({
    preheader: "Your card will be charged on the trial-end date. Cancel or continue from Settings.",
    body,
    textBody: text,
  });
  return {
    subject: "Your free trial ends in 2 days.",
    html,
    text: full,
  };
}

// ============================================================ //
// 5. Cancellation confirmation                                  //
// ============================================================ //

export function cancellationConfirmEmail(params: {
  accessUntilIso: string | null;
}): EmailContent {
  const until = params.accessUntilIso
    ? formatDate(params.accessUntilIso)
    : null;
  const accessLine = until
    ? `You keep Pro access until ${until}. After that, your account drops to Free — your Situation Room history and Survival Report stay with you.`
    : "Your account drops to Free immediately. Your Situation Room history and Survival Report stay with you.";
  const body = [
    headline("Your subscription is canceled."),
    paragraph(accessLine),
    paragraph(
      "If something specific drove the decision, we'd genuinely want to hear it. Reply to this email — it goes to a human.",
    ),
    divider(),
    muted(
      "If you change your mind, you can restart Pro from Settings whenever you want. No upgrade dance.",
    ),
  ].join("");
  const text = `Your subscription is canceled.\n\n${accessLine}\n\nIf something specific drove the decision, we'd genuinely want to hear it. Reply to this email — it goes to a human.\n\nManage account: ${APP_URL}/settings/billing`;
  const { html, text: full } = shell({
    preheader: until
      ? `Pro access until ${until}; account history stays.`
      : "Account dropped to Free; history stays.",
    body,
    textBody: text,
  });
  return {
    subject: "Your subscription is canceled.",
    html,
    text: full,
  };
}

// ============================================================ //
// 6. Data export ready                                          //
// ============================================================ //

export function dataExportReadyEmail(params: {
  downloadUrl: string;
  expiresHours: number;
}): EmailContent {
  const body = [
    headline("Your data export is ready."),
    paragraph(
      "Everything we hold about your account — Coach threads, Situation Room sessions, mission completions, declared memory entries, account context.",
    ),
    ctaLink(params.downloadUrl, "Download export"),
    muted(
      `The link expires in ${params.expiresHours} hours. If you need it again after that, request a fresh export from Settings → Privacy.`,
    ),
  ].join("");
  const text = `Your data export is ready.\n\nEverything we hold about your account — Coach threads, Situation Room sessions, mission completions, declared memory entries, account context.\n\nDownload: ${params.downloadUrl}\n\nThe link expires in ${params.expiresHours} hours. Request a fresh export from Settings → Privacy after that.`;
  const { html, text: full } = shell({
    preheader: `Download link valid for ${params.expiresHours} hours.`,
    body,
    textBody: text,
  });
  return {
    subject: "Your data export is ready.",
    html,
    text: full,
  };
}

// ============================================================ //
// 7. Password reset                                             //
// ============================================================ //
//
// Supabase Auth ships password-reset emails by default; this template
// is for the rare custom-flow path (e.g. an admin-triggered reset).
// For the default reset flow, configure the matching template in
// Supabase Dashboard → Authentication → Email Templates so the visual
// register lines up with the rest of the email suite.

export function passwordResetEmail(params: { resetUrl: string }): EmailContent {
  const body = [
    headline("Reset your FirstNinety password."),
    paragraph(
      "Use the link below to set a new password. The link expires in 1 hour.",
    ),
    ctaLink(params.resetUrl, "Reset password"),
    muted(
      "If you didn't request this, you can ignore the email and your password stays the same.",
    ),
  ].join("");
  const text = `Reset your FirstNinety password.\n\nUse the link below to set a new password. The link expires in 1 hour.\n\nReset: ${params.resetUrl}\n\nIf you didn't request this, you can ignore this email and your password stays the same.`;
  const { html, text: full } = shell({
    preheader: "Link expires in 1 hour. Ignore if you didn't request it.",
    body,
    textBody: text,
  });
  return {
    subject: "Reset your FirstNinety password.",
    html,
    text: full,
  };
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
