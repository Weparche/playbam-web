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

function formatInvitationDate(dateValue: string) {
  if (!dateValue.trim()) {
    return 'Datum uskoro'
  }

  const parsedDate = new Date(`${dateValue}T12:00:00`)
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue
  }

  const dayName = parsedDate
    .toLocaleDateString('hr-HR', { weekday: 'long' })
    .replace(/^./, (letter) => letter.toUpperCase())
  const [year, month, day] = dateValue.split('-')

  return `${dayName}, ${day}-${month}.${year}`
}

function formatInvitationTime(timeValue: string) {
  const baseTime = timeValue.trim() || '15:00'
  const [startHour = '15', startMinute = '00'] = baseTime.split(':')
  const startTotalMinutes = Number(startHour) * 60 + Number(startMinute)
  const endTotalMinutes = startTotalMinutes + 120
  const endHour = String(Math.floor(endTotalMinutes / 60)).padStart(2, '0')
  const endMinute = String(endTotalMinutes % 60).padStart(2, '0')

  return `${baseTime}h do ${endHour}:${endMinute}h`
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
  const message = 'Vidimo se na tulumu!'
  const showGuestRsvp = !isHost
  const rsvpActive = canSubmitRsvp && typeof onRsvpChange === 'function'
  const rsvpGate = showGuestRsvp && typeof onGuestRsvpIntent === 'function'
  const celebrantTitle = `${invitation.celebrantName} slavi|6. rođendan!`
  const dateText = formatInvitationDate(invitation.date.trim())
  const timeText = formatInvitationTime(invitation.time.trim())
  const venueText = invitation.location.trim() || 'Lokacija uskoro'
  const backgroundImage = '/pozivnica-bg.png'
  const accessTitle = 'Privatni dio pozivnice'
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
          showAccessCard={access !== 'private'}
        />
      </div>
    </section>
  )
}
