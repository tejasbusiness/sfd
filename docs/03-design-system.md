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
