import { AnimatePresence, motion } from 'motion/react'
import { Check, LayoutGrid, Palette, Plus, Settings, type LucideIcon } from 'lucide-react'
import { useDashboard } from '@/store/dashboardStore'
import { cx } from '@/lib/cx'
import { Logo } from './Logo'

interface Props {
  onAddWidget: () => void
  onCustomize: () => void
  onSettings: () => void
}

export function Toolbar({ onAddWidget, onCustomize, onSettings }: Props) {
  const isEditing = useDashboard((s) => s.isEditing)
  const setEditing = useDashboard((s) => s.setEditing)

  return (
    <header className="relative z-40 flex items-center justify-between gap-3 px-4 pt-4 lg:px-5">
      <Logo />

      <AnimatePresence>
        {isEditing && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="chrome-surface absolute left-1/2 hidden -translate-x-1/2 rounded-full px-4 py-2 text-xs text-white/70 lg:block"
          >
            Drag to move · Pull a corner to resize · <kbd className="font-sans text-white">Esc</kbd> to finish
          </motion.p>
        )}
      </AnimatePresence>

      <nav aria-label="Dashboard" className="chrome-surface flex items-center gap-1 rounded-full p-1.5">
        <ToolbarButton icon={Plus} label="Add widget" onClick={onAddWidget} variant="primary" />
        <ToolbarButton
          icon={isEditing ? Check : LayoutGrid}
          label={isEditing ? 'Done' : 'Edit'}
          onClick={() => setEditing(!isEditing)}
          variant={isEditing ? 'active' : 'default'}
          pressed={isEditing}
        />
        <ToolbarButton icon={Palette} label="Customize" onClick={onCustomize} />
        <ToolbarButton icon={Settings} label="Settings" onClick={onSettings} iconOnly />
      </nav>
    </header>
  )
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  iconOnly,
  pressed,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
  variant?: 'default' | 'primary' | 'active'
  iconOnly?: boolean
  pressed?: boolean
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={cx(
        'flex h-9 cursor-pointer items-center gap-2 rounded-full text-sm font-medium transition active:scale-95',
        iconOnly ? 'w-9 justify-center' : 'px-3 sm:px-4',
        variant === 'primary' && 'bg-accent-gradient text-[#2a0f1c] shadow-md shadow-accent/30 hover:brightness-105',
        variant === 'active' && 'bg-white text-[#1a1726]',
        variant === 'default' && 'text-white/80 hover:bg-white/10 hover:text-white',
      )}
    >
      <Icon className="size-4" strokeWidth={2.25} />
      {!iconOnly && <span className="hidden sm:inline">{label}</span>}
    </button>
  )
}
