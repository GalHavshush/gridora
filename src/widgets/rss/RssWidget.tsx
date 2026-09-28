import { ExternalLink, Rss } from 'lucide-react'
import { useAsyncData, WidgetMessage, type WidgetProps } from '@/widget-sdk'
import { fetchFeed } from '@/services/rss/fetchFeed'
import { safeUrl } from '@/lib/url'

export type RssSettings = {
  url: string
  count: number
}

const FIFTEEN_MINUTES = 15 * 60 * 1000
const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto', style: 'narrow' })

function timeAgo(date: Date) {
  const minutes = Math.round((date.getTime() - Date.now()) / 60000)
  if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute')
  if (Math.abs(minutes) < 60 * 24) return relative.format(Math.round(minutes / 60), 'hour')
  return relative.format(Math.round(minutes / 1440), 'day')
}

export function RssWidget({ settings, openSettings }: WidgetProps<RssSettings>) {
  const { url, count } = settings
  const { data, error, loading } = useAsyncData(url, (signal) => fetchFeed(url, signal), FIFTEEN_MINUTES)

  if (!url) return <WidgetMessage icon={<Rss className="size-6" />} text="Follow any RSS or Atom feed." action="Add a feed" onAction={openSettings} />
  if (error && !data) return <WidgetMessage icon={<Rss className="size-6" />} text={error.message} action="Change feed" onAction={openSettings} />
  if (!data) {
    return (
      <div className={`space-y-4 p-5 ${loading ? 'animate-pulse' : ''}`}>
        {[70, 90, 60, 80].map((w) => (
          <div key={w} className="h-3 rounded-full bg-subtle" style={{ width: `${w}%` }} />
        ))}
      </div>
    )
  }

  const items = data.items.flatMap((item) => {
    const link = safeUrl(item.link)
    return link && item.title ? [{ ...item, link }] : []
  })
  const home = safeUrl(data.link)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 px-5 pt-5 pb-2">
        <div className="truncate text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">{data.title || 'Feed'}</div>
        {home && (
          <a href={home.href} target="_blank" rel="noreferrer" aria-label="Open site" className="text-muted hover:text-fg">
            <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
      <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto px-5 pb-3 [scrollbar-width:thin]">
        {items.slice(0, count).map((item) => (
          <li key={item.link.href}>
            <a href={item.link.href} target="_blank" rel="noreferrer" className="group block py-2.5">
              <div className="line-clamp-2 text-sm leading-snug font-medium group-hover:underline group-hover:decoration-line group-hover:underline-offset-2">
                {item.title}
              </div>
              {item.date && <div className="mt-1 text-xs text-muted">{timeAgo(item.date)}</div>}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
