# SEO, Accessibility and Performance

## SEO fundamentals

- Unique title, meta description, H1 and canonical for every indexable page.
- Canonicals use `https://synergyfirstdigital.com/` and the exact trailing-slash path.
- Production robots are indexable unless a page has an explicit valid reason not to be.
- Sitemap contains only canonical production URLs.
- Open Graph and social images use the production domain.
- Organization and WebSite schema use the production domain.
- Use Service, LocalBusiness/ProfessionalService, BreadcrumbList, FAQPage, Article and other schema only when page content supports them.
- Generate structured data from verified JSON.
- Maintain explicit redirects from replaced legacy URLs.
- Preview sites are always excluded from search.

## International audience

Initial site language is English. Do not add `hreflang` until genuine localized pages exist. German or other European landing pages must be professionally localized, not mechanically duplicated.

USD pricing must clearly state taxes and third-party charges according to final commercial policy.

## Content quality

- Avoid doorway-style location or industry pages.
- Never fabricate local presence.
- Avoid unsupported superlatives and guarantees.
- Use real portfolio and review evidence.
- Write for buying intent first and keywords second.

## Accessibility

Target WCAG 2.2 AA:

- Semantic landmarks and heading hierarchy.
- Skip link.
- Keyboard-complete navigation and modal.
- Focus trapping and focus return for dialogs.
- Visible focus indicators.
- Accessible labels and errors.
- Sufficient colour contrast.
- Alt text for meaningful images; empty alt for decoration.
- Reduced-motion support.
- Touch targets of at least approximately 44 by 44 CSS pixels.
- No information available only on hover or through colour.
- Form errors associated with fields and summarized when helpful.

## Performance

- Static HTML and minimal JavaScript.
- Responsive images with explicit dimensions.
- Modern image formats with safe fallbacks where needed.
- Lazy-load below-the-fold media.
- Do not lazy-load the primary LCP image.
- Self-host fonts when permitted and subset weights.
- Avoid animation libraries unless a clear requirement justifies them.
- Defer non-critical scripts.
- Establish Core Web Vitals targets before launch.

## Additions (2026-09-20)

- Legal pages: the "On this page" list is a labelled `<nav>`; `assets/js/legal-toc.js` scrolls to the clause without writing `#section-id` into the URL and moves focus to the clause heading; links keep their `#` hrefs as the no-JavaScript fallback. Clause anchors use a 96px scroll margin to clear the sticky header.
- Link hover underlines (header, footer) also trigger on `:focus-visible`, and transitions are disabled under `prefers-reduced-motion`.
- Gold accent text and icons appear only on dark backgrounds; on light backgrounds use `--color-accent-warm`.
- Legal pages must be reviewed by a qualified lawyer before launch; the cookie/analytics wording must match the real analytics and consent set-up.

## SEO infrastructure (2026-09-20)

- `dist/sitemap.xml` is generated from every indexable page (not `internal-diagnostic` or `not-found`, no `noindex`), production domain only, `lastmod` from a page's `lastUpdated` when present.
- `dist/robots.txt` is `Allow: /` plus the production `Sitemap:` line. Preview builds (docs/06) must ship their own disallow-all robots file plus the `X-Robots-Tag` header.
- Build-time checks (fail the build): `site.productionDomain` must be a bare `https` origin on a non-temporary host; unique `seo.title` and `seo.metaDescription` per page (duplicate H1 is a warning); valid `seo.robots`; `seo.ogImage` root-relative and existing on disk (warning in development, error in production); redirect rules valid. After rendering, `scripts/check-output.js` audits `dist/`: canonical and `og:url` equal the production URL, `og:image` and every JSON-LD URL are on the production domain (except the `schema.org` context), JSON-LD parses, an `<h1>` exists, no `noindex` in production, sitemap and robots correct.
- **Resolved 2026-09-21:** `/assets/images/og-default.jpg` (1200x630 JPEG, 72 KB) was supplied by the owner (AI-generated: dark purple and gold, headline "Professionally built websites on one simple monthly plan", laptop and phone mockups, no logo or claims). `npm run build:production` now passes. Optional polish: move the devices about 5% left so they clear the crop margin, enlarge the brand name, or use the real logo. Individual pages can override it with `seo.ogImage`.

## Cookie consent (2026-09-20)

- Non-modal banner (`templates/partials/cookie-banner.njk`, copy in `data/footer.json` `cookieConsent`, behaviour `assets/js/cookie-consent.js`). Categories: Necessary (always on), Analytics, Marketing. Reject all and Accept all have equal prominence; Customise reveals per-category checkboxes.
- The choice is one first-party cookie, `sfd_consent` (JSON with version and timestamp), 180 days, `SameSite=Lax`, `Secure` on https. Bumping `cookieConsent.version` in `footer.json` asks every visitor again. The footer "Cookie settings" button reopens it; Escape closes it only once a choice exists.
- No analytics or marketing scripts exist yet. Any future script must check `window.sfdConsent.has('analytics')` or listen for the `sfd:consent` event before loading.
- Server-side consent proof (`consents` table) arrives with the API (see the plan in docs/10).
