import Card from '../ui/Card'
import InvitationPreviewCard from './InvitationPreviewCard'
import { buildPreviewLocation, formatPreviewDate, formatPreviewTime, type InvitationCreateDraft, type ShortcutId } from './createTypes'

type Props = {
  draft: InvitationCreateDraft
  onOpenShortcut: (shortcut: ShortcutId) => void
}

export default function InvitationMainEditor({ draft, onOpenShortcut }: Props) {
  const title = draft.title.trim() || `${draft.celebrantName.trim() || 'Slavljenik'} slavi rođendan`
  const location = buildPreviewLocation(draft.locationName, draft.locationAddress, draft.locationType)

  return (
    <div className="pb-createEditor">
      <Card className="pb-createEditor__heroCard">
        <button type="button" className="pb-createEditor__ghostEdit" onClick={() => onOpenShortcut('title')}>
          <span className="pb-createEditor__eyebrow">Naslov pozivnice</span>
          <h2 className={`pb-createEditor__title pb-createEditor__title--${draft.titleFont}`}>{title}</h2>
          <p className="pb-createEditor__subtitle">{draft.celebrantName.trim() ? `${draft.celebrantName.trim()} je glavni gost dana` : 'Dodaj ime slavljenika'}</p>
        </button>
      </Card>

      <Card className="pb-createEditor__highlightCard">
        <div className="pb-createEditor__cardHeader">
          <div>
            <span className="pb-createEditor__eyebrow">Kada i gdje</span>
            <h3 className="pb-createEditor__sectionTitle">Najvažnije informacije</h3>
          </div>
          <button type="button" className="pb-createEditor__inlineAction" onClick={() => onOpenShortcut('dateTime')}>Uredi</button>
        </div>
        <div className="pb-createEditor__facts">
          <button type="button" className="pb-createEditor__fact" onClick={() => onOpenShortcut('dateTime')}>
            <span>Datum</span>
            <strong>{formatPreviewDate(draft.date)}</strong>
          </button>
          <button type="button" className="pb-createEditor__fact" onClick={() => onOpenShortcut('dateTime')}>
            <span>Vrijeme</span>
            <strong>{formatPreviewTime(draft.time)}</strong>
          </button>
          <button type="button" className="pb-createEditor__fact pb-createEditor__fact--wide" onClick={() => onOpenShortcut('location')}>
            <span>Lokacija</span>
            <strong>{location}</strong>
          </button>
        </div>
      </Card>

      <div className="pb-createEditor__grid">
        <Card className="pb-createEditor__infoCard">
          <div className="pb-createEditor__cardHeader">
            <div>
              <span className="pb-createEditor__eyebrow">Poruka</span>
              <h3 className="pb-createEditor__sectionTitle">Kratki opis za goste</h3>
            </div>
            <button type="button" className="pb-createEditor__inlineAction" onClick={() => onOpenShortcut('message')}>Uredi</button>
          </div>
          <p className="pb-createEditor__bodyText">{draft.message.trim() || 'Dodaj kratku poruku za goste.'}</p>
        </Card>

        <Card className="pb-createEditor__infoCard">
          <div className="pb-createEditor__cardHeader">
            <div>
              <span className="pb-createEditor__eyebrow">Pokloni</span>
              <h3 className="pb-createEditor__sectionTitle">Wishlist i dodatci</h3>
            </div>
            <button type="button" className="pb-createEditor__inlineAction" onClick={() => onOpenShortcut('wishlist')}>Uredi</button>
          </div>
          <p className="pb-createEditor__bodyText">
            {draft.wishlistEnabled
              ? `${draft.wishlistItems.length} prijedloga poklona${draft.savingsEnabled ? ' + uključen grupni poklon' : ''}`
              : 'Wishlist je trenutno isključen.'}
          </p>
        </Card>

        <Card className="pb-createEditor__infoCard">
          <div className="pb-createEditor__cardHeader">
            <div>
              <span className="pb-createEditor__eyebrow">RSVP</span>
              <h3 className="pb-createEditor__sectionTitle">Potvrda dolaska</h3>
            </div>
            <button type="button" className="pb-createEditor__inlineAction" onClick={() => onOpenShortcut('rsvp')}>Uredi</button>
          </div>
          <p className="pb-createEditor__bodyText">
            {draft.rsvpEnabled ? draft.rsvpPrompt.trim() || 'RSVP je uključen po defaultu.' : 'RSVP je isključen.'}
          </p>
        </Card>

        <Card className="pb-createEditor__infoCard">
          <div className="pb-createEditor__cardHeader">
            <div>
              <span className="pb-createEditor__eyebrow">Stil</span>
              <h3 className="pb-createEditor__sectionTitle">Tema i akcenti</h3>
            </div>
            <button type="button" className="pb-createEditor__inlineAction" onClick={() => onOpenShortcut('style')}>Uredi</button>
          </div>
          <p className="pb-createEditor__bodyText">
            {draft.theme} · {draft.effect} · {draft.accentPalette}
          </p>
        </Card>
      </div>

      <InvitationPreviewCard draft={draft} />
    </div>
  )
}
