# Page Blueprints

## Homepage

1. Light sticky header with primary and booking CTAs.
2. Outcome-led hero: free-preview promise, qualification note and two actions.
3. Credibility strip using only verified proof.
4. How the free preview works in three or four steps.
5. Before-and-after website transformation.
6. Industry entry points.
7. What every managed website includes.
8. Featured websites or case studies.
9. Why the monthly model works.
10. Pricing summary with three plans.
11. Growth-service upgrades.
12. Testimonials.
13. FAQ addressing cost, term, ownership, updates, cancellation and timing.
14. Final free-preview CTA.
15. Complete footer.

## How It Works

Explain qualification, preview creation, seven-day review, activation, completion, domain connection, launch and monthly management. Include what a preview does and does not include. Address expected timelines and required customer input.

## Pricing

- Plain-language plan comparison.
- Monthly USD prices once confirmed.
- Inclusions and limits.
- Commitment and cancellation terms.
- Domain and ownership explanation.
- Buyout or transfer policy when confirmed.
- Add-ons and third-party charges.
- FAQs.
- Free-preview and booking CTAs.

Never hide material terms behind vague wording.

## Industries index

Explain that each website is structured around how customers choose businesses in that niche. Link to the five initial vertical pages.

## Industry pages

Each industry page contains:

1. Industry-specific outcome headline.
2. Common digital problems.
3. Recommended conversion journey.
4. Relevant website features.
5. Example work when available.
6. Relevant monthly plan or add-ons.
7. Industry-specific FAQ.
8. Free-preview CTA.

Do not publish thin near-duplicate vertical pages.

## Websites / Portfolio

Use an editorial project presentation. Every project must identify the business type, problem, work completed and real result if available. Portfolio links should never lead to dead or repurposed client domains without review.

## Case study detail

- Client and industry.
- Starting situation.
- Business goal.
- Constraints.
- Strategy.
- Pages and integrations delivered.
- Before-and-after comparison.
- Verified outcome.
- Client quotation where authorized.
- Relevant CTA.

## About

Present SFD as an experienced remote team. Include founder credibility, 25+ years of web experience when verified for public use, operating principles, delivery model and transparent company information. Avoid generic mission statements.

## Free Preview application

Explain eligibility and collect only the information needed to evaluate and create a preview. Suggested fields:

- Full name.
- Work email.
- Mobile number (country code and 10-digit number as separate fields).
- Business name.
- Existing website.
- Google Business Profile URL.
- Country and city.
- Business category.
- Primary service.
- Main website problem.
- Permission/acknowledgement regarding submitted materials.

Do not state that submission guarantees a preview.

## Contact

Provide booking, email and enquiry paths. Display real business information and response expectations only when confirmed.

## Websites service and landing page (`/services/websites/`)

Built 2026-09-21. Principles taken from the reference (icreateyoursite.com/websites/): a service landing page, not a gallery; outcome-led headline, then proof, what is included, what we build, then the ask. All copy is original and uses only facts already on the site (`plans.json`, the pricing page, the real portfolio). Left out on purpose because SFD has no verified equivalents (rule 13): award badges, "1,000+ sites" counters, review ratings and a delivery-time promise.

Section order: `hero-form` (copy, three bullets, the free preview and discovery call buttons, and a short enquiry form), `client-logos` (8 real client logos), Why a managed website, `portfolio-showcase` (three real projects, link to the portfolio), What every website includes, What we build (business websites, redesigns, booking and appointment websites, e-commerce, the last matching the E-Commerce plan), `process` (three-step free preview), related services, free preview call to action.

- **Hero form** (`templates/sections/hero-form.njk`): Full name, Email, Phone, Message and the consent checkbox, plus a hidden `topic` field (`Websites`, set in the page JSON as `form.topic`). Uses the shared form system and `assets/js/contact-form.js`, so it posts to `/api/contact` and is stored in `contact_enquiries` with the source page and UTM parameters. The contact API now treats "how did you hear about us" as optional (the contact page still requires it in the browser), and the owner email includes the page and campaign.
- The hero is kept compact on purpose (small vertical padding, tight form spacing, two-row message box) so the whole form card is visible without scrolling on a laptop-height screen (about 770px tall). Keep it that way if fields are added: a form that falls below the fold hurts ad conversion.
- **Client logos** (`templates/sections/client-logos.njk`): logos in `assets/images/customer-logos/`, one `.card` each, alt text is the client name, not links. `tile: "dark"` puts white-artwork logos (EV WORLD360, 123 Silva, NextWorld Communications) on a solid dark tile.
- The page is the `service` type, so every other service page can link to it, and the Free Preview button remains the primary conversion beside the form.

## Service pages (all five share one structure, 2026-09-21)

`/services/websites/`, `/services/seo/`, `/services/website-care-maintenance/`, `/services/digital-marketing-social-media/` and `/services/ai-automation/` use the same stack and styling, so future service pages should copy it:

1. `hero-form`: H1, three bullets, free preview and discovery call buttons, compact enquiry form (Name, Email, Phone, Message, hidden `topic` = service name: `Websites`, `SEO`, `Website Care`, `Digital Marketing`, `Automation`).
2. `client-logos` (tinted): the shared list in `data/client-logos.json`, so a new logo is added once.
3. Why-it-matters content block.
4. `portfolio-showcase`: the same three real projects.
5. What is included (`feature-grid`, tinted).
6. How it works (`process`, four steps).
7. A closing content block (Honest expectations, Ownership, How we work or Getting started).
8. Related services (`link-cards`) and the free preview call to action.

