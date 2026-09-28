import { Component, type ReactNode } from 'react'

interface Props {
  name?: string
  children: ReactNode
}

/** Keeps one misbehaving widget from taking the whole dashboard down. */
export class WidgetErrorBoundary extends Component<Props, { error?: Error }> {
  state: { error?: Error } = {}

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
        <p className="text-sm font-medium">{this.props.name ?? 'This widget'} ran into a problem.</p>
        <p className="line-clamp-2 text-xs text-muted">{this.state.error.message}</p>
        <button
          onClick={() => this.setState({ error: undefined })}
          className="mt-1 rounded-full bg-subtle px-3 py-1 text-xs font-medium hover:bg-line"
        >
          Try again
        </button>
      </div>
    )
  }
}
