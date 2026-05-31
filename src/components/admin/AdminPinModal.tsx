import { useEffect, useRef, useState } from 'react'
import { Lock, X } from 'lucide-react'
import { isValidAdminRegisterPin } from '../../config/adminPin'

interface AdminPinModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  onError?: (message: string) => void
}

const PIN_LENGTH = 4

export function AdminPinModal({ open, onClose, onSuccess, onError }: AdminPinModalProps) {
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(''))
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!open) return
    setDigits(Array(PIN_LENGTH).fill(''))
    setError(null)
    const timer = window.setTimeout(() => inputRefs.current[0]?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [open])

  if (!open) return null

  const pin = digits.join('')

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    setError(null)

    if (digit && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH)
    if (!pasted) return

    const next = Array(PIN_LENGTH)
      .fill('')
      .map((_, i) => pasted[i] ?? '')
    setDigits(next)
    setError(null)

    const focusIndex = Math.min(pasted.length, PIN_LENGTH - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleSubmit = () => {
    if (pin.length !== PIN_LENGTH) {
      setError('4桁のパスワードを入力してください')
      return
    }

    if (!isValidAdminRegisterPin(pin)) {
      const message = 'パスワードが正しくありません'
      setError(message)
      onError?.(message)
      setDigits(Array(PIN_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
      return
    }

    onSuccess()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-pin-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h3 id="admin-pin-title" className="text-base font-semibold text-slate-900">
                登録パスワード
              </h3>
              <p className="text-xs text-slate-500">4桁の数字を入力してください</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="h-12 w-11 rounded-xl border border-slate-200 text-center text-lg font-semibold tracking-widest outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              aria-label={`パスワード ${index + 1} 桁目`}
            />
          ))}
        </div>

        {error && (
          <p className="mt-3 text-center text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pin.length !== PIN_LENGTH}
            className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            確定
          </button>
        </div>
      </div>
    </div>
  )
}
