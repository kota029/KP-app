import { useRef, useState, useEffect } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { uploadAvatar } from '../../api/client'
import { useAuth } from '../../contexts/AuthContext'

interface AvatarUploadProps {
  avatarUrl: string
  name: string
  onAvatarChange: (url: string) => void
}

export function AvatarUpload({ avatarUrl, name, onAvatarChange }: AvatarUploadProps) {
  const { email } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(avatarUrl)

  useEffect(() => {
    setPreviewUrl(avatarUrl)
  }, [avatarUrl])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !email) return

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string
      setPreviewUrl(base64)
      setUploading(true)

      try {
        // GAS へ Base64 画像を送信する想定
        const url = await uploadAvatar(email, base64)
        onAvatarChange(url)
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative h-24 w-24 overflow-hidden rounded-2xl border-4 border-white shadow-lg sm:h-28 sm:w-28"
      >
        <img src={previewUrl} alt={name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
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
        className="mt-2 block w-full text-center text-xs font-medium text-brand-600 hover:text-brand-700"
      >
        画像を変更
      </button>
    </div>
  )
}
