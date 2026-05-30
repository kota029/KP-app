import { MapPin, Calendar, Plus } from 'lucide-react'
import type { Member } from '../../types'

interface MemberCardProps {
  member: Member
  onClick: () => void
  onAddToComposition: () => void
  index: number
}

export function MemberCard({ member, onClick, onAddToComposition, index }: MemberCardProps) {
  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <button type="button" onClick={onClick} className="flex flex-1 flex-col text-left">
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          <img
            src={member.avatarUrl}
            alt={member.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition group-hover:opacity-100" />
          <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur-sm">
            今月 {member.monthlyServiceCount} 回
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="text-base font-semibold text-slate-900">{member.name}</h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span>{member.campus}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {member.instruments.map((inst) => (
              <span
                key={inst}
                className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700"
              >
                {inst}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center gap-1 pt-3 text-xs text-slate-400">
            <Calendar className="h-3 w-3" />
            <span>通算 {member.totalServiceCount} 回</span>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onAddToComposition()
        }}
        className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-brand-700 opacity-0 shadow-sm backdrop-blur-sm transition hover:bg-brand-50 group-hover:opacity-100"
        title="構成に追加"
      >
        <Plus className="h-3 w-3" />
        構成
      </button>
    </div>
  )
}
