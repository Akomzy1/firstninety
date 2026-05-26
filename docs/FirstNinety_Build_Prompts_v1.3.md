# FirstNinety — Build Prompts v1.3

**Version:** 1.3
**Owner:** Tokunbo Akomolede (AkomzyAi Consulting Ltd)
**Status:** Ready for build
**Last updated:** 23 May 2026
**Companion documents:** PRD v1.9, MVP Spec v1.3, Competitive Analysis v1.1, Design Brief v1.0, CLAUDE.md v1.3, SKILL.md v1.3, Design Prompts v2.1

**Changes from v1.2 — Mid-journey signups and decoupled Probation Mode:**
- Prompt 1.2 (Onboarding) extended: three-entry-state detection (A/B/C) at step 3; mid-journey acknowledgement copy; backfill missed mission_completions for State B users; route State C users to post-Day-90 home on first login
- Prompt 2.1 (Daily Home) extended: third state for State B mid-journey welcome
- Prompt 2.3 (Mission Track) extended: handle `skipped_pre_signup` mission status visually
- Prompt 3.14 (Probation Mode) updated: explicit note that Probation Mode works independently of Mission Track state
- Prompt 3.17 added: Probation Mode in standalone post-Day-90 context for State C users
- Total prompts: 51 (up from 50)
- Phase 3 Exit Gate extended with State B/C verification
- Estimated build time: 33-41 days (up from 30-38; +3 days for three-state handling)
- All cross-references updated: PRD v1.8 → v1.9, MVP Spec v1.2 → v1.3, CLAUDE.md v1.2 → v1.3, SKILL.md v1.2 → v1.3

**Changes from v1.1 (carried forward from v1.2):**
- Prompt 3.4 extended with scope boundary rule (no technical execution help)

**Changes from v1.0 (carried forward from v1.1):**
- Prompts 3.15 and 3.16 added for Coach post-90 priming and post-Day-90 Daily Home state

---

## How to Use This Document

### Before you start

