import { useEffect, useState } from 'react'

interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
