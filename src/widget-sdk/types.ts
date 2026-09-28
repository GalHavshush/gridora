import type { ComponentType } from 'react'

export interface GridSize {
  w: number
  h: number
}

/** Settings are a plain JSON object so they can be persisted and synced as-is. */
export type WidgetSettings = Record<string, unknown>

interface BaseSetting {
  key: string
  label: string
  description?: string
}

export type TextSetting = BaseSetting & {
  type: 'text' | 'url'
  default?: string
  placeholder?: string
}

export type NumberSetting = BaseSetting & {
  type: 'number'
  default?: number
  min?: number
  max?: number
  step?: number
}

export type ToggleSetting = BaseSetting & {
  type: 'toggle'
  default?: boolean
}

export type SelectSetting = BaseSetting & {
  type: 'select'
  default?: string
  options: { label: string; value: string }[]
}

/** An editable list of records, e.g. bookmarks. Each item is edited with `fields`. */
export type ListSetting = BaseSetting & {
  type: 'list'
  default?: Record<string, unknown>[]
  fields: (TextSetting | NumberSetting | ToggleSetting | SelectSetting)[]
  itemLabel?: string
}

export type WidgetSetting = TextSetting | NumberSetting | ToggleSetting | SelectSetting | ListSetting

export interface WidgetProps<S extends WidgetSettings = WidgetSettings> {
  instanceId: string
  /** Stored settings merged over the defaults declared in the manifest. */
  settings: S
  /** Shallow-merges into this instance's settings and persists them. */
  updateSettings: (patch: Partial<S>) => void
  /** Opens this instance's settings panel, handy for empty states. */
  openSettings: () => void
  isEditing: boolean
  /** Current size in grid cells. */
  size: GridSize
}

export interface WidgetDefinition<S extends WidgetSettings = WidgetSettings> {
  /** Stable type id, stored with every instance. Never change it after release. */
  id: string
  name: string
  description?: string
  version: string
  icon: ComponentType<{ className?: string }>
  component: ComponentType<WidgetProps<S>>
  defaultSize: GridSize
  minSize?: GridSize
  maxSize?: GridSize
  settings?: WidgetSetting[]
}

/**
 * Declares a widget. Gives you typed `settings` inside your component while the
 * registry stores every widget under the common `WidgetDefinition` type.
 */
export function defineWidget<S extends WidgetSettings>(definition: WidgetDefinition<S>): WidgetDefinition {
  return definition as unknown as WidgetDefinition
}
