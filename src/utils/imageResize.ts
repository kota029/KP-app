/** スプレッドシート 1 セル上限（余裕を持たせる） */
export const AVATAR_SHEET_CHAR_LIMIT = 49_000

const MAX_DIMENSION = 256
const INITIAL_QUALITY = 0.8

export async function resizeImageForAvatar(file: File): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file)
  const img = await loadImage(dataUrl)

  let width = img.width
  let height = img.height
  const maxSide = Math.max(width, height)
  if (maxSide > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / maxSide
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('画像の処理に失敗しました')

  ctx.drawImage(img, 0, 0, width, height)

  let quality = INITIAL_QUALITY
  let result = canvas.toDataURL('image/jpeg', quality)

  while (result.length > AVATAR_SHEET_CHAR_LIMIT && quality > 0.3) {
    quality -= 0.1
    result = canvas.toDataURL('image/jpeg', quality)
  }

  if (result.length > AVATAR_SHEET_CHAR_LIMIT) {
    canvas.width = Math.round(width * 0.7)
    canvas.height = Math.round(height * 0.7)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    result = canvas.toDataURL('image/jpeg', 0.7)
  }

  if (result.length > AVATAR_SHEET_CHAR_LIMIT) {
    throw new Error('画像が大きすぎます。別の画像を選んでください。')
  }

  return result
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('画像の読み込みに失敗しました'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('画像の読み込みに失敗しました'))
    img.src = src
  })
}
