import { Link } from 'react-router-dom'
import AdminLayout from '../../../components/admin/AdminLayout'
import QueryState from '../../../components/ui/QueryState'
import { useFetch } from '../../../hooks/useFetch'
import { fetchAllTestimonials } from '../../../lib/supabase/adminContentQueries'

function AdminTestimonialsListPage() {
  const { data: testimonials, loading, error } = useFetch(fetchAllTestimonials, [])

  return (
    <AdminLayout title="Testimonials">
      <div className="mb-4 flex justify-end">
        <Link
          to="/admin/content/testimonials/new"
          className="font-mono-label rounded-full bg-ink px-4 py-2 text-[11px] uppercase text-cream transition-colors hover:bg-teal-dark"
        >
          New testimonial
        </Link>
      </div>

      <QueryState loading={loading} error={error} empty={!loading && !error && (testimonials?.length ?? 0) === 0} emptyMessage="No testimonials yet." />

      {!loading && !error && testimonials && testimonials.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-ink/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="font-mono-label border-b border-ink/10 text-[10px] uppercase text-ink-soft">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Quote</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((t) => (
                <tr key={t.id} className="border-b border-ink/5 last:border-0 hover:bg-sage/40">
                  <td className="px-4 py-3">
                    <Link to={`/admin/content/testimonials/${t.id}`} className="text-ink underline decoration-ink/20 hover:decoration-teal">
                      {t.client_name}
                    </Link>
                    {t.practice_name && <div className="text-xs text-ink-soft">{t.practice_name}</div>}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-ink-soft">{t.quote}</td>
                  <td className="px-4 py-3 text-ink-soft">{t.is_featured ? 'Yes' : ''}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono-label rounded-full border px-2.5 py-1 text-[10px] uppercase ${t.is_published ? 'border-teal/30 text-teal' : 'border-ink/15 text-ink-soft'}`}>
                      {t.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminTestimonialsListPage
