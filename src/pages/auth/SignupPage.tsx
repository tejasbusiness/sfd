import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthShell from '../../components/ui/AuthShell'
import { Button } from '../../components/ui/Button'
import { inputClasses, labelClasses } from '../../components/ui/Input'

function SignupPage() {
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signUp(email, password, fullName)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <AuthShell eyebrow="Account" title="Check your email">
        <p className="text-center text-sm text-ink-soft">
          Verify your account before signing in.
        </p>
      </AuthShell>
    )
  }

  return (
    <AuthShell eyebrow="Account" title="Create account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p role="alert" className="text-sm text-terracotta">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="fullName" className={labelClasses}>
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClasses}
          />
        </div>

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

        <div>
          <label htmlFor="password" className={labelClasses}>
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
          />
        </div>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="text-center text-sm text-ink-soft">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-teal underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}

export default SignupPage
