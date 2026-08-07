import type { PortfolioItem } from '../../lib/supabase/types'

interface CaseStudyCardProps {
  item: PortfolioItem
}

/**
 * Rule C: generic template for every case study, regardless of niche.
 * Niche framing comes entirely from item.niche_tags/summary — this
 * component never branches on a specific practice type.
 */
function CaseStudyCard({ item }: CaseStudyCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-ink/10 bg-cream transition-colors hover:border-teal/40">
      <div className="aspect-video bg-sage">
        {item.cover_image_url && (
          <img
            src={item.cover_image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-2">
          {item.niche_tags.map((tag) => (
            <span
              key={tag}
              className="font-mono-label rounded-full bg-sage px-2.5 py-0.5 text-[10px] uppercase text-ink-soft"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="font-display mt-3 text-lg text-ink">{item.title}</h3>
        {item.summary && <p className="mt-2 text-sm text-ink-soft">{item.summary}</p>}
        {item.outcome_metrics.length > 0 && (
          <dl className="mt-4 flex gap-6">
            {item.outcome_metrics.map((metric) => (
              <div key={metric.label}>
                <dt className="font-mono-label text-[10px] uppercase text-ink-soft">{metric.label}</dt>
                <dd className="font-display text-lg text-teal">{metric.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {item.live_url && (
          <a
            href={item.live_url}
            target="_blank"
            rel="noreferrer"
            className="font-mono-label mt-4 inline-block text-[10px] uppercase text-ink underline decoration-teal decoration-2 underline-offset-4"
          >
            View live site →
          </a>
        )}
      </div>
    </article>
  )
}

export default CaseStudyCard
