import type {
  Animator,
  BirthdayPackage,
  BirthdayReservation,
  BookingAddon,
  Customer,
  PartnerDataStore,
  ReservationFilters,
  ReservationStatus,
} from '../types'
import { createId, nowIso, type PartnerRepository, withChecklist } from './partnerRepository'
import { createSeedStore } from './mock/seed'

const STORAGE_KEY = 'vidimose-partner-data-v2'

function loadStore(): PartnerDataStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as PartnerDataStore
    }
  } catch {
    // fall through
  }
  return createSeedStore()
}

function save(store: PartnerDataStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function filterReservations(
  reservations: BirthdayReservation[],
  customers: Customer[],
  filters?: ReservationFilters,
): BirthdayReservation[] {
  let result = [...reservations]
  if (filters?.status && filters.status !== 'all') {
    result = result.filter((r) => r.status === filters.status)
  }
  if (filters?.dateFrom) {
    result = result.filter((r) => r.date >= filters.dateFrom!)
  }
  if (filters?.dateTo) {
    result = result.filter((r) => r.date <= filters.dateTo!)
  }
  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase()
    result = result.filter((r) => {
      const customer = customers.find((c) => c.id === r.customerId)
      return (
        r.childName.toLowerCase().includes(q) ||
        (customer?.fullName.toLowerCase().includes(q) ?? false)
      )
    })
  }
  return result.sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
}

export function createMockPartnerRepository(): PartnerRepository {
  let store = loadStore()

  const persist = () => save(store)

  const updateReservationStatus = (id: string, status: ReservationStatus) => {
    store = {
      ...store,
      reservations: store.reservations.map((r) =>
        r.id === id ? { ...r, status, updatedAt: nowIso() } : r,
      ),
    }
    persist()
    return store.reservations.find((r) => r.id === id)!
  }

  return {
    getStore: () => store,
    saveStore: (next) => {
      store = next
      persist()
    },
    resetStore: () => {
      store = createSeedStore()
      persist()
      return store
    },

    getPlayroom: () => store.playroom,
    updatePlayroom: (patch) => {
      store = { ...store, playroom: { ...store.playroom, ...patch, updatedAt: nowIso() } }
      persist()
      return store.playroom
    },

    listPackages: () => [...store.packages].sort((a, b) => a.sortOrder - b.sortOrder),
    createPackage: (input) => {
      const item: BirthdayPackage = { ...input, id: createId('pkg'), playroomId: store.playroom.id }
      store = { ...store, packages: [...store.packages, item] }
      persist()
      return item
    },
    updatePackage: (id, patch) => {
      store = {
        ...store,
        packages: store.packages.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }
      persist()
      return store.packages.find((p) => p.id === id)!
    },
    deletePackage: (id) => {
      store = { ...store, packages: store.packages.filter((p) => p.id !== id) }
      persist()
    },

    listAddons: () => [...store.addons],
    createAddon: (input) => {
      const item: BookingAddon = { ...input, id: createId('addon'), playroomId: store.playroom.id }
      store = { ...store, addons: [...store.addons, item] }
      persist()
      return item
    },
    updateAddon: (id, patch) => {
      store = {
        ...store,
        addons: store.addons.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      }
      persist()
      return store.addons.find((a) => a.id === id)!
    },
    deleteAddon: (id) => {
      store = { ...store, addons: store.addons.filter((a) => a.id !== id) }
      persist()
    },

    listAnimators: () => [...store.animators],
    createAnimator: (input) => {
      const item: Animator = { ...input, id: createId('animator'), playroomId: store.playroom.id }
      store = { ...store, animators: [...store.animators, item] }
      persist()
      return item
    },
    updateAnimator: (id, patch) => {
      store = {
        ...store,
        animators: store.animators.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      }
      persist()
      return store.animators.find((a) => a.id === id)!
    },
    deleteAnimator: (id) => {
      store = { ...store, animators: store.animators.filter((a) => a.id !== id) }
      persist()
    },

    listCustomers: () => [...store.customers],
    getCustomer: (id) => store.customers.find((c) => c.id === id) ?? null,
    createCustomer: (input) => {
      const item: Customer = { ...input, id: createId('cust') }
      store = { ...store, customers: [...store.customers, item] }
      persist()
      return item
    },
    updateCustomer: (id, patch) => {
      store = {
        ...store,
        customers: store.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }
      persist()
      return store.customers.find((c) => c.id === id)!
    },

    listReservations: (filters) => filterReservations(store.reservations, store.customers, filters),
    getReservation: (id) => store.reservations.find((r) => r.id === id) ?? null,
    createReservation: (input) => {
      const item: BirthdayReservation = {
        ...input,
        id: createId('res'),
        playroomId: store.playroom.id,
        checklist: withChecklist(input.checklist),
        animatorArrivalStatus: 'pending',
        createdAt: nowIso(),
        updatedAt: nowIso(),
      }
      store = { ...store, reservations: [...store.reservations, item] }
      persist()
      return item
    },
    updateReservation: (id, patch) => {
      store = {
        ...store,
        reservations: store.reservations.map((r) =>
          r.id === id ? { ...r, ...patch, updatedAt: nowIso() } : r,
        ),
      }
      persist()
      return store.reservations.find((r) => r.id === id)!
    },
    updateReservationStatus,
    assignAnimators: (id, animatorIds) => {
      const reservation = store.reservations.find((r) => r.id === id)
      if (!reservation) throw new Error('Reservation not found')
      const status: ReservationStatus =
        animatorIds.length > 0 && reservation.status !== 'cancelled' && reservation.status !== 'completed'
          ? 'animator_assigned'
          : reservation.status
      store = {
        ...store,
        reservations: store.reservations.map((r) =>
          r.id === id
            ? {
                ...r,
                assignedAnimatorIds: animatorIds,
                status,
                checklist: { ...r.checklist, animatorConfirmed: animatorIds.length > 0 },
                updatedAt: nowIso(),
              }
            : r,
        ),
      }
      persist()
      return store.reservations.find((r) => r.id === id)!
    },
    updateChecklist: (id, checklist) => {
      store = {
        ...store,
        reservations: store.reservations.map((r) =>
          r.id === id ? { ...r, checklist, updatedAt: nowIso() } : r,
        ),
      }
      persist()
      return store.reservations.find((r) => r.id === id)!
    },
    updateAnimatorArrival: (id, animatorArrivalStatus) => {
      store = {
        ...store,
        reservations: store.reservations.map((r) =>
          r.id === id ? { ...r, animatorArrivalStatus, updatedAt: nowIso() } : r,
        ),
      }
      persist()
      return store.reservations.find((r) => r.id === id)!
    },
  }
}
