/**
 * Client wrapper that reads the current pathname and renders the
 * matching StepProgress dots. Lets the (onboarding) layout render the
 * progress indicator without each step page having to pass its number.
 */
"use client";

import { usePathname } from "next/navigation";

import { StepProgress } from "./StepProgress";

function stepFromPath(pathname: string): 1 | 2 | 3 | 4 | null {
  const match = /\/onboarding\/step-(\d)/.exec(pathname);
  if (!match) return null;
  const n = Number(match[1]);
  if (n === 1 || n === 2 || n === 3 || n === 4) return n;
  return null;
}

export function StepProgressFromPath() {
  const pathname = usePathname();
  const step = stepFromPath(pathname);
  if (!step) return null;
  return <StepProgress current={step} />;
}
