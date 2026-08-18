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
        variant="supahub"
      />

      {!loading && !error && service && (
        <>
          <div className="supahub-page-header">
            <div className="supahub-ph-orb supahub-ph-fill" aria-hidden="true" />
            <div className="supahub-ph-orb supahub-ph-pink" aria-hidden="true" />
            <div className="supahub-ph-orb supahub-ph-rim" aria-hidden="true" />
            <div className="relative z-[1] mx-auto max-w-3xl px-4 pb-16 pt-20 sm:px-6">
              <Reveal variant="mask">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-supahub-violet">Service</p>
              </Reveal>
              <Reveal variant="mask" delay={0.08}>
                <h1 className="font-bricolage mt-3 text-4xl font-semibold leading-tight tracking-[-0.02em] text-supahub-ink sm:text-5xl">
                  {service.name}
                </h1>
              </Reveal>
              {service.short_description && (
                <Reveal delay={0.16}>
                  <p className="mt-5 text-lg text-supahub-slate">{service.short_description}</p>
                </Reveal>
              )}
              {service.long_description && (
                <Reveal delay={0.2}>
                  <div className="mt-8 whitespace-pre-line leading-relaxed text-supahub-slate">
                    {service.long_description}
                  </div>
                </Reveal>
              )}

              {service.niche_tags.length > 0 && (
                <Reveal delay={0.24} className="mt-8 flex flex-wrap gap-2">
                  {service.niche_tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-supahub-fog px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-supahub-slate"
                    >
                      {tag}
                    </span>
                  ))}
                </Reveal>
              )}

              {!service.is_bookable && (
                <Reveal delay={0.28} className="mt-10">
                  <LinkButton to="/contact" variant="supahub" size="lg">
                    Get Started
                  </LinkButton>
                </Reveal>
              )}

              {service.is_bookable && (
                <Reveal delay={0.28} className="mt-10">
                  <BookingWidget
                    serviceId={service.id}
                    serviceName={service.name}
                    durationMinutes={service.default_duration_minutes ?? 30}
                  />
                </Reveal>
              )}

              <Reveal delay={0.32} className="mt-16 border-t border-supahub-mist pt-10">
                <LeadForm
                  config={SERVICE_INQUIRY_FORM_CONFIG}
                  source={`service_page:${service.slug}`}
                  entryServiceId={service.id}
                  variant="supahub"
                />
              </Reveal>
            </div>
          </div>
          <StickyMobileCta />
        </>
      )}
    </PublicLayout>
  )
}

export default ServiceDetailPage
