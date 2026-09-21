# Visual Art Direction — Homepage, Header & Footer Redesign

Status: **implemented and since extended.** This document is the original redesign brief; where it conflicts with the "Amendments since implementation" section at the end (and with docs/03 and docs/10), the amendments win. Original wording follows. This revision supersedes the first draft; changes from that draft are called out inline where they matter for review.

Scope of this redesign: **header, footer, homepage only**. How It Works, Pricing, Free Preview and Book a Call keep their current (plain) styling until this direction is approved and deliberately extended to them. The booking modal and Free Preview form get a documented *future* direction here but are explicitly not touched yet.

Nothing about the JSON/Nunjucks static-build architecture, validation system, clean URLs, semantic HTML, accessibility foundation, business strategy, copy structure or CTA hierarchy changes. This is a visual system replacement on top of the same content model. Production must stay free of visible "TBD" text, "pending verification" content, fake statistics, fake reviews, fake clients or fake results — enforced by validation, not just by convention.

---

## 1. Visual concept

**An editorial, proof-led system.** Oversized typographic statements carry the argument; real interface artifacts (device-frame compositions, process diagrams, connected-module maps) carry the proof — not text alone, and not decorative stock imagery. Composition is asymmetric and bento-based rather than a grid of identical cards, so the page reads like a designed editorial spread, not a template.

Colour is used as signal, not decoration: purple and lime are spent deliberately (action, selection, emphasis, status) against a large field of warm neutral and ink. **One** full-bleed dark section (the monthly-model statement) gives the page a rhythm break; the site otherwise stays recognizably light-theme throughout, including the final CTA (see §5, §8.12).

Motion is restrained and purposeful: reveal-on-scroll, a drawn-in connector line for the process steps, subtle device-frame drift, and — only if it earns its place — one marquee band (see §7).

Synthesis of the three references (principles only, nothing copied literally):
- **Numerique** → oversized H1 that dominates the first screen, high-contrast filled CTA, business-outcome-first copy, controlled colour blocking.
- **Lettery Home 2** → asymmetric bento composition for industries/inclusions, large illustrative-concept imagery, varied section rhythm instead of repeating the same card four times.
- **Gesto** → large ghosted step numerals in the process section, a connector line that draws in as you scroll, layered subtle motion on the hero device frames, and an optional restrained marquee if it turns out to add value.

---

## 2. Typography scale

Headings: **Sora**. Body: **Inter**. This pairing is what ships in the first visual build. **IBM Plex Mono is deferred** — it's only introduced later if a specific use (e.g. real numeric stats, once verified figures exist) demonstrably benefits from a monospace treatment; it is not loaded speculatively. Small labels/eyebrows use Inter, uppercase, with tracking, instead. Avoiding a generic-SaaS feel is a job for composition and art direction (asymmetry, scale contrast, restrained colour discipline), not for stacking additional typefaces.

All heading sizes are fluid (`clamp()`), scaling continuously between mobile and large desktop rather than jumping at breakpoints:

| Token | clamp() | ~Mobile | ~Desktop (≥1440px) | Weight | Line-height |
|---|---|---|---|---|---|
| `--text-display` (H1) | `clamp(2.75rem, 1.8rem + 4.2vw, 5.5rem)` | ~44px | ~88px | 800 | 1.05 |
| `--text-h2` | `clamp(1.625rem, 1.3rem + 1.3vw, 2.25rem)` | 26px | 36px | 500 | 1.25 |
| `--text-h3` | `clamp(1.25rem, 1.1rem + 0.6vw, 1.625rem)` | 20px | 26px | 400 | 1.25 |
| `--text-h4` | `clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)` | 17px | 20px | 400 | 1.25 |
| `--text-stat` (large numerals, if/when used) | `clamp(2.5rem, 1.8rem + 3vw, 4.5rem)` | ~40px | ~72px | 700, tabular-nums | 1 |
| `--text-body-lg` (hero/intro copy) | `clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)` | ~17px | ~19px | 400 | 1.6 |
| `--text-body` (default paragraph) | `1rem` (fixed) | 16px | 16px | 400 | 1.6 |
| `--text-sm` (meta, secondary) | `0.875rem` (fixed) | 14px | 14px | 400–500 | 1.5 |
| `--text-eyebrow` (small labels, Inter not mono) | `0.8125rem` (fixed) | 13px | 13px | 600, +0.04em tracking | 1.2 |

