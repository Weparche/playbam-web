/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  readStoredTemporaryIdentity,
  writeStoredTemporaryIdentity,
  type TemporaryWebIdentity,
} from '../lib/tempWebIdentity'
import {
  readStoredSession,
  VIDIMOSE_SESSION_INVALIDATED_EVENT,
  writeStoredSession,
  type VidimoseSession,
} from '../lib/vidimoseSession'
import { authLogout } from '../lib/invitationApi'

type AuthContextValue = {
  user: TemporaryWebIdentity | null
  session: VidimoseSession | null
  login: (identity: TemporaryWebIdentity) => TemporaryWebIdentity
  logout: () => void
  sessionLogin: (session: VidimoseSession) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function sessionToIdentity(session: VidimoseSession): TemporaryWebIdentity {
  return { email: session.email, parentName: session.displayName }
}

const PROFILE_PENDING_KEY = 'vidimose-profile-pending'
export const markProfilePending = () => localStorage.setItem(PROFILE_PENDING_KEY, '1')
export const clearProfilePending = () => localStorage.removeItem(PROFILE_PENDING_KEY)
const isProfilePending = () => !!localStorage.getItem(PROFILE_PENDING_KEY)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<VidimoseSession | null>(() => {
    const sess = readStoredSession()
    if (sess && isProfilePending()) {
      writeStoredSession(null)
      clearProfilePending()
      authLogout().catch(() => {})
      return null
    }
    return sess
  })
  const [user, setUser] = useState<TemporaryWebIdentity | null>(() => {
    const sess = readStoredSession()
    if (sess) return sessionToIdentity(sess)
    return readStoredTemporaryIdentity()
  })

  useEffect(() => {
    const clearInvalidSession = () => {
      setSession(null)
      setUser(null)
      writeStoredTemporaryIdentity(null)
    }
    const syncSessionFromAnotherTab = (event: StorageEvent) => {
      if (event.key !== 'vidimose-session' || event.newValue !== null) return
      clearInvalidSession()
    }

    window.addEventListener(VIDIMOSE_SESSION_INVALIDATED_EVENT, clearInvalidSession)
    window.addEventListener('storage', syncSessionFromAnotherTab)
    return () => {
      window.removeEventListener(VIDIMOSE_SESSION_INVALIDATED_EVENT, clearInvalidSession)
      window.removeEventListener('storage', syncSessionFromAnotherTab)
    }
  }, [])

  const login = useCallback((identity: TemporaryWebIdentity) => {
    const next = {
      email: identity.email.trim().toLowerCase(),
      parentName: identity.parentName.trim(),
    }
    setUser(next)
    writeStoredTemporaryIdentity(next)
    return next
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setSession(null)
    writeStoredTemporaryIdentity(null)
    const stored = readStoredSession()
    writeStoredSession(null)
    if (stored) {
      authLogout().catch(() => {})
    }
  }, [])

  const sessionLogin = useCallback((sess: VidimoseSession) => {
    writeStoredSession(sess)
    setSession(sess)
    const identity = sessionToIdentity(sess)
    writeStoredTemporaryIdentity(identity)
    setUser(identity)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      login,
      logout,
      sessionLogin,
    }),
    [user, session, login, logout, sessionLogin],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
