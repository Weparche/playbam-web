import Card from '../ui/Card'
import {
  buildPreviewLocation,
  getAccentClass,
  getRsvpSymbol,
  type InvitationCreateDraft,
} from './createTypes'
import { formatPreviewDate, formatPreviewTime } from './createTypes'

type Props = {
  draft: InvitationCreateDraft
  compact?: boolean
}

export default function InvitationPreviewCard({ draft, compact }: Props) {
  const title = draft.title.trim() || `${draft.celebrantName.trim() || 'Slavljenik'} slavi rođendan`
  const location = buildPreviewLocation(draft.locationName, draft.locationAddress, draft.locationType)
  const accentClass = getAccentClass(draft.accentPalette)

  return (
    <Card className={`pb-previewCard ${compact ? 'pb-previewCard--compact' : ''} ${accentClass}`}>
      <div className={`pb-previewCard__hero pb-previewCard__hero--${draft.theme} pb-previewCard__hero--${draft.effect}`}>
        <img className="pb-previewCard__logo" src="/logo.png" alt="Playbam.hr" />
        <div className="pb-previewCard__heroText">
          <span className="pb-previewCard__eyebrow">Pozivnica</span>
          <h3 className={`pb-previewCard__title pb-previewCard__title--${draft.titleFont}`}>{title}</h3>
          <p className="pb-previewCard__celebrant">{draft.celebrantName.trim() ? `${draft.celebrantName.trim()} je zvijezda tuluma` : 'Dodaj ime slavljenika'}</p>
        </div>
      </div>

      <div className="pb-previewCard__grid">
        <div className="pb-previewCard__infoCard">
          <span className="pb-previewCard__label">Datum</span>
          <strong>{formatPreviewDate(draft.date)}</strong>
        </div>
        <div className="pb-previewCard__infoCard">
          <span className="pb-previewCard__label">Vrijeme</span>
          <strong>{formatPreviewTime(draft.time)}</strong>
        </div>
        <div className="pb-previewCard__infoCard pb-previewCard__infoCard--wide">
          <span className="pb-previewCard__label">Lokacija</span>
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
            {draft.wishlistItems.slice(0, 3).map((item) => (
              <div key={item.id} className="pb-previewCard__wishlistItem">
                <strong>{item.title || 'Novi poklon'}</strong>
                <span>{item.note || 'Dodaj kratku napomenu ili link.'}</span>
              </div>
            ))}
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

      {draft.rsvpEnabled ? (
        <div className="pb-previewCard__section">
          <div className="pb-previewCard__sectionHeader">
            <strong>RSVP</strong>
            <span>Uključeno</span>
          </div>
          <p className="pb-previewCard__rsvpPrompt">{draft.rsvpPrompt.trim() || 'Potvrdi dolazak i javi odgovara li vam termin.'}</p>
          <div className="pb-previewCard__rsvpRow" aria-hidden="true">
            {(['going', 'maybe', 'not_going'] as const).map((choice) => (
              <span key={choice} className={`pb-previewCard__rsvpPill pb-previewCard__rsvpPill--${choice.replace('_', '-')}`}>
                <span>{getRsvpSymbol(draft.rsvpMood, choice)}</span>
                <span>{choice === 'going' ? 'Dolazimo' : choice === 'maybe' ? 'Možda' : 'Ne dolazimo'}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  )
}
