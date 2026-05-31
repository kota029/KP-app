/** 奉仕一括登録用 PIN（フロントのみの簡易ガード。ソースに含まれるため完全な秘匿ではない） */
export const ADMIN_REGISTER_PIN = '0601'

export function isValidAdminRegisterPin(input: string): boolean {
  return input === ADMIN_REGISTER_PIN
}
