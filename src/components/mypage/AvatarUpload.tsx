import { useRef, useState, useEffect } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { uploadAvatar } from '../../api/client'
import { useAuth } from '../../contexts/AuthContext'
import { useComposition } from '../../contexts/CompositionContext'
import { resizeImageForAvatar } from '../../utils/imageResize'

interface AvatarUploadProps {
  avatarUrl: string
  name: string
  onAvatarChange: (url: string) => void
}

export function AvatarUpload({ avatarUrl, name, onAvatarChange }: AvatarUploadProps) {
  const { email } = useAuth()
  const { showNotification } = useComposition()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(avatarUrl)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setPreviewUrl(avatarUrl)
  }, [avatarUrl])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !email) return

    setError(null)
    setUploading(true)

    try {
      const compressed = await resizeImageForAvatar(file)
      setPreviewUrl(compressed)

      const url = await uploadAvatar(email, compressed)
      onAvatarChange(url)
      showNotification('プロフィール画像を更新しました', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : '画像のアップロードに失敗しました'
      setError(message)
      setPreviewUrl(avatarUrl)
      showNotification(message, 'error')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative h-24 w-24 overflow-hidden rounded-2xl border-4 border-white shadow-lg disabled:opacity-70 sm:h-28 sm:w-28"
      >
        <img src={previewUrl} alt={name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100 group-disabled:opacity-100">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="mt-2 block w-full text-center text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
      >
        画像を変更
      </button>

      {error && (
        <p className="mt-1 max-w-[7rem] text-center text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
