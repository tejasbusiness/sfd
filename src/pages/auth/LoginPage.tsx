import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AuthShell from '../../components/ui/AuthShell'
import { Button } from '../../components/ui/Button'
import { inputClasses, labelClasses } from '../../components/ui/Input'

function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell eyebrow="Account" title="Sign in">
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

        <div>
          <label htmlFor="password" className={labelClasses}>
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
          />
        </div>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>

        <p className="text-center text-sm text-ink-soft">
          <Link to="/auth/reset-password" className="text-teal underline">
            Forgot password?
          </Link>
        </p>
        <p className="text-center text-sm text-ink-soft">
          No account?{' '}
          <Link to="/auth/signup" className="text-teal underline">
            Sign up
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}

export default LoginPage
