/**
 * FirstNinety wordmark.
 *
 * Set in Fraunces: italic 400 "First" + 600 "90" with a coral dot accent
 * floating top-right. This matches the prototype lockup across every
 * surface (Daily Home, Navigation Chrome, Marketing Landing, etc.) and
 * is the canonical brand mark.
 *
 * The Design Brief §9 text describes a "FirstNinety with elevated N"
 * lockup; the prototypes show the First90 numeric lockup instead. We
 * follow the prototypes per the docs-reconciliation call.
 */
import type { ComponentProps } from "react";

type WordmarkProps = {
  className?: string;
  tone?: "ink" | "paper";
  size?: "sm" | "md" | "lg";
  /** When true, hides the coral accent dot — useful inside dense chrome. */
  noAccent?: boolean;
} & ComponentProps<"span">;

const SIZE_TO_FONT_CLASS: Record<NonNullable<WordmarkProps["size"]>, string> = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

const SIZE_TO_DOT: Record<NonNullable<WordmarkProps["size"]>, string> = {
  sm: "size-1",
  md: "size-1.5",
  lg: "size-2",
};

export function Wordmark({
  className = "",
  tone = "ink",
  size = "md",
  noAccent = false,
  ...rest
}: WordmarkProps) {
  const tonalClass = tone === "ink" ? "text-ink" : "text-paper";
  return (
    <span
      {...rest}
      className={`inline-flex items-start gap-1 font-display ${SIZE_TO_FONT_CLASS[size]} ${tonalClass} ${className}`.trim()}
      aria-label="FirstNinety"
    >
      <span className="font-normal italic">First</span>
      <span className="font-semibold">90</span>
      {noAccent ? null : (
        <span
          className={`mt-1 rounded-full bg-accent ${SIZE_TO_DOT[size]}`}
          aria-hidden
        />
      )}
    </span>
  );
}

/**
 * AI-Engineer track variant — wordmark with a small subscript "ai" set in
 * Inter mute. Used only on the dedicated AI Engineer marketing surface.
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
