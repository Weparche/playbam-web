import { useEffect, useState } from 'react'

/**
 * Returns a debounced copy of `value` that only updates after `delayMs`
 * of no further changes. Used for search inputs and the command palette
 * so we don't re-filter large lists on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = 200): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(id)
  }, [value, delayMs])

  return debounced
}
