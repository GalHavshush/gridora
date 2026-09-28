import { Rss } from 'lucide-react'
import { defineWidget } from '@/widget-sdk'
import { RssWidget, type RssSettings } from './RssWidget'

export default defineWidget<RssSettings>({
  id: 'rss',
  name: 'RSS Feed',
  description: 'Headlines from any RSS or Atom feed.',
  version: '1.0.0',
  icon: Rss,
  component: RssWidget,
  defaultSize: { w: 4, h: 4 },
  minSize: { w: 3, h: 2 },
  settings: [
    {
      key: 'url',
      label: 'Feed URL',
      type: 'url',
      default: 'https://github.blog/feed/',
      placeholder: 'https://example.com/feed.xml',
      description: 'Any RSS or Atom feed URL.',
    },
    { key: 'count', label: 'Headlines', type: 'number', default: 10, min: 1, max: 50 },
  ],
})
