import { createElement } from 'react'
import { Droplets, MapPin, Wind, type LucideProps } from 'lucide-react'
import { useAsyncData, WidgetMessage, type WidgetProps } from '@/widget-sdk'
import { getWeather, type Condition, type Units, type WeatherReport } from '@/services/weather'
import { conditionGlow, conditionIcon, conditionLabel } from './conditions'

export type WeatherSettings = {
  style: 'classic' | 'minimal' | 'week'
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
  if (settings.style === 'minimal') return <Minimal data={data} />
  if (settings.style === 'week') return <Week data={data} days={Math.min(6, size.h * 2 - 2)} />

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
                <span className="text-muted">{weekday(day.date)}</span>
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

const weekday = (date: string) => new Date(`${date}T12:00`).toLocaleDateString(undefined, { weekday: 'short' })

function Minimal({ data }: { data: WeatherReport }) {
  const { current } = data
  const glow = conditionGlow[current.condition]
  return (
    <div className="relative flex h-full flex-col items-center justify-center p-4 text-center [container-type:size]">
      <div className="pointer-events-none absolute inset-0 m-auto size-3/4 rounded-full opacity-25 blur-3xl" style={{ background: glow }} />
      <ConditionIcon
        condition={current.condition}
        isDay={current.isDay}
        className="relative size-[min(22cqi,24cqb)] min-w-6"
        strokeWidth={1.25}
        style={{ color: glow }}
      />
      <div className="relative mt-1 font-display leading-none font-semibold tracking-tight" style={{ fontSize: 'min(6rem, 26cqi, 36cqb)' }}>
        {current.temperature}°
      </div>
      <div className="relative mt-2 max-w-full truncate text-xs text-muted">{data.location}</div>
    </div>
  )
}

function Week({ data, days }: { data: WeatherReport; days: number }) {
  const rows = data.daily.slice(0, days)
  const lo = Math.min(...rows.map((d) => d.min))
  const span = Math.max(1, Math.max(...rows.map((d) => d.max)) - lo)
  return (
    <div className="flex h-full flex-col p-5">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1 text-sm font-medium">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{data.location}</span>
        </div>
        <span className="font-display text-2xl leading-none font-semibold tracking-tight">{data.current.temperature}°</span>
      </div>
      <ul className="mt-auto space-y-1.5 pt-3">
        {rows.map((day, i) => (
          <li key={day.date} className="grid grid-cols-[2.75rem_1rem_2rem_1fr_2rem] items-center gap-2 text-xs">
            <span className="truncate text-muted">{i === 0 ? 'Today' : weekday(day.date)}</span>
            <ConditionIcon condition={day.condition} className="size-4" strokeWidth={1.75} />
            <span className="text-right text-muted tabular-nums">{day.min}°</span>
            <span className="relative h-1.5 rounded-full bg-subtle">
              <span
                className="bg-accent-gradient absolute inset-y-0 rounded-full"
                style={{ left: `${((day.min - lo) / span) * 100}%`, right: `${100 - ((day.max - lo) / span) * 100}%` }}
              />
            </span>
            <span className="font-medium tabular-nums">{day.max}°</span>
          </li>
        ))}
      </ul>
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
