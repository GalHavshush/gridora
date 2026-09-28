import { useCallback, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { Background } from '@/components/Background'
import { LogoMark } from '@/components/Logo'
import { Toolbar } from '@/components/Toolbar'
import { useDashboard } from '@/store/dashboardStore'
import { CustomizePanel } from './CustomizePanel'
import { SettingsPanel } from './SettingsPanel'
import { WidgetGrid } from './WidgetGrid'
import { WidgetPicker } from './WidgetPicker'
import { WidgetSettingsPanel } from './WidgetSettingsPanel'

type Panel = { kind: 'picker' | 'customize' | 'settings' } | { kind: 'widget'; id: string } | null

export function Dashboard() {
  const [panel, setPanel] = useState<Panel>(null)
  const hasWidgets = useDashboard((s) => s.widgets.length > 0)
  const cardStyle = useDashboard((s) => s.cardStyle)
  const tone = useDashboard((s) => s.background.tone)
  const addWidget = useDashboard((s) => s.addWidget)
  const setEditing = useDashboard((s) => s.setEditing)

  const close = useCallback(() => setPanel(null), [])
  const openWidgetSettings = useCallback((id: string) => setPanel({ kind: 'widget', id }), [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (panel) setPanel(null)
      else setEditing(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [panel, setEditing])

  const handleAdd = (type: string) => {
    const id = addWidget(type)
    setPanel(null)
    // Wait for the grid to place the new widget, then bring it into view.
    setTimeout(() => document.getElementById(`widget-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150)
  }

  return (
    <div data-card={cardStyle} data-tone={tone} className="min-h-dvh">
      <Background />
      <Toolbar
        onAddWidget={() => setPanel({ kind: 'picker' })}
        onCustomize={() => setPanel({ kind: 'customize' })}
        onSettings={() => setPanel({ kind: 'settings' })}
      />
      <main className="pb-8">
        {hasWidgets ? (
          <WidgetGrid onOpenSettings={openWidgetSettings} />
        ) : (
          <EmptyState onAdd={() => setPanel({ kind: 'picker' })} />
        )}
      </main>

      <WidgetPicker open={panel?.kind === 'picker'} onClose={close} onAdd={handleAdd} />
      <WidgetSettingsPanel instanceId={panel?.kind === 'widget' ? panel.id : null} onClose={close} />
      <CustomizePanel open={panel?.kind === 'customize'} onClose={close} />
      <SettingsPanel open={panel?.kind === 'settings'} onClose={close} />
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center text-page"
    >
      <LogoMark className="size-16 rounded-[18px] shadow-2xl shadow-black/30" />
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl">A blank canvas.</h1>
      <p className="mt-2 max-w-sm text-page-muted">Your web, arranged your way. Start with a clock, your bookmarks or a feed.</p>
      <button
        onClick={onAdd}
        className="bg-accent-gradient mt-6 flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 font-medium text-[#2a0f1c] shadow-lg shadow-accent/30 transition hover:brightness-105 active:scale-95"
      >
        <Plus className="size-4" strokeWidth={2.5} /> Add your first widget
      </button>
    </motion.div>
  )
}
