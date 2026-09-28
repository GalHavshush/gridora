import type { ReactNode } from 'react'

/** A centered empty/error state with an optional action. Uses the card tokens, so it fits any theme. */
export function WidgetMessage({
  icon,
  text,
  action,
  onAction,
}: {
  icon?: ReactNode
  text: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center">
      {icon && <div className="text-muted">{icon}</div>}
      <p className="max-w-[28ch] text-sm leading-snug text-muted">{text}</p>
      {action && onAction && (
        <button
          onClick={onAction}
          className="cursor-pointer rounded-full bg-subtle px-3 py-1.5 text-xs font-medium transition hover:bg-line"
        >
          {action}
        </button>
      )}
    </div>
  )
}
