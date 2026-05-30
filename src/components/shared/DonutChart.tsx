export const CHART_COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#1d4ed8']

interface DonutChartProps {
  data: { label: string; value: number; color: string }[]
}

export function DonutChart({ data }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) return null

  let cumulative = 0
  const segments = data.map((d) => {
    const start = cumulative
    cumulative += (d.value / total) * 100
    return { ...d, start, end: cumulative }
  })

  const gradient = segments.map((s) => `${s.color} ${s.start}% ${s.end}%`).join(', ')

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div
        className="relative h-32 w-32 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white">
          <span className="text-2xl font-bold text-slate-800">{total}</span>
          <span className="text-[10px] text-slate-500">回</span>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-sm text-slate-700">{d.label}</span>
            <span className="text-sm font-medium text-slate-900">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function buildRoleChartData(serviceHistory: { role: string }[]) {
  const roleCounts = serviceHistory.reduce<Record<string, number>>((acc, r) => {
    acc[r.role] = (acc[r.role] ?? 0) + 1
    return acc
  }, {})

  return Object.entries(roleCounts).map(([label, value], i) => ({
    label,
    value,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }))
}
