import type { TemporaryWebIdentity } from './tempWebIdentity'
import { buildTemporaryIdentityHeaders, readStoredTemporaryIdentity } from './tempWebIdentity'
import { readStoredHostToken } from './hostWebSession'

/**
 * U devu: prazan base → zahtjevi na isti origin (Vite proxy šalje /api na backend).
 * U produkciji: obavezno VITE_API_BASE_URL (npr. https://api.playbam.hr).
 */
const API_BASE = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

/** Samo u `npm run dev`: šalje Bearer kao seed host (vidi backend PLAYBAM_HOST_AUTH_TOKEN). */
const DEV_HOST_AUTH_TOKEN =
  typeof import.meta.env.VITE_DEV_HOST_AUTH_TOKEN === 'string'
    ? import.meta.env.VITE_DEV_HOST_AUTH_TOKEN.trim()
    : ''

/** Javni GET-evi ne smiju nositi Bearer (CORS). Kad postoji gost u sesiji, također ne — backend bi inače prihvatio host Bearer prije X-Playbam zaglavlja. */
function shouldAttachDevHostBearer(path: string, hasGuestIdentity: boolean): boolean {
  if (path.startsWith('/api/public/')) {
    return false
  }
  if (hasGuestIdentity) {
    return false
  }
  return true
}

function shouldAttachStoredHostBearer(path: string, hasGuestIdentity: boolean): boolean {
  if (path.startsWith('/api/public/')) {
    return false
  }
  if (hasGuestIdentity) {
    return false
  }
  return true
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  identity?: TemporaryWebIdentity | null
}

type ApiErrorPayload = {
  error?: string
}

export type PublicInvitation = {
  id: string
  shareToken: string
  publicSlug: string
  title: string
  celebrantName: string
  date: string
  time: string
  location: string
  message?: string | null
  coverImage?: string | null
  theme?: string | null
  webShareUrl: string
}

export type CreateInvitationPayload = {
  title: string
  celebrantName: string
  date: string
  time: string
  location: string
  message?: string | null
  coverImage?: string | null
  theme?: string | null
}

export type CreateInvitationResponse = {
  id: string
  shareToken: string
  publicSlug: string
  webShareUrl: string
}

export type InvitationAccess = {
  invitationId: string
  publicAccess: boolean
  loggedIn: boolean
  isHost: boolean
  membershipStatus: 'pending' | 'approved' | 'rejected' | null
  canAccessPrivateInvitation: boolean
  canViewWishlist: boolean
  canRsvp: boolean
}

export type FamilyChild = {
  id: string
  familyProfileId: string
  name: string
  age: number
  createdAt: string
  updatedAt: string
}

export type FamilyProfile = {
  id: string
  userId: string
  parentName: string
  createdAt: string
  updatedAt: string
}

export type FamilyProfilePayload = {
  parentName: string
  children: Array<{
    id?: string
    name: string
    age: number
  }>
}

export type FamilyProfileResponse = {
  profile: FamilyProfile | null
  children: FamilyChild[]
}

export type MembershipRequest = {
  id: string
  invitationId: string
  userId: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  reviewedAt: string | null
  reviewedByUserId: string | null
  user: {
    id: string
    email: string
    displayName: string
    kind: string
  } | null
  familyProfile: {
    id: string
    parentName: string
  } | null
  rsvp: {
    status: 'going' | 'not_going' | 'maybe'
    note: string | null
    updatedAt: string
  } | null
  children: Array<{
    id: string
    familyProfileId: string
    name: string
    age: number
    createdAt: string
    updatedAt: string
  }>
}

export type InvitationRsvp = {
  id: string
  invitationId: string
  userId: string
  status: 'going' | 'not_going' | 'maybe'
  note: string | null
  createdAt: string
  updatedAt: string
}

export type InvitationWishlistReservationStatus = 'available' | 'reserved' | 'reserved_by_you' | 'active'

