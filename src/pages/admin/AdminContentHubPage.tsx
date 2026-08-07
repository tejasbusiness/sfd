import { Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'

const CONTENT_TYPES = [
  { to: '/admin/content/services', label: 'Services', description: 'The core service offerings, one page each on the public site.' },
  { to: '/admin/content/pricing', label: 'Pricing Tiers', description: 'Starter/Professional/Business plans, INR + USD.' },
  { to: '/admin/content/portfolio', label: 'Portfolio', description: 'Case studies, filterable by niche.' },
  { to: '/admin/content/testimonials', label: 'Testimonials', description: 'Client quotes shown on the homepage and pricing page.' },
  { to: '/admin/content/blog', label: 'Blog Posts', description: 'Insights content — authoring only; public /blog pages not built yet.' },
]

function AdminContentHubPage() {
  return (
    <AdminLayout title="Content">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CONTENT_TYPES.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="rounded-xl border border-ink/10 p-5 transition-colors hover:border-teal"
          >
            <h2 className="font-display text-lg text-ink">{c.label}</h2>
            <p className="mt-1 text-sm text-ink-soft">{c.description}</p>
          </Link>
        ))}
      </div>
    </AdminLayout>
  )
}

export default AdminContentHubPage
