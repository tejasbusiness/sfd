import { useState, type FormEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { submitLead, RateLimitError, SpamDetectedError } from '../../lib/forms/submitLead'
import type { LeadFormType } from '../../lib/supabase/types'
import { Button } from '../ui/Button'
import { inputClasses, labelClasses, clinicalInputClasses, clinicalLabelClasses } from '../ui/Input'
import MobileNumberField, { type MobileNumberValue } from '../ui/MobileNumberField'

const MESSAGE_MAX_LENGTH = 1000

export interface LeadFormConfig {
  formType: LeadFormType
  title: string
  description?: string
  messageLabel: string
  messagePlaceholder?: string
  messageRequired?: boolean
  submitLabel: string
}

interface LeadFormProps {
  config: LeadFormConfig
  source: string
  entryServiceId?: string
  variant?: 'editorial' | 'clinical'
}

/**
 * Single config-driven component for contact/inquiry/quote forms (docs/04) —
 * variants differ only by the config object passed in, not by separate
 * components per form type.
 */
function LeadForm({ config, source, entryServiceId, variant = 'editorial' }: LeadFormProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState<MobileNumberValue>({ countryCode: '+91', digits: '' })
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isClinical = variant === 'clinical'
  const fieldClasses = isClinical ? clinicalInputClasses : inputClasses
  const fieldLabelClasses = isClinical ? clinicalLabelClasses : labelClasses
  const prefersReducedMotion = useReducedMotion()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (mobile.digits.length !== 10) {
      setErrorMessage('Enter a 10-digit mobile number.')
      setStatus('error')
      return
    }

    setStatus('submitting')
    setErrorMessage(null)

    try {
      await submitLead(
        {
          full_name: fullName,
          phone: `${mobile.countryCode}${mobile.digits}`,
          email: email || undefined,
          entry_service_id: entryServiceId,
          form_type: config.formType,
          source,
          message: message || undefined,
        },
        { honeypot },
      )
      setStatus('success')
    } catch (err) {
      if (err instanceof SpamDetectedError) {
        // Fake success so bots don't learn the honeypot rejected them.
        setStatus('success')
        return
      }
      if (err instanceof RateLimitError) {
        setErrorMessage(err.message)
        setStatus('error')
        return
      }
      setErrorMessage('Something went wrong submitting your request. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    if (isClinical) {
      return (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10, scale: prefersReducedMotion ? 1 : 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-studio-ink/30 bg-studio-bg-card-soft p-7 text-center"
        >
          <p className="font-sans text-xl font-bold text-studio-ink">Thanks — we've received your request.</p>
          <p className="mt-1 text-sm text-studio-ink-soft">We'll be in touch shortly.</p>
        </motion.div>
      )
    }
    return (
      <div role="status" className="rounded-2xl border border-teal/30 bg-sage p-7 text-center">
        <p className="font-display text-xl text-ink">Thanks — we've received your request.</p>
        <p className="mt-1 text-sm text-ink-soft">We'll be in touch shortly.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className={isClinical ? 'font-sans text-xl font-bold text-studio-ink' : 'font-display text-xl text-ink'}>
          {config.title}
        </h2>
        {config.description && (
          <p className={`mt-1 text-sm ${isClinical ? 'text-studio-ink-soft' : 'text-ink-soft'}`}>
            {config.description}
          </p>
        )}
      </div>

      {errorMessage && (
        <p role="alert" className={`text-sm ${isClinical ? 'text-studio-ink' : 'text-terracotta'}`}>
          {errorMessage}
        </p>
      )}

      {/* Honeypot: hidden from real users via CSS + tabIndex, bots that
          auto-fill every field will populate this and get silently rejected. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="company-website">Company Website</label>
        <input
          id="company-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="fullName" className={fieldLabelClasses}>
          Name
        </label>
        <input
          id="fullName"
          type="text"
          required
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={fieldClasses}
        />
      </div>

      <MobileNumberField required value={mobile} onChange={setMobile} variant={variant} />

      <div>
        <label htmlFor="email" className={fieldLabelClasses}>
          Email (optional)
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClasses}
        />
      </div>

      <div>
        <label htmlFor="message" className={fieldLabelClasses}>
          {config.messageLabel}
        </label>
        <textarea
          id="message"
          required={config.messageRequired}
          placeholder={config.messagePlaceholder}
          maxLength={MESSAGE_MAX_LENGTH}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className={fieldClasses}
        />
        {config.messageRequired && (
          <p
            className={`font-mono-label mt-1 text-right text-[10px] uppercase ${isClinical ? 'text-studio-ink-soft' : 'text-ink-soft'}`}
          >
            {message.length}/{MESSAGE_MAX_LENGTH}
          </p>
        )}
      </div>

      <Button type="submit" variant={isClinical ? 'clinical' : 'primary'} disabled={status === 'submitting'} className="w-full">
        {status === 'submitting' ? 'Sending…' : config.submitLabel}
      </Button>
    </form>
  )
}

export default LeadForm
