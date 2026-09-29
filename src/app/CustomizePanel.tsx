import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Check, Pipette, RotateCcw, X } from 'lucide-react'
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
import { accents, cardColors, cardDefaults, cardTokens, fonts, rgbChannels } from '@/themes/appearance'
import { cx } from '@/lib/cx'
import { cssUrl, safeUrl } from '@/lib/url'

export function CustomizePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const background = useDashboard((s) => s.background)
  const setBackground = useDashboard((s) => s.setBackground)
  const cardStyle = useDashboard((s) => s.cardStyle)
  const setCardStyle = useDashboard((s) => s.setCardStyle)
  const { cardOpacity, cardBlur, cardColor, font, accent, wallpaperDim } = useDashboard(
    useShallow((s) => ({
      cardOpacity: s.cardOpacity,
      cardBlur: s.cardBlur,
      cardColor: s.cardColor,
      font: s.font,
      accent: s.accent,
      wallpaperDim: s.wallpaperDim,
    })),
  )
  const setAppearance = useDashboard((s) => s.setAppearance)
  const recentWallpapers = useDashboard((s) => s.recentWallpapers)
  const applyWallpaperUrl = useDashboard((s) => s.applyWallpaperUrl)
  const removeRecentWallpaper = useDashboard((s) => s.removeRecentWallpaper)
  const [imageUrl, setImageUrl] = useState('')

  const isActive = (b: Background) => b.type === background.type && b.value === background.value
  const isCustomColor = background.type === 'solid' && !solidPresets.some(isActive)
  const imageUrlValid = /^https?:\/\/\S+$/.test(imageUrl.trim())
  const defaults = cardDefaults(cardStyle, background.tone)
  const isCustomAccent = !accents.some((a) => a.value === accent)
  const isCustomCardColor = cardColor !== null && !cardColors.some((c) => c.value === cardColor)

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
                isActive(preset) && 'ring-2 ring-white ring-offset-2 ring-offset-[#18181b]',
              )}
            />
          ))}
          <label
            title="Custom color"
            className={cx(
              'relative grid size-10 cursor-pointer place-items-center rounded-full border border-dashed border-white/30 text-white/70 transition hover:scale-105',
              isCustomColor && 'ring-2 ring-white ring-offset-2 ring-offset-[#18181b]',
            )}
            style={isCustomColor ? { background: background.value } : undefined}
          >
            <Pipette className="size-4" />
            <input
              type="color"
              aria-label="Custom color"
              className="absolute inset-0 cursor-pointer opacity-0"
              value={isCustomColor ? background.value : '#141416'}
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
          {recentWallpapers.map((url) => {
            const wallpaper: Background = { type: 'image', value: url, tone: 'dark' }
            return (
              <div key={url} className="relative">
                <Swatch label={hostLabel(url)} active={isActive(wallpaper)} onClick={() => setBackground(wallpaper)}>
                  <img src={url} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
                </Swatch>
                <button
                  onClick={() => removeRecentWallpaper(url)}
                  aria-label={`Remove ${hostLabel(url)} wallpaper`}
                  title="Remove from saved wallpapers"
                  className="absolute top-1.5 right-1.5 grid size-6 cursor-pointer place-items-center rounded-full bg-black/55 text-white/85 backdrop-blur-sm transition hover:bg-black/75 hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )
          })}
        </div>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!imageUrlValid) return
            applyWallpaperUrl(imageUrl.trim())
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
            className="shrink-0 cursor-pointer rounded-xl bg-white px-4 text-sm font-medium text-[#18181b] transition disabled:cursor-default disabled:opacity-30"
          >
            Apply
          </button>
        </form>
        {background.type === 'image' && (
          <Slider
            label="Dim"
            value={wallpaperDim}
            max={80}
            onChange={(v) => setAppearance({ wallpaperDim: v })}
          />
        )}
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
              <CardPreview
                style={style.value}
                background={background}
                color={cardColor}
                {...(cardStyle === style.value ? { opacity: cardOpacity, blur: cardBlur } : {})}
              />
              <div className="mt-2 px-1 text-sm font-medium">{style.name}</div>
              <div className="px-1 text-[11px] leading-tight text-white/45">{style.description}</div>
            </button>
          ))}
        </div>
        <Slider label="Opacity" value={cardOpacity ?? defaults.opacity} onChange={(v) => setAppearance({ cardOpacity: v })} />
        <Slider
          label="Blur"
          value={cardBlur ?? defaults.blur}
          max={40}
          unit="px"
          onChange={(v) => setAppearance({ cardBlur: v })}
        />
        <div className="mt-4 text-sm font-medium text-white/90">Card color</div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            title="Style color"
            aria-label="Style color"
            aria-pressed={cardColor === null}
            onClick={() => setAppearance({ cardColor: null })}
            className={cx(
              'grid size-10 cursor-pointer place-items-center rounded-full border border-white/30 text-white/70 transition hover:scale-105',
              cardColor === null && 'ring-2 ring-white ring-offset-2 ring-offset-[#18181b]',
            )}
          >
            <RotateCcw className="size-4" />
          </button>
          {cardColors.map((c) => (
            <button
              key={c.value}
              title={c.name}
              aria-label={c.name}
              aria-pressed={cardColor === c.value}
              onClick={() => setAppearance({ cardColor: c.value })}
              style={{ background: c.value }}
              className={cx(
                'size-10 cursor-pointer rounded-full border border-white/15 transition hover:scale-105',
                cardColor === c.value && 'ring-2 ring-white ring-offset-2 ring-offset-[#18181b]',
              )}
            />
          ))}
          <label
            title="Custom card color"
            className={cx(
              'relative grid size-10 cursor-pointer place-items-center rounded-full border border-dashed border-white/30 text-white/70 transition hover:scale-105',
              isCustomCardColor && 'ring-2 ring-white ring-offset-2 ring-offset-[#18181b]',
            )}
            style={isCustomCardColor ? { background: cardColor } : undefined}
          >
            <Pipette className="size-4" />
            <input
              type="color"
              aria-label="Custom card color"
              className="absolute inset-0 cursor-pointer opacity-0"
              value={cardColor ?? '#232326'}
              onChange={(e) => setAppearance({ cardColor: e.target.value })}
            />
          </label>
        </div>
      </SheetSection>

      <SheetSection title="Typeface">
        <div className="grid grid-cols-3 gap-2">
          {fonts.map((f) => (
            <button
              key={f.id}
              onClick={() => setAppearance({ font: f.id })}
              aria-pressed={font === f.id}
              className={cx(
                'cursor-pointer rounded-2xl border px-3 pt-2.5 pb-2 text-left transition',
                font === f.id ? 'border-white/60 bg-white/10' : 'border-white/10 hover:border-white/25',
              )}
            >
              <div className="text-[26px] leading-none font-semibold tracking-tight tabular-nums" style={{ fontFamily: f.display }}>
                10:24
              </div>
              <div className="mt-2 text-[11px] text-white/55" style={{ fontFamily: f.sans }}>
                {f.name}
              </div>
            </button>
          ))}
        </div>
      </SheetSection>

      <SheetSection title="Accent">
        <div className="flex flex-wrap gap-2">
          {accents.map((a) => (
            <button
              key={a.value}
              title={a.name}
              aria-label={a.name}
              aria-pressed={accent === a.value}
              onClick={() => setAppearance({ accent: a.value })}
              style={{ background: a.value }}
              className={cx(
                'size-10 cursor-pointer rounded-full border border-white/15 transition hover:scale-105',
                accent === a.value && 'ring-2 ring-white ring-offset-2 ring-offset-[#18181b]',
              )}
            />
          ))}
          <label
            title="Custom accent"
            className={cx(
              'relative grid size-10 cursor-pointer place-items-center rounded-full border border-dashed border-white/30 text-white/70 transition hover:scale-105',
              isCustomAccent && 'ring-2 ring-white ring-offset-2 ring-offset-[#18181b]',
            )}
            style={isCustomAccent ? { background: accent } : undefined}
          >
            <Pipette className="size-4" />
            <input
              type="color"
              aria-label="Custom accent"
              className="absolute inset-0 cursor-pointer opacity-0"
              value={accent}
              onChange={(e) => setAppearance({ accent: e.target.value })}
            />
          </label>
        </div>
      </SheetSection>
    </Sheet>
  )
}

