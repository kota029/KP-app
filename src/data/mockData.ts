import type { Campus, Instrument, Member, Weekday } from '../types'

const avatarColors = ['2563eb', '4f46e5', '0284c7', '0891b2', '0d9488', '7c3aed', '1d4ed8', '475569']

function avatar(name: string, index: number): string {
  const initial = name.charAt(0)
  const color = avatarColors[index % avatarColors.length]
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=${color}&color=fff&size=128&bold=true`
}

function history(
  memberId: string,
  entries: Array<{ date: string; campus: Campus; role: Instrument; eventName: string }>,
) {
  return entries.map((e, i) => ({
    id: `${memberId}-h${i}`,
    ...e,
  }))
}

export const INSTRUMENTS: Instrument[] = [
  'ボーカル',
  'アコースティックギター',
  'エレキギター',
  'ベース',
  'ピアノ/キーボード',
  'ドラム/カホン',
  'PA',
]

export const CAMPUSES: Campus[] = ['相模原', '青山']

export const WEEKDAYS: Weekday[] = ['木', '金']

export const COMPOSITION_SLOTS: Instrument[] = [
  'ボーカル',
  'アコースティックギター',
  'エレキギター',
  'ベース',
  'ピアノ/キーボード',
  'ドラム/カホン',
  'PA',
]

export const mockMembers: Member[] = [
  {
    id: 'm1',
    name: '田中 健太',
    email: 'kenta.tanaka@example.com',
    campus: '相模原',
    instruments: ['ボーカル', 'アコースティックギター'],
    preferredRole1: 'ボーカル',
    preferredRole2: 'アコースティックギター',
    monthlyServiceCount: 3,
    totalServiceCount: 42,
    availableWeekdays: ['木', '金'],
    avatarUrl: avatar('田中', 0),
    joinedYear: 2022,
    bio: '主にボーカルとアコギを担当しています。',
    serviceHistory: history('m1', [
      { date: '2026-05-22', campus: '相模原', role: 'ボーカル', eventName: '主日礼拝' },
      { date: '2026-05-15', campus: '相模原', role: 'アコースティックギター', eventName: '主日礼拝' },
      { date: '2026-05-08', campus: '青山', role: 'ボーカル', eventName: '合同礼拝' },
      { date: '2026-05-01', campus: '相模原', role: 'ボーカル', eventName: '主日礼拝' },
    ]),
  },
  {
    id: 'm2',
    name: '佐藤 美咲',
    email: 'misaki.sato@example.com',
    campus: '相模原',
    instruments: ['ピアノ/キーボード', 'ボーカル'],
    preferredRole1: 'ピアノ/キーボード',
    preferredRole2: 'ボーカル',
    monthlyServiceCount: 2,
    totalServiceCount: 28,
    availableWeekdays: ['木'],
    avatarUrl: avatar('佐藤', 1),
    joinedYear: 2023,
    bio: 'ピアノメインで奉仕しています。',
    serviceHistory: history('m2', [
      { date: '2026-05-22', campus: '相模原', role: 'ピアノ/キーボード', eventName: '主日礼拝' },
      { date: '2026-05-08', campus: '相模原', role: 'ピアノ/キーボード', eventName: '主日礼拝' },
      { date: '2026-04-24', campus: '青山', role: 'ボーカル', eventName: '特別礼拝' },
    ]),
  },
  {
    id: 'm3',
    name: '鈴木 大輔',
    email: 'daisuke.suzuki@example.com',
    campus: '青山',
    instruments: ['エレキギター', 'ベース'],
    preferredRole1: 'エレキギター',
    preferredRole2: 'ベース',
    monthlyServiceCount: 4,
    totalServiceCount: 55,
    availableWeekdays: ['木', '金'],
    avatarUrl: avatar('鈴木', 2),
    joinedYear: 2021,
    bio: 'エレキとベース両方できます。',
    serviceHistory: history('m3', [
      { date: '2026-05-23', campus: '青山', role: 'エレキギター', eventName: '主日礼拝' },
      { date: '2026-05-16', campus: '青山', role: 'エレキギター', eventName: '主日礼拝' },
      { date: '2026-05-09', campus: '相模原', role: 'ベース', eventName: '合同礼拝' },
      { date: '2026-05-02', campus: '青山', role: 'エレキギター', eventName: '主日礼拝' },
    ]),
  },
  {
    id: 'm4',
    name: '高橋 ゆい',
    email: 'yui.takahashi@example.com',
    campus: '相模原',
    instruments: ['ボーカル'],
    preferredRole1: 'ボーカル',
    preferredRole2: 'ボーカル',
    monthlyServiceCount: 1,
    totalServiceCount: 15,
    availableWeekdays: ['金'],
    avatarUrl: avatar('高橋', 3),
    joinedYear: 2024,
    bio: '新入生です。ボーカルで奉仕したいです。',
    serviceHistory: history('m4', [
      { date: '2026-05-16', campus: '相模原', role: 'ボーカル', eventName: '主日礼拝' },
    ]),
  },
  {
    id: 'm5',
    name: '伊藤 翔',
    email: 'sho.ito@example.com',
    campus: '相模原',
    instruments: ['ドラム/カホン', 'ベース'],
    preferredRole1: 'ドラム/カホン',
    preferredRole2: 'ベース',
    monthlyServiceCount: 2,
    totalServiceCount: 33,
    availableWeekdays: ['木'],
    avatarUrl: avatar('伊藤', 4),
    joinedYear: 2022,
    serviceHistory: history('m5', [
      { date: '2026-05-22', campus: '相模原', role: 'ドラム/カホン', eventName: '主日礼拝' },
      { date: '2026-05-08', campus: '相模原', role: 'ドラム/カホン', eventName: '主日礼拝' },
    ]),
  },
  {
    id: 'm6',
    name: '渡辺 あかり',
    email: 'akari.watanabe@example.com',
    campus: '青山',
    instruments: ['アコースティックギター', 'ボーカル'],
    preferredRole1: 'アコースティックギター',
    preferredRole2: 'ボーカル',
    monthlyServiceCount: 3,
    totalServiceCount: 38,
    availableWeekdays: ['木', '金'],
    avatarUrl: avatar('渡辺', 5),
    joinedYear: 2022,
    serviceHistory: history('m6', [
      { date: '2026-05-23', campus: '青山', role: 'アコースティックギター', eventName: '主日礼拝' },
      { date: '2026-05-16', campus: '青山', role: 'アコースティックギター', eventName: '主日礼拝' },
      { date: '2026-05-09', campus: '青山', role: 'ボーカル', eventName: '主日礼拝' },
    ]),
  },
  {
    id: 'm7',
    name: '中村 亮',
    email: 'ryo.nakamura@example.com',
    campus: '相模原',
    instruments: ['ベース', 'エレキギター'],
    preferredRole1: 'ベース',
    preferredRole2: 'エレキギター',
    monthlyServiceCount: 2,
    totalServiceCount: 47,
    availableWeekdays: ['金'],
    avatarUrl: avatar('中村', 6),
    joinedYear: 2020,
    serviceHistory: history('m7', [
      { date: '2026-05-23', campus: '相模原', role: 'ベース', eventName: '主日礼拝' },
      { date: '2026-05-02', campus: '相模原', role: 'ベース', eventName: '主日礼拝' },
    ]),
  },
  {
    id: 'm8',
    name: '小林 花',
    email: 'hana.kobayashi@example.com',
    campus: '青山',
    instruments: ['ボーカル', 'ピアノ/キーボード'],
    preferredRole1: 'ボーカル',
    preferredRole2: 'ピアノ/キーボード',
    monthlyServiceCount: 1,
    totalServiceCount: 12,
    availableWeekdays: ['木'],
    avatarUrl: avatar('小林', 7),
    joinedYear: 2025,
    serviceHistory: history('m8', [
      { date: '2026-05-15', campus: '青山', role: 'ボーカル', eventName: '主日礼拝' },
    ]),
  },
  {
    id: 'm9',
    name: '加藤 拓也',
    email: 'takuya.kato@example.com',
    campus: '青山',
    instruments: ['アコースティックギター'],
    preferredRole1: 'アコースティックギター',
    preferredRole2: 'アコースティックギター',
    monthlyServiceCount: 2,
    totalServiceCount: 22,
    availableWeekdays: ['木', '金'],
    avatarUrl: avatar('加藤', 0),
    joinedYear: 2023,
    serviceHistory: history('m9', [
      { date: '2026-05-23', campus: '青山', role: 'アコースティックギター', eventName: '主日礼拝' },
      { date: '2026-05-02', campus: '青山', role: 'アコースティックギター', eventName: '主日礼拝' },
    ]),
  },
  {
    id: 'm10',
    name: '山本 直樹',
    email: 'naoki.yamamoto@example.com',
    campus: '相模原',
    instruments: ['PA', 'エレキギター'],
    preferredRole1: 'PA',
    preferredRole2: 'エレキギター',
    monthlyServiceCount: 3,
    totalServiceCount: 61,
    availableWeekdays: ['木', '金'],
    avatarUrl: avatar('山本', 1),
    joinedYear: 2019,
    serviceHistory: history('m10', [
      { date: '2026-05-22', campus: '相模原', role: 'PA', eventName: '主日礼拝' },
      { date: '2026-05-15', campus: '相模原', role: 'エレキギター', eventName: '主日礼拝' },
      { date: '2026-05-08', campus: '相模原', role: 'PA', eventName: '主日礼拝' },
    ]),
  },
]

export const mockUsers = mockMembers.map((m) => ({
  email: m.email,
  name: m.name,
  memberId: m.id,
}))

export const HIGH_SERVICE_THRESHOLD = 3

function getNextWeekday(targetDay: number): string {
  const today = new Date()
  const currentDay = today.getDay()
  const daysUntil = (targetDay - currentDay + 7) % 7 || 7
  const next = new Date(today)
  next.setDate(today.getDate() + daysUntil)
  return next.toISOString().split('T')[0]
}

/** 次回の木曜日 */
export function getNextThursday(): string {
  return getNextWeekday(4)
}

/** 次回の金曜日 */
export function getNextFriday(): string {
  return getNextWeekday(5)
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

/** AI チャット用モック応答生成 */
export function generateMockChatResponse(query: string, members: Member[]): string {
  const lower = query.toLowerCase()

  if (lower.includes('青山') && (lower.includes('アコ') || lower.includes('アコースティック'))) {
    const targetDay: Weekday = lower.includes('木') ? '木' : '金'
    const candidates = members.filter(
      (m) =>
        m.campus === '青山' &&
        m.instruments.includes('アコースティックギター') &&
        m.availableWeekdays.includes(targetDay),
    )
    if (candidates.length === 0) return '条件に合うメンバーが見つかりませんでした。'
    const top3 = candidates.slice(0, 3)
    const dayLabel = targetDay === '木' ? '木曜日' : '金曜日'
    return `来週${dayLabel}・青山でアコースティックギターが可能なメンバー：\n\n${top3
      .map(
        (m, i) =>
          `${i + 1}. **${m.name}**（今月 ${m.monthlyServiceCount} 回 / 通算 ${m.totalServiceCount} 回）`,
      )
      .join('\n')}\n\n※ 奉仕回数のバランスを考慮すると、${top3.sort((a, b) => a.monthlyServiceCount - b.monthlyServiceCount)[0]?.name} さんがおすすめです。`
  }

  if (lower.includes('ボーカル')) {
    const vocalists = members.filter((m) => m.instruments.includes('ボーカル'))
    return `ボーカル可能なメンバーは ${vocalists.length} 名います：\n\n${vocalists
      .slice(0, 5)
      .map((m) => `• ${m.name}（${m.campus} / 今月 ${m.monthlyServiceCount} 回）`)
      .join('\n')}`
  }

  if (lower.includes('今月') && lower.includes('多い')) {
    const sorted = [...members].sort((a, b) => b.monthlyServiceCount - a.monthlyServiceCount)
    return `今月の奉仕回数が多いメンバー TOP3：\n\n${sorted
      .slice(0, 3)
      .map((m, i) => `${i + 1}. ${m.name} — ${m.monthlyServiceCount} 回`)
      .join('\n')}`
  }

  return `ご質問「${query}」について、スプレッドシートのデータを参照しました。\n\n奉仕者カタログ画面でフィルターを使うか、より具体的な条件（キャンパス・曜日・楽器）をお知らせください。`
}
