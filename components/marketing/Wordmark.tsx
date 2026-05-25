/**
 * FirstNinety wordmark.
 *
 * Per the Marketing Landing v2.0 prototype, the canonical lockup is
 * `First • 90` — italic Fraunces "First", coral separator dot, regular
 * Fraunces "90". The dot reads as the typographic separator between
 * the two words, not as a top-right accent.
 *
 * Sizes: sm/md/lg for chrome; pass a `className` overriding font-size
 * for hero use.
 */
import type { ComponentProps } from "react";

type WordmarkProps = {
  className?: string;
  tone?: "ink" | "paper";
  size?: "sm" | "md" | "lg";
  /** Hides the coral dot — rare; mostly for monochrome contexts. */
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
      className={`inline-flex items-center gap-1.5 font-display ${SIZE_TO_FONT_CLASS[size]} ${tonalClass} ${className}`.trim()}
      aria-label="FirstNinety"
    >
      <span className="font-normal italic">First</span>
      {noAccent ? null : (
        <span
          className={`rounded-full bg-accent ${SIZE_TO_DOT[size]}`}
          aria-hidden
        />
      )}
      <span className="font-semibold">90</span>
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
