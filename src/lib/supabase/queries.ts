import { supabase } from './client'
import type { PortfolioItem, PricingTier, Service, Testimonial } from './types'

export async function fetchPublishedServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data as Service[]
}

export async function fetchServiceBySlug(slug: string): Promise<Service | null> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (error) throw error
  return data as Service | null
}

export async function fetchPublishedPortfolioItems(): Promise<PortfolioItem[]> {
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data as PortfolioItem[]
}

export async function fetchPublishedPricingTiers(): Promise<PricingTier[]> {
  const { data, error } = await supabase
    .from('pricing_tiers')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data as PricingTier[]
}

export async function fetchFeaturedTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data as Testimonial[]
}
