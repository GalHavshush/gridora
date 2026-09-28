export interface FeedItem {
  title: string
  link: string
  date?: Date
}

export interface Feed {
  title: string
  link?: string
  items: FeedItem[]
}

/**
 * Fetches and parses an RSS 2.0 or Atom feed from the browser.
 *
 * Feeds that send CORS headers are read directly. For the many that don't, Gridora
 * falls back to rss2json.com, a free public service that returns the feed as JSON
 * with CORS enabled. A future Gridora backend can replace both paths with its own
 * proxy by changing only this function.
 */
export async function fetchFeed(url: string, signal?: AbortSignal): Promise<Feed> {
  let res: Response
  try {
    res = await fetch(url, { signal })
  } catch (error) {
    if (signal?.aborted) throw error
    // Most likely blocked by CORS; the browser doesn't tell us which.
    return fetchViaRss2Json(url, signal)
  }
  if (!res.ok) throw new Error(`The feed responded with ${res.status}.`)
  return parseFeed(await res.text())
}

interface Rss2JsonResponse {
  status: 'ok' | 'error'
  message?: string
  feed?: { title?: string; link?: string }
  items?: { title?: string; link?: string; pubDate?: string }[]
}

async function fetchViaRss2Json(url: string, signal?: AbortSignal): Promise<Feed> {
  const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`, { signal })
  const data = (await res.json().catch(() => ({ status: 'error' }))) as Rss2JsonResponse
  if (data.status !== 'ok') throw new Error("Couldn't load this feed. Check that the URL is an RSS or Atom feed.")
  return {
    title: data.feed?.title ?? '',
    link: data.feed?.link,
    items: (data.items ?? []).map((item) => ({
      title: item.title?.trim() ?? '',
      link: item.link ?? '',
      // rss2json returns "YYYY-MM-DD HH:mm:ss" in UTC.
      date: item.pubDate ? new Date(`${item.pubDate.replace(' ', 'T')}Z`) : undefined,
    })),
  }
}

export function parseFeed(xml: string): Feed {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.querySelector('parsererror')) throw new Error("That URL doesn't look like an RSS or Atom feed.")

  const text = (el: Element | null | undefined, selector: string) => el?.querySelector(selector)?.textContent?.trim() ?? ''
  const toDate = (value: string) => (value && !Number.isNaN(Date.parse(value)) ? new Date(value) : undefined)

  const atom = doc.querySelector('feed')
  if (atom) {
    const linkOf = (el: Element) =>
      (el.querySelector('link[rel="alternate"]') ?? el.querySelector('link'))?.getAttribute('href') ?? ''
    return {
      title: text(atom, ':scope > title'),
      link: linkOf(atom),
      items: [...atom.querySelectorAll('entry')].map((entry) => ({
        title: text(entry, 'title'),
        link: linkOf(entry),
        date: toDate(text(entry, 'updated') || text(entry, 'published')),
      })),
    }
  }

  const channel = doc.querySelector('channel')
  return {
    title: text(channel, ':scope > title'),
    link: text(channel, ':scope > link'),
    items: [...doc.querySelectorAll('item')].map((item) => ({
      title: text(item, 'title'),
      link: text(item, 'link'),
      date: toDate(text(item, 'pubDate')),
    })),
  }
}
