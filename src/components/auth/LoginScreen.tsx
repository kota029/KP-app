import { useEffect, useState } from 'react'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { Link2, Loader2, LogIn, UserCircle } from 'lucide-react'
import type { Member } from '../../types'
import { fetchMembers } from '../../api/client'
import { hasGoogleOAuth } from '../../config/env'
import { isUnlinkedEmail } from '../../utils/auth'
import { useAuth } from '../../contexts/AuthContext'

interface LoginScreenProps {
  /** ログイン成功後にマイページへ誘導済みの場合のコールバック */
  onSuccess?: () => void
}

export function LoginScreen({ onSuccess }: LoginScreenProps) {
  const { signInWithGoogle, signInWithDemo, status } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [demoEmail, setDemoEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMembers()
      .then((data) => setMembers(data))
      .finally(() => setLoadingMembers(false))
  }, [])

  const unlinkedMembers = members.filter((m) => isUnlinkedEmail(m.email))
  const hasUnlinked = unlinkedMembers.length > 0

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError('Googleサインインに失敗しました')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await signInWithGoogle(response.credential, selectedMemberId || undefined)
      onSuccess?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ログインに失敗しました')
    } finally {
      setBusy(false)
    }
  }

  const handleDemoLink = async () => {
    if (!selectedMemberId) {
      setError('名簿から自分の名前を選択してください')
      return
    }
    const email = demoEmail.trim()
    if (!email || !email.includes('@')) {
      setError('Googleアカウントのメールアドレスを入力してください')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await signInWithDemo(selectedMemberId, email)
      onSuccess?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : '紐づけに失敗しました')
    } finally {
      setBusy(false)
    }
  }

  if (status === 'initializing') {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-14">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
          <LogIn className="h-7 w-7 text-brand-600" />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-slate-900">ログイン</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          初回は名簿から自分の名前を選び、Googleアカウントと紐づけます。
          <br />
          2回目以降はGoogleサインインだけでマイページに入れます。
        </p>
      </div>

      <div className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        {hasUnlinked && (
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <UserCircle className="h-4 w-4 text-brand-600" />
              初回の方：名簿から名前を選択
            </label>
            <p className="mt-1 text-xs text-slate-500">
              まだGoogleアカウントと紐づいていないメンバー（{unlinkedMembers.length}名）から選んでください
            </p>
            {loadingMembers ? (
              <div className="mt-3 flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : (
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              >
                <option value="">— 名前を選択 —</option>
                {unlinkedMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}（{m.campus}）
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {!hasUnlinked && !loadingMembers && (
          <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
            名簿の紐づけは完了しています。Googleでサインインしてください。
          </p>
        )}

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Link2 className="h-4 w-4 text-brand-600" />
            Googleでサインイン
          </label>

          {hasGoogleOAuth ? (
            <div className="mt-4 flex justify-center">
              {busy ? (
                <div className="flex items-center gap-2 py-3 text-sm text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  認証中...
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Googleサインインに失敗しました')}
                  text="signin_with"
                  shape="rectangular"
                  size="large"
                />
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-3 rounded-xl border border-dashed border-amber-200 bg-amber-50/50 p-4">
              <p className="text-xs text-amber-800">
                <code className="rounded bg-amber-100 px-1">VITE_GOOGLE_CLIENT_ID</code>{' '}
                未設定のためデモモードです。本番では Google OAuth を設定してください。
              </p>
              <input
                type="email"
                value={demoEmail}
                onChange={(e) => setDemoEmail(e.target.value)}
                placeholder="your@gmail.com"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="button"
                disabled={busy}
                onClick={handleDemoLink}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {hasUnlinked ? '紐づけてログイン（デモ）' : 'ログイン（デモ）'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