export type InvitationWishlistReservation = {
  status: InvitationWishlistReservationStatus
  reservedByUserId?: string
  reservedByName?: string
  reservedForChildName?: string | null
  note?: string | null
  participants?: Array<{
    id: string
    userId: string
    name: string
    childName?: string | null
    createdAt: string
    updatedAt: string
  }>
  createdAt?: string
  updatedAt?: string
}

export type InvitationWishlistItem = {
  id: string
  invitationId: string
  title: string
  description: string | null
  url: string | null
  priceLabel: string | null
  imageUrl: string | null
  priorityOrder: number
  isActive: boolean
  addedByUserId?: string | null
  addedByName?: string | null
  addedForChildName?: string | null
  createdAt: string
  updatedAt: string
  reservation: InvitationWishlistReservation
}

export type InvitationWishlistPayload = {
  title: string
  description?: string | null
  url?: string | null
  priceLabel?: string | null
  imageUrl?: string | null
  priorityOrder: number
  isActive?: boolean
}

class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

function parseJsonResponse(text: string) {
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const identity =
    options.identity !== undefined ? options.identity : readStoredTemporaryIdentity()
  const headers = new Headers({
    Accept: 'application/json',
  })
  const storedHostToken = readStoredHostToken()

  if (options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (
    storedHostToken &&
    shouldAttachStoredHostBearer(path, Boolean(identity))
  ) {
    headers.set('Authorization', `Bearer ${storedHostToken}`)
  } else if (
    import.meta.env.DEV &&
    DEV_HOST_AUTH_TOKEN &&
    shouldAttachDevHostBearer(path, Boolean(identity))
  ) {
    headers.set('Authorization', `Bearer ${DEV_HOST_AUTH_TOKEN}`)
  }

  const identityHeaders = buildTemporaryIdentityHeaders(identity)
  for (const [key, value] of Object.entries(identityHeaders)) {
    headers.set(key, value)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const text = await response.text()
  const data = parseJsonResponse(text) as (ApiErrorPayload & T) | null

  if (!response.ok) {
    throw new ApiError(response.status, data?.error || `HTTP_${response.status}`)
  }

  return data as T
}

export function isApiError(error: unknown, status?: number) {
  return error instanceof ApiError && (status == null || error.status === status)
}

export function getPublicInvitation(token: string) {
  // Bez identity zaglavlja — jednostavan GET, nema CORS preflighta
  return request<PublicInvitation>(`/api/public/invitations/${encodeURIComponent(token)}`, {
    identity: null,
  })
}

export function createInvitation(payload: CreateInvitationPayload, identity?: TemporaryWebIdentity | null) {
  return request<CreateInvitationResponse>('/api/invitations', {
    method: 'POST',
    body: payload,
    identity,
  })
}

export function getInvitationAccess(invitationId: string, identity?: TemporaryWebIdentity | null) {
  return request<InvitationAccess>(`/api/invitations/${encodeURIComponent(invitationId)}/access/me`, { identity })
}

export async function getFamilyProfile(identity?: TemporaryWebIdentity | null) {
  return request<FamilyProfileResponse>('/api/me/family-profile', { identity })
}

export async function createFamilyProfile(payload: FamilyProfilePayload, identity?: TemporaryWebIdentity | null) {
  return request<FamilyProfileResponse>('/api/me/family-profile', {
    method: 'POST',
    body: payload,
    identity,
  })
}

export async function updateFamilyProfile(payload: FamilyProfilePayload, identity?: TemporaryWebIdentity | null) {
  return request<FamilyProfileResponse>('/api/me/family-profile', {
    method: 'PUT',
    body: payload,
    identity,
  })
}

export async function getMyMembershipRequest(invitationId: string, identity?: TemporaryWebIdentity | null) {
  const data = await request<{ request: MembershipRequest | null }>(
    `/api/invitations/${encodeURIComponent(invitationId)}/membership-request/me`,
    { identity },
  )
  return data.request
}

export async function createMembershipRequest(invitationId: string, childIds: string[], identity?: TemporaryWebIdentity | null) {
  const data = await request<{ request: MembershipRequest }>(
    `/api/invitations/${encodeURIComponent(invitationId)}/membership-requests`,
    {
      method: 'POST',
      body: { childIds },
      identity,
    },
  )
  return data.request
}

export async function listMembershipRequests(invitationId: string, identity?: TemporaryWebIdentity | null) {
  const data = await request<{ requests: MembershipRequest[] }>(
    `/api/invitations/${encodeURIComponent(invitationId)}/membership-requests`,
    { identity },
  )
  return data.requests
}

export async function reviewMembershipRequest(
  invitationId: string,
  requestId: string,
  action: 'approve' | 'reject',
  identity?: TemporaryWebIdentity | null,
) {
  const data = await request<{ request: MembershipRequest }>(
    `/api/invitations/${encodeURIComponent(invitationId)}/membership-requests/${encodeURIComponent(requestId)}/${action}`,
    {
      method: 'POST',
      identity,
    },
  )
  return data.request
}

export async function getMyRsvp(invitationId: string, identity?: TemporaryWebIdentity | null) {
  const data = await request<{ rsvp: InvitationRsvp | null }>(
    `/api/invitations/${encodeURIComponent(invitationId)}/rsvp/me`,
    { identity },
  )
  return data.rsvp
}

export async function saveRsvp(
  invitationId: string,
  payload: { status: 'going' | 'not_going' | 'maybe'; note?: string | null },
  identity?: TemporaryWebIdentity | null,
) {
  const data = await request<{ rsvp: InvitationRsvp }>(
    `/api/invitations/${encodeURIComponent(invitationId)}/rsvp`,
    {
      method: 'POST',
      body: payload,
      identity,
    },
  )
  return data.rsvp
}

export async function getInvitationWishlist(invitationId: string, identity?: TemporaryWebIdentity | null) {
  const data = await request<{ items: InvitationWishlistItem[] }>(
    `/api/invitations/${encodeURIComponent(invitationId)}/wishlist`,
    { identity },
  )
  return data.items
}

export async function createInvitationWishlistItem(
  invitationId: string,
  payload: InvitationWishlistPayload,
  identity?: TemporaryWebIdentity | null,
) {
  const data = await request<{ item: InvitationWishlistItem }>(
    `/api/invitations/${encodeURIComponent(invitationId)}/wishlist`,
    {
      method: 'POST',
      body: payload,
      identity,
    },
  )
  return data.item
}

export async function updateInvitationWishlistItem(
  invitationId: string,
  itemId: string,
  payload: InvitationWishlistPayload,
  identity?: TemporaryWebIdentity | null,
) {
  const data = await request<{ item: InvitationWishlistItem }>(
    `/api/invitations/${encodeURIComponent(invitationId)}/wishlist/${encodeURIComponent(itemId)}`,
    {
      method: 'PUT',
      body: payload,
      identity,
    },
  )
  return data.item
}

export async function deleteInvitationWishlistItem(
  invitationId: string,
  itemId: string,
  identity?: TemporaryWebIdentity | null,
) {
  return request<{ deleted: boolean; itemId: string }>(
    `/api/invitations/${encodeURIComponent(invitationId)}/wishlist/${encodeURIComponent(itemId)}`,
    {
      method: 'DELETE',
      identity,
    },
  )
}

export async function reserveInvitationWishlistItem(
  invitationId: string,
  itemId: string,
  payload?: { reservedForChildName?: string | null; note?: string | null },
  identity?: TemporaryWebIdentity | null,
) {
  const data = await request<{ item: InvitationWishlistItem }>(
    `/api/invitations/${encodeURIComponent(invitationId)}/wishlist/${encodeURIComponent(itemId)}/reserve`,
    {
      method: 'POST',
      body: payload ?? {},
      identity,
    },
  )
  return data.item
}

export async function cancelInvitationWishlistReservation(
  invitationId: string,
  itemId: string,
  identity?: TemporaryWebIdentity | null,
) {
  const data = await request<{ item: InvitationWishlistItem }>(
    `/api/invitations/${encodeURIComponent(invitationId)}/wishlist/${encodeURIComponent(itemId)}/cancel-reservation`,
    {
      method: 'POST',
      identity,
    },
  )
  return data.item
}
