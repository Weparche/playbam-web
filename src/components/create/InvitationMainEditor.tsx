import type { KeyboardEvent, MouseEvent } from 'react'

import Card from '../ui/Card'
import { buildPreviewLocation, formatPreviewDate, formatPreviewTime, getThemeLabel, type InvitationCreateDraft, type ShortcutId } from './createTypes'

type Props = {
  draft: InvitationCreateDraft
  onOpenShortcut: (shortcut: ShortcutId) => void
}

type StatusTone = 'ready' | 'accent' | 'pending' | 'muted'

const EFFECT_LABELS = {
  confetti: 'Konfeti',
  streamers: 'Trakice',
  glow: 'Glow',
} as const

const ACCENT_LABELS = {
  berry: 'Berry',
  sky: 'Sky',
  mint: 'Mint',
} as const

function handleActionKeyDown(event: KeyboardEvent<HTMLElement>, onActivate: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    onActivate()
  }
}

function getStatusChipClass(tone: StatusTone) {
  return `pb-createEditor__statusChip pb-createEditor__statusChip--${tone}`
}

function ChevronIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} focusable="false">
      <path
        d="M6 3.5L10.5 8L6 12.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EditorChevron() {
  return (
    <span className="pb-createEditor__chevron" aria-hidden="true">
      <ChevronIcon className="pb-createEditor__chevronIcon" />
    </span>
  )
}

function FactChevron() {
  return (
    <span className="pb-createEditor__factChevron" aria-hidden="true">
      <ChevronIcon className="pb-createEditor__factChevronIcon" />
    </span>
  )
}

