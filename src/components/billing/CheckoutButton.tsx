import { useState, type FormEvent } from 'react'
import { processPayment, PaymentError, type Currency } from '../../lib/payments'
import { Button } from '../ui/Button'
import { inputClasses, labelClasses } from '../ui/Input'

interface CheckoutButtonProps {
  tierId: string
  tierName: string
  currency: Currency
}

/**
 * Expands inline into a one-field email capture rather than navigating to a
 * separate checkout page — per docs/05, these tiers are deliberately
 * low-friction "start small" entry points, not a considered enterprise
 * purchase, so the email-to-redirect path should be as short as possible.
 */
function CheckoutButton({ tierId, tierName, currency }: CheckoutButtonProps) {
  const [expanded, setExpanded] = useState(false)
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      <Button onClick={() => setExpanded(true)} className="mt-7 w-full">
        Get Started
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-3">
      <label htmlFor={`checkout-email-${tierId}`} className={labelClasses}>
        Email to continue with {tierName}
      </label>
      <input
        id={`checkout-email-${tierId}`}
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClasses}
      />
      {error && (
        <p role="alert" className="text-sm text-terracotta">
          {error}
        </p>
      )}
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Starting checkout…' : 'Continue to Payment'}
      </Button>
    </form>
  )
}

export default CheckoutButton
