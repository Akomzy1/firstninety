/**
 * Brief Generation Prompt — the single --ink surface on the Daily Home
 * in Probation Mode when the user is close to their review and hasn't
 * generated a brief yet. Per the prototype this is "the second-most-
 * important moment in Probation Mode" — it earns the ink slab, which
 * does NOT appear anywhere else on the home.
 *
 * Voice ("Ready when you are" / "That's enough" caveats) lives here, not
 * in copy props — it's intentional editorial work tied to this surface.
 *
 * Visible only when probation_mode_active, days_to_review ≤ 7, and the
 * brief has not yet been generated. Once generated, the Probation
 * banner's directive shifts to "edit one sentence" and this card hides.
 */
import Link from "next/link";

import { ArrowRight } from "lucide-react";

export function BriefGenerationPrompt() {
  return (
    <section
      aria-label="Brief generation prompt"
      className="bg-ink text-paper p-6 md:p-8 flex flex-col gap-3"
      style={{ borderRadius: "10px" }}
    >
      <p className="inline-flex items-center gap-2 text-eyebrow text-paper-3">
        <span
          aria-hidden
          className="block size-1.5 rounded-full bg-accent"
        />
        Ready when you are
      </p>
      <h3 className="font-display text-h2 text-paper text-balance">
        Generate your Probation Brief.
      </h3>
      <p className="text-body-l text-paper-3 max-w-prose">
        A one-page document drawn from what you&rsquo;ve done these 90
        days. You&rsquo;ll be able to edit it, then take it into your
        review.
      </p>
      <div className="mt-3">
        <Link
          href="/probation/brief"
          className="inline-flex h-12 items-center justify-center bg-paper text-ink px-5 font-medium gap-2 transition-opacity hover:opacity-90"
          style={{ borderRadius: "4px" }}
        >
          Generate the Brief
          <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
        </Link>
      </div>
      <p className="text-caption text-paper-3 mt-2">
        Takes about 30 seconds. You can regenerate up to 3 times.
      </p>
    </section>
  );
}
