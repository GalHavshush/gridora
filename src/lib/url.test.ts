import { describe, expect, it } from 'vitest'
import { cssUrl, safeUrl } from './url'

describe('safeUrl', () => {
  it('adds https to bare domains', () => expect(safeUrl('github.com')?.href).toBe('https://github.com/'))
  it('keeps http(s) urls', () => expect(safeUrl('http://a.dev/x')?.href).toBe('http://a.dev/x'))
  it('rejects script and other schemes', () => {
    expect(safeUrl('javascript:alert(1)')).toBeUndefined()
    expect(safeUrl('data:text/html,hi')).toBeUndefined()
  })
  it('rejects empty input', () => expect(safeUrl('  ')).toBeUndefined())
})

describe('cssUrl', () => {
  it('escapes characters that could break out of url("")', () => {
    expect(cssUrl('https://x.dev/a".png')).toBe('url("https://x.dev/a%22.png")')
    expect(cssUrl('https://x.dev/a\\b')).toBe('url("https://x.dev/a%5Cb")')
  })
})
