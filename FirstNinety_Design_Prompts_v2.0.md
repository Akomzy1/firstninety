# FirstNinety — Design Prototype Prompts v2.0 (Consolidated)

**Version:** 2.0 (consolidates v1.0 + v1.1 addendum + v1.2 addendum into a single canonical file)
**Owner:** Tokunbo Akomolede (AkomzyAi Consulting Ltd)
**Companion documents:** PRD v1.8, MVP Spec v1.2, Competitive Analysis v1.1, Design Brief v1.0, CLAUDE.md, SKILL.md
**Last updated:** 23 May 2026
**Purpose:** A sequenced set of 21 prompts for generating the FirstNinety design prototype as HTML artifacts in Claude.ai.

**What's in this consolidated document:**
- All original v1.0 prompts (A1–A3, B1–B3, C1–C8) — 14 prompts covering design system, marketing, core product surfaces
- All v1.1 addendum prompts (C9–C14) — 6 prompts covering Probation Mode surfaces, Memory Settings, Day 90 Survival Report
- v1.2 addendum prompt (C16) — Daily Home Post-Day-90 State
- C15 was never authored; the gap is intentional and harmless

**All five signature design moments from Design Brief §10 are covered:**
1. Memory introduction → C1 step 4
2. Empty Mission Track Day 1 → C2
3. Situation Room intake → C4
4. Scenario Simulator brief → C5
5. Day 90 Survival Report → C14

Plus a sixth that earned signature status of its own: the Probation Brief → C11.

---

## How to Use This Document

### Setup (once, before running any prompt)

1. In Claude.ai, create a new project: **"FirstNinety Design Prototype"**
2. Add these files to the project's knowledge base:
   - `FirstNinety_Design_Brief_v1.0.md`
   - `FirstNinety_CLAUDE.md`
   - `FirstNinety_SKILL.md`
3. Optional but recommended: also add the PRD v1.8 and MVP Spec v1.2 for full feature and architecture context.
4. Use **Claude Sonnet 4.6 or Claude Opus 4.7** for these prompts. The artifacts need front-end design judgement, not raw speed — pick the strongest model available.

### Per-prompt workflow

1. Open a new conversation inside the project (so the knowledge files are loaded).
2. Paste one prompt from this document. Run it. Wait for the artifact to render.
3. **Check the artifact against the "verify" checklist below the prompt.** If three or more items fail, re-prompt with a sharp correction.
4. Save the artifact. Move to the next prompt.

Each prompt produces a **single, standalone HTML artifact** that opens in a browser. No external dependencies beyond Google Fonts and Tailwind CDN. No build step required.

### Order of execution

Prompts are numbered A1 → A3 → B1 → B3 → C1 → C14 → C16 (no C15 — gap is intentional). **Run in order** because later prompts assume the design system has been validated in A1. If something feels off in C-series prompts, the fix is usually upstream in the A-series.

### Section navigation

- **Group A — Design System Foundations** (A1–A3): the visual vocabulary. Run first; validate before proceeding.
- **Group B — Marketing Surfaces** (B1–B3): landing pages and pricing. Editorial, not template-driven.
- **Group C — Product Surfaces** (C1–C14, C16): the screens a paying user sees daily.
- **Group D — Probation Mode & Final Signature Moments** (C9–C14, see below): Probation activation, brief, outcome capture; plus the previously deferred Memory Settings and Day 90 Survival Report signature moments.
- **C16** — Daily Home Post-Day-90 State (covers the third state of the Daily Home; completes the lifecycle).

### About re-prompting

These prompts are tight but not infallible. If an artifact comes back wrong, the cleanest correction pattern is:

> "Re-read the Design Brief §[N] and the SKILL.md §[N]. The current artifact fails on [specific items]. Regenerate with [specific correction]."

Don't engage in long back-and-forth refinements — start fresh with a sharpened prompt instead.

---

## Group A — Design System Foundations (3 prompts)

These three prompts establish the visual vocabulary. **Validate the design system in A1 before proceeding** — every later artifact depends on it.

---

### Prompt A1 — Design System Reference Sheet

**Purpose:** A single-page reference showing every token, every base component, every typographic style. This becomes the master reference for all subsequent artifacts.

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety Design System Reference v1.0." Use the FirstNinety Design Brief v1.0 in project knowledge as the canonical specification.
>
> The artifact is a vertically-scrolling reference page on a `#FAF7F2` warm-bone background. It must include the following sections, in this order, each separated by `--space-6` (64px) of vertical space:
>
> 1. **Wordmark** — "FirstNinety" set in Fraunces 600 at 64px on the left, with the small editorial note that the "N" of "Ninety" is elevated by 2px. Show both light-mode and dark-mode versions side by side.
>
> 2. **Type scale** — display, H1, H2, H3, H4, Body L, Body, Body S, Caption, Eyebrow. Show each at its desktop size with a label noting font (Fraunces or Inter), weight, size, line-height, and letter-spacing. Use realistic content as the sample text — e.g. H1 shows "The 90 days nobody trained you for." not "Heading 1".
>
> 3. **Colour palette** — eleven swatches as labeled cards (ink, paper, paper-2, paper-3, mute, mute-2, accent, accent-soft, success, warn, danger). Each swatch is a 120px × 120px square with the token name above and the hex below. Group them: paper family / ink + mute family / accent / status.
>
> 4. **Spacing scale** — eight visual blocks showing each spacing token (`--space-1` through `--space-8`), each as a horizontal bar with the rem and px values labeled.
>
> 5. **Buttons** — three variants (Primary, Secondary, Ghost) shown at default, hover, focused, and disabled states. Use realistic labels: "Begin" / "Read more" / "Skip for now." Buttons have 0–4px corner radius, never pill-shaped.
>
> 6. **Inputs** — a default input field, a textarea, a select, and the Situation Room style single-large-input. Show empty state, filled state, focused state, error state. `--paper-2` fill, 1px `--paper-3` border, 8px radius, 48px min height, 2px ink focus ring at 2px offset.
>
> 7. **Cards** — default card and elevated card variant. Both with 32px internal padding, 8px corner radius. Elevated card uses `0 1px 2px rgba(14,17,22,0.04)` shadow.
>
> 8. **Badges & Eyebrow text** — eyebrow style (Inter 600, 12px, 0.08em letter-spacing, uppercase), role badges (BA, PM, SM, PO, DA, AIE — one for each role with subtle differentiation), and three flag badges (green-flag, yellow-flag, red-flag) with icon backup not colour alone.
>
> 9. **Persona Monograms** — six 64×64px circular monograms, each with a two-letter Fraunces 400 lettermark. Use the six-colour persona palette: a soft slate, a muted moss, a warm ochre, a dusty rose, a deep teal, a soft plum. These are *muted, editorial* tones — not bright cartoon colours.
>
> 10. **Iconography sample** — six Lucide icons at 20px, 1.5px stroke (e.g. arrow-right, check, alert-triangle, message-circle, book-open, user). Loaded via Lucide CDN.
>
> 11. **Focus & accessibility** — a small section showing focus ring style, keyboard navigation indicator, and reduced-motion sample text.
>
> Technical requirements:
> - Single self-contained HTML file
> - Google Fonts: Fraunces (with optical sizing axis), Inter (variable), Geist Mono — loaded via `<link>` in `<head>`
> - Tailwind CSS via CDN script tag
> - Lucide icons via CDN script tag
> - Define design tokens as CSS variables in `:root`, so they're inspectable in DevTools
> - Page width capped at 1280px, centered, with 64px page padding
> - No emojis anywhere
> - No exclamation marks anywhere except inside one cited marketing headline sample
>
> Voice cue: this is a reference document for designers and engineers. Section labels use the Eyebrow style ("TYPE SCALE", "COLOUR PALETTE"). The page reads as a thoughtful, edited piece of work — not a checklist.

**Verify after generation:**
- [ ] Background is `#FAF7F2` warm bone, not white
- [ ] Fraunces loads correctly (display headings have serif character)
- [ ] No emojis or exclamation marks except where explicitly allowed
- [ ] At most one coral accent instance per viewport scroll
- [ ] All eleven colour swatches present with correct hex values
- [ ] Persona monograms are muted editorial tones, not bright/cartoon
- [ ] Buttons have low radius (0–4px), not pill-shaped
- [ ] Page reads as edited reference, not as a CSS dump

---

### Prompt A2 — App Navigation Chrome

**Purpose:** The persistent navigation shell that sits around every product surface. Desktop sidebar, mobile bottom-nav, and the user menu.

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety Navigation Chrome." Reference Design Brief v1.0 §6 (component vocabulary) and §13 (reference set — Linear, Stripe, Arc are the closest analogues for navigation).
>
> The artifact shows the FirstNinety app shell in three viewport states, stacked vertically with labels:
>
> 1. **Desktop (1280px viewport)** — left sidebar 240px wide, main content area to the right. Sidebar contains: wordmark at top, primary nav (Home, Mission Track, Situation Room, Simulator, Coach, Playbook), divider, "What I know about you" link with a small editorial italic label, user menu at bottom with monogram avatar and role indicator.
>
> 2. **Tablet (768px viewport)** — sidebar collapses to icon-only rail (64px wide) with text on hover. Main content area expands.
>
> 3. **Mobile (375px viewport)** — sidebar replaced with bottom navigation showing five icons (Home / Track / Situation / Simulator / More). Header at top shows wordmark left, user monogram right. No hamburger menu — bottom nav is the navigation. Open "More" drawer panel as a 4th state on the right.
>
> Specific design rules:
> - Active state in nav is `--ink` text with a subtle `--paper-3` background fill, NOT a coral accent
> - Inactive state is `--mute` text
> - Navigation typography is Inter 500, 14px, sentence-case
> - The "Situation Room" entry has a small dot indicator — `--accent` coral — when there's an unread session result. This is the only place the accent appears in nav chrome.
> - Mobile bottom nav is 64px tall, `--paper` background, 1px top border in `--paper-3`. Active item shows ink text + small indicator dot above it; inactive items are mute icon-only.
> - User menu dropdown (desktop) opens upward; shows: account, billing, memory & privacy, sign out. Edges 8px radius, ink-on-paper, no gradient.
>
> Fill the main content area in each viewport with a faint placeholder showing where content goes — *not* a generic "Lorem ipsum" — instead use the line "Today's mission is loaded here." in `--mute` italic Fraunces, centered. This communicates the chrome's purpose without being distracting.
>
> Technical requirements: same as A1 (Google Fonts, Tailwind CDN, Lucide icons, single self-contained HTML). Show all three viewport states scrollable in one artifact. Each state labeled with an Eyebrow above ("DESKTOP", "TABLET", "MOBILE").

**Verify after generation:**
- [ ] Sidebar uses `--paper-2` not `--paper-3` for active state (subtle, not loud)
- [ ] No coral accent in navigation chrome except the single unread-dot indicator
- [ ] Mobile bottom nav doesn't have labels under every icon (visual clutter) — only active item has subtle indicator
- [ ] User menu dropdown uses 8px radius, no shadow on light surfaces
- [ ] "What I know about you" link in Fraunces italic — small editorial signature
- [ ] No hamburger menu icon on mobile — bottom nav is the navigation

---

### Prompt A3 — Shared Product Components

**Purpose:** The recurring product cards and patterns used across many surfaces. Build once, reference everywhere.

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety Component Library — Product Surfaces." Reference Design Brief v1.0 and SKILL.md.
>
> The artifact is a scrolling component reference showing these recurring components in realistic examples, grouped by Eyebrow-labelled sections:
>
> **Section 1 — Mission Cards** (three variants on one row, desktop; stacked on mobile)
> - **Active mission card:** Eyebrow "TODAY — DAY 6", Fraunces H3 title "Map your stakeholders," 1-line description in body S mute, time estimate "15 min" with small clock icon, "Begin" button bottom-right. 1px paper-3 border, 32px padding.
> - **Completed mission card:** same structure but with a single subtle ✓ in the top-right corner, title in mute, no button — instead "Completed 2 days ago" in caption mute.
> - **Locked future mission card:** mute throughout, title shown but no description, small lock icon, no button, hover reveals "Available Day 12."
>
> **Section 2 — Scenario Cards** (two variants on one row)
> - **Available scenario card:** Eyebrow "BA — STAKEHOLDER PUSHBACK," Fraunces H3 "The Hostile Lead Dev," 2-line description, three persona monograms in a small overlapping row at bottom, duration "10–15 min."
> - **Played scenario card:** same with a green-flag/yellow-flag/red-flag badge showing the user's last debrief outcome.
>
> **Section 3 — Playbook Cards** (one card)
> - Eyebrow "BA — REGULATORY VARIANT," Fraunces H3 "Business Requirements Document," 2-line description, "Read with worked example →" link, small icon hinting at margin annotations.
>
> **Section 4 — Situation Session History Cards** (one card)
> - Eyebrow "WEDNESDAY 2:14 PM," small label noting entry type ("Is this normal?"), short summary of the situation in Fraunces italic ("Your manager asked you to redo a piece of work without explanation."), "Reopen this session" link.
>
> **Section 5 — Persona Avatar Stack** (one row)
> - Three monogram avatars (e.g. "SP" — Sam Palmer, "PR" — Priya Rao, "MK" — Marcus Klein) shown overlapping with names and roles below. Used in Simulator scenario cards.
>
> **Section 6 — Status Badges** (one row of six)
> - Green flag, Yellow flag, Red flag, "In progress," "Completed," "Locked." Each uses icon + text, never colour alone.
>
> **Section 7 — Empty State Pattern** (one example, full-width)
> - The signature empty state. Generous whitespace (centered vertically and horizontally inside a tall card). Fraunces italic single line: "Nothing here yet. That's fine." Below in mute body S: 1-line context-appropriate next-step suggestion. No illustration, no emoji.
>
> **Section 8 — Loading / Streaming Pattern** (one example)
> - Three-dot animation in mute, accompanying mute label "FirstNinety is thinking…" or similar dry phrasing. No spinner.
>
> Layout: each component shown at realistic size on `--paper`, with a small Eyebrow label above and a 1-line annotation below noting where it's used in the app.
>
> Technical requirements: same as A1.

