import { useRef, useState } from 'react'
import { Download, ExternalLink, RotateCcw, Upload } from 'lucide-react'
import { LogoMark } from '@/components/Logo'
import { Sheet, SheetSection } from '@/components/Sheet'
import { useDashboard } from '@/store/dashboardStore'
import { snapshotOf } from '@/store/snapshot'

const REPO_URL = 'https://github.com/GalHavshush/gridora'

export function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const importDashboard = useDashboard((s) => s.importDashboard)
  const resetDashboard = useDashboard((s) => s.resetDashboard)
  const fileInput = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string }>()

  const exportDashboard = () => {
    const data = { app: 'gridora', exportedAt: new Date().toISOString(), ...snapshotOf(useDashboard.getState()) }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const link = Object.assign(document.createElement('a'), { href: url, download: 'gridora-dashboard.json' })
    link.click()
    URL.revokeObjectURL(url)
  }

  const importFile = async (file: File) => {
    try {
      const data: unknown = JSON.parse(await file.text())
      importDashboard(data) // throws before touching anything if the file isn't a dashboard
      setMessage({ tone: 'ok', text: 'Dashboard imported.' })
    } catch (error) {
      setMessage({ tone: 'error', text: error instanceof SyntaxError ? 'That file isn’t valid JSON.' : (error as Error).message })
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Settings" description="Your dashboard lives in this browser.">
      <SheetSection title="Backup & share">
        <div className="grid grid-cols-2 gap-2">
          <ActionButton icon={<Download className="size-4" />} label="Export" onClick={exportDashboard} />
          <ActionButton icon={<Upload className="size-4" />} label="Import" onClick={() => fileInput.current?.click()} />
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) importFile(file)
            e.target.value = ''
          }}
        />
        {message && (
          <p className={`mt-2 text-sm ${message.tone === 'ok' ? 'text-emerald-300' : 'text-red-300'}`}>{message.text}</p>
        )}
        <p className="mt-3 text-xs leading-relaxed text-white/45">
          Exports include your layout, widget settings and background. Import a file to restore it or to use a layout
          someone shared with you.
        </p>
      </SheetSection>

      <SheetSection title="Start over">
        <ActionButton
          icon={<RotateCcw className="size-4" />}
          label="Reset to the default dashboard"
          danger
          onClick={() => {
            if (confirm('Reset Gridora? Your widgets, notes and background will be replaced with the defaults.')) {
              resetDashboard()
              setMessage(undefined)
            }
          }}
        />
      </SheetSection>

      <SheetSection title="About">
        <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <LogoMark className="size-11 rounded-xl" />
          <div className="min-w-0 flex-1">
            <div className="font-display font-semibold">Gridora {__APP_VERSION__}</div>
            <div className="text-sm text-white/55">Your web, arranged your way.</div>
          </div>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-sm text-white/70 hover:text-white"
          >
            GitHub <ExternalLink className="size-3.5" />
          </a>
        </div>
      </SheetSection>
    </Sheet>
  )
}

function ActionButton({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border py-2.5 text-sm transition ${
        danger ? 'border-red-400/20 text-red-300 hover:bg-red-500/10' : 'border-white/10 bg-white/[0.05] hover:bg-white/10'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
