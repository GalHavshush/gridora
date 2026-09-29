import { CloudSun } from 'lucide-react'
import { defineWidget } from '@/widget-sdk'
import { WeatherWidget, type WeatherSettings } from './WeatherWidget'

export default defineWidget<WeatherSettings>({
  id: 'weather',
  name: 'Weather',
  description: 'Current conditions and a five-day forecast.',
  version: '1.0.0',
  icon: CloudSun,
  component: WeatherWidget,
  defaultSize: { w: 3, h: 3 },
  minSize: { w: 2, h: 2 },
  settings: [
    {
      key: 'style',
      label: 'Style',
      type: 'select',
      default: 'classic',
      options: [
        { label: 'Classic', value: 'classic' },
        { label: 'Minimal', value: 'minimal' },
        { label: 'Week', value: 'week' },
      ],
    },
    { key: 'location', label: 'Location', type: 'text', default: 'London', placeholder: 'City name' },
    {
      key: 'units',
      label: 'Units',
      type: 'select',
      default: 'metric',
      options: [
        { label: '°C', value: 'metric' },
        { label: '°F', value: 'imperial' },
      ],
    },
  ],
})
