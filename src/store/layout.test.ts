import { describe, expect, it } from 'vitest'
import { findFreeSpot } from './layout'

describe('findFreeSpot', () => {
  it('uses the top-left corner of an empty grid', () => {
    expect(findFreeSpot([], 4, 2)).toEqual({ x: 0, y: 0, w: 4, h: 2 })
  })

  it('fills a gap to the right before going below', () => {
    expect(findFreeSpot([{ x: 0, y: 0, w: 8, h: 3 }], 4, 2)).toEqual({ x: 8, y: 0, w: 4, h: 2 })
  })

  it('skips gaps that are too small', () => {
    const taken = [
      { x: 0, y: 0, w: 10, h: 2 },
      { x: 0, y: 2, w: 12, h: 1 },
    ]
    expect(findFreeSpot(taken, 4, 2)).toEqual({ x: 0, y: 3, w: 4, h: 2 })
  })

  it('finds a hole between widgets', () => {
    const taken = [
      { x: 0, y: 0, w: 4, h: 4 },
      { x: 8, y: 0, w: 4, h: 4 },
    ]
    expect(findFreeSpot(taken, 4, 3)).toEqual({ x: 4, y: 0, w: 4, h: 3 })
  })

  it('clamps widgets wider than the grid', () => {
    expect(findFreeSpot([], 20, 1)).toEqual({ x: 0, y: 0, w: 12, h: 1 })
  })
})
