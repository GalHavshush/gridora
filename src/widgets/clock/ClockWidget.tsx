import { useEffect, useState } from 'react'
import type { WidgetProps } from '@/widget-sdk'

export type ClockSettings = {
  format: '12h' | '24h'
  timeZone: string
  label: string
  showSeconds: boolean
  showDate: boolean
}

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return now
}

export function ClockWidget({ settings, size }: WidgetProps<ClockSettings>) {
  const now = useNow()
  const timeZone = settings.timeZone === 'local' ? undefined : settings.timeZone

  const parts = new Intl.DateTimeFormat(undefined, {
    hour: settings.format === '12h' ? 'numeric' : '2-digit',
    minute: '2-digit',
    second: settings.showSeconds ? '2-digit' : undefined,
    hourCycle: settings.format === '12h' ? 'h12' : 'h23',
    timeZone,
  }).formatToParts(now)
  const time = parts
    .filter((p) => p.type !== 'dayPeriod')
    .map((p) => p.value)
    .join('')
    .trim()
  const period = parts.find((p) => p.type === 'dayPeriod')?.value

  const date = new Intl.DateTimeFormat(undefined, {
    weekday: size.w >= 3 ? 'long' : 'short',
    month: 'long',
    day: 'numeric',
    timeZone,
  }).format(now)

  const label = settings.label || (timeZone ? timeZone.split('/').pop()!.replace(/_/g, ' ') : 'Local time')

  return (
    <div className="flex h-full flex-col justify-between p-5">
      <div className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">{label}</div>
      <div>
        <div className="flex items-baseline gap-1.5 font-display leading-none font-semibold tracking-tight tabular-nums">
          <span style={{ fontSize: settings.showSeconds ? 'clamp(1.75rem, 19cqi, 5.5rem)' : 'clamp(2rem, 26cqi, 7rem)' }}>
            {time}
          </span>
          {period && <span className="text-base font-medium text-muted">{period}</span>}
        </div>
        {settings.showDate && <div className="mt-2 truncate text-sm text-muted">{date}</div>}
      </div>
    </div>
  )
}