export default function InvitationMainEditor({ draft, onOpenShortcut }: Props) {
  const title = draft.title.trim() || `${draft.celebrantName.trim() || 'Slavljenik'} slavi rođendan`
  const location = buildPreviewLocation(draft.locationName, draft.locationAddress, draft.locationType)

  const titleReady = Boolean(draft.title.trim() && draft.celebrantName.trim())
  const dateReady = Boolean(draft.date.trim() && draft.time.trim() && draft.timeEnd.trim())
  const locationReady = Boolean(draft.locationName.trim())
  const messageReady = Boolean(draft.message.trim())
  const wishlistReady = draft.wishlistEnabled ? draft.wishlistItems.length > 0 || draft.savingsEnabled : true
  const rsvpReady = draft.rsvpEnabled ? Boolean(draft.rsvpPrompt.trim()) : true

  const progressSteps = [titleReady, dateReady, locationReady, messageReady, wishlistReady, rsvpReady]
  const completedSteps = progressSteps.filter(Boolean).length
  const totalSteps = progressSteps.length
  const progressPercent = Math.round((completedSteps / totalSteps) * 100)

  const titleStatus = titleReady ? { label: 'Popunjeno', tone: 'ready' as const } : { label: 'Dodaj naslov', tone: 'pending' as const }
  const scheduleStatus = dateReady && locationReady
    ? { label: 'Spremno', tone: 'ready' as const }
    : { label: 'Nedostaje detalj', tone: 'pending' as const }
  const messageStatus = messageReady
    ? { label: 'Dodana poruka', tone: 'accent' as const }
    : { label: 'Dodaj poruku', tone: 'pending' as const }
  const wishlistStatus = draft.wishlistEnabled
    ? { label: draft.wishlistItems.length > 0 ? `${draft.wishlistItems.length} želje` : 'Wishlist uključen', tone: 'accent' as const }
    : { label: 'Isključen', tone: 'muted' as const }
  const rsvpStatus = draft.rsvpEnabled
    ? { label: 'Aktivan', tone: 'accent' as const }
    : { label: 'Isključen', tone: 'muted' as const }
  const styleStatus = { label: 'Editorial', tone: 'accent' as const }

  const progressLabel = completedSteps === totalSteps ? 'Spremno za objavu' : `${totalSteps - completedSteps} koraka do objave`

  const handleFactClick = (event: MouseEvent<HTMLButtonElement>, shortcut: ShortcutId) => {
    event.stopPropagation()
    onOpenShortcut(shortcut)
  }

  const handleChevronClick = (event: MouseEvent<HTMLButtonElement>, shortcut: ShortcutId) => {
    event.stopPropagation()
    onOpenShortcut(shortcut)
  }

  return (
    <div className="pb-createEditor">
      <Card
        className="pb-createEditor__heroCard pb-createEditor__panelCard"
        role="button"
        tabIndex={0}
        aria-label="Uredi naslov, ime slavljenika i font pozivnice"
        onClick={() => onOpenShortcut('title')}
        onKeyDown={(event) => handleActionKeyDown(event, () => onOpenShortcut('title'))}
      >
        <div className="pb-createEditor__cardHeader pb-createEditor__cardHeader--hero">
          <div>
            <span className="pb-createEditor__eyebrow">Naslov pozivnice</span>
            <h2 className={`pb-createEditor__title pb-createEditor__title--${draft.titleFont}`}>{title}</h2>
            <p className="pb-createEditor__subtitle">
              {draft.celebrantName.trim() ? `${draft.celebrantName.trim()} je glavni gost dana` : 'Dodaj ime slavljenika'}
            </p>
          </div>
          <div className="pb-createEditor__cardMeta">
            <span className={getStatusChipClass(titleStatus.tone)}>{titleStatus.label}</span>
            <EditorChevron />
          </div>
        </div>

        <div className="pb-createEditor__progress">
          <div className="pb-createEditor__progressMeta">
            <span>{completedSteps} od {totalSteps} koraka spremno</span>
            <span>{progressLabel}</span>
          </div>
          <div className="pb-createEditor__progressTrack" aria-hidden="true">
            <span className="pb-createEditor__progressFill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </Card>

      <Card
        className="pb-createEditor__highlightCard pb-createEditor__panelCard"
        role="button"
        tabIndex={0}
        aria-label="Uredi datum, vrijeme i lokaciju"
        onClick={() => onOpenShortcut('dateTime')}
        onKeyDown={(event) => handleActionKeyDown(event, () => onOpenShortcut('dateTime'))}
      >
        <div className="pb-createEditor__cardHeader">
          <div>
            <span className="pb-createEditor__eyebrow">Kada i gdje</span>
            <h3 className="pb-createEditor__sectionTitle">Najvažnije informacije</h3>
          </div>
          <div className="pb-createEditor__cardMeta">
            <span className={getStatusChipClass(scheduleStatus.tone)}>{scheduleStatus.label}</span>
            <button
              type="button"
              className="pb-createEditor__chevronButton"
              aria-label="Uredi lokaciju"
              onClick={(event) => handleChevronClick(event, 'location')}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <EditorChevron />
            </button>
          </div>
        </div>
        <p className="pb-createEditor__cardNote">Klik na karticu otvara datum i vrijeme, a chevron vodi ravno na uređivanje lokacije.</p>
        <div className="pb-createEditor__facts">
          <button type="button" className="pb-createEditor__fact" onClick={(event) => handleFactClick(event, 'dateTime')}>
            <span className="pb-createEditor__factBody">
              <span>Datum</span>
              <strong>{formatPreviewDate(draft.date)}</strong>
            </span>
            <FactChevron />
          </button>
          <button type="button" className="pb-createEditor__fact" onClick={(event) => handleFactClick(event, 'dateTime')}>
            <span className="pb-createEditor__factBody">
              <span>Vrijeme</span>
              <strong>{formatPreviewTime(draft.time, draft.timeEnd)}</strong>
            </span>
            <FactChevron />
          </button>
          <button type="button" className="pb-createEditor__fact pb-createEditor__fact--wide" onClick={(event) => handleFactClick(event, 'location')}>
            <span className="pb-createEditor__factBody">
              <span>Lokacija</span>
              <strong>{location}</strong>
            </span>
            <FactChevron />
          </button>
        </div>
      </Card>

      <div className="pb-createEditor__grid">
        <Card
          className="pb-createEditor__infoCard pb-createEditor__panelCard"
          role="button"
          tabIndex={0}
          aria-label="Uredi poruku za goste"
          onClick={() => onOpenShortcut('message')}
          onKeyDown={(event) => handleActionKeyDown(event, () => onOpenShortcut('message'))}
        >
          <div className="pb-createEditor__cardHeader">
            <div>
              <span className="pb-createEditor__eyebrow">Poruka</span>
              <h3 className="pb-createEditor__sectionTitle">Kratki opis za goste</h3>
            </div>
            <div className="pb-createEditor__cardMeta">
              <span className={getStatusChipClass(messageStatus.tone)}>{messageStatus.label}</span>
              <EditorChevron />
            </div>
          </div>
          <p className="pb-createEditor__bodyText">{draft.message.trim() || 'Dodaj kratku poruku za goste.'}</p>
        </Card>

        <Card
          className="pb-createEditor__infoCard pb-createEditor__panelCard"
          role="button"
          tabIndex={0}
          aria-label="Uredi wishlist i dodatke"
          onClick={() => onOpenShortcut('wishlist')}
          onKeyDown={(event) => handleActionKeyDown(event, () => onOpenShortcut('wishlist'))}
        >
          <div className="pb-createEditor__cardHeader">
            <div>
              <span className="pb-createEditor__eyebrow">Pokloni</span>
              <h3 className="pb-createEditor__sectionTitle">Wishlist i dodatci</h3>
            </div>
            <div className="pb-createEditor__cardMeta">
              <span className={getStatusChipClass(wishlistStatus.tone)}>{wishlistStatus.label}</span>
              <EditorChevron />
            </div>
          </div>
          <p className="pb-createEditor__bodyText">
            {draft.wishlistEnabled
              ? `${draft.wishlistItems.length} prijedloga poklona${draft.savingsEnabled ? ' + uključen grupni poklon' : ''}`
              : 'Wishlist je trenutno isključen.'}
          </p>
        </Card>

        <Card
          className="pb-createEditor__infoCard pb-createEditor__panelCard"
          role="button"
          tabIndex={0}
          aria-label="Uredi potvrdu dolaska"
          onClick={() => onOpenShortcut('rsvp')}
          onKeyDown={(event) => handleActionKeyDown(event, () => onOpenShortcut('rsvp'))}
        >
          <div className="pb-createEditor__cardHeader">
            <div>
              <span className="pb-createEditor__eyebrow">RSVP</span>
              <h3 className="pb-createEditor__sectionTitle">Potvrda dolaska</h3>
            </div>
            <div className="pb-createEditor__cardMeta">
              <span className={getStatusChipClass(rsvpStatus.tone)}>{rsvpStatus.label}</span>
              <EditorChevron />
            </div>
          </div>
          <p className="pb-createEditor__bodyText">
            {draft.rsvpEnabled ? draft.rsvpPrompt.trim() || 'RSVP je uključen po defaultu.' : 'RSVP je isključen.'}
          </p>
        </Card>

        <Card
          className="pb-createEditor__infoCard pb-createEditor__panelCard"
          role="button"
          tabIndex={0}
          aria-label="Uredi stil i akcent boje"
          onClick={() => onOpenShortcut('style')}
          onKeyDown={(event) => handleActionKeyDown(event, () => onOpenShortcut('style'))}
        >
          <div className="pb-createEditor__cardHeader">
            <div>
              <span className="pb-createEditor__eyebrow">Stil</span>
              <h3 className="pb-createEditor__sectionTitle">Tema i akcenti</h3>
            </div>
            <div className="pb-createEditor__cardMeta">
              <span className={getStatusChipClass(styleStatus.tone)}>{styleStatus.label}</span>
              <EditorChevron />
            </div>
          </div>
          <p className="pb-createEditor__bodyText">
            {getThemeLabel(draft.theme)} · {EFFECT_LABELS[draft.effect]} · {ACCENT_LABELS[draft.accentPalette]}
          </p>
        </Card>
      </div>
    </div>
  )
}
