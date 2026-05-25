/**
 * Persona monogram — a coloured circle with initials. Used on the
 * Simulator brief, the active session turn rail, and any future
 * persona-referencing surface. Sizes:
 *   - "sm"  20px  — inline references in prose
 *   - "md"  40px  — turn rail in active sessions
 *   - "lg"  64px  — the brief screen (per the prototype's "larger
 *                   than elsewhere")
 *
 * Colour names map to the persona palette tokens from the Component
 * Library prototype. The mapping is centralised here so the rest of
 * the codebase never carries hex.
 */

export type PersonaColour =
  | "slate"
  | "rose"
  | "ochre"
  | "teal"
  | "moss"
  | "plum";

const PERSONA_BG: Record<PersonaColour, string> = {
  slate: "#6F7A86",
  rose: "#B58383",
  ochre: "#B08A4A",
  teal: "#3F6B6F",
  moss: "#6B7A57",
  plum: "#7A5C6E",
};

const SIZE_MAP: Record<"sm" | "md" | "lg", { px: number; font: number }> = {
  sm: { px: 20, font: 9 },
  md: { px: 40, font: 13 },
  lg: { px: 64, font: 18 },
};

type Props = {
  initials: string;
  colour?: PersonaColour | string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function PersonaMonogram({
  initials,
  colour,
  size = "md",
  className = "",
}: Props) {
  const dim = SIZE_MAP[size];
  const bg =
    typeof colour === "string" && colour in PERSONA_BG
      ? PERSONA_BG[colour as PersonaColour]
      : PERSONA_BG.slate;
  const text = (initials ?? "").trim().slice(0, 3).toUpperCase();

  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-paper font-body font-semibold tracking-wider ${className}`.trim()}
      style={{
        width: `${dim.px}px`,
        height: `${dim.px}px`,
        background: bg,
        fontSize: `${dim.font}px`,
        letterSpacing: "0.04em",
      }}
    >
      {text}
    </span>
  );
}

export { PERSONA_BG };
