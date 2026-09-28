export type Units = 'metric' | 'imperial'

/** Provider-neutral conditions; each provider maps its own codes onto these. */
export type Condition = 'clear' | 'partly-cloudy' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm'

export interface WeatherReport {
  location: string
  units: Units
  current: {
    temperature: number
    feelsLike: number
    humidity: number
    windSpeed: number
    condition: Condition
    isDay: boolean
  }
  daily: { date: string; min: number; max: number; condition: Condition }[]
}

export type WeatherProvider = (location: string, units: Units, signal?: AbortSignal) => Promise<WeatherReport>
