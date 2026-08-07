import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../../components/admin/AdminLayout'
import QueryState from '../../../components/ui/QueryState'
import { Button } from '../../../components/ui/Button'
import { inputClasses, labelClasses } from '../../../components/ui/Input'
import { useAuth } from '../../../context/AuthContext'
import { useFetch } from '../../../hooks/useFetch'
import { fetchTestimonialById, upsertTestimonial, deleteTestimonial } from '../../../lib/supabase/adminContentQueries'

function AdminTestimonialFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const navigate = useNavigate()
  const { profile } = useAuth()
  const canWrite = profile?.role === 'admin'

  const { data: existing, loading, error } = useFetch(() => (isEditing ? fetchTestimonialById(id!) : Promise.resolve(null)), [id])

  const [clientName, setClientName] = useState('')
  const [practiceName, setPracticeName] = useState('')
  const [quote, setQuote] = useState('')
  const [rating, setRating] = useState(5)
  const [photoUrl, setPhotoUrl] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [displayOrder, setDisplayOrder] = useState(0)
  const [isPublished, setIsPublished] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!existing) return
    setClientName(existing.client_name)
    setPracticeName(existing.practice_name ?? '')
    setQuote(existing.quote)
    setRating(existing.rating ?? 5)
    setPhotoUrl(existing.photo_url ?? '')
    setIsFeatured(existing.is_featured)
    setDisplayOrder(existing.display_order)
    setIsPublished(existing.is_published)
  }, [existing])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    try {
      await upsertTestimonial({
        id,
        client_name: clientName,
        practice_name: practiceName || null,
        quote,
        rating,
        photo_url: photoUrl || null,
        is_featured: isFeatured,
        display_order: displayOrder,
        is_published: isPublished,
      })
      navigate('/admin/content/testimonials')
    } catch {
      setSubmitError('Failed to save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!id || !window.confirm('Delete this testimonial? This cannot be undone.')) return
    try {
      await deleteTestimonial(id)
      navigate('/admin/content/testimonials')
    } catch {
      setSubmitError('Failed to delete. Please try again.')
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Edit testimonial' : 'New testimonial'}>
      <button
        type="button"
        onClick={() => navigate('/admin/content/testimonials')}
        className="font-mono-label mb-4 text-[11px] uppercase text-ink-soft transition-colors hover:text-teal"
      >
        ← Back to testimonials
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
            <label htmlFor="tm-name" className={labelClasses}>
              Client name
            </label>
            <input id="tm-name" required value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClasses} />
          </div>

          <div>
            <label htmlFor="tm-practice" className={labelClasses}>
              Practice name
            </label>
            <input id="tm-practice" value={practiceName} onChange={(e) => setPracticeName(e.target.value)} className={inputClasses} />
          </div>

          <div>
            <label htmlFor="tm-quote" className={labelClasses}>
              Quote
            </label>
            <textarea id="tm-quote" required rows={4} value={quote} onChange={(e) => setQuote(e.target.value)} className={inputClasses} />
          </div>

          <div>
            <label htmlFor="tm-rating" className={labelClasses}>
              Rating (1–5)
            </label>
            <input
              id="tm-rating"
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="tm-photo" className={labelClasses}>
              Photo URL
            </label>
            <input id="tm-photo" type="url" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} className={inputClasses} />
          </div>

          <label className="font-mono-label flex items-center gap-2 text-[11px] uppercase text-ink-soft">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-teal" />
            Featured (shown in the homepage testimonial strip)
          </label>

          <div>
            <label htmlFor="tm-order" className={labelClasses}>
              Display order
            </label>
            <input
              id="tm-order"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className={inputClasses}
            />
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
              {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create testimonial'}
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

export default AdminTestimonialFormPage
