import { Link } from 'react-router-dom'

const SPARK_PATH = 'M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z'

// "WhatsApp API" mirrors the WhatsApp Business API service; "Prompt
// Generator" and "Book a Call" columns match the artifact's Tools footer
// group exactly.
const FOOTER_COLUMNS: { heading: string; links: { label: string; to: string }[] }[] = [
  {
    heading: 'Services',
    links: [
      { label: 'Web Design', to: '/services/web-design' },
      { label: 'SEO', to: '/services/seo' },
      { label: 'AI Solutions', to: '/services/ai-solutions' },
      { label: 'WhatsApp API', to: '/services/whatsapp-business-api' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Portfolio', to: '/portfolio' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    heading: 'Tools',
    links: [{ label: 'Prompt Generator', to: '/website-prompt-generator' }],
  },
]

function SiteFooter() {
  return (
    <footer className="border-t border-supahub-mist">
      <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 text-[17px] font-bold text-supahub-ink">
              <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px] text-supahub-violet">
                <path d={SPARK_PATH} fill="currentColor" />
              </svg>
              SynergyFirst
            </Link>
            <p className="mt-3.5 max-w-[220px] text-sm leading-relaxed text-supahub-slate">
              Websites &amp; automation for healthcare and wellness practices.
            </p>
          </div>

          <div className="flex flex-wrap gap-16">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.heading}>
                <h4 className="mb-3.5 text-xs font-bold uppercase tracking-[0.08em] text-supahub-slate">{col.heading}</h4>
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="block py-1 text-sm text-supahub-graphite transition-colors hover:text-supahub-violet"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-supahub-mist pt-6 text-center text-[13px] text-supahub-slate">
          © {new Date().getFullYear()} SynergyFirst Digital. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
