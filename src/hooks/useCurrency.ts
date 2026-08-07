import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase/client'
import type { Currency } from '../lib/payments'

const STORAGE_KEY = 'sfd_currency_override'

/**
 * Geo-detected currency default (docs/05: India -> INR, else USD) via the
 * detect-currency edge function, with a manual override the visitor can set
 * that persists across visits (localStorage) and always wins over
 * geolocation once set.
 */
export function useCurrency(): [Currency, (currency: Currency) => void, boolean] {
  const [currency, setCurrencyState] = useState<Currency>('USD')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'INR' || stored === 'USD') {
      setCurrencyState(stored)
      setLoading(false)
      return
    }

    supabase.functions
      .invoke<{ currency: Currency }>('detect-currency', { method: 'GET' })
      .then(({ data }) => {
        if (data?.currency) setCurrencyState(data.currency)
      })
      .catch(() => {
        // Fail soft to the USD default already set — a broken geolocation
        // call should never block the pricing page from rendering.
      })
      .finally(() => setLoading(false))
  }, [])

  function setCurrency(next: Currency) {
    localStorage.setItem(STORAGE_KEY, next)
    setCurrencyState(next)
  }

  return [currency, setCurrency, loading]
}
