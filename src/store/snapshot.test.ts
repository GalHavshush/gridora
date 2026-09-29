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

describe('parseSnapshot appearance', () => {
  it('keeps valid appearance values and frameless widgets', () => {
    const input = { widgets: [{ ...widget('a'), frameless: true }], cardOpacity: 42, cardBlur: 12, font: 'serif', accent: '#5ee6b8', wallpaperDim: 30 }
    const result = parseSnapshot(input)
    expect(result).toMatchObject({ cardOpacity: 42, cardBlur: 12, font: 'serif', accent: '#5ee6b8', wallpaperDim: 30 })
    expect(result.widgets[0].frameless).toBe(true)
  })

  it('falls back to defaults for invalid appearance values', () => {
    const result = parseSnapshot({ widgets: [], cardOpacity: 140, cardBlur: -1, font: 'comic', accent: 'red;x:y', wallpaperDim: 99 })
    expect(result).toMatchObject({ cardOpacity: null, cardBlur: null, font: 'grotesk', accent: '#ff7a6b', wallpaperDim: 0 })
  })
})
