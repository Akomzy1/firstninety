# FirstNinety — Product Requirements Document

**Version:** 1.8
**Owner:** Tokunbo Akomolede (AkomzyAi Consulting Ltd)
**Status:** Concept → Pre-build
**Last updated:** 23 May 2026

**Changes from v1.7 — Post-Day-90 reuse:**
- §6.0 updated: clarifies which features are time-bound vs continuing indefinitely
- §6.4 Mission Track: explicit note that this feature concludes at Day 90 by design
- §7.4 90-Day Graduation: rewritten to handle Day 91+ transition properly; Daily Home transforms rather than dies
- §11 Risks: retention-cliff mitigation rewritten with honest feature-by-feature post-90 utility audit
- §13 Phase 2A: quarterly Simulator content additions noted as ongoing content load
- §1 Executive Summary: small adjustment noting structured-curriculum vs on-demand split

*(Changelog entries from v1.0 → v1.7 retained in version history; omitted here for brevity.)*

---

## 1. Executive Summary

**FirstNinety** is an AI-native workplace support platform that helps freshly trained tech professionals survive and succeed in their first 90 days in role.

It combines two modes:

- **On-demand workplace support** — the user opens FirstNinety at 8:47am because they have a 9:15am meeting they don't know how to handle. The Situation Room and AI Coach respond in seconds, role-aware and situation-aware. **These surfaces continue indefinitely** as long as the user is subscribed — they don't expire on Day 90.
- **A 90-day structured spine** — the Mission Track gives the user an agenda, not just a toolset. Each week has 2–4 missions that compound into real competence. **This curriculum concludes at Day 90 by design.**

Bootcamps, conversion courses, and self-taught learners produce hundreds of thousands of newly certified Business Analysts, Project Managers, Data Analysts, and adjacent tech professionals every year. Almost all of them face the same brutal transition: training teaches *frameworks*; the job demands *tradecraft*. Tradecraft is tacit, situational, and almost never explicitly taught.

FirstNinety closes the gap with six tightly integrated tools — the Situation Room, an AI Coach, a Scenario Simulator, a worked-example Playbook Library, a structured 90-day Mission Track, and a time-bound Probation Prep Mode — across six launch roles: Business Analyst, Project Manager, Scrum Master, Product Owner, Data Analyst, and Junior/Associate AI Engineer.

The product sits naturally alongside Joberlify: Joberlify gets users the job, FirstNinety keeps them in it.

FirstNinety is *AI-native* but deliberately not an *agent platform*. At MVP, the AI Coach uses lightweight tool-calling; everything else is well-prompted single-call features. True multi-step agents are reserved for Phase 2 surfaces where their cost is genuinely justified by user value (see §9.5).

**Positioning:** FirstNinety is a *premium* product priced at $39.99/month, positioned for serious career-changers and bootcamp graduates who will not accept a generic AI chatbot for the most important transition of their working life. The comparison point is not ChatGPT; it is a human career coach at $200/hour. The product targets UK and US users at launch; Nigeria, India, and the Philippines arrive in Phase 2 with regionally calibrated pricing.

---

## 2. The Problem

### 2.1 The Competence Cliff

Newly trained professionals consistently report the same experience in their first role: they pass interviews, get the offer, then discover within two weeks that knowing the framework (BABOK, PMBOK, Scrum Guide, DAMA-DMBOK) tells them almost nothing about what to actually *do* when:

- A hostile project manager tries to bulldoze the requirements workshop
- A stakeholder gives a vague ask and pushes back when challenged
- Their manager says something cryptic in a 1:1 and they can't tell if it's praise or a warning shot
- They've been asked to produce a deliverable and the template alone doesn't tell them how to fill it for *this* messy real-world situation
- They sit in standup terrified of being asked something they don't know

This is **the competence cliff** — the moment certified knowledge meets uncertified reality.

### 2.2 The Three Failure Modes (First 90 Days)

Every failure mode in the first 90 days collapses into one of three patterns:

**1. The Blank-Page Moment**
"I've been asked to write a BRD / user story / status report / sprint review summary, and I don't know where to start." Training showed them an empty template. Nobody showed them how to fill it for a messy, ambiguous, real-world stakeholder.

**2. The Live-Fire Moment**
"I'm walking into a meeting / workshop / standup / 1:1 and I don't know how to behave." Soft skills, politics, language, body language, when to push back, when to stay quiet. The tacit knowledge senior colleagues absorb over years by osmosis.

**3. The "Is This Normal?" Moment**
Imposter syndrome amplified by isolation. "My manager said X — am I being managed out, or is this normal?" "My PM is ignoring my emails — is this rude or expected?" No trusted peer to sanity-check with.

### 2.3 Why Existing Solutions Fail

| Solution | Why it fails the first 90 days |
|---|---|
| Bootcamps & conversion courses | Drop students at graduation. No post-employment support. Their incentive is intake, not retention. |
| LinkedIn Learning / Coursera | More frameworks. More blank pages. Reinforces theory, doesn't bridge to practice. |
| Human coaches | £80–£200/hr. Scheduled, not on-demand. Generic to role, not to situation. |
| Reddit / Slack / Discord communities | Slow, anonymous, patchy quality. Often confidently wrong. Bad for sensitive workplace questions. |
| ChatGPT / generic AI | Not role-aware. Not situation-aware. No structured progression. Vanishes the moment the conversation ends. |
| Mentors at work | Lottery. Many new hires have none. Many managers are too busy or under-skilled to mentor well. |

There is no existing product purpose-built for the first 90 days. That is the gap.

---

## 3. Vision & Positioning

### 3.1 Vision Statement

> *Every newly trained tech professional should have a senior colleague in their pocket — patient, available 24/7, and steeped in the specific craft of their role.*

### 3.2 Positioning

**For** newly trained tech professionals (BA, PM, Scrum Master, PO, Data Analyst, AI Engineer)
**Who** are entering their first role and lack the tacit knowledge that training doesn't teach
**FirstNinety is** an AI-native first-90-days coaching platform
**That** combines situational simulation, just-in-time AI coaching, worked-example playbooks, and a structured 90-day mission track
**Unlike** bootcamps, generic AI chat, or scheduled human coaches
**FirstNinety** is role-aware, situation-aware, always-on, and specifically scoped to the survival window where most first-job failures happen.

### 3.3 Tagline Options

- *Survive your first 90 days.*
- *Training got you in. We help you stay in.*
- *The 90 days nobody trained you for.*

(Selection to be finalised pre-launch.)

---

## 4. Target Users

At a $39.99/month price point, the primary persona shifts from "anyone fresh out of a bootcamp" to "the serious career-changer or graduate who treats their first 90 days as a high-stakes investment, not a cheap upgrade." Bootcamp graduates remain a substantial secondary persona, but they are no longer the headline buyer at MVP.

### 4.1 Primary Persona — "Maya, The Serious Career-Changer"

- 28–42, often mid-career with prior professional experience (banking ops, NHS admin, consulting, teaching, marketing)
- Completed a structured conversion course (Skills Bootcamp, CareerFoundry, Springboard, university PGCert) or self-directed reskilling in the last 6–12 months
- Just landed first tech-adjacent role; salary £45k–£60k (UK) or $70k–$100k (US)
- Treats career transition as a multi-£1,000+ investment already (course fees, prep tools, exam fees)
- Will expense FirstNinety where possible; pays personally where not
- Considers human coaches ($200/hr) and turns to FirstNinety as the affordable alternative — not the other way round
- Will pay £30–£50/month for *premium* coaching tools; resists generic AI chatbots
- Active on LinkedIn, frequent Medium readers, follows specific role thought leaders

### 4.2 Secondary Persona — "Bola, The Bootcamp Graduate"

