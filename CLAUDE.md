# Claude Project Instructions

You are building the production website for SynergyFirst Digital (SFD).

Read `README.md` and every Markdown file inside `docs/` before changing or generating implementation files. Create and maintain a short checklist showing which requirements you are implementing.

## Non-negotiable rules

1. Do not use React, Next.js, Vue, Astro, WordPress, a page builder or a frontend CSS framework.
2. Use semantic HTML5, custom CSS, vanilla JavaScript, Nunjucks templates and JSON content.
3. Use a small Node.js build process only during development and deployment. The production server must not need Node.js. Form and booking handling is a small PHP API under `/api/` with MySQL (`docs/14-database-and-api.md`); page content is still static HTML.
4. Generate complete static HTML. Do not fetch primary page content from JSON in the browser.
5. Store page content in JSON. Store shared company, navigation, footer, theme, testimonials and configuration data in shared JSON files.
6. Generate clean directory URLs ending with `/`, such as `/pricing/` and `/industries/home-services/`.
7. Generate unique metadata, canonical URLs and structured data for every indexable page.
8. Never use `noindex` on production pages. Preview sites are the exception and must always be `noindex, nofollow`.
9. Never point canonicals, Open Graph URLs, schema or sitemaps to a temporary domain.
10. Invalid URLs must return a genuine 404. Never serve the homepage as a catch-all fallback.
11. Keep all Google credentials, calendar IDs, sheet IDs and webhook secrets out of browser code and public JSON.
12. Build accessible keyboard interactions, visible focus states, reduced-motion behaviour and WCAG 2.2 AA colour contrast.
13. Do not invent testimonials, project results, client logos, awards, addresses, pricing, response times or statistics.
14. Do not copy layouts, writing or branded assets from inspiration sites. Extract principles and create an original SFD system.
15. Do not start large implementation changes if a required decision is marked `BLOCKING` in `docs/10-decisions-and-todos.md`.
16. Every form and form control (inputs, textareas, selects, phone, the booking modal, and any future form) must use the shared form system: `templates/partials/form-fields.njk` macros inside `.sfd-form`, `assets/js/form-utils.js` validation, and the `--color-field-border` border that stays unchanged on focus. Do not write custom field markup or styling. See "Forms" in `docs/03-design-system.md`.
17. Every card-like surface must be built on the shared `.card` (same radius, border, padding and hover rules). Variants may change fill or emphasis only. See "Cards" in `docs/03-design-system.md`.

## Product hierarchy

- Primary product: monthly managed website subscription.
- Primary conversion: Free Website Preview application.
- Immediate conversion: 30-minute Google Meet call.
- Supporting services: SEO, Google Business Profile support, AI, WhatsApp, CRM and automation.
- Supporting services must not dilute the website-subscription offer on the homepage.

## Development behaviour

- Work in small, reviewable phases.
- Preserve existing user changes.
- Explain assumptions before acting on them.
- Validate JSON before every build.
- Fail the build on missing required SEO or page fields.
- Prefer reusable components, but do not create unnecessary abstraction.
- Keep client-facing copy separate from templates and JavaScript.
- Test direct navigation and refreshes for nested routes.
- Maintain a decision log when requirements change.
- **Mandatory, non-negotiable:** before ending any session, fully update every affected document in `docs/` (and `README.md` / this file where relevant) so it matches what was built and decided, and commit them with the code. Never end a session with stale docs.

## Initial implementation order

1. Project structure and build pipeline.
2. JSON validation and shared data.
3. Base layout, header, footer and accessibility foundations.
4. Design tokens and responsive CSS.
5. Homepage.
6. How It Works, Pricing and Free Preview pages.
7. Industries and Websites sections.
8. About, Resources, Contact and legal pages.
9. Booking modal frontend and secure integration contract.
10. Preview-mode system.
11. SEO, schema, sitemap, redirects and 404.
12. Cross-browser, responsive, performance and accessibility QA.

