import type { PublicInvitation } from '../../lib/invitationApi'
import PublicInvitationHero from './PublicInvitationHero'
import {
  buildInvitationHeroTitle,
  formatInvitationDateText,
  formatInvitationTimeText,
  resolveInvitationBackgroundImage,
} from './invitationHeroContent'

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
  const message = invitation.message?.trim() || 'Vidimo se na tulumu!'
  const showGuestRsvp = !isHost
  const rsvpActive = canSubmitRsvp && typeof onRsvpChange === 'function'
  const rsvpGate = showGuestRsvp && typeof onGuestRsvpIntent === 'function'
  const celebrantTitle = buildInvitationHeroTitle(invitation.title, invitation.celebrantName)
  const dateText = formatInvitationDateText(invitation.date.trim())
  const timeText = formatInvitationTimeText(invitation.time.trim())
  const venueText = invitation.location.trim() || 'Lokacija uskoro'
  const backgroundImage = resolveInvitationBackgroundImage(invitation.coverImage, invitation.theme)
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
          titleFont={invitation.titleFont}
          titleColor={invitation.titleColor}
          titleOutline={invitation.titleOutline}
          titleSize={invitation.titleSize}
          dateText={dateText}
          timeText={timeText}
          venueText={venueText}
          messageText={message}
          backgroundImage={backgroundImage}
          rsvpMood={invitation.rsvpMood ?? null}
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
