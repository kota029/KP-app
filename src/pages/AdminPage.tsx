import { useState } from 'react'
import type { Member, ServiceRegistration } from '../types'
import { BulkServiceForm } from '../components/admin/BulkServiceForm'
import { CheckCircle } from 'lucide-react'

interface AdminPageProps {
  members: Member[]
}

export function AdminPage({ members }: AdminPageProps) {
  const [recentRegistrations, setRecentRegistrations] = useState<ServiceRegistration[]>([])

  const handleRegistered = (registrations: ServiceRegistration[]) => {
    setRecentRegistrations((prev) => [...registrations, ...prev].slice(0, 10))
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <BulkServiceForm members={members} onRegistered={handleRegistered} />

      {recentRegistrations.length > 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-green-800">
            <CheckCircle className="h-4 w-4" />
            最近の登録
          </div>
          <ul className="mt-2 space-y-1">
            {recentRegistrations.map((r) => (
              <li key={r.id} className="text-xs text-green-700">
                {r.date} · {r.campus} · {r.memberName}（{r.instrument}）
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
