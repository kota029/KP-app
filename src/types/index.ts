export type Instrument =
  | 'ボーカル'
  | 'アコースティックギター'
  | 'リード'
  | 'ベース'
  | 'ピアノ/キーボード'
  | 'ドラム/カホン'
  | 'PA'

export type Campus = '相模原' | '青山'

export type Weekday = '火' | '木' | '金'

export type EventName =
  | 'じょいふる'
  | 'めぐみたいむ'
  | '夕礼拝'
  | 'ACF礼拝'
  | 'コンテンポラリー礼拝'

export interface ServiceRecord {
  id: string
  date: string
  campus: Campus
  role: Instrument
  eventName: string
}

export interface Member {
  id: string
  name: string
  email: string
  campus: Campus
  instruments: Instrument[]
  preferredRole1: Instrument
  preferredRole2: Instrument
  monthlyServiceCount: number
  totalServiceCount: number
  availableWeekdays: Weekday[]
  avatarUrl: string
  serviceHistory: ServiceRecord[]
  bio?: string
  joinedYear?: number
}

export interface ServiceRegistration {
  id: string
  date: string
  campus: Campus
  memberId: string
  memberName: string
  instrument: Instrument
  eventName: EventName
}

export interface CompositionSlot {
  id: string
  instrument: Instrument
  memberId: string | null
}

export interface FilterState {
  instruments: Instrument[]
  campuses: Campus[]
  maxMonthlyCount: number | null
  availableWeekdays: Weekday[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isLoading?: boolean
}

export interface ProfileUpdatePayload {
  name?: string
  campus?: Campus
  preferredRole1?: Instrument
  preferredRole2?: Instrument
  availableWeekdays?: Weekday[]
  bio?: string
  avatarBase64?: string
}

export type TabId = 'catalog' | 'composition' | 'admin' | 'mypage'

export type AddMemberResult = 'success' | 'already_assigned' | 'no_slot'

export interface RegistrationRow {
  id: string
  memberId: string
  instrument: Instrument
}
