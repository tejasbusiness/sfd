import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../../components/admin/AdminLayout'
import QueryState from '../../../components/ui/QueryState'
import LabelValueListEditor, { type LabelValuePair } from '../../../components/admin/LabelValueListEditor'
import { Button } from '../../../components/ui/Button'
import { inputClasses, labelClasses } from '../../../components/ui/Input'
import { useAuth } from '../../../context/AuthContext'
import { useFetch } from '../../../hooks/useFetch'
import { fetchPortfolioItemById, upsertPortfolioItem, deletePortfolioItem } from '../../../lib/supabase/adminContentQueries'
import { slugify } from '../../../lib/slugify'

function AdminPortfolioFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const navigate = useNavigate()
  const { profile } = useAuth()
  const canWrite = profile?.role === 'admin'

  const { data: existing, loading, error } = useFetch(() => (isEditing ? fetchPortfolioItemById(id!) : Promise.resolve(null)), [id])

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [nicheTags, setNicheTags] = useState('')
  const [summary, setSummary] = useState('')
  const [outcomeMetrics, setOutcomeMetrics] = useState<LabelValuePair[]>([])
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [liveUrl, setLiveUrl] = useState('')
  const [displayOrder, setDisplayOrder] = useState(0)
  const [isPublished, setIsPublished] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!existing) return
    setTitle(existing.title)
    setSlug(existing.slug)
    setNicheTags(existing.niche_tags.join(', '))
    setSummary(existing.summary ?? '')
    setOutcomeMetrics(existing.outcome_metrics)
    setCoverImageUrl(existing.cover_image_url ?? '')
    setLiveUrl(existing.live_url ?? '')
    setDisplayOrder(existing.display_order)
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
      await upsertPortfolioItem({
        id,
        slug,
        title,
        niche_tags: nicheTags.split(',').map((t) => t.trim()).filter(Boolean),
        summary: summary || null,
        outcome_metrics: outcomeMetrics.filter((m) => m.label || m.value),
        cover_image_url: coverImageUrl || null,
        live_url: liveUrl || null,
        display_order: displayOrder,
        is_published: isPublished,
      })
      navigate('/admin/content/portfolio')
    } catch {
      setSubmitError('Failed to save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!id || !window.confirm('Delete this portfolio item? This cannot be undone.')) return
    try {
      await deletePortfolioItem(id)
      navigate('/admin/content/portfolio')
    } catch {
      setSubmitError('Failed to delete. Please try again.')
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Edit case study' : 'New case study'}>
      <button
        type="button"
        onClick={() => navigate('/admin/content/portfolio')}
        className="font-mono-label mb-4 text-[11px] uppercase text-ink-soft transition-colors hover:text-teal"
      >
        ← Back to portfolio
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
            <label htmlFor="pf-title" className={labelClasses}>
              Title
            </label>
            <input id="pf-title" required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClasses} />
          </div>

          <div>
            <label htmlFor="pf-slug" className={labelClasses}>
              Slug
            </label>
            <input
              id="pf-slug"
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
            <label htmlFor="pf-niches" className={labelClasses}>
              Niche tags (comma-separated)
            </label>
            <input id="pf-niches" value={nicheTags} onChange={(e) => setNicheTags(e.target.value)} className={inputClasses} />
          </div>

          <div>
            <label htmlFor="pf-summary" className={labelClasses}>
              Summary
            </label>
            <textarea id="pf-summary" rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} className={inputClasses} />
          </div>

          <LabelValueListEditor label="Outcome metrics" value={outcomeMetrics} onChange={setOutcomeMetrics} />

          <div>
            <label htmlFor="pf-cover" className={labelClasses}>
              Cover image URL
            </label>
            <input id="pf-cover" type="url" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} className={inputClasses} />
          </div>

          <div>
            <label htmlFor="pf-live" className={labelClasses}>
              Live URL
            </label>
            <input id="pf-live" type="url" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} className={inputClasses} />
          </div>

          <div>
            <label htmlFor="pf-order" className={labelClasses}>
              Display order
            </label>
            <input
              id="pf-order"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className={inputClasses}
            />
          </div>

          <label className="font-mono-label flex items-center gap-2 text-[11px] uppercase text-ink-soft">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="accent-teal" />
            Published (visible on the portfolio page)
          </label>

          {submitError && (
            <p role="alert" className="text-sm text-terracotta">
              {submitError}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={submitting || !canWrite}>
              {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create case study'}
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

export default AdminPortfolioFormPage
