import type { Currency } from '../payments'

export function formatPrice(tier: { price_usd_cents: number; price_inr_paise: number }, currency: Currency): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      tier.price_inr_paise / 100,
    )
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    tier.price_usd_cents / 100,
  )
}
