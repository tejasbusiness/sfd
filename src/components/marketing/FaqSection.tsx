import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import SectionHeading from '../ui/SectionHeading'
import Reveal from '../motion/Reveal'

const FAQS = [
  {
    question: 'How long does a project take?',
    answer:
      "Most projects move through discovery, design & build, then launch & grow — typically a few weeks from kickoff to a live site, depending on scope. We'll give you a specific timeline on your discovery call.",
  },
  {
    question: "What's included in each pricing tier?",
    answer:
      'Each plan includes a different set of features and support levels — see the full breakdown on our pricing page. Every plan includes the core website build; higher tiers add more pages, SEO, and support.',
  },
  {
    question: 'Do you only work with healthcare practices?',
    answer:
      "Yes — we work exclusively with healthcare and wellness practices (dentists, dermatologists, physios, pediatricians, eye clinics, dietitians, and fitness/wellness studios), so every site we build starts from what actually converts patients, not a generic template.",
  },
  {
    question: 'What happens after the site launches?',
    answer:
      "Launch isn't the finish line. We keep optimizing SEO and conversion month over month, and our team is always available for updates, questions, and technical support as your practice grows.",
  },
  {
    question: 'Can I cancel or change plans later?',
    answer:
      "Yes — plans are billed on a simple recurring basis with no long-term lock-in. You can change tiers or cancel at any time; reach out to our team and we'll take care of it.",
  },
  {
    question: 'Do you handle hosting and security?',
    answer:
      "Yes — hosting, security, and uptime are handled for you as part of every plan, so you don't need to manage servers or worry about your site going down.",
  },
]

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const prefersReducedMotion = useReducedMotion()

  return (
    <section className="mx-auto max-w-[720px] px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="FAQ" title="Questions, answered." variant="supahub" />

      <div className="mt-10 flex flex-col gap-3">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index
          return (
            <Reveal key={faq.question} index={index}>
              <div className="rounded-2xl border border-supahub-mist bg-white">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-[22px]"
                >
                  <span className="text-base font-semibold text-supahub-ink">{faq.question}</span>
                  <motion.span
                    className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-supahub-fog text-supahub-ink"
                    animate={prefersReducedMotion ? undefined : { rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-supahub-slate sm:px-[22px] sm:pb-5">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

export default FaqSection
