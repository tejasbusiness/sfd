# SynergyFirst Digital Website Foundation

This folder is the source of truth for rebuilding the SynergyFirst Digital (SFD) website.

The new SFD website is not a conventional agency brochure. It presents a productized Website-as-a-Service offer for non-Indian local businesses. Qualified prospects can request or receive a complimentary private website preview, review it for seven days, and activate it through a monthly subscription.

## Confirmed direction

- Target geography: USA, Canada, Australia, New Zealand, Germany and other European countries.
- Currency: USD only.
- Primary offer: professionally built and managed websites for a predictable monthly fee.
- Primary CTA: **Request Your Free Preview Website**.
- Immediate CTA: **Book a Free 30-Minute Discovery Call**.
- Secondary CTA: **See How It Works** or **View Websites**, depending on context.
- Theme: light, premium, modern, conversion-focused.
- Design inspiration: Numerique for clarity, Lettery Home 2 for editorial personality and restrained Gesto influence for energy.
- Architecture: framework-independent static site generated from JSON and Nunjucks templates.
- Production output: plain HTML, CSS, JavaScript, images and fonts.
- Public URLs: clean WordPress-style URLs with trailing slashes.
- Content: strategically rewritten; never copy inspiration-site content.

## Documents

1. `CLAUDE.md` — mandatory instructions for Claude.
2. `docs/01-business-and-offer.md` — positioning, audience and conversion model.
3. `docs/02-sitemap-and-navigation.md` — pages, URLs and navigation.
4. `docs/03-design-system.md` — light-theme visual direction.
5. `docs/04-page-blueprints.md` — section flow for every important page.
6. `docs/05-data-architecture.md` — JSON, templates and generated output.
7. `docs/06-preview-mode.md` — seven-day private preview system.
8. `docs/07-booking-engine.md` — Google Meet, Calendar and Sheets workflow.
9. `docs/08-seo-accessibility.md` — SEO, schema, accessibility and performance.
10. `docs/09-build-and-qa.md` — implementation phases and acceptance checks.
11. `docs/10-decisions-and-todos.md` — confirmed decisions and unresolved inputs.
12. `docs/14-database-and-api.md` — MySQL, migrations, PHP API and environment files.

## Working rule

Claude must read all documents before generating code. If documents conflict, `docs/10-decisions-and-todos.md` contains the latest explicit decisions. Unknown facts must remain marked as `TBD`; they must never be invented.

