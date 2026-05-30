import type { Member } from '../../types'
import { DonutChart, buildRoleChartData } from '../shared/DonutChart'
import { MemberActivityHistory } from '../shared/MemberActivityHistory'

interface DashboardProps {
  member: Member
}

export function Dashboard({ member }: DashboardProps) {
  const chartData = buildRoleChartData(member.serviceHistory)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">通算奉仕回数</p>
          <p className="mt-2 text-3xl font-bold text-brand-600">{member.totalServiceCount}</p>
          <p className="text-sm text-slate-500">回</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">今月の奉仕</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{member.monthlyServiceCount}</p>
          <p className="text-sm text-slate-500">回</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">所属</p>
          <p className="mt-2 text-lg font-bold text-slate-800">{member.campus}</p>
          {member.joinedYear && (
            <p className="text-sm text-slate-500">{member.joinedYear}年〜</p>
          )}
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-sm font-semibold text-slate-800">担当楽器の割合</h3>
          <div className="mt-4">
            <DonutChart data={chartData} />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-sm font-semibold text-slate-800">過去の活動履歴</h3>
        <div className="mt-4">
          <MemberActivityHistory records={member.serviceHistory} />
        </div>
      </div>
    </div>
  )
}
