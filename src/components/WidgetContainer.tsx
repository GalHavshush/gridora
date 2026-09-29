import { useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Minus, SlidersHorizontal } from 'lucide-react'
import { getDefaultSettings, getWidget } from '@/widget-sdk/registry'
import type { WidgetSettings } from '@/widget-sdk'
import { useDashboard, type WidgetInstance } from '@/store/dashboardStore'
import { cx } from '@/lib/cx'
import { WidgetErrorBoundary } from './WidgetErrorBoundary'

interface Props {
  instance: WidgetInstance
  isEditing: boolean
  onOpenSettings: (id: string) => void
}

/** Shared chrome around every widget: card surface, edit controls and error isolation. */
export function WidgetContainer({ instance, isEditing, onOpenSettings }: Props) {
  const definition = getWidget(instance.type)
  const updateWidgetSettings = useDashboard((s) => s.updateWidgetSettings)
  const removeWidget = useDashboard((s) => s.removeWidget)

  const settings = useMemo(
    () => ({ ...getDefaultSettings(definition), ...instance.settings }),
    [definition, instance.settings],
  )
  const updateSettings = useCallback(
    (patch: WidgetSettings) => updateWidgetSettings(instance.id, patch),
    [instance.id, updateWidgetSettings],
  )
  const openSettings = useCallback(() => onOpenSettings(instance.id), [instance.id, onOpenSettings])
  const { w, h } = instance.position
  const size = useMemo(() => ({ w, h }), [w, h])

  const Widget = definition?.component
  const name = definition?.name ?? instance.type

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className={cx('relative h-full', isEditing && 'cursor-grab active:cursor-grabbing')}
    >
      <div
        inert={isEditing}
        data-frameless={instance.frameless || undefined}
        className={cx(
          'widget-card @container h-full overflow-hidden rounded-[26px] transition-[transform,box-shadow,outline-color] duration-200',
          'outline-2 outline-offset-2 outline-transparent',
          isEditing && 'outline-white/35',
        )}
      >
        <WidgetErrorBoundary name={name}>
          {Widget ? (
            <Widget
              instanceId={instance.id}
              settings={settings}
              updateSettings={updateSettings}
              openSettings={openSettings}
              isEditing={isEditing}
              size={size}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted">
              The “{instance.type}” widget isn’t installed.
            </div>
          )}
        </WidgetErrorBoundary>
      </div>

      <AnimatePresence>
        {isEditing && (
          <>
            <EditButton className="-top-2.5 -left-2.5" label={`Remove ${name}`} onClick={() => removeWidget(instance.id)}>
              <Minus className="size-4" strokeWidth={3} />
            </EditButton>
            {definition && (
              <EditButton className="-top-2.5 -right-2.5" label={`${name} settings`} onClick={openSettings}>
                <SlidersHorizontal className="size-3.5" strokeWidth={2.5} />
              </EditButton>
            )}
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="chrome-surface pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-medium whitespace-nowrap text-white/85"
            >
              {name} · {w}×{h}
            </motion.span>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function EditButton({
  className,
  label,
  onClick,
  children,
}: {
  className: string
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cx(
        'no-drag absolute z-10 grid size-7 cursor-pointer place-items-center rounded-full bg-white text-[#1a1726] shadow-lg shadow-black/30 transition hover:scale-110',
        className,
      )}
    >
      {children}
    </motion.button>
  )
}
