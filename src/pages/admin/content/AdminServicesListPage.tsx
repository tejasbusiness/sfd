import { Link } from 'react-router-dom'
import AdminLayout from '../../../components/admin/AdminLayout'
import QueryState from '../../../components/ui/QueryState'
import { useFetch } from '../../../hooks/useFetch'
import { fetchAllServices } from '../../../lib/supabase/adminContentQueries'

function AdminServicesListPage() {
  const { data: services, loading, error } = useFetch(fetchAllServices, [])

  return (
    <AdminLayout title="Services">
      <div className="mb-4 flex justify-end">
        <Link
          to="/admin/content/services/new"
          className="font-mono-label rounded-full bg-ink px-4 py-2 text-[11px] uppercase text-cream transition-colors hover:bg-teal-dark"
        >
          New service
        </Link>
      </div>

      <QueryState loading={loading} error={error} empty={!loading && !error && (services?.length ?? 0) === 0} emptyMessage="No services yet." />

      {!loading && !error && services && services.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-ink/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="font-mono-label border-b border-ink/10 text-[10px] uppercase text-ink-soft">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Bookable</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-b border-ink/5 last:border-0 hover:bg-sage/40">
                  <td className="px-4 py-3">
                    <Link to={`/admin/content/services/${s.id}`} className="text-ink underline decoration-ink/20 hover:decoration-teal">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{s.slug}</td>
                  <td className="px-4 py-3 text-ink-soft">{s.is_bookable ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-ink-soft">{s.display_order}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono-label rounded-full border px-2.5 py-1 text-[10px] uppercase ${s.is_published ? 'border-teal/30 text-teal' : 'border-ink/15 text-ink-soft'}`}>
                      {s.is_published ? 'Published' : 'Draft'}
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

export default AdminServicesListPage
