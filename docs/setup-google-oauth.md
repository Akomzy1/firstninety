# Google OAuth setup for FirstNinety

Google sign-in is offered alongside email + password on the sign-in and
sign-up surfaces. The flow uses Supabase Auth's built-in OAuth handshake —
no first-party Google credentials are stored on the FirstNinety side.

## One-time setup

### 1. Google Cloud Console

1. Open <https://console.cloud.google.com> and create a new project named
   `FirstNinety` (or use the existing AkomzyAi Consulting Ltd project).
2. **APIs & Services → OAuth consent screen.** Configure as **External**,
   add the app name (FirstNinety), the support email, and the developer
   contact. Save.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID.**
   - Application type: **Web application**
   - Authorised JavaScript origins:
     - `https://kjopnxfwdmlibyrdurev.supabase.co`
     - `http://localhost:3000` (for local development)
     - The production app domain once it's live
   - Authorised redirect URIs:
     - `https://kjopnxfwdmlibyrdurev.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client secret**.

### 2. Supabase dashboard

1. Open <https://supabase.com/dashboard/project/kjopnxfwdmlibyrdurev/auth/providers>.
2. Enable **Google**.
3. Paste the Client ID and Client secret from the previous step.
4. Save. Supabase will display the exact redirect URL Google expects — copy
   that back into Google Cloud's "Authorised redirect URIs" if it differs.

### 3. Verify

Run `pnpm dev` and click **Continue with Google** on `/register`. The flow
should send you through Google's consent screen, then bounce back via
`/auth/callback` and land you on `/onboarding/step-1`.

If you instead end up at `/login?error=…`, Google OAuth isn't configured
on the Supabase side — re-check step 2.

## What's the redirect URL Supabase sends to Google?

Supabase auth hosts its own callback at
`https://<project-ref>.supabase.co/auth/v1/callback`. That URL must be in
Google Cloud's "Authorised redirect URIs". Supabase then forwards the
authenticated session to our app's `/auth/callback` route, which is what
`emailRedirectTo` / `redirectTo` in `app/(auth)/actions.ts` sets.

## Notes

- The `signup_source` field on `public.users` is captured via
  `raw_user_meta_data` on `auth.users`. The Google OAuth flow doesn't set
  this — only email + password sign-ups carry it (so Joberlify-sourced
  signups are still attributable when they pass through the OAuth handshake).
- Apple Sign-In is not enabled at MVP. If we add it post-launch, follow
  the same pattern: configure in Supabase → register the callback in Apple
  Developer.
