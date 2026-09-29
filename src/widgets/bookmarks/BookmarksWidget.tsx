import { useState } from 'react'
import { BookmarkPlus } from 'lucide-react'
import { WidgetMessage, type WidgetProps } from '@/widget-sdk'
import { faviconFor, safeUrl } from '@/lib/url'

type Bookmark = { title?: string; url?: string; icon?: string }

export type BookmarksSettings = {
  bookmarks: Bookmark[]
  showLabels: boolean
  openInNewTab: boolean
}

export function BookmarksWidget({ settings, openSettings }: WidgetProps<BookmarksSettings>) {
  const bookmarks = (Array.isArray(settings.bookmarks) ? settings.bookmarks : []).flatMap((b) => {
    const url = safeUrl(b.url)
    return url ? [{ ...b, url, title: b.title || url.hostname.replace(/^www\./, '') }] : []
  })

  if (!bookmarks.length) {
    return (
      <WidgetMessage
        icon={<BookmarkPlus className="size-6" />}
        text="Pin the sites you visit most."
        action="Add bookmarks"
        onAction={openSettings}
      />
    )
  }

  return (
    <div className="grid h-full auto-rows-min grid-cols-[repeat(auto-fill,minmax(68px,1fr))] [align-content:safe_center] gap-1 overflow-y-auto p-3 [scrollbar-width:thin]">
      {bookmarks.map((b, i) => (
        <a
          key={`${b.url.href}-${i}`}
          href={b.url.href}
          target={settings.openInNewTab ? '_blank' : undefined}
          rel="noreferrer"
          title={b.title}
          className="group flex flex-col items-center gap-1.5 rounded-2xl p-2 transition hover:bg-subtle"
        >
          <BookmarkIcon title={b.title} icon={b.icon} host={b.url.hostname} />
          {settings.showLabels && <span className="w-full truncate text-center text-xs text-muted group-hover:text-fg">{b.title}</span>}
        </a>
      ))}
    </div>
  )
}

function BookmarkIcon({ title, icon: rawIcon, host }: { title: string; icon?: string; host: string }) {
  const [failed, setFailed] = useState(false)
  const icon = rawIcon?.trim()
  const customImage = icon && /^https?:\/\//.test(icon) ? safeUrl(icon)?.href : undefined
  const emoji = icon && !customImage ? icon : undefined

  return (
    <span className="grid size-12 place-items-center rounded-[15px] bg-white shadow-sm ring-1 ring-black/5 transition group-hover:-translate-y-0.5 group-hover:shadow-md">
      {emoji ? (
        <span className="text-2xl">{emoji}</span>
      ) : failed ? (
        <span className="font-display text-lg font-semibold text-[#18181b]">{title[0]?.toUpperCase()}</span>
      ) : (
        <img src={customImage ?? faviconFor(host)} alt="" className="size-7 rounded-md" onError={() => setFailed(true)} />
      )}
    </span>
  )
}
