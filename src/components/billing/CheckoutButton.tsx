import { useState, type FormEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { processPayment, PaymentError, type Currency } from '../../lib/payments'
import { Button } from '../ui/Button'
import { inputClasses, labelClasses, clinicalInputClasses, clinicalLabelClasses } from '../ui/Input'

interface CheckoutButtonProps {
  tierId: string
  tierName: string
  currency: Currency
  variant?: 'editorial' | 'clinical'
}

/**
 * Expands inline into a one-field email capture rather than navigating to a
 * separate checkout page — per docs/05, these tiers are deliberately
 * low-friction "start small" entry points, not a considered enterprise
 * purchase, so the email-to-redirect path should be as short as possible.
 */
function CheckoutButton({ tierId, tierName, currency, variant = 'editorial' }: CheckoutButtonProps) {
  const [expanded, setExpanded] = useState(false)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isClinical = variant === 'clinical'
  const fieldClasses = isClinical ? clinicalInputClasses : inputClasses
  const fieldLabelClasses = isClinical ? clinicalLabelClasses : labelClasses
  const prefersReducedMotion = useReducedMotion()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const { checkoutUrl } = await processPayment({ currency, tierId, clientEmail: email })
      window.location.href = checkoutUrl
    } catch (err) {
      setError(
        err instanceof PaymentError
          ? err.message
          : 'Something went wrong starting checkout. Please try again.',
      )
      setSubmitting(false)
    }
  }

  if (!expanded) {
    return (
      <Button onClick={() => setExpanded(true)} variant={isClinical ? 'clinical' : 'primary'} className="mt-7 w-full">
        Get Started
      </Button>
    )
  }

  const formContent = (
    <>
      <label htmlFor={`checkout-email-${tierId}`} className={fieldLabelClasses}>
        Email to continue with {tierName}
      </label>
      <input
        id={`checkout-email-${tierId}`}
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={fieldClasses}
      />
      {error && (
        <p role="alert" className={`text-sm ${isClinical ? 'text-studio-ink' : 'text-terracotta'}`}>
          {error}
        </p>
      )}
      <Button type="submit" variant={isClinical ? 'clinical' : 'primary'} disabled={submitting} className="w-full">
        {submitting ? 'Starting checkout…' : 'Continue to Payment'}
      </Button>
    </>
  )

  if (isClinical) {
    return (
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0.01 : 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="mt-7 space-y-3"
      >
        {formContent}
      </motion.form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-3">
      {formContent}
    </form>
  )
}

export default CheckoutButton
