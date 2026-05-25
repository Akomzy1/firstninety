/**
 * Notifications on/off toggle. Calls subscribeToPush / unsubscribeFromPush
 * directly; state is derived from the local push subscription + the
 * row count passed in from the server component.
 */
"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/Button";
import {
  getPushPermission,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/pwa/push";

export function NotificationToggle({
  initiallyEnabled,
}: {
  initiallyEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initiallyEnabled);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleEnable() {
    setMessage(null);
    startTransition(async () => {
      const permission = getPushPermission();
      if (permission === "unsupported") {
        setMessage("Notifications aren't supported in this browser.");
        return;
      }
      if (permission === "denied") {
        setMessage(
          "Notifications are blocked in your browser settings. Re-enable there, then come back.",
        );
        return;
      }
      const result = await subscribeToPush();
      if (result.ok) {
        setEnabled(true);
      } else {
        setMessage(`Couldn't subscribe (${result.error ?? "unknown"}).`);
      }
    });
  }

  function handleDisable() {
    setMessage(null);
    startTransition(async () => {
      await unsubscribeFromPush();
      setEnabled(false);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="text-body font-medium text-ink">
          {enabled ? "On" : "Off"}
        </span>
        {enabled ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleDisable}
            loading={pending}
          >
            Turn off
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleEnable}
            loading={pending}
            loadingText="Subscribing…"
          >
            Turn on
          </Button>
        )}
      </div>
      {message ? (
        <p role="status" className="text-body-s text-mute">
          {message}
        </p>
      ) : null}
    </div>
  );
}
