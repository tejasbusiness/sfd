# Test Garage Doors - private website preview

Concept website built by SynergyFirst Digital for private review. Not the business's official website; it accepts no enquiries. Preview URL: `https://preview.synergyfirstdigital.com/garageref01/` (expires 2026-11-09 09:00 UTC; the countdown constant `EXPIRES_AT` lives once in `assets/main.js`).

## Files

- `index.html` - home: hero, services bento, how it works, photo placeholders, questions, closing band
- `services.html` - one block per service, urgent versus planned work, quote request
- `contact.html` - contact placeholders and a preview-only request form (never submits)
- `assets/styles.css` - all styling (plain CSS, one file)
- `assets/main.js` - countdown and expiry, header state, menu, scroll reveal, parallax, card spotlight, form validation

No frameworks, build step, tracking or cookies. The only external request is Google Fonts.

## Verified facts used

- Business name: Test Garage Doors (lead form)
- Services: Garage door repair, New door installation, Opener installation (lead form)

## To confirm with the business

Every item below appears on the site as a `[TO CONFIRM: ...]` placeholder.

- Business phone (all "Call [TO CONFIRM: phone]" buttons are plain text with no `tel:` link until supplied)
- Business email
- Street address (if there is a public one)
- Business hours
- After-hours availability
- Service area
- How quotes are provided
- Door brands and ranges offered
- Warranty details
- Opener brands offered; smartphone or keypad options
- Licence and insurance details (not shown anywhere until confirmed)
- Years in business (not shown)
- Prices (never shown)
- Logo and real photographs (three `[PHOTO: ...]` frames on the home page)
- Customer reviews (none shown; none will be invented)

## Images and rights

No photographs or third-party images are used. All artwork (hero garage illustration, rooftop silhouettes, line-art icons, photo placeholder silhouettes, textures) is original inline SVG and CSS drawn for this preview using only the palette colours. Owned by SynergyFirst Digital.

## Palette and fonts

Steel & Signal: `--bg #FFFFFF`, `--surface #F3F5F8`, `--text #14202E`, `--text-muted #4A5868`, `--primary #12355B`, `--on-primary #FFFFFF`, `--accent #F28C28`, `--on-accent #14202E`, `--dark #0E1F33`, `--on-dark #FFFFFF`, `--border #D3D9E1`. One extra token, `--on-dark-muted #C5CFDB`, is used for secondary text on `--dark` (10.2:1).

Headings: Barlow Condensed 600/700. Body: Barlow 400/500/600. Loaded with one Google Fonts link plus preconnects; system fallbacks are set.

## Accessibility and motion

- One `h1` per page, skip link, labelled form fields with inline errors, visible focus rings, keyboard menu (Escape closes).
- `main.js` adds `js` and, only when `prefers-reduced-motion` is not `reduce`, `motion` to `<html>`. Every animation and hidden-until-revealed state is scoped under `html.motion`, so reduced-motion and no-JS visitors get the full static page with the garage door already open.

## Upload steps

1. Confirm the folder contains `index.html`, `services.html`, `contact.html`, `assets/styles.css`, `assets/main.js`, `README.md`.
2. Connect to the preview server (SFTP or the hosting file manager) and open the web root of `preview.synergyfirstdigital.com`.
3. Create the directory `garageref01` in that web root if it does not exist.
4. Upload the whole contents of this folder into `garageref01/`, keeping the `assets/` sub-folder.
5. Open `https://preview.synergyfirstdigital.com/garageref01/` and check: preview bar countdown runs, `noindex, nofollow` is present in the page source, the three pages link to each other, the form shows "This is a preview, so nothing was sent."
6. Do not add the folder to any sitemap, and do not link to it from the public site.
7. After 2026-11-09 09:00 UTC the pages show "This preview has expired"; remove the folder from the server then.
