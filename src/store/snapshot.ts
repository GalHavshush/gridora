import type { WidgetSettings } from '@/widget-sdk'
import { defaultBackground, type Background, type CardStyle } from '@/themes/backgrounds'
import { safeUrl } from '@/lib/url'
import type { GridPosition } from './layout'

export interface WidgetInstance {
  id: string
  type: string
  position: GridPosition
  settings: WidgetSettings
}

/** Everything that describes a dashboard. This is what gets persisted, exported and (later) synced. */
export interface DashboardSnapshot {
  widgets: WidgetInstance[]
  background: Background
  cardStyle: CardStyle
}

export const snapshotOf = ({ widgets, background, cardStyle }: DashboardSnapshot): DashboardSnapshot => ({
  widgets,
  background,
  cardStyle,
})

const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
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
  return { widgets, background: background as Background, cardStyle }
}
