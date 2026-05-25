/**
 * AI-Engineer marketing chrome — dark by default.
 *
 * This route group hosts the dedicated /ai-engineer surface (and any future
 * AIE-only marketing pages). It is intentionally outside the (marketing)
 * group so it can render its own dark header + dark footer instead of
 * nesting the light landing chrome.
 *
 * The dark surface is achieved by setting `data-theme="dark"` on the
 * top-level wrapper. Because globals.css scopes the dark palette to
 * `[data-theme="dark"]` (cascading through CSS variables exposed to
 * Tailwind via `@theme inline`), every utility below — bg-paper, text-ink,
 * text-mute, border-paper-3 — automatically switches to the dark token.
 */
import { AIEFooter } from "./_components/AIEFooter";
import { AIEHeader } from "./_components/AIEHeader";

export default function AIELayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-theme="dark"
      className="bg-paper text-ink min-h-screen flex flex-col"
    >
      <AIEHeader />
      <main className="flex-1">{children}</main>
      <AIEFooter />
    </div>
  );
}
