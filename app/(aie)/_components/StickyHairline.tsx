"use client";

/**
 * Tiny client effect — toggles a 1px hairline beneath the sticky header
 * once the page has scrolled past 8px, matching the prototype's
 * `.site-header.is-stuck` behaviour.
 */
import { useEffect } from "react";

export function StickyHairline() {
  useEffect(() => {
    const header = document.getElementById("aie-site-header");
    if (!header) return;
    const onScroll = () => {
      if (window.scrollY > 8) {
        header.style.borderBottomColor = "var(--paper-3)";
      } else {
        header.style.borderBottomColor = "transparent";
      }
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
