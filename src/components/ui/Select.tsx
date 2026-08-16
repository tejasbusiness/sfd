import { useEffect, useRef, useState } from 'react'
import { labelClasses, clinicalLabelClasses } from './Input'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  id: string
  label?: string
  /** For label-less usages (e.g. inline filters) — sets aria-label on the trigger button. */
  ariaLabel?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  disabled?: boolean
  placeholder?: string
  /** 'field' (default) is a full-width labeled form field; 'compact' is a smaller inline filter control. */
  size?: 'field' | 'compact'
  className?: string
  /** Shows a search box above the option list — for long lists (e.g. timezones). */
  searchable?: boolean
  /** 'editorial' (default) preserves current behavior for every existing consumer (incl. admin pages). 'clinical' opts into the public-site "Studio Neutral" restyle. */
  variant?: 'editorial' | 'clinical'
}

/**
 * Custom-styled dropdown replacing the browser's native <select> (whose
 * open option list can't be restyled cross-browser to match this project's
 * design system). Built from scratch — no headless UI library in the repo.
 */
export function Select({
  id,
  label,
  ariaLabel,
  value,
  onChange,
  options,
  disabled,
  placeholder,
  size = 'field',
  className = '',
  searchable = false,
  variant = 'editorial',
}: SelectProps) {
  const isClinical = variant === 'clinical'
  const [open, setOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const filteredOptions = searchable && query.trim() ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase())) : options

  const selectedIndex = options.findIndex((o) => o.value === value)
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    if (open) {
      setQuery('')
      const idx = options.findIndex((o) => o.value === value)
      setHighlightedIndex(idx >= 0 ? idx : 0)
      if (searchable) searchRef.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    setHighlightedIndex(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    const el = listRef.current?.children[highlightedIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [open, highlightedIndex])

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
    }
  }

  function handleListKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.min(i + 1, filteredOptions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const opt = filteredOptions[highlightedIndex]
      if (opt) {
        onChange(opt.value)
        setOpen(false)
      }
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  const triggerClasses = isClinical
    ? size === 'compact'
      ? 'rounded-lg border border-studio-line bg-white px-3 py-2 text-sm text-studio-ink'
      : 'mt-1.5 w-full rounded-lg border border-studio-line bg-white px-3.5 py-2.5 text-studio-ink'
    : size === 'compact'
      ? 'rounded-lg border border-ink/15 bg-cream px-3 py-2 text-sm text-ink'
      : 'mt-1.5 w-full rounded-lg border border-ink/15 bg-cream px-3.5 py-2.5 text-ink'

  const focusRing = isClinical
    ? 'focus:border-studio-ink focus:outline-none focus:ring-1 focus:ring-studio-ink'
    : 'focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal'
  const openRing = isClinical ? 'border-studio-ink ring-1 ring-studio-ink' : 'border-teal ring-1 ring-teal'

  return (
    <div ref={rootRef} className={`relative ${size === 'field' ? '' : 'inline-block'} ${className}`}>
      {label && (
        <label htmlFor={id} className={isClinical ? clinicalLabelClasses : labelClasses}>
          {label}
        </label>
      )}
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleTriggerKeyDown}
        className={`${triggerClasses} flex w-full items-center justify-between gap-2 text-left transition-colors ${focusRing} disabled:opacity-50 ${
          open ? openRing : ''
        }`}
      >
        <span className={selected ? '' : isClinical ? 'text-studio-ink-soft/50' : 'text-ink-soft/50'}>
          {selected ? selected.label : (placeholder ?? 'Select…')}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`shrink-0 transition-transform ${isClinical ? 'text-studio-ink-soft' : 'text-ink-soft'} ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute z-20 mt-1.5 w-full min-w-max overflow-hidden rounded-lg border shadow-lg ${
            isClinical ? 'border-studio-line bg-white' : 'border-ink/15 bg-cream'
          }`}
        >
          {searchable && (
            <div className={`relative border-b p-2 ${isClinical ? 'border-studio-line' : 'border-ink/10'}`}>
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleListKeyDown}
                placeholder="Search…"
                className={`w-full rounded-md py-1.5 pl-3 pr-8 text-sm transition-colors ${focusRing} ${
                  isClinical
                    ? 'border border-studio-line bg-white text-studio-ink'
                    : 'border border-ink/15 bg-cream text-ink'
                }`}
              />
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 ${isClinical ? 'text-studio-ink-soft/60' : 'text-ink-soft/60'}`}
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          )}
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={searchable ? -1 : 0}
            onKeyDown={searchable ? undefined : handleListKeyDown}
            className="max-h-60 overflow-auto py-1 focus:outline-none"
          >
            {filteredOptions.length === 0 && (
              <li className={`px-3.5 py-2 text-sm ${isClinical ? 'text-studio-ink-soft' : 'text-ink-soft'}`}>
                No matches
              </li>
            )}
            {filteredOptions.map((o, i) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                onMouseEnter={() => setHighlightedIndex(i)}
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                }}
                className={`cursor-pointer px-3.5 py-2 text-sm transition-colors ${
                  isClinical
                    ? o.value === value
                      ? 'bg-studio-ink text-white'
                      : i === highlightedIndex
                        ? 'bg-studio-bg-card-soft text-studio-ink'
                        : 'text-studio-ink'
                    : o.value === value
                      ? 'bg-ink text-cream'
                      : i === highlightedIndex
                        ? 'bg-sage text-ink'
                        : 'text-ink'
                }`}
              >
                {o.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

interface YesNoSelectProps {
  id: string
  label: string
  value: boolean
  onChange: (value: boolean) => void
}

export function YesNoSelect({ id, label, value, onChange }: YesNoSelectProps) {
  return (
    <Select
      id={id}
      label={label}
      value={value ? 'yes' : 'no'}
      onChange={(v) => onChange(v === 'yes')}
      options={[
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ]}
    />
  )
}
