# SynergyFirst Digital — agent instructions

Read `docs/AI-HANDOFF.md` before changing the project. It is the shared source of current context for every coding assistant working in this repository. Read `docs/ROADMAP.md` when choosing or changing priorities, and `docs/DECISIONS.md` before making an architectural or workflow decision.

## Working rules

- Treat each chat as one bounded task. Do not expand the scope without a new user request.
- Start from the shared handoff, Git status, and only the files relevant to the task. Do not scan or reread the whole repository without a concrete need.
- Work only in this Git repository: `github-sfd-replace`.
- Preserve the existing Vinext/React/Vite static-export architecture and `package-lock.json`.
- Keep page content in JSON under `data/`; do not hard-code editable marketing copy into React components.
- Preserve the original agency visual direction: bold, precise, modern, motion-led, and clearly designed by a human. Avoid generic AI-generated copy, excessive gradients, glassmorphism, and template-like sections.
- The Obermann website is a visual reference, not a source to copy. Recreate interaction principles with original code, layouts, assets, and wording.
- Maintain accessibility, responsive behavior, reduced-motion support, SEO metadata, structured data, sitemap/robots behavior, and AIO/AEO-friendly content structure.
- Do not invent testimonials, client work, business results, prices, contact details, or legal facts.
- Before editing, inspect `git status` and preserve existing user or assistant changes.
- After code or content changes, run `npm run build`, `npm run check`, and `npm run test:tools` when tool logic is affected.
- A push to `main` triggers the Contabo production deployment. Do not push unless the user asks to deploy or push.
- Before handing work to another assistant, update `docs/AI-HANDOFF.md` with the current task, files changed, validation results, and next action.
- Keep the handoff factual and compact. Record evidence and unresolved items; do not copy chat transcripts into it.
- Update `docs/ROADMAP.md` only when scope, priority, or milestone status changes.
- Add to `docs/DECISIONS.md` only for a durable choice that affects future work.
- Use Git commits as the activity log. Do not create or maintain a separate progress log.