**Verify after generation:**
- [ ] Mission cards use Fraunces H3 for titles, not Inter
- [ ] Persona monograms use the muted six-colour palette, not bright/cartoon
- [ ] Status badges have icon + text, never colour alone
- [ ] Empty state is genuinely *empty-feeling* (not a "empty state hero illustration")
- [ ] Loading state copy is dry, not "Generating magic ✨"
- [ ] No card has more than one small ✓ or icon flourish — restraint is the brand

---

## Group B — Marketing Surfaces (3 prompts)

These are the surfaces a prospective buyer sees before they pay. They must feel editorial, premium, and confidently distinct from generic-SaaS landing pages.

---

### Prompt B1 — Main Marketing Landing Page

**Purpose:** The primary landing page at firstninety.com. Must feel like a magazine article that happens to also sell a product. **This is the page that justifies the $39.99 price point in the visitor's mind within 8 seconds.**

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety Marketing Landing Page v1.0." Reference Design Brief v1.0 §13 (visual mood — Stripe, Linear, Lenny's, Reforge, Arc) and §10 (this page is part of the signature design moments).
>
> Important framing: **this is not a SaaS landing page following the standard template** (hero / features-grid / testimonial-strip / pricing-cards / footer). This is an **editorial landing page** that reads as a confident magazine piece. The features-grid pattern is explicitly banned.
>
> Page structure (single column, max-width varies by section):
>
> **1. Header chrome** — slim top bar, max-width 1280px. Wordmark left, simple text navigation right ("How it works · For AI Engineers · Pricing · Sign in"), one "Begin" CTA in primary button style on the far right. No "trusted by" logos in the chrome.
>
> **2. Hero section (max-width 960px, centered, generous vertical padding `--space-8`)**
> - Above the headline, a single Eyebrow line: "FOR YOUR FIRST 90 DAYS IN A NEW TECH ROLE"
> - Headline in Fraunces 400 at display size: *"The 90 days nobody trained you for."* — three lines, `text-wrap: balance`, no orphan word
> - Subhead in Inter 400, body L, mute: *"FirstNinety is a private workplace coach for newly trained Business Analysts, Project Managers, Scrum Masters, Product Owners, Data Analysts, and AI Engineers. Available the moment you need it. Calibrated to your role and your week."*
> - Two CTAs side by side: primary "Begin (free)" and ghost "How it works"
> - **No hero image, no illustration, no abstract gradient.** The hero is pure typography.
>
> **3. Problem section (max-width 720px, left-aligned)**
> - Eyebrow "WHY THIS EXISTS"
> - H2 in Fraunces: *"Training ends. The job doesn't."*
> - Three editorial paragraphs in Body L. Each paragraph corresponds to one of the three failure modes from SKILL.md §2 (Blank Page / Live Fire / Is This Normal). Do *not* render them as bullets or feature cards. Write them as three short flowing paragraphs.
> - At the end of this section, a single thin horizontal rule (`--paper-3`) then a small italicised line in Fraunces: *"FirstNinety is built for this gap."*
>
> **4. How it works section (max-width 1080px)**
> - Eyebrow "HOW IT WORKS"
> - H2 in Fraunces: *"Five tools. One purpose."*
> - Below: five rows, each row representing one of the five features (Situation Room, Scenario Simulator, AI Coach, Playbook Library, 90-Day Mission Track), in **this order** — leading with Situation Room because it's the most differentiated.
> - Each row: left column shows the feature name in Fraunces H3 + 1-line eyebrow ("ON-DEMAND") + 2-paragraph editorial description in Body. Right column shows a *minimal* visual representation — for Situation Room, a stylised single-input field with the three soft labels above it. For Scenario Simulator, three persona monograms with a single "Begin" button. For AI Coach, a stylised chat bubble in Fraunces italic showing one line. For Playbook, a stylised page with margin annotations. For Mission Track, a row of mission cards. **These are illustrative wireframes — not screenshots, not animated.**
> - Each row is `--space-6` from the next. Right column flips left-right alternately on odd rows for editorial rhythm.
>
> **5. The price section (max-width 720px, centered, `--paper-2` background)**
> - Eyebrow "PRICING"
> - H2 in Fraunces: *"$39.99 per month."*
> - One short paragraph in Body L: *"That's less than 20% of one human coaching session. For unlimited AI coaching, simulation, and a structured 90-day programme."*
> - Below: small comparison table with three rows — "Human career coach (1 session): ~$200" / "BetterUp Plus: $149/mo" / "FirstNinety Pro: $39.99/mo." No big "compare plans" card grid.
> - A "Begin (free)" button and a small "See full pricing →" link.
>
> **6. Footer (max-width 1280px)**
> - Four columns on desktop: Product (links), Roles (six role links — last one "AI Engineer →" links to the dedicated AI Engineer landing in B2), Company, Legal.
> - Below columns, full-width divider, then wordmark left, small copyright right, and a single sentence on the far right in Fraunces italic Body S: *"Built for the moment training ends."*
> - No social icons cluttering the footer. Optional: one small line linking to a single Twitter/LinkedIn for the founder if present. Otherwise none.
>
> Typography rules: every H2 uses Fraunces, balanced. No headlines use emoji or exclamation marks. The single tagline ("The 90 days nobody trained you for.") is the only place where a period at the end of a headline is *required* for the editorial effect.
>
> Reference set in detail: imagine this page sitting between a Lenny's Newsletter article and a Stripe announcement. That's the tone.
>
> Technical requirements: same as A1. Add subtle scroll-driven animations only if they can be implemented in pure CSS — no JS animation libraries. Animations honour `prefers-reduced-motion`.

**Verify after generation:**
- [ ] Hero is pure typography — no image, no gradient, no illustration
- [ ] No three-column "feature grid" anywhere on the page
- [ ] Problem section is flowing prose, not three feature cards
- [ ] "How it works" section alternates left/right for editorial rhythm
- [ ] Pricing section names ChatGPT or human coaches as anchor — premium positioning is explicit
- [ ] At most one coral accent on any viewport scroll
- [ ] Footer has no "join our newsletter" inline form (cliché) — single tagline instead
- [ ] No "trusted by" logo strip
- [ ] Headlines use Fraunces, body uses Inter, no font swaps

---

### Prompt B2 — AI Engineer Track Landing Page

**Purpose:** Dedicated landing page at `firstninety.ai/ai-engineer` for the AI Engineer wedge. Per Competitive Analysis v1.1 §12.4, this is the highest-LTV cohort and the most defensible wedge. Page must feel current, technical, calm.

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety for AI Engineers — Landing Page." Reference Design Brief v1.0 — and note that this page uses **dark mode as the default** (`--ink` background, `--paper` text), reflecting the AI Engineer signalling convention from Design Brief §4.2.
>
> This page targets a specific persona: a newly hired Junior or Associate AI Engineer in their first 90 days. They likely earn $80k–$130k from year one. They have technical anxiety (hallucinations, evals, cost economics) and stakeholder anxiety (explaining LLM behaviour to non-technical PMs). They have **no current product to turn to** — verified by Competitive Analysis.
>
> Page structure:
>
> **1. Header** — same chrome as B1 but in dark mode. The wordmark uses the reserved variant: `FirstNinety_ai` with `_ai` set in Inter 600 as a small subscript adjacent to the Fraunces wordmark.
>
> **2. Hero (max-width 960px, centered, generous vertical padding)**
> - Eyebrow "FOR YOUR FIRST 90 DAYS AS A JUNIOR / ASSOCIATE AI ENGINEER"
> - Headline in Fraunces 400 at display size, on dark: *"The tradecraft no one is documenting yet."*
> - Subhead in mute paper: *"Evals you can defend. Hallucinations you can explain. Costs you can justify. FirstNinety is the workplace coach for new AI engineers, built by people doing this work in production."*
> - Two CTAs: "Begin (free)" primary, "How this is different" ghost.
> - **No code snippet in the hero.** No syntax-highlighted "look we know AI" demo. Just typography.
>
> **3. The six conversations section (max-width 720px)**
> - Eyebrow "SIX CONVERSATIONS YOU'LL HAVE THIS QUARTER"
> - H2 in Fraunces: *"And nobody is teaching you how to have them."*
> - Six conversation prompts as a numbered list — each is 1-2 lines, written from the AI engineer's perspective. Use these exact prompts:
>   1. *"Why isn't it 100% accurate?" — from your PM, about the chatbot that just shipped.*
>   2. *"How much will this cost us per user per month?" — from your CFO, with a deadline.*
>   3. *"Why don't we just use ChatGPT for this?" — from your director, who thinks ChatGPT and GPT-4 are the same thing.*
>   4. *"Can you run an eval?" — from your tech lead, with no shared definition of what that means.*
>   5. *"It hallucinated to a customer." — from your support team, on a Friday afternoon.*
>   6. *"RAG or fine-tune?" — from your architect, who already has an opinion.*
> - Numbers are large Fraunces 500 with the conversation in editorial italic body L. Each takes a full vertical row, separated by `--space-5`.
>
> **4. What's in it for you (max-width 1080px)**
> - Eyebrow "WHAT'S DIFFERENT HERE"
> - H2 in Fraunces: *"This wasn't written by a content team."*
> - Three editorial paragraphs (left column 60%, right column 40% on desktop showing a small editorial mark/quote pull). Content covers:
>   1. Authored by AI engineers who ship to production at AkomzyAi Consulting and partner clients. References include MCP, LangGraph, eval-driven dev. Not generic prompt-engineering tips.
>   2. Playbooks that are actually useful — eval rubrics, prompt versioning docs, RAG architecture decision records, hallucination test plans, cost analysis templates. Not "tips for working with AI."
>   3. Updated continuously because the field moves weekly. A static course is dead the day it's published. FirstNinety is a living surface.
>
> **5. Specifically NOT bootcamp (max-width 720px, `--paper` paragraph on dark)**
> - Eyebrow "ONE CLARIFICATION"
> - H3 in Fraunces: *"This is not a course."*
> - Single paragraph in Body L mute paper: *"You've finished a course. You've shipped a side project. You've signed an offer. This is what comes next — the 90 days where you learn to work as an AI engineer inside a real organisation, with real stakeholders, real budgets, and real consequences. Bootcamp teaches you what AI can do. FirstNinety teaches you how to be the person responsible for it in the room."*
>
> **6. Pricing snippet (same shell as B1, dark mode)**
>
> **7. Footer (same as B1, dark mode)**
>
> Dark mode specifics:
> - Background: `--ink` (`#0E1116`)
> - Primary text: `--paper` (`#F2EDE4` in dark mode)
> - Mute text: `#A29D90`
> - Accent: `--accent` (`#E97552` in dark mode — slightly brighter)
> - Single accent appearance per scroll viewport (probably on the lone coral underline beneath the H2 in section 3, or as the primary button)
>
> Technical requirements: same as A1, but with dark mode as the default. Honour `prefers-color-scheme: light` with a light mode override only via explicit user toggle — page is dark by default regardless of system preference.

**Verify after generation:**
- [ ] Dark mode is the default, not optional
- [ ] Wordmark uses the `FirstNinety_ai` subscript variant
- [ ] No code snippets, no syntax-highlighted demos, no "look we know AI" peacocking
- [ ] The six conversations are quoted in editorial italic — not as feature cards
- [ ] "This is not a course" section reads as genuine clarification, not as marketing
- [ ] No mention of "Empower your AI journey" or similar AI-buzz phrases
- [ ] At most one coral accent per viewport

---

### Prompt B3 — Pricing Page

**Purpose:** Standalone pricing page at firstninety.com/pricing. Confidently presents Free and Pro side by side. Anchors against ChatGPT and human coaching. No tier ladder, no upsell pressure.

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety Pricing Page." Reference Design Brief v1.0 and PRD v1.6 §8 for the pricing specification.
>
> Page structure (single column, max-width 1080px, generous vertical spacing):
>
> **1. Header chrome** — same as B1.
>
> **2. Pricing hero (max-width 720px, centered)**
> - Eyebrow "PRICING"
> - H1 in Fraunces: *"One product. One price. No tiers."*
> - Subhead in mute Body L: *"FirstNinety is built for the first 90 days in your new role. We're not selling you a ladder of features."*
>
> **3. The two cards (max-width 960px, two-column on desktop, stacked on mobile)**
> - **Free card** (`--paper` background, 1px `--paper-3` border, 8px radius, 48px padding):
>   - Eyebrow "FREE"
>   - Fraunces H2 "$0" with caption "/forever" mute below
>   - One short editorial line: *"For seeing what FirstNinety is. Not for sustained daily use."*
>   - List of inclusions (Inter Body, no checkbox icons — just clean line breaks):
>     - 4 Simulator scenarios (lifetime)
>     - Weeks 1–2 of Mission Track
>     - Basic Playbook access
>     - 2 Situation Room sessions per week
>     - 5 ad-hoc Coach messages per week
>   - "Begin (free)" ghost button at bottom
> - **Pro card** (`--ink` background, `--paper` text — *the visual signal of premium*):
>   - Eyebrow "PRO"
>   - Fraunces H2 "$39.99" with caption "/month — or $399/year" in mute paper below
>   - One short editorial line: *"For your full 90 days, and the rehearsal it takes."*
>   - List of inclusions:
>     - Unlimited Situation Room
>     - Unlimited Scenario Simulator
>     - Full Playbook library
>     - Full 90-day Mission Track
>     - Unlimited Coach
>     - Multi-role support
>     - Survival Report export at Day 90
>   - Primary button: "Start a free trial" — light-on-dark variant
>   - Below button in caption mute: "7-day free trial. Cancel anytime."
>
> **4. The anchor section (max-width 720px, centered, `--paper-2` background)**
> - Eyebrow "FOR CONTEXT"
> - H2 in Fraunces: *"What $39.99 a month actually compares to."*
> - A simple comparison list (no boxes, no cards — just text rows separated by hair-thin dividers in `--paper-3`):
>   - Row 1: *"One session with a human career coach"* on the left, *"$150–$300"* on the right
>   - Row 2: *"BetterUp Plus (monthly)"* on the left, *"$149"* on the right
>   - Row 3: *"LinkedIn Premium Career (monthly)"* on the left, *"~$30"* on the right
>   - Row 4: *"ChatGPT Plus (monthly)"* on the left, *"$20"* on the right
>   - Row 5 (bold, slightly larger): *"FirstNinety Pro (monthly)"* on the left, *"$39.99"* on the right
> - Below the table, one short editorial line: *"$39.99 buys you a structured 90-day programme, role-specific simulation, and on-demand workplace help — not a chatbot, not a course, not a calendar invite."*
>
> **5. FAQ section (max-width 720px)**
> - Eyebrow "QUESTIONS"
> - H2 in Fraunces: *"What people ask before paying."*
> - 6–8 questions in an accordion pattern. Each closed by default, opens on click. Questions:
>   - *"Why isn't there a cheaper tier?"*
>   - *"Can I cancel anytime?"*
>   - *"What if my employer wants to pay?"*
>   - *"Will you read my work emails or Slack?"* (Answer firmly: *No. Never. See §9.6 of our memory model.*)
>   - *"What happens after Day 90?"*
>   - *"Do you have a refund policy?"*
>   - *"Is this only for new graduates?"*
>   - *"Is there a student discount?"*
> - Each answer is 1–2 short paragraphs, Body, mute. Voice: direct, no marketing.
>
> **6. Footer** — same as B1.
>
> Important: the Pro card is `--ink` background — this is the premium visual signal. The Free card stays on `--paper`. The contrast between them communicates the tier difference visually before the user reads a single word.
>
> Technical requirements: same as A1. The FAQ accordion uses native `<details>` and `<summary>` elements styled with CSS — no JS dependency.

