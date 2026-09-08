# AI handoff — SynergyFirst Digital

This file is the shared continuity record for Codex and Claude in VS Code. Keep it current whenever responsibility moves from one assistant to the other. The working method is one fresh chat per bounded task so context and token use stay controlled.

## Repository

- Local folder: `C:\Users\victus\Downloads\03 - Business - SynergyFirst Digital\sfd-2026\github-sfd-replace`
- GitHub: `https://github.com/tejasbusiness/sfd.git`
- Branch: `main`
- Production domain: `https://synergyfirstdigital.com`
- CloudPanel document root: `/home/synergyfirstdigital-com/htdocs/synergyfirstdigital.com`
- GitHub Actions workflow: `.github/workflows/deploy-contabo.yml`
- A successful push to `main` builds and deploys `dist/client/` to the production document root.

Do not work in the sibling `website` folder. It is an earlier working copy and is no longer the deployment source.

## Product brief

SynergyFirst Digital is an agency offering Web Design, Local SEO, AI Automation, one-to-one Website Consultation, Social Media Marketing, and WhatsApp Business API services.

The website is a static, multi-page agency site with Home, About, one page per service, Case Studies, Portfolio, three free browser tools, Pricing, Contact, and Book a Call. Page content is loaded at build time from JSON files under `data/`; there is no database.

The design direction is bold, modern, motion-led agency work inspired by the interaction quality of `https://obermann-webdesign.de/`. It must remain an original design and must not feel editorial, generic, or AI-generated. The Services and How We Work sections use scroll-linked card-spread motion. The hero uses a custom Three.js SFD object with reduced-motion and performance fallbacks.

## Architecture

- Vinext + React + Vite static export
- TypeScript
- Build output: `dist/client`
- Styling: `app/globals.css` and `app/pages.css`
- Homepage: `app/page.tsx`
- Dynamic static pages: `app/[...slug]/page.tsx`
- Shared content loader: `lib/content.ts`
- Global content: `data/site.json`, `data/navigation.json`, `data/home.json`
- Page content: `data/pages/**`
- Main motion system: `components/page-motion.tsx`
- Hero visual: `components/hero-scene.tsx`
- Booking: `components/booking.tsx`
- Browser tools: `components/tools.tsx`

## SEO and AIO/AEO requirements

Preserve unique titles and descriptions, canonical URLs, Open Graph/Twitter metadata, semantic heading order, crawlable internal links, robots and sitemap output, descriptive service copy, FAQ content, Organization/WebSite/Breadcrumb/Service structured data, accessible images, and useful 404 behavior.

Do not enable indexing until the final domain and business details have been checked. `data/site.json` controls the site URL and `productionReady` flag.

## Project records

- `docs/AI-HANDOFF.md`: current task state and the exact next action; update at the end of every task.
- `docs/ROADMAP.md`: planned outcomes, priorities, milestone status, and external blockers; update only when one of these changes.
- `docs/DECISIONS.md`: durable architecture, design, deployment, and workflow choices; add an entry only when a new lasting decision is made.
- Git history: chronological record of completed work. Do not duplicate it in a separate progress or activity log.

## Current state — 2026-09-08

- The replacement website is committed to the GitHub repository.
- The GitHub Actions deployment completed successfully (green).
- The deployment workflow and repository secrets are configured.
- The local branch and `origin/main` currently differ by one commit each: the local commit contains only this handoff setup, while the remote has a newer commit that has not been reviewed locally. Fetch and reconcile them before further production work; never force-push over the remote commit.
- The last full local validation passed: production build, 21-page static-site checks, and 5 tool calculation tests.
- An owner-only preview also exists at `https://synergyfirst-digital-2026.socialtejas.chatgpt.site`.

## Known launch items

These require real business information or an explicit launch decision:

- `data/site.json` still points to the old preview URL and has `productionReady: false`.
- Email, phone, WhatsApp destination, and Cal.com booking URL are blank.
- The booking component therefore displays a clearly marked demo calendar and cannot reserve a call.
- Pricing remains enquiry-based.
- Case studies, portfolio results, and testimonials must use approved real client material.
- Privacy and terms copy is provisional and needs business/legal review.

## Switching protocol

Only one assistant should edit the repository at a time.

Start a fresh chat for every new task. Do not reuse a long chat for unrelated work. Paste one of the prompts from `docs/SESSION-PROMPTS.md`; the repository files provide the durable context.

Before starting a task:

1. Open this exact repository folder in VS Code.
2. Read `AGENTS.md`, `CLAUDE.md`, and this file.
3. Inspect `git status` and the latest commits.
4. If the other assistant left uncommitted changes, review and continue them; do not discard or overwrite them.
5. Inspect only the task-relevant files unless the evidence requires a wider search.

Before switching assistants:

1. Finish a coherent change or leave a clear description of the incomplete work.
2. Run the relevant validation commands.
3. Always update the handoff block below.
4. Update the roadmap or decision record only when the task changed them.
5. Create a Git commit when the change is ready for a checkpoint. Push only when the user wants production deployment.

If credits or context end unexpectedly, open a fresh chat with the other assistant and use the interrupted-task prompt in `docs/SESSION-PROMPTS.md`. The incoming assistant must inspect the working tree and validate the existing changes before continuing.

## Active handoff

- Current task: Define the end-task records for fresh Codex and Claude sessions.
- Status: Complete locally. The handoff, roadmap, decision record, and Git log now have separate responsibilities.
- Files changed: `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/AI-HANDOFF.md`, `docs/SESSION-PROMPTS.md`, `docs/ROADMAP.md`, and `docs/DECISIONS.md`.
- Validation: Cross-references reviewed and `git diff --check` passed. No application build was needed because only documentation changed.
- Next action: Start the next bounded website task in a fresh VS Code chat using `docs/SESSION-PROMPTS.md`.
- Last assistant: Codex
- Last updated: 2026-09-08
