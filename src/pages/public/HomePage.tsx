import PublicLayout from '../../components/marketing/PublicLayout'
import Hero from '../../components/marketing/Hero'
import ProofStrip from '../../components/marketing/ProofStrip'
import ServicesGrid from '../../components/marketing/ServicesGrid'
import WhyChooseUsSection from '../../components/marketing/WhyChooseUsSection'
import WorkShowcase from '../../components/marketing/WorkShowcase'
import ProcessSection from '../../components/marketing/ProcessSection'
import TestimonialsSection from '../../components/marketing/TestimonialsSection'
import FaqSection from '../../components/marketing/FaqSection'
import StickyMobileCta from '../../components/marketing/StickyMobileCta'

function HomePage() {
  return (
    <PublicLayout>
      <Hero />
      <ProofStrip />
      <ServicesGrid />
      <WhyChooseUsSection />
      <WorkShowcase />
      <ProcessSection />
      <TestimonialsSection />
      <FaqSection />
      <StickyMobileCta />
    </PublicLayout>
  )
}

export default HomePage
