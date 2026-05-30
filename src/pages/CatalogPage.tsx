import { useMemo, useState } from 'react'
import { SlidersHorizontal, Search } from 'lucide-react'
import type { FilterState, Instrument, Member, TabId } from '../types'
import { FilterSidebar } from '../components/catalog/FilterSidebar'
import { MemberCard } from '../components/catalog/MemberCard'
import { MemberModal } from '../components/catalog/MemberModal'
import { useComposition } from '../contexts/CompositionContext'

interface CatalogPageProps {
  members: Member[]
  onTabChange: (tab: TabId) => void
}

const initialFilters: FilterState = {
  instruments: [],
  campuses: [],
  maxMonthlyCount: null,
  availableWeekdays: [],
}

function filterMembers(members: Member[], filters: FilterState, searchQuery: string): Member[] {
  return members.filter((m) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const match =
        m.name.toLowerCase().includes(q) ||
        m.campus.toLowerCase().includes(q) ||
        m.instruments.some((i) => i.toLowerCase().includes(q))
      if (!match) return false
    }

    if (filters.instruments.length > 0) {
      if (!filters.instruments.some((i) => m.instruments.includes(i))) return false
    }

    if (filters.campuses.length > 0) {
      if (!filters.campuses.includes(m.campus)) return false
    }

    if (filters.maxMonthlyCount !== null) {
      if (m.monthlyServiceCount > filters.maxMonthlyCount) return false
    }

    if (filters.availableWeekdays.length > 0) {
      if (!filters.availableWeekdays.some((d) => m.availableWeekdays.includes(d))) return false
    }

    return true
  })
}

export function CatalogPage({ members, onTabChange }: CatalogPageProps) {
  const { addMemberToComposition, showNotification } = useComposition()
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)

  const filtered = useMemo(
    () => filterMembers(members, filters, searchQuery),
    [members, filters, searchQuery],
  )

  const handleAddToComposition = (
    member: Member,
    instrument: Instrument,
    navigate = false,
  ) => {
    const result = addMemberToComposition(member.id, instrument, members)

    if (result === 'success') {
      showNotification(`${member.name} を ${instrument} で編成に追加しました`, 'success')
      if (navigate) {
        setSelectedMember(null)
        onTabChange('composition')
      }
    } else if (result === 'already_assigned') {
      showNotification(`${member.name} はすでに編成に配置されています`, 'info')
    } else if (result === 'invalid_instrument') {
      showNotification('選択した楽器は担当できません', 'error')
    } else {
      showNotification(`${instrument} の空き枠がありません`, 'error')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      <FilterSidebar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
      />

      <main className="flex-1 overflow-hidden">
        <div className="border-b border-slate-100 bg-white px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              絞り込み
            </button>

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="名前・キャンパス・楽器で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            <span className="font-medium text-slate-800">{filtered.length}</span> 件の奉仕者
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <p className="mt-4 text-base font-medium text-slate-700">該当するメンバーがいません</p>
            <p className="mt-1 text-sm text-slate-500">フィルター条件を変更してみてください</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:gap-4 sm:p-6 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((member, i) => (
              <MemberCard
                key={member.id}
                member={member}
                index={i}
                onClick={() => setSelectedMember(member)}
                onAddToComposition={() =>
                  handleAddToComposition(member, member.preferredRole1, false)
                }
              />
            ))}
          </div>
        )}
      </main>

      <MemberModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onAddToComposition={(instrument) => {
          if (selectedMember) handleAddToComposition(selectedMember, instrument, true)
        }}
      />
    </div>
  )
}
