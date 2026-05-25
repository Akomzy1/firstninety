/**
 * Onboarding layout — centred, generous whitespace, eyebrow "STEP N OF 4"
 * supplied by each step page. Production flow lands in Prompt 1.2; Step 4
 * is a signature design moment (Design Brief §10).
 */
import Link from "next/link";

import { Wordmark } from "@/components/marketing/Wordmark";

// Onboarding pages all call requireAuth + write to the user_context
// table — pure dynamic surfaces.
export const dynamic = "force-dynamic";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-paper px-4 py-7">
      <Link href="/" aria-label="FirstNinety home" className="mb-7">
        <Wordmark size="md" />
      </Link>
      <main className="w-full max-w-[720px]">{children}</main>
    </div>
  );
}
