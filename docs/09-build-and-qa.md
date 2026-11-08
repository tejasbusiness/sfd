# Build Phases and Quality Assurance

## Phase 1: Foundation

- Initialize project and package scripts.
- Establish Nunjucks rendering.
- Define source and output folders.
- Build JSON validation.
- Add safe HTML escaping/sanitization.
- Create base layout and design tokens.

## Phase 2: Shared interface

- Header and responsive navigation.
- Footer.
- Buttons, forms, cards, dialog and common sections.
- Accessibility and reduced-motion foundations.

## Phase 3: Conversion pages

- Homepage.
- How It Works.
- Pricing.
- Free Preview application.
- Book a Call page and modal frontend.

## Phase 4: Proof and market pages

- Industries index and initial industry pages.
- Websites and portfolio.
- Case-study templates.
- About.
- Resources and tools.
- Contact.

## Phase 5: Systems

- Preview mode.
- Booking integration contract and n8n workflows.
- Form processing.
- Analytics and consent policy.
- Redirect generation.
- Sitemap, robots and schema.

## Phase 6: Launch QA

### Functional

- All internal links resolve.
- Nested URLs work when loaded directly and refreshed.
- Invalid URLs return 404.
- Forms validate and submit once.
- Booking handles timezone, double-booking and failure states.
- Preview countdown uses the fixed expiry.
- Expired previews are inaccessible except for expiry messaging.

### SEO

- No production `noindex`.
- No temporary-domain canonicals or schema.
- Every page has unique metadata.
- Sitemap and robots use the production domain.
- Structured data validates and matches visible content.
- Redirects are single-hop permanent redirects.

### Accessibility

- Keyboard navigation.
- Modal focus management.
- Visible focus.
- Screen-reader form labels and errors.
- Colour contrast.
- Reduced motion.
- Zoom and reflow.

### Visual and responsive

- Common current desktop widths.
- Tablet portrait and landscape.
- Small and large mobile widths.
- Long headings and translated text resilience.
- No horizontal overflow.
- Image cropping and aspect ratios.

### Performance and security

- Optimized images and fonts.
- Minimal script payload.
- No secrets in source or generated files.
- Security headers defined at deployment.
- External scripts reviewed.
- Spam and rate controls verified.

## Definition of done

The website is complete only when content, conversions, direct URLs, metadata, accessibility, responsive layouts, booking integration and failure states have been verified. A visually complete homepage alone is not completion.

## Legal-launch QA additions

- All four legal pages (`/privacy-policy/`, `/terms-and-conditions/`, `/subscription-terms/`, `/refund-policy/`) reviewed by a qualified lawyer for the targeted jurisdictions, and the drafting assumptions in `docs/10-decisions-and-todos.md` confirmed.
- Cookie/analytics clause of the Privacy Policy matches the analytics and consent banner actually shipped.
- Footer legal links, form consent-checkbox links and cross-links between legal pages resolve.
- Legal contents list works with keyboard and without JavaScript, and the URL never shows `#section-id` after a click.

## SEO infrastructure QA (2026-09-20)

- `npm run build` runs the SEO output audit automatically; `npm run test:validation` (which also runs the demo-kit tests, docs/15) covers domain, uniqueness, redirect and sitemap rules.
- Manual, with `npm run serve`: `/pricing` returns 301 to `/pricing/`; `/pricing/index.html` returns 301; `/nope/` returns 404 with the branded page; `/404.html` returns 404; `/sitemap.xml` and `/robots.txt` load.
- On the VPS after deploy: repeat the same checks against the real domain with `curl -I`, and confirm the vhost snippet from `deploy/nginx-redirects.conf` is installed.

## Internal link checks (2026-11-03)
`scripts/check-output.js` now also fails the build when a root-relative link in a built page does not reach a built page or file, and when an indexable page (other than the homepage) has no inbound link from any other page. Navigation and footer links were already validated in `validate-data.js`. The check does not yet require a link from page body content (About, Services and the three Resources pages are linked only from the header and footer).

## Responsive QA method (2026-11-08)
Learned while fixing the hero stickers and the footer overflow; use it for any page that changes layout.
- **Widths:** check 390, 768, 820, 900, 1024, 1280, 1440 and 1920. 900px matters: it is where a 4-column grid at the 900px breakpoint overflowed, and where tablets in landscape and small browser windows sit. Also test just below and above each breakpoint (999 and 1000, 1199 and 1200).
- **Sideways scroll:** in a browser, load each page in a same-origin iframe of the target width and compare `document.documentElement.scrollWidth` with the width (the sweep of all 40 sitemap pages at 900px found none after the footer fix). `npm run serve` serves the build; loading pages takes about 3 seconds each, so sweep one width at a time.
- **Floating or absolutely positioned decoration** (stickers, badges): measure the bounding boxes of every such element against every headline word, the sub-copy, each button, the hero edges and each other, after the entrance animation has finished (an element still scaling in has a zero-size box and gives a false pass). Positions anchored to the bottom of the content (the buttons) stay stable across widths.
- **Look at it:** a screenshot of the iframe at one phone, one tablet and one desktop width; numbers alone missed a clipped label inside a small star.
- **Cascade:** `homepage.css` and other page stylesheets load after `studio-layout.css`; if a rule seems ignored, check the later file for the same selector before raising specificity.
