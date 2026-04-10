import { useEffect, useRef, useState } from 'react'
import Card from '../ui/Card'
import { resolveInvitationBackgroundImage } from '../invitation/invitationHeroContent'
import {
  buildPreviewLocation,
  formatPreviewDate,
  formatPreviewTime,
  getRsvpSymbol,
  normalizeTitleFont,
  RSVP_GUEST_HEADLINE,
  type InvitationCreateDraft,
} from './createTypes'

type Props = {
  draft: InvitationCreateDraft
  compact?: boolean
}

export default function InvitationPreviewCard({ draft, compact }: Props) {
  const title = draft.title.trim() || 'Upiši naslov pozivnice'
  const location = buildPreviewLocation(draft.locationName, draft.locationAddress, draft.locationType)
  const backgroundImage = resolveInvitationBackgroundImage(draft.theme, draft.theme)
  const titleFont = normalizeTitleFont(draft.titleFont)
  const [flash, setFlash] = useState(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    setFlash(true)
    const timer = window.setTimeout(() => setFlash(false), 450)
    return () => window.clearTimeout(timer)
  }, [draft.title, draft.date, draft.time, draft.timeEnd, draft.locationName, draft.message, draft.theme, draft.titleFont, draft.rsvpMood])

  const cardClass = [
    'pb-previewCard',
    compact ? 'pb-previewCard--compact' : '',
    flash ? 'pb-previewCard--updated' : '',
  ].filter(Boolean).join(' ')

  return (
    <Card className={cardClass}>
      <div className="pb-previewCard__hero">
        <img className="pb-previewCard__heroImage" src={backgroundImage} alt="" aria-hidden="true" />
        <img className="pb-previewCard__logo" src="/logo.png" alt="Playbam.hr" />
        <div className="pb-previewCard__heroText">
          <span className="pb-previewCard__eyebrow">Pozivnica</span>
          <h3 className={`pb-previewCard__title pb-previewCard__title--${titleFont}`}>{title}</h3>
        </div>
      </div>

      <div className="pb-previewCard__grid">
        <div className="pb-previewCard__infoCard">
          <span className="pb-previewCard__label">Datum:</span>
          <strong>{formatPreviewDate(draft.date)}</strong>
        </div>
        <div className="pb-previewCard__infoCard">
          <span className="pb-previewCard__label">Vrijeme:</span>
          <strong>{formatPreviewTime(draft.time, draft.timeEnd)}</strong>
        </div>
        <div className="pb-previewCard__infoCard pb-previewCard__infoCard--wide">
          <span className="pb-previewCard__label">Lokacija:</span>
          <strong>{location}</strong>
        </div>
      </div>

      <div className="pb-previewCard__message">{draft.message.trim() || 'Dodaj kratku poruku za goste.'}</div>

      {draft.wishlistEnabled ? (
        <div className="pb-previewCard__section">
          <div className="pb-previewCard__sectionHeader">
            <strong>Lista želja</strong>
            <span>{draft.wishlistItems.length} prijedloga</span>
          </div>
          <div className="pb-previewCard__wishlist">
            {draft.wishlistItems.slice(0, 3).map((item) => {
              const thumbSrc = item.linkMeta?.image || item.linkMeta?.favicon
              return (
                <div key={item.id} className="pb-previewCard__wishlistItem">
                  <div className="pb-previewCard__wishlistLine">
                    {thumbSrc ? (
                      <img
                        className="pb-previewCard__wishlistThumb"
                        src={thumbSrc}
                        alt=""
                        aria-hidden="true"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : null}
                    <div>
                      <strong>{item.title || 'Novi poklon'}</strong>
                      {item.linkMeta?.domain ? <span className="pb-previewCard__wishlistDomain">{item.linkMeta.domain}</span> : null}
                    </div>
                  </div>
                  {item.note ? <p>{item.note}</p> : null}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {draft.savingsEnabled ? (
        <div className="pb-previewCard__section pb-previewCard__section--savings">
          <div className="pb-previewCard__sectionHeader">
            <strong>Štednja / grupni poklon</strong>
          </div>
          <p>{draft.savingsLabel.trim() || 'Uključi štednju za veći zajednički poklon.'}</p>
        </div>
      ) : null}

      <div className="pb-previewCard__section">
        <div className="pb-previewCard__sectionHeader">
          <strong>RSVP</strong>
          <span>Uključeno</span>
        </div>
        <p className="pb-previewCard__rsvpPrompt">{RSVP_GUEST_HEADLINE}</p>
        <div className="pb-previewCard__rsvpRow" aria-hidden="true">
          {(['going', 'maybe', 'not_going'] as const).map((choice) => (
            <span key={choice} className={`pb-previewCard__rsvpPill pb-previewCard__rsvpPill--${choice.replace('_', '-')}`}>
              <span className="pb-previewCard__rsvpGlyph">{getRsvpSymbol(draft.rsvpMood, choice)}</span>
              <span>{choice === 'going' ? 'Dolazimo' : choice === 'maybe' ? 'Možda' : 'Ne dolazimo'}</span>
            </span>
          ))}
        </div>
      </div>
    </Card>
  )
}
