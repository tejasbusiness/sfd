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
        variant="clinical"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {niches.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveNiche(null)}
              className={`font-mono-label rounded-full px-3.5 py-1.5 text-[10px] uppercase transition-colors ${!activeNiche ? 'bg-studio-ink text-white' : 'bg-studio-bg-card-soft text-studio-ink-soft hover:bg-studio-line'}`}
            >
              All
            </button>
            {niches.map((niche) => (
              <button
                key={niche}
                type="button"
                onClick={() => setActiveNiche(niche)}
                className={`font-mono-label rounded-full px-3.5 py-1.5 text-[10px] uppercase transition-colors ${activeNiche === niche ? 'bg-studio-ink text-white' : 'bg-studio-bg-card-soft text-studio-ink-soft hover:bg-studio-line'}`}
              >
                {niche}
              </button>
            ))}
          </div>
        )}

        <QueryState
          loading={loading}
          error={error}
          empty={!loading && !error && filtered.length === 0}
          emptyMessage="No case studies match this filter yet."
          variant="clinical"
        />

        {!loading && !error && filtered.length > 0 && (
          <div className="mt-10 grid gap-6 pb-20 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, index) => (
              <Reveal key={item.id} index={index}>
                <CaseStudyCard item={item} variant="clinical" />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  )
}

export default PortfolioPage
