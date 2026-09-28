import { NotebookPen } from 'lucide-react'
import { defineWidget } from '@/widget-sdk'
import { NotesWidget, type NotesSettings } from './NotesWidget'

export default defineWidget<NotesSettings>({
  id: 'notes',
  name: 'Notes',
  description: 'A quick scratchpad that saves as you type.',
  version: '1.0.0',
  icon: NotebookPen,
  component: NotesWidget,
  defaultSize: { w: 3, h: 3 },
  minSize: { w: 2, h: 2 },
  // `content` is stored in settings too, but it's edited in the widget itself, so it isn't listed here.
  settings: [{ key: 'title', label: 'Title', type: 'text', default: 'Notes' }],
})
