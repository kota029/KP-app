import { useState, useEffect } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { GOOGLE_CLIENT_ID, hasGoogleOAuth, isGasEnabled } from './config/env'
import type { TabId, Member } from './types'
import { AuthProvider } from './contexts/AuthContext'
import { CompositionProvider, useComposition } from './contexts/CompositionContext'
import { Header } from './components/layout/Header'
import { Navigation } from './components/layout/Navigation'
import { CatalogPage } from './pages/CatalogPage'
import { CompositionPage } from './pages/CompositionPage'
import { AdminPage } from './pages/AdminPage'
import { MyPage } from './pages/MyPage'
import { ChatWidget } from './components/chat/ChatWidget'
import { fetchMembers } from './api/client'
import { CheckCircle, AlertCircle, Info } from 'lucide-react'

function NotificationToast() {
  const { notification, clearNotification } = useComposition()
  if (!notification) return null

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  }
  const styles = {
    success: 'border-green-200 bg-green-50 text-green-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  }
  const Icon = icons[notification.type]

  return (
    <div className="fixed bottom-24 left-1/2 z-50 w-[min(400px,calc(100vw-2rem))] -translate-x-1/2 animate-slide-up">
      <div
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ${styles[notification.type]}`}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <p className="flex-1 text-sm font-medium">{notification.message}</p>
        <button
          type="button"
          onClick={clearNotification}
          className="text-xs opacity-60 hover:opacity-100"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('catalog')
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    fetchMembers()
      .then((data) => {
        setMembers(data)
        setLoadError(null)
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : 'データの取得に失敗しました')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onSignInClick={() => setActiveTab('mypage')} />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {!isGasEnabled && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
          デモモード（10名）: Vercel の環境変数 <code className="rounded bg-amber-100 px-1">VITE_GAS_API_URL</code>{' '}
          が未設定です。設定後に再デプロイしてください。
        </div>
      )}

      {loadError && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-800">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : (
        <>
          {activeTab === 'catalog' && (
            <CatalogPage members={members} onTabChange={setActiveTab} />
          )}
          {activeTab === 'composition' && <CompositionPage members={members} />}
          {activeTab === 'admin' && <AdminPage members={members} />}
          {activeTab === 'mypage' && <MyPage />}
        </>
      )}

      <NotificationToast />
      <ChatWidget />
    </div>
  )
}

export default function App() {
  const app = (
    <AuthProvider>
      <CompositionProvider>
        <AppContent />
      </CompositionProvider>
    </AuthProvider>
  )

  if (!hasGoogleOAuth) return app

  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{app}</GoogleOAuthProvider>
}