Sources: Websites, Website Care, Digital Marketing and AI & Automation copy come from `plans.json` and the earlier page copy; nothing new was invented. **SEO** is a standalone service as well as part of the managed plans and leads with a **free website audit** (owner-confirmed offer; the form asks for the site address in the message). The audit's exact scope is not described beyond "we review your current website and Google Business Profile and tell you what needs attention", so the owner should confirm that wording. Reference pages analysed: icreateyoursite.com `/seo/`, `/ai-services/`, `/1-on-1-website-help/`. The 1-on-1 help product (a paid coaching session with a flat price) is not offered; live WordPress help is covered by Website Care.

## Book a Call

Dedicated fallback for the same booking engine used in the sitewide modal. It must be shareable and functional when opened directly.

## Resources and free tools

Tools remain secondary lead-generation assets. Each tool should naturally connect to the relevant paid service without interrupting use.

## Legal pages

Privacy, general terms, subscription terms and refund policy require professional review before launch, particularly because SFD targets several jurisdictions.

All four are built (`/privacy-policy/`, `/terms-and-conditions/`, `/subscription-terms/`, `/refund-policy/`) on the shared `legal-document` section, with the Privacy Policy as the approved reference for structure and styling: dark hero band with a "Last updated" pill, sticky "On this page" list (no `#` in the URL), numbered clauses, and a contact card. Drafting assumptions awaiting owner confirmation are recorded in `docs/10-decisions-and-todos.md`.


## Cookie Policy (2026-09-20)

`/cookie-policy/` uses the same `legal-document` blueprint as the other legal pages: what cookies are, categories, cookies used, third parties, your choices, changes, related policies.

## About: Mission and Vision (2026-09-20)

The About page credibility strip (`trust-signals`) was replaced by a `mission-vision` section directly after the hero: eyebrow, heading and two shared `.card` panels (Mission on the light fill, Vision on the brand-purple fill). Copy is in `data/pages/about.json`. The "25+ years" claim still appears in "Our Story". The Mission and Vision wording is a first draft for the owner to approve.

## Portfolio "Recent work" mockups (2026-09-20)

`/websites/portfolio/` shows each project as a responsive device mockup (desktop, tablet and phone screenshots of the live site, framed in CSS) with business type, name and a "View website" link (new tab), in a grid of three columns on desktop (64rem and up), two on tablets and one on phones; a lone last project is centred in the two-column layout. Principle taken from the reference (icreateyoursite.com/portfolio): let a multi-device image carry the page, with a minimal caption. Implemented as the `portfolio-showcase` section (`templates/sections/portfolio-showcase.njk`); the About page keeps the `portfolio-grid` cards. Screenshots are `assets/images/portfolio/<id>-<desktop|tablet|mobile>.jpg`, created by `node scripts/capture-portfolio.js [id]` (needs Chrome or Edge, dev only) and referenced from `images` in `data/projects.json`. They are snapshots: re-run the script when a client site changes. To add a project, add it to `projects.json`, run the script, and add its id to `itemIds` on the portfolio page.

## Case studies (2026-09-20)

Reference principles (icreateyoursite.com/case-studies): an index of cards (screenshot, business, short summary, service tags, link) plus a page per project. Built as an original SFD design:

- **Index** `/websites/case-studies/`: `case-study-grid` section, one shared `.card` per project with a cropped desktop screenshot, industry, summary and tags (from `caseStudy` in `data/projects.json`).
- **Detail** `/websites/case-studies/{id}/`: `case-study` section with breadcrumbs, intro, device mockup, facts (client, industry, work completed, live site), project overview, what the site needed to do, what it includes (feature cards), who it serves, optional `outcome`, "More case studies" and a free-preview CTA. One page JSON per case study (`data/pages/case-study-<id>.json`); client facts and screenshots come from `projects.json` via `projectId`.
- **SEO:** each page has a unique title ("<Industry> Website Case Study | SynergyFirst Digital"), meta description, keyword-natural H1 and H2s, breadcrumbs and internal links.
- **Honesty rule (CLAUDE.md rule 13):** these pages describe only what each live site visibly contains. No traffic, revenue or lead figures, no before-and-after, no invented client quotes or challenges. The blueprint sections "starting situation", "constraints", "before and after" and "verified outcome" stay empty until real, client-approved facts exist: add them to the page JSON (`outcome` renders automatically) rather than writing them from assumptions.
- To add a case study: add the project (with `images`, `caseStudy`) to `projects.json`, run `scripts/capture-portfolio.js`, add a `case-study-<id>.json` page, and add its id to the index `itemIds`.

## Services (2026-09-20)

`/services/` is an overview (hero, link cards for the five services, how it fits with the subscription, CTA). Each service page (`data/pages/service-<slug>.json`) uses existing sections: hero, overview content block, "what is included" feature grid, "how it fits" content block, related-service link cards and a free-preview CTA. Every inclusion statement must match `data/plans.json` (plan names, allowances) or the About page; no prices, guarantees, rankings, response times or invented statistics. Marketing and social media are stated to be outside the standard plans (only the Business plan's SEO blog posts are included).
