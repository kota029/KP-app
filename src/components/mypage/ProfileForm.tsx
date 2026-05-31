import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import type { Campus, Instrument, Member, Weekday } from '../../types'
import { CAMPUSES, INSTRUMENTS, WEEKDAYS, WEEKDAY_LABELS } from '../../data/mockData'
import { updateProfile } from '../../api/client'
import { useAuth } from '../../contexts/AuthContext'

interface ProfileFormProps {
  member: Member
  onUpdated: (member: Member) => void
}

export function ProfileForm({ member, onUpdated }: ProfileFormProps) {
  const { email } = useAuth()
  const [name, setName] = useState(member.name)
  const [campus, setCampus] = useState(member.campus)
  const [instruments, setInstruments] = useState<Instrument[]>(member.instruments)
  const [weekdays, setWeekdays] = useState<Weekday[]>(member.availableWeekdays)
  const [bio, setBio] = useState(member.bio ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [instrumentError, setInstrumentError] = useState<string | null>(null)

  const toggleInstrument = (item: Instrument) => {
    setInstrumentError(null)
    setInstruments((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    )
  }

  const toggleWeekday = (day: Weekday) => {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    if (instruments.length === 0) {
      setInstrumentError('やりたい楽器を1つ以上選択してください')
      return
    }

    setSaving(true)
    setSaved(false)
    setInstrumentError(null)

    try {
      const updated = await updateProfile(email, {
        name,
        campus,
        instruments,
        availableWeekdays: weekdays,
        bio,
      })
      onUpdated(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-sm font-semibold text-slate-800">プロフィール編集</h3>
      <p className="mt-1 text-xs text-slate-500">変更内容はスプレッドシートへ書き戻されます（GAS連携想定）</p>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-slate-600">氏名</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-slate-600">所属キャンパス</span>
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

        <div>
          <span className="mb-2 block text-xs font-medium text-slate-600">やりたい楽器</span>
          <div className="flex flex-wrap gap-1.5">
            {INSTRUMENTS.map((item) => {
              const selected = instruments.includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleInstrument(item)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    selected
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item}
                </button>
              )
            })}
          </div>
          {instrumentError && (
            <p className="mt-2 text-xs text-red-600">{instrumentError}</p>
          )}
        </div>

        <div>
          <span className="mb-2 block text-xs font-medium text-slate-600">参加可能曜日</span>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleWeekday(day)}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition ${
                  weekdays.includes(day)
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {WEEKDAY_LABELS[day]}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-slate-600">自己紹介</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            placeholder="奉仕の希望や得意なことなど..."
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            保存中...
          </>
        ) : saved ? (
          '保存しました ✓'
        ) : (
          <>
            <Save className="h-4 w-4" />
            更新する
          </>
        )}
      </button>
    </form>
  )
}
