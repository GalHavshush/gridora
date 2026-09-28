import { createElement } from 'react'
import { Droplets, MapPin, Wind, type LucideProps } from 'lucide-react'
import { useAsyncData, WidgetMessage, type WidgetProps } from '@/widget-sdk'
import { getWeather, type Condition, type Units } from '@/services/weather'
import { conditionGlow, conditionIcon, conditionLabel } from './conditions'

export type WeatherSettings = {
  location: string
  units: Units
}

const THIRTY_MINUTES = 30 * 60 * 1000

export function WeatherWidget({ settings, size, openSettings }: WidgetProps<WeatherSettings>) {
  const { location, units } = settings
  const { data, error, loading } = useAsyncData(
    `${location}|${units}`,
    (signal) => getWeather(location, units, signal),
    THIRTY_MINUTES,
  )

  if (!location) return <WidgetMessage text="Set a location to see the weather." action="Choose location" onAction={openSettings} />
  if (error && !data) return <WidgetMessage text={error.message} action="Change location" onAction={openSettings} />
  if (!data) return <Skeleton loading={loading} />

  const { current } = data
  const showForecast = size.h >= 3 && size.w >= 3
  const showDetails = size.w >= 4
  const speed = units === 'imperial' ? 'mph' : 'km/h'

  return (
    <div className="relative flex h-full flex-col p-5">
      <div
        className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full opacity-35 blur-3xl"
        style={{ background: conditionGlow[current.condition] }}
      />
      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1 text-sm font-medium">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{data.location}</span>
          </div>
          <div className="mt-0.5 text-xs text-muted">{conditionLabel[current.condition]}</div>
        </div>
        <ConditionIcon condition={current.condition} isDay={current.isDay} className="size-9 shrink-0" strokeWidth={1.5} style={{ color: conditionGlow[current.condition] }} />
      </div>

      <div className="relative mt-auto flex items-end justify-between gap-3">
        <div className="font-display leading-none font-semibold tracking-tight" style={{ fontSize: 'clamp(2.5rem, 24cqi, 5rem)' }}>
          {current.temperature}°
        </div>
        <div className="pb-1 text-right text-xs text-muted">
          {showDetails && (
            <div className="mb-1 flex items-center justify-end gap-3">
              <span className="flex items-center gap-1">
                <Droplets className="size-3" /> {current.humidity}%
              </span>
              <span className="flex items-center gap-1">
                <Wind className="size-3" /> {current.windSpeed} {speed}
              </span>
            </div>
          )}
          <div>
            H {data.daily[0].max}° · L {data.daily[0].min}°
          </div>
        </div>
      </div>

      {showForecast && (
        <div className="relative mt-4 grid grid-cols-5 gap-1 border-t border-line pt-3">
          {data.daily.slice(1, 6).map((day) => {
            return (
              <div key={day.date} className="flex flex-col items-center gap-1 text-xs">
                <span className="text-muted">
                  {new Date(`${day.date}T12:00`).toLocaleDateString(undefined, { weekday: 'short' })}
                </span>
                <ConditionIcon condition={day.condition} className="size-4" strokeWidth={1.75} />
                <span className="font-medium tabular-nums">{day.max}°</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Skeleton({ loading }: { loading: boolean }) {
  return (
    <div className={`flex h-full flex-col gap-3 p-5 ${loading ? 'animate-pulse' : ''}`}>
      <div className="h-4 w-24 rounded-full bg-subtle" />
      <div className="mt-auto h-12 w-20 rounded-xl bg-subtle" />
    </div>
  )
}

function ConditionIcon({ condition, isDay, ...props }: { condition: Condition; isDay?: boolean } & LucideProps) {
  return createElement(conditionIcon(condition, isDay), props)
}
