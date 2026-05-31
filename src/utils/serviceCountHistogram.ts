/** 通算奉仕回数の分布ヒストグラム（名簿全員ベース） */
export interface HistogramBin {
  start: number
  end: number
  count: number
}

export function buildTotalServiceHistogram(
  counts: number[],
  binCount = 20,
): { bins: HistogramBin[]; dataMax: number } {
  if (counts.length === 0) {
    return { bins: [], dataMax: 0 }
  }

  const dataMax = Math.max(...counts, 0)
  const maxEdge = Math.max(dataMax, 1)
  const bins: HistogramBin[] = []

  for (let i = 0; i < binCount; i++) {
    const start = Math.floor((i / binCount) * maxEdge)
    const end = i === binCount - 1 ? maxEdge : Math.floor(((i + 1) / binCount) * maxEdge) - 1
    bins.push({ start, end: Math.max(start, end), count: 0 })
  }

  counts.forEach((count) => {
    const idx = Math.min(
      binCount - 1,
      Math.floor((count / (maxEdge + 1)) * binCount),
    )
    bins[idx].count += 1
  })

  return { bins, dataMax }
}

export function isBinInRange(
  bin: HistogramBin,
  min: number,
  max: number | null,
  dataMax: number,
): boolean {
  const upper = max ?? dataMax
  return bin.end >= min && bin.start <= upper
}
