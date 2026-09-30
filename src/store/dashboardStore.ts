import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Layout } from 'react-grid-layout'
import { getWidget, setRemoteWidgets } from '@/widget-sdk/registry'
import type { RemoteManifest } from '@/widget-sdk/remote'
import type { WidgetSettings } from '@/widget-sdk'
import { dashboardStorage } from '@/services/persistence/storage'
import { defaultBackground, type Background, type CardStyle } from '@/themes/backgrounds'
import { findFreeSpot } from './layout'
import { defaultAccent } from '@/themes/appearance'
import { parseSnapshot, snapshotOf, type DashboardSnapshot } from './snapshot'
import { defaultWidgets } from './defaultDashboard'

interface DashboardState extends DashboardSnapshot {
  isEditing: boolean
  addWidget: (type: string) => string | undefined
  removeWidget: (id: string) => void
  updateLayout: (layout: Layout) => void
  updateWidgetSettings: (id: string, patch: WidgetSettings) => void
  setEditing: (isEditing: boolean) => void
  setBackground: (background: Background) => void
  setCardStyle: (cardStyle: CardStyle) => void
  setAppearance: (patch: Partial<Pick<DashboardSnapshot, 'cardOpacity' | 'cardBlur' | 'cardColor' | 'font' | 'accent' | 'wallpaperDim'>>) => void
  setFrameless: (id: string, frameless: boolean) => void
  /** Sets an image URL as the wallpaper and remembers it among the recent ones. */
  applyWallpaperUrl: (url: string) => void
  removeRecentWallpaper: (url: string) => void
  /** Adds or replaces a runtime widget. The manifest must come from `parseRemoteManifest`. */
  installWidget: (manifest: RemoteManifest) => void
  /** Removes a runtime widget and every instance of it. */
  uninstallWidget: (id: string) => void
  importDashboard: (data: unknown) => void
  resetDashboard: () => void
}

export const createInstanceId = (type: string) => `${type}-${crypto.randomUUID().slice(0, 5)}`

const defaultSnapshot = (): DashboardSnapshot => ({
  widgets: defaultWidgets().map((w) => ({ ...w, id: createInstanceId(w.type) })),
  background: defaultBackground,
  cardStyle: 'glass',
  cardOpacity: null,
  cardBlur: null,
  cardColor: null,
  font: 'grotesk',
  accent: defaultAccent,
  wallpaperDim: 0,
  recentWallpapers: [],
  installedWidgets: [],
})

export const useDashboard = create<DashboardState>()(
  persist(
    (set, get) => ({
      ...defaultSnapshot(),
      isEditing: false,

      addWidget: (type) => {
        const definition = getWidget(type)
        if (!definition) return
        const { w, h } = definition.defaultSize
        const id = createInstanceId(type)
        const position = findFreeSpot(get().widgets.map((widget) => widget.position), w, h)
        set((s) => ({ widgets: [...s.widgets, { id, type, position, settings: {} }] }))
        return id
      },

      removeWidget: (id) => set((s) => ({ widgets: s.widgets.filter((w) => w.id !== id) })),

      updateLayout: (layout) => {
        const byId = new Map(layout.map((item) => [item.i, item]))
        let changed = false
        const widgets = get().widgets.map((widget) => {
          const item = byId.get(widget.id)
          const p = widget.position
          if (!item || (item.x === p.x && item.y === p.y && item.w === p.w && item.h === p.h)) return widget
          changed = true
          return { ...widget, position: { x: item.x, y: item.y, w: item.w, h: item.h } }
        })
        if (changed) set({ widgets })
      },

      updateWidgetSettings: (id, patch) =>
        set((s) => ({
          widgets: s.widgets.map((w) => (w.id === id ? { ...w, settings: { ...w.settings, ...patch } } : w)),
        })),

      setEditing: (isEditing) => set({ isEditing }),
      setBackground: (background) => set({ background }),
      // A new style starts from its own opacity and blur rather than the previous style's.
      setCardStyle: (cardStyle) => set({ cardStyle, cardOpacity: null, cardBlur: null }),
      setAppearance: (patch) => set(patch),
      applyWallpaperUrl: (url) =>
        set((s) => ({
          background: { type: 'image', value: url, tone: 'dark' },
          recentWallpapers: [url, ...s.recentWallpapers.filter((u) => u !== url)].slice(0, 4),
        })),
      removeRecentWallpaper: (url) => set((s) => ({ recentWallpapers: s.recentWallpapers.filter((u) => u !== url) })),
      setFrameless: (id, frameless) =>
        set((s) => ({ widgets: s.widgets.map((w) => (w.id === id ? { ...w, frameless } : w)) })),

      installWidget: (manifest) =>
        set((s) => ({ installedWidgets: [...s.installedWidgets.filter((m) => m.id !== manifest.id), manifest] })),
      uninstallWidget: (id) =>
        set((s) => ({
          installedWidgets: s.installedWidgets.filter((m) => m.id !== id),
          widgets: s.widgets.filter((w) => w.type !== id),
        })),

      importDashboard: (data) => set(parseSnapshot(data)),
      resetDashboard: () => set(defaultSnapshot()),
    }),
    {
      name: 'gridora:dashboard',
      version: 1,
      storage: createJSONStorage(() => dashboardStorage),
      partialize: (s): DashboardSnapshot => snapshotOf(s),
    },
  ),
)

// Keep the registry in step with the installed runtime widgets (also after hydration and imports).
setRemoteWidgets(useDashboard.getState().installedWidgets)
useDashboard.subscribe((s, prev) => {
  if (s.installedWidgets !== prev.installedWidgets) setRemoteWidgets(s.installedWidgets)
})

export type { DashboardSnapshot, WidgetInstance } from './snapshot'
