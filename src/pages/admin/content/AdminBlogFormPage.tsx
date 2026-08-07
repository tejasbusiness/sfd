import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../../components/admin/AdminLayout'
import QueryState from '../../../components/ui/QueryState'
import { Button } from '../../../components/ui/Button'
import { inputClasses, labelClasses } from '../../../components/ui/Input'
import { useAuth } from '../../../context/AuthContext'
import { useFetch } from '../../../hooks/useFetch'
import { fetchBlogPostById, upsertBlogPost, deleteBlogPost } from '../../../lib/supabase/adminContentQueries'
import { slugify } from '../../../lib/slugify'

function AdminBlogFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const canWrite = profile?.role === 'admin'

  const { data: existing, loading, error } = useFetch(() => (isEditing ? fetchBlogPostById(id!) : Promise.resolve(null)), [id])

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!existing) return
    setTitle(existing.title)
    setSlug(existing.slug)
    setExcerpt(existing.excerpt ?? '')
    setBody(existing.body)
    setCoverImageUrl(existing.cover_image_url ?? '')
    setSeoTitle(existing.seo_title ?? '')
    setSeoDescription(existing.seo_description ?? '')
    setIsPublished(existing.is_published)
  }, [existing])

  useEffect(() => {
    if (!isEditing && !slugTouched) setSlug(slugify(title))
  }, [title, isEditing, slugTouched])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    try {
      const wasPublished = existing?.is_published ?? false
      await upsertBlogPost({
        id,
        slug,
        title,
        excerpt: excerpt || null,
        body,
        cover_image_url: coverImageUrl || null,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        author_id: existing?.author_id ?? user?.id ?? null,
        // Set published_at the first time a post is published; don't
        // overwrite it on later edits to an already-published post.
        published_at: isPublished && !wasPublished ? new Date().toISOString() : (existing?.published_at ?? null),
        is_published: isPublished,
      })
      navigate('/admin/content/blog')
    } catch {
      setSubmitError('Failed to save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!id || !window.confirm('Delete this blog post? This cannot be undone.')) return
    try {
      await deleteBlogPost(id)
      navigate('/admin/content/blog')
    } catch {
      setSubmitError('Failed to delete. Please try again.')
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Edit blog post' : 'New blog post'}>
      <button
        type="button"
        onClick={() => navigate('/admin/content/blog')}
        className="font-mono-label mb-4 text-[11px] uppercase text-ink-soft transition-colors hover:text-teal"
      >
        ← Back to blog posts
      </button>

      <QueryState loading={loading} error={error} />

      {!loading && !error && (
        <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
          {!canWrite && (
            <p role="alert" className="text-sm text-terracotta">
              Your role can view but not edit content — changes will be rejected on save. Contact an admin.
            </p>
          )}

          <div>
            <label htmlFor="bp-title" className={labelClasses}>
              Title
            </label>
            <input id="bp-title" required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClasses} />
          </div>

          <div>
            <label htmlFor="bp-slug" className={labelClasses}>
              Slug
            </label>
            <input
              id="bp-slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value)
              }}
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="bp-excerpt" className={labelClasses}>
              Excerpt
            </label>
            <textarea id="bp-excerpt" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className={inputClasses} />
          </div>

          <div>
            <label htmlFor="bp-body" className={labelClasses}>
              Body (plain text / markdown)
            </label>
            <textarea id="bp-body" required rows={12} value={body} onChange={(e) => setBody(e.target.value)} className={inputClasses} />
          </div>

          <div>
            <label htmlFor="bp-cover" className={labelClasses}>
              Cover image URL
            </label>
            <input id="bp-cover" type="url" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} className={inputClasses} />
          </div>

          <div>
            <label htmlFor="bp-seo-title" className={labelClasses}>
              SEO title
            </label>
            <input id="bp-seo-title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={inputClasses} />
          </div>

          <div>
            <label htmlFor="bp-seo-desc" className={labelClasses}>
              SEO description
            </label>
            <textarea id="bp-seo-desc" rows={2} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className={inputClasses} />
          </div>

          <label className="font-mono-label flex items-center gap-2 text-[11px] uppercase text-ink-soft">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="accent-teal" />
            Published
          </label>

          {submitError && (
            <p role="alert" className="text-sm text-terracotta">
              {submitError}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={submitting || !canWrite}>
              {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create post'}
            </Button>
            {isEditing && canWrite && (
              <button type="button" onClick={handleDelete} className="font-mono-label text-[11px] uppercase text-terracotta underline">
                Delete
              </button>
            )}
          </div>
        </form>
      )}
    </AdminLayout>
  )
}

export default AdminBlogFormPage
