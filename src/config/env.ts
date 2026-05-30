/** Vite 環境変数（.env で設定、変更後は dev サーバー再起動が必要） */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
export const GAS_API_URL = import.meta.env.VITE_GAS_API_URL ?? ''

export const hasGoogleOAuth = GOOGLE_CLIENT_ID.length > 0

/** GAS が有効か（ビルド時に VITE_GAS_API_URL が埋め込まれているか） */
export const isGasEnabled = GAS_API_URL.length > 0

/**
 * ブラウザ → GAS は CORS で失敗しやすいため、常に同一オリジンの /gas-api 経由にする。
 * - 開発: vite.config.ts の proxy
 * - 本番: vercel.json の rewrite → script.google.com
 */
export function getGasRequestBase(): string {
  if (!isGasEnabled) return ''
  return '/gas-api'
}
