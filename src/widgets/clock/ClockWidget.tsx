import { useEffect, useState } from 'react'
import type { WidgetProps } from '@/widget-sdk'
import { timeParts } from './timeParts'

export type ClockSettings = {
  style: 'digital' | 'analog' | 'stacked'
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

  const date = new Intl.DateTimeFormat(undefined, {
    weekday: size.w >= 3 ? 'long' : 'short',
    month: 'long',
    day: 'numeric',
    timeZone,
  }).format(now)

  const label = settings.label || (timeZone ? timeZone.split('/').pop()!.replace(/_/g, ' ') : 'Local time')
  const labelEl = <div className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">{label}</div>

  if (settings.style === 'analog') {
    const { hour, minute, second } = timeParts(now, timeZone, '24h')
    return (
      <div className="flex h-full flex-col p-5">
        {labelEl}
        <AnalogFace hour={+hour} minute={+minute} second={settings.showSeconds ? +second : undefined} />
        {settings.showDate && size.h >= 3 && <div className="truncate text-center text-sm text-muted">{date}</div>}
      </div>
    )
  }

  const { hour, minute, second, period } = timeParts(now, timeZone, settings.format)
  // Intl pads 12-hour times too; drop the leading zero there so it reads "9:41", not "09:41".
  const h = settings.format === '12h' ? String(+hour) : hour

  if (settings.style === 'stacked') {
    const suffix = [settings.showSeconds && second, period].filter(Boolean).join(' ')
    return (
      <div className="flex h-full flex-col p-5">
        {labelEl}
        {/* Sized against its own box so two lines of digits fit however the widget is resized. */}
        <div className="flex min-h-0 flex-1 flex-col justify-end [container-type:size]">
          <div
            className="font-display leading-[0.85] font-semibold tracking-tight tabular-nums"
            style={{ fontSize: 'min(9rem, 60cqi, 56cqb)' }}
          >
            <div>{hour}</div>
            <div className="text-muted">{minute}</div>
          </div>
        </div>
        {(suffix || settings.showDate) && (
          <div className="mt-2 flex justify-between gap-2 text-sm text-muted">
            <span className="truncate">{settings.showDate && date}</span>
            {suffix && <span className="shrink-0 tabular-nums">{suffix}</span>}
          </div>
        )}
      </div>
    )
  }

  const time = [h, minute, settings.showSeconds && second].filter(Boolean).join(':')
  return (
    <div className="flex h-full flex-col justify-between p-5">
      {labelEl}
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

function AnalogFace({ hour, minute, second }: { hour: number; minute: number; second?: number }) {
  const minuteAngle = (minute + (second ?? 0) / 60) * 6
  const hourAngle = ((hour % 12) + minute / 60) * 30
  return (
    <svg viewBox="0 0 100 100" className="mx-auto my-2 min-h-0 w-full flex-1" role="img" aria-label={`${hour}:${String(minute).padStart(2, '0')}`}>
      {Array.from({ length: 60 }, (_, i) => {
        const major = i % 5 === 0
        return (
          <line
            key={i}
            x1="50"
            y1="3"
            x2="50"
            y2={major ? 10 : 6}
            stroke="currentColor"
            strokeWidth={major ? 2 : 0.8}
            strokeLinecap="round"
            opacity={major ? 0.85 : 0.3}
            transform={`rotate(${i * 6} 50 50)`}
          />
        )
      })}
      <line x1="50" y1="50" x2="50" y2="26" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" transform={`rotate(${hourAngle} 50 50)`} />
      <line x1="50" y1="50" x2="50" y2="14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" transform={`rotate(${minuteAngle} 50 50)`} />
      {second !== undefined && (
        <line x1="50" y1="58" x2="50" y2="10" stroke="var(--color-accent)" strokeWidth="1.2" strokeLinecap="round" transform={`rotate(${second * 6} 50 50)`} />
      )}
      <circle cx="50" cy="50" r="3" fill={second !== undefined ? 'var(--color-accent)' : 'currentColor'} />
    </svg>
  )
}
