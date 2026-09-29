import type { WidgetSettings } from '@/widget-sdk'
import { defaultBackground, type Background, type CardStyle } from '@/themes/backgrounds'
import { defaultAccent, fonts, type FontId } from '@/themes/appearance'
import { safeUrl } from '@/lib/url'
import type { GridPosition } from './layout'

export interface WidgetInstance {
  id: string
  type: string
  position: GridPosition
  settings: WidgetSettings
  /** Drop the card surface and draw the widget straight on the background. */
  frameless?: boolean
}

/** Everything that describes a dashboard. This is what gets persisted, exported and (later) synced. */
export interface DashboardSnapshot {
  widgets: WidgetInstance[]
  background: Background
  cardStyle: CardStyle
  /** Card fill, 0–100. `null` follows the card style's default. */
  cardOpacity: number | null
  /** Card blur in px, 0–40. `null` follows the card style's default. */
  cardBlur: number | null
  /** Card surface color. `null` uses the card style's own color. */
  cardColor: string | null
  font: FontId
  accent: string
  /** Darkens image wallpapers, 0–80. */
  wallpaperDim: number
  /** Image URLs the user applied as wallpapers, newest first, at most 4. */
  recentWallpapers: string[]
}

export const snapshotOf = (s: DashboardSnapshot): DashboardSnapshot => ({
  widgets: s.widgets,
  background: s.background,
  cardStyle: s.cardStyle,
  cardOpacity: s.cardOpacity,
  cardBlur: s.cardBlur,
  cardColor: s.cardColor,
  font: s.font,
  accent: s.accent,
  wallpaperDim: s.wallpaperDim,
  recentWallpapers: s.recentWallpapers,
})

const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isHex = (v: unknown): v is string => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)
const inRange = (v: unknown, max: number): v is number => isNumber(v) && v >= 0 && v <= max
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Validates an imported dashboard file. Throws with a readable message when it isn't one. */
export function parseSnapshot(data: unknown): DashboardSnapshot {
  if (!isRecord(data) || !Array.isArray(data.widgets)) throw new Error('This file is not a Gridora dashboard.')
  const ids = new Set<string>()
  const widgets = data.widgets.filter(
    (w): w is WidgetInstance =>
      isRecord(w) &&
      typeof w.id === 'string' &&
      typeof w.type === 'string' &&
      isRecord(w.position) &&
      [w.position.x, w.position.y, w.position.w, w.position.h].every(isNumber) &&
      isRecord(w.settings) &&
      !ids.has(w.id) &&
      Boolean(ids.add(w.id)),
  )
  const bg = data.background
  const background =
    isRecord(bg) &&
    ['gradient', 'solid', 'image'].includes(bg.type as string) &&
    typeof bg.value === 'string' &&
    (bg.type !== 'image' || safeUrl(bg.value))
      ? { type: bg.type as Background['type'], value: bg.value, tone: bg.tone === 'light' ? 'light' : 'dark' }
      : defaultBackground
  const cardStyle = ['glass', 'light', 'dark'].includes(data.cardStyle as string)
    ? (data.cardStyle as CardStyle)
    : 'glass'
  return {
    widgets,
    background: background as Background,
    cardStyle,
    cardOpacity: inRange(data.cardOpacity, 100) ? data.cardOpacity : null,
    cardBlur: inRange(data.cardBlur, 40) ? data.cardBlur : null,
    cardColor: isHex(data.cardColor) ? data.cardColor : null,
    font: fonts.some((f) => f.id === data.font) ? (data.font as FontId) : 'grotesk',
    accent: isHex(data.accent) ? data.accent : defaultAccent,
    wallpaperDim: inRange(data.wallpaperDim, 80) ? data.wallpaperDim : 0,
    recentWallpapers: Array.isArray(data.recentWallpapers)
      ? [...new Set(data.recentWallpapers.filter((u): u is string => typeof u === 'string' && Boolean(safeUrl(u))))].slice(0, 4)
      : [],
  }
}
