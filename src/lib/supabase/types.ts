export interface Service {
  id: string
  slug: string
  name: string
  short_description: string | null
  long_description: string | null
  niche_tags: string[]
  hero_image_url: string | null
  icon: string | null
  is_bookable: boolean
  default_duration_minutes: number | null
  display_order: number
  is_published: boolean
}

export interface PricingTier {
  id: string
  slug: string
  name: string
  price_usd_cents: number
  price_inr_paise: number
  billing_period: string
  features: string[]
  is_most_popular: boolean
  display_order: number
  is_published: boolean
}

export interface PortfolioItem {
  id: string
  slug: string
  title: string
  niche_tags: string[]
  summary: string | null
  outcome_metrics: { label: string; value: string }[]
  cover_image_url: string | null
  gallery_image_urls: string[]
  live_url: string | null
  display_order: number
  is_published: boolean
}

export interface Testimonial {
  id: string
  client_name: string
  practice_name: string | null
  quote: string
  rating: number | null
  photo_url: string | null
  is_featured: boolean
  display_order: number
  is_published: boolean
}

export type LeadFormType = 'contact' | 'inquiry' | 'quote' | 'booking'

export interface LeadFormPayload {
  full_name: string
  phone: string
  email?: string
  entry_service_id?: string
  form_type: LeadFormType
  source: string
  message?: string
  is_test?: boolean
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'won' | 'lost'

export const LEAD_STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost']

export interface Lead {
  id: string
  client_id: string | null
  full_name: string
  email: string | null
  phone: string
  entry_service_id: string | null
  form_type: LeadFormType | null
  source: string | null
  status: LeadStatus
  message: string | null
  assigned_to: string | null
  is_test: boolean
  created_at: string
  updated_at: string
  // Joined, not a real column — present when fetched via fetchLeads()/fetchLeadById().
  entry_service?: { name: string } | null
  assignee?: { full_name: string | null } | null
  // Attached client-side (not a Supabase embed — subscriptions.client_id has
  // no FK from leads, only a shared value) by fetchLeads()/fetchLeadById()
  // for leads whose client_id has an active/past subscription record.
  subscription?: Subscription | null
}

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'upgraded' | 'downgraded'

export const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  'trialing',
  'active',
  'past_due',
  'canceled',
  'upgraded',
  'downgraded',
]

export interface Subscription {
  id: string
  client_id: string | null
  lead_id: string | null
  tier_id: string
  gateway: 'razorpay' | 'stripe'
  currency: 'INR' | 'USD'
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  canceled_at: string | null
  is_test: boolean
  created_at: string
  updated_at: string
  // Joined, not a real column — present when fetched via fetchActiveSubscriptionsByClientIds().
  tier?: { name: string } | null
}

export type MessageContext = 'ticket' | 'chat' | 'lead_note'
export type MessageVisibility = 'internal' | 'customer'

