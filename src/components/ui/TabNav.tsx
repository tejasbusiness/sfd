interface TabNavItem {
  key: string
  label: string
}

interface TabNavProps {
  tabs: TabNavItem[]
  activeKey: string
  onChange: (key: string) => void
}

export function TabNav({ tabs, activeKey, onChange }: TabNavProps) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-ink/10">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`font-mono-label rounded-t-lg px-4 py-2.5 text-[11px] uppercase transition-colors ${
            activeKey === t.key ? 'bg-ink text-cream' : 'text-ink-soft hover:bg-sage hover:text-ink'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
