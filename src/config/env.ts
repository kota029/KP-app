/** Vite 環境変数（.env で設定、変更後は dev サーバー再起動が必要） */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
export const GAS_API_URL = import.meta.env.VITE_GAS_API_URL ?? ''

export const hasGoogleOAuth = GOOGLE_CLIENT_ID.length > 0

/**
 * ブラウザから GAS へ直接 fetch すると CORS で失敗することがあるため、
 * 開発時は Vite プロキシ (/gas-api) 経由で同一オリジンに見せる。
 */
export function getGasRequestBase(): string {
  if (!GAS_API_URL) return ''
  if (import.meta.env.DEV) return '/gas-api'
  return GAS_API_URL
}
