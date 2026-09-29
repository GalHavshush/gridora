import { describe, expect, it } from 'vitest'
import { timeParts } from './timeParts'

describe('timeParts', () => {
  const noonUtc = new Date('2026-01-15T12:05:09Z')

  it('formats 24- and 12-hour time in a given zone', () => {
    expect(timeParts(noonUtc, 'Asia/Tokyo', '24h')).toEqual({ hour: '21', minute: '05', second: '09', period: undefined })
    expect(timeParts(noonUtc, 'Asia/Tokyo', '12h')).toMatchObject({ hour: '09', minute: '05', period: 'PM' })
  })

  it('shows midnight as 00 in 24-hour time', () => {
    expect(timeParts(new Date('2026-01-15T15:00:00Z'), 'Asia/Tokyo', '24h').hour).toBe('00')
  })
})
