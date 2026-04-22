import { useLayoutEffect, useRef, type RefObject } from 'react'
import Button from '../ui/Button'
import type { InvitationChatMessage } from '../../lib/invitationApi'

export type ChatSenderLabelHint = {
  profileParentName?: string
  sessionDisplayName?: string
  accountEmail?: string
}

type Props = {
  messages: InvitationChatMessage[]
  loading: boolean
  error: string
  draft: string
  sending: boolean
  onDraftChange: (value: string) => void
  onSend: () => void
  senderLabelHint?: ChatSenderLabelHint
  /** Samo za organizatora: brisanje bilo koje poruke. */
  canDeleteMessages?: boolean
  onDeleteMessage?: (messageId: string) => void
  deletingMessageId?: string | null
}

function resolveChatSenderLabel(message: InvitationChatMessage, hint?: ChatSenderLabelHint) {
  const roleFallback = message.senderRole === 'host' ? 'Organizator' : 'Gost'
  const raw = message.senderName?.trim()
  const profileName = hint?.profileParentName?.trim()
  const sessionName = hint?.sessionDisplayName?.trim()
  const email = hint?.accountEmail?.trim()

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

const chatTimeFormatter = new Intl.DateTimeFormat('hr-HR', {
  day: '2-digit',
  month: '2-digit',
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

export default function InvitationLiveChatPanel({
  messages,
  loading,
  error,
  draft,
  sending,
  onDraftChange,
  onSend,
  senderLabelHint,
  canDeleteMessages = false,
  onDeleteMessage,
  deletingMessageId = null,
}: Props) {
  const listRef = useRef<HTMLDivElement>(null)
  useScrollListToBottom(listRef, messages.length, loading)

  return (
    <section className="pb-inviteChat" aria-labelledby="invitation-live-chat-heading">
      <div className="pb-inviteChat__header">
        <h3 id="invitation-live-chat-heading" className="pb-invitePrivateCard__title">
          Live chat
        </h3>
        <p className="pb-invitePrivateCard__subtitle">Brza tekstualna komunikacija između organizatora i gostiju s pristupom.</p>
      </div>

      {loading ? <div className="pb-inlineNote pb-inlineNote--info">Učitavanje poruka...</div> : null}
      {error ? <div className="pb-inlineNote pb-inlineNote--error">{error}</div> : null}
      {!loading && messages.length === 0 ? (
        <div className="pb-inlineNote pb-inlineNote--info">Još nema poruka. Napiši prvu.</div>
      ) : null}

      {messages.length > 0 ? (
        <div ref={listRef} className="pb-inviteChat__list" role="log" aria-live="polite">
          {messages.map((message) => (
            <div key={message.id} className={`pb-inviteChat__row pb-inviteChat__row--${message.senderRole}`}>
              <article className={`pb-inviteChat__item pb-inviteChat__item--${message.senderRole}`}>
                <div className="pb-inviteChat__meta">
                  <div className="pb-inviteChat__metaText">
                    <strong>{resolveChatSenderLabel(message, senderLabelHint)}</strong>
                    <span>{formatChatTimestamp(message.createdAt)}</span>
                  </div>
                  {canDeleteMessages && onDeleteMessage ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="pb-inviteChat__delete"
                      onClick={() => onDeleteMessage(message.id)}
                      disabled={deletingMessageId === message.id}
                    >
                      {deletingMessageId === message.id ? '…' : 'Obriši'}
                    </Button>
                  ) : null}
                </div>
                <p className="pb-inviteChat__message">{message.message}</p>
              </article>
            </div>
          ))}
        </div>
      ) : null}

      <div className="pb-inviteChat__composer">
        <label className="pb-formField pb-inviteChat__field">
          <textarea
            className="pb-input pb-inviteChat__textarea"
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="Upiši kratku poruku..."
            maxLength={500}
          />
        </label>

        <div className="pb-inviteChat__actions">
          <span className="pb-inviteChat__counter">{draft.trim().length}/500</span>
          <Button type="button" variant="amber" onClick={onSend} disabled={sending}>
            {sending ? 'Šaljemo...' : 'Pošalji'}
          </Button>
        </div>
      </div>
    </section>
  )
}
