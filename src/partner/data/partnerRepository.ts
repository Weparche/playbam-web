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
import { EMPTY_CHECKLIST } from '../types'

export type PartnerRepository = {
  getStore(): PartnerDataStore
  saveStore(store: PartnerDataStore): void
  resetStore(): PartnerDataStore

  getPlayroom(): Playroom
  updatePlayroom(patch: Partial<Playroom>): Playroom

  listPackages(): BirthdayPackage[]
  createPackage(input: Omit<BirthdayPackage, 'id' | 'playroomId'>): BirthdayPackage
  updatePackage(id: string, patch: Partial<BirthdayPackage>): BirthdayPackage
  deletePackage(id: string): void

  listAddons(): BookingAddon[]
  createAddon(input: Omit<BookingAddon, 'id' | 'playroomId'>): BookingAddon
  updateAddon(id: string, patch: Partial<BookingAddon>): BookingAddon
  deleteAddon(id: string): void

  listAnimators(): Animator[]
  createAnimator(input: Omit<Animator, 'id' | 'playroomId'>): Animator
  updateAnimator(id: string, patch: Partial<Animator>): Animator
  deleteAnimator(id: string): void

  listCustomers(): Customer[]
  getCustomer(id: string): Customer | null
  createCustomer(input: Omit<Customer, 'id'>): Customer
  updateCustomer(id: string, patch: Partial<Customer>): Customer

  listReservations(filters?: ReservationFilters): BirthdayReservation[]
  getReservation(id: string): BirthdayReservation | null
  createReservation(input: CreateReservationInput): BirthdayReservation
  updateReservation(id: string, patch: Partial<BirthdayReservation>): BirthdayReservation
  updateReservationStatus(id: string, status: ReservationStatus): BirthdayReservation
  assignAnimators(id: string, animatorIds: string[]): BirthdayReservation
  updateChecklist(id: string, checklist: ReservationChecklist): BirthdayReservation
  updateAnimatorArrival(id: string, status: BirthdayReservation['animatorArrivalStatus']): BirthdayReservation
}

export function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function withChecklist(partial?: Partial<ReservationChecklist>): ReservationChecklist {
  return { ...EMPTY_CHECKLIST, ...partial }
}
