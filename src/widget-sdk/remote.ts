import type { GridSize, WidgetSetting } from './types'
import { isBuiltIn } from './registry'

/**
 * A widget installed at runtime. Its code is an HTML page (`entry`) that runs in a sandboxed
 * iframe, so the manifest only carries the declarative parts of a `WidgetDefinition`.
 */
export interface RemoteManifest {
  id: string
  name: string
  description?: string
  version: string
  /** Absolute URL of the widget page. */
  entry: string
  defaultSize: GridSize
  minSize?: GridSize
  maxSize?: GridSize
  settings?: WidgetSetting[]
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isString = (v: unknown): v is string => typeof v === 'string'
const cells = (v: unknown) => Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 12
const isSize = (v: unknown): v is GridSize => isRecord(v) && cells(v.w) && cells(v.h)
const isLocal = (host: string) => host === 'localhost' || host === '127.0.0.1' || host === '[::1]'

function isSetting(s: unknown, nested = false): s is WidgetSetting {
  if (!isRecord(s) || !isString(s.key) || !isString(s.label)) return false
  switch (s.type) {
    case 'text':
    case 'url':
    case 'number':
    case 'toggle':
      return true
    case 'select':
      return Array.isArray(s.options) && s.options.every((o) => isRecord(o) && isString(o.label) && isString(o.value))
    case 'list':
      return !nested && Array.isArray(s.fields) && s.fields.every((f) => isSetting(f, true))
    default:
      return false
  }
}

/** Validates an untrusted widget manifest. `baseUrl` is where it was fetched from, for relative `entry` paths. */
export function parseRemoteManifest(data: unknown, baseUrl: string): RemoteManifest {
  if (!isRecord(data)) throw new Error('This is not a Gridora widget manifest.')
  const { id, name, description, version, entry, defaultSize, minSize, maxSize, settings } = data
  if (!isString(id) || !/^[a-z0-9-]{1,40}$/.test(id)) throw new Error('The widget id must be 1–40 lowercase letters, digits or dashes.')
  if (isBuiltIn(id)) throw new Error(`“${id}” is a built-in widget id.`)
  if (!isString(name) || !name.trim()) throw new Error('The widget needs a name.')
  if (!isString(version)) throw new Error('The widget needs a version.')
  if (!isSize(defaultSize)) throw new Error('defaultSize must be { w, h } between 1 and 12.')
  if ((minSize !== undefined && !isSize(minSize)) || (maxSize !== undefined && !isSize(maxSize)))
    throw new Error('minSize and maxSize must be { w, h } between 1 and 12.')
  if (settings !== undefined && !(Array.isArray(settings) && settings.every((s) => isSetting(s))))
    throw new Error('The widget settings are not valid.')

  let url: URL
  try {
    url = new URL(isString(entry) ? entry : '', baseUrl)
  } catch {
    throw new Error('The widget entry is not a valid URL.')
  }
  // Plain http only for local development, so authors can test before publishing.
  if (!(url.protocol === 'https:' || (url.protocol === 'http:' && isLocal(url.hostname))))
    throw new Error('The widget entry must be an https URL.')

  return {
    id,
    name: name.trim(),
    description: isString(description) ? description : undefined,
    version,
    entry: url.href,
    defaultSize,
    minSize: minSize as GridSize | undefined,
    maxSize: maxSize as GridSize | undefined,
    settings: settings as WidgetSetting[] | undefined,
  }
}
