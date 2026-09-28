import { useCallback, useEffect, useRef, useState } from 'react'
import type { WidgetProps } from '@/widget-sdk'

export type NotesSettings = {
  title: string
  content?: string
}

export function NotesWidget({ settings, updateSettings }: WidgetProps<NotesSettings>) {
  const [text, setText] = useState(typeof settings.content === 'string' ? settings.content : '')
  const pending = useRef<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Save shortly after typing stops, and always before the widget unmounts or the page closes.
  const flush = useCallback(() => {
    clearTimeout(timer.current)
    if (pending.current === null) return
    updateSettings({ content: pending.current })
    pending.current = null
  }, [updateSettings])

  useEffect(() => {
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [flush])

  return (
    <div className="flex h-full flex-col p-5">
      {settings.title && (
        <div className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">{settings.title}</div>
      )}
      <textarea
        value={text}
        aria-label={settings.title || 'Notes'}
        placeholder="Jot something down…"
        spellCheck
        onChange={(e) => {
          setText(e.target.value)
          pending.current = e.target.value
          clearTimeout(timer.current)
          timer.current = setTimeout(flush, 400)
        }}
        onBlur={flush}
        className="min-h-0 flex-1 resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-muted"
      />
    </div>
  )
}
