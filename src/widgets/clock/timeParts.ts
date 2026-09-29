/** Zero-padded clock fields for `now` in `timeZone`; `period` is AM/PM in 12-hour mode. */
export function timeParts(now: Date, timeZone: string | undefined, format: '12h' | '24h') {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: format === '12h' ? 'h12' : 'h23',
    timeZone,
  }).formatToParts(now)
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ''
  return { hour: get('hour'), minute: get('minute'), second: get('second'), period: get('dayPeriod') || undefined }
}
