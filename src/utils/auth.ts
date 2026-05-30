const AUTH_STORAGE_KEY = 'acf_auth_email'

/** ダミー／未紐づけメール（初回ログイン対象） */
export function isUnlinkedEmail(email: string): boolean {
  const e = email.trim().toLowerCase()
  if (!e) return true
  if (e.includes('@example.com')) return true
  if (e.startsWith('dummy-')) return true
  return false
}

export function getStoredAuthEmail(): string | null {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredAuthEmail(email: string): void {
  localStorage.setItem(AUTH_STORAGE_KEY, email)
}

export function clearStoredAuthEmail(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

/** Google ID トークン（JWT）からメール等を取得 */
export function parseGoogleCredential(credential: string): {
  email: string
  name?: string
  picture?: string
} {
  const payload = credential.split('.')[1]
  if (!payload) throw new Error('Invalid Google credential')
  const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  if (!json.email) throw new Error('Google account has no email')
  return {
    email: String(json.email),
    name: json.name,
    picture: json.picture,
  }
}
