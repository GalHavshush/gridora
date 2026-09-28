import { useEffect, useId, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { cx } from '@/lib/cx'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  /** `drawer` slides in from the right; `modal` is centered. */
  variant?: 'drawer' | 'modal'
  children: ReactNode
}

export function Sheet({ open, onClose, title, description, variant = 'drawer', children }: Props) {
  const titleId = useId()
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (open) panelRef.current?.focus()
  }, [open])

  const isDrawer = variant === 'drawer'

  return (
    <AnimatePresence>
      {open && (
        <div
          className={cx(
            'fixed inset-0 z-50 flex',
            isDrawer ? 'justify-end p-3' : 'items-start justify-center px-3 pt-[8vh] pb-3',
          )}
        >
          <motion.div
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={isDrawer ? { opacity: 0, x: 48 } : { opacity: 0, y: 20, scale: 0.98 }}
            animate={isDrawer ? { opacity: 1, x: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={isDrawer ? { opacity: 0, x: 48 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            className={cx(
              'chrome-surface relative flex flex-col rounded-[28px] text-white outline-none',
              isDrawer ? 'h-full w-full max-w-[420px]' : 'max-h-[84vh] w-full max-w-[780px]',
            )}
          >
            <header className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
              <div>
                <h2 id={titleId} className="font-display text-xl font-semibold tracking-tight">
                  {title}
                </h2>
                {description && <p className="mt-1 text-sm text-white/55">{description}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full bg-white/8 text-white/70 transition hover:bg-white/15 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

/** A titled group inside a sheet. */
export function SheetSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6 first:mt-0">
      <h3 className="mb-3 text-[11px] font-semibold tracking-[0.14em] text-white/45 uppercase">{title}</h3>
      {children}
    </section>
  )
}