1. Open the project in Claude Code (or whichever Claude-integrated IDE you're using).
2. Make sure these files are loaded into the project's context (committed at the repo root):
   - `PRD v1.9`
   - `MVP Spec v1.3`
   - `CLAUDE.md v1.3`
   - `SKILL.md v1.3`
   - `Design Brief v1.0`
3. The prompts reference these by section number. Claude Code will read them as project documentation.

### Per-prompt workflow

1. Run prompts **in order**. Each prompt may depend on earlier ones being complete.
2. Paste one prompt into Claude Code. Let it complete. Review the output.
3. **Run the prompt's verification at the bottom.** If it fails, ask Claude to fix the specific failure before moving on.
4. Commit after each prompt completes successfully. Use the suggested commit message.
5. After completing each Phase, run the **Phase Exit Gate** check at the end of that phase. Don't proceed to the next phase if the exit gate isn't green.

### What Claude Code should and shouldn't do

- ✅ Read the docs, generate code, install dependencies, run migrations, write tests
- ✅ Ask sharp clarifying questions when something is genuinely ambiguous in the spec
- ❌ Pick versions or libraries not specified in MVP Spec §1.1 without asking
- ❌ Skip the verification step
- ❌ Add features not in the prompt ("I noticed you might want X — should I add it?" — no, finish what's asked first)

### How prompts are structured

Each prompt has four parts:
1. **Purpose** — one line on why this prompt exists
2. **Reference** — which docs/sections this prompt depends on
3. **The prompt** — what you paste into Claude Code (verbatim)
4. **Verification** — what to check before moving on

---

# Phase 0 — Setup (5 prompts)

Foundations. No user-visible features yet. Estimated 2–3 days.

---

## Prompt 0.1 — Repository scaffold & Next.js initialisation

**Purpose:** Stand up the Next.js 16 + TypeScript + Tailwind repo with the exact file structure from MVP Spec §1.2.

**Reference:** MVP Spec §1.1 (stack), §1.2 (repo structure), §1.3 (env vars)

**The prompt:**

> Initialise the FirstNinety repository as a Next.js 16 project (App Router, TypeScript strict mode, TailwindCSS, ESLint).
>
> Read MVP Spec v1.3 §1.2 and create the exact directory structure shown — every folder under `app/`, `components/`, `lib/`, `content/`, `supabase/`, `public/`, `scripts/`, `tests/`. Use `.gitkeep` files for currently-empty directories.
>
> Set up the `.env.example` file with every variable from MVP Spec §1.3, exactly as listed. Create a local `.env.local` containing placeholder values for development.
>
> Add a `README.md` at the repo root with: project name, one-line description, stack summary, how to run locally, and links to the companion docs.
>
> Copy the foundation docs (`PRD_v1.7.md`, `MVP_Spec_v1.1.md`, `CLAUDE.md`, `SKILL.md`, `Design_Brief_v1.0.md`) into a `docs/` folder at the repo root.
>
> Set up `package.json` scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `seed`. Use `pnpm` as the package manager.
>
> Configure `tsconfig.json` for strict mode, `noImplicitAny`, `strictNullChecks`, path aliases (`@/components/*`, `@/lib/*`, etc.).
>
> Configure `.gitignore` to exclude `.env.local`, `node_modules`, `.next`, `*.log`, and `.DS_Store`.
>
> Do not install shadcn/ui, Supabase, Stripe, or any other domain library yet — those come in later prompts. Just the bare Next.js + Tailwind scaffold.

**Verification:**
- `pnpm dev` starts a clean Next.js dev server
- The directory structure matches MVP Spec §1.2 exactly
- `.env.example` has every required variable
- Foundation docs are in `docs/` and readable
- `pnpm typecheck` and `pnpm lint` both pass on the empty scaffold

**Commit:** `chore: initial Next.js scaffold and repo structure`

---

## Prompt 0.2 — Design tokens, fonts, Tailwind config

**Purpose:** Convert Design Brief §3–§5 into live CSS variables and Tailwind config. This is the foundation every UI prompt depends on.

**Reference:** Design Brief §3 (type), §4 (colour), §5 (spacing), §6 (component vocabulary), §12 (premium checklist)

**The prompt:**

> Read Design Brief v1.0 §3, §4, §5, §6, and §12 thoroughly. We're going to make the design tokens live and enforceable.
>
> Set up Google Fonts via Next.js font optimisation: Fraunces (variable, optical sizing), Inter (variable), Geist Mono. Load via `next/font/google` in `app/layout.tsx`. Self-host as static font files in `public/fonts/` if Next.js font optimisation isn't sufficient.
>
> Create `app/globals.css` with every design token from Design Brief §4 (colour palette) and §5 (spacing scale) as CSS custom properties on `:root`, including the dark mode overrides in `[data-theme='dark']` and `@media (prefers-color-scheme: dark)`.
>
> Extend `tailwind.config.ts` so all design tokens are accessible as Tailwind utilities — `bg-paper`, `bg-ink`, `text-mute`, `bg-accent-soft`, `p-space-4` etc. Use the spacing scale from Design Brief §5.2 as the Tailwind spacing scale (do not use Tailwind's default scale).
>
> Configure Tailwind's `fontFamily` so `font-display` maps to Fraunces, `font-body` (the default) maps to Inter, and `font-mono` maps to Geist Mono.
>
> Set up the typography scale from Design Brief §3.2 as Tailwind utilities: `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-h4`, `text-body-l`, `text-body`, `text-body-s`, `text-caption`, `text-eyebrow`. Each should set the right size, line-height, letter-spacing, and font weight per Design Brief §3.2.
>
> Add `text-wrap: balance` as a Tailwind utility (`text-balance`) for headlines.
>
> Create `app/page.tsx` as a temporary design system reference page: render an H1, body paragraph, three button variants (primary/secondary/ghost using inline classes since shadcn isn't installed yet), and all 11 colour swatches as labelled blocks. This is the page we'll use to verify the design system before installing component libraries.
>
> Ensure the page background is `--paper` (`#FAF7F2`), not white. Ensure no `font-sans` references fall back to system fonts — Inter must load.

**Verification:**
- Page renders at `/` showing all 11 colour swatches, type scale, and three button variants
- Background is warm bone (`#FAF7F2`), not pure white
- Fraunces renders on the H1 (visible serif character)
- Inter renders on body text
- Dark mode works by toggling `<html data-theme='dark'>` in dev tools
- Inspecting CSS variables in dev tools shows every design token

**Commit:** `feat(design): design tokens, fonts, Tailwind config from Design Brief`

---

## Prompt 0.3 — Supabase setup, schema migrations, RLS

**Purpose:** Create the Supabase project, apply the full database schema from MVP Spec §2, enable RLS on every user-owned table.

**Reference:** MVP Spec §2 (full schema), §2.7 (triggers), §2.8 (RLS baseline)

**The prompt:**

> Set up a new Supabase project for FirstNinety. Use the Supabase CLI to manage migrations locally.
>
> Read MVP Spec v1.3 §2 (all schema sections) and §2.7 and §2.8.
>
> Create a single migration file at `supabase/migrations/00001_initial_schema.sql` that defines, in this order:
>
> 1. All enums from §2.2 to §2.6 (`role_enum`, `subscription_status_enum`, `tier_enum`, `memory_source_enum`, `work_setup_enum`, `mission_status_enum`, `scenario_run_status_enum`, `situation_entry_type_enum`, `coach_message_role_enum`, `probation_outcome_enum`, `probation_artefact_type_enum`)
> 2. All tables: `users`, `subscriptions`, `user_responsibilities`, `user_context`, `scenarios`, `playbooks`, `missions`, `mission_completions`, `scenario_runs`, `situation_sessions`, `coach_threads`, `coach_messages`, `ai_calls`, `usage_limits`, `probation_artefacts`, `push_subscriptions`
> 3. All indexes specified per table
> 4. The `set_updated_at` trigger function and apply to every table with `updated_at`
> 5. The three usage-increment trigger functions and their triggers (`increment_usage_simulator`, `increment_usage_situation`, `increment_usage_coach`)
> 6. RLS enabled on every user-owned table, with the four standard policies from §2.8 (`users_select_own`, `users_insert_own`, `users_update_own`, `users_delete_own`)
> 7. Read-only RLS policies on content tables (`scenarios`, `playbooks`, `missions`) — authenticated users can select where `is_published = true`
> 8. Service-role-only write policies on `subscriptions`, `ai_calls`, `usage_limits`
>
> Critical: every column type must match MVP Spec exactly. Every foreign key must use `on delete cascade` where specified. Every NOT NULL constraint must be in place.
>
> Set up Supabase client wrappers in `lib/db/`:
> - `lib/db/client.ts` — browser client using `@supabase/ssr`
> - `lib/db/server.ts` — server client (reads cookies)
> - `lib/db/service.ts` — service-role client (server-only, never imported by client code; add a runtime guard that throws if imported in a browser environment)
>
> Generate TypeScript types from the schema using `supabase gen types typescript` and place them in `lib/db/types.gen.ts`. Add a `pnpm db:types` script that regenerates them.
>
> Apply the migration locally (`supabase db reset` or equivalent) and confirm the schema is in place.
>
> Do not write any application code that uses these clients yet — that's for later prompts. Just the schema and the client wrappers.

**Verification:**
- Migration applies cleanly with no errors
- All 16 tables exist with correct columns
- RLS is enabled on every table (check via `select * from pg_policies`)
- `lib/db/types.gen.ts` is generated and contains the right types
- `lib/db/service.ts` throws if imported in a browser context (test this)
- Triggers fire correctly (insert a test row, confirm `updated_at` auto-sets)

**Commit:** `feat(db): initial schema, RLS, triggers, client wrappers`

---

## Prompt 0.4 — PWA shell, manifest, service worker stub

**Purpose:** Make the app installable as a PWA. Most of the configuration; service worker logic comes later.

**Reference:** MVP Spec §5 (PWA configuration), Design Brief §9 (wordmark for icon)

**The prompt:**

> Read MVP Spec v1.3 §5 thoroughly.
>
> Install `next-pwa` (or the current canonical Next.js PWA solution as of May 2026 — check the latest stable Next.js 16 PWA pattern before choosing). Configure it for App Router compatibility.
>
> Create `public/manifest.json` with the exact content from MVP Spec §5.1.
>
> Create the PWA icons in `public/icons/`:
> - `icon-192.png` (192x192)
> - `icon-512.png` (512x512)
> - `icon-maskable-512.png` (512x512, with safe-zone padding per maskable spec)
>
> These should be the FirstNinety wordmark — Fraunces 600, "FirstNinety" centred — rendered on `--ink` background (`#0E1116`) with `--paper` text (`#FAF7F2`). Use the maskable safe-zone for the maskable variant. Generate these icons programmatically with a script in `scripts/generate-pwa-icons.ts` if useful, or commit them as static PNGs — either is fine.
>
> Configure the service worker to:
> - Cache the app shell on install (JS, CSS, fonts, design token CSS)
> - Use stale-while-revalidate for `/playbook/*` routes (Playbooks cached on first read)
> - Use network-only for `/api/*` routes (especially `/api/claude/stream` — AI must never be cached)
> - Use cache-first for `/icons/*`, `/fonts/*`, and other static assets
>
> Add `<meta>` tags in `app/layout.tsx` for:
> - `theme-color: #0E1116`
> - `apple-mobile-web-app-capable: yes`
> - `apple-mobile-web-app-title: FirstNinety`
> - Apple touch icon links to `/icons/icon-192.png`
>
> Install the PWA install prompt logic stub in `lib/pwa/install-prompt.ts`:
> - Captures the `beforeinstallprompt` event on Android/Chrome
> - Provides a `triggerInstallPrompt()` helper
> - Logs to PostHog when an install prompt is shown / accepted / dismissed (PostHog is added in 0.7 — write the stub so it's ready)
> - iOS detection helper to show the manual Safari Share → Add to Home Screen tutorial instead
>
> Do not actually trigger the install prompt on any page yet — that's wired up later. Just the infrastructure.

**Verification:**
- Build succeeds and produces a service worker file in `.next/`
- Lighthouse PWA audit passes basic installability checks
- App installs to home screen on Chrome desktop (test via dev tools → Application → Manifest → Add to home screen)
- Manifest validates correctly
- Theme color matches `--ink`

**Commit:** `feat(pwa): manifest, icons, service worker stub`

---

## Prompt 0.5 — PostHog analytics, cost tracking stub, layout shells

**Purpose:** Wire up analytics from day one (PRD §10 requires cost-per-user as a first-class metric). Set up marketing and app layout shells without content.

**Reference:** MVP Spec §4.1 (cost-tracking event), §1.2 (file structure for layouts), Design Brief §13 (reference set for chrome)

**The prompt:**

> Install PostHog (`posthog-js` for client, `posthog-node` for server). Configure with env vars from `.env.example`.
>
> Create `lib/tracing/posthog.ts`:
> - Initialise PostHog client-side on app load
> - Disable in development unless `NEXT_PUBLIC_POSTHOG_ENABLED_DEV=true`
> - Capture page views automatically
> - Set user identification helper `identifyUser(userId, properties)` (will be called from auth flow later)
>
> Create `lib/tracing/ai-cost.ts`:
> - `trackAICall(payload: AICallPayload)` function that writes to `ai_calls` table via the service-role Supabase client AND fires a PostHog event with the same data
> - Stub it for now — we'll call it from real AI surfaces in Phase 3
> - Include a cost-calculation helper: `calculateClaudeCost(model, inputTokens, outputTokens)` with current per-1M-token rates as constants. Add Opus 4.7 and Haiku 4.5 rates from MVP Spec §4.1.
>
> Create the marketing layout at `app/(marketing)/layout.tsx`:
> - Slim top bar at max-width 1280px
> - Wordmark left (Fraunces 600, "FirstNinety", custom 2px elevated "N" of "Ninety")
> - Right-side text nav: "How it works · For AI Engineers · Pricing · Sign in"
> - Single "Begin" primary button on the far right
> - No footer yet (added in Phase 4)
> - Background: `--paper`
>
> Create the app layout at `app/(app)/layout.tsx`:
> - Sidebar (240px desktop, 64px icon-only tablet, hidden mobile)
> - Bottom nav (mobile only): five icons (Home / Track / Situation / Simulator / More)
> - Sidebar items: Home, Mission Track, Situation Room, Simulator, Coach, Playbook (no actual routes yet — just stubs)
> - Active state: `--paper-2` background, `--ink` text — NOT coral accent
> - User menu placeholder at bottom of sidebar (no functionality yet)
>
> Create the auth layout at `app/(auth)/layout.tsx`:
> - Centered, no chrome, max-width 480px
> - Wordmark at the top of the form
>
> Create the onboarding layout at `app/(onboarding)/layout.tsx`:
> - Similar to auth — centered, generous whitespace, max-width 720px
> - Eyebrow "STEP N OF 4" at the top of each step (parameterised)
>
> Place placeholder pages at:
> - `app/(marketing)/page.tsx` — empty hero saying "Marketing landing coming soon"
> - `app/(app)/home/page.tsx` — empty page saying "Daily home coming soon"
> - `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx` — stubs
> - `app/(onboarding)/step-1/page.tsx` — stub
>
> Verify routing works for each layout group.

**Verification:**
- Each layout renders without errors
- PostHog initialises in browser (check Network tab for posthog requests)
- The wordmark renders with custom 2px elevated "N" in "Ninety"
- Cost-calculation helper returns sensible values for sample inputs
- Marketing landing accessible at `/`, app home at `/home`, auth at `/login`, onboarding at `/onboarding/step-1`

**Commit:** `feat(analytics): PostHog setup, cost tracking stub, layout shells`

---

## Phase 0 Exit Gate

Before moving to Phase 1, confirm:

- [ ] `pnpm dev` runs without errors
- [ ] `pnpm typecheck` passes with no warnings
- [ ] `pnpm lint` passes with no warnings
- [ ] Supabase migration applies cleanly to a fresh database
- [ ] All 16 tables exist with RLS enabled
- [ ] PWA installs from Chrome dev tools
- [ ] PostHog events fire from the client
- [ ] All four layout groups render
- [ ] Design tokens visible in dev tools (`getComputedStyle(document.documentElement).getPropertyValue('--paper')` returns `#FAF7F2`)

If anything fails: stop. Fix it before proceeding.

---

# Phase 1 — Foundations (8 prompts)

Auth, onboarding, navigation, memory model. No AI yet. Estimated 4–5 days.

---

## Prompt 1.1 — Auth flows (sign in, sign up, OAuth, password reset)

**Purpose:** Working email + Google auth via Supabase.

**Reference:** MVP Spec §7.1 (signup flow), §7.3 (auth helpers)

**The prompt:**

> Build the auth surfaces using Supabase Auth.
>
> Create `lib/auth/server.ts` with the helpers from MVP Spec §7.3: `getCurrentUser`, `requireAuth`, `requirePro`, `getTierAllowance`. The `getTierAllowance` helper can throw "not implemented" for now — we wire it up in Phase 3.
>
> Build `app/(auth)/register/page.tsx`:
> - Email + password fields, plus a "Continue with Google" button
> - On submit, calls Supabase signUp, sets cookies, redirects to `/onboarding/step-1`
> - On successful signup, a database trigger (you'll add this) creates rows in `public.users`, `public.subscriptions`, `public.user_context`, `public.usage_limits`
>
> Build `app/(auth)/login/page.tsx`:
> - Email + password, "Continue with Google", "Forgot password?" link
> - On submit redirects to `/home` if onboarding is complete, otherwise to the next onboarding step
>
> Build `app/(auth)/reset-password/page.tsx` and `app/(auth)/callback/route.ts` for OAuth and email confirmation.
>
> Add a Supabase migration `00002_signup_triggers.sql`:
> - Trigger on `auth.users` insert that creates the corresponding `public.users` row (without role yet), `public.subscriptions` (tier=free), `public.user_context` (defaults), `public.usage_limits` (zeros)
>
> Auth UI must follow Design Brief: form fields use `--paper-2` fill, 1px `--paper-3` border, 8px radius, 48px height, 2px focus ring at 2px offset. Primary "Continue" button uses Primary variant from Design Brief §6.1. Errors render in `--danger` color but never with shouty exclamation marks.
>
> Configure Google OAuth in Supabase (note that the user will need to set up the Google Cloud project; document this in `docs/setup-google-oauth.md`).
>
> Update `app/layout.tsx` to redirect unauthenticated users away from `(app)` routes and authenticated users away from `(auth)` routes (use Next.js middleware).

**Verification:**
- Sign up with email creates a row in `auth.users` and corresponding rows in `public.users`, `public.subscriptions`, `public.user_context`, `public.usage_limits`
- Sign in works with both email and Google
- Reset password email is sent and resets the password
- Middleware correctly gates auth-protected routes
- Form styling matches Design Brief — warm-bone fields, low radius, no shouting

**Commit:** `feat(auth): sign in, sign up, OAuth, signup triggers`

---

## Prompt 1.2 — 4-step onboarding flow (with three entry states)

**Purpose:** The onboarding journey from registration to Day 1 of the app. Step 4 is a signature design moment. **Onboarding handles three entry states (A/B/C) per PRD v1.9 §7.1.**

**Reference:** PRD v1.9 §7.1 (three entry states), MVP Spec v1.3 §3 (completeOnboarding server action with entry state detection), Design Brief §10 (signature design moments — memory introduction), Design Prompts v2.1 C1 (onboarding flow) and C17 (mid-journey welcome state)

**The prompt:**

> Build the four onboarding steps as routes:
> - `/onboarding/step-1` — Welcome
> - `/onboarding/step-2` — Role selection
> - `/onboarding/step-3` — Where you're starting (start date, sector optional, work setup, probation date optional)
> - `/onboarding/step-4` — Memory introduction (THE SIGNATURE DESIGN MOMENT)
>
> Use the Design Prompt C1 from the design prototype as your visual reference — same copy, same layout, same editorial tone.
>
> Critical: step 3 must include the optional probation review date field per PRD v1.9 §6.6 activation flow. Use a date input with quick presets ("In 21 days", "In 3 months", "In 6 months", "I'll set this later"). **The product accepts any future probation date — 21 days, 6 months, or longer — because Probation Mode is independent of the 90-day Mission Track lifecycle (per PRD v1.9 §6.6).** If the user provides a date, store it in `user_context.probation_review_date`. The "I don't know yet" option leaves the field null.
>
> **Three-entry-state detection.** At step 3, compute the entry state from the user's start_date input:
> - **State A** if start_date ≥ today − 3 days (fresh start, including future start dates)
> - **State B** if today − 89 days ≤ start_date < today − 3 days (mid-journey within 90 days)
> - **State C** if start_date < today − 89 days (post-Day-90 at signup)
>
> Show an inline editorial acknowledgement *under the date input* based on detected state:
> - **State A:** no message (this is the default case)
> - **State B:** small Fraunces italic body S mute line: *"You've been at this {N} weeks. We'll start where you are — not at Day 1. Past weeks will be available to read if you're curious, but they're not the focus."*
> - **State C:** small Fraunces italic body S mute line: *"You're past your first 90 days at this role. We'll focus on the on-demand surfaces — Situation Room, Coach, Playbooks, Simulator. They're yours for as long as you're subscribed. If you have a future probation review, we'll help with that too."*
>
> The acknowledgement is gentle — no warning tone, no "you should have signed up earlier" framing. It's the product treating the user with dignity.
>
> On step 4, render the declared facts as Fraunces italic body L, one per line, with a small "edit" pencil icon revealed on hover. The list is built from the user's onboarding inputs:
> - For State A: *"You're starting as a [Role]."*
> - For State B: *"You're working as a [Role]. You started [N] weeks ago."*
> - For State C: *"You're working as a [Role]. You started [N] months ago."*
> - *"You're working in [Sector]."* (only if sector provided)
> - *"You're [Remote/Hybrid/Office]."* (only if work setup provided)
> - *"Your probation review is on [Date]."* (only if probation date provided)
>
> Below the list, the privacy commitment paragraph from Design Prompt C1 step 4 in full.
>
> Onboarding state needs to be resumable. Track completion via a `users.onboarding_completed_at` column — add it via a new migration `00003_onboarding_state.sql`. Add the `entry_state` column to `user_context` per MVP Spec v1.3 §2.3. Each step checks if previous steps are complete and redirects if not.
>
> On step 4 completion, the server action `completeOnboarding(payload)`:
> - Updates `users.primary_role`
> - Updates `user_context` with all collected fields including `entry_state` (computed), `current_day` (computed from start_date), `current_week` (computed), `probation_review_date` (if provided), `timezone` (if detectable from browser)
> - For **State B users:** backfills `mission_completions` rows with status `skipped_pre_signup` for all missions in weeks 1 through `current_week - 1`. These are accessible-to-read but not blocking the current week. Backfill happens in a transaction so partial failure doesn't leave the user in a half-state.
> - For **State C users:** does NOT create any `mission_completions` rows. There's no Mission Track for these users.
> - Inserts any responsibility hints into `user_responsibilities`
> - Sets `users.onboarding_completed_at` to now
> - Redirects to `/home` — the Daily Home component renders the appropriate state based on `entry_state` and `current_day`
>
> Track each step completion as a PostHog event (`onboarding_step_completed`), and entry state as a property on the `onboarding_completed` event (`entry_state: 'A' | 'B' | 'C'`). This becomes a key cohort dimension for retention analysis.

**Verification:**
- A new user with future or recent start_date lands on Day 1 empty state (State A)
- A user with start_date 22 days ago sees State B acknowledgement on step 3, lands on mid-journey welcome state on /home, has weeks 1-3 backfilled as `skipped_pre_signup`, current Week 4 is available
- A user with start_date 100 days ago sees State C acknowledgement on step 3, lands directly on post-Day-90 Daily Home state, has no `mission_completions` rows
- A State C user with a future probation date (e.g., 60 days from today) shows the probation date acknowledgement on step 4
- The four steps render in sequence; resumable mid-flow
- PostHog `onboarding_completed` event includes `entry_state` property

**Commit:** `feat(onboarding): 4-step flow with three-entry-state detection`

---

## Prompt 1.3 — Memory & responsibilities CRUD

**Purpose:** The "What FirstNinety knows about you" surface. Backed by `user_responsibilities` and `user_context`.

**Reference:** PRD §9.6 (memory model), MVP Spec §2.3 (user_responsibilities), §3.1 (server actions for memory)

**The prompt:**

> Build the memory management infrastructure.
>
> Create server actions in `app/(app)/settings/actions.ts`:
> - `addUserResponsibility(description: string, source: MemorySource)` → creates a row
> - `updateUserResponsibility(id: string, description: string)` → updates the row, sets `updated_at`
> - `deleteUserResponsibility(id: string)` → soft-delete by setting `is_current = false`
> - `listUserResponsibilities()` → returns all `is_current = true` rows ordered by created_at desc
> - `updateUserContextFact(field: 'sector' | 'work_setup' | 'start_date' | 'probation_review_date', value: any)` → updates the named field
>
> Build the settings page at `app/(app)/settings/memory/page.tsx`:
> - Eyebrow "WHAT FIRSTNINETY KNOWS ABOUT YOU"
> - Fraunces H1: "What I remember."
> - Below, two sections:
>   - **About your role and start** — non-deletable facts from `user_context` (role, start date, sector, work setup, probation date). Each is editable in place via the pencil icon.
>   - **What you've told me** — list of `user_responsibilities` rows. Each is editable in place, deletable, plus an "Add something else I should know" button at the bottom.
> - Each fact rendered in Fraunces italic body L per Design Brief §10 (signature surface).
> - Below the lists, a final paragraph (Body, mute): "We will not store the names of your colleagues, your manager, your stakeholders, or your employer. To remove something, edit it or delete it — it disappears from our memory immediately."
> - A "Delete everything I've told you" destructive ghost button at the very bottom, opens a confirmation modal.
>
> Add a route at `app/(app)/settings/page.tsx` as the settings index, with a sidebar listing: Memory · Billing · Privacy · Account.
>
> Wire up the "What I know" link in the app sidebar nav (from prompt 0.5) to route to `/settings/memory`.
>
> Cover with integration tests: create / list / update / delete a responsibility; update a `user_context` fact; verify RLS prevents users from accessing other users' memory.

**Verification:**
- A user can add, edit, delete a responsibility
- A user can edit their role, sector, work setup, start date, probation date
- The page renders facts in Fraunces italic
- Privacy commitment paragraph is prominent
- RLS prevents user A from accessing user B's memory (test by manually crafting requests with the wrong user_id)
- Delete-everything flow correctly removes all responsibilities and clears `user_context` optional fields (but leaves role and start date — those can't be cleared without re-onboarding)

**Commit:** `feat(memory): user responsibilities and context CRUD with settings UI`

---

## Prompt 1.4 — Sidebar nav, bottom nav, user menu

**Purpose:** The app chrome from Design Prompts A2.

**Reference:** Design Brief §6.1 (buttons), §13 (reference set for chrome), Design Prompts A2

**The prompt:**

> Replace the layout shell from prompt 0.5 with the production navigation.
>
> Build the desktop sidebar component `components/nav/Sidebar.tsx`:
> - 240px width
> - Background `--paper-2`
> - Wordmark at top
> - Primary nav: Home, Mission Track, Situation Room, Simulator, Coach, Playbook (each Inter 500 14px, sentence-case)
> - Active state: `--paper-2` background (NB this is inverted from the bg — use `--paper-3` for active when sidebar bg is `--paper-2`), `--ink` text. NO coral accent.
> - Divider then "What I know about you" link in Fraunces italic Body S
> - User menu at the bottom: monogram avatar + display name + role indicator. Click opens dropdown upward with: Account, Billing, Memory & Privacy, Sign out.
> - Tablet variant (768px): collapse to 64px icon-only, text on hover. Same component, responsive logic.
>
> Build the mobile bottom nav component `components/nav/BottomNav.tsx`:
> - 64px height, fixed bottom
> - Background `--paper`
> - 1px top border `--paper-3`
> - Five items: Home, Track, Situation, Simulator, More
> - Active state: icon in `--ink` with small dot indicator above (no label change)
> - Inactive: icon in `--mute`, no label
> - The "More" tab opens a drawer on the right (slide-in) with the rest of the navigation (Coach, Playbook, Settings, Sign out)
>
> Add the unread dot indicator on Situation Room (sidebar and bottom nav) — driven by an `unreadSituationCount` query that you can stub for now to return 0. We'll wire it up when Situation Room is built.
>
> Use Lucide icons (1.5px stroke, 20px default).
>
> Make sure the layout switches cleanly at the right breakpoints. Test on a real mobile device (or Chrome dev tools mobile emulation) — bottom nav must be touch-friendly.

**Verification:**
- Desktop: 240px sidebar with all six nav items, active state visible on the current route
- Tablet: 64px icon-only sidebar, text appears on hover
- Mobile: bottom nav with 5 items, "More" opens drawer with remaining nav
- User menu dropdown opens upward and contains all four items
- "What I know about you" link routes to `/settings/memory`
- No coral accent visible in nav chrome (except the unread dot on Situation Room — stubbed at 0 so not visible)

**Commit:** `feat(nav): sidebar, bottom nav, user menu`

---

## Prompt 1.5 — Sunday "What's coming up?" prompt mechanism

**Purpose:** The weekly memory refresh loop from PRD §7.3. Cron + push + email + UI surface.

**Reference:** PRD §7.3, MVP Spec §3.2 (cron route), §5.4 (push notifications)

**The prompt:**

> Build the Sunday recap prompt mechanism.
>
> Create the cron route `app/api/cron/sunday-prompt/route.ts`:
> - Authenticated via cron secret header
> - Runs every Sunday 18:00 user-local — computed per user from `user_context.timezone`
> - For each user where `user_context.timezone` resolves to ~18:00 right now: send a push notification (if subscribed) AND an email
> - Update `user_context.last_sunday_prompt_at` to now
>
> Configure Vercel Cron in `vercel.json` to hit this route every hour (the route filters to "right users right now" based on per-user timezone). Use a cron secret env var.
>
> Implement push notification sending in `lib/notifications/push.ts`:
> - Use web-push library
> - VAPID keys in env vars (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_CONTACT_EMAIL`) — add to `.env.example`
> - For each active subscription in `push_subscriptions`, send the notification payload
>
> Build the Sunday prompt email template using Resend:
> - Subject: "What's coming up this week?"
> - Body: short editorial paragraph asking the question, with a single CTA button "Tell FirstNinety" linking to `/home?sundayPrompt=1`
>
> Build the Sunday prompt UI surface (rendered as a modal/banner on `/home` when `?sundayPrompt=1` is present):
> - Eyebrow "SUNDAY RECAP"
> - Fraunces H3: "What's coming up this week?"
> - Body: "Any upcoming meetings, deliverables, or conversations on your mind?"
> - Large textarea (placeholder: "Two sentences are enough.")
> - Submit button "Remember this →"
> - Skip ghost button "Not this week"
>
> Server action `submitSundayPrompt(response: string)`:
> - Parse the response into one or more `user_responsibilities` entries (use a simple split on conjunctions or just store as one entry)
> - Source = `sunday_prompt`
> - Update `user_context.last_sunday_prompt_at`
> - Close the modal
>
> Show the modal at most once per Sunday — even if the user reloads the page, don't show again if `last_sunday_prompt_at` is within the last 24h.
>
> Add an integration test: simulate the cron hitting at the right hour for a user with timezone=Europe/London; assert push and email are sent; assert `last_sunday_prompt_at` updates correctly.

**Verification:**
- Cron route runs successfully when triggered manually
- For a test user with timezone matching current hour, both push and email send
- Sunday prompt modal renders correctly with `?sundayPrompt=1`
- Submitting creates a `user_responsibilities` row with source `sunday_prompt`
- Modal doesn't re-show within 24h of submission

**Commit:** `feat(memory): Sunday "what's coming up?" cron, push, email, UI`

---

## Prompt 1.6 — Privacy controls: delete account, export data

**Purpose:** GDPR compliance from day one (PRD §9.4, MVP Spec §10).

**Reference:** PRD §9.4 (privacy), MVP Spec §10 (definition of done safety)

**The prompt:**

> Build the privacy controls.
>
> Settings page `app/(app)/settings/privacy/page.tsx`:
> - Eyebrow "PRIVACY"
> - Fraunces H1: "Your data."
> - Body paragraph explaining the three things you can do: export your data, delete your account, manage memory (link to /settings/memory)
> - Three buttons:
>   - "Export my data" (primary)
>   - "Delete my account" (destructive ghost — confirmation flow)
>   - "Manage memory" (ghost, routes to /settings/memory)
>
> Server action `exportUserData()`:
> - Pulls every row owned by the user across all tables
> - Constructs a JSON file with structure: `{ user, subscription, context, responsibilities, missions_completed, scenario_runs, situation_sessions, coach_threads_with_messages, probation_artefacts }`
> - Stores temporarily in Supabase Storage with a signed URL valid for 24 hours
> - Returns `{ download_url: string }`
> - Triggers an email with the download URL via Resend
>
> Server action `deleteAccount()`:
> - Two-step destructive flow: first call returns `{ confirmation_required: true, deletion_token: string }`. Second call with the deletion token actually performs the delete.
> - Cascade-deletes everything owned by the user (most tables already have `on delete cascade` from the schema)
> - Cancels Stripe subscription if active (using Stripe API)
> - Deletes the `auth.users` row last
> - Logs to PostHog before deletion (for retention metrics)
>
> The deletion confirmation UI: full-screen modal, large Fraunces H2 "Delete your FirstNinety account.", body explaining what gets deleted, a text input requiring the user to type their email to confirm, primary destructive button "Permanently delete", ghost button "Cancel".
>
> Add the privacy policy and DPIA summary pages as static MD content rendered at `app/(marketing)/privacy/page.tsx` and `app/(marketing)/dpia/page.tsx`. Use the DPIA structure from ICO guidance. Fill with placeholders for now — Tokunbo will provide the actual content pre-launch.
>
> Test the full delete flow end-to-end: create a user, populate some data, run delete, assert all rows are gone, assert auth.users is gone.

**Verification:**
- Export downloads a JSON file with the user's data
- Email arrives with download link
- Delete flow requires email confirmation
- Delete cascades correctly — no orphan rows
- Stripe subscription cancels (test with a Stripe test subscription)
- Privacy and DPIA pages render at marketing routes

**Commit:** `feat(privacy): export data, delete account, privacy/DPIA pages`

---

## Prompt 1.7 — Push notification subscription flow

**Purpose:** Working web push subscription (Android/Chrome) and iOS handling.

**Reference:** MVP Spec §5.4, §5.5

**The prompt:**

> Build the push notification subscription flow.
>
> Create `lib/pwa/push.ts`:
> - `requestPushPermission()` — prompts the user for notification permission
> - `subscribeToPush()` — registers a service worker subscription, sends it to the server
> - `unsubscribeFromPush()` — removes the subscription server-side and unsubscribes locally
>
> API route `app/api/push/subscribe/route.ts`:
> - POST handler accepts the subscription JSON
> - Validates the user is authenticated
> - Upserts into `push_subscriptions` (unique on user_id + endpoint)
> - Returns 200
>
> API route `app/api/push/unsubscribe/route.ts`:
> - POST handler removes the subscription for the authenticated user
>
> Add a notification permission prompt to the app — but only show it *after* the user's first meaningful interaction (per MVP Spec §5.5):
> - "Meaningful interaction" = completing a mission, completing a Situation Room session, or running a Simulator scenario (these surfaces don't exist yet — wire up the listener so it fires when those events happen in later phases)
> - Add a `useTriggerNotificationPrompt()` hook that other components can call
> - When triggered, show a polite modal asking permission, with explanation of what notifications will be used for
> - Store dismissal in localStorage with a 14-day cooldown
>
> Add an iOS-specific install tutorial component `components/pwa/IOSInstallTutorial.tsx`:
> - Detects iOS Safari
> - Shows an overlay walking through: tap Share button → scroll to "Add to Home Screen" → tap Add
> - Only shows after first meaningful interaction
> - Dismissible
>
> Add a setting in `/settings/account` to toggle notifications on/off.

**Verification:**
- On Chrome (desktop or Android), the notification permission prompt fires after a stubbed "meaningful interaction" event
- Granting permission creates a `push_subscriptions` row
- A test notification can be sent from the server and received in the browser
- iOS Safari shows the install tutorial (test with an iPhone or Safari mobile emulator)
- Settings toggle disables notifications

**Commit:** `feat(push): subscription flow, iOS install tutorial`

---

## Prompt 1.8 — Probation Mode capture & activation infrastructure

**Purpose:** Wire up the probation date capture flow (per PRD §6.6 activation), the Day-70 trigger, and the Settings surface for managing probation date and window. Probation Mode features themselves come in Phase 3.

**Reference:** PRD §6.6 (activation), §7.5 (probation flow), MVP Spec §2.3 (probation columns on user_context), §3.1 (probation server actions)

**The prompt:**

> Build the probation date capture and activation trigger infrastructure. The actual Probation Mode features (banner, Brief, scenario, fourth Situation entry) come in Phase 3.14 — this prompt is just the plumbing.
>
> Server actions in `app/(app)/settings/actions.ts`:
> - `setProbationReviewDate(date: string | null)` — store or clear; auto-calculates `probation_window_days` default 21
> - `setProbationWindow(days: number)` — override default 21-day window (min 7, max 90; validate)
> - `activateProbationMode()` — sets `probation_mode_active = true`; idempotent
> - `deactivateProbationMode()` — sets `probation_mode_active = false`
> - `getProbationStatus()` — returns `{ active, days_to_review, window_days, brief_generated, review_date }`
>
> Build the probation settings UI at `app/(app)/settings/probation/page.tsx`:
> - Eyebrow "PROBATION"
> - Fraunces H1: "Your probation review."
> - If review date is set: show it in Fraunces italic body L, plus "X days away" caption mute. Show the window length and a control to adjust it. Show whether Probation Mode is active.
> - If not set: a single CTA "Tell us when your probation review is" → opens an inline date input
> - A small body paragraph explaining when Probation Mode auto-activates (21 days before, or whatever the window is)
>
> Cron route `app/api/cron/probation-activation/route.ts`:
> - Runs daily at 09:00 user-local (use the same hourly-tick pattern from the Sunday prompt)
> - For each user where `probation_review_date IS NOT NULL` and `probation_mode_active = false` and `(probation_review_date - probation_window_days) <= today`:
>   - Send push notification: "Your probation review is in {N} days. Want to switch on Probation Mode?"
>   - Send email with same message
>   - Set a flag `probation_activation_prompted_at` (add to schema migration `00004_probation_activation.sql`)
> - Also handles the deactivation case: for any user past their `probation_review_date` and `probation_mode_active = true`, automatically deactivate
>
> Add to `vercel.json` cron config.
>
> The actual activation banner UI on `/home` and the activation modal both come in Phase 3.14 — for now just verify the cron logic triggers correctly and the data is captured.
>
> Add integration tests:
> - Setting a probation date stores it correctly
> - Setting window length validates (must be 7-90)
> - Cron triggers activation prompt when review is 21 days away
> - Cron auto-deactivates Probation Mode when review date passes

**Verification:**
- Setting a probation date persists it
- Window length validation works (7-90 range enforced)
- Cron triggers activation prompt at T-21 days (test by setting a date and manually invoking the cron)
- Cron deactivates Probation Mode automatically after review date
- Settings page renders correctly for both "date set" and "no date" states

**Commit:** `feat(probation): date capture, activation cron, settings UI`

---

## Phase 1 Exit Gate

- [ ] A user can sign up, complete onboarding, see their declared memory, edit it, delete their account
- [ ] Sunday cron fires for a test user at the right hour
- [ ] Push notifications subscribe and unsubscribe
- [ ] Probation date capture works end-to-end
- [ ] Probation activation cron logic verified (won't show UI until Phase 3.14)
- [ ] Privacy export and delete account both work end-to-end
- [ ] No use of pure white or pure black anywhere
- [ ] No emojis, no exclamation marks in product UI

Don't proceed to Phase 2 until this gate is green.

---

# Phase 2 — Mission Track + Playbooks (6 prompts)

The content surfaces. Still no AI. Estimated 4–5 days.

---

## Prompt 2.1 — Content schema validators, seed script

**Purpose:** The content pipeline. Author content as JSON files in `content/`, validate, seed to Postgres.

**Reference:** MVP Spec §6 (content authoring and loading)

**The prompt:**

> Build the content authoring pipeline.
>
> Install Zod for schema validation. Create `lib/content/schemas.ts` with Zod schemas for each content type:
> - `ScenarioSchema` — matches the format in MVP Spec §6.1 exactly
> - `PlaybookSchema` — matches §6.2
> - `MissionSchema` — matches §6.3
> - `CoachPromptSchema` — markdown content with frontmatter
>
> Create `lib/content/loaders.ts`:
> - `loadScenariosFromDisk()` — reads `content/scenarios/{role}/*.json`, validates each, returns array
> - `loadPlaybooksFromDisk()` — same for playbooks
> - `loadMissionsFromDisk()` — same for missions
> - `loadCoachPromptsFromDisk()` — same for coach prompts (markdown files)
>
> Create `scripts/seed-content.ts`:
> - For each content type, validate every file
> - Compute a content hash; only upsert rows where the hash changed (idempotent seeding)
> - Mark `is_published = true` for all rows passing validation
> - Print a summary: "X scenarios, Y playbooks, Z missions, W coach prompts seeded"
>
> Add a `pnpm seed` script in package.json that runs the seed.
>
> Set up the directory structure for content:
> ```
> content/
>   scenarios/{ba,pm,sm,po,da,aie}/
>   playbooks/{ba,pm,sm,po,da,aie}/
>   missions/{ba,pm,sm,po,da,aie}/week-1 through week-13/
>   coach-prompts/
> ```
> Plus an `examples/` directory with **one example file per content type** so future content authors have a template to copy from. The examples should reflect SKILL.md authoring rules — the BA scenario example is "The Hostile Lead Dev" using the structure from SKILL.md §4.1.
>
> Don't seed real content yet — that's prompt 2.7 (BA-only at full depth) and Phase 5 (other roles).

**Verification:**
- `pnpm seed` runs without errors against the example files
- Validation fails loudly when an example file is malformed (test by breaking one)
- Upsert is idempotent (run seed twice; second run is a no-op)
- The `examples/` directory has one file per type, conforming to SKILL.md authoring conventions

**Commit:** `feat(content): schemas, validators, seed script, examples`

---

## Prompt 2.2 — Daily home page (Day 1 empty + Day N populated + State B mid-journey welcome)

**Purpose:** What users see after login. Day 1 is a signature design moment. **Now handles three Daily Home variants for State A users (Day 1, Day N) and a fourth for State B users (mid-journey welcome). State C users land on Post-Day-90 state — built in prompt 3.16.**

**Reference:** Design Brief §10 (signature moment: empty Mission Track Day 1), Design Prompts v2.1 C2 (Day 1 + Day N), C17 (mid-journey welcome), PRD v1.9 §7.1 (three entry states)

**The prompt:**

> Build the daily home page at `app/(app)/home/page.tsx`.
>
> Reference Design Prompts v2.1 C2 and C17 from the design prototype for exact visual layouts.
>
> Implement three states with the same component, dynamically based on `user_context.entry_state` and `user_context.current_day`:
>
> **State 1 — Day 1, State A users only (the "almost empty" signature moment):**
> - Banner: Eyebrow "DAY 1 — [Day], [Date]" + Fraunces italic H3: "Today is about landing softly. Not about doing everything."
> - Single mission card centred-ish (use the Mission Card component which you'll build in 2.3)
> - Below: thin divider, then mute caption "More missions unlock as you progress this week."
> - Right side: small Situation Room teaser link
> - **Lots of whitespace below the single mission card.** The brand stance.
>
> **State 2 — Day N (populated), State A users on Day 2+ AND State B users on subsequent visits:**
> - Banner: Eyebrow "DAY 38 — WEEK 6 — [Day], [Date]" + Fraunces italic H3 with week theme
> - Main: 1-2 mission cards for today
> - Situation Room input (full-width on mobile, half on desktop) — the large input with three soft labels (don't wire up submission yet, that's Phase 3.6)
> - Right sidebar (desktop only): Week at a glance + What I know + Recent activity
>
> **State 3 — State B mid-journey welcome (first-time only — State B users on first visit after onboarding):**
> - Banner: Eyebrow "DAY 22 — WEEK 4 — [Day], [Date]" + Fraunces italic H3: a one-time welcome line such as *"You're {N} weeks in. We're picking up where you are."*
> - Below the banner, a small editorial card (only on first visit, then dismissed):
>   - Eyebrow caption mute: "ABOUT THE WEEKS YOU LIVED THROUGH"
>   - Body L mute: *"Weeks 1-{N-1} are available to read if you want — they're the structured missions for the parts of your role you've already done. They're not blocking anything. The current week is the focus."*
>   - "Got it" ghost button — dismisses the card and sets `user_context.viewed_mid_journey_welcome_at` to now (add this column via migration)
> - Below the welcome card (or directly under banner on subsequent visits): same content as State 2 — current week mission cards, Situation Room input, right sidebar
> - The right sidebar's "Week at a glance" mini rows show past weeks at very low visual weight (mute, no completion ✓ marks, just labelled as "Available to read")
>
> **State selection logic:**
> ```
> if entry_state == 'C' OR current_day > 90:
>   render Post-Day-90 state (handled in prompt 3.16)
> elif entry_state == 'A' AND current_day == 1:
>   render State 1 (Day 1 signature empty)
> elif entry_state == 'B' AND viewed_mid_journey_welcome_at IS NULL:
>   render State 3 (mid-journey welcome — first visit only)
> else:
>   render State 2 (Day N populated)
> ```
>
> Compute the current day server-side from `user_context.start_date` and the current date:
> - `current_day = floor((today - start_date) / 1 day) + 1`
> - `current_week = ceil(current_day / 7)`
> - Update the DB columns when they drift from computed values
>
> If user has no `start_date`, treat today as Day 1 (this should not happen post-onboarding, but defensive coding).
>
> If `user_context.probation_mode_active = true`, replace the banner with the Probation banner (Eyebrow "PROBATION — {N} DAYS TO REVIEW" + Fraunces italic line) — this is the only piece of Probation Mode UI in Phase 2; full Probation features come in 3.14 and 3.17.
>
> Server data: a server component fetches today's missions, recent situation sessions, recent simulator runs, and current user_context, then passes to client components.

**Verification:**
- A Day 1 State A user sees the empty-feeling layout with one mission card and lots of whitespace
- A Day 38 State A user sees the populated layout with mission cards, Situation Room input, and right sidebar
- A first-visit State B user (e.g., start_date 22 days ago) sees the mid-journey welcome state with the "About the weeks you lived through" card
- A subsequent-visit State B user sees the standard State 2 populated layout (welcome card dismissed)
- The "Week at a glance" sidebar shows past weeks as mute/available-to-read for State B users
- The day/week calculation is correct
- Probation banner appears when probation_mode_active is true (you can manually flip this in the DB to test)
- Layout responsive: mobile stacks correctly, desktop shows sidebar

**Commit:** `feat(home): daily home page with three states (Day 1 / Day N / mid-journey welcome)`

---

## Prompt 2.3 — Mission Track week view + mission detail + completion flow (with State B handling)

**Purpose:** The curriculum UI. **Now handles the `skipped_pre_signup` mission status for State B (mid-journey) users per PRD v1.9 §7.1.**

**Reference:** PRD v1.9 §6.4 (Mission Track), §7.1 (three entry states), SKILL.md v1.3 §6 (Mission authoring), Design Prompts v2.1 C3 (mission week + detail views)

**The prompt:**

> Build the Mission Track surfaces.
>
> Mission Card component `components/mission/MissionCard.tsx`:
> - **Four variants** (was three in v1.0): active, completed, locked, `skipped_pre_signup`
> - Props: `mission`, `completion`, `status`
> - Active: Eyebrow "TODAY — DAY N", Fraunces H3 title, 1-line description, time estimate, "Begin" button
> - Completed: same structure with subtle ✓, title in mute, "Completed N days ago" caption
> - Locked: muted throughout, lock icon, "Available Day N" tooltip on hover
> - **`skipped_pre_signup` (new):** mute title and description in Fraunces italic body S (not bold), no lock icon, no "Begin" button. Instead a small ghost link "Read →" on the right. Caption mute italic below the title: *"From a week you lived through before FirstNinety. Available to read if you want."* No completion ✓, no urgency.
>
> Mission Track week view `app/(app)/mission-track/page.tsx`:
> - Default route shows current week
> - Header: Eyebrow "MISSION TRACK — [ROLE]", Fraunces H3 "Week N — [week theme]"
> - Navigator: ← Week N-1 / Week N (active) / Week N+1 →
> - Mission cards in a row (desktop) or stacked (mobile)
> - **State B users navigating to past weeks (weeks before their signup):** the week view shows missions with `skipped_pre_signup` cards, the navigator still works, and the header gets a small editorial note above the missions: *"This is from a week you lived through before FirstNinety. Read at your own pace."* No reflection prompt at the bottom of these past weeks (the reflection only fires for weeks the user is actively engaged in).
> - Bottom (for current and future weeks only): reflection prompt for the week + "View whole 90-day map →" link
>
> Mission detail view `app/(app)/mission-track/[slug]/page.tsx`:
> - Reading column max-width 720px
> - Eyebrow "DAY N — WEEK N — MISSION N OF M"
> - Fraunces H1 mission title
> - Subhead with estimated time and the sections breakdown
> - Five sections, all using Eyebrow headers + prose body (NOT bullet lists):
>   1. Why this matters (Eyebrow "WHY THIS MATTERS")
>   2. What you'll do (Eyebrow "WHAT YOU'LL DO")
>   3. What to use — render as three tight one-line linked cards
>   4. Success looks like (Eyebrow "SUCCESS LOOKS LIKE")
>   5. Reflection prompt (Eyebrow "REFLECTION") + textarea for response
> - Bottom: "Mark complete" primary button + "Skip this mission" ghost button
> - **For `skipped_pre_signup` missions specifically:** the page renders the same five sections (the content is the same — the user might want to read it) but the bottom action area is different. Instead of "Mark complete" + "Skip", show a single small editorial line: *"This mission isn't open for completion — you've already lived through this week. Read it as a reference if it's useful."* No textarea for reflection. No "Mark complete" button.
>
> Server actions in `app/(app)/mission-track/actions.ts`:
> - `startMission(missionId)` — upserts `mission_completions` with status `in_progress`. **Rejects if the mission's status is currently `skipped_pre_signup`** — those missions are read-only.
> - `completeMission(missionId, reflectionResponse?)` — sets status `completed`, captures reflection, sets `completed_at`. **Rejects if the mission's current status is `skipped_pre_signup`.**
> - `skipMission(missionId, reason?)` — sets status `skipped`. Does NOT change `skipped_pre_signup` to `skipped` — those are different concepts.
> - `getCurrentWeekMissions()` — returns missions for current week with completion status
> - `getPastWeekMissions(week)` — returns missions for a specific past week, including `skipped_pre_signup` ones for State B users
>
> Mission ordering at MVP is **fixed per role** — adaptive ordering is Phase 2B per PRD. Order is by `week ASC, sequence_in_week ASC`.
>
> Prerequisites: a mission is `locked` if any prerequisite mission has `mission_completions.status NOT IN ('completed', 'skipped_pre_signup')`. **Critical:** `skipped_pre_signup` counts as satisfying a prerequisite — State B users do not get locked out of their current week because they "missed" earlier missions.
>
> Mark mission completion as a "meaningful interaction" event — this is when the notification permission prompt may fire (per prompt 1.7). `skipped_pre_signup` reads do NOT count as meaningful interactions.

**Verification:**
- Mission week view shows the current week's missions with correct statuses
- Mission detail page renders with all five sections, no bullet lists
- Marking a mission complete updates the DB and reflects in the week view
- Reflection text is captured in `mission_completions.reflection_response`
- Locked missions show correct "Available Day N" caption
- Navigator moves between weeks; can't go before week 1 or after week 13
- **State B user (start_date 22 days ago) sees Weeks 1-3 with `skipped_pre_signup` cards, Week 4 active with current missions, Week 5+ locked or unlocked per normal rules**
- **A State B user cannot accidentally "complete" a `skipped_pre_signup` mission (the action is blocked server-side)**
- **Current week is not blocked by `skipped_pre_signup` prerequisites — State B users can start Week 4 missions immediately**

**Commit:** `feat(mission-track): week view, mission detail, completion flow`

---

## Prompt 2.4 — Playbook Library index

**Purpose:** The Playbook list view.

**Reference:** PRD §6.3, SKILL.md §7, Design Prompts C8 state 1

**The prompt:**

> Build the Playbook Library index at `app/(app)/playbook/page.tsx`.
>
> Reference Design Prompts C8 state 1 for exact layout.
>
> Header: Eyebrow "PLAYBOOKS — [USER ROLE]", Fraunces H1 "Worked examples. Not empty templates.", body L mute sub-paragraph explaining the format.
>
> Grid of Playbook Cards (2-column desktop, 1-column mobile). Each Playbook Card:
> - Eyebrow with role + variant (e.g., "BA — REGULATORY VARIANT")
> - Fraunces H3 title
> - 2-line description in body mute
> - "Read with worked example →" link
> - Small annotation icon hint
>
> If `user_context.probation_mode_active = true`, surface the Probation Prep Pack playbook at the top of the grid with a special "PROBATION PREP" eyebrow badge — visual signal that this is the contextual surface. (The Probation Prep Pack playbook itself is content; build the surface logic but the actual content comes in Phase 5.)
>
> Footer: italic line "More Playbooks are added every week. Suggest one →" (no actual submission form at MVP).
>
> Server data: fetch all published playbooks where `role` matches the user's primary role.
>
> Filter and sort controls deferred — at MVP the list is short enough (~8-10 per role) that a single sorted grid is fine.

**Verification:**
- Index renders the user's role's playbooks (test with seeded BA content from 2.7)
- Probation Prep Pack appears with special badge when Probation Mode active
- Visual layout matches Design Prompts C8 state 1
- Responsive: 2-column desktop, 1-column mobile

**Commit:** `feat(playbook): library index`

---

## Prompt 2.5 — Playbook detail view with margin annotations

**Purpose:** The two-column editorial reading view. This is the single most distinctive design pattern in the product.

**Reference:** PRD §6.3, SKILL.md §7, Design Prompts C8 state 2

**The prompt:**

> Build the Playbook detail view at `app/(app)/playbook/[slug]/page.tsx`.
>
> This is the trickiest visual pattern in the product — the **two-column document with margin annotations on desktop, collapsing to inline italic asides on mobile.** Reference Design Prompts C8 state 2 thoroughly.
>
> Page structure:
>
> Top section (full width, max 1080px):
> - Eyebrow "[ROLE] — PLAYBOOK — [VARIANT]"
> - Fraunces H1 title
> - Subhead in Fraunces italic body L mute
> - Metadata row (caption mute): "~N minutes to read · Updated [date] · Annotated by [practitioner]"
> - Actions row: ghost buttons for "Download empty template ↓" / "Download worked example ↓" / "Discuss with the Coach →" (Coach link routes to /coach/new?context=playbook:slug — wired in Phase 3)
>
> Then the two-column layout (desktop) / single-column with inline annotations (mobile):
> - **Left column (60% on desktop):** the worked example content, rendered from markdown. Each markdown section gets a stable ID (`section-1`, `section-2`, etc.) so annotations can target it.
> - **Right column (40% on desktop):** the margin annotations, each one Fraunces italic body S mute, with a subtle 1px left border in `--paper-3`. Each annotation has a `target_section_id` and uses CSS positioning (sticky / scrollytelling) to align roughly with its target section.
>
> Implementation:
> - Use a markdown renderer that allows custom heading IDs and supports adding stable IDs to sections (e.g., remark/rehype with section wrappers)
> - The annotation positioning logic: each annotation block on desktop has `position: sticky` within a container that aligns vertically with the corresponding section. Use intersection observer to make annotations highlight when their target section is in view.
> - On mobile (`<768px`): annotations render inline as italic asides between paragraphs (use a different rendering pass that interleaves them rather than positioning).
>
> Below the two-column section, full-width:
> - Common mistakes section: Eyebrow + Fraunces H3 + 3 short paragraphs (NOT bullets) from the playbook content
> - Variant patterns section: Eyebrow + Fraunces H3 + short paragraphs
> - "What to do next" section: Eyebrow + three tight one-line linked cards (each linking to a related Scenario, Playbook, or Coach thread)
>
> The annotation alignment is hard to get pixel-perfect — aim for "annotation sits visually within the vertical reading-range of its target section." Some drift is acceptable; clearly misaligned is not.
>
> When `worked_examples` has multiple entries (e.g., two BRD examples), provide a small tab/switcher at the top of the left column to switch between them. Default to the first.
>
> Add a "back to library" link at the top.

**Verification:**
- A test playbook renders with two-column layout on desktop
- Margin annotations align with their target sections (allow some drift)
- Mobile: annotations render as inline italic asides
- Multiple worked examples switchable via tabs
- Markdown renders cleanly (headers in Fraunces, body in Inter)
- Common mistakes and variant patterns render as prose, not bullets

**Commit:** `feat(playbook): detail view with margin annotations (signature pattern)`

---

## Prompt 2.6 — Seed BA content (8 scenarios, 8 playbooks, 30 missions)

**Purpose:** Seed real BA content at full depth so Phase 3 has something to test against.

**Reference:** SKILL.md §3.1 (BA role), §4 (scenario authoring), §6 (mission authoring), §7 (playbook authoring)

**The prompt:**

> Author and seed BA role content at full depth.
>
> This is **content authoring work** — not just code. Follow SKILL.md §3.1 (BA tradecraft), §4 (scenario authoring), §6 (mission authoring), §7 (playbook authoring), and §10 (60-second quality test).
>
> **8 BA scenarios** as JSON files in `content/scenarios/ba/`:
> 1. `ba-hostile-lead-dev.json` — "The Hostile Lead Dev" (the example from SKILL.md §4.1)
> 2. `ba-vague-sponsor.json` — "The Vague Sponsor"
> 3. `ba-not-testable.json` — "'This Isn't Testable' from QA"
> 4. `ba-scope-creep.json` — "Scope Creep Mid-Sprint"
> 5. `ba-uat-blame.json` — "UAT Defect Blame Game"
> 6. `ba-clarifying-question.json` — "Stakeholder Pushback on a Clarifying Question"
> 7. `ba-compliance-late.json` — "Compliance Surfaces a Concern Two Days Before Go-Live"
> 8. `ba-probation-review.json` — "The Probation Review" (probation-specific, used when Probation Mode active)
>
> Each scenario uses the structure from SKILL.md §4.1 — title, one-liner, brief (cinematic 2-3 paragraphs), objective, curveball, 2-4 personas with positions and fears, rubric with 3 green/yellow/red flags each, estimated minutes, difficulty.
>
> **8 BA playbooks** in `content/playbooks/ba/`:
> 1. `ba-brd-standard.json` — BRD (Standard Variant)
> 2. `ba-brd-regulatory.json` — BRD (Regulatory Variant) — the one from Design Prompts C8
> 3. `ba-user-stories.json` — User Stories with Acceptance Criteria
> 4. `ba-stakeholder-map.json` — Stakeholder Map (Power-Interest Grid)
> 5. `ba-raid-log.json` — RAID Log
> 6. `ba-process-map.json` — Process Map (BPMN Basics)
> 7. `ba-first-1on1.json` — First 1:1 with Your Manager — Agenda
> 8. `ba-probation-pack.json` — Probation Prep Pack (composite playbook with self-assessment template, pre-review 1:1 agenda, evidence portfolio template, probation review conversation worked example)
>
> Each playbook has empty template (markdown) + 2-3 worked examples with annotations targeting specific sections + common mistakes (3-5 as prose) + variant patterns + related scenarios.
>
> **30 BA missions** organised by week 1-13 in `content/missions/ba/week-N/`:
> - Week 1: 3 missions (Map your stakeholders / First 1:1 with your manager / Decode your team's tools and rituals)
> - Week 2: 3 missions
> - ... through Week 13: 2 missions
> - Plus 5 probation missions in `content/missions/ba/probation/` (used only when Probation Mode active): Book your pre-review 1:1 / Write your self-assessment / Assemble your evidence portfolio / Rehearse the review conversation / Pre-empt your one weakness
>
> Each mission uses structure from SKILL.md §6 — title, why_matters (2 sentences dry), steps (3-5), resource_refs (linked scenarios/playbooks), success_criteria, reflection_prompt, estimated_minutes, prerequisites.
>
> **Quality bar:** every piece of content must pass SKILL.md §10's 60-second quality test. No generic advice. No bullet lists where prose would do. No "Great job!" energy.
>
> Run `pnpm seed` to load it all into the database.
>
> This prompt is the heaviest content work in Phase 2. Expect to spend the most time here. Worth doing well — this content shapes the user's first impression of the product.

**Verification:**
- 8 scenarios, 8 playbooks, 30 missions, 5 probation missions seeded successfully
- Every piece of content passes SKILL.md §10 60-second quality test
- BA user can navigate the Mission Track, Playbook Library, and see all content rendered correctly
- No generic-AI content slipped in (manual review by Tokunbo before sign-off)

**Commit:** `content: BA role full content depth (scenarios, playbooks, missions)`

---

## Phase 2 Exit Gate

- [ ] BA user can complete missions, read playbooks, see week structure
- [ ] Mission completion captures reflection responses
- [ ] Playbook detail view renders margin annotations on desktop and inline asides on mobile
- [ ] All BA content passes SKILL.md §10 quality test
- [ ] Probation banner appears on /home when probation_mode_active is true (even though full Probation features come in 3.14)
- [ ] Day 1 empty state feels editorially generous
- [ ] No bullets in mission detail or playbook prose

Proceed to Phase 3 only when all green.

---

# Phase 3 — AI Surfaces (17 prompts)

The differentiated features. Estimated 8-10 days. The heaviest phase.

---

## Prompt 3.1 — Claude client wrapper + cost tracking + circuit breakers

**Purpose:** The shared infrastructure every AI surface uses.

**Reference:** MVP Spec §4.1 (shared infrastructure), §4.6 (safety system message injection)

**The prompt:**

> Build the Claude client infrastructure.
>
> Install the Anthropic SDK (`@anthropic-ai/sdk`).
>
> Create `lib/coach/claude.ts` as the canonical wrapper:
> - `createClaudeClient()` returns an Anthropic SDK client configured with the API key
> - `streamClaudeResponse(params)` — the main entry point for streaming
>   - Accepts: messages array, system prompt, tools (optional), model selector, max_tokens, temperature
>   - Streams using SDK's `messages.stream()`
>   - Captures usage data after stream completes
>   - Calls `trackAICall` from `lib/tracing/ai-cost.ts` after completion
>   - Applies global circuit breakers: if `ai_calls.count for user in last hour > CIRCUIT_LIMIT`, throws a rate-limit error
>   - Applies the safety system message injection (prepends `<safety_rules>` block from `content/coach-prompts/safety.md`)
> - `nonStreamClaudeCall(params)` — non-streaming variant for one-shot calls (used by debrief generation, Probation Brief generation)
>
> Create `content/coach-prompts/safety.md` with the safety rules block from MVP Spec §4.6.
>
> Add constants in `lib/coach/config.ts`:
> - `MODEL_OPUS = 'claude-opus-4-7'`
> - `MODEL_HAIKU = 'claude-haiku-4-5-20251001'`
> - Per-token rates for each model
> - Circuit limits per user per hour (e.g., 60 calls)
> - Per-call max_tokens defaults by surface
> - Per-call temperature defaults by surface
>
> Add a non-AI test endpoint `app/api/dev/test-claude/route.ts` (gated by NODE_ENV=development) that sends a simple "hello" prompt and returns the streamed response — to verify the wrapper works end-to-end.

**Verification:**
- Test endpoint streams a Claude response back to the browser
- `ai_calls` row is written after the call completes with correct token counts and cost
- Circuit limit triggers correctly when exceeded (test by lowering the limit temporarily)
- Safety system message is injected (verify by inspecting the first message in a logged call)

**Commit:** `feat(ai): Claude client wrapper, cost tracking, circuit breakers`

---

## Prompt 3.2 — Tier enforcement + free-tier gating

**Purpose:** Server-side check that runs before every AI call.

**Reference:** MVP Spec §3.3 (tier enforcement contract), §2.6 (usage_limits)

**The prompt:**

> Build server-side tier enforcement.
>
> Create `lib/billing/tier.ts`:
> - `checkTierAllowance(userId, surface)` returns `{ allowed: true } | { allowed: false, reason, limit, used }`
> - For free-tier users:
>   - Simulator: lifetime limit 4 (from `usage_limits.simulator_runs_lifetime`)
>   - Situation Room: weekly limit 2 (from `usage_limits.situation_sessions_week`)
>   - Coach (ad-hoc only): weekly limit 5 (from `usage_limits.coach_messages_week`)
> - For Pro/Trialing users: always allowed
> - Reads `subscriptions.tier` and `subscriptions.status` to determine paywall state
>
> Wire `checkTierAllowance` into the Claude streaming endpoint (which will be `/api/claude/stream`, built in 3.3): deny *before* calling Claude if allowance is exhausted.
>
> When tier allowance is exhausted, return a special SSE event `{type: 'tier_limit', limit, used, upgrade_url: '/settings/billing'}` so the client can render an upgrade prompt instead of an error.
>
> Build a reusable Tier Limit UI component `components/billing/TierLimitPrompt.tsx`:
> - Modal or inline banner depending on context
> - Editorial copy (no upsell shouting): Fraunces H3 "You've used your free X for this week." + body L explaining what Pro unlocks + "Start free trial" primary button
> - Routes user to `/settings/billing` which has the Stripe upgrade flow (built in Phase 4)
>
> Add tests:
> - Free user hits limit, AI call denied, tier_limit response surfaces
> - Pro user never hits limit
> - Limits reset weekly (test the cron from Phase 1.5 that resets `_week` counters)
> - Triggers correctly increment counters (the usage triggers are already in place from prompt 0.3 — verify they fire)

**Verification:**
- A free user with 4 simulator runs gets denied on the 5th attempt
- The deny happens *before* any Claude API call (no token cost incurred)
- TierLimitPrompt component renders correctly
- Pro user has unlimited access
- Weekly counters reset via cron

**Commit:** `feat(billing): tier enforcement, free-tier gating, upgrade prompt`

---

## Prompt 3.3 — SSE streaming endpoint

**Purpose:** The single streaming endpoint that powers Coach, Situation Room, Simulator.

**Reference:** MVP Spec §3.2 (`/api/claude/stream`), §4.5 (streaming protocol)

**The prompt:**

> Build the unified streaming endpoint at `app/api/claude/stream/route.ts`.
>
> This route handles SSE streaming for three surfaces: Coach, Situation Room, Simulator. The endpoint dispatches based on `surface` parameter.
>
> Request body shape (TypeScript):
> ```typescript
> type StreamRequest = {
>   surface: 'coach' | 'situation_room' | 'simulator_persona' | 'simulator_debrief' | 'probation_brief',
>   context_id: string,  // thread_id, session_id, run_id, or user_id depending on surface
>   user_message?: string,
>   scenario_id?: string,  // for simulator surfaces
>   entry_type?: 'prep' | 'is_this_normal' | 'debrief',  // for situation_room
> }
> ```
>
> The route:
> 1. Validates auth via Supabase JWT
> 2. Calls `checkTierAllowance` for the surface; if denied, emits `tier_limit` event and closes
> 3. Dispatches to surface-specific handlers in `lib/coach/`, `lib/situation-room/`, `lib/simulator/` (you'll build these next)
> 4. Each handler returns an SSE stream
> 5. Pipe stream events: `text_delta`, `tool_use_start`, `tool_use_input`, `tool_result`, `message_complete`, `scenario_end`, `error`, `tier_limit`
> 6. On stream end, call cost tracking
>
> Client-side helper `lib/coach/use-stream.ts`:
> - `useClaudeStream({surface, contextId, ...})` React hook that returns `{events, isStreaming, error, startStream, stopStream}`
> - Handles reconnection on transient errors
> - Polls `/api/coach/thread/[id]/latest` on disconnect to recover state (idempotent partial-message persistence)
>
> Add a test page at `/dev/stream-test` (NODE_ENV=development only) that uses the hook to test streaming end-to-end before any real surface is built.

**Verification:**
- Test page successfully streams a Coach response
- Tier limit denied responses surface as `tier_limit` events
- Stream events have the right types
- Client reconnects gracefully on network blip (test by toggling network in dev tools mid-stream)
- ai_calls row written correctly after stream ends

**Commit:** `feat(ai): SSE streaming endpoint, client hook, dev test page`

---

## Prompt 3.4 — Safety guardrails + crisis surface

**Purpose:** Pre-flight content checks + crisis referral component.

**Reference:** MVP Spec §4.6 (safety guardrails)

**The prompt:**

> Build the safety guardrail layer.
>
> Create `lib/safety/checks.ts`:
> - `checkForCrisisKeywords(text)` — pattern matches crisis indicators (suicide, self-harm, abuse, harassment, "want to die", etc.) — returns `{matched: boolean, category: 'self_harm' | 'harassment' | 'abuse' | null}`
> - `checkForPII(text)` — detects email addresses and phone numbers; returns `{has_pii: boolean, types: string[]}`
> - `checkForRealNames(text)` — heuristic: capitalised words that are not common role titles ("Sam", "Jane", "Maria") in proximity to role indicators ("my lead dev Sam", "my PM Jane") — returns `{has_likely_names: boolean, matches: string[]}`
> - All three are pure functions — no AI, just regex + small dictionaries
>
> Create `lib/safety/guardrails.ts`:
> - `runPreFlightChecks(text)` — runs all three checks and returns combined result
> - `getCrisisSystemMessage(category)` — returns an additional system message block to prepend when a crisis is detected, instructing the AI to respond with extra care and surface a crisis referral
>
> Create crisis referral component `components/safety/CrisisReferral.tsx`:
> - Renders below an AI response when the parent surface sets `flagged_for_safety = true`
> - Eyebrow "IF YOU NEED IMMEDIATE SUPPORT"
> - Body paragraph + region-specific helplines (use a static list for MVP: Samaritans UK 116 123, 988 US, "Find local services →" link to a curated list)
> - Always renders when flagged — never gated on user behaviour
>
> **Author `content/coach-prompts/safety.md`** (the safety system message block that will be injected into every Coach, Situation Room, and Simulator system prompt by the Claude wrapper from prompt 3.1). This is the canonical location of the runtime safety rules. The file must include the standard rules from MVP Spec v1.3 §4.6 (no employment law advice, no medical diagnosis, no judgement of named individuals, scope-to-tradecraft, never refer to self as "an AI"), **plus an explicit scope-boundary rule on technical execution help** per CLAUDE.md v1.3 item 16 and SKILL.md v1.3 §8.4. The scope-boundary block should read approximately:
>
> > **Scope.** You are a workplace tradecraft coach, not a technical execution helper. You do not write SQL queries, debug code, walk through library or framework configuration, or explain technical concepts at an implementation level. When the user asks for technical execution help (SQL syntax, code debugging, library setup, "how do I do X in Y"), acknowledge the question is outside your lane and suggest ChatGPT, Stack Overflow, or Cursor for that work. Then, if there is a workplace conversation hiding inside the technical question, offer to help with that — for example: "Stack Overflow will explain webhooks faster and better than I will. But the conversation you'll need to have about feasibility — I can help with that. Tell me who's pushing for the integration." The pattern is three parts: acknowledge the lane, point to the right tool, offer the in-scope version if there is one. If the user persists with a pure technical question after the redirect, stay polite and stay out of the lane.
>
> See SKILL.md v1.3 §8.4 for the full reasoning, the three edge cases (technical-work-as-workplace-situation IN scope; stakeholder-communication-about-technical-concepts IN scope; pure technical questions OUT of scope with redirect), and the canonical voice patterns. This file should not paraphrase those — load and reference them directly so the rule is enforced consistently at runtime.
>
> Wire safety checks into the streaming endpoint:
> - Before calling Claude, run `runPreFlightChecks` on the user_message
> - If `has_pii`: emit a soft advisory event `safety_advisory_pii` (don't block); UI shows an inline prompt to anonymise
> - If `has_likely_names`: emit `safety_advisory_names` (don't block); UI shows similar prompt
> - If `crisis_keywords matched`: set `flagged_for_safety = true` on the session/thread row, prepend the crisis system message to the AI call, emit `safety_crisis_flagged` event so UI renders the CrisisReferral component
>
> Add the soft advisories as inline UI in Situation Room and Coach input areas: small mute italic line below the input that appears when an advisory fires.

**Verification:**
- Crisis keyword detection fires on test phrases ("I want to harm myself", "my boss is harassing me")
- PII detection catches emails and phone numbers
- Real-name heuristic catches "my lead dev Sam" but ignores "my lead dev"
- Crisis flag correctly triggers the CrisisReferral component
- Soft advisories appear inline; don't block submission
- **`content/coach-prompts/safety.md` contains the scope-boundary block on technical execution help; test by sending a pure technical question ("write me a SQL query that joins users and orders") to the Coach — expected behaviour is the redirect pattern (acknowledge lane, point to ChatGPT/Stack Overflow, offer in-scope alternative if relevant). The Coach should NOT write the SQL.**

**Commit:** `feat(safety): pre-flight checks, crisis surface, advisories, scope boundary`

---

## Prompt 3.5 — AI Coach engine + tool implementations

**Purpose:** The Coach with tool-calling. The only agentic surface at MVP.

**Reference:** MVP Spec §4.2 (Coach engine), PRD §6.2

**The prompt:**

> Build the AI Coach engine.
>
> Create `lib/coach/system-prompt.ts`:
> - `buildCoachSystemPrompt(userId, threadId)` — composes the system prompt from blocks:
>   1. Role priming (loads `content/coach-prompts/role-{role}.md` for the user's primary role)
>   2. Voice & behaviour rules (`content/coach-prompts/voice.md`)
>   3. Current context block (dynamically generated: role, current_week, current_day, recent missions, recent situation sessions)
>   4. Safety guardrails (`content/coach-prompts/safety.md`)
>   5. Tool descriptions (auto-generated from registered tools)
>
> Create the three Coach tools (and prepare for the fourth in 3.14):
> - `lib/coach/tools/get-user-context.ts` — executes a Supabase query, returns role/week/day/recent activity
> - `lib/coach/tools/search-playbooks.ts` — text search across playbooks for the user's role, returns top 5 matches with title + 1-line description
> - `lib/coach/tools/get-situation-history.ts` — returns the user's last 10 Situation Room sessions
>
> Each tool implementation:
> ```typescript
> export const toolSpec = {name, description, input_schema}
> export async function execute(input, context) { return result }
> ```
>
> Create `lib/coach/handler.ts`:
> - `handleCoachStream(params)` — the main Coach surface handler called from `/api/claude/stream`
> - Loads thread history (max 20 most recent messages from `coach_messages`)
> - Constructs message array with system prompt + history + new user message
> - Calls `streamClaudeResponse` with the three tools registered (or four if Probation Mode active — added in 3.14)
> - On tool_use events: executes the tool (max 3 calls per response, or 4 in Probation Mode), continues stream with result
> - On message_complete: writes both user and assistant messages to `coach_messages`, updates `coach_threads.last_message_at`
> - Returns the stream
>
> Author the Coach prompt content files (per SKILL.md §8 voice rules):
> - `content/coach-prompts/voice.md` — the core voice & behaviour block
> - `content/coach-prompts/role-ba.md` — BA-specific priming (other roles in Phase 5)
> - `content/coach-prompts/situation-prep.md`, `situation-normal.md`, `situation-debrief.md` (used in 3.6)
> - `content/coach-prompts/probation-voice.md` (used in 3.14)
>
> Each prompt file is markdown with a frontmatter block (`---`) for metadata (version, last_updated). Loaded by `lib/content/loaders.ts`.

**Verification:**
- A test message to the Coach receives a streamed response in the senior-colleague voice (no "Great question!" openers)
- Tool calls fire when the prompt warrants (e.g., asking "what playbook is relevant?" triggers `search_playbooks`)
- Coach messages are persisted to `coach_messages`
- System prompt includes the user's current week and recent missions correctly

**Commit:** `feat(coach): engine, three tools, system prompts`

---

## Prompt 3.6 — Coach conversation UI + thread list

**Purpose:** The Coach surface from Design Prompts C7.

**Reference:** Design Prompts C7, SKILL.md §8

**The prompt:**

> Build the Coach UI.
>
> Coach index `app/(app)/coach/page.tsx`:
> - Layout: left sidebar (240px) + main column + right rail (200px desktop only)
> - Left sidebar: "Recent threads" list. Each entry: Fraunces italic body (topic), caption mute (date). Active thread highlighted with `--paper-2` background. "+ New thread" ghost button at bottom.
> - Main column: starts blank if no current thread. Renders the active thread's conversation.
> - Right rail: "What the Coach knows here" section — small list in Fraunces italic body S of context items from `user_context`, `user_responsibilities`, and the thread's situation context. Below: "This context is private to you. Edit it in Settings." caption mute.
>
> Thread route `app/(app)/coach/[threadId]/page.tsx`:
> - Renders the active thread
> - Conversation uses **editorial layout NOT chat bubbles** per Design Prompts C7:
>   - User turn: small "You" label (Inter 600 caption mute) with horizontal dash beneath → user message in body, plain text on paper
>   - Coach turn: small "Coach" label (Inter 600 caption ink) with horizontal 2px accent in `--accent-soft` beneath → Coach response in body, plain text on paper
>   - Coach turns can include occasional Fraunces italic phrases for emphasis on sharp principles (the editorial signature)
> - Bottom: input field with `→` icon for send (or Cmd-Enter), same style as Situation Room input but smaller
> - Loading state: three-dot pattern with mute label "FirstNinety is thinking…"
> - No emoji reactions, no thumbs feedback, no "Was this helpful?"
>
> New thread `app/(app)/coach/new/page.tsx`:
> - Renders the same UI but with no thread yet
> - First user message creates a thread (auto-generates `topic_title` from the message via a Haiku call)
> - Redirects to `/coach/[threadId]` after creation
>
> Wire up via the `useClaudeStream` hook from 3.3.
>
> Coach is ad-hoc usage and gated by `coach_messages_week` for free users (max 5/week per MVP Spec §3.3). The tier check happens server-side.

**Verification:**
- Coach UI renders correctly with sidebar, main column, right rail
- Editorial layout (not chat bubbles) — speaker labels with horizontal dash/accent
- Streaming works end-to-end — user sends, Coach streams back, message persists
- Right rail "What the Coach knows" populates with real user_context/responsibilities
- Free-tier limit denies on 6th message of the week (test by manually setting counter)
- Loading state uses the dry three-dot pattern

**Commit:** `feat(coach): conversation UI, thread list, right rail`

---

## Prompt 3.7 — Situation Room intake (signature surface)

**Purpose:** The product's most-used surface. Signature design moment.

**Reference:** Design Brief §10 (signature: Situation Room intake), Design Prompts C4 state 1, MVP Spec §4.3

**The prompt:**

> Build the Situation Room intake — **the signature design moment.**
>
> Reference Design Prompts C4 state 1 thoroughly. This screen looks unlike any other product in the category. That's the point.
>
> Route: `app/(app)/situation-room/page.tsx` (the intake screen).
>
> Layout:
> - At top: small "Day N — Week N" in Eyebrow mute. No other chrome.
> - Vertically centred (with generous top/bottom whitespace):
>   - Three small switchable labels in a row, Inter 500 14px:
>     - "I need help with this" (default active — `--ink` underline)
>     - "Is this normal?" (inactive — mute)
>     - "I just did something" (inactive — mute)
>   - **One large input field below**, large minimum height (400px), `--paper-2` filled, 1px `--paper-3` border, 12px radius, generous 32px internal padding
>   - Placeholder: "Describe what's happening. Anonymise as you go — call them 'my lead dev' rather than their name."
>   - **No "Submit" button.** A small `→` icon appears in mute in the bottom-right of the input; click sends; Cmd-Enter sends; the icon brightens to ink on hover.
>   - Caption mute below: "FirstNinety will reply in seconds. Anything you type is encrypted, deletable, and never shared."
>   - At bottom: two ghost-style links "→ Skip and roleplay instead" / "→ Open your past sessions"
> - If Probation Mode active, a fourth soft label appears: "This is about my probation" (Phase 3.14 — for now just add the toggling logic and gate the label behind probation_mode_active)
>
> Pre-flight checks fire on submission per prompt 3.4: PII advisory, real-name advisory, crisis flag.
>
> Server action `submitSituation({entry_type, situation_summary})`:
> - Creates `situation_sessions` row with the entry_type and summary
> - Runs pre-flight checks
> - Increments `usage_limits.situation_sessions_week` (already done via trigger)
> - Returns `{session_id}`
> - Redirects to `/situation-room/[sessionId]`
>
> Make sure the page has dramatic whitespace around the input. The brand stance is "we give you a calm oversized field to think into."

**Verification:**
- Intake screen has dramatic whitespace
- Input is the largest interactive element on the screen
- Three soft labels toggle without page reload
- No "Submit" button — `→` icon or Cmd-Enter
- Crisis keywords trigger flag + show CrisisReferral component in next view
- Free user hits limit after 2 sessions in a week
- Screen looks unlike any other SaaS product (subjective — review with Tokunbo)

**Commit:** `feat(situation-room): intake signature surface`

---

## Prompt 3.8 — Situation Room session view + three modes

**Purpose:** The active session view after intake. Three distinct AI prompting strategies per entry type.

**Reference:** MVP Spec §4.3 (three entry templates), SKILL.md §5

**The prompt:**

> Build the Situation Room session view at `app/(app)/situation-room/[sessionId]/page.tsx`.
>
> Layout (Design Prompts C4 state 2):
> - Top: Eyebrow "SITUATION — [DAY/TIME]"
> - User's submitted situation shown as a quote: Fraunces italic body L, indented with left border in `--accent-soft`
> - Below: streaming AI response in body, written in senior-colleague register (2 short paragraphs typical)
> - After response complete: three response paths as small cards in a row:
>   - "Read more on this →" → routes to a relevant Playbook (Coach picks based on context)
>   - "Roleplay the call now →" → starts a quick Simulator session pre-loaded with situation context (route to /simulator/quick?from=situation:[sessionId])
>   - "Talk it through more →" → spawns new Coach thread with situation context attached (route to /coach/new?from=situation:[sessionId])
> - If `flagged_for_safety` is true, render `CrisisReferral` component below
>
> Past sessions list at `app/(app)/situation-room/sessions/page.tsx` (Design Prompts C4 state 3):
> - Editorial row pattern (no card chrome)
> - Each row: date+time stamp left, entry type eyebrow, situation summary in Fraunces italic body S, "Reopen →" link right
> - Sorted desc by created_at
>
> Server handler in `lib/situation-room/handlers.ts`:
> - `handleSituationStream({sessionId, entry_type})` — surface-specific Claude call for each entry_type
> - For `prep`: uses `content/coach-prompts/situation-prep.md` system prompt, asks 2-3 clarifying questions in sequence (templated, not generated), then generates structured prep brief
> - For `is_this_normal`: uses `situation-normal.md`, no clarifying questions, validates first, offers 2-3 interpretations
> - For `debrief`: uses `situation-debrief.md`, identifies green/yellow flags, suggests follow-up
> - **Does NOT use tool calls.** Situation Room is a feature, not an agent. Coach engine is reserved for the agentic surface.
> - Streams response, appends to `situation_sessions.transcript`
>
> Author the three prompt files per SKILL.md §5 voice rules.

**Verification:**
- Each entry type produces noticeably different AI response style
- "Is this normal?" responses validate first, offer interpretations
- "Debrief" responses identify green/yellow flags structurally
- Three response paths route correctly
- Past sessions list renders editorially (rows, not cards)
- Free user hits 2-per-week limit and sees TierLimitPrompt

**Commit:** `feat(situation-room): session view, three modes, response paths`

---

## Prompt 3.9 — Scenario Simulator brief screen (signature surface)

**Purpose:** The most cinematic moment in the product. Signature design moment.

**Reference:** Design Brief §10 (signature: Simulator brief), Design Prompts C5

**The prompt:**

> Build the Simulator brief screen — **the cinematic signature moment.**
>
> Reference Design Prompts C5 thoroughly. This screen looks like a Netflix opener, not a SaaS form.
>
> Route: `app/(app)/simulator/[scenarioSlug]/brief/page.tsx`.
>
> Full-bleed `--ink` (`#0E1116`) background. **No header chrome on this screen.** Single max-width 720px column, centred, generous top/bottom padding.
>
> Content (rendered from `scenarios` table for the given slug):
> - Small Eyebrow in mute paper: "[ROLE] — SCENARIO"
> - Below (with `--space-5`): Fraunces 400 display size in paper, the scenario title
> - Below (with `--space-6`): two short paragraphs of brief copy in Fraunces italic body L, mute paper (`#A29D90`), max 65 char width — the **brief field** from the scenario
> - Below (with `--space-6`): Eyebrow "IN THE ROOM" + three persona monograms (80px each, larger than elsewhere) with name in Fraunces 500 and role in Inter Body S mute
> - Below (with `--space-6`): Eyebrow "OBJECTIVE" + Fraunces italic body L single line
> - Below (with `--space-7`): single "Begin" button — larger than standard primary, 1px paper border, paper text on transparent, hover flips to paper background ink text
> - Below button: caption mute italic "This will take about 10–15 minutes. Cmd-K to exit any time."
>
> No images, no illustrations, no gradients. Just dark canvas and editorial text.
>
> Clicking "Begin":
> - Server action `startScenarioRun(scenarioSlug)` creates a `scenario_runs` row with status `active`
> - Increments `usage_limits.simulator_runs_lifetime` (via trigger)
> - Redirects to `/simulator/[scenarioSlug]/run/[runId]`
>
> Free-tier limit: 4 lifetime runs (MVP Spec §3.3). Check tier *before* allowing the brief to render — if exhausted, redirect to TierLimitPrompt.

**Verification:**
- Brief screen is full-bleed dark
- Title is huge (display Fraunces)
- Brief copy is Fraunces italic, reads like editorial fiction
- Three persona monograms larger than elsewhere
- "Begin" is the only CTA, deliberate-feeling
- No header chrome
- Free user at 4 lifetime runs is denied (test)

**Commit:** `feat(simulator): cinematic brief screen (signature surface)`

---

## Prompt 3.10 — Scenario Simulator active session engine

**Purpose:** The turn-by-turn persona AI + coordinator pattern.

**Reference:** MVP Spec §4.4 (Simulator architecture), SKILL.md §4.2

**The prompt:**

> Build the Simulator active session engine.
>
> Active session route `app/(app)/simulator/[scenarioSlug]/run/[runId]/page.tsx`:
> - Light mode (NOT dark like the brief)
> - Header: Eyebrow "[role] — [scenario title] — TURN N OF ~M"
> - Small "Exit scenario" link on the right
> - Conversation rendered top-down: each turn shows a persona monogram + name on the left + their message in body. User turns shown with "You" label, NOT differentiated by colour/bubble — user is one voice in the room
> - Input at bottom: textarea with placeholder "What do you say next?" + `→` icon to send / Cmd-Enter
> - Caption mute italic below input: "You can pause and resume any time. Cmd-K to exit."
>
> Two-call architecture per turn (MVP Spec §4.4):
>
> **Persona response call** (`lib/simulator/persona-handler.ts`):
> - Claude Opus 4.7, temperature 0.7
> - System prompt: scenario brief + personas array with positions/fears + current turn number + history + voice instruction
> - Returns a single JSON object: `{speaker, content, internal_note?}`
> - Speaker is one of the persona names in the scenario
>
> **Coordinator call** (`lib/simulator/coordinator.ts`):
> - Claude Haiku 4.5, temperature 0.3
> - Called *after* each user turn, *before* the next persona response
> - System prompt: scenario brief + rubric + full transcript
> - Returns `{action: 'continue' | 'end_success' | 'end_yellow' | 'end_red' | 'fire_curveball', reasoning}`
> - If `fire_curveball`: the next persona response should incorporate the scenario's curveball
> - If `end_*`: scenario ends, debrief is generated
>
> Turn flow:
> 1. User submits message
> 2. Append to `scenario_runs.transcript`
> 3. Call coordinator
> 4. Based on coordinator decision: either generate next persona response OR end scenario
> 5. Persona response streams to user
> 6. Append to transcript
> 7. Repeat
>
> Hard cap: 20 turns per scenario. After 20 turns the coordinator is forced to choose an end state.
>
> On `Cmd-K` or exit click: `scenario_runs.status = 'abandoned'`, no debrief generated.
>
> Track each persona response and coordinator call as a separate `ai_calls` row with the right surface tag.

**Verification:**
- A scenario session runs end-to-end through multiple turns
- Personas maintain consistent voice across turns
- Coordinator correctly decides to end the scenario when objective met or stalled
- Curveball fires correctly when triggered
- Transcript persists turn-by-turn
- Abandoned sessions don't generate debrief
- Total ai_calls rows match expected count (2 per turn — persona + coordinator)

**Commit:** `feat(simulator): active session engine, persona + coordinator pattern`

---

## Prompt 3.11 — Scenario Simulator debrief generation

**Purpose:** The single most important AI surface in the product per SKILL.md.

**Reference:** SKILL.md §4.3 (debrief authoring), MVP Spec §4.4 debrief section

**The prompt:**

> Build the Simulator debrief.
>
> When a scenario ends (coordinator returns `end_*`), trigger debrief generation in `lib/simulator/debrief.ts`:
> - Single non-streaming Claude Opus 4.7 call, temperature 0.3, max_tokens 1500
> - System prompt: SKILL.md §4.3 debrief structure + scenario's rubric + voice rules from `content/coach-prompts/voice.md`
> - User message: the full transcript + the outcome (`green` | `yellow` | `red`)
> - Response format: structured JSON
> ```json
> {
>   "judgement": "single Fraunces H1 line",
>   "context_paragraph": "2-3 sentences",
>   "green_flags": [{"text": "...", "ranked": 1}, ...],
>   "yellow_flags": [...],
>   "red_flags": [...],
>   "rehearses_for": "what this scenario rehearses for - 1 sentence",
>   "whats_next": [
>     {"label": "Replay this scenario", "url": "..."},
>     {"label": "Read the X playbook", "url": "..."},
>     {"label": "Ask the Coach about your specific situation", "url": "..."}
>   ]
> }
> ```
> - Persist to `scenario_runs.debrief` (JSONB), set `outcome`, `ended_at`, `duration_seconds`, status = `completed`
>
> Debrief view route `app/(app)/simulator/[scenarioSlug]/debrief/[runId]/page.tsx`:
> - Reading column max 720px
> - Eyebrow "DEBRIEF — [scenario title]"
> - Single Fraunces H1 judgement (the most important line on the page)
> - Body paragraph (context)
> - Three flag sections with icons (green checkmark / yellow alert-triangle / red x-circle) per Design Prompts C6:
>   - Each flag rendered as numbered prose (NOT bulleted list)
>   - "1. [content]." / "2. [content]." inline within a single paragraph block per section
> - "What this rehearses for" section
> - "What's next" section with three tight one-liner linked cards
> - Bottom: "Mark debrief read" ghost button → sets a flag in `scenario_runs` so the user can see "debrief read" state in their history
>
> Voice bar: the debrief is **honest, calibrated, never sycophantic** per SKILL.md §4.3. The single H1 judgement is the test — "You held the room. Just." is correct register; "Great work! You did amazing!" fails.

**Verification:**
- A completed scenario generates a debrief with all required sections
- The H1 judgement is a single editorial line (Fraunces, balanced)
- Green/yellow/red flags use numbered prose, not bullets
- "What's next" cards link to real Playbook/Coach surfaces
- Voice is honest — not "Great work!"
- Debrief persists in JSONB and renders correctly on revisit

**Commit:** `feat(simulator): debrief generation and view`

---

## Prompt 3.12 — Pre-flight content checks wiring across surfaces

**Purpose:** Apply the safety checks from 3.4 to all AI surfaces consistently.

**Reference:** MVP Spec §4.6, prompt 3.4

**The prompt:**

> Wire the pre-flight safety checks across all AI surfaces consistently.
>
> Audit each surface:
> - **Coach input** — runs checks; advisories inline, crisis flag sets `coach_threads.flagged_for_safety` (add column via migration `00005_safety_flag.sql` if not present)
> - **Situation Room intake** — runs checks; sets `situation_sessions.flagged_for_safety`; renders CrisisReferral after AI response
> - **Simulator turns** — runs checks on user turns; if PII/real-name advisory fires, surface inline before next persona response; crisis check unlikely here but still runs
>
> Add a settings option in `/settings/privacy` to disable real-name advisories (user opt-out — some sectors use anonymised proper names that look like real names; respect the user's judgement). PII and crisis checks are non-disableable.
>
> Wire the CrisisReferral component into:
> - Coach thread view (renders after the message that triggered the flag)
> - Situation Room session view (renders below AI response)
> - Settings as a permanent "If you need support →" link to a /support page listing the helplines
>
> Test:
> - Submit crisis text in each surface → flag set, CrisisReferral renders, AI response uses the crisis-augmented system prompt
> - Submit PII → soft advisory shows inline
> - Submit real names → advisory shows (unless user opted out)

**Verification:**
- All three AI surfaces apply pre-flight checks consistently
- Crisis flag sets correctly across all surfaces
- CrisisReferral component renders in the right places
- User can opt out of real-name advisories in settings (but not PII or crisis)

**Commit:** `feat(safety): pre-flight checks wired across all AI surfaces`

---

## Prompt 3.13 — Quick Simulator (from Situation Room) + persona monogram component

**Purpose:** The 5-minute Simulator variant launched from Situation Room.

**Reference:** PRD §6.5.1 ("Roleplay it now" response path)

**The prompt:**

> Build the quick Simulator variant.
>
> Route `app/(app)/simulator/quick/page.tsx`:
> - Accepts `?from=situation:[sessionId]` query param
> - Server-side: loads the situation, uses Claude Haiku 4.5 to construct a tiny ad-hoc scenario from the situation context (persona, objective, brief)
> - Renders a streamlined brief screen (same visual treatment as the full Simulator brief but slightly shorter copy)
> - Begin → runs through the same engine as a normal scenario (3.10), capped at 8 turns
> - Debrief is shorter — 1 H1 line + 2 green flags + 1 yellow flag + suggestion to discuss with Coach
>
> Quick Simulator runs **also count against the `simulator_runs_lifetime` limit** for free users — no special unlimited tier for this variant.
>
> Build the shared Persona Monogram component `components/shared/PersonaMonogram.tsx`:
> - Props: `{initials, colour, size}` (size: 'small' | 'medium' | 'large')
> - Renders a circular monogram with Fraunces 400 letters
> - Colour from the six-colour muted palette (slate, moss, ochre, rose, teal, plum) — define as CSS vars in globals.css per Design Brief §6.4
> - Used across Simulator brief, Simulator turns, Scenario cards
>
> Build the Status Badge component `components/shared/StatusBadge.tsx`:
> - Props: `{status: 'green' | 'yellow' | 'red' | 'in_progress' | 'completed' | 'locked'}`
> - Uses icon + text + colour per Design Brief §6.4 — never colour alone
> - Used in Mission cards, Scenario cards, Debrief

**Verification:**
- Situation Room "Roleplay it now" link creates a quick Simulator session
- Quick scenario runs in fewer turns
- Debrief is shorter form
- Persona Monogram component renders consistently across surfaces
- Status Badge always shows icon + text, never colour alone

**Commit:** `feat(simulator): quick variant + shared persona/status components`

---

## Prompt 3.14 — Probation Mode surfaces (THE BIG PHASE 3 ADDITION)

**Purpose:** All the Probation Mode UI plus the fourth Coach tool. Wires together everything from PRD v1.9 §6.6. **Per PRD v1.9, Probation Mode is independent of the Mission Track lifecycle — it works for any user with a future probation date regardless of where they are in their journey or whether they have a Mission Track at all.** Build this prompt to handle the standard case (State A/B users with curriculum overlay); the standalone case for State C users without curriculum is prompt 3.17.

**Reference:** PRD v1.9 §6.6 (full feature spec — note the independence from Mission Track), §7.5 (flow), MVP Spec v1.3 §2.3 (probation columns + entry_state), §3.1 (probation actions), §4.2 (fourth Coach tool)

**Architectural rule for this prompt and 3.17:** Probation Mode activation logic checks ONLY `probation_review_date - probation_window_days <= today` AND `probation_review_date >= today`. It does NOT check Mission Track state, `current_day`, or `entry_state`. The UI rendering differs based on whether there's a Mission Track to overlay onto (3.14) or not (3.17), but the activation/deactivation/Brief-generation/outcome-capture logic is identical.

**The prompt:**

> Build the full Probation Mode feature set for users with a concurrent Mission Track (State A and State B users). The standalone variant for State C users is prompt 3.17 — but most of the logic in this prompt is shared and you'll build it once.
>
> **Step 1 — Daily Home banner replacement (when probation_mode_active):**
> Replace the standard week-theme banner on `/home` with the Probation banner:
> - Eyebrow "PROBATION — {days_to_review} DAYS TO REVIEW"
> - Fraunces italic H3 with day-appropriate framing (rotates through 3-4 lines): "This week: gather your evidence. Don't over-prepare." / "Today is rehearsal day. Run the probation scenario." / etc.
>
> **Step 2 — Probation missions inserted into Mission Track:**
> When Probation Mode active, the Mission Track for the final 21 days replaces the standard week missions with probation missions (from `content/missions/ba/probation/`, seeded in 2.7):
> - Book your pre-review 1:1 with your manager
> - Write your self-assessment (one-pager, three columns)
> - Assemble your evidence portfolio
> - Rehearse the review conversation (links to the probation scenario)
> - Pre-empt your one weakness
>
> Add a server-side helper `getActiveMissionsForToday(userId)` that returns probation missions instead of standard missions when Probation Mode is active.
>
> **Step 3 — Fourth Situation Room entry type:**
> Add "This is about my probation" as a fourth soft label on the Situation Room intake (built in 3.7 — wire up the conditional rendering). Add `'probation'` to the `situation_entry_type_enum` via migration `00006_probation_entry_type.sql`.
>
> Create `content/coach-prompts/situation-probation.md` — voice rules for probation-specific reasoning (resists catastrophising about the review; calibrates anxiety; surfaces concrete prep actions).
>
> Wire the entry type into the Situation Room handler from 3.8.
>
> **Step 4 — Coach fourth tool (`get_probation_evidence`):**
> Per MVP Spec §4.2:
> - Create `lib/coach/tools/get-probation-evidence.ts`
> - Returns structured JSON: completed missions (last 90 days), green-scored scenario runs, situation sessions, journal reflections
> - Register dynamically: only when `user_context.probation_mode_active = true`, the tool is added to the Coach's available tools and the per-response call limit becomes 4 (instead of 3)
>
> Update `lib/coach/handler.ts` to register tools dynamically per user state.
>
> **Step 5 — Probation Prep Pack playbook surface:**
> The Probation Prep Pack content was seeded in 2.6 (`ba-probation-pack.json`). When Probation Mode is active, this playbook is surfaced at the top of `/playbook` with a special "PROBATION PREP" eyebrow badge — visual signal that this is the right starting point.
>
> **Step 6 — Probation Brief generator:**
> Server action `generateProbationBrief()` in `app/(app)/probation/actions.ts`:
> - Single non-streaming Claude Opus 4.7 call
> - Calls `get_probation_evidence` server-side to assemble context
> - Generates the structured Brief per MVP Spec §2.5 content structure
> - Persists to `probation_artefacts` as `artefact_type = 'brief'`
> - Rate-limited: max 3 generations per user (per MVP Spec §11 open question recommendation)
>
> Brief view route `app/(app)/probation/brief/page.tsx`:
> - Shows the current Brief (most recent `is_current = true` for the user)
> - Editable in-app: each section can be clicked to edit; changes saved to `content.user_edits`
> - "Export as PDF" button — server-side PDF generation via Puppeteer or similar; one-time URL via Supabase Storage with 24h TTL
> - "Regenerate" button — shows "X of 3 generations used" caption mute
>
> **Step 7 — Outcome capture:**
> Cron route `app/api/cron/probation-outcome-prompt/route.ts`:
> - Runs daily; for users where `probation_review_date` was 1, 3, or 7 days ago AND `probation_outcome IS NULL`: send a single push + email prompt
> - "How did your review go?" with link to `/probation/outcome`
>
> Outcome capture route `app/(app)/probation/outcome/page.tsx`:
> - Eyebrow "YOUR PROBATION REVIEW"
> - Fraunces H3: "How did your review go?"
> - Four options as large editorial cards (one per line):
>   - "Continued — I'm staying."
>   - "Extended — we're checking in again."
>   - "Ended — I'm moving on."
>   - "Prefer not to say."
> - On selection: `captureProbationOutcome(outcome)` server action
>   - Updates `user_context.probation_outcome` and `probation_outcome_captured_at`
>   - Creates a Coach thread automatically with topic_title "After my probation review" and a system-generated first message voiced for the outcome (calm forward-looking for continued, calm practical for extended, deeply respectful for ended)
>   - Returns `{followup_thread_id}` — redirect user to that thread
>
> **Step 8 — Probation activation banner on /home (when prompt has been triggered):**
> When `probation_activation_prompted_at` is set and `probation_mode_active` is false, show a banner on /home:
> "Your probation review is in {N} days. Want to switch on Probation Mode?" + "Switch on" primary button + "Not yet" ghost
> Switching on calls `activateProbationMode()`.
>
> **Step 9 — Settings probation page enhancements:**
> Extend `/settings/probation` (from prompt 1.8) with:
> - Manual override controls for window length
> - View past Probation Briefs (history of `probation_artefacts`)
> - "View my probation outcome" if captured
>
> This prompt is the heaviest in Phase 3. Test rigorously:
> - Set a probation date 21 days in the future → activation banner appears → switching on shows probation banner + probation missions
> - Coach gains fourth tool when active; calls it correctly
> - Brief generates, edits, exports as PDF
> - Outcome capture flow works for all four outcomes
> - Post-review Coach thread voices correctly for the captured outcome

**Verification:**
- Activation banner appears at T-21 days
- Daily Home banner switches to Probation Mode banner
- Probation missions appear in Mission Track for final 21 days
- Fourth Situation Room entry shows when Probation Mode active
- Coach fourth tool registers correctly; max calls becomes 4
- Brief generates, persists, edits, exports as PDF
- 3-generation limit enforced
- Outcome capture flow with all four outcomes works
- Post-review Coach thread auto-creates with outcome-specific voice
- Mode auto-deactivates after review date

**Commit:** `feat(probation): full Probation Mode surfaces, fourth tool, brief, outcome capture`

---

## Prompt 3.15 — Coach post-90 priming variant

**Purpose:** Make the Coach's system prompt context-aware of users past Day 90. Voice and tools unchanged; only the situational priming switches based on `user_context.current_day`.

**Reference:** PRD v1.9 §6.0 (continuing surfaces) and §7.4 (90-Day Graduation), MVP Spec v1.3 §4.2 (Coach system prompt structure with day variants), SKILL.md v1.3 §8.2 (voice for post-Day-90 users)

**The prompt:**

> Extend the Coach system prompt builder to handle the post-Day-90 priming variant.
>
> Read MVP Spec v1.3 §4.2 — specifically the "System prompt structure" subsection with the two priming variants. Read SKILL.md v1.3 §8.2 for the voice rules around post-90 users.
>
> Update `lib/coach/system-prompt.ts`:
> - The `buildCoachSystemPrompt(userId, threadId)` function currently composes from five blocks (role priming, voice rules, current context, safety, tool descriptions).
> - The "current context" block needs **two variants** depending on `user_context.current_day`:
>   - **Days 1-90 (existing):** *"You are coaching a [role] in week [N] of their first 90 days at a new role."* + recent missions + recent situation sessions
>   - **Day 91+ (new):** *"You are coaching a [role] who completed their first 90 days at this organisation on [date]. They are now [N] weeks into the role beyond probation."* + recent Coach threads + recent situation sessions + recent simulator runs (no mission references since the curriculum has ended)
> - The variant selection happens **server-side in the prompt builder, not in the prompt itself.** Claude never sees both variants; only the appropriate one.
>
> Create `content/coach-prompts/post-90-context.md` containing the post-90 framing variant template per role. Each role's variant should reflect what the post-90 reality looks like for that role:
> - **BA post-90:** the user is now expected to lead workshops independently, draft BRDs without close supervision, and be a trusted translator between business and tech
> - **PM post-90:** the user is now expected to own delivery accountability, not just track it
> - **SM post-90:** the user is now expected to coach team culture, not just facilitate ceremonies
> - **PO post-90:** the user is now expected to own product decisions, not just relay them
> - **DA post-90:** the user is now expected to push back on bad analytical asks, not just service them
> - **AIE post-90:** the user is now expected to scope production AI work, not just implement it
>
> Each role's post-90 context block is ~100-150 words of editorial framing — not a checklist, not bullets. Voice register matches `content/coach-prompts/voice.md` (senior colleague, calm, direct).
>
> Update the Coach handler from prompt 3.5 to use the new variant selection. The change is small: one branch in the prompt-building flow that loads `post-90-context.md` instead of `role-{role}.md` for the role priming block when `current_day > 90`.
>
> Critical behavioural rules to enforce in the post-90 system prompt:
> 1. **Do not suggest the Mission Track** to post-90 users — the curriculum has concluded
> 2. **Do not use 90-day journey framing** ("by week 6 you should…") — the user is past this
> 3. **Surface only the surfaces the user still has** (Situation Room, Coach, Playbook, Simulator)
> 4. **Voice register stays identical** — calm, direct, dry, never "AI assistant"
>
> Add integration tests:
> - Coach thread for a Day-50 user uses the standard priming
> - Coach thread for a Day-95 user uses the post-90 priming
> - Post-90 user prompts don't reference the Mission Track
> - Voice register is consistent across both variants (sample a few responses; review manually)
>
> The change should be invisible to the user — they shouldn't notice the priming switch at Day 91. The Coach just keeps working, with subtly different framing that matches their stage.

**Verification:**
- A user with `current_day = 50` gets the standard Coach priming (verify in a logged thread)
- A user with `current_day = 95` gets the post-90 priming (verify in a logged thread)
- Post-90 Coach responses don't reference Mission Track or 90-day journey framing
- Voice register matches across both variants
- Tests pass

**Commit:** `feat(coach): post-Day-90 system prompt priming variant`

---

## Prompt 3.16 — Post-Day-90 Daily Home state

**Purpose:** The third state of the Daily Home. Activates when `current_day > 90`. The Mission Track has concluded; the Situation Room becomes the centre of gravity.

**Reference:** PRD v1.9 §7.4 (90-Day Graduation and Day 91+), Design Prompts v2.0 C16 (visual reference), CLAUDE.md v1.3 "Post-Day-90 Reuse" section, prompt 2.2 (existing Daily Home with two states)

**The prompt:**

> Extend the Daily Home page (built in prompt 2.2) to handle the third state — Day 91+.
>
> Read PRD v1.9 §7.4 and the Daily Home section of CLAUDE.md v1.3. Reference Design Prompts v2.0 C16 for the exact visual layout.
>
> The Daily Home now has three rendering states, selected server-side based on `user_context.current_day`:
> - **Day 1** (signature design moment from prompt 2.2)
> - **Day N within 90** (populated state from prompt 2.2)
> - **Day 91+ (new):** the post-curriculum state
>
> Build the Day 91+ state with these characteristics:
>
> **Banner replacement:**
> - Top: small Eyebrow showing "DAY 95 — TUESDAY, 27 AUGUST" (no "WEEK N" — the week-curriculum has ended)
> - Below: simpler editorial banner replacing the standard week-theme banner:
>   - Background `--paper-2`, 1px border `--paper-3`, 8px radius, 32px padding
>   - Fraunces italic H3 (single line, no eyebrow above): rotating editorial lines such as *"You're past your first 90 days. The work continues."* — rotation set seeded by day-of-week so it's stable per session
>   - Below the line: small body S mute italic *"Your Survival Report is always here →"* (link to `/probation/survival-report` or wherever the Day 90 Survival Report lives)
>
> **Main content area:**
> - **No Mission Track cards.** The Mission Track has ended; do not render mission cards or mission slots even as locked states.
> - **The Situation Room input becomes the main surface** — larger than during the curriculum phase, taking roughly two-thirds of the main column width on desktop:
>   - Use the same Situation Room intake component from prompt 3.7
>   - Three soft labels (the standard three: *I need help with this* / *Is this normal?* / *I just did something*) — the fourth probation label is hidden (probation has ended)
>   - Placeholder: *"What's on your mind today? Anonymise as you go."*
> - To the right of the Situation Room input (desktop) or below (mobile), a small editorial card:
>   - Eyebrow caption mute: "OR"
>   - Three editorial linked rows in Fraunces italic body S, separated by hair-thin dividers:
>     - *"Open Coach →"* → routes to `/coach`
>     - *"Browse Playbooks →"* → routes to `/playbook`
>     - *"Run a Simulator scenario →"* → routes to `/simulator`
>
> **Right sidebar (desktop only):**
> - **"Recent"** section replacing "Week at a glance":
>   - Last Coach thread topic in Fraunces italic body S + caption mute date stamp
>   - Last Situation Room session summary in Fraunces italic body S + caption mute date stamp
>   - Last Simulator scenario title + outcome flag (green/yellow/red status badge) + caption mute date stamp
> - **"What I know"** section (same as the Day-N-within-90 state from prompt 2.2)
> - **"Your Survival Report"** small editorial card at the bottom:
>   - Fraunces italic single line *"Day 90 — your Survival Report"*
>   - Caption mute italic *"Re-read whenever you need to."*
>   - Small "Open →" link
>
> **State selection logic:**
> - Server-side in the Daily Home page component, compute `current_day` from `user_context.start_date` and today
> - If `current_day == 1`: render Day 1 state (existing)
> - If `current_day > 1 && current_day <= 90`: render Day N within 90 (existing)
> - If `current_day > 90`: render Day 91+ state (this prompt)
>
> Handle the edge case where `start_date` is null — treat as Day 1 (already handled in prompt 2.2).
>
> Add a settings setting that lets the user manually flip a `view_as_day_91_plus` toggle for testing (NODE_ENV=development only, hidden in production).
>
> Add a small "What changed?" Fraunces italic line on the user's first visit to Day 91 (track via `user_context.viewed_post_90_home_at`):
> - Eyebrow "WHAT CHANGED"
> - Fraunces italic body L: *"Today is Day 91. Your structured 90-day curriculum is complete. Situation Room, Coach, Playbooks, and Simulator continue indefinitely. The Mission Track has concluded — but the work continues."*
> - "Got it" ghost button → sets `viewed_post_90_home_at` to now, dismisses the message
>
> The "What changed?" message is visible only on the user's first post-90 visit. Subsequent visits to Day 91+ show the standard state without the message.
>
> Critical: do not break anything for Day 1-90 users. The existing two states from prompt 2.2 must still render correctly.
>
> Test cases:
> - Day 1 user: existing Day 1 state, unchanged
> - Day 50 user: existing Day N state, unchanged
> - Day 91 user (first visit): post-90 state with "What changed?" message
> - Day 91 user (subsequent visit): post-90 state without "What changed?" message
> - Day 180 user: post-90 state, no "What changed?"
> - User with NULL start_date: Day 1 state

**Verification:**
- Day 50 user sees standard populated Daily Home
- Day 91 user on first visit sees post-90 state with "What changed?" message
- Day 91 user on subsequent visit sees post-90 state without "What changed?" message
- No Mission Track cards visible on post-90 state
- Situation Room input is larger than on Day N within 90
- Right sidebar shows "Recent" instead of "Week at a glance"
- "Your Survival Report is always here →" link is present, quietly placed
- Fourth Situation Room label (probation) is absent
- No "Earn Your Promotion track coming soon" banner anywhere — page feels complete on its own terms

**Commit:** `feat(home): post-Day-90 Daily Home state`

---

## Prompt 3.17 — Probation Mode in standalone post-Day-90 context

**Purpose:** Extend Probation Mode to work for users with no concurrent Mission Track — primarily **State C users with a future probation date** (e.g., 6-month probation, signed up at Month 3), but also post-graduation State A/B users with extended or repeat probations after Day 90.

**Reference:** PRD v1.9 §6.6 (Probation Mode independent of curriculum state), §7.4 (State C handling), MVP Spec v1.3 §9 Phase 3.17

**The prompt:**

> Extend the Probation Mode infrastructure from prompt 3.14 to handle users with no concurrent Mission Track.
>
> **The architectural rule:** Probation Mode activation logic is identical regardless of curriculum state. The activation check is purely `probation_review_date - probation_window_days <= today AND probation_review_date >= today`. What changes is only the Daily Home rendering when both Probation Mode is active AND the user has no current Mission Track (`entry_state == 'C' OR current_day > 90`).
>
> **Step 1 — Daily Home state selection update.**
>
> Update the Daily Home state-selection logic from prompt 3.16 to handle the new combined case:
>
> ```
> if probation_mode_active == true:
>   if entry_state == 'C' OR current_day > 90:
>     render Probation Mode banner replacing the standard post-Day-90 banner
>     show probation missions as the daily missions (no other missions exist)
>     fourth Situation Room label visible
>     "Recent" sidebar (post-Day-90 layout retained for non-probation sections)
>   else:
>     render existing 3.14 behavior (Probation Mode overlay on Mission Track)
> else:
>   render base state per entry_state and current_day (existing logic)
> ```
>
> **Step 2 — Probation missions for post-Day-90 users.**
>
> The 5-mission probation set from prompt 3.14 (Book your pre-review 1:1, Write self-assessment, Assemble evidence portfolio, Rehearse the review conversation, Pre-empt your one weakness) becomes the *daily mission set* during the probation window for these users — not inserted into a Mission Track, but rendered as the standalone curriculum for the active window.
>
> Update the mission renderer in `app/(app)/home/page.tsx` to handle this case:
> - When `probation_mode_active == true AND no current Mission Track`: query probation missions directly via `getProbationMissions(role, days_to_review)` (new server action — returns 1-2 probation missions appropriate for the user's current probation timeline)
> - Render these as standard Mission Cards but with eyebrow "PROBATION" instead of "TODAY — DAY N"
> - Mission detail pages work identically — same five sections, same completion flow
>
> **Step 3 — Probation Brief generation for users without curriculum data.**
>
> The Brief generation logic from prompt 3.14 calls `get_probation_evidence` to assemble context from completed missions, scenario runs, situation sessions, and journal reflections. For State C users, the "completed missions" category will be empty (they have no Mission Track). The Brief generator must handle this gracefully:
>
> - The `get_probation_evidence` tool returns whatever categories *do* have data — situation sessions, Coach threads, and (if any) the probation missions completed during the active window
> - The Brief structure stays identical (top half: Delivered / Learned / Want next; bottom half: three examples; footer: three questions)
> - For the "examples" section, draw from situation sessions and Coach thread topics rather than scenario runs and mission completions
> - If the user has used the product for less than 14 days at Brief generation time, surface a small editorial note in the Brief output: *"You've only been with FirstNinety for {N} days, so this Brief draws on a shorter window of evidence than usual. Trust your own knowledge of the work — FirstNinety is a tool to organise your thinking, not the source of it."*
>
> **Step 4 — Post-review transition.**
>
> When Probation Mode deactivates (review date passes or user manually deactivates), State C users return to the standard post-Day-90 state (from prompt 3.16), not to a Mission Track. The outcome capture and post-review Coach thread work identically.
>
> **Step 5 — Verification that the architecture stays clean.**
>
> Run an audit pass on the Probation Mode codebase:
> - No code path checks `current_day` to decide whether Probation Mode can activate
> - No code path checks `entry_state` to decide whether Probation Mode can activate
> - The Daily Home renderer is the only place that uses `entry_state` to decide which layout to render *around* the active Probation Mode
> - The Brief generator handles missing curriculum data gracefully without failing
>
> This audit ensures Probation Mode's independence is genuinely architectural, not just notional.

**Verification:**
- A State C user (start_date 100 days ago) with a probation date 14 days from today: Probation Mode activates correctly, banner replaces the standard post-Day-90 banner, probation missions render as the daily missions, fourth Situation Room label appears
- The same State C user generates a Probation Brief: Brief renders correctly with examples drawn from situation sessions and Coach threads (not from missing mission completions)
- After review date passes, the user returns to the standard post-Day-90 state (not to a Mission Track)
- A standard State A user with probation in the final 21 days of curriculum: Probation Mode behaves per prompt 3.14 (overlay on Mission Track)
- Architectural audit: no code path conditions Probation Mode activation on `current_day` or `entry_state`

**Commit:** `feat(probation): standalone post-Day-90 context for State C users`

---

## Phase 3 Exit Gate

- [ ] All six product features work end-to-end with seeded BA content
- [ ] Probation Mode works end-to-end (test simulated against a near-future review date)
- [ ] **Post-Day-90 Daily Home state renders correctly when `current_day > 90`** (test by setting a user's start_date to 100 days ago)
- [ ] **Coach post-90 priming variant loads correctly for users past Day 90** (verify in a test thread)
- [ ] **State B (mid-journey within 90 days) signup tested end-to-end — user signing up at Day 22 sees mid-journey welcome, skipped weeks marked `skipped_pre_signup`, current week available**
- [ ] **State C (post-Day-90 at signup) signup tested end-to-end — user with start_date 100 days ago lands directly into post-Day-90 Daily Home, no `mission_completions` rows created**
- [ ] **State C user with future probation date — Probation Mode activates standalone (no curriculum overlay), Brief generates correctly from situation sessions and Coach threads if no missions exist**
- [ ] **Coach Day 91+ priming variant works for State A/B graduated users; Coach State C priming variant works for State C users**
- [ ] Cost per Coach interaction is tracked correctly in `ai_calls`
- [ ] Tier gating denies free users at the right limits across all surfaces
- [ ] Coach tool-calling works; fourth tool registers conditionally on Probation Mode
- [ ] Simulator two-call pattern works (persona + coordinator)
- [ ] Debriefs use the honest senior-colleague voice from SKILL.md v1.3 §4.3
- [ ] Safety checks fire correctly; CrisisReferral renders appropriately
- [ ] Coach correctly redirects pure technical questions per the scope boundary (test by asking the Coach to write SQL or debug code — expected: acknowledge lane, point to ChatGPT/Stack Overflow, offer in-scope alternative if relevant)
- [ ] No "Great question!" openers anywhere in AI output (review samples)
- [ ] P50 first-token latency under 2.5s for Coach and Situation Room

This is the biggest gate. Don't skip the manual voice review.

---

# Phase 4 — Payments + Marketing (5 prompts)

Revenue surfaces. Estimated 3-4 days.

---

## Prompt 4.1 — Stripe Checkout + Customer Portal integration

**Purpose:** Live payments.

**Reference:** MVP Spec §1.1 (Stripe), PRD §8.1 (pricing), MVP Spec §3.1 (billing actions)

**The prompt:**

> Build the Stripe integration.
>
> In Stripe Dashboard (manually): create the Product "FirstNinety Pro" with two recurring prices — $39.99/month and $399/year. Capture the price IDs into env vars `STRIPE_PRO_PRICE_ID_MONTHLY` and `STRIPE_PRO_PRICE_ID_YEARLY`.
>
> Set up Stripe Customer Portal with: change plan, cancel, update payment method, view invoices. Enable email receipts.
>
> Create `lib/billing/stripe.ts`:
> - `createCheckoutSession(userId, priceId)` — creates a Stripe Checkout session with the user as customer, success_url back to /home, cancel_url to /pricing
> - `createPortalSession(userId)` — creates a Customer Portal session
> - Both server-side only
>
> Server actions in `app/(app)/settings/billing/actions.ts`:
> - `startCheckout(plan: 'monthly' | 'yearly')` → `{ url: string }` — creates Checkout session and returns the URL for redirect
> - `openCustomerPortal()` → `{ url: string }` — creates Portal session
>
> Settings billing page `app/(app)/settings/billing/page.tsx`:
> - Eyebrow "BILLING"
> - Fraunces H1 "Your subscription."
> - For free users: shows current tier as "Free" and a "Start a free trial" CTA + monthly/yearly toggle
> - For Pro users: shows tier, next billing date, "Manage subscription" button (opens Portal)
> - Caption mute: "7-day free trial. Cancel anytime."
>
> Add the same "Start free trial" CTA in the TierLimitPrompt component from 3.2 — link routes to the Checkout flow.
>
> Trial logic: Stripe Checkout configured with 7-day trial; `subscriptions.trial_end` captured from webhook.

**Verification:**
- Checkout flow completes end-to-end with Stripe test card
- After successful payment, `subscriptions` row updates to `tier=pro, status=trialing`
- Customer Portal opens correctly
- Free trial appears as "7 days remaining" in settings
- Cancel from portal correctly updates `subscriptions.cancel_at_period_end`

**Commit:** `feat(billing): Stripe Checkout + Customer Portal`

---

## Prompt 4.2 — Stripe webhook handler

**Purpose:** Keep subscription state in sync.

**Reference:** MVP Spec §3.2 (Stripe webhook)

**The prompt:**

> Build the Stripe webhook handler at `app/api/stripe/webhook/route.ts`.
>
> Verify signature against `STRIPE_WEBHOOK_SECRET`.
>
> Handle these events:
> - `customer.subscription.created` → upsert `subscriptions` row with tier=pro, status from event
> - `customer.subscription.updated` → update tier, status, current_period_end, cancel_at_period_end
> - `customer.subscription.deleted` → set tier=free, status=canceled
> - `customer.subscription.trial_will_end` → log to PostHog for analytics; optionally email user (Phase 5)
> - `invoice.payment_failed` → set status=past_due
> - `invoice.payment_succeeded` → ensure status=active
>
> Use the service-role Supabase client (server-only) to write to `subscriptions`.
>
> Log every webhook event to PostHog with metadata for debugging.
>
> Set up the webhook endpoint in Stripe Dashboard pointing to `https://[domain]/api/stripe/webhook` and capture the signing secret into env.
>
> Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook` and trigger sample events.

**Verification:**
- `stripe listen` shows events arriving and webhook returning 200
- Subscription state correctly reflects each event type
- Webhook signature verification rejects unsigned requests
- PostHog events for each webhook event type appear

**Commit:** `feat(billing): Stripe webhook handler`

---

## Prompt 4.3 — Marketing landing page

**Purpose:** The editorial main landing page at /.

**Reference:** Design Prompts B1, Design Brief §13

**The prompt:**

> Build the main marketing landing page at `app/(marketing)/page.tsx`.
>
> **Use Design Prompts B1 from the design prototype as your blueprint** — same copy, same layout, same editorial tone.
>
> Critical: this is **not** a generic SaaS landing page template. Three-column feature grids are banned. Hero is pure typography. "How it works" alternates left/right. Pricing section names ChatGPT and human coaches as anchor.
>
> Sections in order:
> 1. Header chrome (already built in 0.5)
> 2. Hero — pure typography, headline "The 90 days nobody trained you for."
> 3. Problem section — three editorial paragraphs, NOT bullets
> 4. How it works — five rows alternating left/right, each feature with minimal visual illustrating it
> 5. Price section — anchor against ChatGPT/BetterUp/coach
> 6. Footer
>
> Each "How it works" row needs a minimal visual representation (built inline, not stock illustration):
> - Situation Room: stylised single input field with three soft labels
> - Simulator: three persona monograms with "Begin" button (use the PersonaMonogram component from 3.13)
> - Coach: stylised chat bubble in Fraunces italic with a line of dialogue
> - Playbook: stylised page with margin annotation
> - Mission Track: row of mission cards
>
> Build the footer component `components/marketing/Footer.tsx`:
> - Four columns: Product, Roles, Company, Legal
> - "Roles" column links to /ba, /pm, /sm, /po, /da, /ai-engineer (the AI Engineer link routes to the dedicated landing in 4.4 — others are stubs at MVP)
> - Wordmark left, copyright right, tagline italic Fraunces "Built for the moment training ends."
>
> Performance: aim for Lighthouse Performance 95+. Minimise CLS by reserving font space. Use `next/image` for any images.
>
> Track scroll depth as PostHog events (helpful for measuring engagement on long landing pages).

**Verification:**
- Page renders at `/`
- Lighthouse Performance > 90
- No three-column feature grid
- Hero is pure typography
- All five "How it works" rows render with their minimal visuals
- Pricing section names ChatGPT and BetterUp
- Footer renders correctly

**Commit:** `feat(marketing): main landing page`

---

## Prompt 4.4 — AI Engineer dedicated landing page

**Purpose:** The wedge marketing surface for the AI Engineer audience.

**Reference:** Competitive Analysis §12.4, Design Prompts B2

**The prompt:**

> Build the AI Engineer landing page at `app/(marketing)/ai-engineer/page.tsx`.
>
> **Use Design Prompts B2 from the design prototype as your blueprint.**
>
> Critical: **dark mode is the default for this page**, regardless of system preference. User can toggle to light via the chrome.
>
> Sections:
> 1. Header (uses the `FirstNinety_ai` wordmark variant from Design Brief §9)
> 2. Hero — "The tradecraft no one is documenting yet."
> 3. Six conversations section — six numbered editorial prompts in Fraunces italic body L (from Design Prompts B2)
> 4. "What's different here" — three editorial paragraphs with quote pull
> 5. "This is not a course" clarification
> 6. Pricing snippet
> 7. Footer
>
> Implement the dark-mode-default logic: set `<html data-theme="dark">` on this route only. The chrome includes a small theme toggle for users who want light.
>
> Track this as a separate conversion funnel in PostHog (`landing_view: 'ai_engineer'`).

**Verification:**
- Page renders dark by default
- Theme toggle works
- Wordmark uses the `FirstNinety_ai` variant
- Six conversations render as editorial italic numbered list
- All content follows the editorial tone from Design Prompts B2

**Commit:** `feat(marketing): AI Engineer dedicated landing page`

---

## Prompt 4.5 — Pricing page + Joberlify cross-sell auth

**Purpose:** Standalone pricing page + shared Supabase auth with Joberlify.

**Reference:** Design Prompts B3, MVP Spec §8 (Joberlify integration)

**The prompt:**

> Build the pricing page at `app/(marketing)/pricing/page.tsx`.
>
> **Use Design Prompts B3 from the design prototype as your blueprint.**
>
> Two pricing cards (Free + Pro), Pro on `--ink` background as the premium visual signal. Comparison table anchoring against ChatGPT/BetterUp/human coach. FAQ accordion using `<details>` native element.
>
> CTAs route to Stripe Checkout flow from 4.1.
>
> Then: implement the Joberlify cross-sell auth (per MVP Spec §8):
>
> **Shared Supabase project:** Joberlify and FirstNinety share the same Supabase project. A user signing up to either gets a single `auth.users` row. Each app has its own application-level `users` table.
>
> Add `app/(auth)/register/page.tsx` enhancement: detect `?source=joberlify_offer_accepted&joberlify_user_id={uuid}` query params:
> - If the auth.users row already exists (joberlify_user_id maps to an existing user), skip the email/password form and go straight to onboarding with a personalised welcome line: "You're already signed up via Joberlify. Let's get you set up for what comes next."
> - Otherwise, normal signup flow but tag `signup_source = 'joberlify_offer_accepted'` on the `public.users` row
>
> Add a "Coming from Joberlify?" link on `/register` that explains the shared auth and prefills the form.
>
> Track Joberlify-sourced signups as a separate funnel in PostHog.
>
> Configure CORS appropriately on the shared Supabase project.

**Verification:**
- Pricing page renders correctly with both cards
- Pro card has `--ink` background
- Comparison table renders as text rows with hair-thin dividers
- FAQ accordion works
- Joberlify cross-sell: a user signing up with `?source=joberlify_offer_accepted&joberlify_user_id=X` (and an existing matching auth.users row) goes straight to onboarding with personalised welcome
- `signup_source` correctly captured on `public.users`

**Commit:** `feat(marketing): pricing page + Joberlify cross-sell auth`

---

## Phase 4 Exit Gate

- [ ] User can subscribe via Stripe Checkout
- [ ] Customer Portal opens correctly
- [ ] Webhook keeps subscription state in sync
- [ ] Marketing landing renders at /
- [ ] AI Engineer landing renders at /ai-engineer in dark mode by default
- [ ] Pricing page renders at /pricing
- [ ] Joberlify cross-sell auth works end-to-end
- [ ] Free → Pro upgrade flow is testable end-to-end

---

# Phase 5 — Content + Launch Readiness (10 prompts)

The critical path. Content production for the remaining 5 roles, plus everything needed to launch. Estimated 6-8 days.

---

## Prompt 5.1 — Seed PM role content (8 scenarios, 8 playbooks, 30 missions, probation)

**Purpose:** PM role at full depth.

**Reference:** SKILL.md §3.2 (PM tradecraft), prompts 2.6 structure

**The prompt:**

> Author and seed PM role content at full depth, mirroring prompt 2.6's structure but for the Project Manager role.
>
> 8 PM scenarios per SKILL.md §3.2 (PM characteristic situations):
> 1. `pm-deadline-slipping.json` — Telling a sponsor a date is slipping
> 2. `pm-scope-creep.json` — Scope creep negotiation
> 3. `pm-skeptical-exec.json` — Status update to a sceptical exec
> 4. `pm-team-estimate.json` — Defending a team estimate the business doesn't like
> 5. `pm-first-retro.json` — First retrospective as a facilitator
> 6. `pm-risk-walkthrough.json` — Risk register walkthrough to a senior stakeholder
> 7. `pm-cross-team.json` — Negotiating with a peer PM whose team is blocking yours
> 8. `pm-probation-review.json` — The PM Probation Review
>
> 8 PM playbooks per SKILL.md §3.2:
> 1. Project plan (Gantt + RAID)
> 2. Business case template
> 3. RAID register
> 4. Status report (weekly + monthly variants)
> 5. Change request
> 6. Lessons learned doc
> 7. Stakeholder communications plan
> 8. PM Probation Prep Pack
>
> 30 PM missions (week 1-13) + 5 probation missions per the same template structure as BA.
>
> Apply SKILL.md §10 60-second quality test rigorously. PM voice is "accountable but rarely the smartest technical person in the room. Their value is *clarity* and *consequence*."
>
> Create `content/coach-prompts/role-pm.md` with PM-specific Coach priming.
>
> Run `pnpm seed`.

**Verification:**
- All PM content seeded successfully
- Spot-check 3 scenarios, 3 playbooks, and 3 missions against SKILL.md §10
- PM Coach prompt routes correctly when user.primary_role = 'pm'

**Commit:** `content: PM role full content depth`

---

## Prompt 5.2 — Seed SM role content

**Purpose:** Scrum Master role at full depth.

**Reference:** SKILL.md §3.3

**The prompt:**

> Mirror 5.1 but for Scrum Master role.
>
> 8 SM scenarios per SKILL.md §3.3:
> 1. Facilitating a tense retro
> 2. Coaching a defensive PO
> 3. Removing an impediment from an ops team that doesn't report to you
> 4. Handling a dominant team member silencing others
> 5. "I missed standup" coaching moment
> 6. The first retrospective where someone cries
> 7. Sprint planning when the team disagrees on capacity
> 8. The SM Probation Review
>
> 8 SM playbooks: sprint goal, retro agendas (5 variants), ceremony agendas, impediment log, team charter, velocity report, working agreements, definition of done/ready, SM Probation Prep Pack.
>
> 30 SM missions + 5 probation missions.
>
> SM voice: "servant-leader — not a boss, not a peer, not a coach exactly. Power comes from *holding the space* rather than directing it."
>
> Create `content/coach-prompts/role-sm.md`.

**Verification:** Same as 5.1.

**Commit:** `content: SM role full content depth`

---

## Prompt 5.3 — Seed PO role content

**Purpose:** Product Owner role at full depth.

**Reference:** SKILL.md §3.4

**The prompt:**

> Mirror 5.1 but for Product Owner role. Many PO situations overlap with BA — about 50% of scenarios can adapt BA equivalents, but the voice and framing differ.
>
> 8 PO scenarios per SKILL.md §3.4. 8 PO playbooks. 30 PO missions + 5 probation missions.
>
> PO voice: "opinionated but calm. The only person on the team allowed to say 'no' to the business."
>
> Create `content/coach-prompts/role-po.md`.

**Verification:** Same as 5.1.

**Commit:** `content: PO role full content depth`

---

## Prompt 5.4 — Seed DA role content

**Purpose:** Data Analyst role at full depth.

**Reference:** SKILL.md §3.5

**The prompt:**

> Mirror 5.1 but for Data Analyst role.
>
> 8 DA scenarios per SKILL.md §3.5. 8 DA playbooks (requirements doc for dashboards, SQL query patterns annotated, data quality report, stakeholder summary template, A/B test plan, dashboard design checklist, "quick number" intake template, DA Probation Prep Pack). 30 DA missions + 5 probation missions.
>
> DA voice: "quietly skeptical. Their value is asking 'what would you do with this number?' before producing it."
>
> Create `content/coach-prompts/role-da.md`.

**Verification:** Same as 5.1.

**Commit:** `content: DA role full content depth`

---

## Prompt 5.5 — Seed AIE role content (the highest-priority wedge)

**Purpose:** AI Engineer role at full depth. The defensible category wedge.

**Reference:** SKILL.md §3.6, Competitive Analysis §12.4

**The prompt:**

> Author and seed AI Engineer role content at full depth.
>
> This is **the most original content authoring** of the project — per Competitive Analysis §12.4, no competitor has any content here. The wedge is defensible only if the content is strong.
>
> 8 AIE scenarios per SKILL.md §3.6:
> 1. Explaining hallucinations to a non-technical PM
> 2. Justifying eval-driven development to a sceptical lead
> 3. Scoping a RAG vs fine-tune decision in front of an impatient finance lead
> 4. Cost conversation with finance
> 5. "Just use ChatGPT for this" pushback
> 6. Friday afternoon — production system hallucinated to a customer
> 7. Architectural review: defending an agentic vs feature decision
> 8. The AIE Probation Review
>
> 8 AIE playbooks (original AkomzyAi practitioner IP):
> 1. Eval rubric template
> 2. Prompt versioning doc
> 3. RAG architecture decision record
> 4. Cost analysis template
> 5. Model card template
> 6. Hallucination test plan
> 7. Agent flow diagram template (with MCP / LangGraph variants)
> 8. AIE Probation Prep Pack
>
> 30 AIE missions + 5 probation missions.
>
> AIE voice: "measured and grounded. The field is hyped to death; their value is being the calm person who knows what the tech can and can't do. Authoritative without being arrogant."
>
> Lean on AkomzyAi practitioner expertise directly. This is the role where Tokunbo authors personally rather than templating.
>
> Create `content/coach-prompts/role-aie.md`.

**Verification:** Same as 5.1, plus extra-thorough review of technical accuracy. Worth getting one outside AI engineer to do a peer review pass.

**Commit:** `content: AIE role full content depth - the defensible wedge`

---

## Prompt 5.6 — Email templates (Resend)

**Purpose:** Transactional emails for key moments.

**Reference:** MVP Spec §1.1 (Resend), various references throughout

**The prompt:**

> Set up transactional email templates with Resend.
>
> Templates:
> 1. **Welcome** — sent on signup. Subject "Welcome to FirstNinety. Day 1 starts now." Body: warm editorial paragraph, single CTA "Open Day 1 →"
> 2. **Sunday recap** — sent every Sunday 18:00 user-local. Subject "What's coming up this week?" Body: short editorial, link to /home?sundayPrompt=1
> 3. **Probation activation** — sent at T-21 days. Subject "Your probation review is in 21 days." Body: calm reminder, link to activate
> 4. **Trial ending** — sent 2 days before trial ends. Subject "Your free trial ends in 2 days." Body: direct, no upsell shouting, "Manage subscription →" link
> 5. **Cancellation confirmation** — sent on cancel. Subject "Your subscription is canceled." Body: respectful, info on access until period end
> 6. **Data export ready** — sent when user requests export. Subject "Your data export is ready." Body: download link
> 7. **Password reset** — Subject "Reset your FirstNinety password." Standard reset link
>
> All templates use the FirstNinety voice from SKILL.md §2: senior colleague, no exclamation marks, no emoji, Fraunces for the headline if possible (or fall back to a serif system font for email clients that don't support custom fonts).
>
> Build a tiny email rendering layer in `lib/email/render.tsx` using React Email so templates can be designed component-wise.
>
> Test sending each template in dev to a real email account.

**Verification:**
- Each template renders correctly in Gmail, Outlook, Apple Mail
- No broken styles, no "Click here!" CTAs, no marketing-speak
- Sender address from `RESEND_FROM_EMAIL`

**Commit:** `feat(email): all transactional templates`

---

## Prompt 5.7 — PostHog dashboards + alerts

**Purpose:** Operational visibility from day one.

**Reference:** PRD §10 (success metrics), MVP Spec §10 (operational DoD)

**The prompt:**

> Configure PostHog for production analytics.
>
> Set up these dashboards:
>
> **1. Acquisition** — signups by source, conversion to Day 1 active, Joberlify cross-sell signups
>
> **2. Activation** — Day 30 Active Rate (the north star), activation rate (first mission OR situation OR simulator within 48h)
>
> **3. Retention** — Mission Track completion (Day 90), simulator runs per active user per week, Situation Room sessions per active user per week
>
> **4. Conversion** — Free → Pro conversion rate, trial-to-paid conversion
>
> **5. AI cost** — cost per user per month, cost per surface, cost trend over time, cost outliers (top 10 expensive users this week)
>
> **6. Probation** — activation rate, brief generation rate, outcome capture rate, outcome distribution
>
> **7. Performance** — P50 / P95 first-token latency by surface, error rates by surface
>
> Set up alerts:
> - AI cost runaway: alert if any single user crosses $5/day OR if global cost crosses $X/day (calibrate after first week of production data)
> - Error rate spike: alert if AI surface error rate > 5% over 1h
> - P95 latency: alert if P95 first-token > 6s over 1h
> - Failed webhook: alert on Stripe webhook 4xx/5xx
>
> Use PostHog's native alerting or wire to Slack via webhook.
>
> Document every tracked event in `docs/posthog-events.md`.

**Verification:**
- All seven dashboards render correctly in PostHog
- Alerts fire on test triggers
- All event types documented

**Commit:** `feat(analytics): PostHog dashboards and alerts`

---

## Prompt 5.8 — Error pages + legal pages + offline state

**Purpose:** Polish surfaces and required compliance pages.

**Reference:** MVP Spec §10 (operations DoD), PRD §9.4 (privacy)

**The prompt:**

> Build the remaining polish surfaces.
>
> **Error pages:**
> - `app/not-found.tsx` (404) — Fraunces italic "We can't find that page." with a "Back home →" link. Editorial tone, no humour, no images.
> - `app/error.tsx` (500) — Fraunces italic "Something went wrong on our side." + "Try again" button + "Contact support" link. Logs error to PostHog.
> - `app/offline/page.tsx` — Fraunces italic "You're offline." + brief explanation of what's still accessible (Playbooks, past sessions) vs what isn't (Coach, Situation Room, Simulator) + a refresh CTA.
>
> **Legal pages** (all under `app/(marketing)/`):
> - `/privacy` — Privacy Policy (already stubbed from 1.6; flesh out per ICO guidance and the memory model from PRD §9.6)
> - `/terms` — Terms of Service
> - `/dpia` — DPIA Summary (already stubbed)
> - `/cookies` — Cookies policy (minimal — we use only PostHog and Supabase session cookies)
> - `/refund-policy` — Refund policy: 7-day trial means most users won't need refunds; outside trial, no refunds but cancel any time
>
> Tokunbo will provide the actual policy text via a solicitor pre-launch; use placeholder content with sections in place for now.
>
> **Offline state in the app:**
> - When `navigator.onLine` is false, render an offline banner at the top of the app: "You're offline. Some features are unavailable until you reconnect." Mute background, low height, dismissable.
> - Each AI surface (Coach, Situation Room, Simulator) shows a special offline state: editorial empty state with the line "This needs an internet connection."

**Verification:**
- 404 page renders at /xyz
- 500 page renders when an error is intentionally thrown
- Offline state visible when network is disabled in dev tools
- Legal pages all routable
- Offline banner appears in app when network disabled

**Commit:** `feat(polish): error pages, legal pages, offline state`

---

## Prompt 5.9 — Health checks + pre-launch QA pass

**Purpose:** Final readiness checks before going live.

**Reference:** MVP Spec §10 (Definition of Done)

**The prompt:**

> Build health checks and run the pre-launch QA pass.
>
> **Health check endpoint** `app/api/health/route.ts`:
> - Returns 200 if: Supabase reachable, Anthropic API key valid (test call), Stripe API valid, Resend valid
> - Returns 503 with details if any check fails
> - Used by Vercel monitoring + external uptime monitoring
>
> **Manual QA pass — go through Definition of Done from MVP Spec §10:**
>
> For each criterion, manually verify or write an automated test. Use a checklist in `docs/launch-qa.md`:
>
> **Functional:**
> - [ ] Onboarding completes for a new user
> - [ ] All 6 features work end-to-end (BA role)
> - [ ] Probation flow works simulated
> - [ ] Stripe Checkout + Portal both work
> - [ ] PWA installs on iOS Safari (real device)
> - [ ] PWA installs on Chrome Android (real device)
> - [ ] All AI surfaces stream responsively (P50 first-token < 2.5s — measure)
>
> **Quality (per Design Brief §12):**
> - [ ] Walk through every page and check premium checklist passes
> - [ ] All 5 signature design moments hand-reviewed (Memory screen, Situation Room intake, Simulator brief, Survival Report stubbed, Day 1 empty)
> - [ ] No exclamation marks or emojis in product UI
>
> **Safety:**
> - [ ] Crisis flag triggers correctly with test phrases (don't trigger this in production environment)
> - [ ] Crisis referral component renders
> - [ ] No real names captured anywhere (audit DB content tables)
> - [ ] Privacy Policy and Terms published
>
> **Operations:**
> - [ ] Cost-per-user dashboard live in PostHog
> - [ ] All alerts configured
> - [ ] Health check returns 200
> - [ ] Error pages render correctly
>
> **Commercial:**
> - [ ] Free tier limits enforced (test all three limits)
> - [ ] Pro signup conversion path tested end-to-end
> - [ ] Refund policy published
>
> Run a smoke test: a brand new user signs up, completes onboarding, runs through one of each surface, hits a free-tier limit, upgrades to Pro, generates a Probation Brief (with mock probation date), and cancels. The full happy path should complete in under 30 minutes of clicking.

**Verification:**
- Every Definition of Done item ticks
- Smoke test passes
- Health check returns 200
- No failed checks on Lighthouse for any key surface

**Commit:** `chore: pre-launch QA pass complete`

---

## Prompt 5.10 — Soft launch to cousin's institute pilot users + production readiness

**Purpose:** Go live.

**Reference:** MVP Spec §9 Phase 5.9-5.10

**The prompt:**

> Final launch readiness.
>
> 1. **Production environment:**
> - Vercel production deployment pointing to firstninety.com (+ firstninety.ai for AI Engineer landing)
> - Production Supabase project (separate from staging)
> - Production Stripe (not test mode)
> - Production Resend domain verified
> - DNS configured (A/CNAME records)
> - SSL certificates auto-managed by Vercel
> - Production env vars all set
>
> 2. **Soft launch invitations:**
> - Coordinate with Tokunbo's cousin's institute for 10-20 pilot users
> - Generate a unique signup link with `?source=cousin_institute_pilot` so we can track them
> - Pre-load these users into the system with `signup_source` set
> - Send a personalised welcome email (Tokunbo or institute lead, not from FirstNinety system)
>
> 3. **Monitoring:**
> - Confirm all PostHog dashboards refresh in real-time with production data
> - Confirm alerts work (trigger a test alert)
> - Set up a daily 09:00 standup check: review cost-per-user, error rates, signup count
>
> 4. **Documentation:**
> - Write `docs/operations.md` covering: how to deploy, how to roll back, how to handle a Stripe webhook failure, how to handle an Anthropic API outage, how to handle a Supabase incident
> - Write `docs/runbooks/cost-runaway.md`, `docs/runbooks/ai-outage.md`, `docs/runbooks/payment-failure.md`
> - Document the on-call escalation (Tokunbo)
>
> 5. **Launch announcement:**
> - LinkedIn post drafted (not posted until after the soft launch period)
> - Email to AkomzyAi network announcing FirstNinety
> - Twitter/X announcement
> - All editorial tone, no marketing-speak
>
> 6. **Sign-off:**
> - Tokunbo manually approves production launch after the soft launch period (typically 7-14 days)
> - All open spec questions from MVP Spec §11 either resolved or explicitly carried forward as Phase 2A tickets

**Verification:**
- Production environment fully functional
- 10-20 pilot users from cousin's institute have signed up
- Real activity in PostHog dashboards
- No alerts firing
- Tokunbo personally signs off on production launch

**Commit:** `chore: production launch readiness complete`

---

## Phase 5 Exit Gate — LAUNCH

This is the launch gate. Every item from MVP Spec §10 Definition of Done must be green. Plus:

- [ ] All 6 roles seeded at full content depth
- [ ] All emails templates working
- [ ] PostHog dashboards live with production data
- [ ] Health check returns 200
- [ ] Real pilot users from cousin's institute are actively using the product
- [ ] No firing alerts
- [ ] Tokunbo's manual sign-off

If green: **launch.** Public LinkedIn / Twitter / network announcement.

If not green: hold launch, fix the items, re-check.

---

## Closing Notes

### How long will this take?

Per MVP Spec v1.3 §9.10: **33–41 days of focused engineering effort** for a single engineer (Tokunbo). With content production running in parallel during Phases 1–3, and design review baked into Phase 5 QA, target ship: **7–9 weeks from build start to production launch**.

### What's NOT covered

- Phase 2A features (real-situation triage agent, voice simulator, behavioural inference, B2B2C dashboard, Probation Prep Pack expansion, Day-365 "Where you are" report, quarterly Simulator content additions) — separate build prompts when MVP launches successfully
- Phase 2B features (personalised mission track agent, survival report agent, 4 new roles, "Earn Your Promotion" track for Days 91+)
- Phase 2C (emerging markets, native mobile, manager companion)

These get their own Build Prompts v2.0 after MVP launches and produces real data.

### Iteration discipline

These prompts are sequenced for a reason. Run them in order. Don't skip ahead. When something fails verification, fix it before proceeding.

The temptation will be to jump ahead to AI surfaces (Phase 3) because they're the most exciting. Don't. The boring foundations (Phase 0-1) are what make the AI surfaces work reliably.

### When to ask for help vs power through

Ask Claude Code a sharp clarifying question when:
- A spec section genuinely contradicts another
- A library version is unspecified and the latest stable has breaking changes
- An open spec question from MVP Spec v1.3 §11 needs to be resolved to proceed
- A user scenario doesn't clearly fit State A, B, or C (per PRD v1.9 §7.1) — ask before assuming

Power through (and document the decision) when:
- A small UX detail is unspecified — apply the Design Brief §12 premium checklist as your judgement
- A piece of content needs minor adjustment — apply SKILL.md v1.3 §10 60-second quality test
- The user asks the Coach for technical execution help — apply the redirect pattern per SKILL.md v1.3 §8.4 (acknowledge lane, point to ChatGPT/Stack Overflow, offer in-scope alternative)
- A State B or State C edge case is unspecified — apply the principle from SKILL.md v1.3 §11.1: "write for the user in front of you, not the user the curriculum imagined"

---

*End of Build Prompts v1.3*
