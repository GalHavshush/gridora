import { useEffect, useState } from 'react'

interface AsyncState<T> {
  data?: T
  error?: Error
  loading: boolean
}

/**
 * Loads data for a widget and optionally refreshes it on an interval.
 * `key` identifies the request: when it changes, the loader runs again.
 */
export function useAsyncData<T>(
  key: string,
  loader: (signal: AbortSignal) => Promise<T>,
  refreshMs?: number,
): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ loading: true })
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const run = () => {
      setState((s) => ({ ...s, loading: true }))
      loader(controller.signal)
        .then((data) => setState({ data, loading: false }))
        .catch((error: Error) => {
          if (!controller.signal.aborted) setState({ error, loading: false })
        })
    }
    run()
    const timer = refreshMs ? setInterval(run, refreshMs) : undefined
    return () => {
      controller.abort()
      clearInterval(timer)
    }
    // `loader` is intentionally excluded: callers pass inline functions and `key` captures their inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, refreshMs, nonce])

  return { ...state, reload: () => setNonce((n) => n + 1) }
}
