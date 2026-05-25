/**
 * Button — three variants per Design Brief §6.1.
 *  primary   — --ink bg, --paper text, 4px radius
 *  secondary — transparent bg, 1px --ink border, --ink text
 *  ghost     — no border, no bg, --ink text
 *
 * Spacing is per §5.3: --space-2 vertical, --space-3 horizontal. Sizing
 * defaults to a 48px touch target.
 */
import type { ComponentPropsWithRef, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Tone = "default" | "destructive";

type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: Variant;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  loadingText?: string;
  children?: ReactNode;
};

const SIZE_CLASS: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-3 text-body-s",
  md: "h-12 px-3 text-body",
  lg: "h-12 px-4 text-body",
};

function variantClass(variant: Variant, tone: Tone) {
  if (variant === "primary") {
    return tone === "destructive"
      ? "bg-danger text-paper hover:opacity-90 disabled:opacity-50"
      : "bg-ink text-paper hover:opacity-90 disabled:opacity-50";
  }
  if (variant === "secondary") {
    return tone === "destructive"
      ? "bg-transparent border border-danger text-danger hover:bg-danger hover:text-paper disabled:opacity-50"
      : "bg-transparent border border-ink text-ink hover:bg-ink hover:text-paper disabled:opacity-50";
  }
  // ghost
  return tone === "destructive"
    ? "bg-transparent text-danger hover:bg-paper-2 disabled:opacity-50"
    : "bg-transparent text-ink hover:bg-paper-2 disabled:opacity-50";
}

export function Button({
  variant = "primary",
  tone = "default",
  size = "md",
  loading = false,
  loadingText,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center font-medium transition-colors ${SIZE_CLASS[size]} ${variantClass(variant, tone)} ${className}`.trim()}
      style={{ borderRadius: "4px", ...(rest.style ?? {}) }}
    >
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
