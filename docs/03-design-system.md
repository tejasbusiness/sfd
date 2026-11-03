# Light-Theme Design System

## Desired personality

Bright, experienced, intelligent, approachable, premium and commercially focused. Avoid the feel of a generic WordPress agency template, a dark AI startup or an experimental portfolio.

## Inspiration allocation

- Numerique: conversion clarity, large typography, service hierarchy and results.
- Lettery Home 2: editorial rhythm, portfolio composition and controlled asymmetry.
- Gesto: restrained motion, numeric emphasis and one optional marquee treatment.
- Lettery Home 3: founder-story composition only.

Do not copy exact layouts, shapes, colours, animation sequences or written content.

## Colour tokens

Studio system (2026-11-05, `assets/css/tokens.css`). Monochrome with one restrained violet accent; no gold.

| Role | Light | Dark |
|---|---|---|
| Page background `--color-bg` | `#F5F5F3` | `#000000` |
| Surface `--color-surface` | `#FFFFFF` | `#0E0E0E` |
| Text `--color-text` | `#0A0A0A` | `#F5F5F3` |
| Secondary text `--color-text-secondary` | `#5C5C5A` | `#A6A6A2` |
| Primary fill `--color-primary` (buttons, switch) | `#0A0A0A` | `#1A1A1A` (primary buttons are white, see studio.css) |
| Link / outline `--color-link` | `#0A0A0A` | `#F5F5F3` |
| Accent `--color-accent` (dots, marks, focus, highlights) | `#5B3FA6` | `#A990FF` |
| Accent as text `--color-accent-warm` | `#4A2F8C` | `#B8A4FF` |
| Border `--color-border` | `#E2E2DE` | `#242424` |
| Field border `--color-field-border` | `#8A8A86` | `#7A7A76` |
| Ink (footer, black bands) `--color-ink` | `#0A0A0A` | `#000000` |

Proportion: off-white page, black panels for the hero bands, testimonials, call-to-action bands and footer, black type, violet only as a small mark. The old `--color-gold-*` and `--gold-gradient` token names still exist for compatibility but hold violet values; do not add new uses.

All combinations must pass WCAG 2.2 AA. Tokens may be adjusted to meet contrast.

## Typography

