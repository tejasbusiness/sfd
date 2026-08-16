import { motion, useReducedMotion } from 'framer-motion'
import { useFetch } from '../../hooks/useFetch'
import { fetchPublishedPricingTiers } from '../../lib/supabase/queries'
import { formatPrice } from '../../lib/currency/formatPrice'
import QueryState from '../ui/QueryState'
import SectionHeading from '../ui/SectionHeading'
import { LinkButton } from '../ui/Button'
import Reveal from '../motion/Reveal'

/**
 * Homepage teaser only — defaults to USD display since full geolocation
 * currency-switching is a Phase 3 deliverable (docs/05). This preview exists
 * to show tier names/prices at a glance, not to be the checkout entry point.
 */
function PricingPreview() {
  const { data: tiers, loading, error } = useFetch(fetchPublishedPricingTiers, [])
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="Pricing" title="Simple plans. No surprises." variant="clinical" />

      <QueryState loading={loading} error={error} empty={!loading && !error && tiers?.length === 0} />

      {!loading && !error && tiers && tiers.length > 0 && (
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {tiers.map((tier, index) => (
            <Reveal key={tier.id} index={index}>
              <div
                className={`relative h-full rounded-2xl p-7 ${
                  tier.is_most_popular
                    ? 'border-2 border-studio-ink bg-studio-ink text-white'
                    : 'border border-studio-line bg-white'
                }`}
              >
                {tier.is_most_popular && (
                  <motion.span
                    className="font-mono-label absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-studio-line bg-white px-3 py-1 text-[10px] uppercase text-studio-ink"
                    animate={prefersReducedMotion ? undefined : { scale: [1, 1.05, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    Most Popular
                  </motion.span>
                )}
                <p
                  className={`font-mono-label text-xs uppercase ${tier.is_most_popular ? 'text-white/60' : 'text-studio-ink-faint'}`}
                >
                  {tier.name}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-[-0.02em]">
                  {formatPrice(tier, 'USD')}
                  <span
                    className={`ml-1 text-sm font-medium ${tier.is_most_popular ? 'text-white/60' : 'text-studio-ink-soft'}`}
                  >
                    /mo
                  </span>
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <LinkButton to="/pricing" variant="clinical-ghost" size="lg">
          See Full Pricing
        </LinkButton>
      </div>
    </section>
  )
}

export default PricingPreview
