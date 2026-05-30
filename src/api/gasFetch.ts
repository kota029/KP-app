import { getGasRequestBase } from '../config/env'

const GAS_NETWORK_ERROR =
  'GAS API に接続できません。dev サーバーを再起動し、VITE_GAS_API_URL が正しいか確認してください。'

const FETCH_TIMEOUT_MS = 90_000

function buildUrl(params: Record<string, string>): string {
  const base = getGasRequestBase()
  if (!base) throw new Error('VITE_GAS_API_URL is not configured')
  const qs = new URLSearchParams(params)
  return `${base}?${qs}`
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal, redirect: 'follow' })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('GAS API がタイムアウトしました。名簿・履歴が大きい場合は GAS 側の処理時間を確認してください。')
    }
    throw new Error(GAS_NETWORK_ERROR)
  } finally {
    clearTimeout(timer)
  }
}

/**
 * GAS Web App 向け GET。
 * linkAccount も GET で行い、POST の CORS プリフライトを避ける。
 */
export async function gasGet<T>(params: Record<string, string>): Promise<T> {
  const url = buildUrl(params)
  const res = await fetchWithTimeout(url, { method: 'GET' })
  return parseGasResponse<T>(res)
}

/**
 * GAS Web App 向け POST（text/plain で CORS プリフライト回避）。
 */
export async function gasPost<T>(action: string, body: Record<string, unknown>): Promise<T> {
  const base = getGasRequestBase()
  if (!base) throw new Error('VITE_GAS_API_URL is not configured')

  const url = `${base}?action=${encodeURIComponent(action)}`
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
  })
  return parseGasResponse<T>(res)
}

async function parseGasResponse<T>(res: Response): Promise<T> {
  const text = await res.text()

  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
    throw new Error(
      'GAS が HTML を返しました。ウェブアプリのデプロイ設定（アクセス: 全員）と URL（/exec）を確認してください。',
    )
  }

  let data: unknown
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    throw new Error(
      `GAS API の応答を解析できません（HTTP ${res.status}）。先頭: ${text.slice(0, 80)}`,
    )
  }

  if (data && typeof data === 'object' && 'error' in data && (data as { error: string }).error) {
    throw new Error((data as { error: string }).error)
  }

  if (!res.ok) {
    throw new Error(`GAS API error (HTTP ${res.status})`)
  }

  return data as T
}
