import type { InvitationChatMessage, InvitationWishlistItem } from './invitationApi'

const STORAGE_PREFIX = 'pb-private-read'

export type PrivateReadRole = 'guest' | 'host'
export type PrivateReadChannel = 'chat' | 'wishlist'

function storageKey(role: PrivateReadRole, channel: PrivateReadChannel, invitationId: string) {
  return `${STORAGE_PREFIX}:${role}:${channel}:${invitationId}`
}

export function getPrivateSectionReadAt(
  role: PrivateReadRole,
  channel: PrivateReadChannel,
  invitationId: string,
): number | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(storageKey(role, channel, invitationId))
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export function setPrivateSectionReadAt(
  role: PrivateReadRole,
  channel: PrivateReadChannel,
  invitationId: string,
  at: number = Date.now(),
) {
  if (typeof window === 'undefined') return
  localStorage.setItem(storageKey(role, channel, invitationId), String(at))
}

/** Ako još nema ključa, postavi „pročitano” na sada da postojeći sadržaj ne bude označen kao nov. */
export function ensurePrivateSectionBaseline(
  role: PrivateReadRole,
  channel: PrivateReadChannel,
  invitationId: string,
) {
  if (getPrivateSectionReadAt(role, channel, invitationId) !== null) return
  setPrivateSectionReadAt(role, channel, invitationId)
}

function createdAtMs(iso: string): number {
  const t = Date.parse(iso)
  return Number.isFinite(t) ? t : 0
}

export function countUnreadChatForGuest(messages: InvitationChatMessage[], readAt: number | null): number {
  if (readAt === null) return 0
  return messages.reduce((acc, m) => {
    if (m.senderRole !== 'host') return acc
    return createdAtMs(m.createdAt) > readAt ? acc + 1 : acc
  }, 0)
}

export function countUnreadChatForHost(messages: InvitationChatMessage[], readAt: number | null): number {
  if (readAt === null) return 0
  return messages.reduce((acc, m) => {
    if (m.senderRole !== 'guest') return acc
    return createdAtMs(m.createdAt) > readAt ? acc + 1 : acc
  }, 0)
}

export function countUnreadWishlistForGuest(
  items: InvitationWishlistItem[],
  readAt: number | null,
  currentGuestName: string | null,
): number {
  if (readAt === null) return 0
  const self = currentGuestName?.trim().toLowerCase() || ''
  return items.reduce((acc, item) => {
    if (createdAtMs(item.createdAt) <= readAt) return acc
    const by = item.addedByName?.trim().toLowerCase() || ''
    if (self && by === self) return acc
    return acc + 1
  }, 0)
}

export function countUnreadWishlistForHost(
  items: InvitationWishlistItem[],
  readAt: number | null,
  hostContributorLabel: string | null,
): number {
  if (readAt === null) return 0
  const hostKey = hostContributorLabel?.trim().toLowerCase() || ''
  return items.reduce((acc, item) => {
    if (createdAtMs(item.createdAt) <= readAt) return acc
    const by = item.addedByName?.trim().toLowerCase() || ''
    if (hostKey && by === hostKey) return acc
    return acc + 1
  }, 0)
}
