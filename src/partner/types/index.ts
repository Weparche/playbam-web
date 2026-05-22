export type PartnerRole = 'super_admin' | 'owner' | 'staff' | 'animator'

export type ReservationStatus =
  | 'new_request'
  | 'pending_confirmation'
  | 'confirmed'
  | 'waiting_deposit'
  | 'deposit_paid'
  | 'animator_assigned'
  | 'preparing'
  | 'completed'
  | 'cancelled'

export type AnimatorArrivalStatus = 'pending' | 'en_route' | 'completed'

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export type DayHours = {
  open: string
  close: string
  closed?: boolean
}

export type OpeningHours = Record<Weekday, DayHours>

export type PartnerUser = {
  id: string
  role: PartnerRole
  playroomId: string
  name: string
  email: string
  animatorId?: string
}

export type Playroom = {
  id: string
  ownerId: string
  name: string
  slug: string
  address: string
  city: string
  phone: string
  email: string
  openingHours: OpeningHours
  slotDurationMinutes: number
  cleanupBufferMinutes: number
  maxParallelEvents: number
  defaultDepositAmount: number
  currency: string
  createdAt: string
  updatedAt: string
}

export type BirthdayPackage = {
  id: string
  playroomId: string
  name: string
  description: string
  durationMinutes: number
  basePrice: number
  includedChildren: number
  extraChildPrice: number
  includesAnimator: boolean
  isActive: boolean
  sortOrder: number
}

export type BookingAddon = {
  id: string
  playroomId: string
  name: string
  description: string
  price: number
  isActive: boolean
  category: string
}

export type Animator = {
  id: string
  playroomId: string
  name: string
  phone: string
  email: string
  skills: string[]
  availableDays: Weekday[]
  maxEventsPerDay: number
  hourlyRate: number
  isActive: boolean
}

export type Child = {
  id: string
  name: string
  birthDate: string
  allergies: string
  notes: string
}

export type Customer = {
  id: string
  fullName: string
  phone: string
  email: string
  children: Child[]
  notes: string
}

export type ReservationChecklist = {
  spaceReady: boolean
  decorationReady: boolean
  foodConfirmed: boolean
  childrenCountConfirmed: boolean
  allergiesChecked: boolean
  animatorConfirmed: boolean
  paymentChecked: boolean
}

export type BirthdayReservation = {
  id: string
  playroomId: string
  customerId: string
  packageId: string
  date: string
  startTime: string
  endTime: string
  status: ReservationStatus
  childName: string
  childAge: number
  childrenCount: number
  theme: string
  notes: string
  internalNotes: string
  totalPrice: number
  depositAmount: number
  depositPaid: boolean
  assignedAnimatorIds: string[]
  addonIds: string[]
  checklist: ReservationChecklist
  animatorArrivalStatus: AnimatorArrivalStatus
  createdAt: string
  updatedAt: string
}

export type TimeSlot = {
  date: string
  startTime: string
  endTime: string
}

export type ReservationFilters = {
  status?: ReservationStatus | 'all'
  dateFrom?: string
  dateTo?: string
  search?: string
}

export type PartnerDataStore = {
  playroom: Playroom
  packages: BirthdayPackage[]
  addons: BookingAddon[]
  animators: Animator[]
  customers: Customer[]
  reservations: BirthdayReservation[]
}

export type CreateReservationInput = Omit<
  BirthdayReservation,
  'id' | 'playroomId' | 'createdAt' | 'updatedAt' | 'checklist' | 'animatorArrivalStatus'
> & {
  checklist?: Partial<ReservationChecklist>
}

export const EMPTY_CHECKLIST: ReservationChecklist = {
  spaceReady: false,
  decorationReady: false,
  foodConfirmed: false,
  childrenCountConfirmed: false,
  allergiesChecked: false,
  animatorConfirmed: false,
  paymentChecked: false,
}