- 25–34, completed a 12-week bootcamp or conversion course in the last 6 months
- Just landed first role at a corporate, consultancy, or scale-up
- Background often non-tech: teaching, retail, banking ops, NHS admin
- Salary: £30k–£45k (UK), $50k–$80k (US)
- Highly motivated, terrified of being "found out"
- Price-sensitive — $39.99 is a stretch; may use free tier extensively before committing
- Strong long-term LTV if converted

**Note:** Bola was the primary persona in pre-v1.5 PRDs. The repositioning to premium pricing moves Bola to secondary; the product still serves Bola, but the marketing message leads with Maya.

### 4.3 Tertiary Persona — "Internal Mover"

- Existing employee at a company, moved into a tech-adjacent role internally
- Has organisational context but not role-specific tradecraft
- Often employer-funded; strong candidate for B2B sales (employer pays)

### 4.4 Geographic Focus (MVP)

At a $39.99/month price point, MVP launch focuses on markets with the disposable income to support premium SaaS:

1. **United Kingdom** — primary launch market
2. **United States** — primary launch market (larger volume, higher willingness to pay)
3. **Canada, Australia, Ireland, New Zealand** — included naturally via English-language launch; no localisation needed

**Deferred to Phase 2C with regional pricing:**

- **Nigeria** — needs regional pricing of ~₦15,000–25,000/month (~$10–17) to be viable; deferred until volume justifies operational overhead of Paystack integration and Naira billing
- **India** — needs ~₹999–1,499/month (~$12–18) pricing; deferred until volume justifies Razorpay integration
- **Philippines** — strong BPO-to-tech pipeline; deferred to Phase 2C

This is a meaningful narrowing from pre-v1.5 PRDs. The trade-off is accepted: smaller MVP TAM, higher ARPU, cleaner unit economics. Emerging markets re-enter the roadmap in Phase 2C with regional pricing once the UK/US launch has validated unit economics.

---

## 5. Roles Covered (MVP)

Six launch roles. Each role has its own simulator scenarios, playbook content, mission track, and coach priming. The underlying engine is shared (~60–70% of code/content); the role surface is differentiated (~30–40%).

| Role | Why included | Tradecraft depth at launch |
|---|---|---|
| Business Analyst | Highest bootcamp graduate volume; founder's own deep expertise; pairs cleanly with Joberlify | Lighthouse role — full depth |
| Project Manager | Second-largest bootcamp pipeline; PMP/Prince2/Agile conversion courses dominate | Full depth |
| Scrum Master | High-volume bootcamp output; well-defined tradecraft makes content authorable | Full depth |
| Product Owner | Closely adjacent to BA; shares ~50% of scenarios; cheap to add | Adjacent depth via BA shared content |
| Data Analyst | Booming bootcamp category; SQL + dashboard + stakeholder tradecraft | Full depth |
| Junior/Associate AI Engineer | Fastest-growing bootcamp category; least documented tradecraft anywhere; founder's wheelhouse | Original-authored depth, signals product currency |

**Held for Phase 2:** QA Engineer, DevOps Engineer, UX/UI Designer, Cybersecurity Analyst, Solutions Architect, Junior Developer (frontend/backend).

### 5.0 Content Depth Commitment at Premium Pricing

At $39.99/month, weak content in any role becomes a churn driver. The pre-v1.5 approach of "BA at full depth, other 5 roles at 60-70% depth with an 'expanding weekly' badge" is no longer acceptable. The new commitment:

- **All six roles launch at full depth** — 8-12 simulator scenarios, ~8-10 playbooks with worked examples, full 90-day Mission Track per role
- This *delays MVP launch* by an estimated 6-10 weeks vs the v1.4 timeline, with content production becoming the critical path
- Mitigation: lean on AkomzyAi consulting practitioners (and external paid practitioners where needed) to author content faster
- No role launches with a "thin" label; if a role isn't ready, it doesn't ship

This is a deliberate trade — slower launch in exchange for premium-grade content matching premium-grade pricing.

### 5.1 The AI Engineer Role — Special Note

Junior/Associate AI Engineer is intentionally included despite being the role with the least settled tradecraft. Three reasons:

1. **Market signal** — bootcamps are spinning up AI Engineer tracks faster than any other category in 2025–2026. The demand exists; the post-hire support doesn't.
2. **Differentiation** — no competitor product covers this role's tradecraft at all. FirstNinety can own the category.
3. **Founder expertise** — AkomzyAi Consulting is built on exactly this stack (LLM APIs, RAG, agent frameworks, eval design, prompt engineering, AI governance). The playbook content can be authored at depth without external sourcing.

The role-specific tradecraft for AI Engineers diverges from traditional dev in important ways:
- Working with non-deterministic systems
- Evaluation design and golden datasets
- Cost optimisation (token economics)
- Stakeholder education on what LLMs can and can't do
- Hallucination management and guardrails
- Prompt versioning and prompt regression
- Vector DB / RAG architectural decisions
- Working with agent frameworks (LangGraph, CrewAI, MCP)

These are the playbook subjects, and they are largely original IP at launch.

---

## 6. Core Features (MVP)

Six features. No more.

### 6.0 The Two Modes (plus a time-bound third)

FirstNinety operates in two modes that share data and AI but are surfaced as distinct user journeys:

- **Pull mode (on-demand)** — user opens FirstNinety because they need help *right now*. The Situation Room and AI Coach are the surfaces here. This is the daily-relevance engine. **Continues indefinitely** for as long as the user is subscribed — these surfaces are not time-bound to the 90 days.
- **Push mode (programmatic, time-bound)** — FirstNinety tells the user what to do this week. The Mission Track is the surface here. This is the long-arc retention engine for the first 90 days. **Concludes at Day 90 by design.**

The Simulator and Playbook Library are shared infrastructure — both modes route into them, and both continue beyond Day 90 as on-demand surfaces.

**A time-bound third mode — Probation Prep Mode (§6.6) — overlays the other two for the final 21 days before the user's probation review.** It does not replace pull or push; it sharpens both around the single highest-stakes moment of the first 90 days. Active by default in the final 21 days, user-overrideable for shorter or longer probations, and includes an optional outcome capture after the review.

#### What survives Day 90

After Day 90, the product transforms from a structured curriculum into a sustained on-demand workplace partner. Specifically:

- **Situation Room** continues — the user's day-to-day workplace moments don't expire when the curriculum does. Arguably *more* valuable over time as Situation history accumulates.
- **AI Coach** continues — with a small system-prompt adjustment recognising the user is now past their first 90 days at this organisation.
- **Playbook Library** continues — these are permanent professional reference materials, useful for the user's entire career.
- **Scenario Simulator** continues — though the authored scenario library can deplete; mitigated by (i) re-running scenarios with different muscle memory, (ii) Quick Simulator generating ad-hoc scenarios from Situation Room context, and (iii) quarterly authored scenario additions (Phase 2A content commitment).
- **Mission Track** concludes — 90-day curriculum by definition.
- **Probation Prep Mode** auto-deactivates on review date — temporary by design.

The Daily Home transforms accordingly (§7.4) — the curriculum surface gives way to an on-demand-focused layout once the Mission Track concludes.

### 6.1 Scenario Simulator (the differentiator)

**AI pattern:** *Feature* — multi-turn conversational loop with a role-defined system prompt and objective rubric. Not agentic; the model roleplays personas but does not plan, call tools, or self-direct.

An AI-powered roleplay environment where users practise live-fire interactions before they happen in real life.

**How it works:**
1. User selects a scenario (or one is recommended by their Mission Track)
2. Scenario brief sets the context (e.g., *"You're facilitating your first requirements workshop. Stakeholders: a dismissive senior dev, a vague business sponsor, a silent compliance officer. Objective: capture the top 5 requirements for the new portal."*)
3. AI roleplays multiple personas in real-time conversational turns
4. User responds in natural language (typed; voice in Phase 2)
5. AI ends scenario when objective met, user stalls, or natural conclusion reached
6. Debrief: what went well, what to try differently, what frameworks applied, optional rerun

