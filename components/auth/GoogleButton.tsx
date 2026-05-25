/**
 * Continue-with-Google button. The form submits to a server action that
 * negotiates the OAuth handshake with Supabase; the user lands back at
 * `/auth/callback?next=/home`.
 *
 * If Google isn't configured in the Supabase project, the action redirects
 * to /login?error=… so the form on the next page surfaces the cause.
 */
import { Button } from "@/components/ui/Button";

import { signInWithGoogleAction } from "@/app/(auth)/actions";

export function GoogleButton({ label }: { label: string }) {
  return (
    <form action={signInWithGoogleAction}>
      <Button type="submit" variant="secondary" className="w-full">
        {label}
      </Button>
    </form>
  );
}
