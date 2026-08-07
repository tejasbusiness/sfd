import { supabase } from './client'
import type { BlogPost, PortfolioItem, PricingTier, Service, Testimonial } from './types'

/**
 * Staff-facing CMS reads/writes for services, pricing tiers, portfolio
 * items, testimonials, and blog posts. Reads are is_staff()-gated (any
 * staff role can see unpublished drafts); writes are is_admin()-only per
 * migrations 0002/0015 — the UI must not assume every signed-in staff
 * member can save, since staff_sales/staff_support pass RequireStaffRole
 * but are rejected by these tables' write RLS.
 */

// ---- services ----------------------------------------------------------------

export async function fetchAllServices(): Promise<Service[]> {
  const { data, error } = await supabase.from('services').select('*').order('display_order', { ascending: true })
  if (error) throw error
  return data as Service[]
}

export async function fetchServiceById(id: string): Promise<Service> {
  const { data, error } = await supabase.from('services').select('*').eq('id', id).single()
  if (error) throw error
  return data as Service
}

export async function upsertService(service: Partial<Service> & { slug: string; name: string }): Promise<void> {
  const { error } = await supabase.from('services').upsert(service)
  if (error) throw error
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) throw error
}

// ---- pricing tiers -------------------------------------------------------------

export async function fetchAllPricingTiers(): Promise<PricingTier[]> {
  const { data, error } = await supabase.from('pricing_tiers').select('*').order('display_order', { ascending: true })
  if (error) throw error
  return data as PricingTier[]
}

export async function fetchPricingTierById(id: string): Promise<PricingTier> {
  const { data, error } = await supabase.from('pricing_tiers').select('*').eq('id', id).single()
  if (error) throw error
  return data as PricingTier
}

export async function upsertPricingTier(
  tier: Partial<PricingTier> & { slug: string; name: string; price_usd_cents: number; price_inr_paise: number },
): Promise<void> {
  const { error } = await supabase.from('pricing_tiers').upsert(tier)
  if (error) throw error
}

export async function deletePricingTier(id: string): Promise<void> {
  const { error } = await supabase.from('pricing_tiers').delete().eq('id', id)
  if (error) throw error
}

// ---- portfolio items -------------------------------------------------------------

export async function fetchAllPortfolioItems(): Promise<PortfolioItem[]> {
  const { data, error } = await supabase.from('portfolio_items').select('*').order('display_order', { ascending: true })
  if (error) throw error
  return data as PortfolioItem[]
}

export async function fetchPortfolioItemById(id: string): Promise<PortfolioItem> {
  const { data, error } = await supabase.from('portfolio_items').select('*').eq('id', id).single()
  if (error) throw error
  return data as PortfolioItem
}

export async function upsertPortfolioItem(item: Partial<PortfolioItem> & { slug: string; title: string }): Promise<void> {
  const { error } = await supabase.from('portfolio_items').upsert(item)
  if (error) throw error
}

export async function deletePortfolioItem(id: string): Promise<void> {
  const { error } = await supabase.from('portfolio_items').delete().eq('id', id)
  if (error) throw error
}

// ---- testimonials -------------------------------------------------------------

export async function fetchAllTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase.from('testimonials').select('*').order('display_order', { ascending: true })
  if (error) throw error
  return data as Testimonial[]
}

export async function fetchTestimonialById(id: string): Promise<Testimonial> {
  const { data, error } = await supabase.from('testimonials').select('*').eq('id', id).single()
  if (error) throw error
  return data as Testimonial
}

export async function upsertTestimonial(t: Partial<Testimonial> & { client_name: string; quote: string }): Promise<void> {
  const { error } = await supabase.from('testimonials').upsert(t)
  if (error) throw error
}

export async function deleteTestimonial(id: string): Promise<void> {
  const { error } = await supabase.from('testimonials').delete().eq('id', id)
  if (error) throw error
}

// ---- blog posts -------------------------------------------------------------

export async function fetchAllBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as BlogPost[]
}

export async function fetchBlogPostById(id: string): Promise<BlogPost> {
  const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).single()
  if (error) throw error
  return data as BlogPost
}

export async function upsertBlogPost(post: Partial<BlogPost> & { slug: string; title: string }): Promise<void> {
  const { error } = await supabase.from('blog_posts').upsert(post)
  if (error) throw error
}

export async function deleteBlogPost(id: string): Promise<void> {
  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  if (error) throw error
}
