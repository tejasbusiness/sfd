import type { PortfolioItem } from '../../lib/supabase/types'

interface CaseStudyCardProps {
  item: PortfolioItem
  variant?: 'editorial' | 'clinical' | 'supahub'
}

/**
 * Rule C: generic template for every case study, regardless of niche.
 * Niche framing comes entirely from item.niche_tags/summary — this
 * component never branches on a specific practice type.
 *
 * variant="clinical" opts into the retired public-site "Studio Neutral"
 * chrome; variant="supahub" opts into the current public redesign (used by
 * WorkShowcase/PortfolioPage); PortfolioPage's default stays editorial for
 * any caller that hasn't opted in.
 */
function CaseStudyCard({ item, variant = 'editorial' }: CaseStudyCardProps) {
  if (variant === 'supahub') {
    return (
      <article className="group overflow-hidden rounded-[20px] border border-supahub-mist bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(134,47,231,0.25)]">
        <div className="aspect-video overflow-hidden bg-supahub-ink">
          {item.cover_image_url && (
            <img
              src={item.cover_image_url}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover opacity-90 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]"
            />
          )}
        </div>
        <div className="p-6">
          {item.niche_tags[0] && (
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-supahub-violet">
              {item.niche_tags[0]}
            </span>
          )}
          <h3 className="font-bricolage mt-2 text-lg font-semibold tracking-[-0.02em] text-supahub-ink">{item.title}</h3>
          {item.summary && <p className="mt-2 text-sm leading-relaxed text-supahub-slate">{item.summary}</p>}
          {item.outcome_metrics.length > 0 && (
            <div className="mt-4 translate-y-1 border-t border-supahub-mist pt-3 text-xs opacity-70 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <span>
                <b className="text-supahub-ink">{item.outcome_metrics[0].value}</b> {item.outcome_metrics[0].label}
              </span>
            </div>
          )}
        </div>
      </article>
    )
  }

  if (variant === 'clinical') {
    return (
      <article className="group overflow-hidden rounded-2xl border border-studio-line bg-white">
        <div className="aspect-video overflow-hidden bg-studio-ink">
          {item.cover_image_url && (
            <img
              src={item.cover_image_url}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover opacity-90 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]"
            />
          )}
        </div>
        <div className="p-6">
          {item.niche_tags[0] && (
            <span className="font-mono-label text-[11px] uppercase text-studio-ink-faint">{item.niche_tags[0]}</span>
          )}
          <h3 className="mt-2 text-lg font-bold tracking-[-0.02em] text-studio-ink">{item.title}</h3>
          {item.summary && <p className="mt-2 text-sm leading-relaxed text-studio-ink-soft">{item.summary}</p>}
          {item.outcome_metrics.length > 0 && (
            <div className="mt-4 translate-y-1 border-t border-studio-line pt-3 text-xs opacity-70 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="font-mono-label">
                <b className="text-studio-ink">{item.outcome_metrics[0].value}</b>{' '}
                {item.outcome_metrics[0].label}
              </span>
            </div>
          )}
        </div>
      </article>
    )
  }

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
