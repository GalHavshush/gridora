import { AnimatePresence, motion } from 'motion/react'
import { useDashboard } from '@/store/dashboardStore'
import type { Background as BackgroundValue } from '@/themes/backgrounds'
import { cssUrl } from '@/lib/url'

function toCss({ type, value }: BackgroundValue) {
  if (type !== 'image') return { background: value }
  return {
    backgroundImage: `linear-gradient(rgb(0 0 0 / 0.28), rgb(0 0 0 / 0.08) 35%, rgb(0 0 0 / 0.32)), ${cssUrl(value)}`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
}

/** Full-viewport dashboard background that cross-fades when changed. */
export function Background() {
  const background = useDashboard((s) => s.background)
  return (
    <div className="fixed inset-0 -z-10 bg-[#15122b]" aria-hidden="true">
      <AnimatePresence initial={false}>
        <motion.div
          key={background.type + background.value}
          className="absolute inset-0"
          style={toCss(background)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      </AnimatePresence>
    </div>
  )
}
