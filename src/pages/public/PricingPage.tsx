import PublicLayout from '../../components/marketing/PublicLayout'
import StickyMobileCta from '../../components/marketing/StickyMobileCta'
import QueryState from '../../components/ui/QueryState'
import PageHeader from '../../components/ui/PageHeader'
import CheckoutButton from '../../components/billing/CheckoutButton'
import { useFetch } from '../../hooks/useFetch'
import { useCurrency } from '../../hooks/useCurrency'
import { fetchPublishedPricingTiers } from '../../lib/supabase/queries'
import { formatPrice } from '../../lib/currency/formatPrice'

/**
 * Currency defaults from server-side IP geolocation (India -> INR, else USD,
 * per docs/05) via useCurrency, with a manual toggle that overrides and
 * persists the visitor's choice. Checkout is real (CheckoutButton ->
 * processPayment -> create-checkout-session edge function) but gateway API
 * keys aren't configured yet — see docs/logs.md for the credential gap;
 * clicking through surfaces a clear "not configured yet" message rather than
 * a broken/silent failure.
 */
function PricingPage() {
  const { data: tiers, loading, error } = useFetch(fetchPublishedPricingTiers, [])
  const [currency, setCurrency, currencyLoading] = useCurrency()

  return (
    <PublicLayout>
      <PageHeader eyebrow="Pricing" title="Simple, monthly plans." description="Cancel anytime.">
        <div className="mt-6 inline-flex rounded-full border border-ink/15 p-1">
          {(['USD', 'INR'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              disabled={currencyLoading}
              className={`font-mono-label rounded-full px-4 py-1.5 text-[11px] uppercase transition-colors disabled:opacity-50 ${currency === c ? 'bg-ink text-cream' : 'text-ink-soft'}`}
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
                <CheckoutButton tierId={tier.id} tierName={tier.name} currency={currency} />
              </div>
            ))}
          </div>
        )}
      </div>
      <StickyMobileCta />
    </PublicLayout>
  )
}

export default PricingPage
