/**
 * Auth layout — centred form column, no chrome, wordmark at top.
 * Build Prompt 0.5; production auth surfaces land in Prompt 1.1.
 */
import Link from "next/link";

import { Wordmark } from "@/components/marketing/Wordmark";

// Login / register / callback all read or set auth cookies — never
// prerender.
export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-paper px-4 py-7">
      <Link href="/" aria-label="FirstNinety home" className="mb-6">
        <Wordmark size="lg" />
      </Link>
      <main className="w-full max-w-[480px]">{children}</main>
    </div>
  );
}