export interface LeadMessage {
  id: string
  context_type: MessageContext
  lead_id: string | null
  ticket_id: string | null
  visibility: MessageVisibility
  author_id: string | null
  author_name: string | null
  body: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface StaffProfile {
  id: string
  full_name: string | null
  role: string
}

export type BookingStatus = 'pending' | 'confirmed' | 'rescheduled' | 'canceled' | 'completed' | 'no_show'

export const BOOKING_STATUSES: BookingStatus[] = [
  'pending',
  'confirmed',
  'rescheduled',
  'canceled',
  'completed',
  'no_show',
]

export interface Booking {
  id: string
  lead_id: string | null
  client_id: string | null
  service_id: string
  practitioner_id: string | null
  starts_at: string
  ends_at: string
  status: BookingStatus
  client_full_name: string
  client_email: string | null
  client_phone: string
  notes: string | null
  project_status: string
  is_test: boolean
  created_at: string
  updated_at: string
  // Joined, not a real column — present when fetched via fetchBookings()/fetchBookingById().
  service?: { name: string; default_duration_minutes: number | null } | null
  practitioner?: { full_name: string | null } | null
}

export interface AvailabilityRule {
  id: string
  service_id: string | null
  practitioner_id: string | null
  day_of_week: number
  start_time: string
  end_time: string
  buffer_minutes: number
  is_active: boolean
  created_at: string
  service?: { name: string } | null
}

export interface BlackoutDate {
  id: string
  practitioner_id: string | null
  date: string
  reason: string | null
  created_at: string
}

export type SettingKey =
  | 'company'
  | 'smtp'
  | 'ai_provider'
  | 'payment_gateway_map'
  | 'seo_defaults'
  | 'sms'
  | 'integration'

export interface CompanySettings {
  name: string
  logo_url: string
  email: string
  phone: string
  business_hours: string
  timezone: string
  // General sub-tab additions (migration 0018)
  logo_path: string
  favicon_path: string
  show_logo_on_signin: boolean
  accepted_file_formats: string
  rows_per_page: number
  rich_text_editor_enabled: boolean
  copyright_text: string
  // Localization sub-tab additions (migration 0022)
  date_format: string
  time_format: '12 am' | '24 hours'
  first_day_of_week: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'
  currency_position: 'left' | 'right'
}

export interface SmtpSettings {
  host: string
  port: number
  from_address: string
  from_name: string
  // Extended fields (migration 0018)
  protocol: string
  from_email: string
  user: string
  password: string
  security_type: 'tls' | 'ssl' | 'none'
  test_send_to: string
}

export interface SmsSettings {
  account_id: string
  api_key: string
  secret_key: string
  test_send_to: string
}

export interface IntegrationSettings {
  recaptcha: { site_key: string; secret_key: string }
  google_drive: { enabled: boolean; client_id: string; client_secret: string }
  github: { enabled: boolean; webhook_token: string }
}

export interface IntegrationToken {
  id: string
  provider: string
  expires_at: string | null
  updated_at: string
}

export interface AiProviderSettings {
  active: 'gemini' | 'openai' | 'claude'
  fallback: 'gemini' | 'openai' | 'claude' | null
  tone_prompt: string
  // Optional DB-stored API keys for the Website Prompt Generator's edge
  // function, which has no way to read this project's env vars from the
  // admin UI. Same secrets-in-DB tradeoff as SMTP/SMS/Google Drive
  // (SECRETS_WARNING) — a server-side GEMINI_API_KEY/OPENAI_API_KEY/
  // ANTHROPIC_API_KEY env var still takes precedence if set.
  gemini_api_key?: string
  openai_api_key?: string
  anthropic_api_key?: string
}

export interface PaymentGatewayMapSettings {
  INR: string
  USD: string
}

export interface SeoDefaultsSettings {
  default_title: string
  default_description: string
  sitemap_enabled: boolean
}

export interface Setting<T = Record<string, unknown>> {
  key: SettingKey
  value: T
  description: string | null
  updated_at: string
  updated_by: string | null
}

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'

export const TICKET_STATUSES: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed']
export const TICKET_PRIORITIES: TicketPriority[] = ['low', 'normal', 'high', 'urgent']

export interface Ticket {
  id: string
  client_id: string | null
  lead_id: string | null
  subject: string
  status: TicketStatus
  priority: TicketPriority
  assigned_to: string | null
  is_test: boolean
  created_at: string
  updated_at: string
  // Joined, not a real column — present when fetched via the admin queries.
  client?: { full_name: string | null; phone: string | null } | null
  assignee?: { full_name: string | null } | null
}

export type EmailTriggerKey =
  | 'new_lead_welcome'
  | 'booking_confirmed'
  | 'booking_reminder_24h'
  | 'lead_followup_nudge'
  | 'ticket_resolved_checkin'
  | 'project_completed_whatsapp_intro'

export interface EmailTemplate {
  id: string
  trigger_key: EmailTriggerKey
  subject: string
  body_html: string
  merge_fields: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export type EmailTriggerStatus = 'sent' | 'failed'

export interface EmailTriggerLogEntry {
  id: string
  trigger_key: string
  lead_id: string | null
  booking_id: string | null
  ticket_id: string | null
  recipient_email: string
  status: EmailTriggerStatus
  error_message: string | null
  sent_at: string
}

export type NotificationType = 'new_lead' | 'new_booking' | 'new_ticket' | 'new_ticket_reply'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  lead_id: string | null
  booking_id: string | null
  ticket_id: string | null
  is_test: boolean
  created_at: string
  // Derived client-side from notification_reads, not a real column.
  is_read?: boolean
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body: string
  cover_image_url: string | null
  seo_title: string | null
  seo_description: string | null
  author_id: string | null
  published_at: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}
