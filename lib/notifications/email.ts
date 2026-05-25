/**
 * Resend email helper.
 *
 * Returns `{ skipped: true }` when RESEND_API_KEY is unset so cron routes
 * don't crash in dev. In production, an unset key is an outright bug —
 * surface it loudly via console.error.
 */
import "server-only";

import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith("placeholder")) {
    if (process.env.NODE_ENV === "production") {
      console.error("[email] RESEND_API_KEY is unset in production");
    }
    return null;
  }
  if (!client) client = new Resend(key);
  return client;
}

export type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult =
  | { sent: true; id: string }
  | { sent: false; skipped: true }
  | { sent: false; error: string };

export async function sendEmail(
  params: SendEmailParams,
): Promise<SendEmailResult> {
  const resend = getClient();
  if (!resend) return { sent: false, skipped: true };

  const from = process.env.RESEND_FROM_EMAIL;
  if (!from || from.startsWith("placeholder")) {
    console.error("[email] RESEND_FROM_EMAIL is unset");
    return { sent: false, error: "missing_from" };
  }

  const result = await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });

  if (result.error) {
    console.error("[email] resend send failed", result.error);
    return { sent: false, error: result.error.message };
  }
  return { sent: true, id: result.data?.id ?? "" };
}
