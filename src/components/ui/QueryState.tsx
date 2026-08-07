interface QueryStateProps {
  loading: boolean
  error: Error | null
  empty?: boolean
  emptyMessage?: string
}

function QueryState({
  loading,
  error,
  empty = false,
  emptyMessage = 'Nothing to show yet.',
}: QueryStateProps) {
  if (loading) {
    return (
      <div role="status" className="font-mono-label py-16 text-center text-xs uppercase text-ink-soft">
        Loading…
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className="py-16 text-center text-sm text-terracotta">
        Something went wrong loading this content. Please try again shortly.
      </div>
    )
  }

  if (empty) {
    return <div className="py-16 text-center text-sm text-ink-soft">{emptyMessage}</div>
  }

  return null
}

export default QueryState
