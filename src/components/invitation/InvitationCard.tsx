import type { PublicInvitation } from '../../lib/invitationApi'
import PublicInvitationHero from './PublicInvitationHero'

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
  const message = 'Veselimo se druženju s vama!'
  const showGuestRsvp = !isHost
  const rsvpActive = canSubmitRsvp && typeof onRsvpChange === 'function'
  const rsvpGate = showGuestRsvp && typeof onGuestRsvpIntent === 'function'
  const celebrantTitle = 'Luka slavi|6. rođendan!'
  const dateText = 'Subota 15-06-2026'
  const timeText = 'od 15:00 do 17:00h'
  const venueText = invitation.location.trim() || 'Lokacija uskoro'
  const backgroundImage = invitation.coverImage?.trim() || '/pozivnica-bg.png'
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
      <div className="pb-inviteCard__stack">
        <PublicInvitationHero
          celebrantTitle={celebrantTitle}
          dateText={dateText}
          timeText={timeText}
          venueText={venueText}
          messageText={message}
          backgroundImage={backgroundImage}
          showRsvp={showGuestRsvp}
          rsvp={rsvp}
          guestRsvpHint={guestRsvpHint}
          rsvpNote={rsvpNote}
          onRsvpClick={handleRsvpClick}
        />
      </div>
    </section>
  )
}
