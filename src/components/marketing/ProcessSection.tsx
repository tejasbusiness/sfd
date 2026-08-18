import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading'
import Reveal from '../motion/Reveal'

const STEPS = [
  { title: 'Discovery call', description: 'We learn about your practice, patients, and goals.' },
  { title: 'Design & build', description: 'We design and build a site tailored to how patients actually search and book.' },
  { title: 'Launch & grow', description: 'We launch, then keep optimizing SEO and conversion month over month.' },
]

function ProcessSection() {
  const timelineRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ['start 0.85', 'start 0.4'] })
  const lineWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section className="py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <SectionHeading eyebrow="How it works" title="Three steps. No guesswork." variant="supahub" />

        <div ref={timelineRef} className="relative mt-20">
          <div className="absolute top-0 left-0 h-[2px] w-full bg-supahub-mist" />
          <motion.div
            className="absolute top-0 left-0 h-[2px] bg-supahub-violet"
            style={{ width: prefersReducedMotion ? '100%' : lineWidth }}
          />

          <ol className="relative grid gap-9 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <Reveal key={step.title} as="li" index={index} className="relative pt-8">
                <span className="absolute left-0 top-0 h-[11px] w-[11px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-sm bg-supahub-violet" />
                <span className="font-bricolage absolute -top-16 right-0 text-6xl font-bold text-supahub-mist">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-bricolage text-xl font-semibold tracking-[-0.02em] text-supahub-ink">{step.title}</h3>
                <p className="mt-2 max-w-[30ch] text-sm leading-relaxed text-supahub-slate">{step.description}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

export default ProcessSection
