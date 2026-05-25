/**
 * Privacy settings — export data, delete account, manage memory.
 *
 * Each action gets its own client component so the page itself stays a
 * lean server component.
 */
import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { requireAuth } from "@/lib/auth/server";
import { createServiceClient } from "@/lib/db/service";

import { setRealNameAdvisoryAction } from "./actions";
import { DeleteAccountFlow } from "./DeleteAccountFlow";
import { ExportButton } from "./ExportButton";

export default async function PrivacySettingsPage() {
  const user = await requireAuth();
  const service = createServiceClient();
  const { data: ctx } = await service
    .from("user_context")
    .select("disable_real_name_advisory")
    .eq("user_id", user.id)
    .maybeSingle();
  const realNameDisabled = Boolean(ctx?.disable_real_name_advisory);

  return (
    <div className="flex flex-col gap-7">
      <header>
        <p className="text-eyebrow">Privacy</p>
        <h1 className="text-h1 mt-2 text-balance">Your data.</h1>
        <p className="text-body-l text-mute mt-3 max-w-prose">
          Three things you can do: download everything we have on you,
          delete your account, or revise what we remember about you. None
          of these takes more than a tap.
        </p>
      </header>

      <section className="flex flex-col gap-3 max-w-prose">
        <h2 className="text-h3">Export your data</h2>
        <p className="text-body text-mute">
          A single JSON file with every row tied to your account —
          responsibilities, mission completions, simulator runs, situation
          sessions, coach conversations, probation artefacts.
        </p>
        <ExportButton />
      </section>

      <section className="flex flex-col gap-3 max-w-prose">
        <h2 className="text-h3">Manage memory</h2>
        <p className="text-body text-mute">
          Edit or delete individual facts and responsibilities. Changes
          take effect immediately.
        </p>
        <Link href="/settings/memory">
          <Button variant="secondary" className="self-start">
            Manage memory
          </Button>
        </Link>
      </section>

      <section className="flex flex-col gap-3 max-w-prose">
        <h2 className="text-h3">Safety</h2>
        <p className="text-body text-mute">
          When you type a real-looking name near a role (e.g.{" "}
          <span className="font-display italic">my lead dev Sam</span>) we
          show a soft nudge suggesting anonymisation. Some sectors use
          anonymised proper names — turn the nudge off if it gets in the
          way. PII and crisis checks stay on.
        </p>
        <form action={setRealNameAdvisoryAction}>
          <input
            type="hidden"
            name="disable"
            value={realNameDisabled ? "false" : "true"}
          />
          <Button
            type="submit"
            variant="secondary"
            className="self-start"
          >
            {realNameDisabled
              ? "Turn the real-name nudge back on"
              : "Turn off the real-name nudge"}
          </Button>
        </form>
        <p className="text-body-s text-mute">
          Currently:{" "}
          <span className="text-ink font-medium">
            {realNameDisabled ? "off" : "on"}
          </span>
          .
        </p>

        <Link
          href="/support"
          className="inline-flex items-center gap-1.5 text-body font-medium text-ink hover:text-mute transition-colors mt-2"
        >
          If you need support
          <ArrowRight className="size-3.5" strokeWidth={1.5} aria-hidden />
        </Link>
      </section>

      <section className="flex flex-col gap-3 max-w-prose">
        <h2 className="text-h3">Delete your account</h2>
        <p className="text-body text-mute">
          Permanent. Everything goes — responsibilities, transcripts,
          subscriptions, the lot. You&rsquo;ll be asked to type your email
          to confirm.
        </p>
        <DeleteAccountFlow />
      </section>
    </div>
  );
}
