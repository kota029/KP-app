import { useState } from 'react'
import { AlertTriangle, GripVertical, Plus, X } from 'lucide-react'
import type { Instrument, Member } from '../../types'
import { HIGH_SERVICE_THRESHOLD } from '../../data/mockData'
import { useComposition } from '../../contexts/CompositionContext'

interface CompositionAssistProps {
  members: Member[]
}

interface DragState {
  memberId: string
  fromSlotId: string | null
}

export function CompositionAssist({ members }: CompositionAssistProps) {
  const { slots, assignMember, moveMember, resetSlots, showNotification } = useComposition()
  const [dragState, setDragState] = useState<DragState | null>(null)

  const assignedIds = new Set(slots.filter((s) => s.memberId).map((s) => s.memberId!))
  const availableMembers = members.filter((m) => !assignedIds.has(m.id))

  const getMember = (id: string) => members.find((m) => m.id === id)

  const canDropOnSlot = (slotId: string, instrument: Instrument, memberId: string | null) => {
    if (!dragState || !memberId) return false
    const slot = slots.find((s) => s.id === slotId)
    if (!slot || slot.memberId) return false
    if (dragState.fromSlotId === slotId) return false
    const member = getMember(memberId)
    return member?.instruments.includes(instrument) ?? false
  }

  const handleDrop = (slotId: string) => {
    if (!dragState) return

    const slot = slots.find((s) => s.id === slotId)
    if (!slot || slot.memberId) return

    const member = getMember(dragState.memberId)
    if (!member?.instruments.includes(slot.instrument)) {
      showNotification(`${member?.name ?? 'メンバー'} は ${slot.instrument} を担当できません`, 'error')
      setDragState(null)
      return
    }

    if (dragState.fromSlotId) {
      const moved = moveMember(dragState.fromSlotId, slotId, members)
      if (!moved) {
        showNotification('移動できませんでした', 'error')
      }
    } else {
      assignMember(slotId, dragState.memberId)
    }

    setDragState(null)
  }

  const clearDrag = () => setDragState(null)

  const warnings = slots
    .filter((s) => s.memberId)
    .map((s) => ({ slot: s, member: getMember(s.memberId!)! }))
    .filter(({ member }) => member.monthlyServiceCount >= HIGH_SERVICE_THRESHOLD)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">編成ボード</h2>
          <p className="mt-1 text-sm text-slate-500">
            候補または配置済みメンバーをドラッグして、空き枠に配置・移動できます
          </p>
        </div>
        <button
          type="button"
          onClick={resetSlots}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
        >
          リセット
        </button>
      </div>

      {warnings.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            奉仕回数が多いメンバーが配置されています
          </div>
          <ul className="mt-2 space-y-1">
            {warnings.map(({ slot, member }) => (
              <li key={slot.id} className="text-xs text-amber-700">
                {member.name}（{slot.instrument}）— 今月 {member.monthlyServiceCount} 回
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            参加可能な候補 ({availableMembers.length})
          </h3>
          <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-3 scrollbar-thin">
            {availableMembers.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">全員配置済みです</p>
            ) : (
              availableMembers.map((member) => (
                <div
                  key={member.id}
                  draggable
                  onDragStart={() => setDragState({ memberId: member.id, fromSlotId: null })}
                  onDragEnd={clearDrag}
                  className="flex cursor-grab items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition active:cursor-grabbing hover:border-brand-200"
                >
                  <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                  <img src={member.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{member.name}</p>
                    <p className="text-xs text-slate-500">
                      {member.instruments.join(' · ')} / 今月 {member.monthlyServiceCount} 回
                    </p>
                  </div>
                  {member.monthlyServiceCount >= HIGH_SERVICE_THRESHOLD && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      多
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            編成枠
          </h3>
          <div className="space-y-2">
            {slots.map((slot) => {
              const member = slot.memberId ? getMember(slot.memberId) : null
              const isWarning = member && member.monthlyServiceCount >= HIGH_SERVICE_THRESHOLD
              const isDropTarget =
                dragState &&
                canDropOnSlot(slot.id, slot.instrument, dragState.memberId)

              return (
                <div
                  key={slot.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(slot.id)}
                  className={`rounded-xl border-2 border-dashed p-3 transition ${
                    isDropTarget
                      ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-200'
                      : dragState && !slot.memberId
                        ? 'border-slate-300 bg-slate-50/80'
                        : member
                          ? 'border-solid border-slate-200 bg-white'
                          : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                      {slot.instrument}
                    </span>
                    {member && (
                      <button
                        type="button"
                        onClick={() => assignMember(slot.id, null)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {member ? (
                    <div
                      draggable
                      onDragStart={() =>
                        setDragState({ memberId: member.id, fromSlotId: slot.id })
                      }
                      onDragEnd={clearDrag}
                      className="mt-2 flex cursor-grab items-center gap-3 active:cursor-grabbing"
                    >
                      <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                      <img src={member.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-slate-800">{member.name}</p>
                          {isWarning && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                              <AlertTriangle className="h-2.5 w-2.5" />
                              警告
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">今月 {member.monthlyServiceCount} 回 · ドラッグで移動</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-slate-400">
                        {isDropTarget ? 'ここにドロップ' : 'ここにドロップ'}
                      </p>
                      {availableMembers.length > 0 && (
                        <select
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) assignMember(slot.id, e.target.value)
                          }}
                        >
                          <option value="">追加...</option>
                          {availableMembers
                            .filter((m) => m.instruments.includes(slot.instrument as Instrument))
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                  )}

                  {member && (
                    <div className="mt-2 lg:hidden">
                      <select
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none"
                        value=""
                        onChange={(e) => {
                          const toSlotId = e.target.value
                          if (toSlotId) moveMember(slot.id, toSlotId, members)
                        }}
                      >
                        <option value="">別の枠へ移動...</option>
                        {slots
                          .filter(
                            (s) =>
                              !s.memberId &&
                              s.id !== slot.id &&
                              member.instruments.includes(s.instrument),
                          )
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.instrument}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 lg:hidden">
        <p className="mb-2 text-xs text-slate-500">タップで追加（モバイル向け）</p>
        <div className="flex flex-wrap gap-2">
          {availableMembers.slice(0, 4).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                const emptySlot = slots.find(
                  (s) => !s.memberId && m.instruments.includes(s.instrument as Instrument),
                )
                if (emptySlot) assignMember(emptySlot.id, m.id)
              }}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700"
            >
              <Plus className="h-3 w-3" />
              {m.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
