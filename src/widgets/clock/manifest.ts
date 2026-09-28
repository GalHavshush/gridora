import { Clock3 } from 'lucide-react'
import { defineWidget } from '@/widget-sdk'
import { ClockWidget, type ClockSettings } from './ClockWidget'

const timeZones = [
  ['Local time', 'local'],
  ['Los Angeles', 'America/Los_Angeles'],
  ['New York', 'America/New_York'],
  ['São Paulo', 'America/Sao_Paulo'],
  ['London', 'Europe/London'],
  ['Berlin', 'Europe/Berlin'],
  ['Jerusalem', 'Asia/Jerusalem'],
  ['Dubai', 'Asia/Dubai'],
  ['Mumbai', 'Asia/Kolkata'],
  ['Singapore', 'Asia/Singapore'],
  ['Tokyo', 'Asia/Tokyo'],
  ['Sydney', 'Australia/Sydney'],
]

export default defineWidget<ClockSettings>({
  id: 'clock',
  name: 'Clock',
  description: 'The time and date, anywhere in the world.',
  version: '1.0.0',
  icon: Clock3,
  component: ClockWidget,
  defaultSize: { w: 3, h: 3 },
  minSize: { w: 2, h: 2 },
  settings: [
    {
      key: 'format',
      label: 'Time format',
      type: 'select',
      default: '24h',
      options: [
        { label: '12-hour', value: '12h' },
        { label: '24-hour', value: '24h' },
      ],
    },
    { key: 'timeZone', label: 'Time zone', type: 'select', default: 'local', options: timeZones.map(([label, value]) => ({ label, value })) },
    { key: 'label', label: 'Label', type: 'text', placeholder: 'e.g. Tokyo office', default: '' },
    { key: 'showSeconds', label: 'Show seconds', type: 'toggle', default: false },
    { key: 'showDate', label: 'Show date', type: 'toggle', default: true },
  ],
})
