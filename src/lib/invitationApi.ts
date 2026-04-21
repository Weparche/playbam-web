import type { TemporaryWebIdentity } from './tempWebIdentity'
import { buildTemporaryIdentityHeaders, readStoredTemporaryIdentity } from './tempWebIdentity'
import { readStoredHostToken } from './hostWebSession'
import { readStoredSession, type VidimoseSession } from './vidimoseSession'

/**
 * U devu: prazan base → zahtjevi na isti origin (Vite proxy šalje /api na backend).
 * Na Cloudflare Pages deployu preferiramo isti origin `/api`, jer repo već ima Pages function proxy.
 * Na ostalim produkcijskim hostovima koristi se VITE_API_BASE_URL.
 */
function shouldUseSameOriginApi() {
  if (typeof window === 'undefined') {
    return false
  }

  const host = window.location.hostname.toLowerCase()
  return host.endsWith('.pages.dev')
}

const RAW_API_BASE = import.meta.env.DEV
  ? ''
  : shouldUseSameOriginApi()
    ? ''
    : (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function getProtocolSafeApiBase(base: string) {
  if (!base || typeof window === 'undefined') {
    return base
  }

  if (window.location.protocol !== 'https:' || !base.startsWith('http://')) {
    return base
  }

  return `https://${base.slice('http://'.length)}`
}

const API_BASE = getProtocolSafeApiBase(RAW_API_BASE)

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
  titleFont?: string | null
  titleColor?: string | null
  titleOutline?: string | null
  titleSize?: string | null
  date: string
  time: string
  location: string
  message?: string | null
  /** Set ikona za RSVP ako ga API uključi u javni odgovor. */
  rsvpMood?: string | null
  coverImage?: string | null
  theme?: string | null
  partyDetails?: InvitationPartyDetails | null
  webShareUrl: string
}

export type InvitationPartyDetails = {
  parkingLocation?: string | null
  cafeLocation?: string | null
  extraDetails?: string | null
  contactName?: string | null
  contactMobile?: string | null
  /** Poveznica za KEKS Pay (uklj. fragment #tag ako treba). */
  wishlistKeksPayUrl?: string | null
  /** IBAN za ručnu uplatu / kopiranje. */
  wishlistBankIban?: string | null
  /** Data URL ili URL slike uplatnice / bankovnog QR koda. */
  wishlistPaymentImageUrl?: string | null
}

export type CreateInvitationPayload = {
  title: string
  celebrantName: string
  titleFont?: string | null
  titleColor?: string | null
  titleOutline?: string | null
  titleSize?: string | null
  date: string
  time: string
  location: string
  message?: string | null
  /** Set ikona RSVP (mora se spremiti i vratiti u javnom GET-u). */
  rsvpMood?: string | null
  coverImage?: string | null
  theme?: string | null
  partyDetails?: InvitationPartyDetails | null
}

export type UpdateInvitationPayload = {
  title: string
  celebrantName: string
  titleFont?: string | null
  titleColor?: string | null
  titleOutline?: string | null
  titleSize?: string | null
  date: string
  time: string
  location: string
  message?: string | null
  rsvpMood?: string | null
  coverImage?: string | null
  theme?: string | null
  partyDetails?: InvitationPartyDetails | null
}

export type CreateInvitationResponse = {
  id: string
  shareToken: string
  publicSlug: string
  webShareUrl: string
  hostAuthToken?: string
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
  age: number | null
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
    age: number | null
  }>
}

/**
 * Za pozivnice rođenja gost u UI-ju unosi samo ime/nadimak; šaljemo jedan red (isto ime kao profil, dob 1).
 * Kod PUT-a zadržavamo `id` postojećeg zapisa ako postoji. Za ostale pozivnice djeca i dob mogu biti prazni.
 */
export function buildFamilyProfilePayload(
  parentNameTrimmed: string,
  resolvedChildren: FamilyProfilePayload['children'],
  isBirthInvitation: boolean,
  existingChildren: FamilyChild[],
): FamilyProfilePayload {
  if (isBirthInvitation) {
    const trimmedParent = parentNameTrimmed.trim()
    const displayName = trimmedParent || 'Gost'
    const id = existingChildren[0]?.id
    return {
      parentName: trimmedParent,
      children: [{ ...(id ? { id } : {}), name: displayName, age: 1 }],
    }
  }
  return { parentName: parentNameTrimmed, children: resolvedChildren }
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
    age: number | null
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
  /** Ako je true, gosti ne rezerviraju cijeli poklon — samo se prijavljuju (Sudjeluj). */
  isGroupGift?: boolean
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
  isGroupGift?: boolean
  isActive?: boolean
}