**Scenarios at launch (per role):**
- BA: requirements workshop, stakeholder pushback, ambiguity clarification, scope creep conversation, "this isn't testable" challenge from QA
- PM: scope creep negotiation, missed deadline conversation with sponsor, risk register walkthrough, escalation conversation, status update to skeptical exec
- Scrum Master: facilitating a tense retro, dealing with a dominant team member, sprint goal negotiation, removing impediment from a defensive ops team, coaching a resistant PO
- Product Owner: prioritising with conflicting stakeholders, defending a "no" decision, refining a vague feature request, sprint review when the demo breaks
- Data Analyst: stakeholder asks for a "quick number," requirements clarification on a vague dashboard ask, defending a counter-intuitive finding, dealing with bad data politely
- AI Engineer: explaining hallucinations to a non-technical stakeholder, justifying eval-driven development to a sceptical PM, scoping a RAG vs fine-tune decision, cost conversation with finance, "why isn't this 100% accurate" pushback

**Target: 8–12 scenarios per role at launch (~60 total).**

### 6.2 AI Coach (the conversational layer)

**AI pattern:** *Lightly agentic* — single-response Claude call with tool-calling. Max 3 tool calls per response; strict tool schemas; full tracing from day one. **This is the only agentic surface at MVP.**

The Coach is the shared conversational engine that powers the Situation Room and Simulator debriefs. It is not a separate destination — it is the underlying layer.

