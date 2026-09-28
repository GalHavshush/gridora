import { useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import type { ListSetting, NumberSetting, SelectSetting, TextSetting, WidgetSetting } from '@/widget-sdk'
import { cx } from '@/lib/cx'

export const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-accent/70 focus:bg-white/[0.09]'

interface FieldProps<S extends WidgetSetting> {
  setting: S
  value: unknown
  onChange: (value: unknown) => void
  /** Hide the label (used inside list items, where placeholders are enough). */
  compact?: boolean
}

/** Renders the right control for one entry of a widget's settings schema. */
export function SettingField({ setting, value, onChange, compact }: FieldProps<WidgetSetting>) {
  if (setting.type === 'toggle') {
    return (
      <div className="flex items-center justify-between gap-4">
        <FieldLabel label={setting.label} description={setting.description} />
        <Toggle label={setting.label} checked={Boolean(value)} onChange={onChange} />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {!compact && <FieldLabel label={setting.label} description={setting.description} />}
      {setting.type === 'select' && <SelectControl setting={setting} value={value} onChange={onChange} />}
      {setting.type === 'list' && <ListControl setting={setting} value={value} onChange={onChange} />}
      {(setting.type === 'text' || setting.type === 'url' || setting.type === 'number') && (
        // Keyed by value so the draft resets when the stored value changes elsewhere.
        <DraftInput key={String(value)} setting={setting} value={value} onChange={onChange} />
      )}
    </div>
  )
}

function FieldLabel({ label, description }: { label: string; description?: string }) {
  return (
    <div>
      <div className="text-sm font-medium text-white/90">{label}</div>
      {description && <div className="mt-0.5 text-xs text-white/45">{description}</div>}
    </div>
  )
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors',
        checked ? 'bg-accent-gradient' : 'bg-white/15',
      )}
    >
      <span
        className={cx(
          'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform',
          checked && 'translate-x-5',
        )}
      />
    </button>
  )
}

/** Text and number inputs commit on blur/Enter so widgets don't refetch on every keystroke. */
function DraftInput({ setting, value, onChange }: FieldProps<TextSetting | NumberSetting>) {
  const [draft, setDraft] = useState(String(value ?? ''))

  const commit = () => {
    if (setting.type !== 'number') return onChange(draft.trim())
    const n = Number(draft)
    if (draft === '' || Number.isNaN(n)) return setDraft(String(value ?? ''))
    onChange(Math.min(setting.max ?? Infinity, Math.max(setting.min ?? -Infinity, n)))
  }

  return (
    <input
      className={inputClass}
      type={setting.type === 'number' ? 'number' : setting.type === 'url' ? 'url' : 'text'}
      value={draft}
      placeholder={('placeholder' in setting && setting.placeholder) || setting.label}
      min={setting.type === 'number' ? setting.min : undefined}
      max={setting.type === 'number' ? setting.max : undefined}
      step={setting.type === 'number' ? setting.step : undefined}
      aria-label={setting.label}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && commit()}
    />
  )
}

function SelectControl({ setting, value, onChange }: FieldProps<SelectSetting>) {
  if (setting.options.length > 3) {
    return (
      <select
        className={cx(inputClass, 'cursor-pointer appearance-none')}
        value={String(value ?? '')}
        aria-label={setting.label}
        onChange={(e) => onChange(e.target.value)}
      >
        {setting.options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#1a1726]">
            {o.label}
          </option>
        ))}
      </select>
    )
  }
  return (
    <div role="radiogroup" aria-label={setting.label} className="flex gap-1 rounded-xl bg-white/[0.06] p-1">
      {setting.options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            'flex-1 cursor-pointer rounded-lg px-3 py-1.5 text-sm transition',
            value === o.value ? 'bg-white text-[#1a1726] shadow' : 'text-white/65 hover:text-white',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function ListControl({ setting, value, onChange }: FieldProps<ListSetting>) {
  const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : []
  const itemLabel = setting.itemLabel ?? 'item'
  const update = (next: Record<string, unknown>[]) => onChange(next)
  const move = (from: number, to: number) => {
    const next = [...items]
    next.splice(to, 0, ...next.splice(from, 1))
    update(next)
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="space-y-1.5 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/50">
              {String(item[setting.fields[0]?.key] || `${itemLabel} ${index + 1}`)}
            </span>
            <div className="flex gap-0.5 text-white/50">
              <IconAction label="Move up" disabled={index === 0} onClick={() => move(index, index - 1)}>
                <ArrowUp className="size-3.5" />
              </IconAction>
              <IconAction label="Move down" disabled={index === items.length - 1} onClick={() => move(index, index + 1)}>
                <ArrowDown className="size-3.5" />
              </IconAction>
              <IconAction label={`Remove ${itemLabel}`} onClick={() => update(items.filter((_, i) => i !== index))}>
                <Trash2 className="size-3.5" />
              </IconAction>
            </div>
          </div>
          {setting.fields.map((field) => (
            <SettingField
              key={field.key}
              compact
              setting={field}
              value={item[field.key]}
              onChange={(v) => update(items.map((it, i) => (i === index ? { ...it, [field.key]: v } : it)))}
            />
          ))}
        </div>
      ))}
      <button
        onClick={() => update([...items, {}])}
        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-dashed border-white/15 py-2.5 text-sm text-white/60 transition hover:border-white/30 hover:text-white"
      >
        <Plus className="size-4" /> Add {itemLabel}
      </button>
    </div>
  )
}

function IconAction({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-7 cursor-pointer place-items-center rounded-lg transition hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  )
}
