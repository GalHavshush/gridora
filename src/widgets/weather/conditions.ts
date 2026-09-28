import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudMoon, CloudRain, CloudSnow, CloudSun, Moon, Sun } from 'lucide-react'
import type { Condition } from '@/services/weather'

export const conditionLabel: Record<Condition, string> = {
  clear: 'Clear',
  'partly-cloudy': 'Partly cloudy',
  cloudy: 'Cloudy',
  fog: 'Foggy',
  drizzle: 'Drizzle',
  rain: 'Rain',
  snow: 'Snow',
  storm: 'Thunderstorm',
}

export function conditionIcon(condition: Condition, isDay = true) {
  switch (condition) {
    case 'clear':
      return isDay ? Sun : Moon
    case 'partly-cloudy':
      return isDay ? CloudSun : CloudMoon
    case 'cloudy':
      return Cloud
    case 'fog':
      return CloudFog
    case 'drizzle':
      return CloudDrizzle
    case 'rain':
      return CloudRain
    case 'snow':
      return CloudSnow
    case 'storm':
      return CloudLightning
  }
}

/** A warm or cool glow behind the icon, tinted by the weather. */
export const conditionGlow: Record<Condition, string> = {
  clear: '#ffb547',
  'partly-cloudy': '#ffc670',
  cloudy: '#9fb3c8',
  fog: '#b8c4cf',
  drizzle: '#6fb7ff',
  rain: '#4c9dff',
  snow: '#d8ecff',
  storm: '#a78bfa',
}
