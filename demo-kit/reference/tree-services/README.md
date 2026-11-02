# Test Tree Care: private website preview

A three-page concept website built by SynergyFirst Digital for private review by the business owner.
It is not the business's official website and it does not accept enquiries. Every page carries
`<meta name="robots" content="noindex, nofollow">`, the preview bar, and the disclaimer in the footer.

- Preview URL: `https://preview.synergyfirstdigital.com/fable01/`
- Expires: 9 November 2026, 08:51 UTC (`2026-11-09T08:51:19.641Z`, hard-coded once in `assets/main.js` as `EXPIRES_AT`)
- Files: `index.html`, `services.html`, `contact.html`, `assets/styles.css`, `assets/main.js`, `README.md`

## Facts used (verified)

| Fact | Value | Source |
| --- | --- | --- |
| Business name | Test Tree Care | lead form |
| Current web presence | https://synergyfirstdigital.com | lead form (not linked from the preview) |
| Services | Tree removal, stump grinding | lead form |

Nothing else about the business is stated as fact. The copy describes the two services in general terms
(how a tree is usually taken down in sections, what a stump grinder does) and the quote process, without
prices, timings, guarantees, credentials or reviews.

## To confirm with the business

Every item below appears on the site as a visible `[TO CONFIRM: ...]` placeholder.

- `[TO CONFIRM: phone]` / `[TO CONFIRM: business phone]`: call buttons (hero, closing sections, wide header, menu panel), FAQ answer, contact page, footer. No `tel:` link until supplied.
- `[TO CONFIRM: business email]`: contact page and footer. No `mailto:` link until supplied.
- `[TO CONFIRM: service area]`: contact page and footer (left out of the hero because it is unknown).
- `[TO CONFIRM: business hours]`: contact page and footer.
- `[TO CONFIRM: street address, if public]`: contact page.
- `[PHOTO: crew taking a tree down in sections]`, `[PHOTO: stump ground below ground level]`, `[PHOTO: cut timber stacked for collection]`, `[PHOTO: storm-damaged tree before work]`, `[PHOTO: team and equipment on site]`, `[PHOTO: site cleared and replanted]`: six gallery frames on the home page.
- Logo: not supplied; a simple leaf mark is used next to the business name.
- Not shown anywhere because they are unverified: licence, insurance, certifications, warranty, years in business, prices, response times, reviews or ratings.

## Images and rights

No photographs or external images are used. All artwork is inline SVG drawn for this preview
(hero tree, tree-line silhouettes, light rays, leaves, growth rings, gallery silhouettes, organic blobs,
icons) plus CSS gradients and an SVG `feTurbulence` grain texture embedded as a data URI in the stylesheet.
All of it belongs to SynergyFirst Digital and may be reused in the live site.

## Palette and fonts

Palette "Forest & Bark", set as custom properties on `:root` in `assets/styles.css`:

```
--bg #FBFAF6   --surface #EFEFE6   --text #1D2A1F   --text-muted #4F5C50
--primary #1F5A3A   --on-primary #FFFFFF   --accent #C98A2B   --on-accent #1D2A1F
--dark #143626   --on-dark #FFFFFF   --border #D5D8C8
```

Text pairings used: `--text` and `--text-muted` on `--bg` / `--surface`; white and white at 80 to 85 percent on
`--dark` and `--primary`; `--on-accent` on `--accent`; `--accent` on `--dark` only for text of 24px and larger
(4.5:1) and the eyebrow labels (4.5:1 at 15px semibold).

Fonts: Fraunces 600/700 for headings, Source Sans 3 400/600 for everything else, loaded with one Google Fonts
`<link>` (preconnected). Google Fonts is the only external request. Fallbacks: Georgia-class serif and system sans.

## How it is built

- Plain HTML5, one CSS file, one JavaScript file (about 5 KB). No framework, build step, tracking, cookies or analytics.
- Works from disk (`file://`) or any static server. Links are relative.
- JavaScript adds `js` and (unless `prefers-reduced-motion: reduce`) `motion` to `<html>`. All hidden-until-revealed
  states and animations hang off `html.motion`, so the page is static and fully visible with JavaScript off or
  reduced motion on. Only `transform`, `opacity`, `clip-path` (headline words) and `stroke-dashoffset`
  (growth rings, timeline) are animated.
- The quote form on `contact.html` has no `action`; submitting validates the fields and shows
  "This is a preview, so nothing was sent."
- Header: at 1100px and wider it shows the business name, three links, the call placeholder button and
  Request a Quote. Below 1100px it shows the business name, Request a Quote and a Menu button; the links and
  call button move into the menu panel (keyboard operable, Escape closes). Below 480px the Menu button is icon-only
  with its accessible name kept.
- When the countdown reaches zero the page body is replaced with "This preview has expired".

Checked at 360, 390, 600, 768, 820, 1024, 1100 and 1280px wide by measurement
(`document.documentElement.scrollWidth <= window.innerWidth`, plus the right edge of every header element):
no horizontal scroll and no header clipping on any page.

## Upload to the preview server

Target: `https://preview.synergyfirstdigital.com/fable01/`

1. Confirm nothing in the folder references an absolute path: all links are relative (`assets/...`, `services.html`).
2. Upload the contents of this folder so that `index.html` sits at `/fable01/index.html` on the preview host.
   For example with SFTP: `put -r ./ /var/www/preview/fable01/` (adjust the document root to the server's layout).
   Keep the `assets/` subfolder next to the HTML files.
3. Make sure the preview host serves the folder with directory index enabled (`/fable01/` opens `index.html`)
   and that the host-level `X-Robots-Tag: noindex, nofollow` header remains in place for `preview.synergyfirstdigital.com`.
4. Open `https://preview.synergyfirstdigital.com/fable01/`, `.../fable01/services.html` and `.../fable01/contact.html`
   and check: the preview bar countdown runs, the fonts load, the quote form shows the preview message, no console errors.
5. The preview expires on its own on 9 November 2026, 08:51 UTC. Remove the folder from the server after that date.
