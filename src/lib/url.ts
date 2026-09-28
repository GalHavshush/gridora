/** Returns a normalized http(s) URL, or undefined for anything else (e.g. `javascript:` links). */
export function safeUrl(raw: string | undefined): URL | undefined {
  if (!raw?.trim()) return
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : undefined
  } catch {
    return
  }
}

/** Wraps a URL for use inside CSS `url()`. */
export const cssUrl = (url: string) => `url("${url.replace(/["\\\n]/g, encodeURIComponent)}")`

export const faviconFor = (host: string) => `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(host)}`
