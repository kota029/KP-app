import { X, RotateCcw } from 'lucide-react'
import type { FilterState, Instrument, Campus, Weekday } from '../../types'
import { INSTRUMENTS, CAMPUSES, WEEKDAYS, WEEKDAY_LABELS } from '../../data/mockData'

interface FilterSidebarProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  resultCount: number
  isOpen: boolean
  onClose: () => void
}

const defaultFilters: FilterState = {
  instruments: [],
  campuses: [],
  maxMonthlyCount: null,
  availableWeekdays: [],
}

function CheckboxGroup<T extends string>({
  items,
  selected,
  onToggle,
  label,
}: {
  items: T[]
  selected: T[]
  onToggle: (item: T) => void
  label: string
}) {
  return (
    <div>
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</h3>
      <div className="space-y-1">
        {items.map((item) => {
          const checked = selected.includes(item)
          return (
            <label
              key={item}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition ${
                checked ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(item)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm">{item}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

export function FilterSidebar({ filters, onChange, resultCount, isOpen, onClose }: FilterSidebarProps) {
  const toggleInstrument = (item: Instrument) => {
    const next = filters.instruments.includes(item)
      ? filters.instruments.filter((i) => i !== item)
      : [...filters.instruments, item]
    onChange({ ...filters, instruments: next })
  }

  const toggleCampus = (item: Campus) => {
    const next = filters.campuses.includes(item)
      ? filters.campuses.filter((c) => c !== item)
      : [...filters.campuses, item]
    onChange({ ...filters, campuses: next })
  }

  const toggleWeekday = (item: Weekday) => {
    const next = filters.availableWeekdays.includes(item)
      ? filters.availableWeekdays.filter((d) => d !== item)
      : [...filters.availableWeekdays, item]
    onChange({ ...filters, availableWeekdays: next })
  }

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 lg:border-none">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">絞り込み</h2>
          <p className="text-xs text-slate-500">{resultCount} 件のメンバー</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(defaultFilters)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <RotateCcw className="h-3 w-3" />
            リセット
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4 scrollbar-thin">
        <CheckboxGroup
          label="担当楽器"
          items={INSTRUMENTS}
          selected={filters.instruments}
          onToggle={toggleInstrument}
        />
        <CheckboxGroup
          label="所属キャンパス"
          items={CAMPUSES}
          selected={filters.campuses}
          onToggle={toggleCampus}
        />

        <div>
          <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            今月の奉仕回数（上限）
          </h3>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    maxMonthlyCount: filters.maxMonthlyCount === n ? null : n,
                  })
                }
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  filters.maxMonthlyCount === n
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {n} 回以下
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            参加可能曜日
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS.map((day) => {
              const selected = filters.availableWeekdays.includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleWeekday(day)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition ${
                    selected
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {WEEKDAY_LABELS[day]}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={onClose} />
          <aside className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl lg:hidden animate-slide-up">
            {content}
          </aside>
        </>
      )}
    </>
  )
}
