# Sitemap and Navigation

## Primary navigation

Desktop header (`data/navigation.json` `primary`), in order:

- About Us (dropdown: About Us, How It Works)
- Our Work (mega menu: Portfolio, Case Studies)
- Services (mega menu: five service pages)
- Pricing
- Resources (mega menu: Free Tools, Free Downloads, Blog)
- Contact Us
- CTA: Get a Free Preview

**How It Works is not a top-level item (2026-09-21).** It sits under About Us. The mobile bottom tab bar (Home, How It Works, Free Preview, Pricing) still has it, so it is not in the More drawer. The `/how-it-works/` URL is unchanged (no redirect), and the footer link and in-page calls to action still point to it.

The persistent header also exposes **Book a Free 20-Minute Call** without overwhelming the primary CTA. On smaller screens, both actions must remain easy to find.

## Canonical URL map

```text
/
/how-it-works/

/services/
/services/websites/
/services/seo/
/services/website-care-maintenance/
/services/digital-marketing-social-media/
/services/crm-lead-follow-up/       (2026-11-08; replaces /services/ai-automation/, which 301s here)

/industries/
/industries/garage-door-services/   (added 2026-11-02; linked from /industries/ and the Tree Services page since 2026-11-03; not yet from the homepage card or navigation)
/industries/tree-services/           (added 2026-11-03; linked from /industries/ and the Garage Door page; not yet from the homepage card or navigation)
/industries/roofing-exterior/        (added 2026-11-04; linked sitewide from the footer, plus homepage tile, /industries/, About and the other trade pages)
/industries/plumbing-hvac-electrical/ (added 2026-11-04; same linking as roofing)
/industries/fencing-concrete-remodeling/ (added 2026-11-04; same linking as roofing; completes the five homepage niches)

/websites/
/websites/portfolio/
/websites/case-studies/
/websites/case-studies/{case-study-slug}/

/pricing/
/pricing/seo/
/pricing/website-care/
/pricing/digital-marketing/
/about/

/resources/
/resources/free-tools/
/resources/free-tools/website-prompt-generator/
/resources/free-tools/image-resizer/
/resources/free-tools/invoice-generator/
/resources/blog/
/resources/blog/{article-slug}/

/contact/
/founding-clients/                  (2026-11-08)
/book-a-call/
/free-preview/

/privacy-policy/
/terms-and-conditions/
/subscription-terms/
/refund-policy/
/cookie-policy/
```

## Navigation principles

- The homepage must be available only at `/`.
- Use lowercase slugs with hyphens.
- Use trailing slashes consistently.
- Never expose `.html` extensions.
- Non-trailing-slash variants must permanently redirect to the canonical trailing-slash URL.
- Changed legacy URLs require explicit 301 redirects.
- Invalid paths return the 404 page with an actual 404 status.
- Breadcrumbs must reflect real hierarchy.
- Avoid creating empty industry or case-study pages solely for SEO.

## Header actions

Desktop recommendation:

- Logo on left.
- Main navigation in the center or right.
- Text or secondary button: Book a Free 20-Minute Call.
- Primary filled button: Get a Free Preview.

Mobile recommendation:

- Compact logo and menu trigger.
- Primary CTA visible without opening the menu when space allows.
- Full-screen accessible navigation drawer.
- Booking and preview CTAs clearly separated.

## Footer groups

- Websites: How It Works, Pricing, Portfolio, Case Studies.
- Services: the five service pages (Websites, SEO, Website Care & WordPress Maintenance, Digital Marketing & Social Media, and since 2026-11-08 CRM & Lead Follow-up, which replaced AI & Automation).
- Resources: Free Tools, Blog, FAQs if introduced.
- Company: About, Contact, Book a Call.
- Legal: Privacy, Terms, Subscription Terms, Refund Policy, Cookie Policy (plus the "Cookie settings" button that reopens the consent banner). These are not a column: since 2026-09-20 they sit as a centred horizontal row in the footer bottom bar, above the copyright line (`legalLinks` in `data/footer.json`), leaving four link columns. The Cookie Policy was added 2026-09-20 because EU visitors are a main target.
- Verified social links only. Do not use `#` placeholders.


## 404 and redirects (implemented 2026-09-20)

