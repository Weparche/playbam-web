import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'

import PublicInvitationHero from '../invitation/PublicInvitationHero'
import {
  buildInvitationHeroTitle,
  formatInvitationDateText,
  formatInvitationTimeText,
  resolveInvitationBackgroundImage,
} from '../invitation/invitationHeroContent'
import { buildPreviewLocation, buildTimeRangeValue, isBirthTheme, type InvitationCreateDraft } from './createTypes'

export type LivePreviewMode = 'guest' | 'print'

export type LivePreviewPartyDetails = {
  parkingLocation: string
  cafeLocation: string
  extraDetails: string
  contactName: string
  contactMobile: string
}

type Props = {
  draft: InvitationCreateDraft
  compact?: boolean
  /** Gost: puni prikaz. Print: bez RSVP-a + QR kod. */
  previewMode?: LivePreviewMode
  partyDetails?: LivePreviewPartyDetails | null
  inviteUrl?: string | null
}

function buildPreviewAccessText(draft: InvitationCreateDraft) {
  const enabledFeatures = [
    draft.wishlistEnabled ? 'listu želja' : null,
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

export default function InvitationLivePreview({
  draft,
  compact,
  previewMode = 'guest',
  partyDetails = null,
  inviteUrl = null,
}: Props) {
  const birthInvitation = isBirthTheme(draft.theme)
  const location = buildPreviewLocation(draft.locationName, draft.locationAddress, draft.locationType)
  const messageText = draft.message.trim() || 'Vidimo se na tulumu!'
  const accessText = buildPreviewAccessText(draft)
  const isPrint = previewMode === 'print'
  const printPartyDetails = useMemo(() => {
    if (!isPrint || !partyDetails) {
      return null
    }
    // Detalji tuluma se spremaju, ali se ne ispisuju na pozivnici.
    return null
  }, [isPrint, partyDetails])
  const printContactMobile = useMemo(() => {
    if (!isPrint || !partyDetails) return null
    return partyDetails.contactMobile.trim() || null
  }, [isPrint, partyDetails])
  const printContactName = useMemo(() => {
    if (!isPrint || !partyDetails) return null
    return partyDetails.contactName.trim() || null
  }, [isPrint, partyDetails])

  const qrTargetUrl = useMemo(() => inviteUrl?.trim() || '', [inviteUrl])
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [, setQrError] = useState(false)

  useEffect(() => {
    let alive = true
    if (!isPrint || !qrTargetUrl) {
      setQrDataUrl('')
      setQrError(false)
      return () => {
        alive = false
      }
    }

    setQrError(false)
    QRCode.toDataURL(qrTargetUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 420,
      color: { dark: '#0b1220', light: '#ffffff' },
    })
      .then((dataUrl: string) => {
        if (!alive) return
        setQrDataUrl(dataUrl)
      })
      .catch(() => {
        if (!alive) return
        setQrError(true)
        setQrDataUrl('')
      })

    return () => {
      alive = false
    }
  }, [isPrint, qrTargetUrl])

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
          isBirthInvitation={birthInvitation}
          layoutMode={isPrint ? 'print' : 'default'}
          rsvpMood={draft.rsvpMood}
          showRsvp={!isPrint}
          rsvp={null}
          accessTitle="Privatni dio pozivnice"
          accessText={accessText ?? 'Prijavi se za privatne detalje proslave.'}
          /* Gost pregled: privatna kartica (ispod RSVP-a) privremeno isključena.
             Vrati prikaz: showAccessCard={!isPrint && Boolean(accessText)} */
          showAccessCard={false}
          printPartyDetails={printPartyDetails}
          printQrDataUrl={isPrint ? (qrDataUrl || null) : null}
          printContactMobile={printContactMobile}
          printContactName={printContactName}
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
