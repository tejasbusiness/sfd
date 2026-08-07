import { supabase } from '../supabase/client'
import type { LeadFormPayload } from '../supabase/types'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_SUBMISSIONS = 3
const RATE_LIMIT_STORAGE_KEY = 'sfd_lead_submissions'

export class RateLimitError extends Error {
  constructor() {
    super('Too many submissions. Please wait a moment before trying again.')
    this.name = 'RateLimitError'
  }
}

export class SpamDetectedError extends Error {
  constructor() {
    super('Submission rejected.')
    this.name = 'SpamDetectedError'
  }
}

/**
 * Client-side rate limiting via localStorage timestamps. This is a
 * best-effort deterrent, not a security boundary — a determined bot bypasses
 * localStorage entirely. It exists to stop accidental double-submits and
 * unsophisticated scripted abuse without adding CAPTCHA friction for real
 * visitors, per docs/04's "avoid CAPTCHAs unless abuse is detected" rule.
 * Escalation threshold: 3 submissions within 60s triggers a client-side
 * block; a server-side edge function doing real IP-based rate limiting is
 * the follow-up hardening step once abuse is actually observed in
 * production, not before.
 */
function checkClientRateLimit(): void {
  const now = Date.now()
  const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY)
  const timestamps: number[] = raw ? JSON.parse(raw) : []
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)

  if (recent.length >= RATE_LIMIT_MAX_SUBMISSIONS) {
    throw new RateLimitError()
  }

  recent.push(now)
  localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(recent))
}

export interface SubmitLeadOptions {
  honeypot: string
}

/**
 * Single entry point for all lead-capturing forms (contact/inquiry/quote).
 * honeypot must be the value of a hidden field real users never fill in —
 * any non-empty value is treated as a bot and silently rejected without
 * revealing the detection to the caller (SpamDetectedError should be
 * swallowed by the UI as a fake-success, not surfaced as an error, so bots
 * don't learn to leave the field empty).
 *
 * Per the RLS design (supabase/migrations/0004_leads.sql), this insert must
 * NOT request the row back — anon has INSERT but no SELECT grant on leads.
 */
export async function submitLead(
  payload: LeadFormPayload,
  { honeypot }: SubmitLeadOptions,
): Promise<void> {
  if (honeypot) {
    throw new SpamDetectedError()
  }

  checkClientRateLimit()

  const { error } = await supabase.from('leads').insert(payload)
  if (error) throw error
}
