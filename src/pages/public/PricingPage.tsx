import { motion, useReducedMotion } from 'framer-motion'
import PublicLayout from '../../components/marketing/PublicLayout'
import StickyMobileCta from '../../components/marketing/StickyMobileCta'
import QueryState from '../../components/ui/QueryState'
import PageHeader from '../../components/ui/PageHeader'
import CheckoutButton from '../../components/billing/CheckoutButton'
import Reveal from '../../components/motion/Reveal'
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
  const prefersReducedMotion = useReducedMotion()

  return (
    <PublicLayout>
      <PageHeader eyebrow="Pricing" title="Simple, monthly plans." description="Cancel anytime." variant="clinical">
        <div className="mt-6 inline-flex rounded-full border border-studio-line p-1">
          {(['USD', 'INR'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              disabled={currencyLoading}
              className={`font-mono-label rounded-full px-4 py-1.5 text-[11px] uppercase transition-colors disabled:opacity-50 ${currency === c ? 'bg-studio-ink text-white' : 'text-studio-ink-soft'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <QueryState loading={loading} error={error} empty={!loading && !error && tiers?.length === 0} variant="clinical" />

        {!loading && !error && tiers && tiers.length > 0 && (
          <div className="mt-10 grid gap-6 pb-20 sm:grid-cols-3">
            {tiers.map((tier, index) => (
              <Reveal key={tier.id} index={index}>
                <motion.div
                  whileHover={prefersReducedMotion ? undefined : { y: -6, boxShadow: '0 24px 48px -20px rgba(20,20,20,0.25)' }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative h-full rounded-2xl p-7 ${
                    tier.is_most_popular
                      ? 'border-2 border-studio-ink bg-studio-ink text-white'
                      : 'border border-studio-line bg-white'
                  }`}
                >
                  {tier.is_most_popular && (
                    <span className="font-mono-label absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-studio-line bg-white px-3 py-1 text-[10px] uppercase text-studio-ink">
                      Most Popular
                    </span>
                  )}
                  <h2 className="mt-1 text-xl font-bold tracking-[-0.02em]">{tier.name}</h2>
                  <p className="mt-2 text-4xl font-bold tracking-[-0.02em]">
                    {formatPrice(tier, currency)}
                    <span className={`text-sm font-medium ${tier.is_most_popular ? 'text-white/60' : 'text-studio-ink-soft'}`}>
                      /mo
                    </span>
                  </p>
                  <ul className={`mt-6 space-y-2 text-sm ${tier.is_most_popular ? 'text-white/75' : 'text-studio-ink-soft'}`}>
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <span className={tier.is_most_popular ? 'text-white/50' : 'text-studio-ink-faint'}>—</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <CheckoutButton tierId={tier.id} tierName={tier.name} currency={currency} variant="clinical" />
                </motion.div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
      <StickyMobileCta />
    </PublicLayout>
  )
}

export default PricingPage
