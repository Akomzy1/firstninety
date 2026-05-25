/**
 * Browser-side push subscription helpers.
 *
 * Pairs with the API routes under app/api/push/* and the web-push server
 * helper in lib/notifications/push.ts.
 */

const SUBSCRIBE_ENDPOINT = "/api/push/subscribe";
const UNSUBSCRIBE_ENDPOINT = "/api/push/unsubscribe";

export type PushPermission = "granted" | "denied" | "default" | "unsupported";

export function getPushPermission(): PushPermission {
  if (typeof window === "undefined") return "unsupported";
  if (!("Notification" in window)) return "unsupported";
  return window.Notification.permission;
}

export async function requestPushPermission(): Promise<PushPermission> {
  if (typeof window === "undefined") return "unsupported";
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  return result;
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(safe);
  // Allocate an explicit ArrayBuffer so the resulting view is typed as
  // Uint8Array<ArrayBuffer> rather than Uint8Array<ArrayBufferLike>; the
  // PushManager.subscribe signature only accepts the former.
  const buffer = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i += 1) view[i] = raw.charCodeAt(i);
  return view;
}

export async function subscribeToPush(): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (typeof window === "undefined") return { ok: false, error: "ssr" };
  if (!("serviceWorker" in navigator)) return { ok: false, error: "no_sw" };
  if (!("PushManager" in window)) return { ok: false, error: "no_push" };

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return { ok: false, error: "no_vapid_key" };

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const json = subscription.toJSON();
  const keys = (json.keys ?? {}) as { p256dh?: string; auth?: string };
  if (!json.endpoint || !keys.p256dh || !keys.auth) {
    return { ok: false, error: "invalid_subscription" };
  }

  const response = await fetch(SUBSCRIBE_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    }),
  });
  if (!response.ok) {
    return { ok: false, error: `server_${response.status}` };
  }
  return { ok: true };
}

export async function unsubscribeFromPush(): Promise<{ ok: boolean }> {
  if (typeof window === "undefined") return { ok: false };
  if (!("serviceWorker" in navigator)) return { ok: false };
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    await fetch(UNSUBSCRIBE_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ endpoint }),
    });
  }
  return { ok: true };
}
