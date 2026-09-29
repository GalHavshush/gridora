export type Tone = 'light' | 'dark'

export interface Background {
  type: 'gradient' | 'solid' | 'image'
  /** A CSS background value for gradients/solids, an image URL for images. */
  value: string
  /** Whether content on top should use dark or light text. */
  tone: Tone
}

export interface BackgroundPreset extends Background {
  name: string
}

const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2400&q=80`

export const gradientPresets: BackgroundPreset[] = [
  {
    name: 'Aurora',
    type: 'gradient',
    tone: 'dark',
    value:
      'radial-gradient(at 8% 12%, #ff8a5b 0, transparent 42%), radial-gradient(at 92% 8%, #7b5cff 0, transparent 48%), radial-gradient(at 78% 92%, #ff4f8b 0, transparent 44%), radial-gradient(at 12% 96%, #22b8ff 0, transparent 46%), #141416',
  },
  {
    name: 'Dusk',
    type: 'gradient',
    tone: 'dark',
    value: 'linear-gradient(160deg, #1b1830 0%, #3a2a5d 45%, #b4577a 100%)',
  },
  {
    name: 'Lagoon',
    type: 'gradient',
    tone: 'dark',
    value:
      'radial-gradient(at 20% 20%, #1dd3b0 0, transparent 45%), radial-gradient(at 85% 30%, #2f6bff 0, transparent 50%), radial-gradient(at 50% 100%, #0c8599 0, transparent 55%), #081a2b',
  },
  {
    name: 'Ember',
    type: 'gradient',
    tone: 'dark',
    value:
      'radial-gradient(at 15% 85%, #ff6a3d 0, transparent 45%), radial-gradient(at 85% 15%, #b3124f 0, transparent 50%), #1a0d12',
  },
  {
    name: 'Forest',
    type: 'gradient',
    tone: 'dark',
    value: 'linear-gradient(150deg, #0b2e25 0%, #16624a 55%, #8fb86c 100%)',
  },
  {
    name: 'Mist',
    type: 'gradient',
    tone: 'light',
    value:
      'radial-gradient(at 10% 10%, #c7d2fe 0, transparent 50%), radial-gradient(at 90% 20%, #fbcfe8 0, transparent 50%), radial-gradient(at 50% 100%, #fde68a 0, transparent 55%), #f4f1ec',
  },
]

export const solidPresets: BackgroundPreset[] = [
  { name: 'Onyx', type: 'solid', tone: 'dark', value: '#141416' },
  { name: 'Ink', type: 'solid', tone: 'dark', value: '#0b1020' },
  { name: 'Charcoal', type: 'solid', tone: 'dark', value: '#1f1d1b' },
  { name: 'Moss', type: 'solid', tone: 'dark', value: '#243b2f' },
  { name: 'Paper', type: 'solid', tone: 'light', value: '#f4f1ec' },
  { name: 'Sage', type: 'solid', tone: 'light', value: '#dfe7e0' },
]

export const imagePresets: BackgroundPreset[] = [
  { name: 'Summit', type: 'image', tone: 'dark', value: unsplash('1506905925346-21bda4d32df4') },
  { name: 'Starlight', type: 'image', tone: 'dark', value: unsplash('1519681393784-d120267933ba') },
  { name: 'Fog', type: 'image', tone: 'dark', value: unsplash('1470071459604-3b5ec3a7fe05') },
  { name: 'Shore', type: 'image', tone: 'dark', value: unsplash('1507525428034-b723cf961d3e') },
]

export const defaultBackground: Background = gradientPresets[0]

/** Picks a readable text tone for an arbitrary hex color. */
export function toneForColor(hex: string): Tone {
  const n = parseInt(hex.replace('#', ''), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? 'light' : 'dark'
}

export type CardStyle = 'glass' | 'light' | 'dark'

export const cardStyles: { value: CardStyle; name: string; description: string }[] = [
  { value: 'glass', name: 'Glass', description: 'Frosted and translucent' },
  { value: 'light', name: 'Light', description: 'Crisp paper cards' },
  { value: 'dark', name: 'Dark', description: 'Deep, low-glare cards' },
]
