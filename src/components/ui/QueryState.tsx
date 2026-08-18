interface QueryStateProps {
  loading: boolean
  error: Error | null
  empty?: boolean
  emptyMessage?: string
  variant?: 'editorial' | 'clinical' | 'supahub'
}

function QueryState({
  loading,
  error,
  empty = false,
  emptyMessage = 'Nothing to show yet.',
  variant = 'editorial',
}: QueryStateProps) {
  const isClinical = variant === 'clinical'
  const isSupahub = variant === 'supahub'
  const mutedClass = isSupahub ? 'text-supahub-slate' : isClinical ? 'text-studio-ink-soft' : 'text-ink-soft'
  const errorClass = isSupahub ? 'text-supahub-ink' : isClinical ? 'text-studio-ink' : 'text-terracotta'

  if (loading) {
    return (
      <div role="status" className={`font-mono-label py-16 text-center text-xs uppercase ${mutedClass}`}>
        Loading…
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className={`py-16 text-center text-sm ${errorClass}`}>
        Something went wrong loading this content. Please try again shortly.
      </div>
    )
  }

  if (empty) {
    return <div className={`py-16 text-center text-sm ${mutedClass}`}>{emptyMessage}</div>
  }

  return null
}

export default QueryState
