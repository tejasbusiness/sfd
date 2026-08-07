import { Link } from 'react-router-dom'
import AdminLayout from '../../../components/admin/AdminLayout'
import QueryState from '../../../components/ui/QueryState'
import { useFetch } from '../../../hooks/useFetch'
import { fetchAllBlogPosts } from '../../../lib/supabase/adminContentQueries'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function AdminBlogListPage() {
  const { data: posts, loading, error } = useFetch(fetchAllBlogPosts, [])

  return (
    <AdminLayout title="Blog Posts">
      <p className="mb-4 text-sm text-ink-soft">
        Authoring only — public <code>/blog</code> pages aren't built on the marketing site yet.
      </p>

      <div className="mb-4 flex justify-end">
        <Link
          to="/admin/content/blog/new"
          className="font-mono-label rounded-full bg-ink px-4 py-2 text-[11px] uppercase text-cream transition-colors hover:bg-teal-dark"
        >
          New post
        </Link>
      </div>

      <QueryState loading={loading} error={error} empty={!loading && !error && (posts?.length ?? 0) === 0} emptyMessage="No blog posts yet." />

      {!loading && !error && posts && posts.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-ink/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="font-mono-label border-b border-ink/10 text-[10px] uppercase text-ink-soft">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-ink/5 last:border-0 hover:bg-sage/40">
                  <td className="px-4 py-3">
                    <Link to={`/admin/content/blog/${p.id}`} className="text-ink underline decoration-ink/20 hover:decoration-teal">
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{p.slug}</td>
                  <td className="px-4 py-3 text-ink-soft">{formatDate(p.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono-label rounded-full border px-2.5 py-1 text-[10px] uppercase ${p.is_published ? 'border-teal/30 text-teal' : 'border-ink/15 text-ink-soft'}`}>
                      {p.is_published ? 'Published' : 'Draft'}
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

export default AdminBlogListPage
