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

