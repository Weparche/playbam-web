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
  const message = invitation.message?.trim() || 'Veselimo se druženju s vama!'
  const showGuestRsvp = !isHost
  const rsvpActive = canSubmitRsvp && typeof onRsvpChange === 'function'
  const rsvpGate = showGuestRsvp && typeof onGuestRsvpIntent === 'function'
  const celebrantTitle = `${invitation.celebrantName} slavi|6. rođendan!`
  const dateText = invitation.date.trim() || 'Datum uskoro'
  const timeText = invitation.time.trim() || 'Vrijeme uskoro'
  const venueText = invitation.location.trim() || 'Lokacija uskoro'
  const backgroundImage = '/rocko.png'
  const accessTitle = access === 'private' ? 'Privatni dio pozivnice' : 'Privatni dio pozivnice'
  const accessText =
    access === 'private'
      ? 'Odluku možeš promijeniti do 24h prije rođendana.'
      : 'Prijavi se za listu želja, potvrdu dolaska i privatne detalje.'

  const handleRsvpClick = (choice: 'going' | 'not_going' | 'maybe') => {
    if (rsvpActive) {
      onRsvpChange?.(choice)
      return
    }

    if (rsvpGate) {
      onGuestRsvpIntent?.(choice)
    }
  }

  return (
    <section className="pb-inviteCard pb-inviteCard--storybook" aria-label="Web pozivnica za rođendan">
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
          onRsvpClick={handleRsvpClick}
          accessTitle={accessTitle}
          accessText={accessText}
        />
      </div>
    </section>
  )
}
