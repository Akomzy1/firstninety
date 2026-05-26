"use client";

/**
 * Fires a PostHog event each time one of the named landing-page sections
 * scrolls into the viewport on the first time it becomes ~30% visible.
 *
 * Used to measure which "How it works" features actually reach the
 * reader — signal for prioritising future editorial work and for the
 * hero-vs-deep-feature engagement decision.
 *
 * Implementation: a single IntersectionObserver watching the named
 * `<section id>` elements on the page. Once a section fires, it's
 * unobserved so the event is one-per-pageview, not one-per-scroll.
 *
 * Honours prefers-reduced-motion implicitly — IntersectionObserver
 * doesn't animate, just observes. No motion side effects.
 */
import { useEffect } from "react";

import { captureEvent, initPostHog } from "@/lib/tracing/posthog";

type Props = {
  /** DOM ids to watch. Each fires `landing_section_viewed` once. */
  sectionIds: ReadonlyArray<string>;
};

export function ScrollDepthTracker({ sectionIds }: Props) {
  useEffect(() => {
    initPostHog();
    if (typeof window === "undefined") return;
    if (typeof IntersectionObserver === "undefined") return;

    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id;
          if (!id || seen.has(id)) continue;
          seen.add(id);
          captureEvent("landing_section_viewed", {
            section_id: id,
            scroll_y: window.scrollY,
            viewport_height: window.innerHeight,
          });
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 },
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sectionIds]);

  return null;
}
