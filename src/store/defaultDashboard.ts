import type { WidgetInstance } from './snapshot'

/** The dashboard a first-time visitor sees. */
export function defaultWidgets(): Omit<WidgetInstance, 'id'>[] {
  const widget = (type: string, x: number, y: number, w: number, h: number, settings = {}) => ({
    type,
    position: { x, y, w, h },
    settings,
  })

  return [
    widget('clock', 0, 0, 4, 3),
    widget('search', 4, 0, 8, 1),
    widget('bookmarks', 4, 1, 5, 2),
    widget('weather', 9, 1, 3, 3),
    widget('notes', 0, 3, 4, 4, {
      content: 'Welcome to Gridora ✦\n\n• Press Edit to drag, resize and remove widgets\n• Add Widget opens the widget library\n• Customize changes the background\n\nEverything is saved in your browser.',
    }),
    widget('rss', 4, 3, 5, 4),
    widget('clock', 9, 4, 3, 3, { label: 'Tokyo', timeZone: 'Asia/Tokyo' }),
  ]
}
