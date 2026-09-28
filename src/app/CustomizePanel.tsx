import { useState } from 'react'
import { Check, Pipette } from 'lucide-react'
import { inputClass } from '@/components/SettingField'
import { Sheet, SheetSection } from '@/components/Sheet'
import { useDashboard } from '@/store/dashboardStore'
import {
  cardStyles,
  gradientPresets,
  imagePresets,
  solidPresets,
  toneForColor,
  type Background,
  type CardStyle,
} from '@/themes/backgrounds'
import { cx } from '@/lib/cx'
import { cssUrl } from '@/lib/url'

export function CustomizePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const background = useDashboard((s) => s.background)
  const setBackground = useDashboard((s) => s.setBackground)
  const cardStyle = useDashboard((s) => s.cardStyle)
  const setCardStyle = useDashboard((s) => s.setCardStyle)
  const [imageUrl, setImageUrl] = useState('')

  const isActive = (b: Background) => b.type === background.type && b.value === background.value
  const isCustomColor = background.type === 'solid' && !solidPresets.some(isActive)
  const imageUrlValid = /^https?:\/\/\S+$/.test(imageUrl.trim())

  return (
    <Sheet open={open} onClose={onClose} title="Customize" description="Make Gridora feel like yours.">
      <SheetSection title="Gradients">
        <div className="grid grid-cols-3 gap-2">
          {gradientPresets.map((preset) => (
            <Swatch key={preset.name} label={preset.name} active={isActive(preset)} onClick={() => setBackground(preset)}>
              <span className="absolute inset-0" style={{ background: preset.value }} />
            </Swatch>
          ))}
        </div>
      </SheetSection>

      <SheetSection title="Solid colors">
        <div className="flex flex-wrap gap-2">
          {solidPresets.map((preset) => (
            <button
              key={preset.name}
              title={preset.name}
              aria-label={preset.name}
              onClick={() => setBackground(preset)}
              style={{ background: preset.value }}
              className={cx(
                'size-10 cursor-pointer rounded-full border border-white/15 transition hover:scale-105',
                isActive(preset) && 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1726]',
              )}
            />
          ))}
          <label
            title="Custom color"
            className={cx(
              'relative grid size-10 cursor-pointer place-items-center rounded-full border border-dashed border-white/30 text-white/70 transition hover:scale-105',
              isCustomColor && 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1726]',
            )}
            style={isCustomColor ? { background: background.value } : undefined}
          >
            <Pipette className="size-4" />
            <input
              type="color"
              aria-label="Custom color"
              className="absolute inset-0 cursor-pointer opacity-0"
              value={isCustomColor ? background.value : '#15122b'}
              onChange={(e) => setBackground({ type: 'solid', value: e.target.value, tone: toneForColor(e.target.value) })}
            />
          </label>
        </div>
      </SheetSection>

      <SheetSection title="Wallpapers">
        <div className="grid grid-cols-2 gap-2">
          {imagePresets.map((preset) => (
            <Swatch key={preset.name} label={preset.name} active={isActive(preset)} onClick={() => setBackground(preset)}>
              <img
                src={preset.value.replace('w=2400', 'w=480')}
                alt=""
                loading="lazy"
                className="absolute inset-0 size-full object-cover"
              />
            </Swatch>
          ))}
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!imageUrlValid) return
            setBackground({ type: 'image', value: imageUrl.trim(), tone: 'dark' })
            setImageUrl('')
          }}
        >
          <input
            className={inputClass}
            type="url"
            placeholder="Paste an image URL…"
            aria-label="Wallpaper image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <button
            disabled={!imageUrlValid}
            className="shrink-0 cursor-pointer rounded-xl bg-white px-4 text-sm font-medium text-[#1a1726] transition disabled:cursor-default disabled:opacity-30"
          >
            Apply
          </button>
        </form>
      </SheetSection>

      <SheetSection title="Widget style">
        <div className="grid grid-cols-3 gap-2">
          {cardStyles.map((style) => (
            <button
              key={style.value}
              onClick={() => setCardStyle(style.value)}
              className={cx(
                'cursor-pointer rounded-2xl border p-2 text-left transition',
                cardStyle === style.value ? 'border-white/60 bg-white/10' : 'border-white/10 hover:border-white/25',
              )}
            >
              <CardPreview style={style.value} background={background} />
              <div className="mt-2 px-1 text-sm font-medium">{style.name}</div>
              <div className="px-1 text-[11px] leading-tight text-white/45">{style.description}</div>
            </button>
          ))}
        </div>
      </SheetSection>
    </Sheet>
  )
}

function Swatch({
  label,
  active,
  onClick,
  children,
}: {
  label: string
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cx(
        'group relative aspect-[16/10] cursor-pointer overflow-hidden rounded-xl border border-white/10 transition hover:scale-[1.03]',
        active && 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1726]',
      )}
    >
      {children}
      <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-2 pt-4 pb-1.5 text-[11px] font-medium text-white">
        {label}
        {active && <Check className="size-3.5" />}
      </span>
    </button>
  )
}

/** A miniature widget card rendered with the real card-style tokens over the current background. */
function CardPreview({ style, background }: { style: CardStyle; background: Background }) {
  const bg = background.type === 'image' ? { background: `center/cover ${cssUrl(background.value)}` } : { background: background.value }
  return (
    <div data-card={style} data-tone={background.tone} className="relative h-14 overflow-hidden rounded-xl" style={bg}>
      <div className="widget-card absolute inset-2 rounded-lg p-1.5">
        <div className="h-1.5 w-8 rounded-full bg-fg/80" />
        <div className="mt-1 h-1.5 w-5 rounded-full bg-muted" />
      </div>
    </div>
  )
}
