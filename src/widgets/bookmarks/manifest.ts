import { Bookmark } from 'lucide-react'
import { defineWidget } from '@/widget-sdk'
import { BookmarksWidget, type BookmarksSettings } from './BookmarksWidget'

export default defineWidget<BookmarksSettings>({
  id: 'bookmarks',
  name: 'Bookmarks',
  description: 'Your favorite sites as a tidy launcher.',
  version: '1.0.0',
  icon: Bookmark,
  component: BookmarksWidget,
  defaultSize: { w: 4, h: 2 },
  minSize: { w: 2, h: 2 },
  settings: [
    {
      key: 'bookmarks',
      label: 'Bookmarks',
      type: 'list',
      itemLabel: 'bookmark',
      fields: [
        { key: 'title', label: 'Title', type: 'text', placeholder: 'Title' },
        { key: 'url', label: 'URL', type: 'url', placeholder: 'https://example.com' },
        { key: 'icon', label: 'Icon', type: 'text', placeholder: 'Icon: emoji or image URL (optional)' },
      ],
      default: [
        { title: 'GitHub', url: 'https://github.com' },
        { title: 'YouTube', url: 'https://youtube.com' },
        { title: 'Gmail', url: 'https://mail.google.com' },
        { title: 'Wikipedia', url: 'https://wikipedia.org' },
        { title: 'Hacker News', url: 'https://news.ycombinator.com' },
        { title: 'MDN', url: 'https://developer.mozilla.org' },
      ],
    },
    { key: 'showLabels', label: 'Show labels', type: 'toggle', default: true },
    { key: 'openInNewTab', label: 'Open in a new tab', type: 'toggle', default: false },
  ],
})