- Headings: **Inter** 500 with tight tracking (`-0.035em` on H1, `-0.03em` on H2), line height 1 to 1.08. Fluid sizes in `tokens.css`.
- Display: **Archivo** variable, weight 900 (`--font-display`; Archivo Black is the same family's static cut), uppercase, for the homepage statement hero, process step titles, plan names and prices on the homepage band, and the footer statement. Nowhere else.
- Body: **Inter** 400, 500 for emphasis, 600 for buttons and labels. Line height 1.65.
- Eyebrows: Inter 600 at 0.6875rem, letter-spacing 0.16em, secondary grey with a violet dot.
- Buttons: Inter 600, 0.8125rem, sentence case (no uppercase), pill shape.
- Self-hosted (2026-11-05): variable Inter (400 to 700) and Archivo (300 to 900), Latin and Latin Extended, in `assets/fonts/`, declared in `assets/css/fonts.css` (OFL licence note in `assets/fonts/LICENSE-fonts.txt`); the two Latin files are preloaded in `base.njk`. No request goes to Google, so the cookie policy no longer lists Google Fonts as a third party.
- Maintain comfortable body line length and avoid tiny uppercase text for important information.

## Layout

- Use custom CSS Grid and Flexbox.
- No Bootstrap or utility-framework dependency.
- Use a consistent content container, fluid spacing scale and responsive type scale.
- Alternate warm neutral and white sections to prevent visual monotony.
- Use purple sections selectively for high-value CTAs.
- Avoid excessive rounded cards. Radius must communicate the design system, not imitate Numerique.

## Imagery

Prioritize:

- Real client website mockups.
- Before-and-after transformations.
- Browser and mobile compositions.
- Founder photography.
- Genuine business visuals.
- Simple workflow illustrations.

Avoid generic office stock photographs and fake dashboards with invented results.

## Motion

Allowed:

- Short heading reveals.
- Subtle card movement.
- Portfolio image transitions.
- Button feedback.
- One restrained service marquee.
- Light hero-system animation.

Forbidden:

- Preloaders.
- Custom cursors.
- Constant floating decoration.
- Long page transitions.
- Motion that delays content.
- Required hover interactions.

Respect `prefers-reduced-motion`; the site must remain complete and understandable with animation disabled.


## Forms (one system for every form)

Every form on the site — the booking modal, Free Preview, Contact and any future form — uses the same system as the booking modal. Do not hand-write field markup or a new validation style.

- **Markup:** `<form class="sfd-form">` (add `sfd-form--page` outside modals) with fields from the macros in `templates/partials/form-fields.njk` (`input`, `textarea`, `select`, `phone`, `consent`). Labels float inside the field (CSS only); selects keep the label floated.
- **Layout:** compact two-column grid; long fields and the privacy hint span both columns (`field--full`); a primary button sits in `.sfd-form__actions`.
- **Validation:** `assets/js/form-utils.js` (`readForm`, `showFormErrors`, `isValidEmail`, `isValidWebsite`, `normalizeWebsite`). Errors render into `<p data-error-for="<name>">` and mark the field `.field--invalid`. Validate on submit; phone and website also validate on blur.
- **Phone:** always country-code picker plus 10-digit mobile number (`countryCode`, `mobileNumber`).
- **Website fields:** optional, typed without `http(s)://` or `www`; `normalizeWebsite` adds `https://` before submission.
- **Conditional fields:** use the `hidden` attribute on the `.field` and toggle it from JS (e.g. "Other" source on Contact).
- **Consent (mandatory):** every form ends with a required consent checkbox (`fields.consent` macro) with wording tailored to that form and a Privacy Policy link, validated with the message "Please confirm before …". Booking: accuracy plus permission to arrange the call; Contact: right to share plus permission to reply; Free Preview: right to share plus no-guarantee acknowledgement; Playbook: permission to send the playbook; Free Website Audit (homepage): permission to send the audit report and related service information.
- **Border and focus (mandatory):** every control uses `--color-field-border` (#C2C2C2). The border does not change on focus or when a dropdown is open, and the dark focus outline is removed on form controls; the floating label turning brand purple is the focus cue. Only the invalid state changes the border (to the error colour). This covers the timezone picker, country picker, and the component-gallery demo field too.

## Cards (one card style)

Every card-like surface uses `.card`: surface fill, 1px `--color-border`, 8px radius (`--radius-md`), 1.5rem padding. Card titles are H3.

- **Variants** may change fill or emphasis only: `.card--tinted`, the dark feature card (Home Services tile, contact card), and the 2px accent border on the recommended plan. Never change radius, border width or padding per component.
- **Hover:** only clickable cards (`a.card` or `.card--interactive`) react: 2px lift, soft shadow, and a subtle border (`--color-field-border`, #C2C2C2). Non-clickable cards have no hover.
- New card-like components must extend `.card` rather than restyle a box from scratch.

- **Testimonials band:** the client-review section (`testimonials`) is the one brand-purple gradient band with dark cards (`.card--dark`), a gold glow and a Google-rating pill, identical on every page so social proof always stands out. Do not restyle it per page.

## FAQ (one accordion)

All FAQ / Common-questions sections (`faq` and `faq-split`) render through `templates/sections/faq.njk` with the shared `.faq` styles. Redesigned 2026-10-02 (owner: the old hairline list looked plain and dated): compact numbered rows (01, 02 … in the AA-safe dark gold `--color-accent-warm`), a round 30px plus/minus button (lavender at rest, filled primary with a white minus when open), rows that lift onto a white panel with an 8px radius on hover and when open, answers aligned with the question text, one answer open at a time per section (native `<details name>`), and a smooth open/close where `::details-content` is supported (instant elsewhere and under reduced motion). Still native `<details>`/`<summary>`, no JavaScript. `faq-split` only changes the layout (sticky heading, intro and button on the left). Do not add page-specific FAQ styling.
- **Shape:** form controls (fields, dropdown triggers and popups, timezone picker) use the 8px `--radius-md`, the same as cards; buttons stay fully rounded (pill). Containers and inputs are 8px, actions are pills.

## Form success: toast, then reset (2026-09-21)

Every form except the booking modal confirms a successful submission with a dismissible **toast** (`assets/js/toast.js`) and then **resets to blank** (`form.reset()` plus cleared errors; the country code returns to its default and the hidden `topic` on the Websites hero form keeps its value). There is no inline "thank you" block any more. The toast title and text come from `data-success-title` and `data-success-message` on the `<form>` (contact, hero, Free Preview) or from `footer.playbook` / `footer.websiteReview` `successHeading` and `successBody` (playbook, website review), so the copy stays out of JavaScript. Behaviour: top right on desktop and full width at the top on phones, polite live region (announced without stealing focus), real close button, Escape closes the focused toast, auto-dismiss after 5 seconds with a **progress bar** along the bottom that shrinks over that time (timer and bar pause together only while the pointer is over the toast or focus is inside it, then continue with the time left), no motion and no bar under `prefers-reduced-motion`. **Colours:** success is green (`--color-success` `#1F7A3D`, white text about 5.4:1) and error is red (`--color-error` `#B3261E`, about 6.5:1). **Compact:** about 22rem wide, 0.65rem padding, 18px icon, small type, so a typical toast is 60 to 80px tall. The toast is the one intentional exception to "every card-like surface is `.card`" (rule 17): it is a transient overlay, not a content surface, and needs less padding. Failed submissions still show the inline error under the form. The booking modal keeps its own confirmation step, because it shows the booked time and call details. Use `showToast({ title, message })` for any new form.

## Wide page forms (2026-09-21)

A long page form can use the whole container with `sfd-form--wide` (added next to `sfd-form--page`): two columns from tablet width and three from 64em, with fields marked `field--full` (or `wide=true` on the `input` macro, which spans the row only in the three-column layout) taking the whole row. The Free Preview form uses it: name, email and phone; business, website and Google Business Profile; country, city and category; then primary service, the problem box, consent and the button as full rows. Same shared fields and validation as every other form.

## Field hints (2026-09-21)

The `input` macro in `templates/partials/form-fields.njk` takes an optional `hint` (short instruction under the field, small 12px italic, linked to the input with `aria-describedby`) and `maxlength`. Keep hints to one short sentence. Fields with a hint anchor their resting floating label to the input, not to the taller field (CSS `:has(.field__hint--note)`), and the label still floats normally when the field is focused or filled.

## Error toasts (2026-09-21)

Submit-level failures are shown as a **red toast** (`showToast({ type: 'error', ... })`, `.toast--error`, `role="alert"` so it is announced at once), not as text under the form: rate limit ("Too many attempts"), server errors, network failures and the booking "time no longer available" case. Field validation errors (missing or invalid values) stay inline under their fields, and the form keeps what the visitor typed so they can retry. Failure reporting is centralised in `reportSubmitFailure()` in `assets/js/form-utils.js`. Error toasts auto-dismiss after 5 seconds like every toast.

## Submit button while sending (2026-09-21)

On submit, every form calls `setSubmitting()` (`assets/js/form-utils.js`): the button becomes disabled with a spinner and a busy label ("Sending…", "Submitting…" for Free Preview via `data-loading-label`, "Confirming your booking…" in the booking modal), `aria-busy` is set and a visually hidden `role="status"` line announces it. The button is re-enabled after a failed request, or after the form has been reset following a success. In the booking modal a confirmed booking keeps the button disabled until the modal is closed and the form is reset. The spinner slows down under `prefers-reduced-motion`.

## Websites hero form and client logos (2026-09-21)

`hero-form` reuses `.hero--band` with the copy on the left and the enquiry form in a shared `.card` on the right (form second on phones). The hero uses compact vertical padding so the full form shows above the fold on a ~770px-tall laptop screen. Focus rings inside the light card are dark purple, not the band's gold. `client-logos` uses one `.card` per logo in a 2, 3 and 4 column grid with fixed-height tiles; the dark tile changes fill only (`.client-logos__item--dark`), never radius, border or padding.

## Hero band and legal pages

- Every internal page hero (all pages except the homepage) is the dark `hero--band`: purple-to-deep-ink gradient, gold glow and hairline, white title, gold eyebrow, gold primary button and white-outline secondary button. Pages with no hero section get the same band with only the H1.
- Legal pages (`legal-document` section) copy the Privacy Policy exactly: hero band with "Last updated" pill, sticky "On this page" list, numbered clauses with gold numerals, gold bullets, and the contact card. Do not restyle per page.

## Link hover and dark bands

- **Hover effect for navigation links** (footer columns, footer legal row, header top-level links only): text colour change plus a thin gold gradient underline (transparent, gold, transparent) that grows from the centre with `transform: scaleX`, 0.25-0.3s, on `:hover` and `:focus-visible`. No motion under `prefers-reduced-motion`. Header sub-menus and dropdown items keep their own hover. On the light header the text goes deep purple, not gold (contrast); on the dark footer it goes gold.
- **Dark brand band** (trust strip, hero band, testimonials, credentials strip): `linear-gradient(135deg, --color-primary, --color-primary-deep)` with a faint gold radial glow and gold hairlines. Gold (`--color-accent`) is used for eyebrows, icons and accents on dark only.
- **Footer:** four link columns; column headings gold with a gold gradient hairline; legal links are a centred row with gold dot separators above the centred copyright.
- **Trust strip:** centred items, heading font, gold-ringed check icons, vertical dividers on desktop.

- **Footer link type (2026-09-20):** all footer links (columns, legal row, social) and the plain group labels use 13px (`0.8125rem`) at weight 300. Montserrat 300 is loaded in `base.njk`.

- **Form submission (2026-09-20):** every form includes the `honeypot()` macro from `form-fields.njk` and submits with `submitJson()` / `reportSubmitFailure()` from `assets/js/form-utils.js` to the PHP API (docs/14). Do not write custom fetch code per form.

- **Mission/Vision cards (2026-09-20):** `templates/sections/mission-vision.njk` uses the shared `.card`; the Vision variant changes only the fill (`.mission-vision__card--dark`). Gold text and icons appear only on that dark fill; the light card uses `--color-accent-warm`.

## Service pills (pricing pages, 2026-10-02)
`.pricing-tabs` in `templates/sections/pricing-summary.njk`. A `<nav>` of pill links (44px tall, field-border outline; the current page is a filled primary pill with `aria-current="page"`) in a row that scrolls sideways on narrow screens. Each pill is a real page (`/pricing/`, `/pricing/seo/`, ...), not an in-page tab, so every service's pricing has its own indexable URL. Without JavaScript the pills are plain links. With it, `assets/js/pricing-tabs.js` switches in place with no reload or flicker: it fetches the target page's static HTML (prefetched on hover/focus), swaps `<main>`, updates the title, description, canonical and Open Graph tags, and calls `history.pushState`; the pills stay at the same spot on screen, focus stays on the chosen pill, Back/Forward work, and any failure falls back to a normal page load. Booking buttons in the swapped content are re-bound (`initDialogTriggers(root)` in `main.js` is re-runnable and skips triggers already bound). The current pill is scrolled into view on mobile. Placeholder panels use `.card` (`.pricing-tabs__placeholder`).

## Breadcrumbs (2026-11-03)
`templates/partials/breadcrumbs.njk` renders a slim trail under the header on every page with two or more `breadcrumbs` (Home is added automatically; the last item is the current page, `aria-current="page"`). It mirrors the BreadcrumbList schema, so the markup matches visible content. Styles: `.breadcrumbs` in `components.css`. Linked homepage industry tiles use `.industry-links__link`, a heading link stretched over the whole tile with a visible focus ring.

## Motion system (2026-11-04)
Sitewide motion lives in `assets/js/motion.js` and `assets/css/motion.css` (loaded on every page; initialised from `main.js` after the scroll reveal). It is vanilla JS with no dependency: particles.js and similar libraries were not used because rule 2 in CLAUDE.md allows vanilla JavaScript only, and they add a third-party download and more main-thread work than the roughly 120 lines of canvas code here.
- **Gate:** JS adds `motion` to `<html>` only when the visitor has not asked for reduced motion; every hidden or moving state is scoped under `html.motion` (plus the existing `.reveal-init`). Reduced-motion and no-JS visitors get the static, fully visible page. Verified: with `--force-prefers-reduced-motion` the layer is not created at all.
- **Ambient field (`.fx`):** injected as the first child of `.hero--band`, `.hero-split`, `.trust-signals`, `.section--brand`, `.section--dark` and `.cta-banner`: two drifting radial-gradient glows (gold and violet) with scroll parallax, plus a canvas of slow particles linked by faint lines that gently move away from the cursor. About 64 particles on desktop, fewer on phones or low-core devices; runs at about 35 fps, pauses when the section is off screen or the tab is hidden, and is skipped when the browser asks to save data. Dark surfaces use gold dots and white lines; the light homepage hero uses faint violet.
- **Headlines:** every `main h1` reveals word by word on load and every `main h2` (outside dialogs, FAQ and footer) on scroll, using masked words (`.w > .wi`). The text stays in the DOM as normal text.
- **Cards and sections:** `[data-reveal]` blocks rise 28px with an eased 0.8s fade; cards inside them stagger (`--i`). After the entrance the hidden-state class is removed so normal hover transitions return. A cursor spotlight (`--mx`, `--my`) glows on `.card` hover.
- **Buttons:** primary and accent buttons get a light sweep on hover; hero and call-to-action buttons lean a few pixels toward the cursor (`translate`, not `transform`, so it does not fight the hover lift). Buttons inside forms or dialogs are excluded.
- **Page:** a 3px gold scroll-progress bar at the top, a pulse on the eyebrow dot, and a cross-document view transition (`@view-transition`) for a soft fade between pages in supporting browsers.
- **Rules for new work:** animate only `transform`, `opacity` and `translate`; keep decorative motion free of claims (no animated numbers or ratings); add new effects inside `html.motion`; no new dependency.

## Studio theme and Light / Dark / System mode (2026-11-05)
- **Look:** flat, monochrome and typographic, after the owner's references (dovvstudio.com, gianmediagroup.com; principles only, nothing copied). Off-white page, true-black bands and footer, hairline borders, pill buttons without gradients, glows or lift, flat cards at the large radius with a border that darkens on hover, Inter throughout with Archivo Black for display statements. Violet survives as the single accent (eyebrow dot, stat underline, focus ring, highlight words); gold is gone. Tokens in `assets/css/tokens.css`; refinements in `assets/css/studio.css` and the layout patterns in `assets/css/studio-layout.css` (both loaded last; they replaced `royal.css`).
- **Buttons:** light mode, primary is black with white text and secondary is a black outline; on black bands primary is white with black text. Dark mode flips the primary to white on black everywhere. The locked labels stay in sentence case now (they were uppercase).
- **Dark theme:** black page, `#0E0E0E` surfaces, `#0A0A0A` bands with a hairline top and bottom so they read as panels, white type, lifted violet accent. No glow, aurora, grain, beam or particles. Mock-ups of customers' websites (`.browser-frame`, `.phone-frame`) stay light in both themes because they are pictures of other sites.
- **Motion kept:** word-by-word headline reveal, staggered card reveal, magnetic hero buttons, Lenis smooth scrolling (`assets/js/vendor/lenis.min.js`, MIT, licence beside it), scroll-progress bar (now ink-coloured), view transitions. **Removed sitewide:** particle canvas and glow fields (`initAmbientFields` returns early unless `<html data-ambient>` is set), card cursor spotlight, button shine and the eyebrow pulse. The earlier Motion system notes above describe the ambient field for reference only.
- **Token rules:** `--color-primary` is a fill, `--color-link` is the foreground that flips; text on a primary fill is `#fff` in light mode. Do not use `--color-primary` for text.
- **Switching:** unchanged. An inline script in `<head>` sets `data-theme` and `data-theme-pref` before first paint from `localStorage["sfd-theme"]` or the device setting; `assets/js/theme.js` wires the header button and the three-way switch in the mobile More drawer. Without JavaScript the page is light.
- **Contrast (computed 2026-11-05):** dark mode on a trade page: headings, body text, eyebrows and primary buttons 19.8:1, secondary buttons and labels 17.7:1, links 8.6:1, field borders 5.2:1. Light mode figures are in `docs/10` for this date.
- **Privacy note:** the choice is stored in the visitor's browser (`localStorage`, key `sfd-theme`) and never sent anywhere; the Cookie Policy says so (2026-11-05).

## Studio layout (2026-11-05)
Owner instruction: match dovvstudio.com's layout, type, motion and styling while keeping the multi-page structure and all content. Built from scratch in `assets/css/studio-layout.css`, `assets/js/studio-fx.js` and a few templates (CLAUDE.md rule 14: patterns, not a copy).
- **Header:** logo left; right: the theme pill, a **Menu** pill that opens the existing drawer (`#more-drawer`, now titled "Menu", content from `navigation.more`) and one black "Start My Free Website Preview ↗" button. The primary navigation row and mega menus are no longer rendered (the `navItems` macro stays in `header.njk` for reuse). Every page is still linked from the drawer, the footer groups (which gained "All Services" and "Free Downloads" so the orphan guard passes), the dock and in-page links. The header button hides under 760px (the tab bar carries the action).
- **Dock:** `templates/partials/dock.njk`, items in `navigation.dock` (Projects, How it works, Pricing, Contact). Desktop only (1400px and up); below that the tab bar owns the bottom edge.
- **Statement hero** (`section.statement` on `hero-split`): status pill (`section.status`), uppercase Archivo Black headline (the H1 words unchanged; its forced line break was removed), three sticker pills from `section.stickers` (each a verified fact: the 4.8★ Google rating as a starburst, 300+ websites delivered, see it before you pay), subheading, the two locked buttons, the price line. Stickers sit statically in a row under 760px. The hero clips overflow so tilted stickers never cause sideways scroll.
- **Logo marquee:** the homepage `client-logos` section renders as a grey "Trusted by" row; `studio-fx.js` wraps it in a track and appends an aria-hidden copy so the CSS marquee loops. Static under reduced motion.
- **Project panels:** homepage `case-study-grid` cards are black rounded panels with the screenshot inside a thin frame, name and tag pills; four projects, two per row, "See all case studies" outlined pill.
- **Big quote:** `testimonials` with `bigQuote: true` renders the featured review as an oversized Inter quote whose words light up as they pass 68% of the viewport (`data-quote-reveal`, `.quote-word.is-lit`), with an initials avatar. Plain text for reduced motion and without JS.
- **Black band:** on the homepage `process-narrative`, `pricing-highlight` and `founder-note` share one black band with rounded top and bottom; plan cards are dark, the recommended plan is white with a lime pill (`--color-lime`, the action accent from the original token spec); plan names and prices use the display face.
- **Footer:** a giant "Let's talk" statement (`footer.statement`) with two truthful stickers (`footer.statementStickers`), a "Start a project" column with the brand statement and the booking button, the link groups in a hairline grid, and the legal row. Off-white in light mode, black in dark mode.
- **Weight field:** `[data-weight-field]` (hero H1, footer statement), after the owner's reference video `docs/text-effect.mp4`. `studio-fx.js` wraps every letter in a span (words stay unbreakable) and, on each pointer move, eases each letter's variable-font weight from 900 toward 280 by its distance to the pointer (full effect at the pointer, none beyond 240px, smoothstep falloff, 18% easing per frame). Nothing happens on its own; the cursor sculpts the headline. Only on fine-pointer devices with motion allowed; the H1 gets an `aria-label` with its full text so the letter spans do not change how it is read. The earlier word flip was replaced by this.
- **Homepage clutter:** analysed for the owner on 2026-11-05 (docs/10); the trust strip, the preview-concepts block, the hero price line and the duplicate closing asks are the candidates to remove. Not applied yet.
- **Weight field, layout lock:** every letter span is given a fixed width equal to its weight-900 width (after fonts load, re-measured on resize), with the glyph centred in it, so the line breaks never change while weights do.
- **Footer columns (2026-11-05, owner: too cluttered):** four columns after the reference. Column 1: START A PROJECT with the support email (shown only when company.supportEmail is a real address), the brand statement and the booking button. Columns 2 and 3 take footer.groups by their column number: style bold renders display-uppercase links (Pages: Home, Work, Pricing, Contact; Industries: the five trades and All industries), style small renders a plain list (Services incl. All services; Resources: How it works, Portfolio, Free tools, Blog, Free downloads, About). Column 4: BASED IN (footer.basedIn: place, time zone) with a live local time from studio-fx.js. Legal links, copyright and Back to top stay in the bottom row. Every page that lost a header link is linked here, so the orphan guard passes.
- **Footer, second pass (2026-11-05):** full-bleed. The column grid and its hairlines run edge to edge (`.site-footer__inner` replaces the container; the page gutter sits inside the first and last columns and the legal row). The Resources group was removed on owner instruction; its pages (About, Free downloads) moved into the Menu drawer (`navigation.more`) so the orphan guard still passes (How it works, Portfolio, Free tools and Blog were already in the drawer, dock or tab bar). Small lists are tighter (line-height 1.35, 0.1rem padding). Under the local time sits **Ask AI about SynergyFirst** (`footer.askAi`): four square tiles that open ChatGPT, Claude, Perplexity and Grok in a new tab with `footer.askAi.prompt` prefilled through each service's query URL. The tile glyphs are our own simple line marks, not the providers' logos (rule 14 and trademark caution); swap in official SVGs only under each provider's brand guidelines. Gemini has no prefill URL, so it is not listed.
- **Footer bottom bar (2026-11-05):** one row on desktop (`.site-footer__bottom--studio`, grid `1fr auto 1fr` from 900px): the logo on the left (inverted in dark mode), the copyright centred with the legal links and Cookie settings in a small line beneath it, "Back to top" on the right. Stacked and centred under 900px.
- **Legal links (2026-11-05):** moved out of the bottom bar into the last column as a small "Legal" group under the Ask AI tiles (`.site-footer__legal--column`, same style as the Services list; Cookie settings is a button styled like the links). The bottom bar is now logo, copyright, Back to top only.
- **Column dividers (2026-11-05):** a hairline separates stacked groups in a footer column (Pages | Services, Ask AI | Legal); the Based-in block and the Ask AI tiles stay one block with no line between them.
- **Dock steps aside (2026-11-05):** `studio-fx.js` `initDock` adds `.dock.is-hidden` (slides down, fades, no pointer events) whenever a hero button row (`.hero-statement__actions`, `.hero-split__actions`) would sit under the dock, so short viewports never show the buttons covered; it returns as soon as the row scrolls clear. Uses `transform`, separate from the `translate` entrance animation.
- **Stickers v2 (2026-11-05):** die-cut look after the owner's reference: 4px white rim (white in dark mode too), bold 700 label, `0 8px 14px` drop shadow, tilt per sticker via `--tilt`, tone fills as `--sticker-fill` gradients (violet, lime, peach; `--sticker-ink` for the label colour). Motion: springy pop-in on load (staggered), slow bob, and on hover a 1.08 scale with counter-rotation on a back-out curve plus a pointer-tracked sheen (`::after` radial highlight at `--mx/--my`, set by `initStickerShine` in `studio-fx.js`). The starburst is a white star containing a smaller clipped star (`.sticker__fill`) so it gets the rim too; it has no shadow because clip-path would clip it. Static row, no tilt, under 760px. The reference also lets visitors drag the stickers; not built.
- **Sticker foil (2026-11-05, v2.1):** tone fills are multi-stop "foil" gradients (violet, lime, orange-pink peach) with an always-on soft radial shine at the top-left that follows the pointer on hover. A sticker may carry `value` + `label` (JSON) for a big figure with a small caption; the rating star uses it ("4.8★" / "Google rating").
- **Big quote, quieter (2026-11-05):** owner felt the full-size quote overpowered the page. Kept the full review text (owner choice) but dropped the type one step (max 3.4rem, was 4.4rem; line-height 1.12) and changed the reveal from opacity to colour: words rest in the secondary grey and turn black as they light up, so the lit phrase reads rather than the whole block.
- **Tick marks (2026-11-05):** one system for every tick: a small solid disc with a crisp check. Lime (`--color-lime`) disc with an ink tick on black surfaces (trust strip, the dark plan cards and the statement band); ink disc with a page-background tick on light surfaces (flips with the theme); the recommended white plan card uses an ink disc. Covers the trust strip, plan include lists (homepage and Pricing), the "Everything handled" checklist and the booking confirmation. Replaces the dim violet rings and violet or gold ticks. The micro-search tick inside a mock-up and the checkbox tick are unchanged.
- **Testimonial heading vs quote (2026-11-05):** on the homepage the section heading is now a small 600-weight label (1.125 to 1.5rem) above a hairline, with generous space before the big quote, so the heading and the quote read as two different things.
- **Icon chips (2026-11-05):** the same no-violet rule as the tick discs: lime icons on dark discs (Free Website Audit band, contact cards, dark mission cards), ink on light chips (growth modules, closing-CTA icon, mission cards). Footer brand column: flex column with 1.75rem gaps. Footer group dividers are pulled out by the column padding so they meet the vertical hairlines edge to edge (desktop and mobile). **Logo marquee:** every logo sits in a same-width cell (even rhythm); `initLogoMarquee` tiles enough copies of the set to cover the track plus one spare and shifts by exactly one set (`--marquee-shift`, `--marquee-duration`), so the loop is seamless at any width. Logo cells lose their card chrome in dark mode. Hover: solid black in light mode, solid white in dark mode (`brightness(0)` with `invert(1)`); logos flagged `hover: "detail"` in `data/client-logos.json` (Budget Opticals, CAWT, Siddhant: large opaque areas) get a darker or brighter grayscale copy instead, so they do not turn into blobs.
- **Homepage clutter (applied 2026-11-05):** the trust strip, the preview-concepts block, the hero price line and the testimonial button were removed on the owner's instruction; see docs/04.
- **Draggable stickers (2026-11-05):** `initStickerDrag` in `studio-fx.js` (fine pointer, motion allowed, above 760px). Dragging moves a sticker by `--dx/--dy` inside its hero or the footer statement (clamped to that area), lifts it (larger shadow, tilt eased, bob paused) and leaves it where it is dropped until reload. Touch and phones keep the static row.
- **Mobile hero (2026-11-05):** under 760px the statement hero is a flex column: one-line status pill, headline 1.85 to 2.4rem, shorter copy, two full-width stacked buttons, and the proof stickers as a compact chip row below the buttons (the starburst becomes a plain chip, value and label inline). Both buttons end around 500px at 390px wide, above the fold. The stickers no longer stretch into blobs (they did when the star and a pill shared a row).
- **Homepage review fixes (2026-11-05):** (1) the logo strip no longer carries `data-reveal`: the reveal observer needs 40% of an element visible and the scrolling list is far wider than a phone, so on phones the logos never appeared. (2) Process section: one left-aligned timeline at every width; from 1000px the heading is pinned (sticky) on the left and the steps stack on the right; the old zigzag left large empty areas. (3) Violet-on-dark fixes: the "No payment is required" note and the Garage Door card icon are lime; the analytics bars are ink. (4) Stickers are a chip row under the buttons up to 1280px wide (floating, draggable stickers only above that), because between 761 and 1280px they covered headline words.
