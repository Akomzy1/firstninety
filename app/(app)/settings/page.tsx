/**
 * Settings index — redirects straight to the Memory tab. Each direct child
 * sub-route owns its own page; the index doesn't render UI of its own.
 */
import { redirect } from "next/navigation";

export default function SettingsIndexPage() {
  redirect("/settings/memory");
}
