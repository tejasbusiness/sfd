import { Link } from 'react-router-dom'
import AdminLayout from '../../../components/admin/AdminLayout'
import QueryState from '../../../components/ui/QueryState'
import { useFetch } from '../../../hooks/useFetch'
import { fetchAllPricingTiers } from '../../../lib/supabase/adminContentQueries'

function AdminPricingListPage() {
  const { data: tiers, loading, error } = useFetch(fetchAllPricingTiers, [])

  return (
    <AdminLayout title="Pricing Tiers">
      <div className="mb-4 flex justify-end">
        <Link
          to="/admin/content/pricing/new"
          className="font-mono-label rounded-full bg-ink px-4 py-2 text-[11px] uppercase text-cream transition-colors hover:bg-teal-dark"
        >
          New tier
        </Link>
      </div>

      <QueryState loading={loading} error={error} empty={!loading && !error && (tiers?.length ?? 0) === 0} emptyMessage="No pricing tiers yet." />

      {!loading && !error && tiers && tiers.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-ink/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="font-mono-label border-b border-ink/10 text-[10px] uppercase text-ink-soft">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">USD</th>
                <th className="px-4 py-3">INR</th>
                <th className="px-4 py-3">Most popular</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((t) => (
                <tr key={t.id} className="border-b border-ink/5 last:border-0 hover:bg-sage/40">
                  <td className="px-4 py-3">
                    <Link to={`/admin/content/pricing/${t.id}`} className="text-ink underline decoration-ink/20 hover:decoration-teal">
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">${(t.price_usd_cents / 100).toFixed(2)}</td>
                  <td className="px-4 py-3 text-ink-soft">₹{(t.price_inr_paise / 100).toFixed(2)}</td>
                  <td className="px-4 py-3 text-ink-soft">{t.is_most_popular ? 'Yes' : ''}</td>
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

export default AdminPricingListPage
