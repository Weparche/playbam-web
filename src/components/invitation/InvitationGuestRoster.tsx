import Button from '../ui/Button'
import type { InvitationRsvp, InvitationWishlistItem, MembershipRequest } from '../../lib/invitationApi'

function isProbablyEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function membershipRequestParentLabel(request: MembershipRequest) {
  const fromProfile = request.familyProfile?.parentName?.trim()
  if (fromProfile) {
    return fromProfile
  }
  const display = request.user?.displayName?.trim()
  if (display && !isProbablyEmail(display)) {
    return display
  }
  return 'Nepoznata obitelj'
}

function getGuestGiftSummaries(request: MembershipRequest, wishlistItems: InvitationWishlistItem[]) {
  return wishlistItems
    .filter(
      (item) =>
        item.reservation.reservedByUserId === request.userId ||
        Boolean(item.reservation.participants?.some((participant) => participant.userId === request.userId)),
    )
    .map((item) => ({
      id: item.id,
      title: item.title,
      details:
        item.reservation.reservedByUserId === request.userId
          ? item.reservation.note?.trim() ||
            (item.reservation.reservedForChildName ? `Za dijete: ${item.reservation.reservedForChildName}` : 'Kupuje poklon')
          : 'Sudjeluje u grupnom poklonu',
    }))
}

function getRsvpToneClass(status?: InvitationRsvp['status']) {
  if (status === 'going') return 'pb-hostRequestItem__rsvpBadge--going'
  if (status === 'not_going') return 'pb-hostRequestItem__rsvpBadge--notGoing'
  if (status === 'maybe') return 'pb-hostRequestItem__rsvpBadge--maybe'
  return 'pb-hostRequestItem__rsvpBadge--pending'
}

function rsvpStatusLabelClean(status: 'going' | 'not_going' | 'maybe' | null | undefined) {
  if (status === 'going') return 'Dolazi'
  if (status === 'not_going') return 'Ne dolazi'
  if (status === 'maybe') return 'Možda'
  return 'Odgovor još nije poslan'
}

function groupHostRequestsByRsvpClean(requests: MembershipRequest[], showHostActions: boolean) {
  const pendingRequests = showHostActions ? requests.filter((request) => request.status === 'pending') : []
  const reviewedRequests = showHostActions
    ? requests.filter((request) => request.status !== 'pending')
    : requests.filter((request) => request.status === 'approved')

  return [
    { title: 'Čeka na odobrenje', className: 'pb-hostRequestGroup--pending', requests: pendingRequests },
    { title: 'Dolaze', className: 'pb-hostRequestGroup--going', requests: reviewedRequests.filter((request) => request.rsvp?.status === 'going') },
    { title: 'Možda', className: 'pb-hostRequestGroup--maybe', requests: reviewedRequests.filter((request) => request.rsvp?.status === 'maybe') },
    { title: 'Ne dolaze', className: 'pb-hostRequestGroup--notGoing', requests: reviewedRequests.filter((request) => request.rsvp?.status === 'not_going') },
    {
      title: 'Još nisu odgovorili',
      className: 'pb-hostRequestGroup--pendingRsvp',
      requests: reviewedRequests.filter((request) => !request.rsvp?.status),
    },
  ].filter((group) => group.requests.length > 0)
}

type RosterListProps = {
  requests: MembershipRequest[]
  reviewingRequestId: string | null
  wishlistItems: InvitationWishlistItem[]
  isBirthInvitation: boolean
  showHostActions?: boolean
  onReview?: (requestId: string, action: 'approve' | 'reject') => void
  onSelect: (request: MembershipRequest) => void
}

