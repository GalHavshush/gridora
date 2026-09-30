import { describe, expect, it } from 'vitest'
import { parseRemoteManifest } from './remote'

const base = 'https://widgets.example/countdown/manifest.json'
const manifest = (patch: Record<string, unknown> = {}) => ({
  id: 'countdown',
  name: 'Countdown',
  version: '1.0.0',
  entry: 'index.html',
  defaultSize: { w: 3, h: 2 },
  settings: [{ key: 'title', label: 'Title', type: 'text', default: 'Launch' }],
  ...patch,
})

describe('parseRemoteManifest', () => {
  it('accepts a valid manifest and resolves a relative entry', () => {
    expect(parseRemoteManifest(manifest(), base).entry).toBe('https://widgets.example/countdown/index.html')
  })

  it('rejects bad or built-in ids', () => {
    expect(() => parseRemoteManifest(manifest({ id: 'Count Down' }), base)).toThrow()
    expect(() => parseRemoteManifest(manifest({ id: 'clock' }), base)).toThrow(/built-in/)
  })

  it('only allows https entries, or http on localhost', () => {
    expect(() => parseRemoteManifest(manifest({ entry: 'http://evil.example/x.html' }), base)).toThrow(/https/)
    expect(() => parseRemoteManifest(manifest({ entry: 'javascript:alert(1)' }), base)).toThrow(/https/)
    expect(parseRemoteManifest(manifest({ entry: 'http://localhost:4000/w.html' }), base).entry).toBe('http://localhost:4000/w.html')
  })

  it('rejects out-of-range sizes and unknown setting types', () => {
    expect(() => parseRemoteManifest(manifest({ defaultSize: { w: 20, h: 2 } }), base)).toThrow()
    expect(() => parseRemoteManifest(manifest({ settings: [{ key: 'a', label: 'A', type: 'script' }] }), base)).toThrow()
  })
})
