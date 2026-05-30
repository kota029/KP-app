import {

  createContext,

  useContext,

  useState,

  useCallback,

  useEffect,

  type ReactNode,

} from 'react'

import type { Member } from '../types'

import { fetchMemberByEmail, linkAccount } from '../api/client'

import {

  clearStoredAuthEmail,

  getStoredAuthEmail,

  parseGoogleCredential,

  setStoredAuthEmail,

} from '../utils/auth'



export type AuthStatus = 'initializing' | 'anonymous' | 'authenticated'



interface AuthContextValue {

  status: AuthStatus

  isLoggedIn: boolean

  email: string | null

  member: Member | null

  /** Google ID トークンでログイン（初回は memberId 必須） */

  signInWithGoogle: (credential: string, selectedMemberId?: string) => Promise<void>

  /** OAuth 未設定時のデモ紐づけ */

  signInWithDemo: (memberId: string, email: string) => Promise<void>

  logout: () => void

  updateMember: (member: Member) => void

}



const AuthContext = createContext<AuthContextValue | null>(null)



function persistSession(member: Member) {

  setStoredAuthEmail(member.email)

}



export function AuthProvider({ children }: { children: ReactNode }) {

  const [status, setStatus] = useState<AuthStatus>('initializing')

  const [email, setEmail] = useState<string | null>(null)

  const [member, setMember] = useState<Member | null>(null)



  const applySession = useCallback((m: Member) => {

    setEmail(m.email)

    setMember(m)

    setStatus('authenticated')

    persistSession(m)

  }, [])



  const clearSession = useCallback(() => {

    setEmail(null)

    setMember(null)

    setStatus('anonymous')

    clearStoredAuthEmail()

  }, [])



  useEffect(() => {

    const stored = getStoredAuthEmail()

    if (!stored) {

      setStatus('anonymous')

      return

    }



    fetchMemberByEmail(stored)

      .then((m) => {

        if (m) {

          setEmail(m.email)

          setMember(m)

          setStatus('authenticated')

        } else {

          clearStoredAuthEmail()

          setStatus('anonymous')

        }

      })

      .catch(() => {

        clearStoredAuthEmail()

        setStatus('anonymous')

      })

  }, [])



  const signInWithGoogle = useCallback(
    async (credential: string, selectedMemberId?: string) => {
      const { email: googleEmail } = parseGoogleCredential(credential)

      try {
        let found = await fetchMemberByEmail(googleEmail)
        if (found) {
          applySession(found)
          return
        }

        if (!selectedMemberId) {
          throw new Error(
            '名簿に未登録のGoogleアカウントです。初回の方は、上で自分の名前を選んでからサインインしてください。',
          )
        }

        found = await linkAccount(selectedMemberId, googleEmail)
        applySession(found)
      } catch (err) {
        throw err
      }
    },
    [applySession],
  )



  const signInWithDemo = useCallback(

    async (memberId: string, demoEmail: string) => {

      const normalized = demoEmail.trim().toLowerCase()



      let found = await fetchMemberByEmail(normalized)

      if (found) {

        applySession(found)

        return

      }



      found = await linkAccount(memberId, normalized)

      applySession(found)

    },

    [applySession],

  )



  const logout = useCallback(() => {

    clearSession()

  }, [clearSession])



  const updateMember = useCallback((updated: Member) => {

    setMember(updated)

    if (updated.email !== email) {

      setEmail(updated.email)

      persistSession(updated)

    }

  }, [email])



  return (

    <AuthContext.Provider

      value={{

        status,

        isLoggedIn: status === 'authenticated',

        email,

        member,

        signInWithGoogle,

        signInWithDemo,

        logout,

        updateMember,

      }}

    >

      {children}

    </AuthContext.Provider>

  )

}



export function useAuth() {

  const ctx = useContext(AuthContext)

  if (!ctx) throw new Error('useAuth must be used within AuthProvider')

  return ctx

}


