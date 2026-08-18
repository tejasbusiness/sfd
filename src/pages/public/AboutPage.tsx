import PublicLayout from '../../components/marketing/PublicLayout'
import PageHeader from '../../components/ui/PageHeader'
import Reveal from '../../components/motion/Reveal'

function AboutPage() {
  return (
    <PublicLayout>
      <PageHeader eyebrow="About" title="A specialist, not a generalist." variant="supahub" />
      <div className="mx-auto max-w-2xl px-4 pb-20 pt-4 sm:px-6">
        <Reveal>
          <p className="text-lg leading-relaxed text-supahub-slate">
            SynergyFirst Digital is a specialist web design agency for healthcare and wellness
            practitioners — dentists, dermatologists, physiotherapists, chiropractors,
            pediatricians, eye clinics, dietitians, fitness coaches, and yoga studios.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 text-lg leading-relaxed text-supahub-slate">
            We understand that your website's job isn't to look good — it's to get patients to
            book. Every site we build is designed around appointment-driven, trust-sensitive
            practices, with local SEO and review-driven trust signals built in from day one.
          </p>
        </Reveal>
      </div>
    </PublicLayout>
  )
}

export default AboutPage
