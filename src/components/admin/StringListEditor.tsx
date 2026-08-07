import { Button } from '../ui/Button'
import { inputClasses, labelClasses } from '../ui/Input'

interface StringListEditorProps {
  label: string
  value: string[]
  onChange: (value: string[]) => void
}

/** Editable list of plain strings (e.g. pricing tier features) — add/edit/remove rows. */
function StringListEditor({ label, value, onChange }: StringListEditorProps) {
  function update(index: number, next: string) {
    onChange(value.map((v, i) => (i === index ? next : v)))
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div>
      <span className={labelClasses}>{label}</span>
      <div className="mt-1.5 space-y-2">
        {value.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input value={v} onChange={(e) => update(i, e.target.value)} className={`${inputClasses} mt-0`} />
            <button
              type="button"
              onClick={() => remove(i)}
              className="font-mono-label text-[10px] uppercase text-terracotta"
            >
              Remove
            </button>
          </div>
        ))}
        <Button type="button" variant="secondary" size="md" onClick={() => onChange([...value, ''])}>
          Add item
        </Button>
      </div>
    </div>
  )
}

export default StringListEditor
