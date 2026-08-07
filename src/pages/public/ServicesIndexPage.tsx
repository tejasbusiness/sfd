import PublicLayout from '../../components/marketing/PublicLayout'
import ServicesGrid from '../../components/marketing/ServicesGrid'
import PageHeader from '../../components/ui/PageHeader'

function ServicesIndexPage() {
  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Services"
        title="Everything a practice needs to grow."
        description="Built specifically for healthcare and wellness — not adapted from a generic template."
      />
      <ServicesGrid />
    </PublicLayout>
  )
}

export default ServicesIndexPage
