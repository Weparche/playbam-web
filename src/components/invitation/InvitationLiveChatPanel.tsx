import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from 'react'
import type { InvitationChatMessage, InvitationChatRead } from '../../lib/invitationApi'
import {
  CHAT_BEE_EMOJIS,
  CHAT_SMILE_EMOJIS,
  groupChatMessagesByDay,
  isOutgoingChatMessageRead,
} from '../../lib/invitationChatUi'

export type ChatSenderLabelHint = {
  /** Profil trenutnog korisnika (npr. gost — za zamjenu vlastitog e-maila u prikazu). */
  profileParentName?: string
  sessionDisplayName?: string
  accountEmail?: string
  /** Organizator pozivnice (kad je poznat) — za poruke uloge host kad `senderName` još uvijek drži e-mail. */
  hostParentName?: string
  hostAccountEmail?: string
}

type ViewerRole = 'host' | 'guest'

type Props = {
  messages: InvitationChatMessage[]
  chatReads?: InvitationChatRead[]
  loading: boolean
  error: string
  draft: string
  sending: boolean
  onDraftChange: (value: string) => void
  onSend: () => void
  /** Čija je perspektiva chata — vlastite poruke idu desno (zeleno), tuđe lijevo (bijelo). */
  viewerRole: ViewerRole
  senderLabelHint?: ChatSenderLabelHint
  /** Samo za organizatora: brisanje bilo koje poruke. */
  canDeleteMessages?: boolean
  onDeleteMessage?: (messageId: string) => void
  deletingMessageId?: string | null
}

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function resolveChatSenderLabel(message: InvitationChatMessage, hint?: ChatSenderLabelHint) {
  const roleFallback = message.senderRole === 'host' ? 'Organizator' : 'Gost'
  const raw = message.senderName?.trim() || ''
  const profileName = hint?.profileParentName?.trim()
  const sessionName = hint?.sessionDisplayName?.trim()
  const email = hint?.accountEmail?.trim()
  const hostParent = hint?.hostParentName?.trim()
  const hostEmail = hint?.hostAccountEmail?.trim()

  if (message.senderRole === 'host') {
    if (hostParent && hostEmail && raw.toLowerCase() === hostEmail.toLowerCase()) {
      return hostParent
    }
    if (hostParent && sessionName && raw === sessionName) {
      return hostParent
    }
    if (profileName && email && raw.toLowerCase() === email.toLowerCase()) {
      return profileName
    }
    if (profileName && sessionName && raw === sessionName) {
      return profileName
    }
    if (raw && looksLikeEmail(raw)) {
      return hostParent || 'Organizator'
    }
    return raw || hostParent || profileName || roleFallback
  }

  if (
    profileName &&
    message.senderRole === 'guest' &&
    raw &&
    ((sessionName && raw === sessionName) ||
      (email && (raw === email || raw.toLowerCase() === email.toLowerCase())))
  ) {
    return profileName
  }

  return raw || roleFallback
}

function isOutgoingMessage(message: InvitationChatMessage, viewerRole: ViewerRole) {
  return message.senderRole === viewerRole
}

const chatTimeFormatter = new Intl.DateTimeFormat('hr-HR', {
  hour: '2-digit',
  minute: '2-digit',
})

function formatChatTimestamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return chatTimeFormatter.format(date)
}

function useScrollListToBottom(
  listRef: RefObject<HTMLDivElement | null>,
  messagesLength: number,
  loading: boolean,
) {
  useLayoutEffect(() => {
    const el = listRef.current
    if (!el) {
      return
    }
    el.scrollTop = el.scrollHeight
  }, [listRef, messagesLength, loading])
}

function ChatSendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  )
}

function ChatEmojiIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
      <path d="M8.5 14.2c.9 1.1 2 1.7 3.5 1.7s2.6-.6 3.5-1.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ChatReadTicks({ read }: { read: boolean }) {
  return (
    <span
      className={`pb-inviteChat__ticks ${read ? 'pb-inviteChat__ticks--read' : ''}`}
      aria-hidden="true"
      title={read ? 'Pročitano' : 'Poslano'}
    >
      <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
        <path
          d="M1 5.5L4.2 8.7L10.5 2.3"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.5 5.5L8.7 8.7L15 2.3"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export default function InvitationLiveChatPanel({
  messages,
  chatReads = [],
  loading,
  error,
  draft,
  sending,
  onDraftChange,
  onSend,
  viewerRole,
  senderLabelHint,
  canDeleteMessages = false,
  onDeleteMessage,
  deletingMessageId = null,
}: Props) {
  const listRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLDivElement>(null)
  const [emojiOpen, setEmojiOpen] = useState(false)
  useScrollListToBottom(listRef, messages.length, loading)

  const dayGroups = useMemo(() => groupChatMessagesByDay(messages), [messages])

  const canSend = draft.trim().length > 0 && !sending

  useEffect(() => {
    if (!emojiOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }
      if (composerRef.current?.contains(target)) {
        return
      }
      setEmojiOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [emojiOpen])

  const insertEmoji = (emoji: string) => {
    const next = `${draft}${emoji}`.slice(0, 500)
    onDraftChange(next)
  }

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (canSend) {
        onSend()
      }
    }
  }

  return (
    <section className="pb-inviteChat" aria-label="Live chat">
      <div className="pb-inviteChat__thread">
        {loading ? <div className="pb-inviteChat__status pb-inlineNote pb-inlineNote--info">Učitavanje poruka...</div> : null}
        {error ? <div className="pb-inviteChat__status pb-inlineNote pb-inlineNote--error">{error}</div> : null}
        {!loading && !error && messages.length === 0 ? (
          <div className="pb-inviteChat__status pb-inviteChat__empty">Još nema poruka. Napiši prvu.</div>
        ) : null}

        {messages.length > 0 ? (
          <div ref={listRef} className="pb-inviteChat__list" role="log" aria-live="polite">
            {dayGroups.map((group) => (
              <div key={group.dayKey} className="pb-inviteChat__dayGroup">
                <div className="pb-inviteChat__dayDivider" role="separator">
                  <span>{group.label}</span>
                </div>
                {group.messages.map((message) => {
                  const outgoing = isOutgoingMessage(message, viewerRole)
                  const rowClass = outgoing ? 'out' : 'in'
                  const senderLabel = resolveChatSenderLabel(message, senderLabelHint)
                  const timestamp = formatChatTimestamp(message.createdAt)
                  const isRead = outgoing && isOutgoingChatMessageRead(message, viewerRole, chatReads)

                  return (
                    <div key={message.id} className={`pb-inviteChat__row pb-inviteChat__row--${rowClass}`}>
                      <article className={`pb-inviteChat__bubble pb-inviteChat__bubble--${rowClass}`}>
                        {!outgoing ? (
                          <span className="pb-inviteChat__sender">{senderLabel}</span>
                        ) : null}
                        <p className="pb-inviteChat__message">{message.message}</p>
                        <footer className="pb-inviteChat__foot">
                          <time className="pb-inviteChat__time" dateTime={message.createdAt}>
                            {timestamp}
                          </time>
                          {outgoing ? <ChatReadTicks read={isRead} /> : null}
                          {canDeleteMessages && onDeleteMessage ? (
                            <button
                              type="button"
                              className="pb-inviteChat__delete"
                              onClick={() => onDeleteMessage(message.id)}
                              disabled={deletingMessageId === message.id}
                              aria-label="Obriši poruku"
                            >
                              {deletingMessageId === message.id ? '…' : 'Obriši'}
                            </button>
                          ) : null}
                        </footer>
                      </article>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div ref={composerRef} className="pb-inviteChat__composer">
        {emojiOpen ? (
          <div className="pb-inviteChat__emojiPanel" role="dialog" aria-label="Emojiji">
            <p className="pb-inviteChat__emojiHeading">Pčela / osa</p>
            <div className="pb-inviteChat__emojiGrid">
              {CHAT_BEE_EMOJIS.map((emoji) => (
                <button
                  key={`bee-${emoji}`}
                  type="button"
                  className="pb-inviteChat__emojiBtn"
                  onClick={() => insertEmoji(emoji)}
                  aria-label={`Dodaj ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <p className="pb-inviteChat__emojiHeading">Osnovni</p>
            <div className="pb-inviteChat__emojiGrid pb-inviteChat__emojiGrid--smiles">
              {CHAT_SMILE_EMOJIS.map((emoji) => (
                <button
                  key={`smile-${emoji}`}
                  type="button"
                  className="pb-inviteChat__emojiBtn"
                  onClick={() => insertEmoji(emoji)}
                  aria-label={`Dodaj ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="pb-inviteChat__composerRow">
          <button
            type="button"
            className={`pb-inviteChat__emojiToggle ${emojiOpen ? 'is-open' : ''}`}
            onClick={() => setEmojiOpen((current) => !current)}
            aria-label={emojiOpen ? 'Zatvori emojije' : 'Otvori emojije'}
            aria-expanded={emojiOpen}
          >
            <ChatEmojiIcon />
          </button>
          <label className="pb-inviteChat__inputWrap">
            <textarea
              className="pb-inviteChat__textarea"
              aria-label="Nova poruka"
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder="Poruka"
              rows={1}
              maxLength={500}
            />
          </label>
          <button
            type="button"
            className="pb-inviteChat__send"
            onClick={onSend}
            disabled={!canSend}
            aria-label={sending ? 'Šaljemo poruku' : 'Pošalji poruku'}
          >
            <ChatSendIcon />
          </button>
        </div>
      </div>
    </section>
  )
}
