# Design notes — Phase 3+ surface specs

These are the visual and copy contracts extracted from the rendered design prototypes in `docs/design-prototypes/_rendered/`. They cover surfaces that haven't been built yet — when their phase prompt lands, read this first, then the corresponding `_rendered/*.html` file, **then** the Build Prompt. Prototypes win for visuals; Build Prompts win for behaviour.

## Status legend

- ✅ **Built and prototype-aligned** — no action needed.
- ⚠️ **Built but partially aligned** — specific deltas noted.
- 🔜 **Not yet built** — phase + visual spec for when it's time.

---

## ✅ Built and aligned

| Surface | Prototype file | Implementation |
|---|---|---|
| Marketing landing | `firstninety-marketing-landing-v2-0-probation-aware-standalone.html` | `app/(marketing)/page.tsx` |
| Pricing | `firstninety-pricing-page.html` | `app/(marketing)/pricing/page.tsx` (Free vs Pro, comparison band, FAQ) |
| For AI Engineers | `firstninety-for-ai-engineers.html` | `app/(marketing)/ai-engineer/page.tsx` (dark page, hero, six conversations, what's different, pricing) |
| Memory settings | `firstninety-memory-settings.html` | `app/(app)/settings/memory/page.tsx` (editorial doc, 4 sections, lede, colophon) |
| Onboarding flow | `firstninety-onboarding-flow.html` | `app/(onboarding)/onboarding/step-1..4/` with `StepProgress` dots |
| Mission Track | `firstninety-mission-track.html` | 9-dot horizontal timeline |
| Playbook Library | `firstninety-playbook-library.html` | 3-column doc-card grid |
| Daily Home (probation banner only) | `firstninety-daily-home-probation-active-standalone.html` | `ProbationBanner` component on `/home` |
| Navigation chrome | `firstninety-navigation-chrome.html` | Sidebar + BottomNav + UserMenu |
| Wordmark + PWA icons | `_rendered/*` (every file) | `First • 90` lockup throughout |

## ⚠️ Built — known deltas

### Daily Home — right rail (Probation Active variant)

Prototype shows the right rail's first section switch from "Week N at a glance" to **"Probation at a glance"** when `probation_mode_active`, with rows:
- Review date · `23 Aug`
- Days left · `14`
- Brief generated · `Not yet`
- Mode active since · `2 Aug`

Plus the "What I know" section flags the probation entry in coral (`is-probation` class).

Current implementation keeps the standard rail. Worth adding when Prompt 3.14 lands.

### Situation Room teaser on Daily Home

When probation is active, the teaser shows a **fourth label**: "This is about my probation" in coral. The teaser also reads "One line in. Coach picks the right room." rather than the longer label set we have.

---

## 🔜 Phase 3 surfaces — not yet built

### Coach (Prompt 3.6) — `firstninety-ai-coach.html`

**Layout:** Two-line italic headline `"A second pair of eyes," / "on the things that matter."`. Thread of messages with user (right, --ink bubble) and coach (left, paper card with Fraunces italic body).

**Coach reply formatting carries three custom markers:**
- `<span class="marker do">Do</span>` — green chip prefix
- `<span class="marker do">Also do</span>` — green
- `<span class="marker avoid">Avoid</span>` — orange/red

**Inline emphasis spans:**
- `<span class="said">"…"</span>` — quoted speech in coach prose (used to surface exact words for the user to say)
- `<span class="pull">…</span>` — pull-emphasis on key phrases (heavier weight, no italic)

**Bottom context note:** `"This context is private to you. Edit it in Settings."`

**Input pattern:** large input at bottom; coach is thinking pulse uses a coral dot + "Coach is thinking" label.

### Situation Room (Prompt 3.7) — `firstninety-situation-room.html`

**Intake state:** giant Fraunces italic "What's happening?" placeholder. Three soft labels above (I need help with this / Is this normal? / I just did something). Sub-caption: `"FirstNinety will reply in seconds. Anything you type is encrypted, deletable, and never shared."`

**Active session:** prose reply, often two paragraphs. Example structure:
> Two days of requirements work doesn't get scrapped without context. Before the call, get one piece of information from him: what changed. …
>
> Then in the call, don't litigate the work. Frame it forward: *"What's the new scope, and what can we reuse from what I've done."* That keeps you in collaborator mode rather than victim mode.

**Past sessions panel:** "What you've been through." — list of past session entries with date + opening line.

**Probation variant:** when `probation_mode_active`, a fourth entry-type label appears: **"This is about my probation"** (coral).

### Simulator — Brief (Prompt 3.9) — `firstninety-simulator-brief.html`

**Eyebrow:** `"Business Analyst — Scenario"` (role-specific).
**Title:** Fraunces, big, with terminal period: `"The Hostile Lead Dev."`
**Section eyebrows:** `"In the room"` (persona cards) + `"Objective"` + `"What to watch for"`.
**Objective copy:** large body, e.g. `"Capture five requirements without losing control of the room."`
**Personas:** monogram avatar + name + role + one-line position/fear.
**CTAs:** `Begin` primary + `Skip this scenario` ghost.

### Simulator — Session + Debrief (Prompts 3.10 + 3.11) — `firstninety-simulator-session-and-debrief.html`

**Session:**
- Top progress bar with time elapsed `"SIMULATOR · 04:32 / 18:00"`.
- Chat layout: persona bubble (avatar + name + paper card) on the left; user bubble (--ink) on the right.
- Action asides on the persona name, e.g. `"Marcus Klein — suddenly looks up from his laptop"`.
- Right rail: `"LIVE FLAGS"` with green/yellow/red chips appearing as they fire.
- Caption near input: `"You can pause and resume any time. Cmd+K to exit."`

**Debrief:**
- 4-word verdict as H1: `"You held the room. Just."` (other variants: "You lost the room.", "You ran a clean meeting.").
- Numbered green flags + yellow flags as prose paragraphs (NOT bullets), each prefixed `1.` / `2.` in mono.
- "What to do next" section with three linked next-step cards.

### Probation surfaces (Prompt 3.14) — three prototypes

**`firstninety-probation.html`** — shows three sub-states for `/settings/probation`:
1. **Activation banner on Daily Home** — overlay card prompting "Want to switch on Probation Mode?" with mission preview.
2. **Settings → Probation, review date set** — H1 `"Your probation review."` + date editor + "Adjust window" + "Remove date" with confirmation modal `"Remove your probation review date? FirstNinety will stop preparing for it. You can add a new date any time from Settings → Probation."`
3. **Settings → Probation, no review date set** — empty state + "Set a date" CTA.

Currently we have a basic settings page; this is the production polish.

**`firstninety-probation-brief.html`** — shows three modes for the Brief artefact:
1. **The Brief** (read mode) — A4-shaped single page with H1 `"Where I am, 90 days in."` + `"Drafted with FirstNinety. Generated <date>. Edited <date>."` credit line + three sections.
2. **Edit mode** — same shape, inline editable.
3. **PDF export preview** — final renderable.

**`firstninety-probation-outcome-capture-standalone.html`** — runs *after* the user's actual review date:
- H1: `"How did your review go?"`
- Lede: `"There's no right answer here. We're asking so we know how to be useful next."`
- Three outcome cards: continued (green), extended (yellow), ended (red) + optional "prefer not to say".
- Each outcome opens a different long-form coach response. Examples:
  - **Continued:** `"You're on the team. The first 90 days are over and you didn't drown — that's a real thing, and worth letting yourself feel for a moment. The next quarter is different work…"`
  - **Extended:** `"Extensions usually happen because a manager wants to see one specific thing change — not because they've decided against you. Find out what that one thing is…"`
  - **Ended:** `"That is hard. There is no way to dress it up. Whatever your manager said, and whatever you're telling yourself right now, here is what is also true: you did the work of the first 90 days inside a real organisation. You learned things this quarter that nobody who hasn't been in the seat can teach you. Those things travel with you to the next role."`

### Day 90 Survival Report (Prompt 3.16) — `firstninety-day-90-survival-report.html`

**H1:** `"You made it."`
**Credit line:** `"Written by FirstNinety. Read at your own pace. Yours to keep."`
**Section eyebrow:** `"Here is what you actually did."`
**Footer:** `"Survival Report for <Name>. Generated <date>. Edits not enabled — this is yours as written."` + `firstninety.com` domain stamp.

This is a long-form editorial document (not an app surface). Should be exportable to PDF.

### Daily Home — Post-Day-90 (Prompt 3.16) — `firstninety-daily-home-post-day-90-standalone.html`

Shows two states:
- **Day 95 — five days after graduation:** banner `"You're past your first 90 days. The work continues."` + source link card `"Day 90 — your Survival Report. Re-read whenever you need to."`
- **Day 180 — six months in:** banner `"Six months in. Here for whatever the day needs."` + same source link card.

Mission Track cards are gone. Situation Room input becomes the centre of gravity. Right rail switches "Week at a glance" → "Recent" (Situation Room history + Simulator runs).

---

## Token notes from rendered CSS

The prototypes use specific values that diverge slightly from my Tailwind v4 setup. Worth aligning during a future polish pass:

- **Buttons:** prototype is `padding: 13px 22px; min-height: 44px; font-size: 15px; border-radius: 4px`. Mine: `h-12 px-3` (48px / 12px), text-body.
- **Display headline:** prototype is `clamp(48px, 6.4vw, 72px); letter-spacing: -0.02em; opsz: 144`. Mine: fixed `text-display`.
- **Card radius:** prototype consistently uses 8px (with 10px on chunky mission cards). Mine: 8px for inputs, 10px for cards. Close enough.
- **Wordmark separator dot:** prototype CSS specifies `width/height: 0.34em; transform: translateY(-0.18em); margin: 0 0.18em`. Mine renders close but slightly different vertical alignment.
- **Card padding:** prototype uses 48px for pricing cards; mine uses 24–28px. Pricing intentionally generous.

---

## How to use this file

When you start a Phase 3+ prompt:

1. Open the matching `docs/design-prototypes/_rendered/<slug>.html` in your browser — it renders the full page exactly as the designer intended.
2. Re-read the section above for the specs I extracted.
3. Then start implementing. If you find new divergences, append them here.
4. Run `pnpm prototypes:extract` whenever the source HTMLs change — it regenerates the `_rendered/` folder.
