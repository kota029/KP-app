import { Search, LayoutGrid, ClipboardList, UserCircle } from 'lucide-react'
import type { TabId } from '../../types'

interface NavigationProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs: { id: TabId; label: string; icon: typeof Search; mobileLabel: string }[] = [
  { id: 'catalog', label: '奉仕者カタログ', icon: Search, mobileLabel: 'カタログ' },
  { id: 'composition', label: '構成アシスト', icon: LayoutGrid, mobileLabel: '構成' },
  { id: 'admin', label: '奉仕登録', icon: ClipboardList, mobileLabel: '登録' },
  { id: 'mypage', label: 'マイページ', icon: UserCircle, mobileLabel: 'マイ' },
]

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl overflow-x-auto px-2 sm:px-6">
        {tabs.map(({ id, label, icon: Icon, mobileLabel }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={`relative flex shrink-0 items-center justify-center gap-1.5 px-3 py-3.5 text-sm font-medium transition sm:gap-2 sm:px-5 ${
                isActive ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="sm:hidden">{mobileLabel}</span>
              <span className="hidden sm:inline">{label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-brand-600 sm:left-3 sm:right-3" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
