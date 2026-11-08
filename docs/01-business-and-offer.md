# Business and Offer Strategy

## Business model

SFD sells managed websites through a Website-as-a-Service subscription. Prospects see a meaningful preview before committing. After activation, SFD completes the website, connects the customer domain and manages hosting, maintenance and defined monthly services.

## Target customer

Primary targets are operating local businesses with a weak digital presence:

- No website, or a dated, slow, broken or ineffective website.
- Evidence of a viable active business.
- Recent customer activity and a working phone number.
- Clear services and a meaningful average customer value.
- Weak mobile experience, calls to action, local visibility or enquiry flow.

Priority niches (owner decision 2026-11-03): garage door services, tree services, roofing and exterior, plumbing, HVAC and electrical, and fencing, concrete and remodeling. Healthcare, financial services, professional services, restaurants and generic home services were dropped.

Do not position inactive businesses with no market proof as ideal customers. SFD helps a healthy business present and convert better; it does not fix a fundamentally non-operational business.

## Geographic position

SFD serves non-Indian businesses. **Since 2026-11-08 (owner decision) the site targets home service businesses in the US, UK and Canada**; the earlier list (USA, Canada, Australia, New Zealand, Germany and other European markets) is superseded. Website prices are displayed only in USD.

Do not imply that SFD is physically located in the prospect's country. Company and legal information must be transparent. Recommended public wording:

> We build and manage conversion-focused websites for local businesses—starting with a free website preview, you can review before you commit.

## Core promise

Recommended headline direction:

> See your new website before you pay for it.

Recommended supporting direction:

> We design, host and manage conversion-focused websites for local service businesses — with no large upfront website cost and one predictable monthly fee.

The homepage targets local service businesses broadly. It must not be written for a single niche (such as roofers or tree services); niche messaging belongs on the industry pages.

Final marketing copy may improve this wording but must preserve the promise.

## Conversion hierarchy

Locked by the owner on 2026-10-02 (homepage final pass):

1. **Start My Free Website Preview**: the primary CTA. Every button that asks for the private preview uses it, and all of them go to the same `/free-preview/` request. Titles and headings may still say "Request Your Free Website Preview".
2. **Book a Free 20-Minute Call**: the immediate human-contact CTA. Every call button opens the same booking modal, and the call is 20 minutes long.
3. **Get My Free Website Review** (Free Website Review; was "Free Audit Report" until 2026-11-08): the lower-intent offer on the homepage, a short video review recorded by Tejas. It diagnoses the current website; it never creates a preview.
3. **See How It Works** — education CTA.
4. **View Websites** — proof CTA.

Do not promise that every applicant automatically receives a free preview. Recommended qualifier:

> Apply for a complimentary website preview. We review every request to ensure we can create something genuinely useful for your business.

## Monthly offer structure

Exact names, prices, commitment period and allowances are `TBD`. The architecture must support three plans:

### Website Essential

- Professional multi-page website within a defined page allowance.
- Hosting, SSL, mobile optimization, forms, backups and technical maintenance.
- SEO foundation and analytics.
- Defined monthly content-update allowance.

### Website Growth

- Everything in Essential.
- Additional service and location pages.
- Google Business Profile or local-visibility support.
- Monthly conversion and content improvements.
- Reporting and review-generation support where included.

### Website + Automation

- Everything in Growth.
- WhatsApp, CRM or lead-notification integration.
- Defined automated follow-up workflow.
- AI assistant or business automation allowance where applicable.

Never advertise unlimited work. Every plan must specify inclusions, exclusions, turnaround, fair-use limits and extra-work pricing.

## Commercial safeguards

Before launch, SFD must choose at least one:

- Minimum subscription term.
- Activation fee.
- Higher month-to-month price.
- Discounted annual payment.
- Defined website buyout option.

Subscription terms must define domain ownership, source-code rights, content ownership, cancellation, export or buyout, late payment, support limits, third-party charges and post-cancellation behaviour.

## Growth services

SEO, Google Business Profile services, social media, AI, WhatsApp Business API, CRM and automation are upgrades or expansion services. They must not compete equally with the primary website offer in the hero.


## Founding Client Program (2026-11-08)

The first 5 home service businesses get Business plan features ($449/month) for $249/month for their first 6 months, plus CRM lead capture and follow-up setup at no extra cost, in exchange for permission to publish a case study with real results, a testimonial after 90 days only if they are happy, and honest feedback. Month-to-month, no activation fee; after 6 months they choose Business or Lite; cancelling ends every obligation, including the testimonial. Page: `/founding-clients/`. The spots left are set by hand in `data/plans.json` (`foundingClients.spotsLeft`).

## CRM and lead follow-up (2026-11-08)

CRM and lead follow-up is part of the Business plan, not a separate service. It replaces "AI & Automation" as a supporting service. The live features are: every website form submission saved as a lead; lead status (new, contacted, quoted, won, lost); notes and follow-up reminders; an email notification for each new lead. Do not describe AI, automation, SMS or missed-call text back until they are built.
