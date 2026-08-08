import { useFetch } from '../../hooks/useFetch'
import { fetchPublishedPricingTiers } from '../../lib/supabase/queries'
import { formatPrice } from '../../lib/currency/formatPrice'
import QueryState from '../ui/QueryState'
import SectionHeading from '../ui/SectionHeading'
import { LinkButton } from '../ui/Button'

/**
 * Homepage teaser only — defaults to USD display since full geolocation
 * currency-switching is a Phase 3 deliverable (docs/05). This preview exists
 * to show tier names/prices at a glance, not to be the checkout entry point.
 */
function PricingPreview() {
  const { data: tiers, loading, error } = useFetch(fetchPublishedPricingTiers, [])

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="Pricing" title="Simple, monthly plans." />

      <QueryState loading={loading} error={error} empty={!loading && !error && tiers?.length === 0} />

      {!loading && !error && tiers && tiers.length > 0 && (
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl border p-7 ${tier.is_most_popular ? 'border-teal bg-sage' : 'border-ink/10 bg-cream'}`}
            >
              {tier.is_most_popular && (
                <span className="font-mono-label absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal px-3 py-1 text-[10px] uppercase text-cream">
                  Most Popular
                </span>
              )}
              <h3 className="font-display mt-1 text-xl text-ink">{tier.name}</h3>
              <p className="font-display mt-2 text-3xl text-ink">
                {formatPrice(tier, 'USD')}
                <span className="font-sans text-sm text-ink-soft">/mo</span>
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <LinkButton to="/pricing" variant="secondary">
          See Full Pricing
        </LinkButton>
      </div>
    </section>
  )
}

export default PricingPreview
