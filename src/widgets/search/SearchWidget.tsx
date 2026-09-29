import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import type { WidgetProps } from '@/widget-sdk'
import { faviconFor } from '@/lib/url'
import { searchProviders, type SearchProviderId } from './providers'

export type SearchSettings = {
  provider: SearchProviderId
  openInNewTab: boolean
}

const isTyping = (el: Element | null) =>
  el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || (el as HTMLElement | null)?.isContentEditable

export function SearchWidget({ settings, size }: WidgetProps<SearchSettings>) {
  const provider = searchProviders[settings.provider] ?? searchProviders.google
  const [query, setQuery] = useState('')
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isTyping(document.activeElement)) {
        e.preventDefault()
        input.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    const url = provider.url + encodeURIComponent(query.trim())
    setQuery('')
    if (settings.openInNewTab) window.open(url, '_blank', 'noopener')
    else window.location.assign(url)
  }

  return (
    <form role="search" onSubmit={submit} className="flex h-full items-center gap-3 px-5">
      <img src={faviconFor(provider.host)} alt="" className="size-5 shrink-0 rounded" />
      <input
        ref={input}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search with ${provider.name}`}
        aria-label={`Search with ${provider.name}`}
        className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-muted"
      />
      {query ? (
        <button aria-label="Search" className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full bg-subtle transition hover:bg-line">
          <ArrowRight className="size-4" />
        </button>
      ) : (
        size.w >= 4 && <kbd className="rounded-md border border-line px-1.5 py-0.5 font-sans text-xs text-muted">/</kbd>
      )}
    </form>
  )
}
