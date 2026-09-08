# SynergyFirst Digital

Static agency website inspired by the user-selected Obermann reference. It includes a custom scroll-linked 3D SFD mark, shared navigation, six service pages, browser tools, a booking component, and supporting pages.

## Continue with Codex or Claude in VS Code

Open `..\SynergyFirst-Digital.code-workspace`. Both assistants should read `AGENTS.md`, `CLAUDE.md`, and `docs/AI-HANDOFF.md` before changing the project. Work with only one assistant at a time, and update the active handoff before switching. `docs/ROADMAP.md` tracks future outcomes, `docs/DECISIONS.md` records durable choices, and Git commits provide the chronological progress log. Reusable startup, recovery, and end-task prompts are in `docs/SESSION-PROMPTS.md`.

## Run and build

- `npm install`
- `npm run dev -- --port 3000`
- `npm run build`
- `npm run check`
- `npm run test:tools`

The build outputs plain HTML, CSS, JavaScript, and font assets to `dist/client`. No production server or database is required. The generated starter uses Vinext, React, and Vite with static export; the prior Astro suggestion was superseded by the Sites starter requirement.

## Content

Edit `data/home.json`, `data/site.json`, `data/navigation.json`, and the individual page JSON files under `data/pages`. Rebuild after edits. `scripts/create-content.mjs` records the original content seed; do not rerun it after editing content, since it overwrites seeded page JSON.

## Before public launch

1. Set the final domain in `data/site.json` and update any business contact details.
2. Connect `bookingUrl` to an HTTPS Cal.com event URL. The empty configuration deliberately shows a clearly labeled scheduling demo and cannot reserve appointments. Replace the sample duration with the actual event duration.
3. Confirm service scope, pricing, business facts, and provisional privacy/terms copy.
4. Add approved client work and testimonials. No fictional client projects or results are published.
5. Finish browser/device QA, including 3D scroll matching, keyboard navigation, and invoice print layout.
6. Set `productionReady` to true only when ready for indexing, then rebuild. Preview pages currently use noindex; the sitemap stays empty until this flag changes.
7. Connect Search Console, Bing Webmaster Tools, and analytics if desired. No tracking credentials are included.

## Validation and limits

TypeScript checks and static export are automated. `validate-export.mjs` checks page headings, metadata, JSON-LD, and local asset/link targets. Tool tests cover invoice arithmetic and image geometry/limits. Browser interaction, WebGL rendering, and print output require visual QA; they have not been verified in this implementation turn.

The prompt generator exposes an optional `generate_website_prompt` WebMCP action when a compatible browser provides `document.modelContext`. Registration is feature-detected and failures do not affect ordinary use. No supported WebMCP validation session was available during implementation; it is not claimed as verified.

The starter dependency audit reports advisories in build/server tooling. This delivery exports static assets and does not deploy the affected RSC/dev server. Review patched compatible starter versions before exposing any development server or adopting a server runtime. The local development server binds to loopback.

The reference's exact animation timelines were not extracted. Motion is an original recreation of its observed effect and needs comparison in the browser before claiming a close visual match.
