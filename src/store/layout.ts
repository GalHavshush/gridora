export interface GridPosition {
  x: number
  y: number
  w: number
  h: number
}

export const GRID_COLS = 12

const overlaps = (a: GridPosition, b: GridPosition) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

/** First top-left spot (row by row) where a w×h widget fits without overlapping anything. */
export function findFreeSpot(taken: GridPosition[], w: number, h: number, cols = GRID_COLS): GridPosition {
  const width = Math.min(w, cols)
  const bottom = Math.max(0, ...taken.map((p) => p.y + p.h))
  for (let y = 0; y <= bottom; y++) {
    for (let x = 0; x + width <= cols; x++) {
      const candidate = { x, y, w: width, h }
      if (!taken.some((p) => overlaps(p, candidate))) return candidate
    }
  }
  return { x: 0, y: bottom, w: width, h }
}
