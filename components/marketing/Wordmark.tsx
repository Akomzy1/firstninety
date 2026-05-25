/**
 * FirstNinety wordmark.
 *
 * Per Design Brief §9: Fraunces 600, the "N" in "Ninety" sits 2px above the
 * baseline of the rest of the lockup. Single token (--ink on light, --paper
 * on dark — inverted variant via `tone="paper"`).
 *
 * Use the `as` prop when the wordmark should be a link (`as="a"`) versus a
 * standalone label (default). Size scales with parent font-size.
 */
import type { ComponentProps } from "react";

type WordmarkProps = {
  className?: string;
  tone?: "ink" | "paper";
  size?: "sm" | "md" | "lg";
} & ComponentProps<"span">;

const SIZE_TO_FONT_CLASS: Record<NonNullable<WordmarkProps["size"]>, string> = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export function Wordmark({
  className = "",
  tone = "ink",
  size = "md",
  ...rest
}: WordmarkProps) {
  const tonalClass = tone === "ink" ? "text-ink" : "text-paper";
  return (
    <span
      {...rest}
      className={`font-display font-semibold tracking-tight ${SIZE_TO_FONT_CLASS[size]} ${tonalClass} ${className}`.trim()}
      aria-label="FirstNinety"
    >
      First
      <span className="inline-block -translate-y-[2px]">N</span>
      inety
    </span>
  );
}

/**
 * AI-Engineer track variant — wordmark with a small subscript "ai" set in
 * Inter. Used only on the dedicated AI Engineer marketing surface per
 * Design Brief §9 "Reserved variant".
 */
export function WordmarkAI(props: Omit<WordmarkProps, "size"> & { size?: WordmarkProps["size"] }) {
  return (
    <span className="inline-flex items-baseline gap-[2px]">
      <Wordmark {...props} />
      <span className="font-body text-mute text-body-s lowercase tracking-tight">
        _ai
      </span>
    </span>
  );
}