- Hosting is a Contabo VPS running CloudPanel (nginx). The build writes `deploy/nginx-redirects.conf` (gitignored, never inside `dist/`), to be pasted into the site's vhost in CloudPanel.
- The 404 page is `data/pages/not-found.json` (type `not-found`), rendered to `dist/404.html`. It has no canonical, `og:url` or schema, is never in the sitemap, and is served by nginx (`error_page 404 /404.html`) with a real 404 status. There is no homepage fallback anywhere.
- Legacy or renamed URLs go in `data/redirects.json` as `[{ "from": "/old/", "to": "/new/" }]`. The build rejects a `to` that is not a live page, a `from` that is a live page, and duplicates, so redirects are always a single permanent (301) hop. Both `/old/` and `/old` are emitted.
- Non-trailing-slash to trailing-slash is handled by nginx (`try_files $uri $uri/`, 301, relative `Location`). `/path/index.html` is redirected to `/path/`.
- `scripts/serve.js` reproduces all of this locally.

## Case study pages (2026-09-20)

Six case studies are live under `/websites/case-studies/`: `budget-opticals`, `cawt`, `cintaa-casting-portal`, `brandbook-company`, `siddhant-cinevision` and `ev-world360`. They use the same six projects as the portfolio, are in the sitemap automatically, carry breadcrumbs (visible and `BreadcrumbList` schema), and are linked from the portfolio ("Read the case study"), the index and each other ("More case studies").

- **Rename (2026-09-20):** the former Insights section is now **Blog** at `/resources/blog/` (and `/resources/blog/{article-slug}/`). `/resources/insights/` returns a single-hop 301 to it via `data/redirects.json`.

## Services replace Industries in the navigation (2026-09-20)

The header (mega menu and mobile More drawer) and footer now show **Services** instead of **Industries**. The Industries pages (`/industries/` and the five vertical pages) are **kept** and stay in the sitemap and canonical URL map; they are simply no longer linked from the header or footer (only from in-page links such as the homepage). Restore them by adding an item back in `data/navigation.json` and `data/footer.json`.

## Websites service page and landing page (2026-09-21)

`/services/website-design-development/` is now **`/services/websites/`** and the nav, footer and Services labels read **Websites**. The old URL returns a single-hop 301 (`data/redirects.json`). `/websites/` is unchanged: it stays the Our Work hub (Portfolio and Case Studies). `/services/websites/` is also the landing page for paid traffic (Meta ads), so it carries an enquiry form in the hero. Details in docs/04.

## All service pages share the Websites structure (2026-09-21)

Renamed with single-hop 301s in `data/redirects.json`: `/services/local-seo-google-visibility/` to **`/services/seo/`** (label "SEO") and `/services/automation-custom-solutions/` to **`/services/ai-automation/`** (label "AI & Automation"; **superseded 2026-11-08**: that page became `/services/crm-lead-follow-up/` and both old URLs now redirect to it). Website Care and Digital Marketing keep their slugs and labels. Services are now: Websites, SEO, Website Care & WordPress Maintenance, Digital Marketing & Social Media, CRM & Lead Follow-up. Structure and copy sources are in docs/04.

## Pricing pages per service (2026-10-02)
`/pricing/` is the Websites pricing page (the main product, so it keeps the shortest URL). Each other service has its own indexable page: `/pricing/seo/`, `/pricing/website-care/`, `/pricing/digital-marketing/` (and, until 2026-11-08, `/pricing/ai-automation/`, now a 301 to `/pricing/`), all generated from `data/pages/pricing.json` (`variants`, see docs/05). `/pricing/websites/` 301-redirects to `/pricing/` (`data/redirects.json`). The service pills on these pages are plain links; the "Pricing" header and tab-bar items stay highlighted on every `/pricing/...` page (the tab bar now uses the same prefix match as the header).

## Industries in navigation again (2026-11-03)
Supersedes the 2026-09-20 note that the header and footer show no Industries links. The trade landing pages (`/industries/garage-door-services/`, `/industries/tree-services/`) and the `/industries/` index are now linked sitewide: a new **Industries** footer group (Garage Door Services, Tree Services, All Industries), an **Industries** item in the Our Work mega menu and the Our Work group of the mobile More drawer (both to `/industries/`), tiles on the homepage (link-only change to the frozen homepage, authorised by the owner for internal linking), "Industries" cards in the link-card sections of `/services/websites/` and `/websites/`, and the two trade pages link to each other. The five old generic pages stay linked only from `/industries/` and About. A visible breadcrumb trail (Home / parent / current) now renders on every page that defines `breadcrumbs`.

## Founding Clients and CRM (2026-11-08)
`/founding-clients/` is linked from the footer Pages group (after Pricing) and from slim banners above the plans on the homepage and `/pricing/`. The fifth service is now **CRM & Lead Follow-up** at `/services/crm-lead-follow-up/` (Menu drawer, footer Services, Services hub, related cards). Removed: `/services/ai-automation/` (301 to the CRM page; the older `/services/automation-custom-solutions/` now points there in one hop) and `/pricing/ai-automation/` (301 to `/pricing/`; the Pricing pills are Websites, SEO, Website Care, Digital Marketing).
