/**

 * GAS Web API 連携

 *

 * 環境変数:

 * - VITE_GAS_API_URL … デプロイ済み Web アプリ URL（末尾 /exec）

 */



import type { Member, ProfileUpdatePayload, ServiceRegistration } from '../types'

import { GAS_API_URL } from '../config/env'

import { mockMembers, generateMockChatResponse } from '../data/mockData'

import { gasGet, gasPost } from './gasFetch'



/** 全メンバー取得 — GAS: GET getMembers */

export async function fetchMembers(): Promise<Member[]> {

  if (!GAS_API_URL) {

    await delay(300)

    return [...mockMembers]

  }



  return gasGet<Member[]>({ action: 'getMembers' })

}



/** メールアドレスでメンバー取得 — GAS: GET getMemberByEmail */

export async function fetchMemberByEmail(email: string): Promise<Member | null> {

  if (!GAS_API_URL) {

    await delay(400)

    return mockMembers.find((m) => m.email === email) ?? null

  }



  const data = await gasGet<Member | null>({

    action: 'getMemberByEmail',

    email: email.trim(),

  })

  return data

}



/** 奉仕登録 — GAS: POST registerService */

export async function registerService(data: Omit<ServiceRegistration, 'id'>): Promise<ServiceRegistration> {

  if (!GAS_API_URL) {

    await delay(500)

    return { ...data, id: `svc-${Date.now()}` }

  }



  return gasPost<ServiceRegistration>('registerService', data as unknown as Record<string, unknown>)

}



/** 一括奉仕登録 — GAS: POST registerServicesBulk */

export async function registerServicesBulk(

  registrations: Omit<ServiceRegistration, 'id'>[],

): Promise<ServiceRegistration[]> {

  if (!GAS_API_URL) {

    await delay(500)

    return registrations.map((r, i) => ({

      ...r,

      id: `svc-${Date.now()}-${i}`,

    }))

  }



  return gasPost<ServiceRegistration[]>('registerServicesBulk', { registrations })

}



/** 初回ログイン：名簿メンバーと Google メールを紐づけ — GAS: GET linkAccount */
export async function linkAccount(memberId: string, newEmail: string): Promise<Member> {
  if (!GAS_API_URL) {
    await delay(500)
    const normalized = newEmail.trim().toLowerCase()
    const duplicate = mockMembers.find(
      (m) => m.email.trim().toLowerCase() === normalized && m.id !== memberId,
    )
    if (duplicate) {
      throw new Error('このメールアドレスは既に別のメンバーに紐づけられています')
    }
    const index = mockMembers.findIndex((m) => m.id === memberId)
    if (index < 0) throw new Error('Member not found')
    mockMembers[index] = { ...mockMembers[index], email: newEmail.trim() }
    return { ...mockMembers[index] }
  }

  return gasGet<Member>({
    action: 'linkAccount',
    memberId,
    newEmail: newEmail.trim(),
  })
}



/** プロフィール更新 — GAS: POST updateProfile */

export async function updateProfile(email: string, payload: ProfileUpdatePayload): Promise<Member> {

  if (!GAS_API_URL) {

    await delay(600)

    const member = mockMembers.find((m) => m.email === email)

    if (!member) throw new Error('Member not found')

    return { ...member, ...payload, avatarUrl: payload.avatarBase64 ?? member.avatarUrl }

  }



  return gasPost<Member>('updateProfile', { email, ...payload })

}



/** アバター画像アップロード — GAS: POST uploadAvatar */

export async function uploadAvatar(email: string, base64Image: string): Promise<string> {

  if (!GAS_API_URL) {

    await delay(800)

    const member = mockMembers.find((m) => m.email === email)

    if (!member) throw new Error('Member not found')

    member.avatarUrl = base64Image

    return base64Image

  }



  const data = await gasPost<{ url: string }>('uploadAvatar', { email, image: base64Image })

  return data.url

}



/** AI チャット — GAS: POST chat */

export async function sendChatQuery(query: string): Promise<string> {

  if (!GAS_API_URL) {

    await delay(1200)

    return generateMockChatResponse(query, mockMembers)

  }



  const data = await gasPost<{ response: string }>('chat', { query })

  return data.response

}



function delay(ms: number): Promise<void> {

  return new Promise((resolve) => setTimeout(resolve, ms))

}


