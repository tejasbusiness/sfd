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

Initial direction, subject to final visual review:

| Role | Value |
|---|---|
| Warm page background | `#F7F7F3` |
| White surface | `#FFFFFF` |
| Primary text | `#121318` |
| Secondary text | `#5E626D` |
| Primary purple | `#6447E8` |
| Deep purple | `#332375` |
| Soft lavender | `#ECE8FF` |
| Action accent | `#C8F169` |
| Neutral surface | `#E9E9E4` |
| Border | `#DADBD5` |

Target proportion: 65% warm white/neutral, 20% ink typography, 10% purple and 5% lime accent. Lime is for highlights and action states, not large backgrounds.

All combinations must pass WCAG 2.2 AA. Tokens may be adjusted to meet contrast.

## Typography

- Headings: evaluate Manrope, Plus Jakarta Sans or Sora.
- Body: evaluate Inter or DM Sans.
- Metrics and small technical labels: optional IBM Plex Mono.
- Prefer self-hosted optimized font files when licensing permits.
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
- **Consent (mandatory):** every form ends with a required consent checkbox (`fields.consent` macro) with wording tailored to that form and a Privacy Policy link, validated with the message "Please confirm before …". Booking: accuracy plus permission to arrange the call; Contact: right to share plus permission to reply; Free Preview: right to share plus no-guarantee acknowledgement; Playbook: permission to send the playbook.
- **Border and focus (mandatory):** every control uses `--color-field-border` (#C2C2C2). The border does not change on focus or when a dropdown is open, and the dark focus outline is removed on form controls; the floating label turning brand purple is the focus cue. Only the invalid state changes the border (to the error colour). This covers the timezone picker, country picker, and the component-gallery demo field too.

## Cards (one card style)

Every card-like surface uses `.card`: surface fill, 1px `--color-border`, 8px radius (`--radius-md`), 1.5rem padding. Card titles are H3.

- **Variants** may change fill or emphasis only: `.card--tinted`, the dark feature card (Home Services tile, contact card), and the 2px accent border on the recommended plan. Never change radius, border width or padding per component.
- **Hover:** only clickable cards (`a.card` or `.card--interactive`) react: 2px lift, soft shadow, and a subtle border (`--color-field-border`, #C2C2C2). Non-clickable cards have no hover.
- New card-like components must extend `.card` rather than restyle a box from scratch.

- **Testimonials band:** the client-review section (`testimonials`) is the one brand-purple gradient band with dark cards (`.card--dark`), a gold glow and a Google-rating pill, identical on every page so social proof always stands out. Do not restyle it per page.

## FAQ (one accordion)

All FAQ / Common-questions sections (`faq` and `faq-split`) render through `templates/sections/faq.njk` with the shared `.faq` styles: divided rows with hairline rules, plus/minus icon, native `<details>`/`<summary>`, compact spacing. `faq-split` only changes the layout (sticky heading on the left). Do not add page-specific FAQ styling.
- **Shape:** form controls (fields, dropdown triggers and popups, timezone picker) use the 8px `--radius-md`, the same as cards; buttons stay fully rounded (pill). Containers and inputs are 8px, actions are pills.

## Form success: toast, then reset (2026-09-21)

Every form except the booking modal confirms a successful submission with a dismissible **toast** (`assets/js/toast.js`) and then **resets to blank** (`form.reset()` plus cleared errors; the country code returns to its default and the hidden `topic` on the Websites hero form keeps its value). There is no inline "thank you" block any more. The toast title and text come from `data-success-title` and `data-success-message` on the `<form>` (contact, hero, Free Preview) or from `footer.playbook.successHeading` and `successBody` (playbook), so the copy stays out of JavaScript. Behaviour: top right on desktop and full width at the top on phones, polite live region (announced without stealing focus), real close button, Escape closes the focused toast, auto-dismiss after 5 seconds with a **progress bar** along the bottom that shrinks over that time (timer and bar pause together only while the pointer is over the toast or focus is inside it, then continue with the time left), no motion and no bar under `prefers-reduced-motion`. **Colours:** success is green (`--color-success` `#1F7A3D`, white text about 5.4:1) and error is red (`--color-error` `#B3261E`, about 6.5:1). **Compact:** about 22rem wide, 0.65rem padding, 18px icon, small type, so a typical toast is 60 to 80px tall. The toast is the one intentional exception to "every card-like surface is `.card`" (rule 17): it is a transient overlay, not a content surface, and needs less padding. Failed submissions still show the inline error under the form. The booking modal keeps its own confirmation step, because it shows the booked time and call details. Use `showToast({ title, message })` for any new form.

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
