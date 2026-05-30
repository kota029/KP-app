import type { ServiceRecord } from '../../types'

interface MemberActivityHistoryProps {
  records: ServiceRecord[]
}

export function MemberActivityHistory({ records }: MemberActivityHistoryProps) {
  if (records.length === 0) {
    return <p className="text-sm text-slate-400">活動履歴はありません</p>
  }

  return (
    <div className="divide-y divide-slate-100">
      {records.map((record) => (
        <div
          key={record.id}
          className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
        >
          <div>
            <p className="text-sm font-medium text-slate-800">{record.eventName}</p>
            <p className="text-xs text-slate-500">
              {record.date} · {record.campus}
            </p>
          </div>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
            {record.role}
          </span>
        </div>
      ))}
    </div>
  )
}
