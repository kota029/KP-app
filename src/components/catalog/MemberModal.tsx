import { useState, useEffect } from 'react'
import { X, MapPin, Music, UserPlus } from 'lucide-react'
import type { Instrument, Member } from '../../types'
import { WEEKDAYS } from '../../data/mockData'
import { DonutChart, buildRoleChartData } from '../shared/DonutChart'
import { MemberActivityHistory } from '../shared/MemberActivityHistory'
import { getPreferredInstrumentOptions } from '../../utils/memberUtils'

interface MemberModalProps {
  member: Member | null
  onClose: () => void
  onAddToComposition: (instrument: Instrument) => void
}

export function MemberModal({ member, onClose, onAddToComposition }: MemberModalProps) {
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null)

  useEffect(() => {
    if (member) {
      setSelectedInstrument(member.preferredRole1)
    }
  }, [member])

  useEffect(() => {
    if (!member) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [member])

  if (!member) return null

  const preferredOptions = getPreferredInstrumentOptions(member)
  const chartData = buildRoleChartData(member.serviceHistory)

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-x-4 top-[5vh] z-50 mx-auto flex max-h-[90vh] max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-slide-up sm:inset-x-auto sm:w-full">
        <div className="relative shrink-0">
          <div className="h-48 bg-gradient-to-br from-brand-500 to-brand-700 sm:h-56">
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="absolute -bottom-12 left-6 h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-lg sm:h-28 sm:w-28"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition hover:bg-white/30"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6 pt-16 scrollbar-thin sm:pt-20">
          <h2 className="text-2xl font-bold text-slate-900">{member.name}</h2>
          <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="h-4 w-4" />
            {member.campus}
            {member.joinedYear && (
              <span className="text-slate-400">· {member.joinedYear}年〜</span>
            )}
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-800">自己紹介</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              {member.bio ?? '自己紹介は未設定です'}
            </p>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              構成に追加する楽器
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {preferredOptions.map(({ instrument, label }) => (
                <button
                  key={instrument}
                  type="button"
                  onClick={() => setSelectedInstrument(instrument)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    selectedInstrument === instrument
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-brand-300'
                  }`}
                >
                  {label}: {instrument}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => selectedInstrument && onAddToComposition(selectedInstrument)}
              disabled={!selectedInstrument}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              構成に追加
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-brand-50 p-3 sm:p-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-brand-600 sm:text-xs">
                通算奉仕
              </p>
              <p className="mt-1 text-xl font-bold text-brand-800 sm:text-2xl">
                {member.totalServiceCount}
              </p>
              <p className="text-xs text-brand-600">回</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
                今月
              </p>
              <p className="mt-1 text-xl font-bold text-slate-800 sm:text-2xl">
                {member.monthlyServiceCount}
              </p>
              <p className="text-xs text-slate-500">回</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 sm:p-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
                所属
              </p>
              <p className="mt-1 text-sm font-bold leading-tight text-slate-800 sm:text-base">
                {member.campus}
              </p>
            </div>
          </div>

          {chartData.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-800">担当楽器の割合</h3>
              <div className="mt-3">
                <DonutChart data={chartData} />
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Music className="h-4 w-4 text-brand-600" />
              希望楽器 / 役割
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white">
                第1: {member.preferredRole1}
              </span>
              <span className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700">
                第2: {member.preferredRole2}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-800">参加可能曜日</h3>
            <div className="mt-2 flex gap-1.5">
              {WEEKDAYS.map((day) => (
                <span
                  key={day}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                    member.availableWeekdays.includes(day)
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-300'
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-800">過去の活動履歴</h3>
            <div className="mt-3">
              <MemberActivityHistory records={member.serviceHistory} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
