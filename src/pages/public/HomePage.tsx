import PublicLayout from '../../components/marketing/PublicLayout'
import Hero from '../../components/marketing/Hero'
import ServicesGrid from '../../components/marketing/ServicesGrid'
import WorkShowcase from '../../components/marketing/WorkShowcase'
import ProcessSection from '../../components/marketing/ProcessSection'
import TestimonialsSection from '../../components/marketing/TestimonialsSection'
import PricingPreview from '../../components/marketing/PricingPreview'

function HomePage() {
  return (
    <PublicLayout>
      <Hero />
      <ServicesGrid />
      <WorkShowcase />
      <ProcessSection />
      <TestimonialsSection />
      <PricingPreview />
    </PublicLayout>
  )
}

export default HomePage
