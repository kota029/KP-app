import { useState, useEffect, useMemo } from 'react'
import {
  Calendar,
  MapPin,
  User,
  Music,
  Check,
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  Users,
} from 'lucide-react'
import type { Campus, EventName, Instrument, Member, RegistrationRow, ServiceRegistration } from '../../types'
import {
  CAMPUSES,
  EVENT_NAMES,
  INSTRUMENTS,
  getTodayString,
  getNextThursday,
  getNextFriday,
} from '../../data/mockData'
import { registerServicesBulk } from '../../api/client'
import { useComposition } from '../../contexts/CompositionContext'

interface BulkServiceFormProps {
  members: Member[]
  onRegistered: (registrations: ServiceRegistration[]) => void
}

function createEmptyRow(): RegistrationRow {
  return { id: `row-${Date.now()}-${Math.random()}`, memberId: '', instrument: 'ボーカル' }
}

function slotsToRows(
  slots: { id: string; instrument: Instrument; memberId: string | null }[],
): RegistrationRow[] {
  return slots
    .filter((s) => s.memberId)
    .map((s) => ({
      id: `comp-${s.id}`,
      memberId: s.memberId!,
      instrument: s.instrument,
    }))
}

export function BulkServiceForm({ members, onRegistered }: BulkServiceFormProps) {
  const { slots, date, campus, setDate, setCampus, resetSlots } = useComposition()
  const [rows, setRows] = useState<RegistrationRow[]>([])
  const [manualRowIds, setManualRowIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)
  const [eventName, setEventName] = useState<EventName>('ACF礼拝')

  const compositionRows = useMemo(() => slotsToRows(slots), [slots])

  useEffect(() => {
    setRows((prev) => {
      const manual = prev.filter((r) => manualRowIds.has(r.id))
      return [...compositionRows, ...manual]
    })
  }, [compositionRows, manualRowIds])

  const quickDates = [
    { label: '本日', value: getTodayString() },
    { label: '次回（木）', value: getNextThursday() },
    { label: '次回（金）', value: getNextFriday() },
  ]

  const validRows = rows.filter((r) => r.memberId)
  const memberIds = validRows.map((r) => r.memberId)
  const hasDuplicates = memberIds.length !== new Set(memberIds).size

  const updateRow = (rowId: string, patch: Partial<RegistrationRow>) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)))
  }

  const removeRow = (rowId: string) => {
    setRows((prev) => prev.filter((r) => r.id !== rowId))
    setManualRowIds((prev) => {
      const next = new Set(prev)
      next.delete(rowId)
      return next
    })
  }

  const addManualRow = () => {
    const row = createEmptyRow()
    setManualRowIds((prev) => new Set(prev).add(row.id))
    setRows((prev) => [...prev, row])
  }

  const handleBulkRegister = async () => {
    if (!date || !campus) return
    if (validRows.length === 0) return
    if (hasDuplicates) {
      setDuplicateWarning('同じメンバーが複数行に含まれています。重複を解消してください。')
      return
    }

    setDuplicateWarning(null)
    setLoading(true)
    setProgress({ current: 0, total: validRows.length })

    const payloads = validRows.map((row) => {
      const member = members.find((m) => m.id === row.memberId)!
      return {
        date,
        campus,
        memberId: row.memberId,
        memberName: member.name,
        instrument: row.instrument,
        eventName,
      }
    })

    try {
      for (let i = 0; i < payloads.length; i++) {
        setProgress({ current: i + 1, total: payloads.length })
        await new Promise((r) => setTimeout(r, 200))
      }

      const results = await registerServicesBulk(payloads)
      onRegistered(results)

      const shouldReset = window.confirm(
        `${results.length} 件の奉仕登録が完了しました。\n編成ボードをリセットしますか？`,
      )
      if (shouldReset) {
        resetSlots()
        setManualRowIds(new Set())
        setRows([])
      }
    } finally {
      setLoading(false)
      setProgress({ current: 0, total: 0 })
    }
  }

  const getRowInstruments = (_row: RegistrationRow): Instrument[] => INSTRUMENTS

  const assignedCount = compositionRows.length

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">奉仕一括登録</h2>
      <p className="mt-1 text-sm text-slate-500">
        構成アシストの編成を確認し、まとめてスプレッドシートに登録します
      </p>

      {assignedCount > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <Users className="h-4 w-4 shrink-0" />
          構成アシストから {assignedCount} 名が読み込まれています
        </div>
      )}

      <div className="mt-5 space-y-4">
        <div className="flex flex-wrap gap-2">
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <MapPin className="h-3.5 w-3.5" />
              キャンパス
            </span>
            <select
              value={campus}
              onChange={(e) => setCampus(e.target.value as Campus)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              {CAMPUSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2 lg:col-span-1">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">イベント名</span>
            <select
              value={eventName}
              onChange={(e) => setEventName(e.target.value as EventName)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              {EVENT_NAMES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">登録メンバー一覧</h3>
            <button
              type="button"
              onClick={addManualRow}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5" />
              行を追加
            </button>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
              <p className="text-sm text-slate-500">
                構成アシストでメンバーを配置するか、「行を追加」で手動登録してください
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {rows.map((row) => {
                const isFromComposition = row.id.startsWith('comp-')
                const instruments = getRowInstruments(row)

                return (
                  <div
                    key={row.id}
                    className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-nowrap"
                  >
                    <div className="flex min-w-0 flex-1 basis-full items-center gap-2 sm:basis-auto">
                      <User className="h-4 w-4 shrink-0 text-slate-400" />
                      <select
                        value={row.memberId}
                        onChange={(e) => {
                          const memberId = e.target.value
                          const member = members.find((m) => m.id === memberId)
                          updateRow(row.id, {
                            memberId,
                            instrument: member?.preferredRole1 ?? row.instrument,
                          })
                        }}
                        className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-brand-400"
                        disabled={isFromComposition}
                      >
                        <option value="">メンバーを選択</option>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}（{m.campus}）
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex min-w-0 flex-1 basis-full items-center gap-2 sm:basis-auto sm:max-w-[200px]">
                      <Music className="h-4 w-4 shrink-0 text-slate-400" />
                      <select
                        value={row.instrument}
                        onChange={(e) =>
                          updateRow(row.id, { instrument: e.target.value as Instrument })
                        }
                        className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none focus:border-brand-400"
                        disabled={isFromComposition}
                      >
                        {instruments.map((i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>

                    {!isFromComposition && (
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                        aria-label="行を削除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {(hasDuplicates || duplicateWarning) && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {duplicateWarning ?? '同じメンバーが複数行に含まれています'}
          </div>
        )}

        <button
          type="button"
          onClick={handleBulkRegister}
          disabled={loading || validRows.length === 0 || hasDuplicates || !date}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {progress.total > 0
                ? `${progress.current}/${progress.total} 登録中...`
                : '登録中...'}
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              編成メンバー全員を登録（{validRows.length} 名）
            </>
          )}
        </button>
      </div>
    </section>
  )
}
