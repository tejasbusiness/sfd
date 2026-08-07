import PublicLayout from '../../components/marketing/PublicLayout'
import PageHeader from '../../components/ui/PageHeader'

function AboutPage() {
  return (
    <PublicLayout>
      <PageHeader eyebrow="About" title="A specialist, not a generalist." />
      <div className="mx-auto max-w-2xl px-4 pb-20 pt-4 sm:px-6">
        <p className="text-lg leading-relaxed text-ink-soft">
          SynergyFirst Digital is a specialist web design agency for healthcare and wellness
          practitioners — dentists, dermatologists, physiotherapists, chiropractors,
          pediatricians, eye clinics, dietitians, fitness coaches, and yoga studios.
        </p>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          We understand that your website's job isn't to look good — it's to get patients to
          book. Every site we build is designed around appointment-driven, trust-sensitive
          practices, with local SEO and review-driven trust signals built in from day one.
        </p>
      </div>
    </PublicLayout>
  )
}

export default AboutPage
