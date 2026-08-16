import { useParams } from 'react-router-dom'
import PublicLayout from '../../components/marketing/PublicLayout'
import StickyMobileCta from '../../components/marketing/StickyMobileCta'
import QueryState from '../../components/ui/QueryState'
import { LinkButton } from '../../components/ui/Button'
import LeadForm from '../../components/forms/LeadForm'
import BookingWidget from '../../components/booking/BookingWidget'
import Reveal from '../../components/motion/Reveal'
import { SERVICE_INQUIRY_FORM_CONFIG } from '../../lib/forms/formConfigs'
import { useFetch } from '../../hooks/useFetch'
import { fetchServiceBySlug } from '../../lib/supabase/queries'

/**
 * Rule C: this template is used for every service regardless of which of the
 * five offerings it is — all differentiation comes from the fetched row
 * (name, descriptions, niche_tags), never from per-service components.
 */
function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: service, loading, error } = useFetch(() => fetchServiceBySlug(slug!), [slug])

  return (
    <PublicLayout>
      <QueryState
        loading={loading}
        error={error}
        empty={!loading && !error && !service}
        emptyMessage="This service couldn't be found."
        variant="clinical"
      />

      {!loading && !error && service && (
        <>
          <div className="mx-auto max-w-3xl px-4 pb-16 pt-20 sm:px-6">
            <Reveal variant="mask">
              <p className="font-mono-label flex items-center gap-2 text-xs text-studio-ink">
                <span className="h-[2px] w-5 bg-studio-ink" />
                Service
              </p>
            </Reveal>
            <Reveal variant="mask" delay={0.08}>
              <h1 className="mt-3 text-4xl font-bold leading-tight tracking-[-0.02em] text-studio-ink sm:text-5xl">
                {service.name}
              </h1>
            </Reveal>
            {service.short_description && (
              <Reveal delay={0.16}>
                <p className="mt-5 text-lg text-studio-ink-soft">{service.short_description}</p>
              </Reveal>
            )}
            {service.long_description && (
              <Reveal delay={0.2}>
                <div className="mt-8 whitespace-pre-line leading-relaxed text-studio-ink-soft">
                  {service.long_description}
                </div>
              </Reveal>
            )}

            {service.niche_tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {service.niche_tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono-label rounded-full bg-studio-bg-card-soft px-3 py-1 text-[10px] uppercase text-studio-ink-soft"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {!service.is_bookable && (
              <div className="mt-10">
                <LinkButton to="/contact" variant="clinical" size="lg">
                  Get Started
                </LinkButton>
              </div>
            )}

            {service.is_bookable && (
              <div className="mt-10">
                <BookingWidget
                  serviceId={service.id}
                  serviceName={service.name}
                  durationMinutes={service.default_duration_minutes ?? 30}
                />
              </div>
            )}

            <div className="mt-16 border-t border-studio-line pt-10">
              <LeadForm
                config={SERVICE_INQUIRY_FORM_CONFIG}
                source={`service_page:${service.slug}`}
                entryServiceId={service.id}
                variant="clinical"
              />
            </div>
          </div>
          <StickyMobileCta />
        </>
      )}
    </PublicLayout>
  )
}

export default ServiceDetailPage
