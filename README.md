# FirstNinety

Premium AI-native workplace coaching SaaS for freshly trained tech professionals surviving their first 90 days in a new role. Six roles at MVP: Business Analyst, Project Manager, Scrum Master, Product Owner, Data Analyst, Junior/Associate AI Engineer.

## Stack

Next.js 16 (App Router) · TypeScript (strict) · TailwindCSS 4 · shadcn/ui · Supabase Postgres · Supabase Auth · Claude Opus 4.7 + Haiku 4.5 · Stripe · Resend · PostHog · Vercel.

Installable PWA — no native mobile at MVP.

## Run locally

Requires Node 20+ and pnpm.

```bash
pnpm install
cp .env.example .env.local   # then fill in real credentials
pnpm dev
```

Open http://localhost:3000.

## Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Tests (added in later phases) |
| `pnpm seed` | Content seeding (added in Prompt 2.1) |

## Foundation documents

All design and engineering specs live in [`docs/`](./docs):

- [PRD v1.8](./docs/FirstNinety_PRD_v1.8.md) — product requirements
- [MVP Spec v1.2](./docs/FirstNinety_MVP_Spec_v1.2.md) — engineering spec, schema, structure
- [CLAUDE.md v1.2](./docs/FirstNinety_CLAUDE_v1.2.md) — project context for Claude
- [SKILL.md v1.2](./docs/FirstNinety_SKILL_v1.2.md) — content authoring skill
- [Design Brief v1.0](./docs/FirstNinety_Design_Brief_v1.0.md) — tokens, type, components
- [Design Prompts v2.0](./docs/FirstNinety_Design_Prompts_v2.0.md) — surface-by-surface design references
- [Build Prompts v1.2](./docs/FirstNinety_Build_Prompts_v1.2.md) — sequenced build instructions
- [Competitive Analysis v1.1](./docs/FirstNinety_Competitive_Analysis_v1.1.md) — market context

Standalone HTML prototypes for every product surface live in [`docs/design-prototypes/`](./docs/design-prototypes).

## Repo layout

See MVP Spec §1.2 for the full structure. Group by user-facing surface (`app/(app)/situation-room/`), not by technical layer; domain logic in `lib/` by feature; content in `content/` as data files.
