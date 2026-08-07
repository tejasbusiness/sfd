import { useState } from 'react'
import PublicLayout from '../../components/marketing/PublicLayout'
import StickyMobileCta from '../../components/marketing/StickyMobileCta'
import QueryState from '../../components/ui/QueryState'
import PageHeader from '../../components/ui/PageHeader'
import { LinkButton } from '../../components/ui/Button'
import { useFetch } from '../../hooks/useFetch'
import { fetchPublishedPricingTiers } from '../../lib/supabase/queries'
import { formatPrice } from '../../lib/currency/formatPrice'
import type { Currency } from '../../lib/payments'

/**
 * Preview only — manual currency toggle for browsing, no geolocation default
 * and no checkout wiring (both are Phase 3 deliverables, docs/05). Buttons
 * route to /contact rather than a real checkout for now.
 */
function PricingPage() {
  const { data: tiers, loading, error } = useFetch(fetchPublishedPricingTiers, [])
  const [currency, setCurrency] = useState<Currency>('USD')

  return (
    <PublicLayout>
      <PageHeader eyebrow="Pricing" title="Simple, monthly plans." description="Cancel anytime.">
        <div className="mt-6 inline-flex rounded-full border border-ink/15 p-1">
          {(['USD', 'INR'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={`font-mono-label rounded-full px-4 py-1.5 text-[11px] uppercase transition-colors ${currency === c ? 'bg-ink text-cream' : 'text-ink-soft'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <QueryState loading={loading} error={error} empty={!loading && !error && tiers?.length === 0} />

        {!loading && !error && tiers && tiers.length > 0 && (
          <div className="mt-10 grid gap-6 pb-20 sm:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`rounded-2xl border p-7 ${tier.is_most_popular ? 'border-teal bg-sage' : 'border-ink/10 bg-cream'}`}
              >
                {tier.is_most_popular && (
                  <span className="font-mono-label text-[10px] uppercase text-teal">
                    Most Popular
                  </span>
                )}
                <h2 className="font-display mt-1 text-xl text-ink">{tier.name}</h2>
                <p className="font-display mt-2 text-4xl text-ink">
                  {formatPrice(tier, currency)}
                  <span className="font-sans text-sm text-ink-soft">/mo</span>
                </p>
                <ul className="mt-6 space-y-2 text-sm text-ink-soft">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="text-teal">—</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <LinkButton to="/contact" className="mt-7 w-full">
                  Get Started
                </LinkButton>
              </div>
            ))}
          </div>
        )}
      </div>
      <StickyMobileCta label="See Plans" />
    </PublicLayout>
  )
}

export default PricingPage
