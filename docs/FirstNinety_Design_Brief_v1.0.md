# FirstNinety — Design Brief & Visual Identity v1.0

**Version:** 1.0
**Owner:** Tokunbo Akomolede (AkomzyAi Consulting Ltd)
**Companion to:** PRD v1.6, Competitive Analysis v1.1
**Audience:** Claude (when generating design prototype artifacts); future designer; future contractor

---

## 1. Brand Stance

FirstNinety is a **premium, AI-native workplace coaching product** priced at $39.99/month. The design must read accordingly. Every visual decision is governed by the following stance:

**We are:**
- Calm-confident, not enthusiastic
- Editorial, not corporate
- Quiet, not loud
- Slightly senior, not peer-with-the-user
- Generous in whitespace, restrained in colour
- Comfortable with serifs, ink, and silence

**We are not:**
- Bubbly tech-startup (no rounded illustrations, no waving emoji, no pastel gradients)
- Corporate enterprise L&D (no stock photos of diverse smiling teams, no clipart icons)
- "Career hacker" bro (no neon, no aggressive caps, no "10X your career" copy)
- Duolingo / LinkedIn Learning consumer-edu (no gamified mascots, no streak fireworks)

The reference set: **Stripe, Linear, Lenny's Newsletter, Reforge, Notion, The Browser Company (Arc), Substack.** Not BetterUp, not LinkedIn Premium, not Coursera.

If a design decision feels generic-SaaS, it's wrong.

---

## 2. Voice & Tone

### 2.1 Brand voice (cross-product)

The voice of a *confident senior colleague who's seen you survive the bad day before*. Direct, dry, occasionally warm, never patronising. Trusts the user is intelligent. Refuses to over-explain.

Vocabulary preferences:
- "Day 6" over "your sixth day"
- "Here's what most people miss." over "Here's a tip!"
- "You handled that well." over "Great job! 🎉"
- "Worth a look." over "Check this out!"
- "This will be hard." over "Don't worry, you've got this!"

### 2.2 Surface-specific tone

| Surface | Tone | Example |
|---|---|---|
| Marketing | Editorial-confident | *"The 90 days nobody trained you for."* |
| Onboarding | Calm-direct | *"Tell us your role and where you're starting. Two minutes."* |
| Mission Track | Steady, sequential | *"Today: map your stakeholders. 15 minutes."* |
| Situation Room | Sharp, fast, useful | *"Got it. Three things you should know before that meeting:"* |
| Scenario Simulator (briefs) | Cinematic, low-drama | *"You're walking into your first workshop. Three people in the room. Thirty minutes."* |
| Scenario Simulator (debriefs) | Honest, calibrated | *"You held the room well. You also let Marcus's compliance question slip. In a real workshop that comes back."* |
| Coach | Conversational, senior | *"Ask me anything. I'll tell you what I'd actually do."* |
| Playbook | Editorial, annotated | *"A BRD for a regulatory project. Read the margins."* |
| Errors / Empty states | Dry, unfussy | *"Nothing here yet. That's fine."* |
| Pricing | Direct, anti-hype | *"$39.99/month. Cancel any time. No tiers, no upsell."* |

### 2.3 Voice rules

1. **Never use exclamation marks** in product UI. They cheapen the premium signal. Marketing headlines can use them sparingly; product UI cannot.
2. **Emojis are banned** in product UI except in three approved places: a single ✓ for completion states, → for forward navigation, and ↗ for external links. No 🎉 🚀 ✨ 💪 ever.
3. **Sentence case for everything** — buttons, headers, navigation. Title Case is reserved for the wordmark only.
4. **British/American spelling: use American.** US is the larger launch market and the dominant convention for SaaS.
5. **Numerals over words for numbers ≥ 4.** ("3 missions", but "4 missions" — not "three missions" or "four missions".)

---

## 3. Type System

### 3.1 Fonts

**Display — Fraunces** (variable, optical sizing enabled, soft contrast axis).
Used for: H1, H2, marketing headlines, role names, scenario titles, the wordmark.
Why: serif signals seriousness and editorial weight; Fraunces is contemporary enough to avoid feeling academic.
Source: Google Fonts.

**Body — Inter** (variable, optical sizing enabled).
Used for: H3 and below, body copy, UI, navigation, all data dense surfaces.
Why: it's the cleanest body face for AI/tech products and renders cleanly at every size and on every device.
Source: Google Fonts.

**Mono — Geist Mono.**
Used for: code blocks in AI Engineer playbooks, prompt examples, technical artefacts. Should appear rarely in the product UI itself — primarily in Playbook content.
Source: Vercel; free.

