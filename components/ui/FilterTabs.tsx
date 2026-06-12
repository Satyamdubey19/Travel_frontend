'use client'

interface FilterTabsProps<T extends string> {
  tabs: T[]
  active: T
  onChange: (tab: T) => void
  formatLabel?: (tab: T) => string
  className?: string
}

export default function FilterTabs<T extends string>({
  tabs,
  active,
  onChange,
  formatLabel,
  className,
}: FilterTabsProps<T>) {
  return (
    <div className={`inline-flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 p-1.5 ${className || ''}`}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 ${
            active === tab
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
          }`}
        >
          {formatLabel ? formatLabel(tab) : tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  )
}
