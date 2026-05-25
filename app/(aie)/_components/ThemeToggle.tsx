"use client";

/**
 * Quiet theme toggle pill — Geist Mono "Dark"/"Light" label with a small
 * dot. Sits in the footer-bottom row per the prototype. The toggle flips
 * the layout wrapper's `data-theme` attribute between "dark" and "light"
 * so the CSS variables (and therefore every Tailwind utility on the
 * page) swap palettes in place.
 */
import { useEffect, useState } from "react";

function getWrapper(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>('[data-theme="dark"], [data-theme="light"]');
}

export function ThemeToggle() {
  const [mode, setMode] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const wrapper = getWrapper();
    if (wrapper) {
      const current = wrapper.getAttribute("data-theme");
      if (current === "light" || current === "dark") setMode(current);
    }
  }, []);

  const onClick = () => {
    const wrapper = getWrapper();
    if (!wrapper) return;
    const next = mode === "dark" ? "light" : "dark";
    wrapper.setAttribute("data-theme", next);
    setMode(next);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={mode === "light"}
      className="inline-flex items-center gap-2 border border-paper-3 text-mute hover:text-ink hover:border-mute transition-colors px-3 py-1.5 font-mono uppercase tracking-wider"
      style={{ borderRadius: "999px", fontSize: "11px" }}
    >
      <span
        aria-hidden
        className="block size-1.5 rounded-full bg-mute"
      />
      <span>{mode === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
