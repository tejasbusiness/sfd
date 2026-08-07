import SectionHeading from '../ui/SectionHeading'

const STEPS = [
  { title: 'Discovery call', description: 'We learn about your practice, patients, and goals.' },
  { title: 'Design & build', description: 'We design and build a site tailored to how patients actually search and book.' },
  { title: 'Launch & grow', description: 'We launch, then keep optimizing SEO and conversion month over month.' },
]

function ProcessSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="How It Works" title="Three steps, start to launch." />
        <ol className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative border-t border-ink/15 pt-6">
              <span className="font-display absolute -top-6 left-0 text-4xl text-teal/30">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-xl text-ink">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default ProcessSection
