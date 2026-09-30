import { createElement } from 'react'
import { Puzzle } from 'lucide-react'
import type { WidgetDefinition, WidgetProps, WidgetSettings } from './types'
import type { RemoteManifest } from './remote'
import { RemoteWidget } from './RemoteWidget'

// Every `src/widgets/<name>/manifest.ts` is picked up automatically — no manual registration.
const modules = import.meta.glob<{ default: WidgetDefinition }>('../widgets/*/manifest.ts', { eager: true })

export const widgetRegistry: WidgetDefinition[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.name.localeCompare(b.name))

const byId = new Map(widgetRegistry.map((w) => [w.id, w]))

if (import.meta.env.DEV && byId.size !== widgetRegistry.length) {
  console.warn('[Gridora] Two widgets share the same id; only the last one is usable.')
}

export const isBuiltIn = (type: string) => byId.has(type)

// Widgets installed at runtime. Definitions are cached per manifest object so their component stays stable.
let remoteById = new Map<string, WidgetDefinition>()
const remoteCache = new WeakMap<RemoteManifest, WidgetDefinition>()

function remoteDefinition(manifest: RemoteManifest): WidgetDefinition {
  let definition = remoteCache.get(manifest)
  if (!definition) {
    const component = (props: WidgetProps) => createElement(RemoteWidget, { ...props, entry: manifest.entry, title: manifest.name })
    definition = { ...manifest, icon: Puzzle, component }
    remoteCache.set(manifest, definition)
  }
  return definition
}

/** Called by the store whenever the installed widgets change. */
export function setRemoteWidgets(manifests: RemoteManifest[]) {
  remoteById = new Map(manifests.filter((m) => !isBuiltIn(m.id)).map((m) => [m.id, remoteDefinition(m)]))
}

export function getWidget(type: string): WidgetDefinition | undefined {
  return byId.get(type) ?? remoteById.get(type)
}

export function getDefaultSettings(definition: WidgetDefinition | undefined): WidgetSettings {
  return Object.fromEntries(
    (definition?.settings ?? []).filter((s) => s.default !== undefined).map((s) => [s.key, s.default]),
  )
}
