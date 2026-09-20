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

`/websites/portfolio/` shows each project as a responsive device mockup (desktop, tablet and phone screenshots of the live site, framed in CSS) with business type, name and a "View website" link (new tab), stacked one per row. Principle taken from the reference (icreateyoursite.com/portfolio): let a multi-device image carry the page, with a minimal caption. Implemented as the `portfolio-showcase` section (`templates/sections/portfolio-showcase.njk`); the About page keeps the `portfolio-grid` cards. Screenshots are `assets/images/portfolio/<id>-<desktop|tablet|mobile>.jpg`, created by `node scripts/capture-portfolio.js [id]` (needs Chrome or Edge, dev only) and referenced from `images` in `data/projects.json`. They are snapshots: re-run the script when a client site changes. To add a project, add it to `projects.json`, run the script, and add its id to `itemIds` on the portfolio page.