**Verify after generation:**
- [ ] Pro card has `--ink` background — the premium visual signal
- [ ] Comparison table is text rows with hair-thin dividers, not feature boxes
- [ ] No "Most Popular" badge, no "Save 20% with annual" upsell banner
- [ ] FAQ answers are direct, not marketing-flavored
- [ ] The "Will you read my work emails or Slack?" answer is a firm no
- [ ] Both pricing cards use Fraunces for the price number, not Inter

---

## Group C — Product Surfaces (8 prompts)

These are the screens a paying user sees daily. Two of these (C4, C5) are signature design moments per Design Brief §10 and have extra polish requirements.

---

### Prompt C1 — Onboarding & Memory Introduction

**Purpose:** The 4-step onboarding flow ending in the signature "What FirstNinety will remember about you" reveal. Sets the tone for the entire product relationship.

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety Onboarding Flow." Reference Design Brief v1.0 §10 (signature design moments — the memory surface is one of them).
>
> The artifact shows four onboarding steps stacked vertically, each labeled with a small Eyebrow "STEP 1 OF 4" etc. above. Each step looks like a real screen — max-width 640px, centered, generous vertical padding. Steps are separated by `--space-7` and a thin divider so it's clear they're distinct screens viewed in sequence (in production, only one shows at a time).
>
> **Step 1 — Welcome (centered, vertical)**
> - Eyebrow "WELCOME"
> - Fraunces display: *"Two minutes. Then you can begin."*
> - One paragraph in Body L mute: *"We need a few things to make this useful. Your role, where you're starting, and what's on your mind this week. Nothing more."*
> - Primary button: "Get started"
> - Below button in caption mute italic: *"We will never ask for your employer's name, your colleagues' real names, or access to your work systems. Ever."*
>
> **Step 2 — Role Selection (max-width 760px)**
> - Eyebrow "STEP 2 OF 4 — YOUR ROLE"
> - Fraunces H2: *"Which role are you stepping into?"*
> - Six selectable cards in a 3×2 grid (desktop) or 1-column stack (mobile). Each card shows:
>   - Eyebrow (e.g. "BA")
>   - Fraunces H3 (e.g. "Business Analyst")
>   - One-line description in mute Body S (e.g. "Requirements, stakeholders, BRDs, workshops.")
>   - On hover/selected state: ink background with paper text — the same premium signal as the pricing card
> - Below the grid: a small italic line: *"Multiple roles? You'll be able to add a secondary later."*
>
> **Step 3 — Where you're starting (max-width 640px)**
> - Eyebrow "STEP 3 OF 4 — YOUR SITUATION"
> - Fraunces H2: *"Tell us where you're starting."*
> - Three short inputs:
>   - "When did you start (or when do you start)?" — date input with quick presets (Today, This week, Next week, Custom)
>   - "What sector?" — optional dropdown with anonymising tags (Financial services / Healthcare / Government / Consulting / E-commerce / Other) — explicit caption: *"Optional. We don't ask for your employer."*
>   - "Work setup?" — three pill toggles (Remote / Hybrid / Office)
> - Primary button: "Continue"
>
> **Step 4 — Memory introduction (THE SIGNATURE MOMENT)** (max-width 720px)
> - Eyebrow "STEP 4 OF 4 — WHAT WE'LL REMEMBER"
> - Fraunces H1: *"Here's what FirstNinety knows about you so far."*
> - Below, a list of declared facts presented in Fraunces italic body L, each on its own line, each with a tiny "edit" pencil icon on the right hover. **Hand-edit-feel, not form-feel.** Example items (based on Step 2 and 3 inputs):
>   - *"You're starting as a Business Analyst."*
>   - *"You start on Monday."*
>   - *"You're working in financial services."*
>   - *"You're hybrid."*
> - Below the list, a paragraph in Body mute: *"You can edit any of this anytime in Settings → What FirstNinety knows. We'll add more as you tell us things — never by guessing, never by reading anything we shouldn't."*
> - A final paragraph emphasising the commitment:
>   - *"We will not store the names of your colleagues, your manager, your stakeholders, or your employer. When you paste anything from work into FirstNinety, we'll prompt you to anonymise first."*
> - Primary button: "Begin Day 1"
>
> Design specifics:
> - Step indicators at the top of each screen: small Eyebrow "STEP N OF 4" — not a progress bar with filled segments (too generic)
> - The role selection cards are wider than tall on desktop (4:3 ratio), with the eyebrow + title left-aligned and the description below
> - The memory introduction screen is the most editorial moment — feels like reading a quiet letter, not filling in a form
> - No emojis, no exclamation marks
>
> Technical requirements: same as A1.

**Verify after generation:**
- [ ] The memory introduction screen feels editorial, not form-like
- [ ] The Fraunces italic list of declared facts feels human, not robotic
- [ ] The commitment about not storing colleague names is prominent and clear
- [ ] Role selection uses the ink-on-paper hover state (matching the Pro pricing card visual)
- [ ] Step indicator is Eyebrow text, not a filled progress bar
- [ ] The optional sector field doesn't feel pushy

---

### Prompt C2 — Daily Home / Dashboard

**Purpose:** What the user sees after login each day. Per Design Brief §10, the "empty Mission Track on Day 1" is a signature moment — this screen captures both Day 1 and a populated Week 6 state.

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety Daily Home." Reference Design Brief v1.0 §10 (Day 1 empty state is signature) and SKILL.md §6 (Mission Track structure).
>
> The artifact shows two states of the daily home page, stacked vertically with labels:
>
> **State 1 — Day 1 (the signature "almost empty" moment)** (max-width 1080px with sidebar from A2 referenced)
> - Top of main column: a small editorial banner. Eyebrow "DAY 1 — MONDAY, 23 MAY." Fraunces italic H3: *"Today is about landing softly. Not about doing everything."*
> - Below banner, lots of whitespace (`--space-7`).
> - One single mission card (using Mission Card component from A3): "Map your stakeholders." 15 min. "Begin." It is the only mission visible on the page.
> - Below the single mission card, a thin divider, then a small mute caption: *"More missions unlock as you progress this week."*
> - On the right side of the main column (or below on mobile), a *small* Situation Room entry — not the full Situation Room interface — just a single line in Fraunces italic: *"Something happening you need help with? →"* linking through to the full Situation Room.
> - No "recent activity" card on Day 1 (there is none).
> - **The screen feels almost empty — and that is the point.** Generous whitespace below the single mission card. The brand stance is "we're not throwing 90 days at you. We're starting with today."
>
> **State 2 — Day 38 (populated mid-journey)** (same shell)
> - Banner: Eyebrow "DAY 38 — WEEK 6 — MONDAY, 30 JUNE." Fraunces italic H3: *"This week: lead from the front."*
> - Main column has two regions:
>   - **Today's missions** — two mission cards side by side (desktop) or stacked (mobile): "Facilitate a requirements workshop" (30 min, "Begin") and "Write your first BRD section for review" (45 min, "Begin"). Use Mission Card component.
>   - **Situation Room entry** — a more prominent surface. Large input field with three small switchable labels above it ("I need help with this" / "Is this normal?" / "I just did something"). One label is the active selection. The input has placeholder text in mute italic: *"Describe what's happening. Anonymise as you go."*
> - Sidebar on the right (desktop only) shows:
>   - **Week at a glance** — five mini mission rows (Mon-Fri), today's highlighted in `--paper-2`, completed ones with subtle ✓
>   - **What I know** — small editorial section showing 3 recent things FirstNinety remembers (Fraunces italic body S), with "see all →" link
>   - **Recent** — last simulator run, last situation session, last completed mission. Three small caption mute rows.
>
> Design specifics:
> - Day 1 state has *more whitespace below* than visually feels right. Lean into it — this is the brand.
> - The Situation Room entry on Day 38 is the largest interactive surface on the page — competing for attention with the mission cards because both are equally important.
> - The "Week at a glance" sidebar uses very subtle differentiation between days — not heavy.
> - No notification badges shouting "3 new things!"
> - No streak counter in the page chrome (gentle, not gamified)
>
> Technical requirements: same as A1.

**Verify after generation:**
- [ ] Day 1 state has dramatic whitespace below the single mission card
- [ ] Day 38 Situation Room input is large and prominent
- [ ] The three soft labels above Situation Room input — only one is "selected" — clean toggling
- [ ] "What I know" sidebar uses Fraunces italic — editorial signal
- [ ] No streak counter, no fireworks, no gamification artefacts
- [ ] Banner uses Fraunces italic, not bold

---

### Prompt C3 — Mission Track Week View + Mission Detail

**Purpose:** Two states — the curriculum overview, and the detail of one mission.

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety Mission Track." Reference SKILL.md §6 (Mission Track authoring guide).
>
> The artifact shows two states, stacked vertically:
>
> **State 1 — Week 6 Overview** (max-width 1080px)
> - Header strip: Eyebrow "MISSION TRACK — BUSINESS ANALYST," secondary line Fraunces H3 "Week 6 — Lead from the front." Below: a small navigator (← Week 5 / Week 6 active / Week 7 →).
> - Below header, four mission cards in a row (desktop) or stacked (mobile). Use Mission Card component from A3.
>   - **Mission 1 (Completed):** "Facilitate a requirements workshop." Marked complete. Caption "Completed Tuesday."
>   - **Mission 2 (Active, today):** "Negotiate a scope clarification." 25 min. "Begin." Eyebrow "TODAY."
>   - **Mission 3 (Available):** "Write your first BRD section for review." 45 min. "Begin."
>   - **Mission 4 (Locked):** "Survive your first scope-change conversation." Locked. Caption mute "Unlocks Day 41."
> - Below the mission cards, a small editorial reflection prompt: Eyebrow "REFLECTION." Fraunces italic: *"What was harder than you expected this week?"* with a "Open journal →" link.
> - Bottom navigation: small "View whole 90-day map →" link (which would take the user to a calendar-style overview, not built here).
>
> **State 2 — Mission Detail: "Negotiate a scope clarification"** (max-width 720px, reading-column width)
> - Eyebrow "DAY 38 — WEEK 6 — MISSION 2 OF 4"
> - Fraunces H1: *"Negotiate a scope clarification."*
> - Below H1, a small editorial line in body L mute: *"Estimated 25 minutes. Brief / Rehearsal / Reflection."*
> - **Why this matters** section: Eyebrow "WHY THIS MATTERS." Two short paragraphs in Body explaining the importance of clarifying scope early, written in the senior-colleague register.
> - **What you'll do** section: Eyebrow "WHAT YOU'LL DO." Three steps in plain prose, not as a bullet list. Example: *"First, read the playbook on scope conversations. Second, run the scenario simulator for 10 minutes. Third, draft your one-paragraph clarification email."*
> - **What to use** section: three linked cards (smaller — single line each) — links to "Playbook: Scope Clarification Email" / "Simulator: The Vague Stakeholder" / "Coach: Talk through your specific situation"
> - **What success looks like** section: Eyebrow "SUCCESS LOOKS LIKE." Single italic line in Fraunces: *"You've sent the clarification email and gotten a written response from your stakeholder confirming or refining scope."*
> - **Reflection prompt** at the bottom: Eyebrow "REFLECTION." Fraunces italic: *"What did the stakeholder say back? Was it what you expected?"* — with a text area below it for the user's response.
> - Bottom: "Mark complete" primary button + "Skip this mission" ghost button.
>
> Design specifics:
> - The mission detail page is editorial — narrow reading column, generous line-height, plenty of whitespace between sections
> - **Do not use bullet lists or numbered lists in the mission detail.** Each section is short prose. (Bullets read as task-checklist, not as coaching.)
> - The "What to use" linked cards are tight one-line cards, not full mission cards (different purpose, different visual weight)
> - Completed missions in the week view have a single subtle ✓ — never a green-fill celebration state
>
> Technical requirements: same as A1.

**Verify after generation:**
- [ ] Mission detail is reading-column width (720px max), not full width
- [ ] Mission detail sections use Eyebrow + prose, not bullet lists
- [ ] Completed mission has a single subtle ✓, not a green celebration
- [ ] Reflection prompts use Fraunces italic — editorial signal
- [ ] Week view navigator is text-based, not a horizontal progress bar
- [ ] "Mark complete" is primary; "Skip this mission" is ghost (correct hierarchy)

---

### Prompt C4 — Situation Room ★ SIGNATURE MOMENT

