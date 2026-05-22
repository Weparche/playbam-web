import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import { MOCK_ANIMATOR_USER, MOCK_OWNER } from '../data/mock/seed'
import type { PartnerRole, PartnerUser } from '../types'

const STORAGE_KEY = 'vidimose-partner-auth-v1'

type PartnerAuthContextValue = {
  user: PartnerUser | null
  loginAsOwner: () => void
  loginAsAnimator: () => void
  logout: () => void
  isOwnerLike: boolean
  isAnimator: boolean
}

const PartnerAuthContext = createContext<PartnerAuthContextValue | null>(null)

function readStoredUser(): PartnerUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PartnerUser) : null
  } catch {
    return null
  }
}

export function PartnerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PartnerUser | null>(() => readStoredUser())

  const persist = useCallback((next: PartnerUser | null) => {
    if (next) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setUser(next)
  }, [])

  const loginAsOwner = useCallback(() => persist(MOCK_OWNER), [persist])
  const loginAsAnimator = useCallback(() => persist(MOCK_ANIMATOR_USER), [persist])
  const logout = useCallback(() => persist(null), [persist])

  const value = useMemo(
    () => ({
      user,
      loginAsOwner,
      loginAsAnimator,
      logout,
      isOwnerLike: Boolean(user && (['owner', 'staff', 'super_admin'] as PartnerRole[]).includes(user.role)),
      isAnimator: user?.role === 'animator',
    }),
    [user, loginAsOwner, loginAsAnimator, logout],
  )

  return <PartnerAuthContext.Provider value={value}>{children}</PartnerAuthContext.Provider>
}

export function usePartnerAuth() {
  const ctx = useContext(PartnerAuthContext)
  if (!ctx) throw new Error('usePartnerAuth must be used within PartnerAuthProvider')
  return ctx
}
