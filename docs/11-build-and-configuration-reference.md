# Build and Configuration Reference

Technical addendum to `docs/09-build-and-qa.md`, documenting what Phase 1 actually implemented. Business, design and integration requirements remain defined by `docs/01`–`docs/10`; this file only documents the mechanics of the build itself.

## Build modes

The build recognizes three modes via `--mode=<value>` (CLI, takes precedence) or the `BUILD_MODE` environment variable, defaulting to `development`:

- **development** — unresolved `TBD` placeholders are reported as warnings only. Used while blocking decisions in `docs/10-decisions-and-todos.md` remain open.
- **production** — unresolved `TBD` placeholders fail the build, and any indexable page (any `type` other than `internal-diagnostic`) using `noindex` fails the build (CLAUDE.md rule 8).
- **preview** — recognized as a valid value so it can be wired up later, but currently exits with an explicit "not implemented yet" error. Real preview builds (Phase 5) will read from separate prospect-specific data inputs and write to an isolated deployment destination — never the `data/` directory or `dist/` output used for the production site — so prospect data can never leak into `synergyfirstdigital.com`.

## npm scripts

| Script | What it does |
|---|---|
| `npm run validate` | Validates `data/` in development mode (TBD = warning). |
| `npm run validate:production` | Validates `data/` in production mode (TBD = error). |
| `npm run build` | Validates, then renders `data/pages/*.json` into `dist/` in development mode. |
| `npm run build:production` | Same, in production mode. Fails today because `data/company.json` still has BLOCKING `TBD` fields — this is correct, expected behaviour, not a bug. |
| `npm run rebuild` | `clean` then `build`. |
| `npm run clean` | Removes `dist/`. |
| `npm run test:validation` | Runs the fixture-based validation test suite in `tests/`. |

## Environment variables

See `.env.example`. All listed variables are consumed by the n8n booking workflow or hosting environment, not by this Node build — this repo's build process does not currently read any secret. `.env` itself is gitignored; only `.env.example` (names, no values) is committed.

## Validation rules currently enforced (`scripts/validate-data.js`)

- Every shared file in `REQUIRED_SHARED_FILES` (`site.json`, `company.json`, `navigation.json`, `footer.json`, `theme.json`) must exist.
- Every page under `data/pages/` must have: `id`, `type`, `slug`, `canonicalPath`, `seo`, `h1`, `sections` (non-empty), `schemaTypes` (non-empty).
- `seo` must include `title`, `metaDescription`, `ogTitle`, `ogDescription`, `ogImage`, `robots`.
- `slug` must be lowercase, hyphen-separated (`^[a-z0-9]+(-[a-z0-9]+)*$`).
- `canonicalPath` must start and end with `/`, lowercase hyphenated segments only.
- No two pages may share a `canonicalPath`.
- Every `navigation.primary` entry must point at a `canonicalPath` that actually exists (external `http(s)://` links are exempt).
- In production mode, no page except `type: "internal-diagnostic"` may set `robots` to a `noindex` value.
- Any string value anywhere in a shared file or page file containing the whole word `TBD` is a warning in development and an error in production. Keys starting with `_` (scaffold notes) are exempt from this scan.

The build fails (non-zero exit) on any validation error, per CLAUDE.md's "fail the build on missing required SEO or page fields" rule.

## Data files intentionally not yet created

`clients.json`, `testimonials.json`, `faqs.json`, `plans.json` from the `docs/05-data-architecture.md` structure are deferred until the pages that consume them are actually built (Phase 3–4), so no unused placeholder files accumulate. `scripts/generate-schema.js`, `generate-sitemap.js`, `generate-robots.js`, `validate-links.js` are deferred to Phase 5 for the same reason.

## Known Phase 1 limitations

- Fonts (Manrope/Inter) are referenced by name in `tokens.css` with system-font fallbacks; no font files are self-hosted yet — licensing/selection is still open per `docs/03-design-system.md`.
- The `build-check` diagnostic page is not real site content and is excluded from the "no noindex" rule via its `internal-diagnostic` type. It must be deleted (or the exception removed) before Phase 6 launch QA.
- `integrations.public.json` contains `payment.provider: null` as a documented extension point only — no payment provider is integrated or implied.

## SEO scripts (added 2026-09-20)

- `scripts/generate-seo.js` writes `dist/sitemap.xml`, `dist/robots.txt` and `deploy/nginx-redirects.conf` (outside `dist/` so it is never public). `scripts/check-output.js` audits the rendered `dist/` (see docs/08). Both run inside `scripts/build.js`. `npm run clean` removes `dist/` and `deploy/`.
- `validate-data.js` gained `validateSite`, `validateSeoAcrossPages` and `validateRedirects`; `redirects.json` is now a loaded shared file. This supersedes the "deferred" note above for sitemap and robots; a separate `validate-links.js` is still deferred.
- Page type `not-found` renders to `dist/404.html` (no canonical, `og:url` or schema).
- `npm run build:production` passes (the `og-default.jpg` blocker was resolved 2026-09-21).

## Backend scripts (added 2026-09-20)

`npm run tunnel` (SSH tunnel to the live MySQL), `npm run migrate` and `npm run migrate:status` (run `api/bin/migrate.php`; PHP 8.2+ required locally). Environment files: `.env` (server) and `.env-local` (local), both gitignored; names in `.env.example`. Details in `docs/14-database-and-api.md`.

`scripts/capture-portfolio.js` (development only, not part of the build) takes portfolio screenshots with headless Chrome or Edge over the DevTools protocol; see docs/04.
