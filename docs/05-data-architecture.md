# Data and Static-Build Architecture

## Source structure

```text
data/
  site.json
  company.json
  navigation.json
  footer.json
  theme.json
  integrations.public.json
  redirects.json
  clients.json
  testimonials.json
  faqs.json
  plans.json
  pages/
  industries/
  projects/
  case-studies/
  articles/

templates/
  layouts/
  pages/
  sections/
  components/
  partials/
  schema/

assets/
  css/
  js/
  images/
  icons/
  fonts/

scripts/
  build.js
  validate-data.js
  generate-pages.js
  generate-schema.js
  generate-sitemap.js
  generate-robots.js
  validate-links.js

public/
dist/
```

## Output model

JSON is the source of truth, but the build must render content into full HTML. Primary page content must not depend on client-side JSON fetching.

Example output:

```text
dist/
  index.html
  pricing/index.html
  industries/index.html
  industries/home-services/index.html
  book-a-call/index.html
  404.html
  sitemap.xml
  robots.txt
```

## Shared versus page data

Shared data belongs in company, navigation, theme, footer, plan, testimonial and integration files. Page-specific JSON controls URL, SEO, hero, section order, CTAs, FAQ selection and structured data.

Do not duplicate shared content into every page file.

## Required page fields

Each indexable page requires:

- Stable identifier.
- Page type.
- Slug and canonical path.
- Title and meta description.
- Open Graph title, description and image.
- Robots setting.
- H1.
- Breadcrumb configuration where relevant.
- Page sections.
- Schema types.
- Last-updated value when used publicly.

The build must fail when required fields are absent, canonical paths collide, slugs are invalid or navigation links target missing pages.

## Content-block model

Pages may select tested blocks such as hero, proof strip, process, feature grid, service list, project showcase, comparison table, testimonial, FAQ, booking CTA and free-preview CTA.

JSON must contain content and configuration, not raw arbitrary HTML. Limited rich text should use a controlled Markdown or structured-block format and be sanitized during build.

## Public and private configuration

Public JSON may contain labels, URLs, feature flags and non-secret IDs that are safe to expose. Secrets must be supplied only to secure backend workflows or deployment environments.

Never store OAuth credentials, service-account keys, Calendar IDs intended to be private, Sheet IDs, webhook secrets or API secrets inside public files.

