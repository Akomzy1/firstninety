# FirstNinety — Competitive Analysis

**Version:** 1.1
**Owner:** Tokunbo Akomolede (AkomzyAi Consulting Ltd)
**Companion document to:** PRD v1.5
**Last updated:** 23 May 2026

**v1.1 update:** PRD v1.5 shifted FirstNinety to premium positioning ($39.99/mo Pro, UK+US launch, "Maya" persona as primary). This invalidates parts of the original v1.0 analysis written under the £14.99 / "Bola" assumption. The original analysis is preserved below for reference; the v1.1 strategic implications are captured in the addendum at §12.

---

## 1. Executive Summary

The career-tech market in 2026 is crowded but lopsided. Hundreds of products help users *find* a tech job — interview prep, CV builders, AI mock interviews, bootcamp placement programmes. A growing number serve *mid-career* professionals — Reforge, Maven, Section, executive coaching apps. **Almost nothing exists for the brutal transition window between those two: the first 90 days inside a new tech role.**

Bootcamps explicitly stop at job placement. AI career coaches treat "after you've been hired" as a generic personal-growth problem. Communities are slow and patchy. ChatGPT is everyone's default — but it doesn't know which week you're in, which role you're learning, or what your last simulator run revealed.

**This is the gap. It is sized in the millions of bootcamp graduates per year. It is under-served because the wedge is narrow and short-lived — which is exactly why FirstNinety's product structure (staged Mission Track, role-aware Coach, situational Simulator) is hard to copy without rebuilding the whole spine.**

FirstNinety's defensible position rests on three things competitors cannot easily replicate: **role-awareness × situation-awareness × 90-day structured progression**. Any one of these is replicable. The combination is the moat.

---

## 2. Market Map

Competitors group into four categories by the user job they solve. FirstNinety competes directly only in Category 4; Categories 1–3 are adjacent and informative.

### Category 1 — Land the Job (Upstream of FirstNinety)

Products that get users hired. They typically end the relationship at offer-acceptance.

