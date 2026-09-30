import { useState, type ComponentType, type FormEvent } from 'react'
import { Download, Plus, Puzzle, Trash2 } from 'lucide-react'
import { Sheet } from '@/components/Sheet'
import { inputClass } from '@/components/SettingField'
import { useAsyncData } from '@/widget-sdk'
import { getWidget, widgetRegistry } from '@/widget-sdk/registry'
import { parseRemoteManifest, type RemoteManifest } from '@/widget-sdk/remote'
import { useDashboard } from '@/store/dashboardStore'

const CATALOG_URL =
  import.meta.env.VITE_WIDGET_CATALOG_URL ?? 'https://galhavshush.github.io/gridora-widgets/catalog.json'

interface Props {
  open: boolean
  onClose: () => void
  onAdd: (type: string) => void
}

/** The widget library: built-in widgets, installed runtime widgets and the marketplace. */
export function WidgetPicker({ open, onClose, onAdd }: Props) {
  const installed = useDashboard((s) => s.installedWidgets)
  const installWidget = useDashboard((s) => s.installWidget)
  const uninstallWidget = useDashboard((s) => s.uninstallWidget)

  const install = (manifest: RemoteManifest) => {
    installWidget(manifest)
    onAdd(manifest.id)
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      variant="modal"
      title="Widget library"
      description="Add as many as you like — every widget can be used more than once."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {widgetRegistry.map(({ id, name, description, icon, defaultSize }) => (
          <li key={id}>
            <WidgetCard icon={icon} name={name} description={description} size={defaultSize} onClick={() => onAdd(id)} />
          </li>
        ))}
        {installed.map(({ id, name, description, defaultSize }) =>
          getWidget(id) ? (
            <li key={id} className="relative">
              <WidgetCard icon={Puzzle} name={name} description={description} size={defaultSize} onClick={() => onAdd(id)} />
              <button
                onClick={() => uninstallWidget(id)}
                aria-label={`Uninstall ${name}`}
                title={`Uninstall ${name} and remove it from the dashboard`}
                className="absolute right-3 bottom-3 cursor-pointer rounded-full p-1.5 text-white/30 transition hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ) : null,
        )}
      </ul>
      <Marketplace installed={installed} onInstall={install} />
    </Sheet>
  )
}

function WidgetCard({
  icon: Icon,
  name,
  description,
  size,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>
  name: string
  description?: string
  size: { w: number; h: number }
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full cursor-pointer items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4 text-left transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]"
    >
      <span className="bg-accent-gradient grid size-12 shrink-0 place-items-center rounded-2xl text-accent-fg shadow-lg shadow-accent/20">
        <Icon className="size-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-medium">{name}</span>
          <SizeHint w={size.w} h={size.h} />
        </span>
        <span className="mt-1 block text-sm leading-snug text-white/55">{description}</span>
      </span>
      <Plus className="mt-1 size-5 shrink-0 text-white/30 transition group-hover:text-white" />
    </button>
  )
}

async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Couldn’t load ${url} (${res.status}).`)
  return res.json()
}

/** Community widgets from the catalog, plus installing any manifest by URL. */
function Marketplace({ installed, onInstall }: { installed: RemoteManifest[]; onInstall: (m: RemoteManifest) => void }) {
  const catalog = useAsyncData(CATALOG_URL, async (signal) => {
    const data = await fetchJson(CATALOG_URL, signal)
    // Skip entries that don't validate rather than failing the whole list.
    return (Array.isArray(data) ? data : []).flatMap((m) => {
      try {
        return [parseRemoteManifest(m, CATALOG_URL)]
      } catch {
        return []
      }
    })
  })
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const installFromUrl = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      onInstall(parseRemoteManifest(await fetchJson(url.trim()), new URL(url.trim()).href))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <section className="mt-8">
      <h3 className="font-display text-lg font-semibold tracking-tight">Marketplace</h3>
      <p className="mt-1 text-sm text-white/55">
        Community widgets run in a sandbox: they only see their own settings, never your dashboard.
      </p>
      {catalog.loading && !catalog.data && <p className="mt-4 text-sm text-white/45">Loading widgets…</p>}
      {catalog.error && <p className="mt-4 text-sm text-red-300">The marketplace is unavailable right now.</p>}
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {catalog.data?.map((m) => {
          const current = installed.find((i) => i.id === m.id)
          return (
            <li key={m.id} className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/[0.06]">
                <Puzzle className="size-6 text-white/70" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-medium">{m.name}</span>
                <span className="mt-1 block text-sm leading-snug text-white/55">{m.description}</span>
                <span className="mt-1 block text-[11px] text-white/35">
                  v{m.version} · {new URL(m.entry).host}
                </span>
              </span>
              <button
                onClick={() => onInstall(m)}
                className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-white/[0.08] px-3 py-1.5 text-xs font-medium transition hover:bg-white/[0.15]"
              >
                <Download className="size-3.5" />
                {!current ? 'Install' : current.version === m.version ? 'Add' : 'Update'}
              </button>
            </li>
          )
        })}
      </ul>
      <form onSubmit={installFromUrl} className="mt-5 flex gap-2">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Install from a manifest URL…"
          aria-label="Widget manifest URL"
          className={inputClass}
        />
        <button className="shrink-0 cursor-pointer rounded-xl bg-white/[0.08] px-4 text-sm font-medium transition hover:bg-white/[0.15]">
          Install
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
    </section>
  )
}

/** A tiny 12-column preview of how much room the widget takes by default. */
function SizeHint({ w, h }: { w: number; h: number }) {
  return (
    <span className="ml-auto flex items-center gap-1.5 text-[11px] text-white/40" title={`${w} × ${h} cells`}>
      <svg viewBox="0 0 24 8" className="h-2 w-6" aria-hidden="true">
        <rect width="24" height="8" rx="1.5" fill="currentColor" opacity=".25" />
        <rect width={(w / 12) * 24} height={Math.min(8, h * 2)} rx="1.5" fill="currentColor" />
      </svg>
      {w}×{h}
    </span>
  )
}
