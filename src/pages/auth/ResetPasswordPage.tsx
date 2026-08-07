import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import AuthShell from '../../components/ui/AuthShell'
import { Button } from '../../components/ui/Button'
import { inputClasses, labelClasses } from '../../components/ui/Input'

function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email.')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <AuthShell eyebrow="Account" title="Check your email">
        <p className="text-center text-sm text-ink-soft">
          If an account exists for {email}, a password reset link has been sent.
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell eyebrow="Account" title="Reset password">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p role="alert" className="text-sm text-terracotta">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="email" className={labelClasses}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
          />
        </div>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
    </AuthShell>
  )
}

export default ResetPasswordPage
