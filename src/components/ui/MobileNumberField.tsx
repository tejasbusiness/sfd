import { useState } from 'react'
import { inputClasses, labelClasses } from './Input'
import { Select } from './Select'

const COUNTRY_CODES = [
  { code: '+91', label: 'IN +91' },
  { code: '+1', label: 'US +1' },
  { code: '+44', label: 'UK +44' },
  { code: '+61', label: 'AU +61' },
  { code: '+971', label: 'AE +971' },
]

export interface MobileNumberValue {
  countryCode: string
  digits: string
}

interface MobileNumberFieldProps {
  value: MobileNumberValue
  onChange: (value: MobileNumberValue) => void
  id?: string
  required?: boolean
}

/** "9123456789" -> "91234-56789" */
function formatForDisplay(digits: string): string {
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

/**
 * Digits-only 10-digit mobile number with a country code selector. Shows the
 * raw digit sequence while focused (easiest to edit) and a grouped
 * "91234-56789" format once the field blurs, per the requested UX. The
 * combined value the parent stores/submits is `${countryCode}${digits}`
 * (e.g. "+919123456789") — a single string, compatible with the existing
 * phone/client_phone text columns.
 */
function MobileNumberField({ value, onChange, id = 'mobile-number', required }: MobileNumberFieldProps) {
  const [focused, setFocused] = useState(false)

  function handleDigitsChange(raw: string) {
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 10)
    onChange({ ...value, digits: digitsOnly })
  }

  const incomplete = value.digits.length > 0 && value.digits.length < 10

  return (
    <div>
      <label htmlFor={id} className={labelClasses}>
        Mobile
      </label>
      <div className="mt-1.5 flex gap-2">
        <Select
          id={`${id}-country-code`}
          ariaLabel="Country code"
          size="compact"
          value={value.countryCode}
          onChange={(v) => onChange({ ...value, countryCode: v })}
          options={COUNTRY_CODES.map((c) => ({ value: c.code, label: c.label }))}
        />
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          required={required}
          autoComplete="tel-national"
          value={focused ? value.digits : formatForDisplay(value.digits)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => handleDigitsChange(e.target.value)}
          placeholder="9123456789"
          className={`${inputClasses} mt-0 flex-1`}
        />
      </div>
      {incomplete && <p className="mt-1 text-[11px] text-terracotta">Enter a 10-digit mobile number.</p>}
    </div>
  )
}

export default MobileNumberField
