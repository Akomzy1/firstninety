/**
 * Marketing landing — Phase 0.5 placeholder upgraded to match the
 * Marketing Landing v2.0 prototype: massive centred First90 lockup
 * with a coral accent disk, italic tagline below, then two CTAs.
 *
 * Real long-form copy + sections (how it works, AI Engineer track,
 * pricing, social proof) lands in Build Prompt 4.3. This page is the
 * v1 hero on its own — visually faithful to the prototype.
 */
import Link from "next/link";

import { Button } from "@/components/ui/Button";

export default function MarketingLandingPage() {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-7 py-8 md:py-7">
      {/* Hero wordmark — massive First90 lockup with a coral accent disk. */}
      <h1 className="relative flex items-start gap-2 md:gap-3 text-balance">
        <span className="font-display font-normal italic text-[16vw] md:text-[12rem] leading-[0.95] text-ink">
          First
        </span>
        <span className="font-display font-semibold text-[16vw] md:text-[12rem] leading-[0.95] text-ink">
          90
        </span>
        {/* Coral disk — positioned to overlap the bottom-left of "First", like
            the prototype's offset accent ball rather than a tiny upper dot. */}
        <span
          className="pointer-events-none absolute left-[6%] bottom-[8%] size-[6vw] md:size-12 rounded-full bg-accent"
          aria-hidden
        />
        <span className="sr-only">FirstNinety</span>
      </h1>

      <p className="font-display italic text-h2 text-mute text-balance text-center max-w-prose">
        Survive probation. Then thrive.
      </p>

      <p className="text-body-l text-mute max-w-prose text-center -mt-2">
        The 90 days nobody trained you for, with someone in your corner.
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link href="/register">
          <Button variant="primary" size="lg" className="min-w-[200px]">
            Begin
          </Button>
        </Link>
        <Link href="#how-it-works">
          <Button variant="secondary" size="lg" className="min-w-[200px]">
            How it works
          </Button>
        </Link>
      </div>
    </section>
  );
}
