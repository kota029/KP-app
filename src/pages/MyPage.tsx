import { useAuth } from '../contexts/AuthContext'
import { LoginScreen } from '../components/auth/LoginScreen'
import { AvatarUpload } from '../components/mypage/AvatarUpload'
import { Dashboard } from '../components/mypage/Dashboard'
import { ProfileForm } from '../components/mypage/ProfileForm'

export function MyPage() {
  const { isLoggedIn, member, updateMember } = useAuth()

  if (!isLoggedIn || !member) {
    return <LoginScreen />
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <AvatarUpload
          avatarUrl={member.avatarUrl}
          name={member.name}
          onAvatarChange={(url) => updateMember({ ...member, avatarUrl: url })}
        />
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-slate-900">{member.name}</h2>
          <p className="text-sm text-slate-500">{member.email}</p>
          <p className="mt-1 text-sm text-brand-600">{member.campus}</p>
        </div>
      </div>

      <Dashboard member={member} />

      <div className="mt-6">
        <ProfileForm
          member={member}
          onUpdated={(updated) => updateMember(updated)}
        />
      </div>
    </div>
  )
}
