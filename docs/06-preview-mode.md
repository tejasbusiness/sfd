# Private Preview Mode

## Purpose

SFD creates personalized concept websites for qualified prospects. A preview exists for private review, is not the business's official website and expires after seven days unless activated.

## Preview URL

Use a dedicated preview host with a non-trivial identifier:

```text
https://preview.synergyfirstdigital.com/business-slug-unique-code/
```

## Mandatory safeguards

- Meta robots: `noindex, nofollow`.
- `X-Robots-Tag: noindex, nofollow` at the server or CDN.
- Exclude previews from every sitemap.
- Never set a preview URL as a production canonical.
- Display a clear concept-preview disclaimer.
- Do not send customer enquiries to the prospect.
- Avoid advertising or retargeting analytics on preview visits.
- Record sources and rights for every logo, photograph and review used.
- Do not state or imply that the preview is the business's official website.

Recommended disclaimer:

> Concept website created by SynergyFirst Digital for private review. This is not the business's official website and is not currently accepting customer enquiries.

## Preview bar

The sticky top bar remains visible and includes:

- Private Website Preview label.
- Real countdown to a fixed expiration timestamp.
- CTA: **Keep This Website**.
- Optional short disclaimer link.

The timer must never reset on refresh, cookie deletion or another device. It uses a fixed server-generated UTC expiration timestamp.

## Lifecycle

1. Prospect qualified.
2. Preview generated from a clean niche starter.
3. Expiration fixed.
4. Video and preview sent.
5. Prospect activates or preview expires.
6. Activated site moves into production workflow.
7. Expired preview displays an expiry page and is archived.

## Activation

The CTA opens a prospect-specific activation flow showing:

- Prospect business name.
- What will be completed after activation.
- Applicable monthly plans.
- Timing.
- Commercial and ownership terms.
- Booking and payment/onboarding actions.

On activation:

- Remove preview UI and disclaimer.
- Complete approved pages and content.
- Replace preview metadata with production metadata.
- Connect the customer-owned domain.
- Enable production analytics, forms, sitemap and indexability.

## Reuse policy

Reuse the niche architecture and components, not the prospect's logo, images, reviews, NAP, credentials, service copy, tracking IDs, metadata or form configuration. Start every new preview from a clean starter to prevent customer-data leakage.

