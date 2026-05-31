import { useMemo } from 'react'
import type { Member } from '../../types'
import {
  buildTotalServiceHistogram,
  isBinInRange,
} from '../../utils/serviceCountHistogram'

interface TotalServiceCountFilterProps {
  members: Member[]
  min: number
  max: number | null
  onChange: (min: number, max: number | null) => void
}

export function TotalServiceCountFilter({
  members,
  min,
  max,
  onChange,
}: TotalServiceCountFilterProps) {
  const counts = useMemo(
    () => members.map((m) => m.totalServiceCount),
    [members],
  )

  const { bins, dataMax } = useMemo(
    () => buildTotalServiceHistogram(counts),
    [counts],
  )

  const maxSlider = max ?? dataMax
  const maxBin = Math.max(...bins.map((b) => b.count), 1)

  const setMin = (value: number) => {
    const nextMin = Math.min(value, maxSlider)
    onChange(nextMin, max)
  }

  const setMax = (value: number) => {
    const clamped = Math.max(value, min)
    const nextMax = clamped >= dataMax ? null : clamped
    onChange(min, nextMax)
  }

  const rangeLabel =
    max === null
      ? `${min} 回 〜 制限なし`
      : min === max
        ? `${min} 回`
        : `${min} 回 〜 ${max} 回`

  const isActive = min > 0 || max !== null

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          通算奉仕回数
        </h3>
        {isActive && (
          <button
            type="button"
            onClick={() => onChange(0, null)}
            className="text-[10px] font-medium text-brand-600 hover:text-brand-700"
          >
            クリア
          </button>
        )}
      </div>

      {/* 分布棒グラフ（名簿全員） */}
      <div
        className="mb-3 flex h-14 items-end gap-px rounded-lg bg-slate-50 px-1 pt-2"
        aria-hidden
      >
        {bins.map((bin, i) => {
          const inRange = isBinInRange(bin, min, max, dataMax)
          const heightPct = bin.count === 0 ? 4 : (bin.count / maxBin) * 100
          return (
            <div
              key={i}
              className="flex flex-1 flex-col justify-end"
              title={`${bin.start}–${bin.end}回: ${bin.count}名`}
            >
              <div
                className={`w-full min-h-[2px] rounded-t transition-colors ${
                  inRange ? 'bg-brand-400/70' : 'bg-brand-200/50'
                }`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
          )
        })}
      </div>

      <p className="mb-3 text-center text-xs font-medium text-slate-700">{rangeLabel}</p>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 flex justify-between text-[10px] text-slate-500">
            <span>下限（以上）</span>
            <span>{min} 回</span>
          </span>
          <input
            type="range"
            min={0}
            max={dataMax}
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            className="h-2 w-full cursor-pointer accent-brand-600"
            aria-label="通算奉仕回数の下限"
          />
        </label>

        <label className="block">
          <span className="mb-1 flex justify-between text-[10px] text-slate-500">
            <span>上限（以下）</span>
            <span>{max === null ? '制限なし' : `${max} 回`}</span>
          </span>
          <input
            type="range"
            min={0}
            max={dataMax}
            value={maxSlider}
            onChange={(e) => setMax(Number(e.target.value))}
            className="h-2 w-full cursor-pointer accent-brand-600"
            aria-label="通算奉仕回数の上限"
          />
        </label>
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
        棒グラフは名簿全員の分布です。右端まで引くと上限なしになります。
      </p>
    </div>
  )
}
