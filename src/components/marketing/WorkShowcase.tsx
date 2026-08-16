import { useFetch } from '../../hooks/useFetch'
import { fetchPublishedPortfolioItems } from '../../lib/supabase/queries'
import QueryState from '../ui/QueryState'
import SectionHeading from '../ui/SectionHeading'
import CaseStudyCard from './CaseStudyCard'
import { LinkButton } from '../ui/Button'
import Reveal from '../motion/Reveal'

function WorkShowcase() {
  const { data: items, loading, error } = useFetch(fetchPublishedPortfolioItems, [])
  const preview = items?.slice(0, 3) ?? []

  if (!loading && !error && preview.length === 0) {
    return null
  }

  return (
    <section className="relative overflow-hidden bg-studio-bg-card-soft py-20">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="Selected work" title="Real practices. Real results." variant="clinical" />

        <QueryState loading={loading} error={error} />

        {!loading && !error && preview.length > 0 && (
          <>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {preview.map((item, index) => (
                <Reveal key={item.id} index={index}>
                  <CaseStudyCard item={item} variant="clinical" />
                </Reveal>
              ))}
            </div>
            <div className="mt-10 text-center">
              <LinkButton to="/portfolio" variant="clinical-ghost" size="lg">
                See All Work
              </LinkButton>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default WorkShowcase
