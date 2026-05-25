/**
 * Text input following Design Brief §6.3: --paper-2 fill, 1px --paper-3
 * border, 8px radius, 48px height, --mute placeholder, 2px ink focus ring
 * via the global :focus-visible rule.
 *
 * shadcn primitives ship later; this is the hand-rolled form-field for
 * Phase 1's auth and onboarding surfaces.
 */
import type { ComponentPropsWithRef } from "react";

type InputProps = ComponentPropsWithRef<"input"> & {
  invalid?: boolean;
};

export function Input({ invalid, className = "", ...rest }: InputProps) {
  const base =
    "h-12 w-full bg-paper-2 border border-paper-3 px-3 text-body text-ink placeholder:text-mute transition-colors";
  const tone = invalid
    ? "border-danger focus-visible:outline-danger"
    : "hover:border-mute focus-visible:border-ink";
  return (
    <input
      {...rest}
      className={`${base} ${tone} ${className}`.trim()}
      style={{ borderRadius: "8px", ...(rest.style ?? {}) }}
    />
  );
}
