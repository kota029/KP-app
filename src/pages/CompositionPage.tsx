import type { Member } from '../types'
import { CompositionAssist } from '../components/admin/CompositionAssist'
import { useComposition } from '../contexts/CompositionContext'
import { Calendar, MapPin } from 'lucide-react'
import { CAMPUSES, getNextThursday, getNextFriday, getTodayString } from '../data/mockData'

interface CompositionPageProps {
  members: Member[]
}

export function CompositionPage({ members }: CompositionPageProps) {
  const { date, campus, setDate, setCampus } = useComposition()

  const quickDates = [
    { label: '本日', value: getTodayString() },
    { label: '次回（木）', value: getNextThursday() },
    { label: '次回（金）', value: getNextFriday() },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">メンバー構成アシスト</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          今日の礼拝チームの編成案を作成する画面です。確定後、
          <span className="font-medium text-brand-700">「奉仕登録」</span>
          タブから一括登録できます。
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-sm font-semibold text-slate-800">対象の礼拝</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {quickDates.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDate(d.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                date === d.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <Calendar className="h-3.5 w-3.5" />
              日付
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <MapPin className="h-3.5 w-3.5" />
              キャンパス
            </span>
            <select
              value={campus}
              onChange={(e) => setCampus(e.target.value as typeof campus)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              {CAMPUSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <CompositionAssist members={members} />
    </div>
  )
}
