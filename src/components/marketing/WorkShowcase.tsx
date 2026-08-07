import { useFetch } from '../../hooks/useFetch'
import { fetchPublishedPortfolioItems } from '../../lib/supabase/queries'
import QueryState from '../ui/QueryState'
import SectionHeading from '../ui/SectionHeading'
import CaseStudyCard from './CaseStudyCard'
import { LinkButton } from '../ui/Button'

function WorkShowcase() {
  const { data: items, loading, error } = useFetch(fetchPublishedPortfolioItems, [])
  const preview = items?.slice(0, 3) ?? []

  if (!loading && !error && preview.length === 0) {
    return null
  }

  return (
    <section className="bg-sage/60 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="Recent Work" title="Practices we've helped grow." />

        <QueryState loading={loading} error={error} />

        {!loading && !error && preview.length > 0 && (
          <>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {preview.map((item) => (
                <CaseStudyCard key={item.id} item={item} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <LinkButton to="/portfolio" variant="secondary">
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
