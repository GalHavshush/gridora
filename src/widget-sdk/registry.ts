import type { WidgetDefinition, WidgetSettings } from './types'

// Every `src/widgets/<name>/manifest.ts` is picked up automatically — no manual registration.
const modules = import.meta.glob<{ default: WidgetDefinition }>('../widgets/*/manifest.ts', { eager: true })

export const widgetRegistry: WidgetDefinition[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.name.localeCompare(b.name))

const byId = new Map(widgetRegistry.map((w) => [w.id, w]))

if (import.meta.env.DEV && byId.size !== widgetRegistry.length) {
  console.warn('[Gridora] Two widgets share the same id; only the last one is usable.')
}

export function getWidget(type: string): WidgetDefinition | undefined {
  return byId.get(type)
}

export function getDefaultSettings(definition: WidgetDefinition | undefined): WidgetSettings {
  return Object.fromEntries(
    (definition?.settings ?? []).filter((s) => s.default !== undefined).map((s) => [s.key, s.default]),
  )
}
