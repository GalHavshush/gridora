import { Search } from 'lucide-react'
import { defineWidget } from '@/widget-sdk'
import { searchProviders } from './providers'
import { SearchWidget, type SearchSettings } from './SearchWidget'

export default defineWidget<SearchSettings>({
  id: 'search',
  name: 'Search',
  description: 'Search the web from your homepage. Press / to focus.',
  version: '1.0.0',
  icon: Search,
  component: SearchWidget,
  defaultSize: { w: 6, h: 1 },
  minSize: { w: 3, h: 1 },
  maxSize: { w: 12, h: 2 },
  settings: [
    {
      key: 'provider',
      label: 'Search engine',
      type: 'select',
      default: 'google',
      options: Object.entries(searchProviders).map(([value, p]) => ({ value, label: p.name })),
    },
    { key: 'openInNewTab', label: 'Open results in a new tab', type: 'toggle', default: false },
  ],
})