**Purpose:** The product's most-used surface. Per Design Brief §10, this is one of the five signature design moments. Must be photographable.

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety Situation Room — Signature Surface." Reference Design Brief v1.0 §10 (this is a signature design moment — make it exceptional) and PRD v1.6 §6.5 (Situation Room spec) and SKILL.md §5 (Situation Room intake guide).
>
> The artifact shows three states of the Situation Room, stacked vertically with section labels:
>
> **State 1 — Intake (the signature surface)** (max-width 720px, centered, generous vertical padding)
> - At top: small text "Day 38 — Week 6" in Eyebrow mute. No other chrome at the very top.
> - Below, large vertical centering. Three small switchable labels arranged horizontally, with `--space-3` between them. Inter 500, 14px:
>   - *I need help with this* (active — `--ink` underline accent below it)
>   - *Is this normal?* (inactive — mute)
>   - *I just did something* (inactive — mute)
> - Below the labels with `--space-4` of breathing room: **one single large input field**. The input is `--paper-2` filled, 1px `--paper-3` border, 12px radius, very generous internal padding (32px vertical, 32px horizontal). Placeholder text in `--mute` italic at body L size: *"Describe what's happening. Anonymise as you go — call them 'my lead dev' rather than their name."*
> - The input is `400px` minimum height — large enough to communicate "this is the main event of this screen."
> - Below the input: a single small caption in mute italic: *"FirstNinety will reply in seconds. Anything you type is encrypted, deletable, and never shared."*
> - At the bottom of this section, two ghost-style links (no primary CTA — the action is "type, then submit"): "→ Skip and roleplay instead" and "→ Open your past sessions"
> - **The screen is almost entirely empty whitespace around this single input.** That is the point. The user is in a moment of pressure; the product gives them a calm, oversized, singular field to type into.
>
> **State 2 — Active session in progress** (max-width 880px)
> - At top: Eyebrow "SITUATION — WEDNESDAY 2:14 PM"
> - Below: the user's submitted situation shown as a quote — Fraunces italic body L, indented with a left border in `--accent-soft`. Example content: *"My PM just messaged saying we need to scrap the requirements I spent the last two days on. He wants to talk in 30 minutes. I'm not sure if I should push back or just accept it."*
> - Below the quote: the Coach's response in mute Body, written in 2 short paragraphs of the senior-colleague register. Example content: *"Two days of requirements work doesn't get scrapped without context. Before the call, get one piece of information from him: what changed. Was the scope explicitly redefined by stakeholders, or did he just change his mind? Those are different conversations.*
> *Then in the call, don't litigate the work. Frame it forward: 'What's the new scope, and what can we reuse from what I've done.' That keeps you in collaborator mode rather than victim mode."*
> - Below the response: **three response paths offered as small cards in a row** (desktop) or stacked (mobile):
>   - **Read more on this →** linking to a Playbook
>   - **Roleplay the call now →** linking into a quick Simulator session (5-minute prep version)
>   - **Talk it through more →** opens further Coach conversation
> - Each card is small, 1px border, 8px radius, 24px padding. Single line of body inside.
>
> **State 3 — Past sessions list** (max-width 720px)
> - Eyebrow "YOUR PAST SESSIONS"
> - Fraunces H2: *"What you've been through."*
> - Below: a list of past session entries. Each entry is a single editorial row, separated by hair-thin dividers in `--paper-3`. Each row contains:
>   - Date stamp (mute caption, left): *"Wednesday 2:14 PM"*
>   - Entry type tag (small Inter Eyebrow): *"I NEED HELP WITH THIS"* or *"IS THIS NORMAL?"* or *"I JUST DID SOMETHING"*
>   - Situation summary (Fraunces italic body, the user's quote condensed to one line)
>   - Right-aligned: *"Reopen →"*
> - Example entries (use three rows):
>   - *"Wednesday 2:14 PM — I NEED HELP WITH THIS — My PM just messaged saying we need to scrap the requirements I spent two days on."*
>   - *"Monday 9:32 AM — IS THIS NORMAL? — My manager hasn't given me feedback on anything I've delivered in three weeks."*
>   - *"Last Friday 4:48 PM — I JUST DID SOMETHING — I told my lead dev the deadline was unrealistic and now he's not replying to my messages."*
>
> Design specifics for the intake state (the signature one):
> - The single input is the **largest interactive element on the whole page** — possibly the largest element in the entire product
> - The page has no header chrome, no sidebar visible — just the breath of whitespace and the input
> - The three soft labels above the input toggle the intake type *without* the page reloading — they're a quiet switcher, not a tab system
> - No buttons labelled "Submit" — the input has a small `→` icon in the bottom-right corner of the input that the user clicks to send, or they hit Cmd-Enter. **This is unusual and that's deliberate. The product feels different.**
>
> Technical requirements: same as A1. Add a hover state on the three soft labels that previews the cursor target. The submit `→` icon appears in mute and brightens to ink on hover.

**Verify after generation:**
- [ ] Intake state has dramatic whitespace around the single input
- [ ] The input is the largest interactive element on the screen
- [ ] Three soft labels above the input, not tabs — quiet switcher
- [ ] No "Submit" button — `→` icon inside the input, or Cmd-Enter
- [ ] User's quoted situation in the active state uses Fraunces italic with left border in `--accent-soft`
- [ ] Coach response is 2 short paragraphs, not bullets — senior-colleague register
- [ ] Past sessions list uses editorial row pattern, not card grid
- [ ] **This screen looks unlike any other SaaS product** — that's the moat

---

### Prompt C5 — Scenario Simulator Brief Screen ★ SIGNATURE MOMENT

**Purpose:** The most cinematic moment in the product. Per Design Brief §10, this is one of the five signature design moments. Black background, large Fraunces text setting the scene.

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety Simulator Brief Screen — Signature Surface." Reference Design Brief v1.0 §10 (this is a signature design moment — make it exceptional) and SKILL.md §4 (Scenario Simulator authoring guide).
>
> This is **the most editorial screen in the entire product.** It is a full-bleed dark-mode screen. The user has just clicked "Begin scenario" and this is what they see before they start. It must feel like the title card of a piece of editorial fiction.
>
> Page structure (full viewport, dark mode regardless of system preference):
>
> **Background:** `--ink` (`#0E1116`) full bleed, no other surfaces. Single max-width 720px column centered horizontally with substantial top and bottom padding (`--space-8` minimum on desktop).
>
> **At the very top of the content column:**
> - Small Eyebrow in mute paper: *"BUSINESS ANALYST — SCENARIO"*
>
> **Below, with `--space-5` of breathing room:**
> - Fraunces 400 at display size, in `--paper`: *"The Hostile Lead Dev."*
> - This title is large. On desktop, it occupies a full line. `text-wrap: balance`. No subtitle directly below.
>
> **Below the title, with `--space-6` of breathing room:**
> - Two short paragraphs of brief copy in Fraunces italic at Body L size, in mute paper (`#A29D90`), max line length 65 characters. The paragraphs are **the setup of the scene** — not bulleted instructions. They read like a piece of fiction. Use these exact words:
>
> > *You're walking into your first requirements workshop. The conference room has three people in it. Sam, the senior developer who shipped the current system two weeks ago and does not want to be in this room. Priya, the business sponsor, who has called this meeting but does not know what she wants from it yet. Marcus, from compliance, silent so far.*
> >
> > *You have thirty minutes. Your job is to capture the top five requirements for the new customer onboarding portal. Sam thinks this is a waste of his time. Priya keeps saying "you tell me what you need to know." Marcus is reading something on his laptop.*
>
> **Below the brief, with `--space-6` of breathing room:**
> - Eyebrow "IN THE ROOM"
> - Three persona monograms in a horizontal row. Each monogram is 80px (larger than in other surfaces). Use the muted six-colour palette. Below each monogram, Fraunces 500 Body for the name, and Inter 400 Body S mute for the one-line role. Use:
>   - "SP" — Sam Palmer — Senior Developer
>   - "PR" — Priya Rao — Business Sponsor
>   - "MK" — Marcus Klein — Compliance Lead
>
> **Below the personas, with `--space-6` of breathing room:**
> - Eyebrow "OBJECTIVE"
> - Fraunces italic body L, single line: *"Capture five requirements without losing control of the room."*
>
> **Below the objective, with `--space-7` of breathing room (more than other gaps — the climax of the page):**
> - A single button: "Begin" — primary, but **larger than the standard primary button**. 1px paper border, paper text on transparent. On hover: paper background, ink text. Subtle but significant. No coral accent here — this is the ink-and-paper moment.
> - Below the button, a small caption in mute italic: *"This will take about 10–15 minutes. Cmd-K to exit any time."*
>
> Design specifics:
> - **No header chrome on this screen.** No sidebar. No back button visible. The user is meant to feel they've stepped into a different mental space.
> - The Fraunces title and the Fraunces italic brief copy are the heroes of the page. Nothing competes with them.
> - The persona monograms are larger here than anywhere else in the product — they're meant to be characters in the user's mind by the time the scenario starts.
> - **No images, no illustrations, no gradients, no shapes.** Just the dark canvas and the editorial text.
> - The single "Begin" button is the user's commitment moment — designed to feel deliberate.
>
> Reference set: this screen takes inspiration from book covers (Penguin Modern Classics), the opening chyron of a documentary, or the cold open of a serious piece of journalism. Not from any SaaS product.
>
> Technical requirements: same as A1. The hover state on "Begin" should transition in 240ms with the Linear ease curve. No bounce.

**Verify after generation:**
- [ ] Full-bleed dark background, no other surfaces
- [ ] Title is huge — display size Fraunces 400
- [ ] Brief copy is Fraunces italic, narrow column, reads like fiction not instructions
- [ ] Three persona monograms larger than standard product size
- [ ] "Begin" button is single, central, deliberate — no other CTAs
- [ ] No header chrome, no sidebar
- [ ] No coral accent — this is an ink-and-paper-only moment
- [ ] **Screen could be a still from a Netflix opener** — that's the bar

---

### Prompt C6 — Scenario Simulator Active Session + Debrief

**Purpose:** The two functional states after the brief — the active back-and-forth scenario, and the debrief that follows.

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety Simulator — Active Session & Debrief." Reference SKILL.md §4.3 (debrief authoring guide).
>
> The artifact shows two states stacked vertically:
>
> **State 1 — Active session in progress** (max-width 880px, light mode)
> - Header strip: Eyebrow "BA — THE HOSTILE LEAD DEV — TURN 4 OF ~12." On the right, a small mute icon link "Exit scenario."
> - The scenario unfolds as a conversation. **Each speaker is identified by their persona monogram and name** in a left-aligned block, with their message in Body below.
> - Use these example turns (alternating monograms and the user):
>   - **SP — Sam Palmer:** *"Look, I've already built the system. Can we just walk through what's there?"*
>   - **You:** *"We can — but first I need to know if the existing system covers what Priya actually needs. Priya, when a customer comes in today, what's the first thing that frustrates them?"*
>   - **PR — Priya Rao:** *"Oh, well. There's a lot. I think it would help if you just talked to some customers and… you know, figured it out?"*
>   - **MK — Marcus Klein** (suddenly looks up from his laptop): *"Before we go further — what jurisdiction is this portal serving? Because if it's not UK-only there are residency questions."*
> - At the bottom of the conversation, a text input area with placeholder *"What do you say next?"* The input is similar in style to the Situation Room input but smaller (no need for the full signature treatment here). Send via `→` icon or Cmd-Enter.
> - The user's turn (one of the four above) is the most recent. The conversation is read top-to-bottom (oldest at top).
> - Below the input, a small caption mute italic: *"You can pause and resume any time. Cmd-K to exit."*
>
> **State 2 — Debrief** (max-width 720px, reading column)
> - Eyebrow "DEBRIEF — THE HOSTILE LEAD DEV"
> - Below, the headline judgement — the most important line in the debrief — in Fraunces 400 at H1 size: *"You held the room. Just."*
> - Below the judgement, a paragraph of context in Body: *"You made it through eleven turns without losing the workshop. That's harder than it sounds for a first session. Three things to take away."*
> - Then three sections, each marked with a small flag icon and Eyebrow label:
>   - **🟢 GREEN FLAGS** (use the icon, not just colour)
>     - Two short bullet-like sentences in Body, NOT as bulleted list — as short numbered prose paragraphs: *"1. You redirected Sam's first objection without dismissing it. That's hard. Most new BAs either capitulate or get defensive. 2. You used an open question to pull Priya into specifics. She gave you something to work with."*
>   - **🟡 YELLOW FLAGS**
>     - Two short numbered prose paragraphs: *"1. When Marcus surfaced the compliance question on turn 4, you moved past it. In a real workshop that question will come back, often via email to your manager. Learn to land the compliance flag in the room. 2. You over-relied on Priya for direction. She doesn't have it. Your role is to draw it out, not wait for it."*
>   - **🔴 NOT YET**
>     - One sentence: *"You didn't manage Sam's frustration — you just routed around it. That works once. Not twice."*
> - Below the three flag sections, an editorial paragraph titled "What this scenario rehearses for" (Eyebrow): *"This is the dynamic you'll meet in any requirements workshop where one stakeholder thinks the meeting is beneath them. The script doesn't change much. The personalities do."*
> - Below that, the "What's next" section (Eyebrow): three small linked cards (1 line each) — *"Replay this scenario →" / "Read the Stakeholder Pushback playbook →" / "Ask the Coach about your specific situation →"*
> - At the bottom: "Mark debrief read" ghost button.
>
> Design specifics:
> - Active session: persona monograms appear at left of each turn, NOT a chat-bubble layout. This is editorial, not Slack.
> - The user's turns and the personas' turns look visually similar — no big "you" vs "them" colour treatment. The user is *one voice in the room*, not the protagonist.
> - Debrief: the single Fraunces H1 judgement is the load-bearing element. Most other "AI debriefs" lead with bulleted advice; FirstNinety leads with **a single line of editorial summary**.
> - The flag icons use the same status badges from A3 — icon + colour, not colour alone
> - **Honesty over flattery.** The debrief should feel like a senior colleague who watched the workshop and tells you what they saw. Not effusive. Not deflating.
>
> Technical requirements: same as A1.

**Verify after generation:**
- [ ] Active session uses editorial layout, not chat bubbles
- [ ] User's turns and personas' turns look visually similar — no protagonist treatment
- [ ] Debrief leads with one Fraunces H1 line of judgement
- [ ] Green/yellow/red flag sections use icons plus colour, never colour alone
- [ ] Flag content uses numbered prose, not bulleted lists
- [ ] Debrief voice is honest and calibrated, not effusive
- [ ] "What's next" cards are tight one-liners, not full cards

---

### Prompt C7 — AI Coach Conversation

**Purpose:** The ad-hoc Coach surface (different from Situation Room — this is for general questions, not real-time workplace moments).

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety AI Coach." Reference SKILL.md §8 (Coach voice & behaviour rules).
>
> The artifact shows the Coach conversation surface — a focused, calm chat interface that does **not** look like ChatGPT or generic AI chat.
>
> Page structure (max-width 1080px with left sidebar at 240px):
>
> **Left sidebar — Past threads**
> - Eyebrow "RECENT THREADS"
> - A list of 4–6 thread entries. Each entry is a thin editorial row (no card chrome) with:
>   - Fraunces italic body — the topic, one line. Examples:
>     - *"Preparing for my probation review"*
>     - *"What 'cross-functional' actually means here"*
>     - *"Should I push back on the deadline"*
>     - *"How to read my manager's silence"*
>   - Caption mute below — date stamp ("2 days ago" / "Last Thursday")
> - The current thread is marked with a subtle `--paper-2` background.
> - At the bottom of the sidebar: "+ New thread" ghost button.
>
> **Main column — Current thread**
> - Top: Eyebrow "PREPARING FOR MY PROBATION REVIEW — THREAD STARTED MONDAY"
> - Below: the conversation, alternating user and Coach turns. **Not chat bubbles** — editorial layout with each speaker indicated by a single small label above their message:
>   - **You** (Inter 600 caption, mute, with a horizontal dash beneath the word) → user message in Body, plain text on `--paper`
>   - **Coach** (Inter 600 caption, ink, with a horizontal accent in `--accent-soft` 2px tall beneath the word) → Coach response in Body, plain text on `--paper`
> - Use this example exchange:
>   - **You:** *"My probation review is in two weeks. My manager hasn't given me much feedback. How do I prepare?"*
>   - **Coach:** *"Two things to do this week, and one to avoid.*
> *Do: book a 30-minute one-to-one with your manager before the review, framed as 'I want to make sure I'm walking into our review well-prepared — can we talk about what good looks like at the end of this probation?' The reframe is important. You're not asking for feedback (which puts them on the spot), you're asking for clarity (which they're more likely to give).*
> *Also do: write your own self-assessment in one document, using three columns — what I delivered, what I learned, what I want to do next. Keep it to one page.*
> *Avoid: asking 'how am I doing?' as the opener. It's the most common new-hire question and the least useful one. They probably don't have a structured answer ready."*
>   - **You:** *"What if my manager is the type who won't give a straight answer?"*
>   - **Coach:** *"Then your job is to ask better questions. 'On a scale of 1 to 5, where would you put me on stakeholder engagement?' forces a number. 'Is there anyone on the team you'd want me to work more closely with?' forces a name. Specific questions get specific answers.*
> *If your manager genuinely won't engage, that's a yellow flag — not on you, on them. Worth flagging gently in the formal review if you can."*
> - Bottom: input field for next message, ghost-style send (just `→` icon, like Situation Room).
>
> **Right rail (desktop only — narrower than the left sidebar at ~200px)**
> - Eyebrow "WHAT THE COACH KNOWS HERE"
> - A small list in Fraunces italic body S of context the Coach is using in this thread. Examples:
>   - *"You're a BA in week 11."*
>   - *"You start your probation review on June 12."*
>   - *"You mentioned earlier your manager is 'remote and busy.'"*
> - Below that, in caption mute italic: *"This context is private to you. Edit it in Settings."*
>
> Design specifics:
> - **The Coach's turns include occasional Fraunces italic phrases** for emphasis — when stating a sharp principle ("Specific questions get specific answers."). This is the editorial signature.
> - The Coach's turns can be multi-paragraph. Don't make them short. The senior-colleague voice doesn't dispense bite-sized advice — it speaks fully.
> - No "Coach is typing…" indicator with three jumping dots — use the loading pattern from A3 (mute three dots, "FirstNinety is thinking…").
> - No "thumbs up / thumbs down" feedback on Coach messages — the relationship is conversational, not a rating exercise.
>
> Technical requirements: same as A1.

