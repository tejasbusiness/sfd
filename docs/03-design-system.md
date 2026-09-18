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

