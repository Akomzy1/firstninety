"use server";

/**
 * Settings → Billing server actions.
 *
 * `startCheckoutAction({plan})` creates a Stripe Checkout session for
 * the selected plan and redirects the browser to the hosted page.
 *
 * `openCustomerPortalAction()` creates a Customer Portal session and
 * redirects to it — used for plan change / cancel / payment method /
 * invoices once the user is on Pro.
 *
 * Both actions throw cleanly if Stripe env vars are missing; the UI
 * surfaces "Billing isn't configured yet" via the page render rather
 * than failing the action.
 */
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/server";
import {
  createCheckoutSession,
  createPortalSession,
  type CheckoutPlan,
} from "@/lib/billing/stripe";

function parsePlan(raw: FormDataEntryValue | null): CheckoutPlan {
  return raw === "yearly" ? "yearly" : "monthly";
}

export async function startCheckoutAction(formData: FormData): Promise<void> {
  const user = await requireAuth();
  const plan = parsePlan(formData.get("plan"));
  const { url } = await createCheckoutSession(user.id, plan);
  redirect(url);
}

export async function openCustomerPortalAction(): Promise<void> {
  const user = await requireAuth();
  const { url } = await createPortalSession(user.id);
  redirect(url);
}