**Verify after generation:**
- [ ] Editorial layout — speaker labels with horizontal accent under the Coach name (not chat bubbles)
- [ ] Coach turns are multi-paragraph, with occasional Fraunces italic phrases for sharp principles
- [ ] Past threads list uses Fraunces italic single lines — editorial signal
- [ ] "What the Coach knows here" rail shows the Level 1 declared memory in italic
- [ ] No emoji reactions, no thumbs feedback, no "Was this helpful?"
- [ ] Coach voice is honest and direct — doesn't lead with "Great question!"

---

### Prompt C8 — Playbook Library + Worked Example Detail

**Purpose:** The reference library, then the editorial reading view of a worked example with margin annotations — the format that genuinely differentiates from a generic template repository.

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety Playbook Library." Reference SKILL.md §7 (Playbook authoring guide) and Design Brief v1.0 §3 (typographic editorial conventions).
>
> The artifact shows two states stacked vertically:
>
> **State 1 — Library Index** (max-width 1080px)
> - Header: Eyebrow "PLAYBOOKS — BUSINESS ANALYST." Fraunces H1: *"Worked examples. Not empty templates."*
> - Below: a sub-paragraph in Body L mute: *"Every Playbook starts with a clean template and then shows two or three filled-in examples with annotations in the margins. Read the margins."*
> - Below the intro: a 2-column grid (desktop) or stacked (mobile) of Playbook cards. Use Playbook Card component from A3, but in a denser grid. 6–8 cards total. Examples:
>   - Business Requirements Document (Standard Variant)
>   - Business Requirements Document (Regulatory Variant)
>   - User Stories with Acceptance Criteria
>   - Stakeholder Map (Power-Interest Grid)
>   - RAID Log
>   - Process Map (BPMN Basics)
>   - Traceability Matrix
>   - First 1:1 with your Manager — Agenda
> - At the bottom: a small italic line: *"More Playbooks are added every week. Suggest one →"*
>
> **State 2 — Playbook Detail: "Business Requirements Document — Regulatory Variant"** (FULL-WIDTH editorial layout — this is the magazine moment)
> - Header: Eyebrow "BA — PLAYBOOK — REGULATORY VARIANT"
> - Fraunces H1: *"Business Requirements Document."* Subhead in Fraunces italic body L mute: *"For a regulatory project. Read the margins."*
> - Below header: a row of metadata in caption mute — *"~10 minutes to read · Updated this month · Annotated by [practitioner]"*
> - Below metadata: an "actions" row of small ghost buttons: "Download empty template ↓" / "Download worked example ↓" / "Discuss with the Coach →"
>
> Then the **editorial magazine-style content layout**:
>
> - **Two-column layout on desktop** (collapses to single column with annotations as inline italic asides on mobile):
>   - **Left column** (60% width, max 720px wide, the "page"): the actual BRD content in a reading-formatted document layout. Use realistic but anonymised content. Sections include:
>     - Title block: "BRD — [Project Codename] — v1.2 — Status: Draft for review"
>     - Section 1: Executive Summary (2 paragraphs)
>     - Section 2: Background & Business Drivers (1 paragraph mentioning regulatory deadline)
>     - Section 3: Scope (in-scope and out-of-scope, structured as short paragraphs not bullets)
>     - Section 4: Stakeholders (a short list of anonymised roles)
>     - Section 5: Requirements (use IDs like REQ-001, REQ-002, with 1-line descriptions — show only 4–5 examples, not the full list, to keep the artifact reasonable in size)
>     - Section 6: Compliance & Audit Considerations (the regulatory-specific section — this is where the variant differs from standard BRD)
>   - **Right column** (40% width on desktop): the **margin annotations** in Fraunces italic body S, mute. These annotations sit alongside specific sections of the BRD and provide editorial commentary explaining *why* the author wrote that section that way. Examples:
>     - Beside Section 1 Executive Summary: *"Three sentences max. If your sponsor reads only this, they should know what's being built and why now."*
>     - Beside Section 2 Background: *"Naming the regulator and the deadline is important. Vague regulatory framing reads as if you don't know what you're talking about."*
>     - Beside Section 3 Scope: *"List out-of-scope explicitly. The thing you'll regret most is the requirement someone assumed was included."*
>     - Beside Section 4 Stakeholders: *"Anonymise. Use role titles in your document, not real names — both because it travels better and because of GDPR considerations."*
>     - Beside Section 5 Requirements: *"Notice the IDs. They're for traceability — every requirement here should appear in test plans and acceptance criteria later. The IDs survive the document."*
>     - Beside Section 6 Compliance: *"This section is the entire reason the regulatory variant exists. Skipping it isn't optional."*
>
> - At the bottom of the document (full width again), three sections:
>   - **Common mistakes** (Eyebrow + Fraunces H3 + 3 short paragraphs of prose, not bullets):
>     - *"Three things new BAs get wrong in regulatory BRDs:"*
>     - Three short paragraphs, each 2–3 sentences.
>   - **Variant patterns** (Eyebrow + Fraunces H3 + short paragraphs):
>     - *"When the regulatory deadline is hard, the structure tightens. Three changes you might need:"*
>     - Short paragraphs.
>   - **What to do next** (Eyebrow):
>     - Three tight one-line linked cards: "Run the Stakeholder Pushback scenario →" / "Read the Traceability Matrix Playbook →" / "Talk through your specific BRD with the Coach →"
>
> Design specifics:
> - The two-column layout (document + margin annotations) is the **single most distinctive design pattern in the product**. Make it work beautifully.
> - The right-column annotations align *roughly* with their corresponding section in the left column — the alignment doesn't have to be exact, but each annotation should sit visually within the vertical reading-range of its target section.
> - The annotations are in Fraunces italic, smaller than body, and have a subtle left border in `--paper-3` (1px) creating the visual signal that these are marginalia.
> - On mobile, the annotations collapse to inline italic asides between paragraphs of the main document. They keep the editorial italic Fraunces treatment.
> - **No empty-template-with-form-fields visual** — this is a document showing real, written content. The "empty template" is downloadable, not displayed.
>
> Technical requirements: same as A1.

**Verify after generation:**
- [ ] Two-column document + margin annotation layout works on desktop
- [ ] Margin annotations are Fraunces italic with subtle left border — clearly distinct from main content
- [ ] Mobile: annotations collapse to inline italic asides, not buried in a separate tab
- [ ] BRD content uses realistic anonymised content — no Lorem Ipsum
- [ ] Common mistakes and variant patterns use prose, not bullet lists
- [ ] Document headers use Fraunces; document body uses Inter
- [ ] **The page reads like an annotated piece in a long-form magazine** — that's the bar



## Group D — Probation Mode & Final Signature Moments (6 prompts)

These six prompts cover the Probation Mode surfaces (added in PRD v1.7), plus the two previously deferred signature design moments from Design Brief §10 (Memory Settings page, Day 90 Survival Report).

**Run order is strict — C9 → C14 in sequence.** C9 and C10 set up the probation-active visual state; C11 depends on that visual context; C12 follows the brief; C13–C14 are independent signature moments.

---

### Prompt C9 — Probation Activation Banner & Settings Surface

**Purpose:** The pre-active state — capturing the user's probation date in onboarding step 3 (already exists in C1), the Day-70 activation banner on Daily Home, and the Settings → Probation page for managing the review date and window.

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety Probation — Activation & Settings." Reference Design Brief v1.0 and PRD v1.7 §6.6 (activation flow) and §7.5 (probation flow).
>
> The artifact shows three states, stacked vertically with section labels:
>
> **State 1 — Activation banner on Daily Home** (max-width 1080px, light mode, on `--paper`)
> - Top: small Eyebrow "DAY 70 — TUESDAY, 2 AUGUST" (or whichever day the trigger fires)
> - Below the standard week banner, **a single inline banner card** with these characteristics:
>   - Width: full of the main column
>   - Background: `--paper-2`
>   - 1px border in `--paper-3`
>   - 8px radius
>   - 32px internal padding
>   - Subtle: this is an invitation, not an interruption — no coral accent, no urgency colour
> - Banner content:
>   - Eyebrow "21 DAYS TO YOUR PROBATION REVIEW"
>   - Fraunces H3: *"Want to switch on Probation Mode?"*
>   - Body L mute (one short paragraph): *"For the next three weeks, FirstNinety will sharpen everything around the review — missions, scenarios, the Coach. You can switch it off any time."*
>   - Two buttons: Primary "Switch on" + Ghost "Not yet"
> - Below the banner: the rest of the day's normal home content (one mission card placeholder, Situation Room teaser placeholder — these are stubs in this artifact, just showing the banner doesn't take over the page)
>
> **State 2 — Settings → Probation page (review date set, mode not yet active)** (max-width 720px, reading column)
> - Eyebrow "SETTINGS → PROBATION"
> - Fraunces H1: *"Your probation review."*
> - Below: a single editorial line in Fraunces italic body L: *"On Tuesday, 23 August. That's 28 days away."*
> - Below, three small editorial rows separated by hair-thin dividers in `--paper-3`:
>   - **Window length** — *"Probation Mode will activate 21 days before your review."* + a subtle inline edit affordance showing "21 days" with a small "Change" link on hover. On hover/click, an inline number input appears with caption mute italic: "Minimum 7 days, maximum 90 days. Adjust if your probation is shorter or longer than usual."
>   - **Review date** — *"You can change this if it shifts."* + small "Edit date" link on hover
>   - **Probation Mode** — *"Not yet active. Will activate automatically on 2 August, or you can switch it on now."* + a small "Switch on now" ghost button on the right
> - Below the three rows, generous whitespace, then a final small editorial paragraph in body S mute: *"FirstNinety will deactivate Probation Mode automatically on the date of your review. You'll be asked how it went a day after."*
> - At the bottom, a small destructive link (ghost-style, mute italic): "Remove my probation review date →" — opens a small confirmation modal
>
> **State 3 — Settings → Probation page (no review date set)** (same max-width)
> - Eyebrow "SETTINGS → PROBATION"
> - Fraunces H1: *"Your probation review."*
> - Below, generous whitespace, then a single editorial paragraph in body L: *"If your role has a probation review, tell FirstNinety when it is. We'll switch on Probation Mode three weeks before and help you prepare."*
> - Below: a single "Tell us your review date" primary button
> - On hover/click, inline date input appears
> - Below the date input, three quick-preset chip buttons: *"In 90 days"* / *"In 3 months"* / *"I'll set this later"*
> - Below, generous whitespace, then a small italic Fraunces line in mute: *"Not everyone has a probation review. If your role doesn't, this stays empty."*
>
> Design specifics:
> - The settings page reads as *editorial* — facts laid out in a quiet column, each editable via subtle hover affordances, not as a typical form with stacked input fields and stacked labels.
> - The activation banner is **inline, not modal** — it sits in the user's daily home flow, doesn't block them, doesn't demand attention.
> - No coral accent on either screen — these are calm moments, not alert moments.
>
> Technical requirements: same as A1 (Google Fonts: Fraunces, Inter; Tailwind CDN; Lucide icons; single self-contained HTML; design tokens as CSS variables).

