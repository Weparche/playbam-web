import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import { createMockPartnerRepository } from '../data/mockPartnerRepository'
import type { PartnerRepository } from '../data/partnerRepository'
import { addDays, startOfMonth, todayKey, tomorrowKey } from '../lib/dates'
import { calculateReservationPrice } from '../lib/pricing'
import type {
  Animator,
  BirthdayPackage,
  BirthdayReservation,
  BookingAddon,
  CreateReservationInput,
  Customer,
  PartnerDataStore,
  Playroom,
  ReservationChecklist,
  ReservationFilters,
  ReservationStatus,
} from '../types'

type PartnerDataContextValue = {
  store: PartnerDataStore
  playroom: Playroom
  packages: BirthdayPackage[]
  addons: BookingAddon[]
  animators: Animator[]
  customers: Customer[]
  reservations: BirthdayReservation[]
  todayReservations: BirthdayReservation[]
  tomorrowReservations: BirthdayReservation[]
  weekReservations: BirthdayReservation[]
  monthReservations: (monthKey: string) => BirthdayReservation[]
  alerts: {
    missingAnimator: BirthdayReservation[]
    missingDeposit: BirthdayReservation[]
    pendingConfirmation: BirthdayReservation[]
  }
  stats: {
    todayCount: number
    weekCount: number
    pendingConfirmationCount: number
    waitingDepositCount: number
    monthRevenue: number
  }
  refresh: () => void
  resetDemoData: () => void
  updatePlayroom: (patch: Partial<Playroom>) => void
  listReservations: (filters?: ReservationFilters) => BirthdayReservation[]
  getReservation: (id: string) => BirthdayReservation | null
  getCustomer: (id: string) => Customer | null
  createReservation: (input: CreateReservationInput) => BirthdayReservation
  updateReservation: (id: string, patch: Partial<BirthdayReservation>) => void
  updateReservationStatus: (id: string, status: ReservationStatus) => void
  assignAnimators: (id: string, animatorIds: string[]) => void
  updateChecklist: (id: string, checklist: ReservationChecklist) => void
  updateAnimatorArrival: (id: string, status: BirthdayReservation['animatorArrivalStatus']) => void
  markDepositPaid: (id: string) => void
  confirmReservation: (id: string) => void
  completeReservation: (id: string) => void
  cancelReservation: (id: string) => void
  createPackage: (input: Omit<BirthdayPackage, 'id' | 'playroomId'>) => void
  updatePackage: (id: string, patch: Partial<BirthdayPackage>) => void
  deletePackage: (id: string) => void
  createAddon: (input: Omit<BookingAddon, 'id' | 'playroomId'>) => void
  updateAddon: (id: string, patch: Partial<BookingAddon>) => void
  deleteAddon: (id: string) => void
  createAnimator: (input: Omit<Animator, 'id' | 'playroomId'>) => void
  updateAnimator: (id: string, patch: Partial<Animator>) => void
  deleteAnimator: (id: string) => void
  createCustomer: (input: Omit<Customer, 'id'>) => void
  updateCustomer: (id: string, patch: Partial<Customer>) => void
  calculatePrice: (packageId: string, childrenCount: number, addonIds: string[]) => number
  reservationsForAnimator: (animatorId: string, dateKey?: string) => BirthdayReservation[]
}

const PartnerDataContext = createContext<PartnerDataContextValue | null>(null)

function createRepository(): PartnerRepository {
  return createMockPartnerRepository()
}

