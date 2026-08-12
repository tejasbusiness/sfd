import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Top-level render-error guard. Without this, any uncaught error while
 * rendering (a bad prop, a null-access, an unsupported browser API) unmounts
 * the whole React tree with zero visible feedback — the page just goes
 * blank, no error banner, nothing in the UI to diagnose from. Wraps the
 * entire app in main.tsx so every route benefits, not just admin pages.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-cream px-4">
          <div className="max-w-md rounded-xl border border-terracotta/30 bg-cream p-6 text-center">
            <p className="font-mono-label text-[11px] uppercase text-terracotta">Something went wrong</p>
            <p className="mt-2 text-sm text-ink-soft">
              This page hit an unexpected error. Try reloading — if it keeps happening, let us know what you were
              doing when it occurred.
            </p>
            <p className="mt-3 break-words rounded-lg bg-sage/40 p-2 font-mono text-xs text-ink-soft">
              {this.state.error.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="font-mono-label mt-4 rounded-full bg-ink px-4 py-2 text-[11px] uppercase text-cream transition-colors hover:bg-teal-dark"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