**Verify after generation:**
- [ ] Activation banner is inline (not modal), `--paper-2` background, no urgency colour
- [ ] Settings page reads as editorial — quiet column with hover-revealed edit affordances
- [ ] No exclamation marks or emojis
- [ ] No coral accent on either surface
- [ ] State 3 (no date set) is gentle, doesn't pressure the user into setting a date
- [ ] Quick-preset chips ("In 90 days" / "In 3 months" / "I'll set this later") render correctly
- [ ] Date editing is inline, not a separate page

---

### Prompt C10 — Probation Mode Daily Home State

**Purpose:** What the Daily Home looks like when Probation Mode is active. The product subtly reshapes around the review without losing its calm.

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety Daily Home — Probation Mode Active." Reference Design Brief v1.0 §10 (signature moments — keep Day 1 empty state spirit alive even in probation), PRD v1.7 §6.6 (Probation Mode features), and your existing C2 artifact as the foundational layout to adapt.
>
> The artifact shows the Daily Home in Probation Mode, in two states stacked vertically:
>
> **State 1 — Probation Mode Daily Home, 14 days to review** (max-width 1080px with sidebar from A2 as visual reference, but draw it light/illustrative since this is a content artifact)
> - Top: small Eyebrow "DAY 76 — MONDAY, 9 AUGUST"
> - Below, **the Probation Banner replaces the standard week-theme banner**:
>   - Background: `--paper-2`
>   - 1px border in `--paper-3`
>   - 8px radius
>   - 32px internal padding
>   - Eyebrow "PROBATION — 14 DAYS TO REVIEW"
>   - Fraunces italic H3 (varies by day; show this one): *"This week: gather your evidence. Don't over-prepare."*
>   - Below the italic line, a small body S mute line: *"Probation Mode is on. Adjust in Settings."*
> - Below the banner: today's missions, but **probation missions inserted ahead of standard missions**. Use the Mission Card component from A3, three cards:
>   - Mission 1 (active, eyebrow "TODAY — DAY 76 — PROBATION"): "Write your self-assessment (draft one)." 30 min. Begin.
>   - Mission 2 (available, eyebrow "PROBATION"): "Assemble your evidence portfolio." 25 min. Begin.
>   - Mission 3 (available, no eyebrow distinction since it's a normal Week 11 mission): "Lead a cross-team conversation about handover." 20 min. Begin.
> - To the right of the missions (desktop) or below (mobile), a small Situation Room teaser. **The teaser has the fourth soft label visible**: "I need help with this" / "Is this normal?" / "I just did something" / *"This is about my probation"* — the fourth in mute italic, distinguishable.
> - On the right sidebar (desktop only, drawn schematically):
>   - "Probation at a glance" — a small section showing: *Review date: 23 Aug · Days left: 14 · Brief generated: Not yet · Mode active since: 2 Aug*
>   - "What I know" section (Fraunces italic) — same as in C2 but now mentions a probation-related fact: *"Your probation review is in 14 days." / "You're working in financial services." / "Your manager mentioned a 'stretch project' last week."*
>   - "Recent" section showing the latest activity
>
> **State 2 — Probation Mode Daily Home, 3 days to review (Brief generation prompt)** (same shell)
> - Banner: Eyebrow "PROBATION — 3 DAYS TO REVIEW"
> - Fraunces italic H3: *"Three days. Generate your Brief and edit it once. That's enough."*
> - Below the banner, **a special inline prompt card** (only appears at T-3 days if Brief hasn't been generated):
>   - Background: `--ink` (the premium signal — this is an important moment)
>   - 8px radius
>   - 32px internal padding
>   - Eyebrow in `--mute` (lightened on dark): "READY WHEN YOU ARE"
>   - Fraunces H3 in `--paper`: *"Generate your Probation Brief."*
>   - Body L in `--mute` (paper): *"A one-page document drawn from what you've done these 90 days. You'll be able to edit it, then take it into your review."*
>   - Primary button (paper-on-ink → ink-on-paper on hover): *"Generate the Brief"*
>   - Below button, caption mute italic: *"Takes about 30 seconds. You can regenerate up to 3 times."*
> - Below the Brief prompt, today's missions: one probation mission ("Rehearse the review conversation. Run the probation scenario." 15 min. Begin.) plus the Situation Room teaser
>
> Design specifics:
> - **The probation banner is calmer than the standard active-day banner.** It says "this is happening" not "ACT NOW."
> - The voice across both states includes the **counterweight against over-preparation** from SKILL.md §10.4 — *"Don't over-prepare"*, *"That's enough."*
> - The Brief generation prompt at T-3 days is the only surface in either state with an `--ink` background. It's the second-most-important moment in Probation Mode (after the Brief itself, which is C11). Treat it accordingly.
> - The fourth Situation Room label appears in mute italic — present but not foregrounded, signalling it's available without making it feel mandatory.
>
> Technical requirements: same as A1.

**Verify after generation:**
- [ ] Probation banner replaces the standard week-theme banner, both states
- [ ] Probation missions get an eyebrow "PROBATION" distinguisher; normal missions don't
- [ ] Fourth Situation Room label is visible but in mute italic (not foregrounded)
- [ ] T-3 days Brief prompt has `--ink` background — the premium signal
- [ ] Counterweight voice ("Don't over-prepare", "That's enough") is present
- [ ] Right sidebar "Probation at a glance" section renders correctly
- [ ] No coral accent except possibly one tiny instance somewhere (per Design Brief §4.3 discipline)

---

### Prompt C11 — The Probation Brief ★ SIGNATURE MOMENT

**Purpose:** The most distinctive new surface in Probation Mode. A printable, PDF-exportable, editorial one-page document the user takes into their review. This is the artefact that justifies the $39.99 price most directly.

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety Probation Brief — Signature Document." Reference Design Brief v1.0 §10 (this is a signature design moment — make it exceptional) and PRD v1.7 §6.6 (Probation Brief artefact structure).
>
> **Critical framing:** the Probation Brief is *both* a screen experience and a PDF export. **Design for screen first.** Note PDF constraints inline (specified below) so the design renders gracefully as both. The PDF version is server-rendered by Puppeteer at build time; the screen version is what users interact with daily.
>
> The artifact shows three states stacked vertically:
>
> **State 1 — The Brief itself (the document)** (max-width 720px, light mode, generous vertical padding)
>
> Format: this is an editorial one-page document, not an app surface. Think *one page of a thoughtful book*, not *a dashboard*. No app chrome, no sidebar. Just the document, centred on the page.
>
> - At the top, small chrome (NOT part of the printable document — fades out when "Print preview" toggled):
>   - Left: "← Back to Probation"
>   - Right: Three small ghost buttons: "Edit" / "Regenerate (2 of 3 used)" / "Export as PDF"
>
> - The document itself, with generous internal padding (64px top/bottom, 48px sides):
>   - **Top-of-document strip** (this *is* in the PDF):
>     - Eyebrow in caption mute, centred: "PROBATION BRIEF — [USER NAME] — [REVIEW DATE]"
>     - Below, a thin horizontal rule in `--paper-3`
>
>   - **The document title** (centred):
>     - Eyebrow caption mute centred: "FOR YOUR PROBATION REVIEW"
>     - Below, Fraunces H1 (centred, balanced): *"Where I am, 90 days in."*
>
>   - **First content block — Top half (per MVP Spec §2.5 brief structure)** with three numbered editorial sections side-by-side on a wide screen, stacked on narrow:
>     - **1. Delivered.** Fraunces 500 numeric "1." inline with Fraunces italic body L heading "Delivered." Below, one paragraph of body in `--ink` describing what the user delivered. Example: *"I shipped two greenfield work-streams: the customer onboarding portal requirements (BRD signed off, traceability matrix in place) and the compliance gap analysis for the upcoming FCA review. Both delivered ahead of the dates I committed to in my second 1:1 with you."*
>     - **2. Learned.** Same structure. Example: *"I learned that this team's stakeholder politics are not in the org chart. The shortest path to a decision is through Marcus in compliance, not the named project sponsor. I'm now drafting requirements with compliance review built into the discovery phase, not at the end."*
>     - **3. Want next.** Same structure. Example: *"I want to lead the next greenfield work-stream end-to-end — from initial scoping to UAT sign-off — without you reviewing every artefact. I think I'm ready to be trusted with that scope, and I want to show you."*
>
>   - **Second content block — Bottom half (the evidence)**:
>     - Eyebrow caption mute, centred: "WHAT I'M DRAWING ON"
>     - Below, three short paragraphs of body S `--ink`, each representing one concrete example from the user's 90 days. Each one starts with a small Fraunces italic phrase as the example title. Examples:
>       - *"The hostile lead dev workshop. Week 6.* I ran a 30-minute requirements workshop with Sam (senior dev) and Priya (sponsor). Sam came in thinking it would be a waste; by the end he'd surfaced three integration concerns that hadn't been in the original scope. The workshop debrief is in your inbox from 14 July."
>       - *"The compliance gap. Week 9.* Marcus from compliance raised a data residency question two days before the portal go-live. I drafted the compliance addendum in 48 hours and it was the reason we shipped on time without going back to legal review."
>       - *"The scope clarification conversation. Week 11.* When the business pushed for a feature addition mid-sprint, I wrote a one-paragraph scope clarification email instead of escalating to you. The business accepted the trade-off and we kept the sprint goal."
>
>   - **Third content block — Footer (the questions)**:
>     - Eyebrow caption mute, centred: "THREE QUESTIONS I'LL BRING TO THE REVIEW"
>     - Below, three numbered editorial lines, each a short question in Fraunces italic body L:
>       - *"What does the next 90 days look like, from your perspective?"*
>       - *"Where do you want me to be sharper in how I work?"*
>       - *"Is there a stretch piece of work you'd want me to own next quarter?"*
>
>   - **Bottom-of-document strip** (this *is* in the PDF):
>     - Thin horizontal rule in `--paper-3`
>     - Below, caption mute italic centred: *"Drafted with FirstNinety. Generated [date]. Edited [date]."*
>     - Below that, very small caption mute: "firstninety.com"
>
> **State 2 — Edit mode** (same document, with editing affordances visible)
> - The document, but each of the four content blocks (Delivered / Learned / Want next + three evidence paragraphs + three questions) has a subtle hover state: 1px dashed outline in `--paper-3` revealing on hover, with a small "Edit" ghost link in the top-right of the block.
> - Clicking any block opens an inline textarea (`--paper-2` filled, 1px `--paper-3` border, 8px radius, generous internal padding) overlaying the block.
> - Below the textarea, two small buttons: "Save" primary, "Cancel" ghost.
> - In edit mode, the top chrome shows: "Editing — auto-saves every 30s" caption mute italic with a small live dot indicator.
>
> **State 3 — PDF export preview** (same document, with chrome stripped and "print-ready" framing)
> - Show what the PDF version looks like: same document, no top app chrome, optimal print formatting.
> - Above the PDF preview (as artifact-only context): a small Eyebrow "PDF PREVIEW" + small body S mute description: *"This is what gets exported. A4 portrait, fonts embedded, single page."*
> - Render the document at A4 proportions (594mm × 841mm scaled down for screen viewing — show at ~70% size to indicate page boundary).
> - Below the PDF preview, a small actions bar: "Download PDF" primary + "Email to myself" ghost + "Edit instead →" ghost.
>
> **PDF constraints to honour (note inline in the design):**
> - Single A4 page — the content must fit. If a user's edits make it too long, the screen version shows a small caption mute italic warning: *"This is getting long for one page. Consider trimming for the printed version."*
> - **Web fonts must be embedded** in the PDF — note that Puppeteer at server-side renders this with Fraunces and Inter from Google Fonts CDN
> - **Print bleeds:** standard margins (15mm all sides minimum)
> - **No background colours on the document** — `--paper` is fine but won't print as background; the document should look intentional on white paper if the user prints with "background colours off"
> - **No coral accent in the PDF** — single-colour ink-on-paper only
> - **Hyperlinks:** any links inside the document content (rare) should print as plain text, not blue underlined
>
> Design specifics:
> - The Brief is **the most editorial moment in the entire product.** Treat it as such. This is the screen that future users will photograph and share. It justifies the $39.99 price in a single image.
> - The voice in the example content matches SKILL.md §3.1 BA tradecraft — the *quiet senior junior person* voice. The Brief is the user speaking, not FirstNinety speaking — written *in the user's voice* (which the AI generated drawing on the user's journey data).
> - Numbered sections use **Fraunces 500 large numerals** as visual structure — these are the rhythm of the document.
> - **No coral accent** anywhere on the document. The Brief is ink-and-paper-only. Premium silence.
> - The whole document reads like a single editorial unit, not a dashboard with cards.
>
> Reference set: think *one page in The Browser Company's manifesto*, or *the first page of a Substack essay by a serious writer*. Not *a Notion page*, not *a Canva-style template*.
>
> Technical requirements: same as A1. Plus: include a CSS `@media print` block that strips the top chrome and adjusts the document for clean A4 printing.

**Verify after generation:**
- [ ] Document reads as a single editorial unit, not a dashboard
- [ ] Three numbered top-half sections (Delivered / Learned / Want next) use large Fraunces numerals
- [ ] Evidence paragraphs each start with a Fraunces italic phrase as the example title
- [ ] Three closing questions in Fraunces italic
- [ ] No coral accent anywhere
- [ ] No "Generated by AI ✨" footer or similar — the footer is dry: *"Drafted with FirstNinety. Generated [date]."*
- [ ] Edit mode shows subtle hover affordances on each block, inline textarea editing
- [ ] PDF preview state at A4 proportions
- [ ] `@media print` block strips chrome correctly
- [ ] **The page is photograph-worthy** — that's the bar

---

### Prompt C12 — Probation Outcome Capture Flow

**Purpose:** The single most emotionally loaded surface in the product. *"How did your review go?"* with four editorial options. Followed by a post-review Coach thread with outcome-specific voice.

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety Probation Outcome Capture." Reference Design Brief v1.0 §13 (reference set — editorial restraint matters most here), PRD v1.7 §6.6 (outcome capture spec) and §7.5 (outcome flow), and SKILL.md §2 (voice rules — this surface tests them hardest).
>
> **Critical framing:** this is the single most emotionally loaded surface in the product. The user may have just been told they passed, or that their probation is being extended, or that they are being let go. The design must be **calm, respectful, and offer no judgement.** Voice rules in Design Brief §2 apply with extra discipline — no exclamation marks, no emojis, no "Great job!" energy.
>
> The artifact shows three states stacked vertically:
>
> **State 1 — Outcome prompt (the initial capture screen)** (max-width 640px, centred, generous vertical padding, `--paper`)
> - Top: small Eyebrow "PROBATION REVIEW — 24 AUGUST"
> - Below, generous whitespace, then Fraunces H1 (balanced, no orphan): *"How did your review go?"*
> - Below, one short editorial paragraph in body L mute: *"There's no right answer here. We're asking so we know how to be useful next."*
> - Below, **four large editorial option cards stacked vertically** (NOT a card grid, NOT radio buttons — these are large click targets each at body L size):
>   - Each card: 1px border in `--paper-3`, 8px radius, 24px internal padding, full width of the column
>   - Hover state: subtle 1px ink border replaces the paper-3 border; no fill change
>   - Selected state: `--ink` background with `--paper` text (the same premium signal we've used throughout)
>   - Card 1: Fraunces italic body L: *"Continued — I'm staying."*
>   - Card 2: Fraunces italic body L: *"Extended — we're checking in again."*
>   - Card 3: Fraunces italic body L: *"Ended — I'm moving on."*
>   - Card 4: Fraunces italic body L mute (subtly different — the "decline to answer" option): *"Prefer not to say."*
> - Below the four cards, generous whitespace, then a small caption mute italic, centred: *"Whatever you choose, we'll change what we say next accordingly. There's no scoring here."*
> - No "Submit" button — clicking a card immediately moves the user to State 2 (the appropriate post-review Coach thread).
>
> **State 2 — Post-review Coach thread (for "Continued" outcome)** (max-width 720px, reading column, the standard Coach editorial layout from C7)
> - At top: small Eyebrow "POST-REVIEW — CONTINUED"
> - Below: Fraunces italic body S mute single line: *"Started after your review on 24 August."* (the auto-generated thread title indicator)
> - First message: **Coach** label (Inter 600 caption ink with accent-soft 2px underline beneath), then the Coach's opening message in body, forward-looking voice per SKILL.md §10.4 example:
>   > *"You're on the team. The first 90 days are over and you didn't drown — that's a real thing, and worth letting yourself feel for a moment.*
>   >
>   > *The next quarter is different work. Now that you're not being assessed against probation criteria, you're being assessed against whether you become someone the team actually relies on. The shift is from 'showing competence' to 'building trust.' Those aren't the same thing.*
>   >
>   > *What's the first piece of work on your plate now that the review is behind you?"*
> - Below the Coach message: input field for the user's response (same style as Coach UI in C7)
>
> **State 3 — Post-review Coach thread (for "Ended" outcome) — THE MOST EMOTIONALLY LOADED MOMENT IN THE PRODUCT** (max-width 720px, reading column)
> - At top: small Eyebrow "POST-REVIEW — ENDED"
> - Below: Fraunces italic body S mute single line: *"Started after your review on 24 August."*
> - First message: **Coach** label, then Coach opening message — calm, respectful, no false reassurance, no catastrophising:
>   > *"That is hard. There is no way to dress it up.*
>   >
>   > *Whatever your manager said, and whatever you're telling yourself right now, here is what is also true: you did the work of the first 90 days inside a real organisation. You learned things this quarter that nobody who hasn't been in the seat can teach you. Those things travel with you to the next role.*
>   >
>   > *We don't need to talk through next steps today. Take a few days. When you want to start thinking about what comes next, come back and tell me what you're noticing.*
>   >
>   > *In the meantime, the one thing worth doing this week is writing down what you learned about yourself in these 90 days — not what you delivered, what you learned. Even rough notes. We'll work from those when you're ready."*
> - Below the Coach message: a small editorial offering — three subtle linked cards in a row (or stacked on mobile), each in mute caption text:
>   - *"→ Read: what to do in the first week after a probation ends"* (links to a Playbook stubbed but not built at MVP)
>   - *"→ Update your CV with what you actually did"* (links to Joberlify with a deep link)
>   - *"→ Talk to a real person — find a coach"* (external link to a curated list of human coaches)
> - Below those, the standard Coach input field, with placeholder italic mute: *"Take your time. There's no rush."*
> - **No "Mark as resolved" or "Close thread" affordance** — this thread stays open as long as the user wants it.
>
> Design specifics across all three states:
> - **Voice discipline is the entire design here.** Read every word three times before generating. Any phrase that could be read as patronising or saccharine — cut it.
> - **"Extended" outcome state** can be inferred from the patterns in States 2 and 3 — write a similar opening message that's calm-practical: *"Extended isn't ended. The next 30 days are a recalibration, and they're survivable. Three things worth knowing."* — but generate this as part of State 2 or as a brief 4th panel between States 2 and 3 if helpful.
> - The four-option capture in State 1 deliberately frames outcomes without judgement: "Continued — I'm staying" / "Extended — we're checking in again" / "Ended — I'm moving on" / "Prefer not to say". The user-led framing ("I'm staying", "I'm moving on") matters — it's the user telling the product what's happening, not the product confirming what the company did.
> - Across all post-review threads, the Coach voice never says "I'm sorry to hear that" reflexively. Sympathy is implied by what is said and what is *not* said, not by an explicit "I'm sorry" opener.
> - The "Ended" state must not feel like a failure screen. It is the product genuinely sitting with the user through a hard moment. The premium signal here is *the time and care we take to write it well*, not any visual treatment.
> - No coral accent anywhere on any of these three states.
>
> Reference set: think *the post-treatment page on a serious health-services app*, or *the page of a good obituary publication*. Not *any SaaS retention surface*.
>
> Technical requirements: same as A1.

**Verify after generation:**
- [ ] Four outcome options in user-led framing ("I'm staying" / "I'm moving on" — not "I passed" / "I failed")
- [ ] "Prefer not to say" option present and not visually muted into invisibility
- [ ] Selecting an option immediately advances (no "Submit" button)
- [ ] "Continued" Coach message is forward-looking, no celebratory tone
- [ ] "Ended" Coach message is calm and respectful, no false reassurance, no "I'm sorry to hear that" opener
- [ ] No coral accent anywhere
- [ ] No "Mark as resolved" affordance on the "Ended" thread
- [ ] **The "Ended" state could be read by someone who has actually been let go without making them feel worse** — the highest bar in the prototype

---

### Prompt C13 — Dedicated Memory Settings Page

**Purpose:** The previously deferred fourth signature design moment. The full "What FirstNinety knows about you" surface as a dedicated settings page.

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety Memory Settings — Dedicated Surface." Reference Design Brief v1.0 §10 (signature design moments — the memory surface is the most editorial settings page in the product), and your existing C1 step 4 onboarding artifact as the visual foundation to expand from.
>
> The artifact shows the dedicated settings page at `/settings/memory` — a single screen, scrollable, max-width 720px reading column, centred.
>
> **Top of page**
> - Small chrome at very top (NOT part of the editorial document):
>   - Left: "← Back to Settings"
>   - Right: small ghost link "Export everything FirstNinety knows about me →"
>
> **The page proper** (the editorial document)
> - Eyebrow caption mute: "SETTINGS → MEMORY"
> - Fraunces H1 (balanced): *"What I remember."*
> - Below, generous whitespace, then one paragraph in body L mute, written in the Coach voice (first-person, intentionally — this is the only settings page where FirstNinety speaks in first-person): *"Everything below is what I have stored about you. You told me each of these things, and I'm keeping them only because they help me coach you well. You can edit anything. You can delete anything. Nothing here is shared with anyone else."*
>
> **Section 1 — About your role and start** (the immutable-but-editable facts)
> - Eyebrow "ABOUT YOUR ROLE AND START"
> - Below, a list of five facts rendered in Fraunces italic body L, one per line, with a subtle hover state that reveals a small "Edit" pencil icon on the right:
>   - *"You're working as a Business Analyst."*
>   - *"You started on 1 June."*
>   - *"You're working in financial services."*
>   - *"You're working in a hybrid setup."*
>   - *"Your probation review is on 24 August."*
> - Each line has a hair-thin divider in `--paper-3` between it and the next.
> - Hover state on a line: subtle 1px dashed underline appears beneath the editable phrase ("Business Analyst" / "1 June" / etc.) — signalling that the *fact* is editable, not the whole sentence. Clicking opens an inline editor (date picker for dates, dropdown for role/sector/setup).
> - Below the list, small body S mute italic: *"These shape everything I do. If something here is wrong, edit it — it'll change my missions, my Coach voice, and everything in between."*
>
> **Section 2 — What you've told me** (the user-volunteered context)
> - Eyebrow "WHAT YOU'VE TOLD ME"
> - Below, a list of items in Fraunces italic body L, one per line, with small "Edit" and "Delete" affordances on hover. Each entry has a small caption mute date stamp ("Added 14 July" or "Added Sunday"):
>   - *"You said your lead developer is hostile to BAs in general."* — Added 14 July
>   - *"You said the compliance team is your shortest path to a decision."* — Added 22 July
>   - *"You said the customer onboarding portal is your main work-stream this quarter."* — Added Sunday
>   - *"You said your manager is 'remote and busy.'"* — Added 14 July
>   - *"You said you're nervous about leading your first workshop."* — Added 6 June (this one would be obsolete after the user runs the workshop — show that the "Delete" affordance has a small body S mute next to it: *"Obsolete?"* — a gentle nudge that they can delete it)
> - Hair-thin divider between each.
> - Below the list: a small ghost button "+ Tell FirstNinety something else" — opens an inline textarea.
>
> **Section 3 — What I'll never store**
> - Eyebrow "WHAT I WILL NEVER STORE"
> - Below, three short editorial paragraphs in body L mute (NOT a bullet list):
>   - *"The real names of your colleagues, your manager, your stakeholders, or your employer. When you paste anything from work into FirstNinety, I'll prompt you to anonymise first."*
>   - *"Content from your employer's systems. I have no access to Jira, Slack, your work email, or your work calendar — and I won't ask for it."*
>   - *"Anything you ever tell me to forget. When you delete something, it's gone — from my memory, from our database, from every future conversation we have."*
>
> **Section 4 — Destructive actions** (at the very bottom)
> - Eyebrow "DESTRUCTIVE"
> - Below, two stacked options, each a small editorial row:
>   - **Delete everything I've told you** — Fraunces italic body L destructive (danger color text, no exclamation), with body S mute description below: *"Wipes Section 2 only. Your role, start date, and other immutable facts stay."*
>   - **Delete my whole FirstNinety account** — Fraunces italic body L destructive, with body S mute description: *"Erases everything. Cancels your subscription. There is no undo."*
> - Both link to confirmation modals (not built in this artifact — just show the trigger links).
>
> Design specifics:
> - **This page reads as a quiet, edited document — not as a settings form.** The whole brand discipline of FirstNinety is concentrated here.
> - First-person Coach voice ("I remember", "I'll never store", "you told me") is unique to this page — used here because the user is reading what *the AI* knows about them. Anywhere else in the product, this voice would be off-brand. Here, it earns the moment.
> - The Fraunces italic typography for every fact is **the visual signature of this page**. No other settings page in the product uses italic this densely.
> - Hover affordances are quiet: dashed underlines for editable text, tiny pencil icons on hover. Nothing shouts.
> - The "Section 3 — What I will never store" is prose, not a feature list — that's deliberate. It's a commitment, not a feature.
>
> Technical requirements: same as A1.

**Verify after generation:**
- [ ] First-person Coach voice used consistently throughout ("I remember", "I'll never store")
- [ ] Every fact rendered in Fraunces italic — the visual signature of the page
- [ ] Hover affordances reveal editing controls subtly (dashed underlines, small pencil icons)
- [ ] "What I will never store" written as prose, not bullets
- [ ] Destructive section at the bottom uses destructive colour without shouty styling
- [ ] No coral accent anywhere
- [ ] The page reads as an edited document, not a settings form
- [ ] No exclamation marks or emojis

---

### Prompt C14 — Day 90 Survival Report ★ SIGNATURE MOMENT

**Purpose:** The fifth and final signature design moment from Design Brief §10. The editorial magazine-style export at the end of the 90-day journey. The product's gift to the user.

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety Day 90 Survival Report — Signature Document." Reference Design Brief v1.0 §10 (this is the fifth and final signature design moment — make it exceptional) and PRD v1.6 §7.4 (Day 90 graduation).
>
> **Critical framing:** the Survival Report is FirstNinety's *gift to the user at the end of the 90 days*. It is not a dashboard, not a stat-sheet, not a "year in review" Spotify Wrapped. It is **a piece of editorial long-form writing** — the user's first 90 days written up as if reviewed by a thoughtful senior colleague. The reference is *a profile in a quality magazine*, not *a corporate annual report*.
>
> The artifact is a single scrolling editorial document. Light mode. Max-width 720px reading column, centred, generous vertical padding.
>
> **Top of page** (NOT part of the printable document if user exports):
> - Left: "← Back to Home"
> - Right: small ghost link "Export as PDF →"
>
> **Section 1 — Title page**
> - Eyebrow caption mute, centred: "DAY 90 — YOUR SURVIVAL REPORT"
> - Below, generous whitespace, then Fraunces H1 (balanced), centred: *"You made it."*
> - Below, Fraunces italic body L mute, centred: *"Ninety days as a Business Analyst at [a financial services firm]. This is what we noticed."*
> - Below, a thin horizontal rule in `--paper-3`
> - Below the rule, small caption mute italic, centred: *"Written by FirstNinety. Read at your own pace. Yours to keep."*
>
> **Section 2 — Opening editorial** (~3 short paragraphs)
> - Eyebrow caption mute: "WHERE YOU STARTED"
> - Three short paragraphs in body L, written in the editorial voice — *a senior colleague reviewing the user's quarter*:
>   - *"On Day 1, you opened FirstNinety and you weren't sure if you should be here. The first week's missions weren't ambitious — map your stakeholders, sit through a 1:1, decode the tools — but in the journal entry you wrote on the Friday of Week 1, you said 'I still can't tell if I'm doing this right.' That's a normal sentence to write on Day 5 of any new role, and a much harder one to write on Day 90.*
>   - *"You wrote it again in Week 3. You wrote a version of it in Week 6. You stopped writing it around Week 8 — not because the doubt went away, but because by then you had enough evidence to keep going anyway. That's most of what the first 90 days is for.*
>   - *"Here is what you actually did."*
>
> **Section 3 — What you delivered** (the evidence block)
> - Eyebrow "WHAT YOU DELIVERED"
> - Below, three short editorial paragraphs in body, each highlighting one significant delivery from the user's 90 days (drawn from completed missions, green-scored simulator runs, situation sessions). Each paragraph starts with a Fraunces italic phrase as the example title. Examples:
>   - *"The customer onboarding portal BRD. Week 5.* You shipped the BRD a day before the deadline you committed to, with full traceability matrix and a compliance section drafted to a standard that Marcus actually signed off on without revisions. Most BAs in their first quarter don't ship anything signed off without revisions."
>   - *"The scope clarification email. Week 8.* You wrote it instead of escalating, which is what a new BA usually does. The fact that the business accepted the trade-off and the sprint goal held is partly luck and partly the email being well-written. Both count."
>   - *"The compliance addendum. Week 9.* You drafted it in 48 hours. The reason the portal shipped on time wasn't that the compliance question was easy; it was that you stopped sending the original BRD around in a panic and just wrote what was needed."
>
> **Section 4 — What you learned** (the meta-reflection block)
> - Eyebrow "WHAT YOU LEARNED"
> - Below, two editorial paragraphs that *synthesise* the user's reflections and journey, not just list them. Examples:
>   - *"The most useful sentence in your weekly journals is one you started writing around Week 6: 'I should have asked sooner.' You wrote it about Marcus and compliance, you wrote it about the lead dev's actual concerns, you wrote it about your manager's expectations on the stretch project. The pattern matters. The shift from 'I should know this' to 'I should have asked' is the shift from new-BA to working-BA. You crossed it somewhere around Day 38."*
>   - *"The thing you learned about this organisation specifically is that decisions don't move through the named project hierarchy. They move through the people who hold the institutional knowledge. By Week 9 you had figured out who those people are. Most BAs in their first year never figure this out about the org they're in. You did it in nine weeks."*
>
> **Section 5 — Where you struggled** (the honest block)
> - Eyebrow "WHERE YOU STRUGGLED"
> - One editorial paragraph that names — without flattery, without softening — the things the user genuinely found hard. Example:
>   - *"Speaking up in front of senior people. Your simulator runs through Week 4 and Week 5 are clear about this — when there were two senior voices in the room, you let them dominate. You got better at it. You're not done. The next quarter has more rooms with more senior people in them, and the work is to be the third voice without apologising for being one."*
>
> **Section 6 — What's next** (the forward-looking block)
> - Eyebrow "WHAT'S NEXT"
> - Below, two short editorial paragraphs:
>   - *"Day 91 starts tomorrow. The same skills that got you through the first 90 days won't be enough for the next 90. Probation is the test of 'can you survive here.' Promotion is the test of 'should we trust you with more.' The two questions have different answers and they take different work."*
>   - *"FirstNinety's Phase 2 'Earn Your Promotion' track is the next 90 days. When it's ready, we'll send you a single email. Until then, keep what you've built, and notice when you've stopped writing 'I should have asked sooner.'"*
>
> **Section 7 — Footer** (this *is* in the PDF)
> - Thin horizontal rule in `--paper-3`
> - Below, three small caption mute italic lines, centred:
>   - *"Survival Report for [user's first name]"*
>   - *"Generated [date]. Edits not enabled — this is yours as written."*
>   - *"firstninety.com"*
>
> Design specifics:
> - **This is the most editorial document in the entire product.** Treat it as such. The user has paid $39.99/month for this for three months. This is the artefact that explains why.
> - The voice is **a thoughtful senior colleague reviewing the user's first quarter** — present-tense observations, second-person address ("you", not "the user"), no statistics dashboards.
> - **No data visualisations.** No "you completed 87% of missions" stats. No streak counts. If the Report references numbers, they're embedded in the prose ("around Day 38", "Week 5"), not in callout boxes.
> - The Report is **uneditable by the user** by design — *"this is yours as written"*. The honesty of the assessment is part of the gift. If the user wants to edit, they can copy the text out — but FirstNinety doesn't offer in-app editing the way the Probation Brief does.
> - Sections have generous spacing between them (`--space-7`).
> - The opening Fraunces H1 *"You made it."* is the single line that does most of the emotional work of the page. It's the title and it's the truth.
> - **The Report ends with a single line of forward-looking warmth, not celebration.** This is a graduation, not a victory party.
> - **No coral accent anywhere.** Pure ink-and-paper.
>
> Reference set: think *the final chapter of a memoir*, or *a long-form profile in The Atlantic*. Not *a year-in-review email*, not *a Notion dashboard*.
>
> Technical requirements: same as A1, plus a `@media print` block stripping the top chrome for clean PDF export.

**Verify after generation:**
- [ ] Reads as a single editorial document, not a dashboard
- [ ] Opening title is *"You made it."* in Fraunces H1, balanced
- [ ] No data visualisations, no statistics callouts, no streak counts
- [ ] Voice is "thoughtful senior colleague reviewing your quarter"
- [ ] Section 5 ("Where you struggled") is genuinely honest — not softened, not flattering
- [ ] Report ends with forward-looking warmth, not celebration
- [ ] No "Edit" affordances anywhere — this is uneditable by design
- [ ] No coral accent
- [ ] No exclamation marks, no emojis
- [ ] **The Report could be screenshot-shared as a single image and would make a Maya-tier user want FirstNinety** — that's the bar



## Group E — Lifecycle Completion (1 prompt)

Single prompt covering the third state of the Daily Home (Day 91+), completing the lifecycle coverage. PRD v1.8 §7.4 specifies this state.

Note: there is no C15. The numbering skip is intentional and harmless — C16 was authored as a standalone addendum after C9–C14.

---
### Prompt C16 — Daily Home Post-Day-90 State

**Purpose:** The third state of the Daily Home — what the user sees on Day 91 and beyond, when the Mission Track has concluded but the on-demand surfaces (Situation Room, Coach, Playbook, Simulator) continue indefinitely.

**The Prompt:**

> Generate a single self-contained HTML artifact titled "FirstNinety Daily Home — Post-Day-90 State." Reference Design Brief v1.0 §10 (signature moments — keep the editorial generosity that distinguishes Day 1 alive here too), PRD v1.8 §7.4 (90-Day Graduation and Day 91+), and your existing C2 artifact as the visual foundation to adapt.
>
> Critical framing: this is the third state of the Daily Home, alongside the two states already covered in C2 (Day 1 empty / Day N populated). The 90-day curriculum has concluded. The user is now using FirstNinety as a sustained on-demand workplace partner, not as a structured curriculum. **The design must communicate "the work continues, but on your terms now" — calm, mature, no sense that anything is missing.**
>
> The artifact shows two states stacked vertically, both showing the post-90 layout but at different days into the post-curriculum phase:
>
> **State 1 — Day 95 (just after graduation)** (max-width 1080px with sidebar from A2 as visual reference)
> - Top: small Eyebrow "DAY 95 — TUESDAY, 27 AUGUST" (no "WEEK N" framing — the week-curriculum has ended)
> - Below the eyebrow, **the standard week-theme banner is replaced** with a simpler editorial banner:
>   - Background: `--paper-2`
>   - 1px border in `--paper-3`
>   - 8px radius
>   - 32px internal padding
>   - Fraunces italic H3 (single line, no eyebrow above it): *"You're past your first 90 days. The work continues."*
>   - Below the line, small body S mute italic: *"Your Survival Report is always here →"* (link)
> - Below the banner, the main content area transforms:
>   - **No mission cards.** The Mission Track has ended.
>   - **The Situation Room input becomes the main surface** — larger than it was during the curriculum phase, taking up roughly two-thirds of the main column width on desktop. Use the C4-style input pattern but with these adjustments:
>     - Three soft labels above (the standard three: *I need help with this* / *Is this normal?* / *I just did something*) — the fourth probation label is hidden (probation has ended)
>     - Large input field, `--paper-2` fill, generous internal padding
>     - Placeholder: *"What's on your mind today? Anonymise as you go."*
>     - `→` icon for send / Cmd-Enter (no Submit button)
>   - On the right of the Situation Room input (desktop) or below (mobile), a small editorial card with this content:
>     - Eyebrow caption mute: "OR"
>     - Three small editorial linked rows in Fraunces italic body S, each on a separate line with hair-thin dividers:
>       - *"Open Coach →"*
>       - *"Browse Playbooks →"*
>       - *"Run a Simulator scenario →"*
> - Right sidebar on desktop only (drawn schematically per C2):
>   - **"Recent"** section (replacing C2's "Week at a glance"): three small editorial rows:
>     - Last Coach thread topic in Fraunces italic body S + caption mute date stamp
>     - Last Situation Room session summary in Fraunces italic body S + caption mute date stamp
>     - Last Simulator scenario title + outcome flag (green/yellow/red) + caption mute date stamp
>   - **"What I know"** section (same as C2's, but with content that reflects the user's full 90-day history)
>   - **"Your Survival Report"** small editorial card at the bottom: Fraunces italic single line *"Day 90 — your Survival Report"* + small caption mute italic *"Re-read whenever you need to."* + a small "Open →" link
>
> **State 2 — Day 180 (six months in)** (same shell)
> - Banner: Fraunces italic H3 (different line — rotates with day, show this one): *"Six months in. Here for whatever the day needs."*
> - Otherwise the same layout as State 1
> - The "What I know" sidebar should show that some context items are *very old* now — give one item a "Added 14 July" timestamp from 4-5 months prior. This communicates that the memory persists and ages naturally without becoming stale.
> - The "Recent" section should reflect ongoing usage — multiple Coach threads, varied Situation sessions
>
> Design specifics:
> - **No Mission Track cards.** No Week N indicator. No probation references (probation ended long ago). The chrome reflects that the structured phase is over.
> - **The Situation Room is the centre of gravity now.** During the 90-day curriculum, missions competed with the Situation Room for attention. Post-90, the Situation Room takes the foreground.
> - **The voice should be confident-mature.** "You're past your first 90 days" / "Six months in" — declarative, not celebratory, not nostalgic. The user is a working professional with this product as their tool.
> - **No "What's next?" CTA, no upsell to a Phase 2 product, no "Earn Your Promotion track coming soon" banner.** This screen needs to feel complete on its own terms. The user is not in a waiting room.
> - The "Your Survival Report is always here" link is important — it's the single thread connecting back to the 90-day journey. Once. Quietly. Not foregrounded.
> - **Whitespace remains generous.** The Day-91+ state inherits the brand's whitespace discipline from Day 1. The maturity of the layout shows in restraint, not density.
>
> Reference set: think *the home screen of a tool a senior professional has used for years* — confident, calm, useful without being didactic. Linear's app home for a long-term user. Stripe's dashboard for an experienced operator. Not a "welcome back!" banner.
>
> Technical requirements: same as A1 (Google Fonts: Fraunces, Inter; Tailwind CDN; Lucide icons; single self-contained HTML; design tokens as CSS variables).

**Verify after generation:**
- [ ] No Mission Track cards visible
- [ ] No "Week N" framing — just "Day N" in the date eyebrow
- [ ] Banner is a single Fraunces italic line, no celebratory tone
- [ ] Situation Room input is the centre of gravity, larger than during 90-day curriculum
- [ ] Fourth Situation Room label (probation) is absent
- [ ] "Your Survival Report is always here →" link is present, quietly placed
- [ ] Right sidebar shows "Recent" instead of "Week at a glance"
- [ ] No "What's next?" upsell, no "coming soon" banners, no Phase 2 teaser
- [ ] State 2 (Day 180) shows aged memory items naturally
- [ ] **The page feels complete on its own terms** — that's the bar

---

## Closing Notes

### What you have after running all 21 prompts

**All 5 signature design moments from Design Brief §10 covered:**
1. Memory introduction → C1 step 4
2. Empty Mission Track Day 1 → C2
3. Situation Room intake → C4
4. Scenario Simulator brief → C5
5. Day 90 Survival Report → C14

**A sixth surface that earned signature status:** Probation Brief → C11.

**All 6 product features covered across surfaces:**
- Situation Room → C4
- AI Coach → C7
- Scenario Simulator → C5, C6
- Playbook Library → C8
- 90-Day Mission Track → C2, C3
- Probation Prep Mode → C9, C10, C11, C12

**Marketing surfaces:** Main landing (B1), AI Engineer landing (B2), Pricing (B3).

**Design system foundations:** Reference sheet (A1), Navigation chrome (A2), Component library (A3).

**Settings & lifecycle:** Onboarding (C1), Probation Settings (C9), Memory Settings (C13), Daily Home Post-Day-90 (C16).

Twenty-one artifacts in total.

### Iteration discipline

Run the 21 prompts in order. Don't tweak as you go. After all 21 are generated:

1. Lay them out side by side (open in adjacent browser tabs, or build a tiny index page that iframes them)
2. Walk through them as if you were a Maya-tier user using the product across the full 90-day journey and beyond
3. Identify the 2–3 surfaces that feel off
4. Re-prompt only those, with sharp corrections

The temptation will be to iterate one screen for an hour. Resist — coherence comes from running the full set first.

The signature moments (C4, C5, C11, C14) have the highest bar. If any of them feels merely competent rather than excellent, the prototype hasn't done its job yet. Re-prompt those harder.

### What this prototype is and isn't

This is a **visual and editorial prototype**, not a working product. The artifacts are HTML — they look right, they communicate the design language — but the Coach doesn't actually respond, the Simulator doesn't actually roleplay, the Mission Track doesn't actually progress. That is correct for this stage.

The purpose of this prototype is to:
1. **Validate the visual identity** before the engineering build starts
2. **Pressure-test the user surfaces** against the PRD (do they communicate what the PRD says they should?)
3. **Generate screenshots** for early bootcamp partner conversations and seed investor decks
4. **Anchor the engineering brief** when moving into Claude Code build

If after running the prototype something fundamentally feels wrong, that's the time to revisit the PRD — not the build.

### What comes next

Once you've run all 21 prompts and the visual identity is validated, you're ready to move to the Build Prompts (v1.0). Those reference the MVP Spec v1.2 and will translate this design language into a real Next.js codebase, phase by phase.

---

*End of Design Prototype Prompts v2.0*
