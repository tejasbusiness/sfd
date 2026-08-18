import { useMemo, useState } from 'react'
import PublicLayout from '../../components/marketing/PublicLayout'
import CaseStudyCard from '../../components/marketing/CaseStudyCard'
import QueryState from '../../components/ui/QueryState'
import PageHeader from '../../components/ui/PageHeader'
import { useFetch } from '../../hooks/useFetch'
import { fetchPublishedPortfolioItems } from '../../lib/supabase/queries'
import Reveal from '../../components/motion/Reveal'

function PortfolioPage() {
  const { data: items, loading, error } = useFetch(fetchPublishedPortfolioItems, [])
  const [activeNiche, setActiveNiche] = useState<string | null>(null)

  const niches = useMemo(() => {
    if (!items) return []
    return Array.from(new Set(items.flatMap((item) => item.niche_tags))).sort()
  }, [items])

  const filtered = useMemo(() => {
    if (!items) return []
    if (!activeNiche) return items
    return items.filter((item) => item.niche_tags.includes(activeNiche))
  }, [items, activeNiche])

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Portfolio"
        title="Case studies from real practices."
        description="Filter by specialty to see work closest to yours."
        variant="supahub"
      />

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {niches.length > 0 && (
          <Reveal delay={0.1} className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveNiche(null)}
              className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] transition-colors ${!activeNiche ? 'bg-supahub-ink text-white' : 'bg-supahub-fog text-supahub-slate hover:bg-supahub-mist'}`}
            >
              All
            </button>
            {niches.map((niche) => (
              <button
                key={niche}
                type="button"
                onClick={() => setActiveNiche(niche)}
                className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] transition-colors ${activeNiche === niche ? 'bg-supahub-ink text-white' : 'bg-supahub-fog text-supahub-slate hover:bg-supahub-mist'}`}
              >
                {niche}
              </button>
            ))}
          </Reveal>
        )}

        <QueryState
          loading={loading}
          error={error}
          empty={!loading && !error && filtered.length === 0}
          emptyMessage="No case studies match this filter yet."
          variant="supahub"
        />

        {!loading && !error && filtered.length > 0 && (
          <div className="mt-10 grid gap-6 pb-20 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, index) => (
              <Reveal key={item.id} index={index}>
                <CaseStudyCard item={item} variant="supahub" />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  )
}

export default PortfolioPage
