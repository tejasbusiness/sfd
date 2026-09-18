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

