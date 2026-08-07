import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../../components/admin/AdminLayout'
import QueryState from '../../../components/ui/QueryState'
import { Button } from '../../../components/ui/Button'
import { inputClasses, labelClasses } from '../../../components/ui/Input'
import { useAuth } from '../../../context/AuthContext'
import { useFetch } from '../../../hooks/useFetch'
import { fetchServiceById, upsertService, deleteService } from '../../../lib/supabase/adminContentQueries'
import { slugify } from '../../../lib/slugify'

function AdminServiceFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const navigate = useNavigate()
  const { profile } = useAuth()
  const canWrite = profile?.role === 'admin'

  const { data: existing, loading, error } = useFetch(() => (isEditing ? fetchServiceById(id!) : Promise.resolve(null)), [id])

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [shortDescription, setShortDescription] = useState('')
  const [longDescription, setLongDescription] = useState('')
  const [nicheTags, setNicheTags] = useState('')
  const [isBookable, setIsBookable] = useState(false)
  const [defaultDuration, setDefaultDuration] = useState(30)
  const [displayOrder, setDisplayOrder] = useState(0)
  const [isPublished, setIsPublished] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!existing) return
    setName(existing.name)
    setSlug(existing.slug)
    setShortDescription(existing.short_description ?? '')
    setLongDescription(existing.long_description ?? '')
    setNicheTags(existing.niche_tags.join(', '))
    setIsBookable(existing.is_bookable)
    setDefaultDuration(existing.default_duration_minutes ?? 30)
    setDisplayOrder(existing.display_order)
    setIsPublished(existing.is_published)
  }, [existing])

  useEffect(() => {
    if (!isEditing && !slugTouched) setSlug(slugify(name))
  }, [name, isEditing, slugTouched])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    try {
      await upsertService({
        id,
        slug,
        name,
        short_description: shortDescription || null,
        long_description: longDescription || null,
        niche_tags: nicheTags.split(',').map((t) => t.trim()).filter(Boolean),
        is_bookable: isBookable,
        default_duration_minutes: isBookable ? defaultDuration : null,
        display_order: displayOrder,
        is_published: isPublished,
      })
      navigate('/admin/content/services')
    } catch {
      setSubmitError('Failed to save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!id || !window.confirm('Delete this service? This cannot be undone.')) return
    try {
      await deleteService(id)
      navigate('/admin/content/services')
    } catch {
      setSubmitError('Failed to delete. It may still be referenced by leads or bookings.')
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Edit service' : 'New service'}>
      <button
        type="button"
        onClick={() => navigate('/admin/content/services')}
        className="font-mono-label mb-4 text-[11px] uppercase text-ink-soft transition-colors hover:text-teal"
      >
        ← Back to services
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
            <label htmlFor="svc-name" className={labelClasses}>
              Name
            </label>
            <input id="svc-name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
          </div>

          <div>
            <label htmlFor="svc-slug" className={labelClasses}>
              Slug
            </label>
            <input
              id="svc-slug"
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
            <label htmlFor="svc-short" className={labelClasses}>
              Short description
            </label>
            <input id="svc-short" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className={inputClasses} />
          </div>

          <div>
            <label htmlFor="svc-long" className={labelClasses}>
              Long description
            </label>
            <textarea id="svc-long" rows={5} value={longDescription} onChange={(e) => setLongDescription(e.target.value)} className={inputClasses} />
          </div>

          <div>
            <label htmlFor="svc-niches" className={labelClasses}>
              Niche tags (comma-separated)
            </label>
            <input
              id="svc-niches"
              value={nicheTags}
              onChange={(e) => setNicheTags(e.target.value)}
              placeholder="dentist, dermatologist, physio"
              className={inputClasses}
            />
          </div>

          <label className="font-mono-label flex items-center gap-2 text-[11px] uppercase text-ink-soft">
            <input type="checkbox" checked={isBookable} onChange={(e) => setIsBookable(e.target.checked)} className="accent-teal" />
            Bookable (shows the booking widget)
          </label>

          {isBookable && (
            <div>
              <label htmlFor="svc-duration" className={labelClasses}>
                Default duration (minutes)
              </label>
              <input
                id="svc-duration"
                type="number"
                min={5}
                step={5}
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(Number(e.target.value))}
                className={inputClasses}
              />
            </div>
          )}

          <div>
            <label htmlFor="svc-order" className={labelClasses}>
              Display order
            </label>
            <input
              id="svc-order"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className={inputClasses}
            />
          </div>

          <label className="font-mono-label flex items-center gap-2 text-[11px] uppercase text-ink-soft">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="accent-teal" />
            Published (visible on the public site)
          </label>

          {submitError && (
            <p role="alert" className="text-sm text-terracotta">
              {submitError}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={submitting || !canWrite}>
              {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create service'}
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

export default AdminServiceFormPage
