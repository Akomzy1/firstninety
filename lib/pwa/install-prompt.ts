/**
 * PWA install prompt — Android/Chrome + iOS detection helpers.
 *
 * Captures the `beforeinstallprompt` event so we can defer firing until after
 * a "meaningful interaction" (Mission completion, Situation Room session, or
 * Simulator run — see Build Prompt 1.7). iOS Safari doesn't fire that event;
 * `isIOS()` lets the caller show the manual Share → Add to Home Screen
 * tutorial instead.
 *
 * PostHog tracking is stubbed via the imports — wired up in Prompt 0.5.
 */

type BeforeInstallPromptEvent = Event & {
  readonly platforms: ReadonlyArray<string>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt: () => Promise<void>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let listenerAttached = false;

const DISMISSAL_KEY = "firstninety:install-prompt-dismissed-at";
const DISMISSAL_COOLDOWN_DAYS = 14;

export function attachInstallPromptListener() {
  if (typeof window === "undefined" || listenerAttached) return;
  listenerAttached = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    if (typeof window !== "undefined") {
      // Hand-off hook for analytics — actual PostHog client wires up in 0.5.
      window.dispatchEvent(new CustomEvent("firstninety:install-prompt-available"));
    }
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("firstninety:install-prompt-accepted"));
    }
  });
}

export function isInstallPromptAvailable(): boolean {
  return deferredPrompt !== null;
}

export async function triggerInstallPrompt(): Promise<
  "accepted" | "dismissed" | "unavailable"
> {
  if (!deferredPrompt) return "unavailable";

  await deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;

  if (choice.outcome === "dismissed") {
    recordDismissal();
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(`firstninety:install-prompt-${choice.outcome}`),
    );
  }

  return choice.outcome;
}

export function recordDismissal() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DISMISSAL_KEY, new Date().toISOString());
}

export function isInCooldown(): boolean {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(DISMISSAL_KEY);
  if (!raw) return false;
  const dismissedAt = new Date(raw).getTime();
  if (Number.isNaN(dismissedAt)) return false;
  const ageMs = Date.now() - dismissedAt;
  return ageMs < DISMISSAL_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) && !("MSStream" in window);
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // Safari adds this non-standard flag when launched from home screen.
    Boolean(
      (window.navigator as Navigator & { standalone?: boolean }).standalone,
    )
  );
}
