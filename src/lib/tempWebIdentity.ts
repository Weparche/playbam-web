export type TemporaryWebIdentity = {
  email: string
  parentName: string
}

export const TEMP_WEB_IDENTITY_STORAGE_KEY = 'playbam-web-session'

export function readStoredTemporaryIdentity(): TemporaryWebIdentity | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(TEMP_WEB_IDENTITY_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<TemporaryWebIdentity>
    const email = parsed.email?.trim().toLowerCase() ?? ''
    const parentName = parsed.parentName?.trim() ?? ''

    if (!email || !parentName) {
      return null
    }

    return {
      email,
      parentName,
    }
  } catch {
    return null
  }
}

export function writeStoredTemporaryIdentity(identity: TemporaryWebIdentity | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (!identity) {
    window.localStorage.removeItem(TEMP_WEB_IDENTITY_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(TEMP_WEB_IDENTITY_STORAGE_KEY, JSON.stringify(identity))
}

export function buildTemporaryIdentityHeaders(identity: TemporaryWebIdentity | null) {
  if (!identity) {
    return {}
  }

  return {
    'X-Playbam-User-Email': identity.email,
    'X-Playbam-User-Name': identity.parentName,
  }
}