### 3.2 Type scale (rem-based, mobile-first)

| Level | Size (mobile) | Size (desktop) | Font | Weight | Letter-spacing |
|---|---|---|---|---|---|
| Display | 2.5rem | 4rem | Fraunces | 400 | -0.02em |
| H1 | 2rem | 3rem | Fraunces | 400 | -0.02em |
| H2 | 1.5rem | 2.25rem | Fraunces | 400 | -0.015em |
| H3 | 1.25rem | 1.5rem | Inter | 600 | -0.01em |
| H4 | 1.125rem | 1.25rem | Inter | 600 | -0.005em |
| Body L | 1.125rem | 1.25rem | Inter | 400 | 0 |
| Body | 1rem | 1.0625rem | Inter | 400 | 0 |
| Body S | 0.875rem | 0.9375rem | Inter | 400 | 0 |
| Caption | 0.75rem | 0.8125rem | Inter | 500 | 0.02em |
| Eyebrow | 0.75rem | 0.75rem | Inter | 600 | 0.08em (UPPERCASE) |

Line-heights: 1.15 for display, 1.25 for H1–H2, 1.4 for H3–H4, 1.55 for body. Tight tracking on display sizes; default tracking on body.

### 3.3 Type usage rules

1. **Fraunces is used sparingly** — for moments of weight (H1, H2, the wordmark, scenario titles, role badges). Overusing serif degrades the editorial signal.
2. **Headlines never break to a single orphan word.** Use `text-wrap: balance` (CSS) for all H1/H2.
3. **Body copy column width capped at 65 characters.** Long-form reading surfaces (Playbooks, debriefs, journal entries) hold this strictly.
4. **No all-caps except the Eyebrow style and the wordmark logotype.**

---

## 4. Colour System

### 4.1 Palette

The palette is **intentionally tight**: one paper, one ink, three greys, one accent. No secondary brand colour. No gradient as a primary surface.

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0E1116` | Primary text; dark surfaces; CTA backgrounds |
| `--paper` | `#FAF7F2` | Page background (warm bone, not white) |
| `--paper-2` | `#F2EDE4` | Elevated card surfaces on paper |
| `--paper-3` | `#E7E0D2` | Borders, dividers, muted UI |
| `--mute` | `#6F6A60` | Secondary text, captions, metadata |
| `--mute-2` | `#A29D90` | Tertiary text, disabled states |
| `--accent` | `#D9532C` | Single warm coral accent — used *sparingly* |
| `--accent-soft` | `#FBE7DE` | Accent backgrounds (banners, badges) |
| `--success` | `#3E6D52` | Completion / green-flag states only |
| `--warn` | `#A66A1F` | Yellow-flag / attention states |
| `--danger` | `#9B2C2C` | Errors, destructive actions |

**Accent discipline:** the coral appears as a small dot, underline, badge, or single button — never as a panel fill, never as a gradient, never as multiple instances on one screen. If a designer wants to use the accent twice on a screen, they should remove one of them.

### 4.2 Dark mode

Inverted, not generic. Dark mode is *part of the premium signal* — a serious product respects the user's system preference.

| Token | Light | Dark |
|---|---|---|
| `--ink` | `#0E1116` | `#F2EDE4` |
| `--paper` | `#FAF7F2` | `#0E1116` |
| `--paper-2` | `#F2EDE4` | `#191B20` |
| `--paper-3` | `#E7E0D2` | `#262830` |
| `--mute` | `#6F6A60` | `#A29D90` |
| `--accent` | `#D9532C` | `#E97552` |

Dark mode is the default for the AI Engineer role (signalling), light mode for all other roles, with user override always available.

### 4.3 Colour usage rules

1. **No pure white anywhere.** `--paper` is `#FAF7F2`. Pure white reads as cheap.
2. **No pure black anywhere.** `--ink` is `#0E1116`. Slightly warm, slightly soft.
3. **No more than one accent instance per viewport.** Strict.
4. **Status colours (success/warn/danger) are reserved for genuine status.** Never use them decoratively.

---

## 5. Layout & Spacing

### 5.1 Grid

- **Page max-width:** 1280px desktop, 96% mobile (with 16px gutters)
- **Reading surfaces max-width:** 720px (Playbooks, debriefs, long-form)
- **Card grid:** 12 columns desktop, 4 mobile, 24px gutter
- **Vertical rhythm:** based on 8px unit (`--space-1: 0.5rem`)

### 5.2 Spacing scale (`--space-N`)

