/**
 * Privacy settings — export data, delete account, manage memory.
 *
 * Each action gets its own client component so the page itself stays a
 * lean server component.
 */
import Link from "next/link";

import { ExportButton } from "./ExportButton";
import { DeleteAccountFlow } from "./DeleteAccountFlow";
import { Button } from "@/components/ui/Button";

export default function PrivacySettingsPage() {
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
