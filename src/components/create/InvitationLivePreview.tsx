import PublicInvitationHero from '../invitation/PublicInvitationHero'
import {
  buildInvitationHeroTitle,
  formatInvitationDateText,
  formatInvitationTimeText,
  resolveInvitationBackgroundImage,
} from '../invitation/invitationHeroContent'
import { buildPreviewLocation, buildTimeRangeValue, type InvitationCreateDraft } from './createTypes'

type Props = {
  draft: InvitationCreateDraft
  compact?: boolean
}

function buildPreviewAccessText(draft: InvitationCreateDraft) {
  const enabledFeatures = [
    draft.wishlistEnabled ? 'listu želja' : null,
    draft.savingsEnabled ? 'grupni poklon' : null,
    'potvrdu dolaska',
  ].filter(Boolean)

  if (enabledFeatures.length === 0) {
    return null
  }

  if (enabledFeatures.length === 1) {
    return `Prijavi se za ${enabledFeatures[0]} i privatne detalje.`
  }

  if (enabledFeatures.length === 2) {
    return `Prijavi se za ${enabledFeatures[0]} i ${enabledFeatures[1]}.`
  }

  return `Prijavi se za ${enabledFeatures[0]}, ${enabledFeatures[1]} i ${enabledFeatures[2]}.`
}

export default function InvitationLivePreview({ draft, compact }: Props) {
  const location = buildPreviewLocation(draft.locationName, draft.locationAddress, draft.locationType)
  const messageText = draft.message.trim() || 'Vidimo se na tulumu!'
  const accessText = buildPreviewAccessText(draft)

  return (
    <div className={`pb-createLivePreview ${compact ? 'pb-createLivePreview--compact' : ''}`}>
      <div className="pb-createLivePreview__blobs" aria-hidden>
        <span className="pb-createLivePreview__blob pb-createLivePreview__blob--1" />
        <span className="pb-createLivePreview__blob pb-createLivePreview__blob--2" />
      </div>

      <section className="pb-inviteCard pb-inviteCard--storybook pb-createLivePreview__card" aria-label="Pregled stvarne web pozivnice">
        <div className="pb-inviteCard__stack">
          <PublicInvitationHero
            celebrantTitle={buildInvitationHeroTitle(draft.title, draft.celebrantName)}
            titleFont={draft.titleFont}
            dateText={formatInvitationDateText(draft.date)}
            timeText={formatInvitationTimeText(buildTimeRangeValue(draft.time, draft.timeEnd))}
            venueText={location}
            messageText={messageText}
            backgroundImage={resolveInvitationBackgroundImage(draft.theme, draft.theme)}
            rsvpMood={draft.rsvpMood}
            showRsvp
            rsvp={null}
            accessTitle="Privatni dio pozivnice"
            accessText={accessText ?? 'Prijavi se za privatne detalje proslave.'}
            showAccessCard={Boolean(accessText)}
          />
        </div>
      </section>
    </div>
  )
}
