/**
 * Web Push helper. Wraps the `web-push` library with our VAPID config and
 * surfaces a single `sendPushToUser` helper that:
 *   - loads all active push_subscriptions for a user,
 *   - sends the payload to each endpoint in parallel,
 *   - automatically deactivates subscriptions that return 404 / 410 (the
 *     standard "this device unsubscribed" response from push services).
 *
 * No throws — push is fire-and-forget. Failures land in console.error and
 * are returned in the result so callers can flag them.
 */
import "server-only";

import webpush from "web-push";

import { createServiceClient } from "@/lib/db/service";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

let configured = false;

function configureVapid() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const contact = process.env.VAPID_CONTACT_EMAIL;
  if (!publicKey || !privateKey || !contact) {
    throw new Error(
      "VAPID keys missing. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, " +
        "and VAPID_CONTACT_EMAIL in .env.local.",
    );
  }
  webpush.setVapidDetails(contact, publicKey, privateKey);
  configured = true;
}

export type SendPushResult = {
  sent: number;
  failed: number;
  deactivated: number;
};

export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<SendPushResult> {
  configureVapid();

  const supabase = createServiceClient();
  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (error) {
    console.error("[push] failed to load subscriptions", error);
    return { sent: 0, failed: 0, deactivated: 0 };
  }
  if (!subs || subs.length === 0) {
    return { sent: 0, failed: 0, deactivated: 0 };
  }

  const message = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;
  const deactivateIds: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          message,
        );
        sent += 1;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          deactivateIds.push(sub.id);
        } else {
          failed += 1;
          console.error("[push] send failed", err);
        }
      }
    }),
  );

  if (deactivateIds.length > 0) {
    await supabase
      .from("push_subscriptions")
      .update({ is_active: false })
      .in("id", deactivateIds);
  }

  return { sent, failed, deactivated: deactivateIds.length };
}