Deliberate weight variation is a requirement: H1 at 800, H2 at 700, H3/H4 at 600, nav/buttons at 600, body at 400, secondary text at 400 but in the muted `--color-text-secondary`. No section should read as a single weight.

H1 line breaks are hand-set in content — e.g. "Preview your new website" / "before you pay for it." as two explicit lines, with "new website" carrying a controlled highlight treatment (a low-opacity lavender or lime marker-style background behind the phrase, not a gradient-text effect).

---

## 3. Spacing scale

Unchanged from the first draft. Component-level spacing keeps the existing token names plus one addition:

```
--space-1: 0.25rem   --space-5: 2.5rem
--space-2: 0.5rem    --space-6: 4rem
--space-3: 1rem      --space-7: 6rem
--space-4: 1.5rem    --space-8: 8rem   (new)
```

Section rhythm becomes fluid instead of a flat `padding-block: var(--space-6)`:

```
--section-padding: clamp(4rem, 3rem + 4vw, 8rem);
--grid-gutter: clamp(1rem, 0.75rem + 1vw, 2rem);
```

---

## 4. Grid

Unchanged from the first draft.

- Container widens from 1200px to **1360px**, fluid side padding `clamp(1.25rem, 1rem + 2vw, 3rem)`.
- New 12-column grid utility (`.grid-12`, `.col-span-*`, `.col-start-*`), mobile-first — full width by default below 768px.
- Enables the hero split, the industry bento, the preview-concepts layout, and the pricing section's elevated middle tile.

---

## 5. Colour usage

Target proportion (65% warm/neutral, 20% ink, 10% purple, 5% lime) is measured across total homepage surface area. With **one** full-bleed dark section rather than two, that section carries most of the "20% ink / 10% purple" weight; the final CTA's tone is decided later (§8.12) precisely so this proportion — and the site's overall light-theme identity — isn't broken by defaulting two sections to dark.

