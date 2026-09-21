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

The persistent header also exposes **Book a Free 30-Minute Discovery Call** without overwhelming the primary CTA. On smaller screens, both actions must remain easy to find.

## Canonical URL map

```text
/
/how-it-works/

/services/
/services/website-design-development/
/services/local-seo-google-visibility/
/services/website-care-maintenance/
/services/digital-marketing-social-media/
/services/automation-custom-solutions/

/industries/
/industries/home-services/
/industries/restaurants/
/industries/healthcare/
/industries/financial-services/
/industries/professional-services/

/websites/
/websites/portfolio/
/websites/case-studies/
/websites/case-studies/{case-study-slug}/

/pricing/
/about/

/resources/
/resources/free-tools/
/resources/free-tools/website-prompt-generator/
/resources/free-tools/image-resizer/
/resources/free-tools/invoice-generator/
/resources/blog/
/resources/blog/{article-slug}/

/contact/
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
- Text or secondary button: Book a Free 30-Minute Discovery Call.
- Primary filled button: Get a Free Preview.

Mobile recommendation:

- Compact logo and menu trigger.
- Primary CTA visible without opening the menu when space allows.
- Full-screen accessible navigation drawer.
- Booking and preview CTAs clearly separated.

## Footer groups

- Websites: How It Works, Pricing, Portfolio, Case Studies.
- Services: the five service pages (Website Design & Development, Local SEO & Google Visibility, Website Care & WordPress Maintenance, Digital Marketing & Social Media, Automation & Custom Solutions).
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
