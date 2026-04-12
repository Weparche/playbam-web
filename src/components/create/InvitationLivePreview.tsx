import PublicInvitationHero, { type PrintPartyDetailLine } from '../invitation/PublicInvitationHero'
import {
  buildInvitationHeroTitle,
  formatInvitationDateText,
  formatInvitationTimeText,
  resolveInvitationBackgroundImage,
} from '../invitation/invitationHeroContent'
import { buildPreviewLocation, buildTimeRangeValue, type InvitationCreateDraft } from './createTypes'

export type LivePreviewMode = 'guest' | 'print'

export type LivePreviewPartyDetails = {
  parkingLocation: string
  cafeLocation: string
  extraDetails: string
}

type Props = {
  draft: InvitationCreateDraft
  compact?: boolean
  /** Gost: puni prikaz. Print: bez RSVP-a + detalji tuluma desno. */
  previewMode?: LivePreviewMode
  partyDetails?: LivePreviewPartyDetails | null
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

function buildPrintPartyDetailLines(details: LivePreviewPartyDetails): PrintPartyDetailLine[] {
  const parking = details.parkingLocation.trim()
  const cafe = details.cafeLocation.trim()
  const extra = details.extraDetails.trim()
  const rows: PrintPartyDetailLine[] = []
  if (parking) rows.push({ label: 'Parking', value: parking })
  if (cafe) rows.push({ label: 'Kafić', value: cafe })
  if (extra) rows.push({ label: 'Ostalo', value: extra })
  return rows
}

export default function InvitationLivePreview({
  draft,
  compact,
  previewMode = 'guest',
  partyDetails = null,
}: Props) {
  const location = buildPreviewLocation(draft.locationName, draft.locationAddress, draft.locationType)
  const messageText = draft.message.trim() || 'Vidimo se na tulumu!'
  const accessText = buildPreviewAccessText(draft)
  const isPrint = previewMode === 'print'
  const details = partyDetails ?? { parkingLocation: '', cafeLocation: '', extraDetails: '' }
  const printPartyLines = isPrint ? buildPrintPartyDetailLines(details) : null

  const heroCard = (
    <section className="pb-inviteCard pb-inviteCard--storybook pb-createLivePreview__card" aria-label="Pregled stvarne web pozivnice">
      <div className="pb-inviteCard__stack">
        <PublicInvitationHero
          celebrantTitle={buildInvitationHeroTitle(draft.title, draft.celebrantName)}
          titleFont={draft.titleFont}
          titleColor={draft.titleColor}
          titleOutline={draft.titleOutline}
          titleSize={draft.titleSize}
          dateText={formatInvitationDateText(draft.date)}
          timeText={formatInvitationTimeText(buildTimeRangeValue(draft.time, draft.timeEnd))}
          venueText={location}
          messageText={messageText}
          backgroundImage={resolveInvitationBackgroundImage(draft.theme, draft.theme)}
          rsvpMood={draft.rsvpMood}
          showRsvp={!isPrint}
          rsvp={null}
          accessTitle="Privatni dio pozivnice"
          accessText={accessText ?? 'Prijavi se za privatne detalje proslave.'}
          /* Gost pregled: privatna kartica (ispod RSVP-a) privremeno isključena.
             Vrati prikaz: showAccessCard={!isPrint && Boolean(accessText)} */
          showAccessCard={false}
          printPartyDetails={printPartyLines && printPartyLines.length > 0 ? printPartyLines : null}
        />
      </div>
    </section>
  )

  return (
    <div
      className={`pb-createLivePreview ${compact ? 'pb-createLivePreview--compact' : ''}${isPrint ? ' pb-createLivePreview--print' : ''}`}
    >
      <div className="pb-createLivePreview__blobs" aria-hidden>
        <span className="pb-createLivePreview__blob pb-createLivePreview__blob--1" />
        <span className="pb-createLivePreview__blob pb-createLivePreview__blob--2" />
      </div>

      {isPrint ? <div className="pb-createLivePreview__printSplit">{heroCard}</div> : heroCard}
    </div>
  )
}
