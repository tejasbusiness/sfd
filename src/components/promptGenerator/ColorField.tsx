import { useState, useEffect } from 'react'
import { clinicalLabelClasses } from '../ui/Input'
import { isValidHex, normalizeHex } from '../../lib/color/hsl'

interface ColorFieldProps {
  id: string
  label: string
  value: string
  onChange: (hex: string) => void
  warning?: string
}

function ColorField({ id, label, value, onChange, warning }: ColorFieldProps) {
  const [draft, setDraft] = useState(value)

  // Keep the text input in sync when the value changes from outside (e.g.
  // Primary-driven regeneration), without clobbering active typing.
  useEffect(() => {
    setDraft(value)
  }, [value])

  const draftIsInvalid = draft !== '' && !isValidHex(draft)

  function commitIfValid(next: string) {
    if (isValidHex(next)) {
      onChange(normalizeHex(next))
    }
  }

  return (
    <div>
      <label htmlFor={id} className={clinicalLabelClasses}>
        {label}
      </label>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={isValidHex(draft) ? normalizeHex(draft) : value}
          onChange={(e) => {
            setDraft(e.target.value)
            onChange(normalizeHex(e.target.value))
          }}
          className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-studio-line bg-white p-0.5"
        />
        <input
          id={id}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commitIfValid(e.target.value)}
          placeholder="#1E4D3A"
          maxLength={7}
          className={`w-full rounded-lg border px-3.5 py-2.5 font-mono text-sm text-studio-ink placeholder:text-studio-ink-soft/50 focus:outline-none focus:ring-1 focus:ring-studio-ink ${
            draftIsInvalid ? 'border-studio-ink focus:border-studio-ink' : 'border-studio-line bg-white focus:border-studio-ink'
          }`}
        />
      </div>
      {draftIsInvalid && <p className="mt-1 text-xs text-studio-ink">Enter a valid 6-digit hex color.</p>}
      {!draftIsInvalid && warning && <p className="mt-1 text-xs text-studio-ink">{warning}</p>}
    </div>
  )
}

export default ColorField