- Joberlify (Tokunbo's own product — natural pair, not a competitor)
- Final Round AI
- LinkedIn AI Career Coach
- Himalayas AI Career Coach
- Prentus
- Interview prep apps (Pramp, Interviewing.io, etc.)

**Relevance to FirstNinety:** these products *hand off* a user with completely the wrong mindset — focused on interviewing, not on delivering. Many FirstNinety users will arrive having just graduated from one of these tools. There's a partnership/funnel opportunity, not a competitive overlap.

### Category 2 — Train Into the Role (Upstream of FirstNinety)

Bootcamps and conversion courses that produce the user.

- Quantum Analytics (BA bootcamp — Nigerian focus)
- Adaptive US (IIBA-aligned BA bootcamp)
- Fortray (BA job-guarantee bootcamp)
- Codebasics (Data Analytics bootcamp)
- Springboard, BrainStation, CareerFoundry (multi-role)
- IT Career Switch, Skills Bootcamps (UK government-funded)

**Relevance to FirstNinety:** these are the **B2B2C distribution channel**, not competitors. Fortray, for example, advertises post-placement mentorship — but only "a mentorship session" (singular) for graduates of their Job Guarantee programme. That's the gap FirstNinety fills, and it's a gap the bootcamp itself benefits from us closing.

### Category 3 — Develop Mid-Career (Downstream of FirstNinety)

Cohort-based and executive-coaching products for professionals 3+ years into their careers.

- Reforge
- Maven
- Section School
- On Deck
- Growthspace ExpertX
- Career Compass AI (early-mid career personal development)

**Relevance to FirstNinety:** these don't compete at MVP. They serve a user who has already survived their first 90 days. They become more relevant if FirstNinety later extends into a staged platform (the Survive → Settle → Stand Out architecture discussed but deferred).

### Category 4 — Survive the Job (FirstNinety's Wedge)

Products that genuinely help users do the job once they're in it. This category is sparsely populated.

- **Conquer Your Boss** (closest direct competitor — practice difficult workplace conversations)
- **Coach by CareerVillage** (broad career guidance, free, partner-distributed)
- **Generic AI assistants** (ChatGPT, Claude, Gemini — the largest indirect competitor by usage volume)
- **Workplace mentors** (informal, patchy, lottery-dependent)
- **Subreddit / Discord / Slack communities** (r/BusinessAnalysis, BA Discord servers, role-specific Slack groups)

---

## 3. Direct & Closest Competitors — Deep Dive

### 3.1 Conquer Your Boss

The closest direct competitor by *feature shape*, though not by *user wedge*.

**What they do:** An AI tool that lets users practise workplace conversations — particularly salary negotiation and difficult manager conversations — by roleplaying through scenarios. They pitch themselves as a cheaper alternative to human career coaches at $200–500 per session.

**Target user:** Mid-career professionals navigating raises, promotions, and difficult managers. Not bootcamp graduates.

**What's similar to FirstNinety:** the AI roleplay of workplace conversations is the most direct parallel to the Scenario Simulator.

**What's different:**
- They target raises and difficult bosses — a *mid-career* set of conversations
- No role-specific content (a BA's elicitation workshop is not in their library)
- No 90-day structure or progression
- No playbook library or worked examples
- No mission-track structure

**Threat level:** Medium. They could pivot toward early-career users — the underlying engine could serve our scenarios. The defence is content depth (60 role-specific scenarios at launch) and the structured spine of the Mission Track, neither of which is part of their product DNA.

**What to learn from them:** they have publicly validated that *users will pay for AI conversation practice*. That's a useful market signal for the Scenario Simulator.

### 3.2 Coach by CareerVillage

A non-profit AI career coach with significant distribution.

**What they do:** An AI-powered career coach launched in 2024, used by more than 115,000 users and 35 partnering institutions, spanning more than 120 countries and 10 languages, covering career exploration through job search and professional growth.

**Target user:** Students and young adults globally, especially first-generation and underserved.

**What's similar:** broad professional-growth coaching surface; AI coach interface; partnership-led distribution model.

**What's different:**
- Free (non-profit funding model)
- Generic across all careers — no tech-role specificity
- Career-exploration heavy, not in-role survival
- No simulator, no playbooks, no structured 90-day track

**Threat level:** Low for the paid Pro tier; significant for free-tier acquisition. Users who could use FirstNinety Free might use Coach instead because it's permanently free.

**What to learn from them:** the partnership-led distribution model (35 institutions in two years) validates the B2B2C bootcamp channel.

### 3.3 Career Compass AI

A weekly AI-coaching newsletter/app for early-career professionals.

**What they do:** An AI-powered career coach for early career professionals, delivering weekly personalized insights based on user-reported experiences, stress levels, productivity, and job satisfaction. Includes a library of actionable tips on communication, leadership, and productivity.

**Target user:** Early-career professionals broadly, not bootcamp graduates specifically.

**What's similar:** AI coach, early-career focus, weekly cadence.

**What's different:**
- No role-specific content
- Newsletter/insights format, not interactive simulator
- No 90-day structure
- Generic communication/leadership content rather than tradecraft

**Threat level:** Low. Different product shape, different value proposition.

### 3.4 LinkedIn AI Career Coach (Premium)

The 800-pound gorilla in the room.

**What they do:** LinkedIn's AI career coach helps Premium users with job-hunting tasks — assessing job fit, researching companies, shaping profiles, and preparing for interviews — by providing AI-generated insights alongside job postings.

**Target user:** LinkedIn Premium subscribers (broad professional).

**What's similar:** distribution scale could in theory swamp niche players.

**What's different:**
- Job-hunting focused, not first-90-days
- Built into LinkedIn's job-board context, not workplace context
- Generic, not role-specific
- No simulator, no playbooks, no missions

**Threat level:** Low-to-medium. LinkedIn could build something closer to FirstNinety, but their distribution incentive is to keep users on the job board, not to coach them through Week 6 of their probation. The product surface is fundamentally different.

### 3.5 Generic AI (ChatGPT, Claude, Gemini)

The actual biggest competitor by usage. Every bootcamp graduate has ChatGPT open in another tab.

**What they do:** answer questions, draft documents, simulate conversations on request.

**What's similar:** users currently use them for exactly the prep-and-debrief jobs FirstNinety's Coach handles.

**What's different:**
- No memory of role, week, prior scenarios
- No structured progression
- No role-specific framework priming
- User has to know what to ask — the blank-prompt problem
- No worked examples library
- No 90-day spine

**Threat level:** Permanent and high. The argument for FirstNinety over a free ChatGPT subscription must be made clearly in every marketing surface: "ChatGPT is a brilliant assistant but it doesn't know it's your Week 6 as a BA at a financial services firm with a hostile lead developer. FirstNinety does."

**What to learn from them:** the bar for AI quality is now *very* high. Coach interactions must feel at least as good as ChatGPT before users will accept any structured layer on top.

### 3.6 Workplace Mentors & Communities

Not products, but they consume user attention and time.

**Threat level:** Patchy and unreliable but free, and the "is this normal?" question often finds a faster answer on r/BusinessAnalysis than from any AI. FirstNinety must offer something genuinely better than "ask a stranger on Reddit" — which means *speed*, *privacy*, *role-awareness*, and *credible authority*.

---

## 4. Feature Comparison Matrix

| Feature | FirstNinety | Conquer Your Boss | Coach (CareerVillage) | LinkedIn Coach | ChatGPT | Bootcamps |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Role-aware (BA, PM, DA, etc.) | ✅ Six roles | ❌ | ❌ | ❌ | Partial (user-driven) | ✅ Single role focus |
| Situation-aware (Week-N) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Scenario Simulator | ✅ Role-specific | ✅ Generic | ❌ | ❌ | ✅ Ad-hoc | ❌ |
| AI Coach (tool-calling) | ✅ | Partial | ✅ Generic | ✅ Generic | ✅ Generic | ❌ |
| Playbook library (worked) | ✅ ~50 artefacts | ❌ | Partial | ❌ | ❌ | Templates only |
| 90-day Mission Track | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Career stage relevance | First 90 days | Mid-career | All stages | Job hunt | Any | Pre-job |
| Bootcamp partnership model | ✅ Planned | ❌ | ✅ 35 partners | ❌ | ❌ | N/A |
| Pricing | £14.99/mo Pro | $19/mo | Free | LinkedIn Premium | $20/mo | £1k–£5k course |

**The pattern:** every cell where FirstNinety has ✅ and every other column has ❌ is a candidate moat. The strongest combinations are *Situation-aware × Mission Track* and *Role-aware × Playbook library* — neither of which any direct competitor offers at all.

---

## 5. Defensible Position

FirstNinety's moat is not any one feature. It is the *combination*:

1. **Role × Stage × Situation specificity.** Each one alone is commoditised. Together they're a different product category. ChatGPT can answer a question about user stories. It cannot run a Week-6-specific user-story-elicitation simulator for a junior BA at a financial services firm.

2. **The Mission Track as the spine.** Most competitors are passive tools (open the app, ask a question). FirstNinety is a structured programme — and that structure both increases retention and makes the product harder to clone, because cloning requires not just engineering but the editorial work of designing 200+ missions across six roles.

3. **The B2B2C bootcamp distribution channel.** Once bootcamps are integrated as a referral and white-label partner, switching costs become institutional, not just user-level.

4. **The graduating-up narrative.** Even without building Stage 2+ at MVP, positioning Day 90 as graduation (not abandonment) sets up future monetisation that pure-play first-90-days competitors cannot easily replicate without a content build of their own.

5. **AI Engineer role coverage.** No competitor in any category has tradecraft content for the Junior AI Engineer role. This is a wedge inside the wedge and worth marketing aggressively — FirstNinety as *the* product for new AI engineers specifically.

---

## 6. Threats & Defences

| Threat | Probability | Severity | Defence |
|---|---|---|---|
| LinkedIn expands AI Coach into in-role coaching | Low | High | Move fast on bootcamp partnerships; deepen role-specific content beyond what a horizontal platform would invest in |
| ChatGPT/Claude add memory + role personas that match Coach | High | Medium | Differentiate on the Mission Track spine (structured curriculum, not just chat) and on situational simulator depth |
| Conquer Your Boss pivots down-market to bootcamp grads | Medium | Medium | Lock in BA, PM, Scrum Master tradecraft depth before they can produce role-specific content; race them to partnerships |
| Bootcamps build it themselves | Low | Medium | Sell to them as a partner before they build (warm pilot via founder's cousin's institute); offer better economics than internal build |
| New AI-native entrant launches in this exact wedge | Medium | Medium | Speed advantage + Joberlify cross-sell + AkomzyAi authored AI Engineer depth |
| Free product (Coach by CareerVillage) erodes paid signups | Medium | Low | Pro tier value must be obvious: unlimited simulator, role-specific depth, Mission Track structure |

---

## 7. Pricing Benchmark

| Product | Free tier | Paid entry | Paid mid | Paid top |
|---|---|---|---|---|
| FirstNinety (planned) | Yes (limited) | £14.99/mo Pro | — | Cohort £29.99/mo (Phase 2A) |
| Conquer Your Boss | Limited free | ~$19/mo | — | — |
| Coach (CareerVillage) | Free (non-profit) | — | — | — |
| LinkedIn Premium | 1-month trial | ~£30/mo Career | ~£45/mo Business | — |
| Career Compass AI | Limited free | ~$9.99/mo | — | — |
| ChatGPT Plus / Claude Pro | Limited free | $20/mo | $200/mo Pro | — |
| Bootcamps (one-off) | — | £1,000–£3,000 part-time | £5,000–£12,000 full-time | — |

**Pricing read:**
- £14.99/mo sits *below* LinkedIn Premium Career, *level with* ChatGPT Plus, and *above* Career Compass AI. That's the right band: cheaper than the horizontal incumbent, comparable to the AI tool the user is already paying for, more expensive than the budget AI coach (justified by depth).
- Free tier must be generous enough to compete with Coach by CareerVillage on accessibility, but tight enough that Pro conversion is real. The current spec (3 simulator scenarios, Week 1 of Mission Track, 10 Coach messages/week) feels approximately right but should be A/B tested in market.

---

## 8. What to Copy and What to Avoid

### Copy (proven elsewhere)

- **Conquer Your Boss's positioning frame** — "AI is a cheaper, available-24/7 alternative to a coach who charges £200/hr". Lift this framing wholesale; the market has been educated.
- **Coach by CareerVillage's partnership distribution playbook** — 35 institutional partners in two years validates the bootcamp B2B2C model.
- **LinkedIn AI Coach's job-page integration metaphor** — surfacing AI exactly where the user is doing the relevant work. Apply this to the prep-mode Coach: it should appear at the exact moment a user opens a mission, not as a separate destination.
- **Prentus's outcome-tracking dashboard for institutional partners** — the bootcamp B2B2C buyer will want completion and progression data.

### Avoid (visible mistakes)

- **Generic career advice content.** Career Compass AI's weekly insights are commodity. FirstNinety must stay role-specific or it slides into the noise.
- **Cohort overhead at MVP.** Reforge and Maven manage facilitator scheduling, no-shows, and content refresh constantly. Cohort tier was correctly deferred in PRD v1.1.
- **Bootcamp-style heavy curriculum loads.** Many bootcamps fail their students on tradecraft because they cram too much into too short a window. FirstNinety's missions must be *small* — 15–30 minutes each.
- **"Career exploration" features.** Several competitors offer "find your perfect career path." FirstNinety's user has already chosen. Adding exploration tools dilutes the wedge.
- **Promising job placement.** Some bootcamps offer money-back guarantees. FirstNinety must not promise placement outcomes — that's Joberlify's territory.

---

## 9. Go-to-Market Implications

Three GTM consequences fall out of this analysis:

**1. The market message must explicitly position FirstNinety relative to ChatGPT.** Every landing page, every ad, every onboarding screen should answer the unspoken question *"why pay you when I can use ChatGPT?"* The answer: *"ChatGPT is a brilliant assistant. It doesn't know you're a Week-6 BA at a financial services firm facing a hostile lead developer. FirstNinety does."*

**2. Bootcamps are the highest-leverage early partnership.** Coach by CareerVillage shows the model works — 35 partners, six-figure user base, two years. FirstNinety should aim for 3 pilots in the first 90 days post-launch, starting with the cousin's institute.

**3. The AI Engineer wedge should be marketed in its own right.** No competitor has any content here. A dedicated landing page, dedicated ad spend, and dedicated content (blog posts on "the tradecraft no one teaches you about being a junior AI engineer") could capture this audience with very little competitor friction.

---

## 10. Open Strategic Questions

1. **Joberlify cross-sell.** Should Joberlify graduates be auto-offered FirstNinety at offer-acceptance? Yes — but the product integration timing needs decision (PRD §15 flagged this).
2. **The Conquer Your Boss collision.** They're closest by feature shape. Do we approach them as a partner (they own mid-career, we own first 90 days) or assume they pivot down and out-execute them on speed?
3. **Free-tier generosity calibration.** Tight (high conversion, low usage) or generous (high usage, partnership credibility)? Decision needed pre-launch.
4. **Should "AI Engineer for new AI engineers" be a separate marketing surface?** The audience is differentiated enough that a focused micro-site (firstninety.ai/ai-engineer) might convert higher than the main funnel.

---

## 11. Summary — The Five-Sentence Strategic Take

1. The first-90-days-in-role market is real, large, and almost entirely unserved.
2. The closest competitor (Conquer Your Boss) targets a different career stage; the largest competitor (ChatGPT) lacks the structure and role-awareness; the biggest threat (LinkedIn) is upstream of our wedge.
3. FirstNinety's moat is the combination of role × stage × situation specificity, not any single feature.
4. Distribution leverage comes from the B2B2C bootcamp channel — already validated by Coach by CareerVillage.
5. The AI Engineer role is a winnable category sub-wedge with no current incumbent and deserves dedicated GTM attention.

---

*End of Competitive Analysis v1.0*

---

## 12. v1.1 Addendum — Strategic Shift to Premium Positioning

PRD v1.5 made four changes that affect the competitive landscape:

1. **Pro pricing moved to $39.99/month** (from £14.99/month)
2. **Geographic focus narrowed to UK + US at launch** (Nigeria, India, Philippines deferred to Phase 2C)
3. **Primary persona shifted from "Bola, bootcamp graduate" to "Maya, serious career-changer"**
4. **Cohort tier removed entirely; B2B2C model changed to institutional partnerships**

These shifts move FirstNinety from one competitive frame into another. The original analysis at §1–§11 is preserved for historical reference, but the competitive read below now governs.

### 12.1 The Competitive Frame Has Changed

At $14.99, FirstNinety competed in the "premium AI tools" band — alongside ChatGPT Plus, Claude Pro, LinkedIn Premium Career. The differentiation argument was *role-awareness + Mission Track structure + bootcamp distribution*.

At $39.99, FirstNinety competes in a different band entirely:

| Competitor band at new price | Examples | Price |
|---|---|---|
| Premium consumer career SaaS | FirstNinety, Conquer Your Boss Pro | $30–50/mo |
| Cohort-based career education | Section School, Reforge, Maven | $50–250/mo (often employer-funded) |
| Human coaching, per-session | Individual career coaches | $150–300/hr |
| Executive coaching subscriptions | BetterUp, Bravely (employer-paid) | Employer pricing |

The strongest competitors are no longer ChatGPT and LinkedIn AI Coach. They are *adjacent premium products* that share Maya's price band. The pivotal competitive question shifts from *"why pay you when I have ChatGPT?"* to *"why pay you instead of a human coach session every month?"*

### 12.2 New Competitive Read on Key Players

**ChatGPT / Claude — risk *decreases* at premium pricing.**
At $14.99, ChatGPT was the existential threat — same price band, generic but capable. At $39.99, Maya isn't comparison-shopping us against ChatGPT; she's already decided she needs more than a chatbot. ChatGPT remains a substitute for the free tier, not for Pro.

**Conquer Your Boss — risk *increases* at premium pricing.**
At ~$19/mo they were positioned below us. At $39.99, we're now *above* them, which means we need to justify the premium specifically against them. Their wedge (practising difficult conversations) sits right on top of our Simulator + Situation Room. Our defence: role-specific scenarios (they have none) + 90-day structured spine (they have none) + content depth.

**LinkedIn AI Coach — risk *unchanged.***
Different wedge (job search), different surface, different distribution. Premium pricing doesn't move LinkedIn into our path.

**Section School / Reforge / Maven — newly relevant.**
Previously dismissed as Category 3 (mid-career). At $39.99 with Maya as primary persona, *part of our addressable market overlaps theirs*. They are far more expensive ($50–250/mo, often employer-funded for cohort programmes), but they target an adjacent buyer. The argument against them: cohort-based programmes are scheduled, slow, expensive, and don't help on Day 1 of your new job. FirstNinety is on-demand from Day 1.

**BetterUp — newly relevant as the premium comparison.**
Enterprise-paid human coaching. We won't compete for the employer-paid deals at MVP, but Maya's mental model of "what coaching looks like" is often shaped by having seen BetterUp at a previous employer. Marketing should explicitly position FirstNinety as *"BetterUp-grade coaching for the moment you most need it, without waiting for your employer to fund it."*

### 12.3 The B2B2C Channel Has Changed Shape

Original analysis treated bootcamps as a high-volume distribution channel — Coach by CareerVillage's 35-partner model was cited as proof. That model no longer fits at $39.99 retail.

New B2B2C model (per PRD §8.2):
- **Smaller number of premium institutional partners** (3–5 in Year 1)
- **Flat annual fee** ($15k–$40k for 100–300 seats)
- **Premium UK/US bootcamps and conversion programmes**, not high-volume Nigerian/Indian bootcamps

Implications for the competitive read:
- Coach by CareerVillage's model is no longer a directly relevant template
- Premium UK conversion programmes (CodeFirstGirls partnerships, Multiverse, Northcoders, FDM Group's academy model) become the better template
- The Quantum Analytics / Adaptive US / Fortray segment of the original bootcamp analysis becomes Phase 2C territory, not MVP

### 12.4 The AI Engineer Sub-Wedge Still Holds (Stronger, Even)

The original §5.1 finding — that the Junior AI Engineer role has no competitor coverage — still holds, and arguably becomes more valuable at premium pricing. New AI engineers in UK/US tech firms often earn $80k–$130k from year one (significantly above the AI engineer salary in emerging markets). Maya-tier AI engineers have disposable income, professional anxiety about hallucinations and evals, and no existing product to turn to. **At $39.99, this is the highest-LTV cohort in the launch market.**

Marketing implication: the dedicated AI Engineer landing page proposed in v1.0 (firstninety.ai/ai-engineer) is now a higher-priority asset, not a side experiment.

### 12.5 New Strategic Tensions Created by the Repositioning

Three honest tensions worth naming:

1. **The "FirstNinety" name was sized for a £14.99 product.** Maya may find the name slightly youth-pitched for a $39.99 premium product. Worth A/B testing landing page conversion against a more aspirational alternative name in Phase 2A. *Don't change the name pre-launch* — but watch for the signal.

2. **Premium positioning + Joberlify cross-sell needs careful framing.** Joberlify is priced at $19.99–$39.99/mo. A user who's just bought a $39.99 Joberlify Global subscription may resist a second $39.99 subscription to FirstNinety. Consider a bundle discount for cross-sell users in Phase 2A.

3. **The "first 90 days only" frame undersells a $39.99 product.** Users paying premium prices increasingly expect long-term value, not a 90-day-and-out experience. The "graduates up into Stage 2 / Earn Your Promotion" narrative becomes more important at premium pricing — not less.

### 12.6 Updated GTM Implications

The three implications from §9 of the v1.0 analysis still hold but with adjusted emphasis:

1. **Positioning against ChatGPT is now a *free-tier* marketing message, not a Pro one.** Pro marketing should lead with the human-coaching comparison.
2. **Bootcamp partnerships are still high-leverage, but the partner profile and economics have changed.** Target premium UK/US conversion programmes, not high-volume bootcamps. Fewer, deeper partnerships.
3. **The AI Engineer wedge becomes the marketing priority asset**, not a side experiment. Dedicated landing page, dedicated content, dedicated ad spend.

---

*End of Competitive Analysis v1.1*
