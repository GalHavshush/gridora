export const searchProviders = {
  google: { name: 'Google', url: 'https://www.google.com/search?q=', host: 'google.com' },
  bing: { name: 'Bing', url: 'https://www.bing.com/search?q=', host: 'bing.com' },
  duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', host: 'duckduckgo.com' },
}

export type SearchProviderId = keyof typeof searchProviders
