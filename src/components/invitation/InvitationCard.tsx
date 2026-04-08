import type { PublicInvitation } from '../../lib/invitationApi'

type Props = {
  invitation: PublicInvitation
  access?: 'public' | 'private'
  isHost?: boolean
  rsvp?: 'going' | 'not_going' | 'maybe' | null
  canSubmitRsvp?: boolean
  onRsvpChange?: (response: 'going' | 'not_going' | 'maybe') => void
  onGuestRsvpIntent?: (choice: 'going' | 'not_going' | 'maybe') => void
  guestRsvpHint?: string | null
}

export default function InvitationCard({
  invitation,
  access = 'public',
  isHost = false,
  rsvp = null,
  canSubmitRsvp = false,
  onRsvpChange,
  onGuestRsvpIntent,
  guestRsvpHint = null,
}: Props) {
  const message = invitation.message?.trim() || 'Veselimo se druženju i proslavi.'
  const showGuestRsvp = !isHost
  const rsvpActive = canSubmitRsvp && typeof onRsvpChange === 'function'
  const rsvpGate = showGuestRsvp && typeof onGuestRsvpIntent === 'function'
  const showEventTitle =
    Boolean(invitation.title?.trim()) && invitation.title?.trim() !== invitation.celebrantName?.trim()
  const heroHeadline = `${invitation.celebrantName} slavi 6. rođendan!`
  const rsvpNote =
    access === 'private' || guestRsvpHint
      ? null
      : 'Sva tri gumba vode na prijavu i privatni dio pozivnice s listom želja i ostalim detaljima rođendana.'

  const handleRsvpClick = (choice: 'going' | 'not_going' | 'maybe') => {
    if (rsvpActive) {
      onRsvpChange?.(choice)
      return
    }

    if (rsvpGate) {
      onGuestRsvpIntent(choice)
    }
  }

  return (
    <section className="pb-inviteCard pb-inviteCard--premium" aria-label="Web pozivnica za rođendan">
      <div className="pb-inviteCard__shell">
        <div className="pb-inviteCard__layer pb-inviteCard__layer--back" aria-hidden="true" />
        <div className="pb-inviteCard__layer pb-inviteCard__layer--glow" aria-hidden="true" />

        <div className="pb-inviteCard__surface">
          <div className="pb-inviteCard__hero">
            <p className="pb-inviteCard__badge">Playbam pozivnica</p>
            <p className="pb-inviteCard__kicker">Pozvani ste na rođendan!</p>

            <h1 className="pb-inviteCard__heroName">{heroHeadline}</h1>
            {showEventTitle ? <p className="pb-inviteCard__eventTitle">{invitation.title}</p> : null}

            <ul className="pb-inviteCard__infoRows">
              <li className="pb-inviteCard__infoRow">
                <span className="pb-inviteCard__infoIcon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" />
                    <path
                      d="M3 10h18M8 3v4M16 3v4"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <div className="pb-inviteCard__infoBody">
                  <span className="pb-inviteCard__infoLabel">Datum</span>
                  <span className="pb-inviteCard__infoValue">{invitation.date}</span>
                </div>
              </li>

              <li className="pb-inviteCard__infoRow">
                <span className="pb-inviteCard__infoIcon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
                    <path
                      d="M12 7v6l4 2"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div className="pb-inviteCard__infoBody">
                  <span className="pb-inviteCard__infoLabel">Vrijeme</span>
                  <span className="pb-inviteCard__infoValue">{invitation.time}</span>
                </div>
              </li>

              <li className="pb-inviteCard__infoRow">
                <span className="pb-inviteCard__infoIcon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="11" r="2.5" fill="currentColor" />
                  </svg>
                </span>
                <div className="pb-inviteCard__infoBody">
                  <span className="pb-inviteCard__infoLabel">Lokacija</span>
                  <address className="pb-inviteCard__address">{invitation.location}</address>
                </div>
              </li>
            </ul>

            <div className="pb-inviteCard__note">
              <p className="pb-inviteCard__noteText">{message}</p>
            </div>

            {showGuestRsvp ? (
              <div className="pb-inviteCard__rsvp" aria-label="RSVP">
                <h2 className="pb-inviteCard__rsvpTitle">Potvrdi dolazak</h2>
                <div className="pb-inviteRSVP">
                  <button
                    type="button"
                    className={`pb-rsvpBtn pb-rsvpBtn--going ${rsvp === 'going' ? 'is-active' : ''}`}
                    onClick={() => handleRsvpClick('going')}
                  >
                    Dolazimo
                  </button>
                  <button
                    type="button"
                    className={`pb-rsvpBtn pb-rsvpBtn--notGoing ${rsvp === 'not_going' ? 'is-active' : ''}`}
                    onClick={() => handleRsvpClick('not_going')}
                  >
                    Ne dolazimo
                  </button>
                  <button
                    type="button"
                    className={`pb-rsvpBtn pb-rsvpBtn--maybe ${rsvp === 'maybe' ? 'is-active' : ''}`}
                    onClick={() => handleRsvpClick('maybe')}
                  >
                    Možda
                  </button>
                </div>
                {rsvpNote ? <p className="pb-inviteRSVP__note">{rsvpNote}</p> : null}
                {guestRsvpHint ? <p className="pb-inviteCard__rsvpHint">{guestRsvpHint}</p> : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