const hostLabel = (url: string) => safeUrl(url)?.hostname.replace(/^www\./, '') ?? 'Custom'

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
        'group relative aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-xl border border-white/10 transition hover:scale-[1.03]',
        active && 'ring-2 ring-white ring-offset-2 ring-offset-[#18181b]',
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

function Slider({
  label,
  value,
  max = 100,
  unit = '%',
  onChange,
}: {
  label: string
  value: number
  max?: number
  unit?: string
  onChange: (value: number) => void
}) {
  return (
    <label className="mt-4 block">
      <span className="flex justify-between text-sm">
        <span className="font-medium text-white/90">{label}</span>
        <span className="text-white/50 tabular-nums">
          {value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full cursor-pointer accent-accent"
      />
    </label>
  )
}

/** A miniature widget card rendered with the real card-style tokens over the current background. */
function CardPreview({
  style,
  background,
  color,
  opacity,
  blur,
}: {
  style: CardStyle
  background: Background
  color: string | null
  opacity?: number | null
  blur?: number | null
}) {
  const defaults = cardDefaults(style, background.tone)
  const bg = background.type === 'image' ? { background: `center/cover ${cssUrl(background.value)}` } : { background: background.value }
  const vars = {
    '--card-alpha': (opacity ?? defaults.opacity) / 100,
    '--card-blur': `${blur ?? defaults.blur}px`,
    ...(color && { '--card-rgb': rgbChannels(color) }),
  } as React.CSSProperties
  return (
    <div
      data-card={cardTokens(style, color)}
      data-tone={background.tone}
      className="relative h-14 overflow-hidden rounded-xl"
      style={{ ...bg, ...vars }}
    >
      <div className="widget-card absolute inset-2 rounded-lg p-1.5">
        <div className="h-1.5 w-8 rounded-full bg-fg/80" />
        <div className="mt-1 h-1.5 w-5 rounded-full bg-muted" />
      </div>
    </div>
  )
}
