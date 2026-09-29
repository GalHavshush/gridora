import { Plus } from 'lucide-react'
import { Sheet } from '@/components/Sheet'
import { widgetRegistry } from '@/widget-sdk/registry'

interface Props {
  open: boolean
  onClose: () => void
  onAdd: (type: string) => void
}

/** The widget library. Generated entirely from the registry. */
export function WidgetPicker({ open, onClose, onAdd }: Props) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      variant="modal"
      title="Widget library"
      description="Add as many as you like — every widget can be used more than once."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {widgetRegistry.map(({ id, name, description, icon: Icon, defaultSize }) => (
          <li key={id}>
            <button
              onClick={() => onAdd(id)}
              className="group flex w-full cursor-pointer items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4 text-left transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]"
            >
              <span className="bg-accent-gradient grid size-12 shrink-0 place-items-center rounded-2xl text-accent-fg shadow-lg shadow-accent/20">
                <Icon className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-medium">{name}</span>
                  <SizeHint w={defaultSize.w} h={defaultSize.h} />
                </span>
                <span className="mt-1 block text-sm leading-snug text-white/55">{description}</span>
              </span>
              <Plus className="mt-1 size-5 shrink-0 text-white/30 transition group-hover:text-white" />
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}

/** A tiny 12-column preview of how much room the widget takes by default. */
function SizeHint({ w, h }: { w: number; h: number }) {
  return (
    <span className="ml-auto flex items-center gap-1.5 text-[11px] text-white/40" title={`${w} × ${h} cells`}>
      <svg viewBox="0 0 24 8" className="h-2 w-6" aria-hidden="true">
        <rect width="24" height="8" rx="1.5" fill="currentColor" opacity=".25" />
        <rect width={(w / 12) * 24} height={Math.min(8, h * 2)} rx="1.5" fill="currentColor" />
      </svg>
      {w}×{h}
    </span>
  )
}
