export type VidimoseSession = {
  token: string
  email: string
  displayName: string
}

const SESSION_STORAGE_KEY = 'vidimose-session'

export function readStoredSession(): VidimoseSession | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<VidimoseSession>
    if (!parsed.token || !parsed.email) return null
    return { token: parsed.token, email: parsed.email, displayName: parsed.displayName || '' }
  } catch {
    return null
  }
}

export function writeStoredSession(session: VidimoseSession | null): void {
  if (typeof window === 'undefined') return
  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    return
  }
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}
