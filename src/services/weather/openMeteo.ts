import type { Condition, WeatherProvider } from './types'

// Open-Meteo is free, keyless and CORS-enabled, so Gridora can show real weather without a backend.
// https://open-meteo.com/en/docs

function toCondition(code: number): Condition {
  if (code === 0) return 'clear'
  if (code <= 2) return 'partly-cloudy'
  if (code === 3) return 'cloudy'
  if (code <= 48) return 'fog'
  if (code <= 57) return 'drizzle'
  if (code <= 67 || (code >= 80 && code <= 82)) return 'rain'
  if (code <= 77 || code === 85 || code === 86) return 'snow'
  return 'storm'
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Weather service responded with ${res.status}`)
  return res.json() as Promise<T>
}

interface GeoResponse {
  results?: { name: string; latitude: number; longitude: number; country_code?: string }[]
}

interface ForecastResponse {
  current: {
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    wind_speed_10m: number
    weather_code: number
    is_day: number
  }
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[] }
}

export const getOpenMeteoWeather: WeatherProvider = async (location, units, signal) => {
  const geo = await getJson<GeoResponse>(
    `https://geocoding-api.open-meteo.com/v1/search?count=1&name=${encodeURIComponent(location)}`,
    signal,
  )
  const place = geo.results?.[0]
  if (!place) throw new Error(`Couldn't find “${location}”`)

  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    forecast_days: '6',
    ...(units === 'imperial' && { temperature_unit: 'fahrenheit', wind_speed_unit: 'mph' }),
  })
  const data = await getJson<ForecastResponse>(`https://api.open-meteo.com/v1/forecast?${params}`, signal)

  return {
    location: place.name,
    units,
    current: {
      temperature: Math.round(data.current.temperature_2m),
      feelsLike: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
      condition: toCondition(data.current.weather_code),
      isDay: data.current.is_day === 1,
    },
    daily: data.daily.time.map((date, i) => ({
      date,
      min: Math.round(data.daily.temperature_2m_min[i]),
      max: Math.round(data.daily.temperature_2m_max[i]),
      condition: toCondition(data.daily.weather_code[i]),
    })),
  }
}
