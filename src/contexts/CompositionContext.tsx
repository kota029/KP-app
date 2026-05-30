import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { AddMemberResult, Campus, CompositionSlot, Instrument, Member } from '../types'
import { COMPOSITION_SLOTS, getTodayString } from '../data/mockData'

function createInitialSlots(): CompositionSlot[] {
  return COMPOSITION_SLOTS.map((instrument, i) => ({
    id: `slot-${i}`,
    instrument,
    memberId: null,
  }))
}

interface Notification {
  message: string
  type: 'success' | 'error' | 'info'
}

interface CompositionContextValue {
  slots: CompositionSlot[]
  date: string
  campus: Campus
  notification: Notification | null
  setDate: (date: string) => void
  setCampus: (campus: Campus) => void
  assignMember: (slotId: string, memberId: string | null) => void
  addMemberToComposition: (
    memberId: string,
    instrument: Instrument,
    members: Member[],
  ) => AddMemberResult
  moveMember: (fromSlotId: string, toSlotId: string, members: Member[]) => boolean
  resetSlots: () => void
  clearNotification: () => void
  showNotification: (message: string, type: Notification['type']) => void
}

const CompositionContext = createContext<CompositionContextValue | null>(null)

export function CompositionProvider({ children }: { children: ReactNode }) {
  const [slots, setSlots] = useState<CompositionSlot[]>(createInitialSlots)
  const [date, setDate] = useState(getTodayString())
  const [campus, setCampus] = useState<Campus>('相模原')
  const [notification, setNotification] = useState<Notification | null>(null)

  const showNotification = useCallback((message: string, type: Notification['type']) => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }, [])

  const clearNotification = useCallback(() => setNotification(null), [])

  const assignMember = useCallback((slotId: string, memberId: string | null) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id === slotId) return { ...s, memberId }
        if (memberId && s.memberId === memberId) return { ...s, memberId: null }
        return s
      }),
    )
  }, [])

  const resetSlots = useCallback(() => setSlots(createInitialSlots()), [])

  const addMemberToComposition = useCallback(
    (memberId: string, instrument: Instrument, members: Member[]): AddMemberResult => {
      const member = members.find((m) => m.id === memberId)
      if (!member) return 'no_slot'

      if (!member.instruments.includes(instrument)) return 'invalid_instrument'

      if (slots.some((s) => s.memberId === memberId)) return 'already_assigned'

      const slot = slots.find((s) => !s.memberId && s.instrument === instrument)
      if (!slot) return 'no_slot'

      assignMember(slot.id, memberId)
      return 'success'
    },
    [slots, assignMember],
  )

  const moveMember = useCallback(
    (fromSlotId: string, toSlotId: string, members: Member[]): boolean => {
      if (fromSlotId === toSlotId) return false

      let success = false
      setSlots((prev) => {
        const from = prev.find((s) => s.id === fromSlotId)
        const to = prev.find((s) => s.id === toSlotId)
        if (!from?.memberId || to?.memberId) return prev

        const member = members.find((m) => m.id === from.memberId)
        if (!member || !to || !member.instruments.includes(to.instrument)) return prev

        success = true
        return prev.map((s) => {
          if (s.id === fromSlotId) return { ...s, memberId: null }
          if (s.id === toSlotId) return { ...s, memberId: from.memberId }
          return s
        })
      })
      return success
    },
    [],
  )

  return (
    <CompositionContext.Provider
      value={{
        slots,
        date,
        campus,
        notification,
        setDate,
        setCampus,
        assignMember,
        addMemberToComposition,
        moveMember,
        resetSlots,
        clearNotification,
        showNotification,
      }}
    >
      {children}
    </CompositionContext.Provider>
  )
}

export function useComposition() {
  const ctx = useContext(CompositionContext)
  if (!ctx) throw new Error('useComposition must be used within CompositionProvider')
  return ctx
}
