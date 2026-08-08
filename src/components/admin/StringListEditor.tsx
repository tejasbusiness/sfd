import { useEffect, useRef, useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { Button } from '../ui/Button'
import { inputClasses, labelClasses } from '../ui/Input'

interface StringListEditorProps {
  label: string
  value: string[]
  onChange: (value: string[]) => void
}

interface Row {
  id: number
  value: string
}

function toRows(value: string[], startId: number): Row[] {
  return value.map((v, i) => ({ id: startId + i, value: v }))
}

/** Editable list of plain strings (e.g. pricing tier features) — add/edit/reorder/remove rows. */
function StringListEditor({ label, value, onChange }: StringListEditorProps) {
  // Rows carry a stable id (independent of text/position) so drag-reorder and duplicate
  // values don't confuse React/Framer Motion's identity tracking. Resynced from `value`
  // whenever the parent replaces it wholesale (e.g. an async fetch populating the form) —
  // detected by reference, so in-place edits/reorders (which always go through `commit`,
  // updating both `rows` and `value` together) never trigger a resync loop.
  const nextIdRef = useRef(value.length)
  const [rows, setRows] = useState<Row[]>(() => toRows(value, 0))
  const lastValueRef = useRef(value)

  useEffect(() => {
    if (lastValueRef.current === value) return
    lastValueRef.current = value
    nextIdRef.current = value.length
    setRows(toRows(value, 0))
  }, [value])

  function commit(nextRows: Row[]) {
    setRows(nextRows)
    const nextValue = nextRows.map((r) => r.value)
    lastValueRef.current = nextValue
    onChange(nextValue)
  }

  function update(index: number, next: string) {
    commit(rows.map((r, i) => (i === index ? { ...r, value: next } : r)))
  }

  function remove(index: number) {
    commit(rows.filter((_, i) => i !== index))
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= rows.length) return
    const next = [...rows]
    ;[next[index], next[target]] = [next[target], next[index]]
    commit(next)
  }

  function addItem() {
    commit([...rows, { id: nextIdRef.current++, value: '' }])
  }

  return (
    <div>
      <span className={labelClasses}>{label}</span>
      <Reorder.Group axis="y" values={rows} onReorder={commit} className="mt-1.5 space-y-2">
        {rows.map((row, i) => (
          <StringListRow
            key={row.id}
            row={row}
            index={i}
            isFirst={i === 0}
            isLast={i === rows.length - 1}
            onChange={update}
            onRemove={remove}
            onMove={move}
          />
        ))}
      </Reorder.Group>
      <Button type="button" variant="secondary" size="md" className="mt-2" onClick={addItem}>
        Add item
      </Button>
    </div>
  )
}

interface StringListRowProps {
  row: Row
  index: number
  isFirst: boolean
  isLast: boolean
  onChange: (index: number, next: string) => void
  onRemove: (index: number) => void
  onMove: (index: number, direction: -1 | 1) => void
}

function StringListRow({ row, index, isFirst, isLast, onChange, onRemove, onMove }: StringListRowProps) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      value={row}
      dragListener={false}
      dragControls={dragControls}
      className="flex items-center gap-2 rounded-lg bg-cream"
    >
      <button
        type="button"
        onPointerDown={(e) => dragControls.start(e)}
        aria-label="Drag to reorder"
        className="cursor-grab touch-none text-ink/40 hover:text-ink active:cursor-grabbing"
      >
        ⠿
      </button>
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => onMove(index, -1)}
          disabled={isFirst}
          aria-label="Move up"
          className="text-ink/60 hover:text-ink disabled:opacity-30 disabled:hover:text-ink/60"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => onMove(index, 1)}
          disabled={isLast}
          aria-label="Move down"
          className="text-ink/60 hover:text-ink disabled:opacity-30 disabled:hover:text-ink/60"
        >
          ▼
        </button>
      </div>
      <input
        value={row.value}
        onChange={(e) => onChange(index, e.target.value)}
        className={`${inputClasses} mt-0`}
      />
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="font-mono-label text-[10px] uppercase text-terracotta"
      >
        Remove
      </button>
    </Reorder.Item>
  )
}

export default StringListEditor
