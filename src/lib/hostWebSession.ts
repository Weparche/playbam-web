export const HOST_WEB_TOKEN_STORAGE_KEY = 'playbam-host-session-token'

export function readStoredHostToken() {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(HOST_WEB_TOKEN_STORAGE_KEY)?.trim() ?? ''
}

export function writeStoredHostToken(token: string | null) {
  if (typeof window === 'undefined') {
    return
  }

  const normalizedToken = token?.trim() ?? ''
  if (!normalizedToken) {
    window.localStorage.removeItem(HOST_WEB_TOKEN_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(HOST_WEB_TOKEN_STORAGE_KEY, normalizedToken)
}
