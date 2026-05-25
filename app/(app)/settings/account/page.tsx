/**
 * Account settings.
 *
 * Phase 1 surface: just the notifications toggle. Display-name editing,
 * email change, and password change land in later prompts.
 */
import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/db/server";

import { NotificationToggle } from "./NotificationToggle";

export default async function AccountSettingsPage() {
  const user = await requireAuth();
  const supabase = await createClient();
  const { data } = await supabase
    .from("push_subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .limit(1);

  const hasActive = Boolean(data && data.length > 0);

  return (
    <div className="flex flex-col gap-7">
      <header>
        <p className="text-eyebrow">Account</p>
        <h1 className="text-h1 mt-2 text-balance">Settings.</h1>
      </header>

      <section className="flex flex-col gap-3 max-w-prose">
        <h2 className="text-h3">Notifications</h2>
        <p className="text-body text-mute">
          Sunday recap nudges, follow-ups after a Situation Room session,
          probation prep reminders. Nothing else.
        </p>
        <NotificationToggle initiallyEnabled={hasActive} />
      </section>
    </div>
  );
}
