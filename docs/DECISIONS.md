# Decision record

This file records durable project decisions so a fresh assistant does not reopen settled choices without new evidence. Add an entry only when a decision affects future work.

## D-001 — Static JSON-backed architecture

- Status: Accepted
- Decision: Keep the website as a static Vinext/React/Vite export. Store editable page content in JSON under `data/`, with no database.
- Reason: The site needs fast, simple hosting and predictable content management without a server runtime.

## D-002 — Original agency design direction

- Status: Accepted
- Decision: Use Obermann as a reference for motion quality and composition principles while keeping the implementation, copy, layout, and assets original.
- Reason: The site should feel like a deliberate modern agency website and avoid editorial layouts, generic templates, and AI-generated visual language.

## D-003 — Production deployment through GitHub Actions

- Status: Accepted
- Decision: Treat `github-sfd-replace` and `https://github.com/tejasbusiness/sfd.git` as the source of truth. A push to `main` builds and deploys `dist/client/` to the Contabo CloudPanel document root.
- Reason: This creates a repeatable deployment path and removes manual file replacement from routine releases.

## D-004 — One fresh assistant session per task

- Status: Accepted
- Decision: Start a new Codex or Claude chat for each bounded task. Use repository instructions and the shared handoff instead of relying on long chat history.
- Reason: This limits token use, reduces stale context, and makes unsupported assumptions easier to detect.

## D-005 — Minimal project records

- Status: Accepted
- Decision: Use `docs/AI-HANDOFF.md` for current state, `docs/ROADMAP.md` for future outcomes, `docs/DECISIONS.md` for durable choices, and Git commits for chronological history. Do not maintain a separate progress or activity log.
- Reason: Separate overlapping logs become stale, increase reading cost, and can contradict the repository.

## D-006 — App-style bottom nav bar replaces the hamburger menu on tablet/mobile

- Status: Accepted
- Decision: At `max-width:980px`, navigation is a fixed bottom bar (Home, Services, a raised Book a Call button, Free Tools, Menu) instead of a header hamburger. "Menu" opens a right-side drawer styled like the desktop mega menus (light surface, violet accents) containing only About Us, Portfolio, Case Studies, Pricing, and Contact Us as a 2-column icon grid, plus a social icon row — not the full site nav, since Home/Services/Free Tools/Book a Call already live in the bottom bar.
- Reason: Requested to match common mobile-app navigation conventions. Implemented in `components/header.tsx` and `app/globals.css`.
- Note for future CSS work near `.site-header`: `.site-header` uses `backdrop-filter`, which per the CSS spec makes it a containing block for any `position:fixed` descendant. A fixed-position element nested inside the header will position itself relative to the header's box, not the viewport. Any new fixed UI related to the header must be a sibling of `<header>`, not a child (see the `<Fragment>` wrapper in `components/header.tsx`).
