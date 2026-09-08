# Website roadmap

This file tracks outcomes and priorities. Update it only when priorities, scope, or milestone status changes. Day-to-day work belongs in Git commits and the active handoff.

## Completed

- Replaced the previous repository application with the static agency website.
- Built the homepage, shared navigation, footer, and original motion system.
- Added About, Pricing, Contact, Portfolio, Case Studies, service pages, legal pages, booking, and free-tool pages.
- Added JSON-backed page content, static export, metadata, structured data, sitemap/robots controls, and validation scripts.
- Added GitHub Actions deployment to the Contabo CloudPanel document root.
- Verified a successful production deployment.
- Added the fresh-session Codex/Claude workflow for VS Code.

## Next: production content and indexing

- Replace the preview URL in `data/site.json` with the verified production domain.
- Add the approved business email, phone number, WhatsApp destination, and Cal.com event URL.
- Confirm service scope, enquiry-based pricing, and booking duration.
- Review privacy and terms content with the business owner or legal adviser.
- Set `productionReady` to `true` only after the production facts and domain are verified.
- Rebuild, validate, deploy, and confirm sitemap, robots, canonical URLs, and structured data on the live domain.

## Next: proof and conversion content

- Add approved client projects to Portfolio and Case Studies.
- Add verified testimonials and results with permission.
- Replace remaining honest empty states once real material is available.
- Confirm final calls to action and conversion paths on every service page.

## Later: launch QA and measurement

- Complete desktop, tablet, and mobile browser QA.
- Check keyboard navigation, reduced motion, WebGL fallback, and invoice printing.
- Run performance and accessibility audits on the production domain.
- Connect Search Console, Bing Webmaster Tools, and approved analytics.
- Monitor indexing and fix any crawl or structured-data issues found after launch.

## Blocked by business input

- Contact and booking details.
- Approved client work, testimonials, and measurable results.
- Final legal approval.
- Final confirmation to enable search-engine indexing.