export function PartnerDataProvider({ children }: { children: ReactNode }) {
  const [repo] = useState(() => createRepository())
  const [store, setStore] = useState<PartnerDataStore>(() => repo.getStore())

  const refresh = useCallback(() => setStore(repo.getStore()), [repo])

  const value = useMemo<PartnerDataContextValue>(() => {
    const today = todayKey()
    const tomorrow = tomorrowKey()
    const weekEnd = addDays(today, 7)
    const monthStart = startOfMonth(today)

    const activeReservations = store.reservations.filter((r) => r.status !== 'cancelled')
    const todayReservations = activeReservations.filter((r) => r.date === today)
    const tomorrowReservations = activeReservations.filter((r) => r.date === tomorrow)
    const weekReservations = activeReservations.filter((r) => r.date >= today && r.date <= weekEnd)

    const missingAnimator = activeReservations.filter(
      (r) =>
        r.date >= today &&
        r.assignedAnimatorIds.length === 0 &&
        !['completed', 'cancelled', 'new_request'].includes(r.status),
    )
    const missingDeposit = activeReservations.filter(
      (r) => !r.depositPaid && ['waiting_deposit', 'pending_confirmation', 'confirmed'].includes(r.status),
    )
    const pendingConfirmation = activeReservations.filter((r) => r.status === 'pending_confirmation')

    const monthRevenue = store.reservations
      .filter((r) => r.date >= monthStart && r.status === 'completed')
      .reduce((sum, r) => sum + r.totalPrice, 0)

    return {
      store,
      playroom: store.playroom,
      packages: repo.listPackages(),
      addons: repo.listAddons(),
      animators: repo.listAnimators(),
      customers: repo.listCustomers(),
      reservations: repo.listReservations(),
      todayReservations,
      tomorrowReservations,
      weekReservations,
      monthReservations: (monthKey: string) =>
        store.reservations.filter((r) => r.date.startsWith(monthKey) && r.status !== 'cancelled'),
      alerts: { missingAnimator, missingDeposit, pendingConfirmation },
      stats: {
        todayCount: todayReservations.length,
        weekCount: weekReservations.length,
        pendingConfirmationCount: pendingConfirmation.length,
        waitingDepositCount: missingDeposit.length,
        monthRevenue,
      },
      refresh,
      resetDemoData: () => {
        repo.resetStore()
        refresh()
      },
      updatePlayroom: (patch) => {
        repo.updatePlayroom(patch)
        refresh()
      },
      listReservations: (filters) => repo.listReservations(filters),
      getReservation: (id) => repo.getReservation(id),
      getCustomer: (id) => repo.getCustomer(id),
      createReservation: (input) => {
        const created = repo.createReservation(input)
        refresh()
        return created
      },
      updateReservation: (id, patch) => {
        repo.updateReservation(id, patch)
        refresh()
      },
      updateReservationStatus: (id, status) => {
        repo.updateReservationStatus(id, status)
        refresh()
      },
      assignAnimators: (id, animatorIds) => {
        repo.assignAnimators(id, animatorIds)
        refresh()
      },
      updateChecklist: (id, checklist) => {
        repo.updateChecklist(id, checklist)
        refresh()
      },
      updateAnimatorArrival: (id, status) => {
        repo.updateAnimatorArrival(id, status)
        refresh()
      },
      markDepositPaid: (id) => {
        repo.updateReservation(id, { depositPaid: true, status: 'deposit_paid' })
        refresh()
      },
      confirmReservation: (id) => {
        repo.updateReservationStatus(id, 'confirmed')
        refresh()
      },
      completeReservation: (id) => {
        repo.updateReservationStatus(id, 'completed')
        refresh()
      },
      cancelReservation: (id) => {
        repo.updateReservationStatus(id, 'cancelled')
        refresh()
      },
      createPackage: (input) => {
        repo.createPackage(input)
        refresh()
      },
      updatePackage: (id, patch) => {
        repo.updatePackage(id, patch)
        refresh()
      },
      deletePackage: (id) => {
        repo.deletePackage(id)
        refresh()
      },
      createAddon: (input) => {
        repo.createAddon(input)
        refresh()
      },
      updateAddon: (id, patch) => {
        repo.updateAddon(id, patch)
        refresh()
      },
      deleteAddon: (id) => {
        repo.deleteAddon(id)
        refresh()
      },
      createAnimator: (input) => {
        repo.createAnimator(input)
        refresh()
      },
      updateAnimator: (id, patch) => {
        repo.updateAnimator(id, patch)
        refresh()
      },
      deleteAnimator: (id) => {
        repo.deleteAnimator(id)
        refresh()
      },
      createCustomer: (input) => {
        repo.createCustomer(input)
        refresh()
      },
      updateCustomer: (id, patch) => {
        repo.updateCustomer(id, patch)
        refresh()
      },
      calculatePrice: (packageId, childrenCount, addonIds) => {
        const pkg = store.packages.find((p) => p.id === packageId)
        if (!pkg) return 0
        const addons = store.addons.filter((a) => addonIds.includes(a.id))
        return calculateReservationPrice(pkg, childrenCount, addons)
      },
      reservationsForAnimator: (animatorId, dateKey = today) =>
        store.reservations.filter(
          (r) =>
            r.assignedAnimatorIds.includes(animatorId) &&
            r.date === dateKey &&
            r.status !== 'cancelled',
        ),
    }
  }, [store, repo, refresh])

  return <PartnerDataContext.Provider value={value}>{children}</PartnerDataContext.Provider>
}

export function usePartnerData() {
  const ctx = useContext(PartnerDataContext)
  if (!ctx) throw new Error('usePartnerData must be used within PartnerDataProvider')
  return ctx
}
