"use client";

/**
 * Links the client-side anonymous PostHog distinctId to the
 * authenticated user.id on first mount inside the authenticated
 * shell. Without this, client events (e.g. landing_section_viewed
 * for users who came from a marketing surface) never merge with the
 * server-side events keyed by user.id.
 *
 * Mounts once at the top of (app)/layout.tsx; the layout itself
 * passes the user.id (already loaded server-side for the auth gate).
 *
 * Identity is reset on sign-out via the same client lifecycle — when
 * the user signs out, the redirect to /login unmounts this component,
 * and the next mount fires identify against the next user. For an
 * explicit reset, the parent can pass `userId={null}`.
 */
import { useEffect } from "react";

import {
  identifyUser,
  initPostHog,
  resetIdentity,
} from "@/lib/tracing/posthog";

type Props = {
  userId: string | null;
  email?: string | null;
  role?: string | null;
};

export function IdentifyBridge({ userId, email, role }: Props) {
  useEffect(() => {
    initPostHog();
    if (userId) {
      identifyUser(userId, {
        ...(email ? { email } : {}),
        ...(role ? { primary_role: role } : {}),
      });
    } else {
      resetIdentity();
    }
  }, [userId, email, role]);

  return null;
}
