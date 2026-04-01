/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

import {
  readStoredTemporaryIdentity,
  writeStoredTemporaryIdentity,
  type TemporaryWebIdentity,
} from '../lib/tempWebIdentity'

type AuthContextValue = {
  user: TemporaryWebIdentity | null
  login: (identity: TemporaryWebIdentity) => TemporaryWebIdentity
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TemporaryWebIdentity | null>(() => readStoredTemporaryIdentity())

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: (identity: TemporaryWebIdentity) => {
        const nextUser = {
          email: identity.email.trim().toLowerCase(),
          parentName: identity.parentName.trim(),
        }

        setUser(nextUser)
        writeStoredTemporaryIdentity(nextUser)
        return nextUser
      },
      logout: () => {
        setUser(null)
        writeStoredTemporaryIdentity(null)
      },
    }),
    [user],
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
