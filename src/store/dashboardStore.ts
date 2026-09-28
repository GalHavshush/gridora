import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Layout } from 'react-grid-layout'
import { getWidget } from '@/widget-sdk/registry'
import type { WidgetSettings } from '@/widget-sdk'
import { dashboardStorage } from '@/services/persistence/storage'
import { defaultBackground, type Background, type CardStyle } from '@/themes/backgrounds'
import { findFreeSpot } from './layout'
import { parseSnapshot, type DashboardSnapshot } from './snapshot'
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
  importDashboard: (data: unknown) => void
  resetDashboard: () => void
}

export const createInstanceId = (type: string) => `${type}-${crypto.randomUUID().slice(0, 5)}`

const defaultSnapshot = (): DashboardSnapshot => ({
  widgets: defaultWidgets().map((w) => ({ ...w, id: createInstanceId(w.type) })),
  background: defaultBackground,
  cardStyle: 'glass',
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
      setCardStyle: (cardStyle) => set({ cardStyle }),

      importDashboard: (data) => set(parseSnapshot(data)),
      resetDashboard: () => set(defaultSnapshot()),
    }),
    {
      name: 'gridora:dashboard',
      version: 1,
      storage: createJSONStorage(() => dashboardStorage),
      partialize: ({ widgets, background, cardStyle }): DashboardSnapshot => ({ widgets, background, cardStyle }),
    },
  ),
)

export type { DashboardSnapshot, WidgetInstance } from './snapshot'
