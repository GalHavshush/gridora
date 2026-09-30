import { useEffect, useRef, useState } from 'react'
import type { WidgetProps } from './types'

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

type Theme = Record<'fg' | 'muted' | 'subtle' | 'line' | 'accent' | 'font', string>

function readTheme(card: Element): Theme {
  const style = getComputedStyle(card)
  const token = (name: string) => style.getPropertyValue(name).trim()
  return {
    fg: token('--card-fg'),
    muted: token('--card-muted'),
    subtle: token('--card-subtle'),
    line: token('--card-line'),
    accent: token('--color-accent'),
    font: style.fontFamily,
  }
}

/**
 * Hosts a runtime-installed widget. The page runs in a sandboxed iframe without `allow-same-origin`,
 * so it can't touch the dashboard or its storage; it only sees its own settings through postMessage.
 * Protocol: frame → host `gridora:ready | gridora:updateSettings {patch} | gridora:openSettings`,
 * host → frame `gridora:state {settings, size, isEditing, theme}`.
 */
export function RemoteWidget({
  entry,
  title,
  settings,
  size,
  isEditing,
  updateSettings,
  openSettings,
}: WidgetProps & { entry: string; title: string }) {
  const frame = useRef<HTMLIFrameElement>(null)
  // Counts `ready` messages, so state is re-sent if the frame reloads.
  const [ready, setReady] = useState(0)
  const [theme, setTheme] = useState<Theme>()

  // Iframes don't inherit CSS variables, so pass the card tokens along and follow appearance changes.
  useEffect(() => {
    const card = frame.current?.closest('.widget-card')
    const root = frame.current?.closest('[data-card]')
    if (!card) return
    const update = () => setTheme(readTheme(card))
    update()
    const observer = new MutationObserver(update)
    for (const el of [card, root]) if (el) observer.observe(el, { attributes: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow || !isRecord(e.data)) return
      if (e.data.type === 'gridora:ready') setReady((n) => n + 1)
      else if (e.data.type === 'gridora:updateSettings' && isRecord(e.data.patch)) updateSettings(e.data.patch)
      else if (e.data.type === 'gridora:openSettings') openSettings()
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [updateSettings, openSettings])

  useEffect(() => {
    // A sandboxed frame's origin is "null", so '*' is the only target that reaches it.
    if (ready) frame.current?.contentWindow?.postMessage({ type: 'gridora:state', settings, size, isEditing, theme }, '*')
  }, [ready, settings, size, isEditing, theme])

  return (
    <iframe
      ref={frame}
      src={entry}
      title={title}
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms"
      referrerPolicy="no-referrer"
      className="block size-full border-0 bg-transparent"
      // Must match the page's (default) scheme, or browsers paint an opaque backdrop behind it.
      style={{ colorScheme: 'normal' }}
    />
  )
}
