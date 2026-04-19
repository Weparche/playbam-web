/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

import {
  readStoredTemporaryIdentity,
  writeStoredTemporaryIdentity,
  type TemporaryWebIdentity,
} from '../lib/tempWebIdentity'
import { readStoredSession, writeStoredSession, type VidimoseSession } from '../lib/vidimoseSession'
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<VidimoseSession | null>(() => readStoredSession())
  const [user, setUser] = useState<TemporaryWebIdentity | null>(() => {
    const sess = readStoredSession()
    if (sess) return sessionToIdentity(sess)
    return readStoredTemporaryIdentity()
  })

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      login: (identity: TemporaryWebIdentity) => {
        const next = {
          email: identity.email.trim().toLowerCase(),
          parentName: identity.parentName.trim(),
        }
        setUser(next)
        writeStoredTemporaryIdentity(next)
        return next
      },
      logout: () => {
        setUser(null)
        setSession(null)
        writeStoredTemporaryIdentity(null)
        const stored = readStoredSession()
        writeStoredSession(null)
        if (stored) {
          authLogout().catch(() => {})
        }
      },
      sessionLogin: (sess: VidimoseSession) => {
        writeStoredSession(sess)
        setSession(sess)
        const identity = sessionToIdentity(sess)
        writeStoredTemporaryIdentity(identity)
        setUser(identity)
      },
    }),
    [user, session],
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