The Coach is:
- Role-aware (primed with the user's role-specific frameworks, vocabulary, and patterns)
- Situation-aware (knows the user's week in the Mission Track, recent Simulator runs, and Situation Room history)
- Tool-enabled (can retrieve Mission Track state, Playbook references, prior simulator transcripts)
- Trained to *redirect to* a Playbook artefact, Simulator scenario, or Mission Track item when that better serves the user than a generated answer

**What makes it different from generic ChatGPT:**
- Primed with role-specific frameworks, vocabulary, and patterns
- Aware of the user's Mission Track progress
- Aware of recent simulator runs and where the user struggled
- Persistent conversation history per topic/situation
- Refuses to slide into generic life-advice mode — stays scoped to professional tradecraft

### 6.3 Playbook Library (the safety net)

**AI pattern:** *None at retrieval.* Pure content store. Optional single-call feature: "explain this section like I'm a beginner" generates an inline explanation. No agent surface.

Worked examples, not empty templates.

**Structure:**
Every playbook is a real-world artefact (BRD, user story, sprint backlog, dashboard spec, RAID log, status report, retro agenda, eval rubric) with:
- The empty template (downloadable)
- 2–3 *worked* versions from realistic messy scenarios
- Annotations explaining every section choice
- Common mistakes flagged
- Variant patterns (e.g., BRD for regulatory project vs greenfield product)

**Library at launch (per role):**
- BA: BRD, user stories, process maps, stakeholder map, RAID log, gap analysis, traceability matrix (~10 artefacts)
- PM: project plan, RAID register, status report, business case, lessons learned, stakeholder comms plan (~8 artefacts)
- Scrum Master: sprint goal, retro formats, ceremony agendas, impediment log, team charter, velocity report (~8 artefacts)
- Product Owner: user story format, acceptance criteria patterns, sprint goal, release plan, backlog refinement notes (~7 artefacts)
- Data Analyst: requirements doc for dashboards, SQL query patterns, data quality report, stakeholder summary, A/B test plan (~8 artefacts)
- AI Engineer: eval rubric, prompt versioning doc, RAG architecture decision record, cost analysis template, model card, hallucination test plan (~8 artefacts)

**Target: ~50 artefacts at launch, each with 2–3 worked examples (~125 worked examples total).**

### 6.4 90-Day Mission Track (the spine)

**AI pattern:** *None in the orchestration.* The Mission Track is a deterministic state machine over DB rows (missions, prerequisites, completions). Individual missions route the user into the Simulator or Coach, which carry their own AI patterns. At MVP, mission ordering is fixed per role; adaptive personalisation arrives in Phase 2B (see §13).

A structured day-by-day, week-by-week programme that gives the product a backbone. Without this, FirstNinety is a passive toolset; with it, FirstNinety is a coach with an agenda.

**Structure:**
- 13 weeks (~90 days)
- Each week: 2–4 missions
- Each mission: prep material → simulator session OR playbook drill → debrief journal entry
- Streak tracking (gentle, not gamified-aggressive)
- Weekly reflection prompt

**Sample weeks (BA track):**
- Week 1: *Land softly.* Mission 1: Map your stakeholders. Mission 2: First 1:1 with your manager. Mission 3: Decode your team's tools and rituals.
- Week 2: *Find your feet.* Mission 1: Shadow a meeting and capture observations. Mission 2: Draft your first internal status update. Mission 3: Practise the "I don't know yet, but I'll find out by X" conversation.
- Week 6: *Lead from the front.* Mission 1: Facilitate a requirements workshop. Mission 2: Negotiate a scope clarification. Mission 3: Write your first BRD section to be reviewed.
- Week 12: *Earn your stay.* Mission 1: Prep your end-of-probation review. Mission 2: Identify 3 wins and 3 areas to grow. Mission 3: Sketch your next 90 days.

Each role has its own track. ~30–40 missions per role. Total: ~200 missions across MVP.

**Time-bound by design.** The Mission Track is a 13-week (~90-day) curriculum with a defined endpoint. At Day 90, the curriculum concludes. The user does not see "Week 14" or empty mission cards. Instead, the Daily Home transforms (per §7.4) into a layout focused on the on-demand surfaces (Situation Room, Coach, Playbook, Simulator) that continue indefinitely. This is the only feature among the six that intentionally concludes — the others continue as long as the user is subscribed.

### 6.5 Situation Room (the on-demand lane)

**AI pattern:** *Feature backed by lightly agentic Coach.* The Situation Room is a dedicated surface; the underlying AI call is the same Coach engine with extra context (user history of situations) and three structured entry templates. No multi-step planning at MVP; that arrives in Phase 2A as the Real-Situation Triage Agent (see §13).

The Situation Room is the answer to *"I need help with something real and I need it now."* It is a peer feature to the Simulator, Coach, Playbooks, and Mission Track — not buried inside any of them. It is expected to be the most-used feature by daily active users.

**Why this is a first-class feature:**

The Mission Track gives users a 90-day agenda. But on any given day, the actual reason a user opens FirstNinety is usually not "what's mission 14 today?" It is "my manager just sent me a confusing message" or "I have a workshop in an hour and I'm panicking." If the product fails to answer that question in seconds, the user goes back to ChatGPT — and we lose.

**Three entry points** — each mapped to one of the three failure modes in §2.2:

#### 6.5.1 *"I need help with something specific right now"* (Blank-Page / Live-Fire prep)

User describes the situation in plain language. The Situation Room:

1. Asks 2–3 sharp clarifying questions (role, urgency, what they've already tried, who's involved)
2. Searches the Playbook Library for relevant artefacts and patterns
3. Pulls relevant frameworks for the user's role and current week
4. Offers three response paths:
   - **Prep brief** — read-only structured summary (fastest path)
   - **Roleplay it now** — drops the user into a Simulator session pre-loaded with their context
   - **Talk it through** — Coach-style conversational back-and-forth
5. Logs the situation to the user's personal history so future situations can reference it

**Sub-30-second turnaround** on the first useful response is the bar. If users can't get value faster than typing the same thing into ChatGPT, the feature fails its mandate.

#### 6.5.2 *"Is this normal?"* (Imposter-syndrome triage)

User describes something that happened. The Situation Room:

1. Validates honestly first — neither catastrophising nor falsely reassuring
2. Frames the situation: "This is normal *if* X, and a yellow flag *if* Y"
3. Offers 2–3 plausible interpretations with a quick way to test each
4. Suggests next moves proportionate to the interpretation
5. Avoids the lazy AI failure modes of either panic-amplification or empty reassurance

#### 6.5.3 *"I just did something and I don't know how it went"* (Debrief)

User dumps what happened. The Situation Room:

1. Identifies green flags and yellow flags in the user's account
2. Suggests follow-up actions with timing
3. Logs the event so the Mission Track can adapt later (Phase 2B) and so future Situation Room sessions have context
4. Offers to roleplay the follow-up if a next interaction is expected

**Cross-cutting design principles:**

- **Speed is a feature.** The Situation Room prioritises latency over completeness. A 70%-helpful answer in 5 seconds beats a 95%-helpful answer in 45 seconds.
- **Honesty over flattery.** The Coach is tuned not to reflexively validate. If the user's described approach is risky, the Coach says so.
- **Logged but private.** Situation Room transcripts are encrypted at rest, accessible only to the user, and deletable in one tap. They are *not* used as training data.
- **Safety guardrails (see §9.4):** the Situation Room does not offer employment law advice, mental health diagnosis, or judgements about individual named colleagues. Defined referral pathways for crisis, harassment, or discrimination topics.
- **No employer / colleague identification capture.** Users prompted to anonymise as they go ("call them 'my lead dev' rather than their real name").

**Situation Room as the marketing wedge against ChatGPT:**

This is the feature that most directly answers *"why pay for FirstNinety when I have ChatGPT?"* ChatGPT does not know you are a Week-6 BA at a financial services firm with a hostile lead developer. FirstNinety does — and crucially, *the Situation Room is the surface where that role + situation awareness becomes immediately visible* to the user. Every marketing surface should lead with a Situation Room example.

### 6.6 Probation Prep Mode (the time-bound surface)

**AI pattern:** *Feature, backed by the lightly agentic Coach.* The Coach gains a fourth tool (`get_probation_evidence`) when Probation Mode is active. No new agentic surface; the same Coach engine with state-aware framing.

Probation Prep Mode is the single highest-stakes moment in the user's first 90 days. Everything else in the journey is rehearsal. The probation review is the exam — the outcome determines whether the job continues. Probation Mode is the time-bound layer that sharpens the existing surfaces around this moment.

#### Why this is a first-class feature

Three reasons it earns its own surface rather than being a content theme inside Week 12:

1. **It's what users will pay $39.99/month for.** "FirstNinety helps you pass your probation review" is a sharper sentence than "FirstNinety helps you survive your first 90 days." Probation has a clear date, a clear binary outcome, and a clear emotional weight. It's the kind of pain point that converts.
2. **It produces a tangible artefact.** A printable one-page Probation Brief that the user can bring to the review is a deliverable a content-only product can't match.
3. **It creates a measurable B2B2C outcome.** Probation pass rate is something an institutional bootcamp partner cares about and can be marketed to.

#### Activation

Probation Prep Mode is opt-in but proactively prompted. The activation flow:

- **At onboarding (step 3),** the user is asked optionally: *"When is your probation review, if you know?"* — date input or *"I don't have one"* / *"I don't know yet."* If provided, the date is stored in `user_context.probation_review_date`.
- **On Day 70 (or 21 days before review date if user provided one),** the user receives a prompt via push notification and Daily Home banner: *"Your probation review is in 21 days. Want to switch on Probation Mode?"*
- **Manual override** is always available in Settings: the user can activate Probation Mode at any time, set or change the review date, or extend the window for longer probations (some industries run 6-month probations).
- **Default window:** 21 days before review date. **Min window:** 7 days. **Max window:** 90 days (for industries with extended probations).
- The mode automatically deactivates on the date of the user's review and prompts for outcome capture.

#### What changes when Probation Mode is active

The user's existing five surfaces gain Probation-specific behaviour without becoming new screens:

**Daily Home gets a Probation banner.** Replaces the standard week-theme banner at the top: Eyebrow "PROBATION — 14 DAYS TO REVIEW" with a Fraunces italic line: *"This week: gather your evidence. Don't over-prepare."*

**Mission Track inserts probation-specific missions** ahead of normal missions for the final 21 days. Examples (per role):
- "Book your pre-review 1:1 with your manager"
- "Write your self-assessment (one page, three columns)"
- "Assemble your evidence portfolio"
- "Rehearse the review conversation"
- "Pre-empt your one weakness"

**Situation Room gains a fourth entry type: "This is about my probation."** Routes to a Coach prompt primed for probation-specific reasoning (different from general "is this normal?" — this is "is my anxiety about this proportionate?").

**Coach gains the `get_probation_evidence` tool.** When called, it returns a structured summary of the user's completed missions, scenario runs (especially those scored green), situation sessions, and journal reflections from the past 90 days — material the user can draw on to build their self-assessment.

**Playbook Library surfaces a Probation Prep Pack** — a single playbook composed of:
- The Self-Assessment template (one-pager, three columns: delivered / learned / want next)
- The Pre-Review 1:1 Agenda template
- The Evidence Portfolio template
- The Probation Review Conversation playbook (worked example of a probation-day conversation, annotated)

**Scenario Simulator adds one probation-specific scenario per role:** "The Probation Review." The scenario is the actual probation conversation, with the user's manager played by the AI. Available only when Probation Mode is active. Generates a debrief calibrated to "are you ready?" not "did you win the workshop?"

**Marketing surface and email:** the Sunday recap during Probation Mode foregrounds probation prep rather than week themes. Push notifications are calibrated to be gentle, not panic-inducing.

#### The Probation Brief artefact

Three days before the review date, the user can generate a **one-page printable Probation Brief.** It's produced by a dedicated Coach call (Opus, no streaming, full document generation in one pass) that uses the `get_probation_evidence` tool to assemble:

- **Top half:** the user's self-assessment in three columns (one paragraph each) — what you delivered, what you learned, what you want next
- **Bottom half:** the user's three best concrete examples (one short paragraph each) drawn from completed missions and green-scored simulator runs, anonymised
- **Footer:** three questions the user should ask their manager during the review

Exportable as PDF. Editable in-app before export. **Stored as JSONB in `probation_artefacts` for future reference.**

#### Outcome capture

After the review date passes (or when the user manually marks it complete), the user is prompted gently:

*"How did your review go?"*

Three options, deliberately framed without value judgement:
- *Continued — I'm staying* (the success case, but framed as continuation not victory)
- *Extended — we're checking in again* (the not-yet case, common and rarely catastrophic)
- *Ended — I'm moving on* (the failure case, framed as user-led not company-led where possible)
- *Prefer not to say* (always present)

Outcome captured in `user_context.probation_outcome` and a follow-up Coach session is offered automatically regardless of outcome — the senior-colleague voice changes based on outcome but never abandons the user.

#### Voice during Probation Mode

The Coach voice during Probation Mode has one critical adjustment: **honest counterweight against over-preparation.** A user obsessing over their probation for 3 weeks isn't necessarily healthy. The Coach is trained to occasionally surface lines like:

*"You've prepared. You're ready. The work you did this quarter is more valuable than the document you bring to the review."*
*"Most probation reviews are decided weeks before the review. The conversation just confirms what your manager already thinks."*
*"You're spending more time on this than your manager will. That's normal but worth knowing."*

This counterweight is captured in `content/coach-prompts/probation-voice.md`.

#### Premium signal

Probation Mode is **the surface that justifies the $39.99/month price most directly.** A bootcamp graduate who paid $39.99 for three months will have spent $120. If FirstNinety helped them pass their probation, that's a 10× ROI on their first quarter of paid employment. This is the marketing wedge — *"the difference between losing your first tech job and keeping it costs less than one human coaching session."*

---

## 7. User Journey

### 7.1 Onboarding (≤ 5 minutes)

1. Sign up (email or Google)
2. Select primary role (1 of 6)
3. Optional secondary role (Pro only)
4. Quick context: when did you start / when do you start? what type of company? remote/hybrid/office? have you got a manager assigned?
5. Auto-anchor Mission Track Day 1
6. First micro-win: 1 simulator scenario or 1 playbook walkthrough recommended immediately

### 7.2 Daily Loop

- **Morning prompt** (PWA push notification or email, opt-in): *"Today's mission: [X]. Estimated time: 15 min. Ready?"* Push is the primary delivery; email is the fallback for users who haven't enabled notifications.
- **On-demand use (the highest-frequency loop):** user opens FirstNinety because something is happening *now* → enters the Situation Room → gets a prep brief, roleplays, or talks it through → returns later to debrief
- **Programmatic use:** user opens FirstNinety because today's mission is queued → completes the mission → journals briefly
- **Evening reflection** (optional): 60-second journal prompt

### 7.3 Weekly Loop

- **Sunday recap email**: missions completed, simulator runs, where you stalled, what's next
- **Sunday "what's coming up?" prompt**: a one-line input — *"What's on your mind this week? Any upcoming meetings, deliverables, or conversations you're thinking about?"* — two sentences from the user. Stored in `user_responsibilities`; used by the Coach and Situation Room next week to make proactive suggestions ("you mentioned a UAT session — want me to prep you for it?"). This is the primary mechanism for keeping the system's knowledge of the user's real-world responsibilities current, without ever touching employer systems (§9.6).

### 7.4 90-Day Graduation (and Day 91+)

At Day 90, the structured 90-day curriculum concludes. The user receives:

1. **The Day 90 Survival Report** (signature design moment, §6.0 and Design Brief §10) — an editorial long-form document reviewing the user's quarter as a thoughtful senior colleague would. Private to the user, exportable as PDF, persistent in their account.

2. **A transformed Daily Home** — starting Day 91, the Daily Home no longer shows Mission Track cards (the curriculum is over). Instead:
   - Banner: Eyebrow "DAY 95 — TUESDAY, 27 AUGUST" (no longer "WEEK N — DAY N" since the week-curriculum has ended)
   - Fraunces italic H3: a single rotating editorial line, e.g. *"You're past your first 90 days. The work continues."*
   - Below: **no Mission Track cards.** The Situation Room input becomes the main surface — larger, more prominent than during the 90-day curriculum
   - Right sidebar (desktop): "Recent" — last 3 Coach threads, last 2 Situation Room sessions, last Simulator run
   - A small editorial card lower on the page: *"Your Survival Report is always here →"* linking back to the user's Day 90 Survival Report

3. **The Coach adjusts its priming** — system prompt context updates from "you're coaching a [role] in week [N] of their first 90 days" to "you're coaching a [role] who completed their first 90 days at this organisation on [date]. They are now [N] weeks into the role beyond probation." The Coach's voice and behaviour rules stay the same; only the situational context updates.

4. **The other on-demand surfaces continue unchanged** — Situation Room, Playbook Library, Scenario Simulator. The user can keep using them indefinitely.

This is FirstNinety's honest answer to "what happens after Day 90." Four of the six features continue as a sustained on-demand workplace partner. The Mission Track has done its job and ends. The Survival Report is the closing editorial gesture.

The Phase 2 "Earn Your Promotion" track (§13) will eventually add structured curriculum back for Days 91+, but that is post-MVP. At launch, the on-demand surfaces carry the user past Day 90; the curriculum doesn't get replaced, it gets *concluded*.

### 7.5 Probation Mode Flow

The probation flow runs as a parallel time-bound loop overlaid on the standard journey:

**1. Capture (onboarding step 3):**
*"When is your probation review, if you know?"* — date input, optional. Defaults to "I don't know yet" — user can fill in later.

**2. Settings — anytime:**
The user can set, update, or remove their probation review date in Settings. Window length defaults to 21 days but is overrideable (min 7, max 90).

**3. Activation trigger (Day 70 or T-21 days, whichever fires first):**
Push notification + Daily Home banner: *"Your probation review is in 21 days. Want to switch on Probation Mode?"* — single tap to activate, or dismiss for now.

**4. Active state (21 days of focused prep):**
All product surfaces adapt per §6.6. Mission Track inserts probation missions. Situation Room gains the fourth entry. Coach gains the evidence tool. Playbook surfaces the Probation Prep Pack.

**5. Three days before review:**
User is prompted to generate the one-page Probation Brief. The Brief is generated by an Opus call, editable in-app, exportable as PDF.

**6. Day-of review:**
Mode quietly deactivates. Push notification at user's chosen time: *"Today is your review. We've got your brief ready. Good luck."* — no follow-up notifications until after the review window.

**7. Outcome capture (1-3 days after review date):**
Gentle prompt: *"How did your review go?"* — four options including *Prefer not to say*. Stored in `user_context.probation_outcome`.

**8. Post-review Coach session:**
A pre-loaded Coach thread is offered automatically, voiced for the captured outcome. For *continued*: forward-looking — *"Now you're on the team. Here's what the next quarter looks like."* For *extended*: calm and practical — *"This isn't the end. Here's how to make the next 30 days count."* For *ended*: deeply respectful — *"This is hard. You learned a lot in 90 days. Here's how to walk into the next role with what you now know."*

The post-review session is *not* a victory lap or a wallowing space. It's a structured handover into whatever comes next.

---

## 8. Pricing & Monetisation

### 8.1 Tiers

| Tier | Price | Includes |
|---|---|---|
| Free | $0 | 4 Simulator scenarios (lifetime), Weeks 1–2 of Mission Track, basic Playbook access, 2 Situation Room sessions/week, 5 ad-hoc Coach messages/week |
| Pro | **$39.99/month or $399/year** | Unlimited Situation Room, unlimited Simulator, full Playbook library, full 90-day Mission Track, unlimited Coach, multi-role support, Survival Report export |

**Pricing rationale at $39.99:** at this price point, the comparison set is no longer ChatGPT ($20) or LinkedIn Premium (~$30). The comparison is a single human career-coaching session at $200/hour, of which the Pro subscriber gets the equivalent of *roughly 1.5–2 hours of structured AI coaching every week*. This is the marketing message: *"For less than 20% of one coaching session per month, you get unlimited AI coaching, simulation, and a structured 90-day programme."*

**Free tier conversion thesis at premium pricing:** the free tier has been intentionally rebalanced more generously than at the previous £14.99 price point. At $39.99, signups need to *experience the wow moment* before they'll convert — and the wow moment is the role-aware Situation Room in a real-world moment. Hence:

- 4 Simulator scenarios (was 2) — enough to genuinely practise across two distinct scenario types
- Weeks 1–2 of Mission Track (was Week 1) — lets the user feel the curriculum *compounding* across two weeks
- 2 Situation Room sessions/week (was 1) — enough to use the killer feature in a real moment more than once
- 5 ad-hoc Coach messages/week (was 2) — enough for one real conversation

This is still a clear paywall. But it gives the user enough product to fall in love with before being asked for $39.99 — which is the right balance at premium pricing.

**Coach messages clarification:** the AI Coach is the underlying conversational engine (§6.2). "Coach messages" in the free tier refers to *ad-hoc free-form messages* to the Coach outside of Situation Room sessions and Simulator debriefs (i.e. the "ask the Coach anything" surface). Coach turns *inside* a Situation Room session or Simulator debrief are governed by that surface's own cap.

**Cohort tier removed:** v1.4 included a £29.99/month Cohort tier (Pro + monthly practitioner-facilitated group call + community channel) deferred to Phase 2A. This tier has been removed entirely as of v1.5. The reasoning: live facilitation is a services business in disguise, with operational overhead (recruiting facilitators, scheduling, no-shows, content refresh, session-quality risk) that does not fit the SaaS economics of FirstNinety. If users later demand human contact, lower-overhead surfaces (guest practitioner AMAs, async expert Q&A, on-demand pre-recorded mentor walkthroughs in the Playbook Library) will be considered.

**Regional pricing (Phase 2C):** Naira, INR, and PHP pricing will be introduced when emerging markets are launched in Phase 2C, calibrated to ~25-35% of USD pricing — distributed via Paystack (Nigeria) and Razorpay (India). Not in MVP.

### 8.2 B2B2C Channel — Institutional Model

The previous per-student volume model ($6–$10/student/month for hundreds of graduates) is incompatible with $39.99 retail pricing — bootcamps would expect proportional discounts that no longer make economic sense. At $39.99 retail, the B2B2C model shifts to **a smaller number of premium institutional partnerships**:

- **Institutional partners pay a flat annual fee** (~$15,000–$40,000) covering up to a defined number of graduates per year (e.g. 100–300 seats)
- **White-label option** for premium UK/US bootcamps wanting their own branded post-graduation success layer
- **Outcomes dashboard** showing student progression, simulator completions, Mission Track milestones, **probation pass rate** (the metric institutional partners care most about)
- **Co-marketing** — partner bootcamps featured in FirstNinety case studies; FirstNinety featured in partner success stories

This is a slower-volume, higher-quality channel than the previous per-student model. Target: 3–5 institutional partnerships in Year 1.

First target: the founder's cousin's institute remains the warm-relationship pilot, though terms shift to the institutional model.

### 8.3 Future Monetisation (Phase 2+)

- "Earn Your Promotion" 6-month track (Day 90 onwards)
- Role-switching track (BA → PO, PM → Product Manager etc.)
- Employer-paid Manager Companion (separate SKU — see §9.6 and §12.2)
- Certification / badge layer (verified completion shareable on LinkedIn)
- Premium tier above Pro for users who want priority Coach latency, deeper Playbook variants, or "named mentor voice" Coach (Phase 2B+)

---

## 9. Technical Architecture

### 9.1 Stack

Aligned with founder's standard stack:

- **Frontend:** Next.js 16 (App Router) as an installable **PWA** — service worker, web push, offline-tolerant Playbook caching. TypeScript, TailwindCSS, shadcn/ui.
- **Auth:** Supabase Auth (email + Google)
- **Database:** Supabase Postgres
- **AI:** Claude Opus 4.7 (Coach, Simulator persona reasoning), Claude Haiku 4.5 (lightweight retrieval, summarisation)
- **Payments:** Stripe (UK + US at launch; Paystack and Razorpay added in Phase 2C)
- **Email:** Resend
- **Hosting:** Vercel
- **Analytics:** PostHog
- **Native mobile:** deferred to Phase 2B+ — evaluated based on PWA limitations and user demand. Not in MVP.

### 9.1.1 PWA Architecture Notes

The PWA decision shapes several engineering choices and deserves its own section.

**Service worker scope:**
- App shell cached on install (the navigation chrome, fonts, design tokens, illustrations)
- Playbook content cached on first read for offline access
- Mission Track mission metadata cached for the current and next week
- Coach, Situation Room, and Simulator interactions are *not* cached — they require live AI calls

**Offline behaviour:**
- **Works offline:** reading Playbooks, viewing already-loaded Mission Track content, viewing past Situation Room transcripts (cached locally for 30 days), viewing past Simulator transcripts
- **Requires connectivity:** any new Coach interaction, any new Situation Room session, any new Simulator run, Mission Track completion submission, syncing the user's stored memory updates
- **Graceful degradation:** clear in-UI banner when offline ("You're offline — Playbooks are still available; Coach and Situation Room will reconnect when you're back online")

**Push notifications:**
- Used for: morning Mission Track reminder, Sunday recap prompt, Situation Room follow-up nudge ("you mentioned a UAT meeting at 2pm — want to prep?")
- *Not* used for: marketing comms, generic engagement spam
- Opt-in only; opt-out one tap from the notification itself
- iOS-specific: notifications require the user to have first installed the PWA to their home screen. The onboarding flow includes a step explicitly walking the user through "Add to Home Screen" on iOS Safari

**Install conversion flow:**
- On first mobile visit: in-page install prompt after the user has completed at least one meaningful interaction (a Simulator scenario, Mission, or Situation Room session) — never on landing
- iOS-specific: animated tutorial showing the Safari Share menu → Add to Home Screen flow, since iOS does not surface install prompts automatically
- Conversion target: 40% of mobile-web first-session users install the PWA within 7 days

**What we lose vs native:**
- App Store / Play Store discoverability (acceptable trade — primary acquisition channels are LinkedIn, Google, partner referrals)
- Background processing limits (acceptable — no real workload requires background processing at MVP)
- Some deeper notification customisation on iOS (acceptable — basic push is sufficient)

**Re-evaluation trigger for native:** if mobile-web session duration on iOS lags desktop session duration by >30% sustained for 60 days, or if PWA install conversion drops below 25%, revisit native mobile in Phase 2B.

### 9.2 Key Architectural Decisions

- **Role-as-namespace** — every content table (scenarios, playbooks, missions, coach prompts) carries a `role` field. Adding role #7 in Phase 2 is content work, not engineering work.
- **Scenario engine** — single conversational engine with role-specific persona templates and objective rubrics. No bespoke logic per scenario.
- **Mission Track as data, not code** — missions stored as DB rows with prerequisites, content references, and completion criteria. New tracks are content edits.
- **Streaming Claude responses** — SSE from Coach and Simulator for responsiveness; no full-message blocking.
- **Memory and continuity** — per-user persistent context: which scenarios run, what stalled, what missions complete, recent Coach topics. Fed selectively into Coach calls.

### 9.3 Data Model (high-level)

Core tables:
- `users`, `subscriptions`
- `roles` (BA, PM, SM, PO, DA, AIE)
- `scenarios` (role, brief, personas, objectives, rubric)
- `scenario_runs` (user_id, scenario_id, transcript, scoring, debrief)
- `playbooks` (role, artefact_type, content, worked_examples)
- `missions` (role, week, sequence, type, prerequisites, content_refs)
- `mission_completions`
- `coach_threads` (user_id, topic, messages)
- `situation_sessions` (user_id, entry_type [prep|is_this_normal|debrief], transcript, related_playbooks, related_simulator_run_id, flagged_for_safety)
- `user_responsibilities` (user_id, free-text description of current responsibilities and projects, source [onboarding|sunday_prompt|coach_inferred], updated_at, user_confirmed_boolean)
- `user_context` (user_id, profile data, current week, focus areas, recent situations summary)

### 9.4 Privacy & Safety

- No employer name capture beyond optional anonymous tag
- Coach and Simulator transcripts encrypted at rest
- User can delete all data; GDPR/UK GDPR compliant from day one
- Explicit guardrails on Coach: no employment law advice, no medical/mental health diagnosis, fixed referral pathways for crisis or harassment topics
- DPIA produced pre-launch (ICO structure)

### 9.5 AI Architecture Philosophy

FirstNinety distinguishes two categories of AI surface and applies them deliberately:

**AI Features** — single Claude calls (sometimes streaming, sometimes multi-turn) with structured prompts, predictable cost, and predictable latency. Used everywhere user value can be delivered without multi-step autonomous reasoning.

**AI Agents** — multi-step autonomous loops where the model plans, calls tools, reflects, and retries. Roughly 5–20× the per-interaction cost of a feature, higher latency, non-deterministic outputs. Used only where the user job genuinely requires it.

**At MVP, FirstNinety is mostly features with one lightly agentic surface (the Coach's tool-calling).** This is deliberate, driven by four constraints:

1. **Unit economics.** Agents are dramatically more expensive per interaction. Launching with too much agent surface area would break the £14.99/month Pro tier before product-market fit is reached.
2. **Reliability.** Agents fail more often (timeouts, hallucinated tool calls, retry loops). Higher failure rates erode trust precisely when users have least patience — their first 90 days.
3. **Speed to market.** Well-prompted features ship in days; agents require observability, tracing, retry logic, and fallback paths to ship reliably.
4. **Honest positioning.** The "agentic AI" narrative is wearing thin with buyers in 2026. FirstNinety positions as *"AI that knows your role and your week"* — not as an agent platform.

**Agentic surfaces are reserved for Phase 2** (see §13) where the depth justifies the cost:
- Real-Situation Triage Agent (Phase 2A) — deepens the MVP Situation Room with multi-step planning, deeper Playbook synthesis, and broader context
- Personalised Mission Track Agent (Phase 2B)
- Day-90 Survival Report Agent (Phase 2B)

**Situation Room note:** the Situation Room (§6.5) is a *feature*, not an agent, at MVP — it is the Coach engine with extra context and structured entry templates. The *agentic deepening* of the Situation Room is the Real-Situation Triage Agent in Phase 2A.

**Engineering implications baked into MVP:**
- Coach tool-calling implemented with strict tool schemas
- Hard cap of 3 tool calls per Coach response
- Every AI call traced and cost-tagged from day one
- Cost-per-user-per-month tracked as a first-class metric in the analytics dashboard
- Every new AI surface evaluated against the test *"Could a single well-prompted call solve this?"* before being built as an agent

### 9.6 User Memory & Context Model

FirstNinety operates a deliberately tiered model for what the system knows about the user. The tiers are scope-defined and trust-defined; we move down the levels only as the user permits and only where the value justifies the cost and risk.

**Level 1 — Declared Memory (MVP)**

The system remembers what the user has *explicitly told it*: their role, sector, current week in the Mission Track, who's in their team (anonymised — "my lead dev", "my PM", "my sponsor"), current projects in plain-text description, and what they're worried about.

Captured via:
- Onboarding (§7.1)
- Sunday recap prompt (§7.3) — *"What's coming up this week that's on your mind?"*
- Inline Coach updates — when the user mentions something new mid-conversation, the Coach asks: *"Want me to remember this?"*
- Situation Room session content (encrypted, retained)

Visible to the user as **"What FirstNinety knows about you"** — a settings screen showing every stored fact, with one-tap edit and one-tap delete. This is both a privacy commitment and a trust-building feature.

**Level 2 — Behavioural Inference (Phase 2A)**

The system infers patterns from the user's activity *inside FirstNinety*: which scenarios stall, which times of day they open the Situation Room, which Coach prep formats they engage with, which missions they skip. Used to personalise the Mission Track ordering and to proactively surface relevant Playbooks and scenarios.

This is the foundation of the Personalised Mission Track Agent (Phase 2B). It ships *after* MVP has gathered six months of real behavioural data; building this at MVP with no data produces clumsy inferences that damage trust.

**Level 3 — Workplace System Ingestion (Explicitly Out of Scope)**

The system would read the user's actual workplace systems (Jira tickets, Slack messages, email, calendar) to infer responsibilities and proactively suggest help.

**This is explicitly excluded from FirstNinety as currently scoped.** Four reasons:

1. **Trust profile.** FirstNinety's positioning relies on the explicit commitment that we do not capture employer or colleague data. Reading workplace systems inverts this.
2. **User employment risk.** A bootcamp graduate plugging FirstNinety into their employer's Slack without their employer's knowledge could be in breach of their employment contract. We will not encourage this.
3. **B2B2C channel risk.** Bootcamp partners hand FirstNinety to graduates partly because it is a clean personal-development product requiring no legal review. Workplace ingestion changes that conversation fundamentally.
4. **Strategic clarity.** Reading workplace data to augment workflow is a different product category — Microsoft Copilot, Glean, Notion AI, Slack AI. FirstNinety's wedge is *coaching the human*, not *augmenting the workflow*. We don't compete with hyperscalers on their own turf.

**Future exception:** if FirstNinety later builds the *Manager Companion* product (Phase 2C, sold to employers as the buyer rather than employees), workplace integration becomes possible because the employer is the customer. That is a separate SKU with a separate trust model — not an extension of the consumer product.

**What we will never store** (codified rule):

- Real names of the user's colleagues, manager, or stakeholders
- Real names of the user's employer beyond an optional anonymous sector tag
- Verbatim copies of any document the user is working on at their employer
- Any content the user pastes from employer systems unless the user has anonymised it first (with active prompting from the UI)

This rule is documented in the privacy policy, surfaced at onboarding, and reinforced in the Situation Room intake flow.

---

## 10. Success Metrics

### 10.1 North Star Metric

**Day-30 Active Rate** — percentage of signups who run a simulator scenario, complete a mission, OR open a Situation Room session on Day 25–30. Target: 35% by Month 6, 50% by Month 12.

The Situation Room is the strongest signal of daily relevance — a user who opens it 3+ times in their first week is overwhelmingly likely to become a paid retainer.

### 10.2 Supporting Metrics

| Metric | Target (Month 6) |
|---|---|
| Activation (1st mission OR Situation Room session within 48hr of signup) | 65% |
| Situation Room sessions per active user per week | 3.0 |
| Free → Pro conversion | 4% (lower than v1.4's 7% target reflecting premium price point) |
| Mission Track completion (Day 90) | 25% |
| Simulator runs per active user per week | 2.5 |
| Situation Room → Simulator conversion rate (user roleplays after preparing) | 30% |
| Coach / Situation Room latency (P50 first-token) | <2.5s |
| PWA install conversion (mobile-web first-session users) | 40% within 7 days |
| Probation Mode activation rate (users with a review date) | 80% activate on or after Day 70 prompt |
| Probation Brief generation rate (users in Probation Mode) | 70% generate the one-page Brief |
| Probation outcome capture rate (users past their review date) | 50% capture outcome |
| Probation pass rate (of users who captured outcome) | tracking metric — no target at MVP, becomes B2B2C asset |
| NPS at Day 30 | 50+ |
| B2B2C pilot signings | 3 bootcamps |

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Retention cliff at Day 90 | Medium | Medium | Four of six MVP features (Situation Room, Coach, Playbook, Simulator) continue indefinitely past Day 90 — they are not curriculum-bound. Daily Home transforms (§7.4) into an on-demand-focused layout at Day 91 rather than emptying out. Coach system-prompt adjusts for post-90 users. Mission Track concludes by design; Survival Report is the closing editorial gesture. Phase 2B "Earn Your Promotion" track adds structured curriculum for Days 91+ when justified by retention data. |
| Premium $39.99 price point limits TAM at launch | High | Medium | Accepted trade-off; emerging markets re-enter via Phase 2C with regional pricing; institutional B2B2C channel adds volume |
| Free → Pro conversion below 4% target at premium price | Medium | High | Free tier rebalanced more generously (v1.5); rapid A/B testing of free-tier shape in first 90 days; premium tier evaluation if signups indicate price-sensitivity |
| Content depth shortfall at launch breaks premium positioning | Medium | High | All six roles committed to full depth at launch (no "thin" labels); content production becomes critical path; AkomzyAi practitioner network leveraged for authoring |
| iOS PWA install conversion friction | Medium | Medium | Animated install tutorial in onboarding (Safari Share → Add to Home Screen); install prompt only after first meaningful interaction; install-conversion KPI tracked; native iOS app conditionally built in Phase 2B if PWA conversion <25% sustained |
| Probation Mode encourages over-preparation / amplifies anxiety | Medium | Medium | Coach voice during Probation Mode (§6.6) includes explicit counterweight lines against over-preparation; "How did your review go?" framing avoids binary pass/fail language; post-review Coach session offered for every outcome including failures |
| Probation outcome capture creates legal/HR exposure if outcome is "ended" | Low | Medium | All outcome capture is voluntary; "Prefer not to say" always available; data never shared without explicit consent; legal review of outcome-capture wording pre-launch |
| Generic AI products eat the wedge | Medium | High | Differentiation must be the *structured spine* (Mission Track) and the *role-specific simulator scenarios* — neither replicable by typing prompts into ChatGPT |
| Content production cost across 6 roles | High | Medium | BA role authored personally at full depth; other 5 roles launch at 60–70% depth with transparent "expanding weekly" badge; community contribution layer in Phase 2 |
| Bootcamps build it themselves | Low | Medium | Sell to them before they build. First pilot is warm-relationship (founder's cousin's institute). |
| Simulator quality is uneven across scenarios | High | Medium | Rubric-driven evaluation built into engine; weekly review cycle; user thumbs-down feedback loop |
| AI Engineer tradecraft moves faster than content can keep up | High | Low | Position the AI Engineer track as "evolving with the field" — make this a feature, not a bug. Founder authors content via AkomzyAi as standard practice. |
| Imposter-syndrome users disengage when product can't reduce anxiety quickly | Medium | High | First-week missions designed for fast micro-wins; debrief tone calibrated to validate progress |
| Privacy concern: users sharing real workplace situations with AI | Medium | High | Explicit anonymisation guidance; no employer capture; encrypted transcripts; transparent privacy doc |
| AI cost overruns from over-agentic implementation | Medium | High | Strict feature-vs-agent discipline (§9.5); hard tool-call limits enforced; cost-per-user tracked as first-class metric; agent surfaces deferred to Phase 2 |
| Situation Room gives bad real-world advice in a live moment | Medium | High | Guardrails (no employment law, no mental health diagnosis, no judgement of named individuals); fixed referral pathways for crisis/harassment/discrimination; weekly red-team review of flagged sessions; explicit "this is guidance not advice" framing in UI |
| Situation Room dependency replaces user's own judgement | Medium | Medium | Coach trained to push back and reflect questions back; debrief format requires user's own interpretation first; Mission Track explicitly builds independent judgement |
| Temptation to ingest workplace data (Jira, Slack, email) to deepen personalisation | Medium | High | Explicit out-of-scope statement in §9.6 and §12; positioning explicitly built on the *opposite* commitment ("we don't touch your employer systems"); workplace integration deferred to a separate employer-paid Manager Companion product (Phase 2C) if ever built |

---

## 12. Out of Scope (MVP)

This section has two parts. **§12.1** lists capabilities deferred to Phase 2 or later — they may be built when the time is right. **§12.2** lists capabilities *explicitly excluded* from FirstNinety as currently scoped — these are not "later," they are "no."

### 12.1 Deferred to Phase 2 or later

- Native mobile app (iOS / Android via Expo). MVP ships as an installable PWA (§9.1.1). Native app conditionally evaluated in Phase 2B based on PWA metrics.
- Voice-based simulator
- Live human coach matching marketplace
- Video content library
- LinkedIn Learning / Coursera-style course catalogue
- Multi-language UI (English-only at launch)
- Certifications / verifiable badges
- AI-generated personalised CV / portfolio updates (Joberlify's job)
- Role tracks beyond the six MVP roles
- "Earn Your Promotion" post-90 track
- Anonymous peer-to-peer matching
- Full offline AI capability (Coach, Situation Room, Simulator require connectivity at MVP; only Playbooks and past transcripts are offline-cached)

### 12.2 Explicitly excluded from FirstNinety (consumer product)

These are *not* "later" — they are decisions about what this product is and isn't:

- **Ingestion of the user's employer systems** (Jira, Confluence, Slack, Teams, Gmail, employer calendars, employer document stores). FirstNinety knows what the user tells it, not what their employer's systems contain. See §9.6 for the full reasoning.
- **Storage of real names** of the user's colleagues, manager, stakeholders, or employer (beyond an optional anonymous sector tag).
- **Verbatim retention of employer documents**, code, or proprietary content pasted by the user. Where the user pastes content, the Situation Room actively prompts for anonymisation first.
- **Manager Companion / employer-side product within FirstNinety.** If this product is ever built, it is a separate SKU sold to employers under a different trust model — not an extension of the consumer product.

These exclusions are positive trust commitments, surfaced at onboarding and in the privacy policy.

---

## 13. Phase 2 Roadmap (post-launch, indicative)

**Phase 2A — Depth + First Agent (Months 4–6 post-launch):**
- **Real-Situation Triage Agent** — the agentic deepening of the MVP Situation Room (§6.5). Adds multi-step planning, broader Playbook synthesis across multiple artefacts, longer-context user history, and proactive suggestion of next moves over multi-day arcs. The MVP Situation Room is the entry point; this agent is the depth layer.
- **Probation Prep Pack expansion** — the heavier Option B version of probation prep: dedicated probation route with self-assessment generator (AI-assisted multi-step), manager 1:1 agenda builder, full evidence portfolio (auto-pulled from completed missions, simulator runs, situation sessions, journal entries), probation conversation simulator with longer scenarios, post-review debrief flow with structured follow-up over 14 days. The MVP version (§6.6) is the lightweight layer; this is the dedicated surface.
- Voice-based Simulator
- B2B2C institutional-partner dashboard
- Async expert Q&A surface (replaces the dropped live Cohort facilitation idea)
- Behavioural Inference (Level 2 memory — see §9.6)
- PWA install conversion optimisation (iOS install tutorial refinement, push-permission flow A/B testing)
- **Quarterly Simulator content additions** — ongoing content commitment to extend the Simulator library by 2-3 new scenarios per role per quarter. This addresses the only depletion risk identified in the post-90 audit (§7.4). Funded as a content cost line item, not engineering work.

**Phase 2B — Breadth + Adaptive Track (Months 6–9):**
- **Personalised Mission Track Agent** — reviews transcripts, completions, and stalled missions; dynamically reshapes the remaining 75 days around the user's specific weaknesses. Replaces the fixed Mission Track ordering shipped at MVP.
- **Survival Report Agent (Day 90)** — synthesises 90 days of activity (simulator runs, coach threads, journal entries, completed missions) into a personalised growth report and a roadmap for the next 90 days.
- 4 new roles (QA, DevOps, UX/UI, Cyber)
- "Earn Your Promotion" Day 91–180 track
- Optional Premium tier above Pro (priority Coach latency, named mentor voice, deeper Playbook variants)
- **Native mobile app (conditional)** — built only if PWA metrics indicate genuine blocking limitations (iOS session duration lagging desktop by >30%, or PWA install conversion <25%). Default assumption: PWA is sufficient.

**Phase 2C — Emerging Markets + Marketplace (Months 9–12):**
- **Emerging markets launch** — Nigeria (~₦15,000–25,000/mo via Paystack), India (~₹999–1,499/mo via Razorpay), Philippines (regional pricing TBD)
- Multi-language UI (start with Hindi, Yoruba/Pidgin, Tagalog)
- Live coach matching layer
- **Manager Companion** — separate employer-paid SKU with workplace integrations (Jira, Slack), built under a different trust model (see §9.6 and §12.2)

---

## 14. Open Questions

To resolve before build prompts are sequenced:

1. B2B2C institutional pricing — confirm flat annual fee band ($15k–$40k for 100–300 seats), pilot terms for the founder's cousin's institute
2. Free tier rebalancing at premium pricing — current v1.5 spec (4 sims, Weeks 1–2 of Mission Track, 2 SR sessions/week, 5 Coach msgs/week) is a deliberate trade. Validate via A/B testing post-launch.
3. AI Coach memory — global per-user, or scoped per topic-thread? (Current spec is per topic-thread; global has privacy implications, see §9.6.)
4. Should the product capture role transitions (e.g. user changes job mid-90-days) as a supported flow at MVP, or surface as friction and handle manually until Phase 2?
5. Annual billing discount — currently set at ~17% (12 × $39.99 = $479.88 vs $399 annual). Confirm.
6. US payments at launch — Stripe handles US natively; confirm whether US-state-level tax handling needed at MVP or can be deferred.

---

## 15. Document Set & Next Steps

This is **Document 1 of the FirstNinety doc set**. Standard sequence:

1. **PRD** *(this document)*
2. Competitive Analysis
3. MVP Spec (detailed feature breakdown, DB schema, API surface)
4. CLAUDE.md (project instructions for Claude Code)
5. SKILL.md (FirstNinety-specific skill)
6. Sequenced Build Prompts (numbered, ready for Claude Code execution)

Immediate next deliverable on confirmation: Competitive Analysis.

---

*End of PRD v1.8*
