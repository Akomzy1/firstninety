/// <reference lib="webworker" />
/**
 * FirstNinety service worker.
 *
 * Caching strategy (MVP Spec §5.2, Build Prompt 0.4):
 *   - App shell (JS/CSS/fonts): pre-cached at install, then SWR via defaults
 *   - /playbook/*: stale-while-revalidate (Playbooks cached on first read)
 *   - /api/*: network-only (especially /api/claude/stream — AI must never cache)
 *   - /icons/*, /fonts/*: cache-first
 *
 * Compiled from this file into public/sw.js by @serwist/next during build.
 */
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkOnly,
  Serwist,
  StaleWhileRevalidate,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // 1. AI surfaces — never cached. Must come BEFORE /api/* generic rule.
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/api/claude/") ||
        url.pathname.startsWith("/api/coach/") ||
        url.pathname.startsWith("/api/situation-room/") ||
        url.pathname.startsWith("/api/simulator/"),
      handler: new NetworkOnly(),
    },
    // 2. Any other API route — network-only.
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkOnly(),
    },
    // 3. Playbook reads — stale-while-revalidate.
    {
      matcher: ({ url, request }) =>
        url.pathname.startsWith("/playbook/") && request.destination === "document",
      handler: new StaleWhileRevalidate({
        cacheName: "playbook-pages",
        plugins: [
          new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 30 }),
        ],
      }),
    },
    // 4. Icons + fonts — cache-first, long TTL.
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/icons/") || url.pathname.startsWith("/fonts/"),
      handler: new CacheFirst({
        cacheName: "static-assets",
        plugins: [
          new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 * 365 }),
        ],
      }),
    },
    // 5. Everything else — Serwist's defaults handle Next.js static assets,
    // Google Fonts, images, and HTML navigation falls (NetworkFirst).
    ...defaultCache,
  ],
});

serwist.addEventListeners();
