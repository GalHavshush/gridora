import type { CSSProperties } from 'react'
import { toneForColor, type CardStyle, type Tone } from './backgrounds'

/** Card surface defaults, as percentages / px. Glass needs more body on light backgrounds to stay legible. */
export function cardDefaults(style: CardStyle, tone: Tone): { opacity: number; blur: number } {
  if (style === 'glass') return { opacity: tone === 'light' ? 50 : 10, blur: 28 }
  return { opacity: style === 'light' ? 94 : 90, blur: 0 }
}

export type FontId = 'grotesk' | 'serif' | 'mono' | 'rounded' | 'condensed' | 'system'

const geist = "'Geist', ui-sans-serif, system-ui, sans-serif"
const system = 'ui-sans-serif, system-ui, sans-serif'

/** Typefaces for widget content. Every family is in the Google Fonts link in index.html. */
export const fonts: { id: FontId; name: string; display: string; sans: string }[] = [
  { id: 'grotesk', name: 'Grotesk', display: `'Bricolage Grotesque', ${geist}`, sans: geist },
  { id: 'serif', name: 'Serif', display: "'Fraunces', ui-serif, Georgia, serif", sans: geist },
  { id: 'mono', name: 'Mono', display: "'Geist Mono', ui-monospace, monospace", sans: "'Geist Mono', ui-monospace, monospace" },
  { id: 'rounded', name: 'Rounded', display: `'Fredoka', ${geist}`, sans: geist },
  { id: 'condensed', name: 'Condensed', display: `'Barlow Condensed', ${geist}`, sans: geist },
  { id: 'system', name: 'System', display: system, sans: system },
]

export const fontById = (id: FontId) => fonts.find((f) => f.id === id) ?? fonts[0]

export const accents = [
  { name: 'Coral', value: '#ff7a6b' },
  { name: 'Amber', value: '#ffb547' },
  { name: 'Mint', value: '#5ee6b8' },
  { name: 'Sky', value: '#6cb8ff' },
  { name: 'Lilac', value: '#b69cff' },
  { name: 'Rose', value: '#ff7eb6' },
]

export const defaultAccent = accents[0].value

/** Card colors offered next to the style's own color. Text flips light/dark to match. */
export const cardColors = [
  { name: 'Graphite', value: '#232326' },
  { name: 'Slate', value: '#283041' },
  { name: 'Moss', value: '#26332b' },
  { name: 'Sand', value: '#eee6d6' },
]

/**
 * The card-token set to use. A custom color on an opaque style picks light or dark text from
 * the color itself; glass stays translucent, so its text keeps following the background.
 */
export function cardTokens(cardStyle: CardStyle, cardColor: string | null): CardStyle {
  if (!cardColor || cardStyle === 'glass') return cardStyle
  return toneForColor(cardColor) === 'light' ? 'light' : 'dark'
}

/** `#rrggbb` → `r g b`, the form `--card-rgb` uses. */
export function rgbChannels(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
}

interface AppearanceInput {
  cardStyle: CardStyle
  tone: Tone
  cardOpacity: number | null
  cardBlur: number | null
  cardColor: string | null
  font: FontId
  accent: string
}

/** CSS variables that carry the user's appearance choices down to widgets and chrome. */
export function appearanceVars({ cardStyle, tone, cardOpacity, cardBlur, cardColor, font, accent }: AppearanceInput) {
  const defaults = cardDefaults(cardStyle, tone)
  const { display, sans } = fontById(font)
  return {
    '--card-alpha': (cardOpacity ?? defaults.opacity) / 100,
    '--card-blur': `${cardBlur ?? defaults.blur}px`,
    ...(cardColor && { '--card-rgb': rgbChannels(cardColor) }),
    '--widget-display': display,
    '--widget-sans': sans,
    '--color-accent': accent,
    '--color-accent-fg': toneForColor(accent) === 'light' ? '#2a0f1c' : '#fff',
  } as CSSProperties
}
