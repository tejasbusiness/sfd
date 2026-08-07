# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

Phase 1 (foundation) is complete: Vite + React + TS scaffold, Tailwind v4, Supabase migrations
`0001`–`0010` (schema + RLS + role grants), auth flow, and Rule A/B abstraction stubs are in
place and verified against a local Supabase instance. See `docs/roadmap.md` for what's done vs.
pending per phase, and `docs/logs.md` for the narrative build history and decisions made along
the way (including two RLS gotchas discovered during Phase 1 verification — see the 2026-08-07
entry). `docs/` (including these two files) is gitignored — local-only, not on GitHub.

**Backend for local dev is a local Docker Supabase stack** (via `npx supabase start`), not a
remote instance — this was decided after initially planning to share one remote VPS instance
for dev+prod; see `docs/logs.md` for the reversal. The same `supabase/migrations/*.sql` files
will later apply to a VPS-hosted instance near launch, but there is currently no dependency on
that VPS for day-to-day development.

## What this project is

A marketing website + client-management platform for a web design agency (SynergyFirst Digital)
that builds websites exclusively for healthcare/wellness practitioners (dentists, dermatologists,
physio/chiro, pediatricians, eye clinics, dietitians, fitness coaches, yoga studios).

Full spec lives in `docs/`, split into focused files so a build session only needs to load what's
relevant to the phase in progress. **Always start with `docs/00-INDEX.md`** — it maps each file to
when to load it and lists the suggested build order. Read the specific numbered doc(s) relevant to
whatever you're building before writing code; don't rely on this summary alone for implementation
details.

## Tech stack (fixed by spec — do not substitute)

- **Frontend:** React + Vite, React Router
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion, plus subtle scroll-reveal effects used sparingly
- **Backend/Auth/DB:** Self-hosted Supabase (Postgres + Auth + Row Level Security + Storage + Realtime)
- **Payments:** Razorpay (INR) + Stripe (USD), selected by visitor geolocation, routed by currency at checkout
- **Notifications:** Supabase Realtime channels + Web Push API
- **Email:** SMTP (configurable in admin settings) + templated automated sequences
- **AI:** Provider-agnostic chatbot layer (Gemini / OpenAI / Claude), selectable per deployment via admin settings

## Architecture principles (from `docs/11-architecture-scalability.md`)

These are load-bearing constraints, not suggestions — check this file before diverging from a
pattern established elsewhere:

- **Schema:** normalized Supabase tables (`leads`, `bookings`, `services`, `tickets`, `messages`,
  `testimonials`, `portfolio_items`, `pricing_tiers`, `settings`) with RLS policies written from
  day one, not retrofitted.
- **Payment gateways behind one abstraction:** `processPayment(currency, amount, ...)` — checkout
  UI code must never branch on Razorpay vs. Stripe directly. This abstraction is reused later by
  Invoicing (see "Planned, not built yet" below).
- **AI provider behind one abstraction:** `getChatResponse(provider, prompt, context)` — same
  reasoning, for the site chatbot.
- **Niche is data-driven:** case studies and services render from content records, not
  hardcoded per niche. Adding a new target niche later must be a content change, not a code change.
- **Auth/role scope must anticipate the future Client Dashboard** (see below) — customer auth
  should be broad enough that adding a new dashboard tab is a frontend addition, not a new auth model.

## Business-model sequencing (affects CRM, forms, and email — not just copy)

Web Design, SEO, AI Solutions, and 1-on-1 Website Help are the low-ticket entry offers.
**WhatsApp Business API is the upsell**, pitched only after trust exists post-delivery — never
bundled into the generic new-lead sequence. This has concrete implementation consequences:

- Every lead record (from forms, bookings, or chatbot escalation) must be tagged with the entry
  service that brought the client in.
- The automated email system needs a dedicated "post-project-completion → WhatsApp Business API
  introduction" trigger, separate from the new-lead welcome sequence (`docs/09-email-sequences.md`).

## Two things named "AI" — don't conflate them

- **AI Solutions** (`docs/02-public-site.md`): a service the agency *sells to* practices
  (chatbots/automation for the practice's own use).
- **AI chatbot** (`docs/10-ai-chatbot.md`): the agency's *own* site-wide widget that sells to
  visitors of this site, escalates unresolved queries to a lead/ticket, and logs transcripts to
  the CRM against the associated lead.

## Pricing model specifics

Subscription-based (monthly recurring), not one-time project fees — Starter/Professional/Business
tiers, each stored with both INR and USD values, geo-detected default with manual override
(`docs/05-pricing-billing.md`). Tier content (pricing, feature lists) must be admin-editable, not
hardcoded. Note the doc flags an unresolved business risk (INR pricing far below USD-equivalent
value) — this is a known open question, not something to silently "fix" by changing numbers.

## Planned, not built yet (`docs/12-future-phase-not-building.md`)

**Invoicing** and a **Client Dashboard** are confirmed next-phase features. Do not build them now,
but schema and auth decisions made today must not require rework to add them later — e.g. an
`invoices` table (`client_id`, `amount`, `currency`, `status`, `due_date`, `recurrence_rule`) reusing
the payment gateway abstraction, and a customer auth scope broad enough to add a dashboard tab
without a new auth model.

## Suggested build order

1. `01` (overview) → `11` (architecture) → `08` (auth) — foundation and schema first.
2. `02` (public site) + `04` (forms) — marketing funnel.
3. `03` (booking) → `05` (pricing/billing) — revenue-critical flows.
4. `06` (admin) + `07` (notifications) — ops visibility.
5. `09` (email) + `10` (chatbot) — automation layer last, since both depend on leads/bookings already existing.

## Deliverable bar (from `docs/01-overview-and-stack.md`)

- Production-ready code: proper error handling, loading states, and empty states throughout — not prototype-quality.
- All secrets (Supabase keys, SMTP, Razorpay, Stripe, AI provider keys) environment-variable-driven.
- README must document Supabase schema migration steps, required environment variables, and how to run locally — write/update this as the project is scaffolded.