export type InvitationChatMessage = {
  id: string
  invitationId: string
  userId: string
  senderRole: 'host' | 'guest'
  senderName: string
  message: string
  createdAt: string
  updatedAt: string
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
  const sessionToken = readStoredSession()?.token
  // If session exists, don't use X-Playbam headers (Bearer takes priority)
  const identity = sessionToken
    ? null
    : options.identity !== undefined ? options.identity : readStoredTemporaryIdentity()

  const headers = new Headers({
    Accept: 'application/json',
  })
  const storedHostToken = readStoredHostToken()

  if (options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (sessionToken && !path.startsWith('/api/public/')) {
    headers.set('Authorization', `Bearer ${sessionToken}`)
  } else if (
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

  if (!sessionToken) {
    const identityHeaders = buildTemporaryIdentityHeaders(identity)
    for (const [key, value] of Object.entries(identityHeaders)) {
      headers.set(key, value)
    }
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

type PublicInvitationRaw = PublicInvitation & { rsvp_mood?: string | null }

function normalizePartyDetails(raw: unknown): InvitationPartyDetails | null {
  if (raw == null || typeof raw !== 'object') {
    return null
  }

  const r = raw as Record<string, unknown>
  const pick = (camel: string, snake: string): string | null => {
    const a = r[camel]
    const b = r[snake]
    const s = (typeof a === 'string' ? a : typeof b === 'string' ? b : '').trim()
    return s || null
  }

  const out: InvitationPartyDetails = {
    parkingLocation: pick('parkingLocation', 'parking_location'),
    cafeLocation: pick('cafeLocation', 'cafe_location'),
    extraDetails: pick('extraDetails', 'extra_details'),
    contactName: pick('contactName', 'contact_name'),
    contactMobile: pick('contactMobile', 'contact_mobile'),
    wishlistKeksPayUrl: pick('wishlistKeksPayUrl', 'wishlist_keks_pay_url'),
    wishlistBankIban: pick('wishlistBankIban', 'wishlist_bank_iban'),
    wishlistPaymentImageUrl: pick('wishlistPaymentImageUrl', 'wishlist_payment_image_url'),
  }

  if (
    !out.parkingLocation &&
    !out.cafeLocation &&
    !out.extraDetails &&
    !out.contactName &&
    !out.contactMobile &&
    !out.wishlistKeksPayUrl &&
    !out.wishlistBankIban &&
    !out.wishlistPaymentImageUrl
  ) {
    return null
  }

  return out
}

/** Javni/PUT odgovor: neki backendi šalju `rsvp_mood` umjesto `rsvpMood`; `party_details` u snake_case. */
function normalizePublicInvitationResponse(raw: PublicInvitationRaw): PublicInvitation {
  const mood =
    typeof raw.rsvpMood === 'string'
      ? raw.rsvpMood
      : typeof raw.rsvp_mood === 'string'
        ? raw.rsvp_mood
        : null
  const partyDetails = normalizePartyDetails(raw.partyDetails)
  return { ...raw, rsvpMood: mood, partyDetails }
}

export async function getPublicInvitation(token: string) {
  // Bez identity zaglavlja — jednostavan GET, nema CORS preflighta
  const data = await request<PublicInvitationRaw>(`/api/public/invitations/${encodeURIComponent(token)}`, {
    identity: null,
  })
  return normalizePublicInvitationResponse(data)
}

export function createInvitation(payload: CreateInvitationPayload, identity?: TemporaryWebIdentity | null) {
  return request<CreateInvitationResponse>('/api/invitations', {
    method: 'POST',
    body: payload,
    identity,
  })
}

export async function updateInvitation(
  invitationId: string,
  payload: UpdateInvitationPayload,
  identity?: TemporaryWebIdentity | null,
  /** U `npm run dev`: ako PUT vrati 404 (npr. backend nije pokrenut), spoji payload u ovu pozivnicu umjesto bacanja greške. */
  devMergeBase?: PublicInvitation | null,
): Promise<PublicInvitation> {
  try {
    const data = await request<PublicInvitationRaw>(`/api/invitations/${encodeURIComponent(invitationId)}`, {
      method: 'PUT',
      body: payload,
      identity,
    })
    return normalizePublicInvitationResponse(data)
  } catch (error) {
    if (
      import.meta.env.DEV &&
      devMergeBase &&
      devMergeBase.id === invitationId &&
      isApiError(error, 404)
    ) {
      return {
        ...devMergeBase,
        title: payload.title,
        celebrantName: payload.celebrantName,
        titleFont: payload.titleFont ?? devMergeBase.titleFont,
        titleColor: payload.titleColor ?? devMergeBase.titleColor,
        titleOutline: payload.titleOutline ?? devMergeBase.titleOutline,
        titleSize: payload.titleSize ?? devMergeBase.titleSize,
        date: payload.date,
        time: payload.time,
        location: payload.location,
        message: payload.message ?? null,
        rsvpMood: payload.rsvpMood ?? devMergeBase.rsvpMood ?? null,
        coverImage: payload.coverImage ?? null,
        theme: payload.theme ?? null,
        partyDetails: payload.partyDetails ?? devMergeBase.partyDetails ?? null,
      }
    }
    throw error
  }
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

export async function deleteFamilyProfile(identity?: TemporaryWebIdentity | null) {
  await request<unknown>('/api/me/family-profile', {
    method: 'DELETE',
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

export async function getInvitationChat(invitationId: string, identity?: TemporaryWebIdentity | null) {
  const data = await request<{ messages: InvitationChatMessage[] }>(
    `/api/invitations/${encodeURIComponent(invitationId)}/chat`,
    { identity },
  )
  return data.messages
}

export async function createInvitationChatMessage(
  invitationId: string,
  payload: { message: string; senderName?: string },
  identity?: TemporaryWebIdentity | null,
) {
  const data = await request<{ message: InvitationChatMessage }>(
    `/api/invitations/${encodeURIComponent(invitationId)}/chat`,
    {
      method: 'POST',
      body: payload,
      identity,
    },
  )
  return data.message
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

export type UnfurlResult = {
  title: string | null
  image: string | null
  domain: string | null
  favicon: string | null
}

export async function unfurlLink(url: string): Promise<UnfurlResult> {
  const response = await fetch(`${API_BASE}/api/unfurl?url=${encodeURIComponent(url)}`)
  if (!response.ok) {
    return { title: null, image: null, domain: null, favicon: null }
  }
  return response.json() as Promise<UnfurlResult>
}

export function proxyImageUrl(url: string): string {
  if (!url) {
    return url
  }

  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
    return `https://${url.slice('http://'.length)}`
  }

  return url
}

export type { VidimoseSession }

export type MyInvitationSummary = {
  id: string
  shareToken: string
  publicSlug: string
  title: string
  celebrantName: string
  date: string
  time: string
  location: string
  theme: string | null
  webShareUrl: string
  createdAt: string
}

export type MyRsvpSummary = {
  id: string
  status: 'going' | 'not_going' | 'maybe'
  note: string | null
  createdAt: string
  invitation: MyInvitationSummary
}

export async function sendOtp(email: string, name?: string): Promise<void> {
  await request('/api/auth/send-otp', { method: 'POST', body: { email, ...(name ? { name } : {}) }, identity: null })
}

export async function verifyOtp(email: string, code: string): Promise<VidimoseSession> {
  return request('/api/auth/verify-otp', { method: 'POST', body: { email, code }, identity: null })
}

export async function authGetMe(): Promise<VidimoseSession> {
  return request('/api/auth/me', { identity: null })
}

export type AdminInvitationRow = {
  id: string
  shareToken: string
  publicSlug: string
  title: string
  celebrantName: string
  date: string
  time: string
  location: string
  theme: string | null
  createdAt: string
  updatedAt: string
  hostEmail: string
  hostName: string
  rsvpCount: number
  guestCount: number
}

export async function getAdminInvitations(): Promise<AdminInvitationRow[]> {
  const data = await request<{ invitations: AdminInvitationRow[] }>('/api/admin/invitations')
  return data.invitations
}

export async function authLogout(): Promise<void> {
  await request('/api/auth/logout', { method: 'POST', identity: null })
}

export async function getMyInvitations(): Promise<{ invitations: MyInvitationSummary[] }> {
  return request('/api/my/invitations', { identity: null })
}

export async function deleteMyInvitation(invitationId: string) {
  await request<unknown>(`/api/my/invitations/${encodeURIComponent(invitationId)}`, {
    method: 'DELETE',
    identity: null,
  })
}

export async function getMyRsvps(): Promise<{ rsvps: MyRsvpSummary[] }> {
  return request('/api/my/rsvps', { identity: null })
}

export async function deleteMyRsvp(rsvpId: string) {
  await request<unknown>(`/api/my/rsvps/${encodeURIComponent(rsvpId)}`, {
    method: 'DELETE',
    identity: null,
  })
}
