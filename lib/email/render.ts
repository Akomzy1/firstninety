/**
 * Email rendering helpers.
 *
 * Email clients (Gmail, Outlook, Apple Mail) have unpredictable CSS
 * support, so all styles are inlined and we stick to a tight subset:
 *   - System serif font for the headline (Fraunces falls back gracefully)
 *   - System sans-serif body
 *   - Plain `--paper`-equivalent backgrounds; no gradients
 *   - Text-link CTAs (no fancy buttons — they break in Outlook anyway)
 *
 * Voice rules per SKILL.md §2: senior-colleague register, no exclamation
 * marks, no emoji, no marketing-speak. The composer functions enforce
 * structure; copy is the caller's responsibility.
 *
 * Each render fn returns `{ subject, html, text }` where text is the
 * plain-text fallback for clients that don't render HTML.
 *
 * Pure functions — no I/O, no env-var reads. Safe to import from
 * Node scripts (e.g. scripts/test-emails.ts) outside the Next.js
 * runtime. The actual send enforcement (server-only) lives at
 * `sendEmail` in lib/notifications/email.ts.
 */

const PAPER = "#FAF7F2";
const PAPER_2 = "#F2EDE4";
const PAPER_3 = "#E7E0D2";
const INK = "#0E1116";
const MUTE = "#6F6A60";
const ACCENT = "#D9532C";

const FONT_DISPLAY =
  '"Fraunces", "Georgia", "Times New Roman", serif';
const FONT_BODY = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export type EmailContent = {
  subject: string;
  html: string;
  text: string;
};

/**
 * Wraps the body content in the standard FirstNinety email shell —
 * paper-coloured backdrop, centred 600px column, footer with the
 * wordmark + unsubscribe placeholder.
 */
export function shell({
  preheader,
  body,
  textBody,
}: {
  /** Hidden snippet shown in the inbox preview. ≤90 chars. */
  preheader: string;
  body: string;
  textBody: string;
}): { html: string; text: string } {
  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>FirstNinety</title>
</head>
<body style="margin:0;padding:0;background-color:${PAPER_2};font-family:${FONT_BODY};color:${INK};-webkit-font-smoothing:antialiased;">
<div style="display:none;font-size:1px;color:${PAPER_2};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
${escape(preheader)}
</div>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${PAPER_2};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background-color:${PAPER};border:1px solid ${PAPER_3};border-radius:10px;">
<tr><td style="padding:36px 40px 12px 40px;">
<span style="font-family:${FONT_DISPLAY};font-weight:600;font-size:20px;color:${INK};letter-spacing:-0.015em;">
First<span style="display:inline-block;width:0.34em;height:0.34em;background:${ACCENT};border-radius:50%;margin:0 0.18em;vertical-align:0.18em;"></span>90
</span>
</td></tr>
<tr><td style="padding:8px 40px 40px 40px;font-family:${FONT_BODY};font-size:15px;line-height:1.6;color:${INK};">
${body}
</td></tr>
<tr><td style="padding:24px 40px;border-top:1px solid ${PAPER_3};font-family:${FONT_BODY};font-size:12px;color:${MUTE};">
You're receiving this because you signed up at <a href="https://firstninety.vercel.app" style="color:${MUTE};text-decoration:underline;">firstninety</a>.
<br />
<a href="{{unsubscribe_url}}" style="color:${MUTE};text-decoration:underline;">Unsubscribe</a> from non-essential emails.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const text = `${textBody}

— FirstNinety
firstninety.vercel.app

Unsubscribe: {{unsubscribe_url}}`;

  return { html, text };
}

export function headline(text: string): string {
  return `<h1 style="margin:0 0 16px 0;font-family:${FONT_DISPLAY};font-weight:400;font-size:28px;line-height:1.2;letter-spacing:-0.015em;color:${INK};">${escape(text)}</h1>`;
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:${INK};">${escape(text)}</p>`;
}

export function muted(text: string): string {
  return `<p style="margin:0 0 16px 0;font-size:14px;line-height:1.55;color:${MUTE};">${escape(text)}</p>`;
}

export function ctaLink(href: string, label: string): string {
  return `<p style="margin:24px 0;"><a href="${escape(href)}" style="display:inline-block;background-color:${INK};color:${PAPER};text-decoration:none;padding:12px 20px;border-radius:4px;font-family:${FONT_BODY};font-weight:500;font-size:14px;">${escape(label)} &rarr;</a></p>`;
}

export function divider(): string {
  return `<hr style="margin:24px 0;border:0;border-top:1px solid ${PAPER_3};" />`;
}

function escape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