| Token | Where it's used |
|---|---|
| `--color-bg` (#F7F7F3) | Default page background; the majority of section backgrounds |
| `--color-surface` (#FFFFFF) | Cards/tiles, header background, form fields, alternating sections |
| `--color-text` (#121318) | Headline text; background of the monthly-model dark section |
| `--color-text-secondary` (#5E626D) | Supporting copy, meta labels, muted descriptions |
| `--color-primary` (#6447E8) | Primary buttons, active nav/link state, icon accents, selected-plan border |
| `--color-primary-deep` (#332375) | Paired/alternated with ink in the one dark section, primary-button hover, overlay accents on device frames |
| `--color-lavender` (#ECE8FF) | Secondary-button hover fill, tag/pill backgrounds, subtle highlight block behind the H1 emphasis phrase |
| `--color-accent` (#C8F169) | **Only**: selected/active state, "Recommended" tag, directional highlight (connector-line progress, dark-section link underline), a status dot, a marquee band *if one ships* |
| `--color-border` (#DADBD5) | Hairline dividers, input borders, card borders on white/warm surfaces |

Still forbidden: lime as a default numbered-step circle fill, lime or purple as a large decorative background, gradients as a substitute for actual layout work, uniform card borders/radius as the only differentiator between sections, and — per this revision — any statistic, review, client or result that isn't real and verified appearing anywhere in rendered output, development included (see §9).

---

## 6. Component styling

**Header** — sticky, and per this revision explicitly required to:
- Have a **solid fallback background** (`--color-bg` at ~96% opacity minimum) at all times — the translucent/blurred treatment is a progressive enhancement (`@supports (backdrop-filter: blur(1px))`) layered on top, never a requirement for legibility.
- **Maintain contrast over every section** scrolled beneath it — because the background never drops to fully transparent, text and buttons stay legible regardless of what's underneath (light or the one dark section).
- **Avoid flicker**: the scroll-state class toggle uses a debounced/`requestAnimationFrame`-throttled passive scroll listener with a small threshold buffer (not a bare `scroll > 0` check), so it doesn't rapidly flip near the top.
- **Stay compact**: header height is fixed between states — only background opacity/blur and a hairline shadow change, nothing resizes, so there's no layout shift.
- **Keep the JS minimal**: one small listener toggling one class; no scroll-jacking, no dependency.

Logo becomes a temporary refined wordmark + small inline-SVG geometric mark (two overlapping forms in purple/lime) — clearly labeled in code as a placeholder pending real brand assets. "Book a Free 30-Minute Discovery Call" becomes a quieter refined secondary action; "Get a Free Preview" stays the single dominant filled action.

**Buttons** — primary gets a soft elevated shadow and a slightly larger touch target; hover states use both colour shift and a subtle lift, never colour-only. Secondary/ghost buttons get a refined thin border and icon slot.

**Cards/tiles** — a system of differently-sized bento tiles (dominant / medium / supporting), not one repeated card component.

**Forms & booking modal** — visual language only, documented for a *later* pass (§11); no behavioural or structural change yet.

---

## 7. Motion principles

| Effect | Behaviour | Reduced motion |
|---|---|---|
| Scroll reveal | Fade + `translateY(14px)→0`, 420ms ease-out, staggered ~70ms per sibling, via `IntersectionObserver` | Content renders in final state immediately, no transform |
| Device-frame drift | Subtle continuous `translateY` tied to scroll (≤12px amplitude); hover = slight tilt (≤4deg), pointer devices only | No drift, no tilt |
| Card/tile hover | `translateY(-4px)` + deeper shadow, 150ms | Hover colour change only, no movement |
| Process connector line | SVG line draws in (`stroke-dashoffset`) as each step enters view | Line shown fully drawn, no animation |
| Marquee | **Optional** — built only if a real, useful, continuously-scrolling piece of information (e.g. the list of what's included, or served regions) actually improves the composition. If it doesn't earn its place, it's cut, not forced in for the sake of the reference. If used: CSS `@keyframes` loop, ~35s linear, pause-on-hover | Static wrapped list, no animation (or simply not built if the animated version isn't used) |
| FAQ open/close | Native `<details>`/`<summary>`, restyled (custom marker icon, spacing, hover/focus states) — **no animated open/close by default** | N/A — no animation to disable |

No preloader, no custom cursor, no scroll-jacking/parallax beyond the bounded device-frame drift above, no animation library.

---

## 8. Homepage — section-by-section composition

1. **Hero** — 12-col grid, left content (cols 1–6) / right visual (cols 7–12), text-first order on mobile.
   - *Left*: eyebrow label with a lime status-dot, H1 with hand-set line breaks and one highlighted phrase, `--text-body-lg` supporting copy, qualification/trust note, primary + secondary CTA.
   - *Right* (revised per reviewer feedback — this must show the actual transformation, not abstract rectangles): a layered **before → after** composition. Behind: a muted, low-contrast "before" browser frame — sparse, dated-looking layout, generic faded placeholder copy — representing a weak or missing website. In front, overlapping with a clear visual seam (a soft diagonal reveal line or directional arrow): a vivid, fully-styled "after" browser frame showing a credible, modern local-business homepage concept — real illustrative hierarchy (nav bar, headline, CTA button, image block) using the SFD palette, with generic micro-copy like "Your Business Name" / "Call Now" that obviously isn't a real business (never a real or implied business name). A smaller mobile-phone frame beside it repeats the "after" state responsively. A small floating "7-day private preview" chip with a compact countdown/progress motif reinforces the review mechanic (a factual process description, not a stat). Faint dot-grid background, restrained drift only.
   - Sized to feel complete at common laptop heights — no forced `100vh` dead zone.
2. **Credibility strip** — **rebuilt per this revision**: no statistics, no "pending verification" content, nothing unresolved rendered in any mode. Four always-true, already-confirmed trust signals, rendered plainly (icon + short line each):
   - Preview your website before you pay
   - No obligation to continue after the preview
   - Hosting and maintenance included with every active plan
   - Serving businesses across the world! (amended 2026-09-20; was "Serving businesses across the USA, Canada, Australia, New Zealand and Europe")
   This section no longer depends on the `verified` mechanism at all — everything in it is true today.
3. **How your preview works** — unchanged: alternating narrative, large ghosted numerals (01–04), a drawn-in connector line, one small supporting visual per step.
4. **Industries** — asymmetric bento (Home Services dominant; Restaurants + Healthcare medium; Financial + Professional Services supporting). **Revised**: since none of the five industry pages exist yet, tiles render as styled, non-interactive cards (no `href`) rather than links — avoiding the 404s the original draft would have shipped. They become real links automatically once Phase 4 builds those pages (same content, just no anchor wrapper until then).
5. **What every managed website includes** — bento (one dominant "everything handled" tile + smaller Hosting & Security / Analytics / Monthly Updates / SEO Foundation / Mobile Optimization tiles), unchanged.
6. **Monthly-model statement** — the **one** full-bleed dark section (ink/deep-purple). Large white headline, one lime-highlighted phrase, a plain-language "traditional project pricing" vs. "SFD monthly model" comparison — no invented dollar figures — plus a CTA.
7. **Preview Concepts** (renamed from "Featured Work" — SFD has no verified client work yet, and the section must never imply otherwise). Three illustrative device-frame concepts — Home Services, Restaurant, and Healthcare/Professional Services — each visually similar in treatment to the hero's "after" mockup but distinct per industry. **Every single example carries a persistent, clearly visible caption: "Illustrative website concept — not a published client project."** No industry-neutral wording implying these are real deliveries, results or endorsements. This section no longer uses the `verified: false` placeholder mechanism (§9) — it isn't pending verification, it's permanently, explicitly illustrative.
8. **Pricing summary** — Growth tile visually elevated between two more compact Essential/Automation tiles; check-icon inclusion lists. The elevated tile is labeled **"Best Value"** (owner decision, 2026-09-20) rather than "Most Popular" — SFD has no usage data to support a popularity claim. **Revised**: while prices are unresolved, the price row is omitted entirely — no "TBD", no "Pricing finalizing", no dashes, zeroes or invented figures anywhere in rendered output, in any mode. Each plan still shows its name, who it's for, its included features and its CTA. Production validation still hard-fails the build while `priceMonthly` remains unresolved (§9) — omitting the price row is a display decision, not a validation bypass; launch is still blocked until real prices exist.
9. **Growth services** — horizontally connected module diagram (core "website" node with lines to SEO/GBP, AI, WhatsApp, CRM chips), unchanged.
10. **Testimonials** — unchanged behaviour: renders nothing while `data/testimonials.json` stays empty.
11. **FAQ** — split layout: sticky heading + intro + reinforcing CTA on the left, **native `<details>`/`<summary>` accordion, restyled** on the right (custom marker icon, generous spacing, clear expanded-state styling, no animated open/close by default — see §7).
12. **Final CTA** — **tone deliberately left open** in this document. Once the full homepage rhythm is assembled (one dark section already spent on the monthly-model statement), the final CTA's background — dark, purple, lavender or warm-light — is decided by what keeps the page feeling balanced and recognizably light-theme overall, not pre-committed here. Structure regardless of tone: large headline with hand-set line breaks, two CTAs, one small trust line.
13. **Footer** — **revised per this revision**: brief brand statement (docs/01's pre-approved remote-team wording), multi-column nav (Websites / Industries / Resources / Company / Legal). **No intentional broken links**: any destination page that doesn't exist yet renders as a plain, non-linked label (not an `<a>`) instead of a 404-bound link; columns/items become real links automatically as their pages are built in later phases. The social row only renders an icon as a link if a real, verified profile URL exists (§9) — otherwise that platform is simply omitted, never shown as a dead or `#` link. Legal links only appear once their pages exist, following the same rule.

---

## 9. Data convention: `verified: false`

Narrower scope than the first draft, per this revision:

- **No longer used for** the credibility strip (replaced with always-true static content, §8.2) or Preview Concepts (permanently illustrative-labeled, not a pending-verification state, §8.7).
- **Still used for**:
  - **Pricing figures** — `"priceMonthly": null, "verified": false` omits the price row from rendered output entirely, in every mode (never "TBD", never "Pricing finalizing", never a dash or invented figure). The plan card still shows name, audience, features and CTA. Production build still fails while unresolved — display and validation are handled separately, so this can never be mistaken for a launch bypass.
  - **Footer social links** — a platform only renders if it has a real URL; unverified entries are omitted from render entirely (not shown placeholder-styled), consistent with §8.13's no-broken-links rule.
- **Validation behaviour unchanged**: development mode never silently hides an issue (it's either omitted per the rules above, or shown with an unmistakable "finalizing" treatment); production mode hard-fails the build on any unresolved `verified: false` item it still finds, exactly like the existing TBD-string scanner.

---

## 10. Files this will touch once approved

| File | Change |
|---|---|
| `assets/css/tokens.css` | Extend: fluid type scale, `--space-8`, `--section-padding`, `--grid-gutter`, `--container-max-width: 1360px` |
| `assets/css/base.css` | Substantial rewrite: typography, section rhythm, container, 12-col grid utilities |
| `assets/css/components.css` | Substantial rewrite: buttons, cards/tiles, header states, native-details FAQ styling |
| `assets/css/homepage.css` *(new)* | Homepage-specific bento/hero/statement/preview-concepts/growth-modules layout |
| `assets/js/scroll-reveal.js` *(new)* | IntersectionObserver-based reveal-on-scroll |
| `assets/js/header-scroll.js` *(new)* | Minimal, rAF-throttled, flicker-free scroll-state toggle (solid fallback always present) |
| `templates/partials/header.njk` | Full redesign |
| `templates/partials/footer.njk` | Full redesign — valid-links-or-plain-label logic |
| `templates/sections/hero.njk` | Full redesign — before/after device-frame composition |
| `templates/sections/trust-signals.njk` *(new, replaces `proof-strip.njk`)* | Four static, always-true trust signals — no `verified` logic needed |
| `templates/sections/process.njk` | Major redesign for the homepage narrative treatment |
| `templates/sections/industry-links.njk` → `industry-bento.njk` | Redesign; tiles render without `href` until their pages exist |
| `templates/sections/feature-grid.njk` | Kept as-is for simple future uses; homepage inclusions section uses a new `feature-bento.njk` |
| `templates/sections/statement.njk` *(new)* | The one monthly-model dark section |
| `templates/sections/preview-concepts.njk` *(new, replaces the "featured-work" idea from draft 1)* | Three illustrative, permanently-labeled concept tiles |
| `templates/sections/pricing-summary.njk` | Redesign: asymmetric hierarchy, "Recommended" tag, placeholder-safe pricing |
| `templates/sections/growth-modules.njk` *(new)* | Connected-module diagram |
| `templates/sections/faq.njk` | Restyled, native `<details>`/`<summary>` retained |
| `templates/sections/cta.njk` | Redesign for the homepage final-CTA use; tone decided during build (§8.12) |
| `templates/pages/page.njk` | Updated dispatch table for the renamed/new section types |
| `scripts/validate-data.js` | Add `verified: false` scanning, scoped to pricing and footer social links only |
| `data/pages/home.json` | Restructured to the new section types |
| `data/footer.json` | Populated with real column structure; items without a real target render label-only, not linked |

A dedicated `assets/js/accordion.js` and any `marquee` styling are **not committed files** in this pass — they're only built if, respectively, full keyboard/focus/screen-reader/ARIA parity work for a custom disclosure is separately scoped and tested (§7), or a marquee actually earns a place in the composition (§7).

Not touched in this pass: `templates/partials/booking-dialog.njk`, `assets/js/booking.js`, `templates/sections/free-preview-form.njk`, `assets/js/free-preview-form.js`, and every page other than the homepage.

---

## 11. Future direction, not implemented yet

### Booking modal (documented now, built later)
Elegant two-panel desktop layout; compact step indicator; real calendar-grid date selection; time slots grouped; a persistent selected date/time summary; a custom-styled accessible timezone selector; polished form controls; a small reassuring privacy line; full-screen sheet on mobile; the development-mode notice shrunk to a small, clearly secondary element outside the primary visual flow.

### Free Preview form (documented now, built later)
Staged/grouped experience: an introductory trust panel, progress indication across groups (About you / Your business / The problem), contextual helper text, a stronger form-card visual treatment, a privacy reassurance line, and a clean single-column mobile layout.

---

## 12. How this differs from what's currently live

| Area | Current | Proposed |
|---|---|---|
| Header | Plain text logo, always-solid white bar, equal-weight buttons | Wordmark + mark lockup; solid fallback that gains blur/shadow on scroll, never loses contrast |
| Hero | Centered text block only, no visual | Split composition showing an actual weak→polished website transformation, plus mobile view and preview-countdown cue |
| Credibility strip | Renders nothing (empty array) | Renders four always-true trust signals — nothing unresolved, in any mode |
| Process | 4 equal columns with lime-circle numbers | Alternating narrative with large ghosted numerals and a drawn connector line |
| Industries | 5 equal white cards | Asymmetric bento with one dominant tile; non-linked until pages exist (no 404s) |
| Inclusions | 4 equal feature cards | Bento with one dominant "everything handled" tile |
| Monthly model | Plain tinted card grid | The one full-bleed dark editorial statement section |
| Portfolio proof | Doesn't exist | "Preview Concepts" — three illustrative, permanently-labeled example concepts; never implies real clients/results |
| Pricing | 3 identical cards, no popularity claim | Growth tile visually elevated, labeled "Recommended", check-icon lists, price row omitted entirely until real prices exist |
| Growth services | 3 generic cards | Connected-module diagram |
| FAQ | Native `<details>` list, single column, unstyled | Split sticky-left / native-accordion-right, fully restyled |
| Final CTA | Flat purple strip | Editorial composition; tone (dark/purple/lavender/light) decided after full-page rhythm review |
| Footer | One copyright line, some links would 404 | Full brand statement + nav columns + legal, with unbuilt destinations rendered as plain labels, not broken links |
| Marquee | N/A | Optional — only if it adds real information value |
| Motion | None | Scroll reveal, connector-line draw-in, device-frame drift — all reduced-motion-safe; no forced animated accordion |

---

## 13. Review process

Per the reviewer's required evaluation order, this redesign is reviewed as:

1. Desktop homepage screenshot
2. Mobile homepage screenshot
3. Header states (top-of-page, scrolled, mobile menu open)
4. Footer
5. Interaction states (hover/focus, FAQ open, CTA hover/focus)

The visual system is **not** propagated to How It Works, Pricing, Free Preview or Book a Call until the homepage is explicitly approved through this process.

---

Awaiting your review and explicit approval of this revised direction before any implementation file is touched.

---

## Amendments since implementation (kept current; supersede the text above)

- **Scope:** the dark hero band, footer and link-hover treatments now apply sitewide, not to the homepage only. How It Works, Pricing, Free Preview, Book a Call and every other internal page share the same system.
- **Credibility (trust) strip:** now a dark brand band (purple-to-deep-ink gradient, faint gold glow at the top, gold hairlines top and bottom). Items are centred, in the heading font, each with a gold-ringed check icon and thin vertical dividers on desktop (no dividers on mobile). Shared by Home and About. Homepage fourth item reads "Serving businesses across the world!"; About keeps its own wording. This is broader than the documented target markets in docs/01; the target-market list is unchanged.
- **Internal page heroes:** every page except the homepage uses the dark `hero--band` (gradient, gold glow, gold hairline, white title, gold eyebrow, gold primary button, white-outline secondary button). Pages without a hero section get the band with only the H1.
- **Footer:** four link columns (Websites, Industries, Resources, Company); the logo column width is unchanged. The Legal group is no longer a column: Privacy Policy, Terms and Conditions, Subscription Terms and Refund Policy are a centred horizontal row (`legalLinks` in `data/footer.json`) above a centred copyright line, with small gold dot separators. Column headings are gold accent with a gold-to-transparent gradient hairline underneath. Legal links all point to real pages.
- **Link hover (footer columns, footer legal row, header top-level links):** colour change plus a thin gold gradient underline that grows from the centre (`scaleX`), on hover and keyboard focus; transitions removed under `prefers-reduced-motion`. Header sub-menu links deliberately keep their original hover. Header text stays deep purple on hover for contrast (gold on the light header fails AA).


## Header logo on tablet and mobile (2026-09-21)

Up to 1399px wide (the centred-logo header, with the bottom tab bar) the header shows the full black wordmark, `assets/images/sfd-logo-black-header.png` (502x90, transparent, about 9 KB), centred at 28px tall. From 1400px (single-row desktop header) it keeps the mark, `sfd-logo-2026.png`, unchanged. Implemented with a `<picture>` whose `<source media="(max-width: 1399px)">` points at the wordmark (`templates/partials/header.njk`). The header-sized file is a downscaled copy of `SFD-Black-logo.png` (6667x1196, 358 KB, kept as the master); if the logo changes, regenerate it at 3x the display size (about 500px wide) with a transparent background.
