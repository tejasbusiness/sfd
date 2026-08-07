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

export type LeadFormType = 'contact' | 'inquiry' | 'quote'

export interface LeadFormPayload {
  full_name: string
  email: string
  phone?: string
  entry_service_id?: string
  form_type: LeadFormType
  source: string
  message?: string
  is_test?: boolean
}
