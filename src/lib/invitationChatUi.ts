import type { InvitationChatMessage, InvitationChatRead } from './invitationApi'

/** Pčela, osa (🐝 / ⚡) i prirodni motivi. */
export const CHAT_BEE_EMOJIS = ['🐝', '⚡', '🍯', '🌻', '🌼', '🪻', '🦋'] as const

export const CHAT_SMILE_EMOJIS = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😊',
  '🙂',
  '😉',
  '😍',
  '🥰',
  '😘',
  '😂',
  '🤣',
  '😭',
  '😢',
  '👍',
  '👏',
  '🎉',
  '❤️',
  '🙏',
  '💛',
] as const

export type ChatDayGroup = {
  dayKey: string
  label: string
  messages: InvitationChatMessage[]
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const chatDayLabelFormatter = new Intl.DateTimeFormat('hr-HR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function getChatDayKey(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return 'unknown'
  }

  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatChatDayLabel(iso: string, now = new Date()) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const today = startOfLocalDay(now)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (isSameLocalDay(date, today)) {
    return 'Danas'
  }
  if (isSameLocalDay(date, yesterday)) {
    return 'Jučer'
  }

  return chatDayLabelFormatter.format(date)
}

export function groupChatMessagesByDay(messages: InvitationChatMessage[]): ChatDayGroup[] {
  const groups: ChatDayGroup[] = []

  for (const message of messages) {
    const dayKey = getChatDayKey(message.createdAt)
    const last = groups[groups.length - 1]

    if (last && last.dayKey === dayKey) {
      last.messages.push(message)
      continue
    }

    groups.push({
      dayKey,
      label: formatChatDayLabel(message.createdAt),
      messages: [message],
    })
  }

  return groups
}

function readAtMs(read: InvitationChatRead) {
  const t = Date.parse(read.readAt)
  return Number.isFinite(t) ? t : 0
}

function messageAtMs(message: InvitationChatMessage) {
  const t = Date.parse(message.createdAt)
  return Number.isFinite(t) ? t : 0
}

/** Je li odgovarajuća strana (host ili barem jedan gost) pročitala poruku. */
export function isOutgoingChatMessageRead(
  message: InvitationChatMessage,
  viewerRole: 'host' | 'guest',
  reads: InvitationChatRead[],
) {
  const msgMs = messageAtMs(message)
  if (!msgMs) {
    return false
  }

  if (viewerRole === 'guest' && message.senderRole === 'guest') {
    return reads.some((read) => read.isHost && readAtMs(read) >= msgMs)
  }

  if (viewerRole === 'host' && message.senderRole === 'host') {
    return reads.some((read) => !read.isHost && readAtMs(read) >= msgMs)
  }

  return false
}
