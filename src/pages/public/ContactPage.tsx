import PublicLayout from '../../components/marketing/PublicLayout'
import PageHeader from '../../components/ui/PageHeader'
import LeadForm from '../../components/forms/LeadForm'
import Reveal from '../../components/motion/Reveal'
import { CONTACT_FORM_CONFIG } from '../../lib/forms/formConfigs'

function ContactPage() {
  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Contact"
        title="Let's talk about your practice."
        description="Have a question or ready to get started? Send us a message and we'll be in touch within a day."
        variant="supahub"
      />
      <div className="mx-auto max-w-lg px-4 pb-20 pt-6 sm:px-6">
        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-supahub-mist bg-white p-7 sm:p-8">
            <LeadForm config={CONTACT_FORM_CONFIG} source="contact_page" variant="supahub" />
          </div>
        </Reveal>
      </div>
    </PublicLayout>
  )
}

export default ContactPage