| Token | rem | px |
|---|---|---|
| `--space-1` | 0.5rem | 8 |
| `--space-2` | 1rem | 16 |
| `--space-3` | 1.5rem | 24 |
| `--space-4` | 2rem | 32 |
| `--space-5` | 3rem | 48 |
| `--space-6` | 4rem | 64 |
| `--space-7` | 6rem | 96 |
| `--space-8` | 8rem | 128 |

### 5.3 Spacing rules

1. **Generous whitespace is a brand feature, not a luxury.** Default to one step up from what feels right. If a section feels too airy, it's probably right.
2. **Sections separate with `--space-6` to `--space-7`.** Never less than `--space-5` between major content blocks.
3. **Cards have `--space-4` internal padding** (32px). No tight cards.
4. **Buttons have `--space-2` vertical, `--space-3` horizontal padding** (16px / 24px). Never tight.

---

## 6. Component Vocabulary

### 6.1 Buttons

Three variants only:

- **Primary** — `--ink` background, `--paper` text, no radius (or 4px max), no shadow. Used for the one main action per screen.
- **Secondary** — transparent background, 1px `--ink` border, `--ink` text.
- **Ghost** — no border, no background, `--ink` text. Used for tertiary actions.

No "destructive" variant in primary chrome; destructive actions live behind a confirmation modal.

### 6.2 Cards

- 1px `--paper-3` border on `--paper` background
- 8px corner radius (never higher — high radius reads as consumer-app)
- No shadow on default cards; shadow `0 1px 2px rgba(14,17,22,0.04)` on elevated cards only
- 32px internal padding

### 6.3 Inputs

- 1px `--paper-3` border
- `--paper-2` fill
- 8px corner radius
- 48px minimum height (touch target)
- `--ink` text, `--mute` placeholder
- Focus ring: 2px `--ink` outline at 2px offset

### 6.4 Avatars

The product avoids generic stock avatars. Personas in the Scenario Simulator use **two-letter monograms in a circle** (Fraunces, weight 400), with each persona getting a deterministic colour from a 6-colour persona palette. Not photographic.

### 6.5 Iconography

