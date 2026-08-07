import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../../components/admin/AdminLayout'
import QueryState from '../../../components/ui/QueryState'
import StringListEditor from '../../../components/admin/StringListEditor'
import { Button } from '../../../components/ui/Button'
import { inputClasses, labelClasses } from '../../../components/ui/Input'
import { useAuth } from '../../../context/AuthContext'
import { useFetch } from '../../../hooks/useFetch'
import { fetchPricingTierById, upsertPricingTier, deletePricingTier } from '../../../lib/supabase/adminContentQueries'
import { slugify } from '../../../lib/slugify'

function AdminPricingFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const navigate = useNavigate()
  const { profile } = useAuth()
  const canWrite = profile?.role === 'admin'

  const { data: existing, loading, error } = useFetch(() => (isEditing ? fetchPricingTierById(id!) : Promise.resolve(null)), [id])

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [priceUsd, setPriceUsd] = useState('')
  const [priceInr, setPriceInr] = useState('')
  const [billingPeriod, setBillingPeriod] = useState('monthly')
  const [features, setFeatures] = useState<string[]>([])
  const [isMostPopular, setIsMostPopular] = useState(false)
  const [displayOrder, setDisplayOrder] = useState(0)
  const [isPublished, setIsPublished] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!existing) return
    setName(existing.name)
    setSlug(existing.slug)
    setPriceUsd((existing.price_usd_cents / 100).toFixed(2))
    setPriceInr((existing.price_inr_paise / 100).toFixed(2))
    setBillingPeriod(existing.billing_period)
    setFeatures(existing.features)
    setIsMostPopular(existing.is_most_popular)
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
      await upsertPricingTier({
        id,
        slug,
        name,
        price_usd_cents: Math.round(Number(priceUsd) * 100),
        price_inr_paise: Math.round(Number(priceInr) * 100),
        billing_period: billingPeriod,
        features,
        is_most_popular: isMostPopular,
        display_order: displayOrder,
        is_published: isPublished,
      })
      navigate('/admin/content/pricing')
    } catch {
      setSubmitError('Failed to save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!id || !window.confirm('Delete this pricing tier? This cannot be undone.')) return
    try {
      await deletePricingTier(id)
      navigate('/admin/content/pricing')
    } catch {
      setSubmitError('Failed to delete. It may still be referenced by subscriptions.')
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Edit pricing tier' : 'New pricing tier'}>
      <button
        type="button"
        onClick={() => navigate('/admin/content/pricing')}
        className="font-mono-label mb-4 text-[11px] uppercase text-ink-soft transition-colors hover:text-teal"
      >
        ← Back to pricing tiers
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
            <label htmlFor="tier-name" className={labelClasses}>
              Name
            </label>
            <input id="tier-name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} />
          </div>

          <div>
            <label htmlFor="tier-slug" className={labelClasses}>
              Slug
            </label>
            <input
              id="tier-slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value)
              }}
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tier-usd" className={labelClasses}>
                Price (USD/mo)
              </label>
              <input
                id="tier-usd"
                type="number"
                min={0}
                step={0.01}
                required
                value={priceUsd}
                onChange={(e) => setPriceUsd(e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="tier-inr" className={labelClasses}>
                Price (INR/mo)
              </label>
              <input
                id="tier-inr"
                type="number"
                min={0}
                step={0.01}
                required
                value={priceInr}
                onChange={(e) => setPriceInr(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label htmlFor="tier-period" className={labelClasses}>
              Billing period
            </label>
            <input id="tier-period" value={billingPeriod} onChange={(e) => setBillingPeriod(e.target.value)} className={inputClasses} />
          </div>

          <StringListEditor label="Features" value={features} onChange={setFeatures} />

          <label className="font-mono-label flex items-center gap-2 text-[11px] uppercase text-ink-soft">
            <input type="checkbox" checked={isMostPopular} onChange={(e) => setIsMostPopular(e.target.checked)} className="accent-teal" />
            Most popular (highlighted on the pricing page)
          </label>

          <div>
            <label htmlFor="tier-order" className={labelClasses}>
              Display order
            </label>
            <input
              id="tier-order"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className={inputClasses}
            />
          </div>

          <label className="font-mono-label flex items-center gap-2 text-[11px] uppercase text-ink-soft">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="accent-teal" />
            Published (visible on the pricing page)
          </label>

          {submitError && (
            <p role="alert" className="text-sm text-terracotta">
              {submitError}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={submitting || !canWrite}>
              {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create tier'}
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

export default AdminPricingFormPage