export function InvitationGuestRosterList({
  requests,
  reviewingRequestId,
  wishlistItems,
  isBirthInvitation,
  showHostActions = false,
  onReview,
  onSelect,
}: RosterListProps) {
  if (requests.length === 0) {
    return <div className="pb-inlineNote pb-inlineNote--info">Trenutačno nema gostiju na popisu.</div>
  }

  const groupedRequests = groupHostRequestsByRsvpClean(requests, showHostActions)

  return (
    <div className="pb-hostRequestGroups">
      {groupedRequests.map((group) => (
        <section key={group.title} className={`pb-hostRequestGroup ${group.className}`}>
          <h3 className="pb-hostRequestGroup__title">
            {group.title} ({group.requests.length})
          </h3>
          <div className="pb-hostRequests">
            {group.requests.map((request) => {
              const isBusy = reviewingRequestId === request.id
              const parentName = membershipRequestParentLabel(request)
              const childrenText = isBirthInvitation
                ? ''
                : request.children
                    .map((child) => `${child.name || '—'}${child.age != null ? ` (${child.age})` : ''}`)
                    .join(', ') || 'Nema odabrane djece'
              const rsvpLabel = rsvpStatusLabelClean(request.rsvp?.status)
              const rsvpToneClass = getRsvpToneClass(request.rsvp?.status)
              const giftCount = getGuestGiftSummaries(request, wishlistItems).length
              const canOpenDetails = request.status === 'approved'

              return (
                <div
                  key={request.id}
                  className={`pb-hostRequestItem ${canOpenDetails ? 'pb-hostRequestItem--clickable' : ''}`}
                  onClick={canOpenDetails ? () => onSelect(request) : undefined}
                  onKeyDown={
                    canOpenDetails
                      ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            onSelect(request)
                          }
                        }
                      : undefined
                  }
                  role={canOpenDetails ? 'button' : undefined}
                  tabIndex={canOpenDetails ? 0 : undefined}
                >
                  <div className="pb-hostRequestItem__main">
                    <div className="pb-hostRequestItem__headRow">
                      <div className="pb-hostRequestItem__title">{parentName}</div>
                      {!isBirthInvitation ? (
                        <div className="pb-hostRequestItem__children">Djeca: {childrenText}</div>
                      ) : null}
                    </div>
                    {canOpenDetails ? (
                      <div className="pb-hostRequestItem__meta">
                        {giftCount > 0 ? `Pokloni: ${giftCount}` : 'Klikni za detalje gosta'}
                      </div>
                    ) : null}

                    <div className="pb-hostRequestItem__footerRow">
                      {showHostActions && request.status === 'pending' && onReview ? (
                        <div className="pb-flowActions pb-flowActions--compact pb-hostRequestItem__actions">
                          <Button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              onReview(request.id, 'approve')
                            }}
                            disabled={isBusy}
                          >
                            Odobri
                          </Button>
                          <Button
                            variant="ghost"
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              onReview(request.id, 'reject')
                            }}
                            disabled={isBusy}
                          >
                            Odbij
                          </Button>
                        </div>
                      ) : (
                        <span />
                      )}

                      <div className={`pb-hostRequestItem__rsvpBadge ${rsvpToneClass}`}>
                        <span className="pb-hostRequestItem__rsvpLabel">RSVP</span>
                        <span className="pb-hostRequestItem__rsvpValue">{rsvpLabel}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

type RosterModalProps = {
  request: MembershipRequest
  wishlistItems: InvitationWishlistItem[]
  isBirthInvitation: boolean
  busy: boolean
  onClose: () => void
  allowRemove?: boolean
  onRemove?: () => void
}

export function InvitationGuestRosterModal({
  request,
  wishlistItems,
  isBirthInvitation,
  busy,
  onClose,
  allowRemove = false,
  onRemove,
}: RosterModalProps) {
  const giftSummaries = getGuestGiftSummaries(request, wishlistItems)
  const parentName = membershipRequestParentLabel(request)
  const childrenText = isBirthInvitation
    ? ''
    : request.children
        .map((child) => `${child.name || '—'}${child.age != null ? ` (${child.age})` : ''}`)
        .join(', ') || 'Nema odabrane djece'
  const rsvpLabel = rsvpStatusLabelClean(request.rsvp?.status)
  const rsvpToneClass = getRsvpToneClass(request.rsvp?.status)

  return (
    <div className="pb-modalOverlay" role="presentation" onClick={onClose}>
      <div
        className="pb-modalDialog pb-hostGuestModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-roster-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pb-modalDialog__head">
          <h2 id="guest-roster-modal-title" className="pb-modalDialog__title">
            {parentName}
          </h2>
          <button type="button" className="pb-modalDialog__close" onClick={onClose} aria-label="Zatvori detalje gosta">
            ×
          </button>
        </div>
        <div className="pb-modalDialog__body pb-hostGuestModal__body">
          <div className="pb-hostGuestModal__card">
            {!isBirthInvitation ? (
              <div className="pb-hostGuestModal__row">
                <span className="pb-hostGuestModal__label">Djeca</span>
                <span>{childrenText}</span>
              </div>
            ) : null}
            <div className="pb-hostGuestModal__row">
              <span className="pb-hostGuestModal__label">RSVP</span>
              <span className={`pb-hostRequestItem__rsvpBadge ${rsvpToneClass}`}>{rsvpLabel}</span>
            </div>
          </div>

          <div className="pb-hostGuestModal__card">
            <div className="pb-hostGuestModal__sectionTitle">Pokloni</div>
            {giftSummaries.length > 0 ? (
              <div className="pb-hostGuestModal__giftList">
                {giftSummaries.map((gift) => (
                  <div key={gift.id} className="pb-hostGuestModal__giftItem">
                    <div className="pb-hostGuestModal__giftTitle">{gift.title}</div>
                    <div className="pb-hostGuestModal__giftMeta">{gift.details}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pb-hostGuestModal__empty">Gost još nema zabilježen poklon.</div>
            )}
          </div>

          {/* Gost: bez Izbaci — samo organizator smije ukloniti gosta s popisa */}
          {allowRemove && onRemove ? (
            <div className="pb-flowActions pb-flowActions--modal">
              <Button
                variant="ghost"
                type="button"
                className="pb-hostRequestItem__removeBtn"
                onClick={onRemove}
                disabled={busy}
              >
                {busy ? 'Spremamo...' : 'Izbaci'}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