- **Lucide icons** (already in Tokunbo's stack), 1.5px stroke, 20px default
- Icons used sparingly; navigation can be text-led without icons where space permits
- No emoji as icons. Ever.

### 6.6 Charts / data visualisation

- Minimal, single-colour where possible (`--ink` on `--paper`)
- Accent reserved for one highlighted data point
- No 3D, no gradient fills, no skeuomorphism
- Font on charts: Inter, 500 weight, 12px

---

## 7. Motion Principles

Motion in FirstNinety should feel like *settling* — not bouncing, not snapping. The brand reference is Linear's motion: fast, decisive, unfussy.

- **Default ease:** `cubic-bezier(0.32, 0.72, 0, 1)` (the Linear / Apple-ish curve)
- **Default duration:** 240ms for UI transitions; 400ms for page transitions; 80ms for hover states
- **No bounce, no overshoot.** A bouncing button cheapens the premium signal.
- **Reduce-motion is honoured.** All non-essential motion respects `prefers-reduced-motion`.

Specific surfaces:
- **Page transitions:** fade + 4px upward translate; 400ms
- **Modal open:** fade + scale from 0.98 to 1; 200ms
- **Toast / notification:** slide from top, 240ms in, 320ms out
- **Streak counter (Mission Track):** number ticks up with reduced opacity transition; *never* with a celebratory animation

---

## 8. Imagery & Illustration

### 8.1 Illustration philosophy

FirstNinety does **not use stock illustrations** (no Storyset, no unDraw, no Notion-style figures). If illustration appears, it is:

- **Editorial** (custom line art, single-colour, sparing)
- **Diagrammatic** (architecture diagrams, process maps — these are *content*, not decoration)
- **Typographic** (large-format type as image — common in our marketing surfaces)

No "person at laptop" illustrations. No "abstract gradient blob with sparkles." No mascot.

### 8.2 Photography

Photography is used sparingly and editorially:

- Black-and-white or duotone (ink + paper, no colour photography)
- Documentary, not posed (no smiling stock people)
- Used only on marketing landing and in case study content
- Always full-bleed when used; never inside a card

### 8.3 AI-generated imagery

If AI-generated imagery is used, it is:
- Single-subject
- Editorial composition
- Restricted to the marketing surface, never product UI
- Subject of a documented disclosure in our content policy

---

## 9. The Wordmark

**FirstNinety.** Set in Fraunces 600, optical size 144, with a custom adjustment: the "N" in "Ninety" is slightly elevated by 2px (a small editorial flourish that signals craft without screaming).

- **Lockup:** `FirstNinety` with no symbol, no icon.
- **Wordmark colour:** `--ink` on light surfaces, `--paper` on dark surfaces.
- **Minimum size:** 16px height.
- **Clear-space:** the height of the lowercase "i" on all sides.
- **Misuse:** never stretch, never colour beyond ink/paper, never decorate.

**Reserved variant:** for the AI Engineer track marketing surface, `FirstNinety` can lock up with a small subscript "ai" set in Inter — `FirstNinety_ai` — used only on the dedicated AI Engineer landing page.

---

## 10. Signature Design Moments

Every premium product has a few signature design moments — the surfaces that make a screenshot worth sharing. FirstNinety's are:

1. **The "What FirstNinety knows about you" memory surface.** A list of declared facts in Fraunces italic, each editable with a single tap. Honest, unusual, photographable.
2. **The Situation Room intake.** A single, large input field with three soft labels above it ("I need help with this", "Is this normal?", "I just did something") that the user can switch between. No chrome. Just the question.
3. **The Scenario Simulator brief screen.** Cinematic. Black background, large Fraunces text setting the scene in 2-3 short paragraphs. A single small button: *Begin.* The product's most editorial moment.
4. **The Day 90 Survival Report.** Long-form editorial layout — feels like reading a profile of yourself in a quality magazine. The product's gift to the user at the end of the journey.
5. **The empty Mission Track on Day 1.** Almost entirely empty — a single mission card, generous whitespace, the rest of the week visible but greyed. Says "we are not throwing 90 days at you. We are starting with today."

These five moments are **the design moments that justify the $39.99 price point.** Every other surface can be competent; these must be exceptional.

---

## 11. Accessibility

Premium positioning requires accessibility, not despite it:

- **Contrast:** all body text meets WCAG AAA against its background where feasible (AA minimum)
- **Focus rings:** always visible, never removed; 2px outline at 2px offset
- **Touch targets:** minimum 44×44px
- **Reduced motion:** all non-essential animations honour `prefers-reduced-motion`
- **Screen reader support:** ARIA labels on every interactive element, every icon-only button has a sr-only label
- **Keyboard navigation:** every surface is navigable without a pointer
- **Colour-blind safe:** status colours have icon backups (✓ ⚠ ✕) not colour alone

---

## 12. What "Premium" Means in Practice — A Checklist

Use this when reviewing any artifact prompt output. Anything that fails three or more of these should be rejected and re-prompted.

- [ ] Page uses warm `#FAF7F2` paper, not white
- [ ] Display type is Fraunces, not Inter or Geist or Clash
- [ ] Body type is Inter, not system-ui
- [ ] At most one accent instance per viewport
- [ ] No exclamation marks in product UI
- [ ] No emojis in product UI
- [ ] No "AI sparkle" icons (✨)
- [ ] No gradient backgrounds (single solid colours only)
- [ ] No rounded illustrations of people
- [ ] No shadows on cards (except elevated cards, which use one soft shadow)
- [ ] Spacing feels too generous
- [ ] Buttons have low radius (0-4px), not pill-shaped
- [ ] No three-column "feature grid" sections (overused; smells of template)
- [ ] No "trusted by" logo strips on the main marketing surface (cliché — save for proof page)
- [ ] Headlines use Fraunces and balance to no orphan words
- [ ] All caps used only for Eyebrow text, not for buttons or section labels
- [ ] No mascot, no character, no anthropomorphic AI representation

If a screen feels like it could be any SaaS product, it fails this checklist.

---

## 13. Reference Set (Visual Mood)

When generating prompts in Pass 2, the visual reference set is explicitly:

**Closest references:**
- Linear (linear.app) — for motion, density, dark mode
- Stripe (stripe.com) — for typography, editorial generosity, hover state restraint
- The Browser Company / Arc (arc.net) — for warm-cool palette tension, editorial copy
- Lenny's Newsletter (lennysnewsletter.com) — for serif-led editorial feel, trust signals
- Reforge (reforge.com) — for premium professional positioning
- Substack publication design at the magazine end — for editorial layout

**Explicitly NOT references:**
- BetterUp (too generic-corporate)
- LinkedIn Premium (too cluttered)
- Coursera / Udemy / Skillshare (too consumer-edu)
- Duolingo (too gamified-bright)
- ChatGPT.com (too utilitarian-grey)
- Any SaaS landing page using purple gradients

---

*End of Design Brief v1.0*
