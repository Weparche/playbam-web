import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

const CHUNK_RETRY_KEY = 'vidimose-chunk-reload'

/**
 * Lazy import s jednim auto-reloadom kad chunk faila (npr. stari SW cache nakon deploya).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithRetry(factory: () => Promise<{ default: ComponentType<any> }>) {
  return lazy(async () => {
    try {
      const module = await factory()
      sessionStorage.removeItem(CHUNK_RETRY_KEY)
      return module
    } catch (error) {
      const retried = sessionStorage.getItem(CHUNK_RETRY_KEY)
      if (!retried) {
        sessionStorage.setItem(CHUNK_RETRY_KEY, '1')
        window.location.reload()
        return new Promise<{ default: ComponentType<any> }>(() => {})
      }
      sessionStorage.removeItem(CHUNK_RETRY_KEY)
      throw error
    }
  }) as LazyExoticComponent<ComponentType<any>>
}
