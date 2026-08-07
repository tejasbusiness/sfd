import { Button } from '../ui/Button'
import { inputClasses, labelClasses } from '../ui/Input'

export interface LabelValuePair {
  label: string
  value: string
}

interface LabelValueListEditorProps {
  label: string
  value: LabelValuePair[]
  onChange: (value: LabelValuePair[]) => void
}

/** Editable list of {label, value} pairs (e.g. portfolio outcome_metrics: "Booking conversion" / "+40%"). */
function LabelValueListEditor({ label, value, onChange }: LabelValueListEditorProps) {
  function update(index: number, field: keyof LabelValuePair, next: string) {
    onChange(value.map((v, i) => (i === index ? { ...v, [field]: next } : v)))
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div>
      <span className={labelClasses}>{label}</span>
      <div className="mt-1.5 space-y-2">
        {value.map((pair, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={pair.label}
              onChange={(e) => update(i, 'label', e.target.value)}
              placeholder="Label"
              className={`${inputClasses} mt-0 flex-1`}
            />
            <input
              value={pair.value}
              onChange={(e) => update(i, 'value', e.target.value)}
              placeholder="Value"
              className={`${inputClasses} mt-0 flex-1`}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="font-mono-label text-[10px] uppercase text-terracotta"
            >
              Remove
            </button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="md" onClick={() => onChange([...value, { label: '', value: '' }])}>
          Add metric
        </Button>
      </div>
    </div>
  )
}

export default LabelValueListEditor
