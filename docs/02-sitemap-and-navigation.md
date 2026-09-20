# Sitemap and Navigation

## Primary navigation

- Home
- How It Works
- Industries
- Websites
- Pricing
- About
- Resources
- Contact
- CTA: Get a Free Preview

The persistent header also exposes **Book a Free 30-Minute Discovery Call** without overwhelming the primary CTA. On smaller screens, both actions must remain easy to find.

## Canonical URL map

```text
/
/how-it-works/

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
/resources/insights/
/resources/insights/{article-slug}/

/contact/
/book-a-call/
/free-preview/

/privacy-policy/
/terms-and-conditions/
/subscription-terms/
/refund-policy/
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
- Industries: five industry pages.
- Resources: Free Tools, Insights, FAQs if introduced.
- Company: About, Contact, Book a Call.
- Legal: Privacy, Terms, Subscription Terms, Refund Policy, Cookie Policy (plus the "Cookie settings" button that reopens the consent banner). These are not a column: since 2026-09-20 they sit as a centred horizontal row in the footer bottom bar, above the copyright line (`legalLinks` in `data/footer.json`), leaving four link columns. The Cookie Policy was added 2026-09-20 because EU visitors are a main target.
- Verified social links only. Do not use `#` placeholders.


## 404 and redirects (implemented 2026-09-20)

- Hosting is a Contabo VPS running CloudPanel (nginx). The build writes `deploy/nginx-redirects.conf` (gitignored, never inside `dist/`), to be pasted into the site's vhost in CloudPanel.
- The 404 page is `data/pages/not-found.json` (type `not-found`), rendered to `dist/404.html`. It has no canonical, `og:url` or schema, is never in the sitemap, and is served by nginx (`error_page 404 /404.html`) with a real 404 status. There is no homepage fallback anywhere.
- Legacy or renamed URLs go in `data/redirects.json` as `[{ "from": "/old/", "to": "/new/" }]`. The build rejects a `to` that is not a live page, a `from` that is a live page, and duplicates, so redirects are always a single permanent (301) hop. Both `/old/` and `/old` are emitted.
- Non-trailing-slash to trailing-slash is handled by nginx (`try_files $uri $uri/`, 301, relative `Location`). `/path/index.html` is redirected to `/path/`.
- `scripts/serve.js` reproduces all of this locally.
