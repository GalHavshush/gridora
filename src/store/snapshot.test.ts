import { describe, expect, it } from 'vitest'
import { defaultBackground } from '@/themes/backgrounds'
import { parseSnapshot } from './snapshot'

const widget = (id: string) => ({ id, type: 'notes', position: { x: 0, y: 0, w: 3, h: 3 }, settings: {} })

describe('parseSnapshot', () => {
  it('rejects things that are not dashboards', () => {
    expect(() => parseSnapshot(null)).toThrow()
    expect(() => parseSnapshot({ widgets: 'nope' })).toThrow()
  })

  it('keeps valid widgets and drops malformed or duplicate ones', () => {
    const result = parseSnapshot({
      widgets: [widget('a'), widget('a'), { id: 'b', type: 'notes', position: { x: 'left' } }, widget('c')],
    })
    expect(result.widgets.map((w) => w.id)).toEqual(['a', 'c'])
  })

  it('falls back to defaults for an invalid background and card style', () => {
    const result = parseSnapshot({ widgets: [], background: { type: 'video', value: 1 }, cardStyle: 'neon' })
    expect(result.background).toEqual(defaultBackground)
    expect(result.cardStyle).toBe('glass')
  })
})

describe('parseSnapshot backgrounds', () => {
  it('rejects non-http image backgrounds', () => {
    const result = parseSnapshot({ widgets: [], background: { type: 'image', value: 'javascript:alert(1)', tone: 'dark' } })
    expect(result.background).toEqual(defaultBackground)
  })
})
