import { useRef, useState, type CSSProperties } from 'react'

import {
  getRsvpSymbol,
  getTitleColorValue,
  normalizeRsvpMood,
  normalizeTitleColor,
  normalizeTitleFont,
  normalizeTitleOutline,
  normalizeTitleSize,
  RSVP_GUEST_HEADLINE,
  type RsvpMood,
} from '../create/createTypes'
import { useInvitationTitleAutoFit } from './useInvitationTitleAutoFit'

export type PrintPartyDetailLine = {
  label: string
  value: string
}

type Props = {
  celebrantTitle: string
  titleFont?: string | null
  titleColor?: string | null
  titleOutline?: string | null
  titleSize?: string | null
  dateText: string
  timeText: string
  venueText: string
  messageText: string
  backgroundImage: string
  rsvpMood?: RsvpMood | string | null
  showRsvp?: boolean
  rsvp?: 'going' | 'not_going' | 'maybe' | null
  guestRsvpHint?: string | null
  onRsvpClick?: (choice: 'going' | 'not_going' | 'maybe') => void
  accessTitle: string
  accessText: string
  showAccessCard?: boolean
  /** Ispod poruke (npr. ispis / print pregled). */
  printPartyDetails?: readonly PrintPartyDetailLine[] | null
  /** QR kod za print/export (prikaz unutar backgrounda pozivnice). */
  printQrDataUrl?: string | null
  printQrUrl?: string | null
}

function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2.35" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2.35" strokeLinecap="round" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.35" />
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z"
        stroke="currentColor"
        strokeWidth="2.45"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.7" fill="currentColor" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="10" width="14" height="10" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function PublicInvitationHero({
  celebrantTitle,
  titleFont = null,
  titleColor = null,
  titleOutline = null,
  titleSize = null,
  dateText,
  timeText,
  venueText,
  messageText,
  backgroundImage,
  rsvpMood = null,
  showRsvp = false,
  rsvp = null,
  guestRsvpHint = null,
  onRsvpClick,
  accessTitle,
  accessText,
  showAccessCard = true,
  printPartyDetails = null,
  printQrDataUrl = null,
  printQrUrl = null,
}: Props) {
  const fallbackImage = '/pozivnica-girl.png'
  const resolvedImage = backgroundImage || fallbackImage
  const [failedImage, setFailedImage] = useState<string | null>(null)
  const heroImage = failedImage === resolvedImage ? fallbackImage : resolvedImage
  const normalizedTitleFont = normalizeTitleFont(titleFont)
  const normalizedTitleColor = normalizeTitleColor(titleColor)
  const normalizedTitleOutline = normalizeTitleOutline(titleOutline)
  const normalizedTitleSize = normalizeTitleSize(titleSize)
  const resolvedMood = normalizeRsvpMood(typeof rsvpMood === 'string' ? rsvpMood : null)
  const frameRef = useRef<HTMLDivElement>(null)
  const titleWrapRef = useRef<HTMLElement>(null)
  const heroTitleRef = useRef<HTMLHeadingElement>(null)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueText)}`
  const titleStyle = {
    ['--pb-invite-title-color' as string]: getTitleColorValue(normalizedTitleColor),
  } as CSSProperties

  useInvitationTitleAutoFit(heroTitleRef, frameRef, titleWrapRef, 'hero', [
    celebrantTitle,
    normalizedTitleFont,
    normalizedTitleOutline,
    normalizedTitleSize,
  ])

  return (
    <section className="pb-inviteHero pb-inviteHero--storybook" aria-label="Hero dio javne rođendanske pozivnice">
      <div ref={frameRef} className="pb-inviteHero__frame pb-inviteHero__frame--storybook">
        <img
          className="pb-inviteHero__image pb-inviteHero__image--storybook"
          src={heroImage}
          alt=""
          aria-hidden="true"
          onError={() => {
            if (heroImage !== fallbackImage) {
              setFailedImage(resolvedImage)
            }
          }}
        />

        {printQrDataUrl ? (
          <div className="pb-inviteHero__printQr" aria-label="QR kod pozivnice">
            <img className="pb-inviteHero__printQrImage" src={printQrDataUrl} alt="QR kod pozivnice" />
            {printQrUrl ? <div className="pb-inviteHero__printQrUrl">{printQrUrl}</div> : null}
          </div>
        ) : null}

        <div className="pb-inviteHero__content pb-inviteHero__content--storybook" style={titleStyle}>
          <img className="pb-inviteHero__logo" src="/logo.png" alt="VidimoSe.hr" />

          <header
            ref={titleWrapRef}
            className={`pb-inviteHero__titleWrap pb-inviteHero__titleWrap--storybook pb-inviteHero__titleWrap--size-${normalizedTitleSize}`}
          >
            <h1
              ref={heroTitleRef}
              className={`pb-inviteHero__title pb-inviteHero__title--storybook pb-inviteHero__title--${normalizedTitleFont} pb-inviteHero__title--outline-${normalizedTitleOutline} pb-inviteHero__title--size-${normalizedTitleSize}`}
              style={titleStyle}
            >
              {celebrantTitle}
            </h1>
          </header>

          <div className="pb-inviteHero__infoBlock">
            <div className="pb-inviteHero__infoRow pb-inviteHero__infoRow--date">
              <span className="pb-inviteHero__infoIcon" aria-hidden>
                <IconCalendar />
              </span>
              <span className="pb-inviteHero__infoValue">{dateText}</span>
            </div>

            <div className="pb-inviteHero__infoRow pb-inviteHero__infoRow--time">
              <span className="pb-inviteHero__infoIcon" aria-hidden>
                <IconClock />
              </span>
              <span className="pb-inviteHero__infoValue">{timeText}</span>
            </div>

            <a className="pb-inviteHero__infoRow pb-inviteHero__infoRow--venue" href={mapsUrl} target="_blank" rel="noreferrer">
              <span className="pb-inviteHero__infoIcon pb-inviteHero__infoIcon--venue" aria-hidden>
                <IconPin />
              </span>
              <span className="pb-inviteHero__infoVenueWrap">
                <span className="pb-inviteHero__infoValue">{venueText}</span>
                <span className="pb-inviteHero__venueHint">Otvori u Google Maps</span>
              </span>
            </a>

            <p className="pb-inviteHero__message pb-inviteHero__message--storybook">{messageText}</p>

            {printPartyDetails && printPartyDetails.length > 0 ? (
              <div className="pb-inviteHero__printPartyDetails" aria-label="Detalji tuluma">
                {printPartyDetails.map((row) => (
                  <div key={row.label} className="pb-inviteHero__printPartyRow">
                    <span className="pb-inviteHero__printPartyLabel">{row.label}</span>
                    <span className="pb-inviteHero__printPartyValue">{row.value}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {showRsvp ? (
            <div className="pb-inviteHero__rsvpBlock pb-inviteHero__rsvpBlock--storybook">
              <h2 className="pb-inviteHero__rsvpTitle pb-inviteHero__rsvpTitle--storybook">{RSVP_GUEST_HEADLINE}</h2>
              <div className="pb-inviteHero__rsvpButtons pb-inviteHero__rsvpButtons--storybook">
                <button
                  type="button"
                  className={`pb-rsvpBtn pb-rsvpBtn--storybook pb-rsvpBtn--storybookGoing ${rsvp === 'going' ? 'is-active' : ''}`}
                  onClick={() => onRsvpClick?.('going')}
                >
                  <span className="pb-rsvpBtn__emoji" aria-hidden>{getRsvpSymbol(resolvedMood, 'going')}</span>
                  <span>Dolazimo</span>
                </button>
                <button
                  type="button"
                  className={`pb-rsvpBtn pb-rsvpBtn--storybook pb-rsvpBtn--storybookNotGoing ${rsvp === 'not_going' ? 'is-active' : ''}`}
                  onClick={() => onRsvpClick?.('not_going')}
                >
                  <span className="pb-rsvpBtn__emoji" aria-hidden>{getRsvpSymbol(resolvedMood, 'not_going')}</span>
                  <span>Ne dolazimo</span>
                </button>
                <button
                  type="button"
                  className={`pb-rsvpBtn pb-rsvpBtn--storybook pb-rsvpBtn--storybookMaybe ${rsvp === 'maybe' ? 'is-active' : ''}`}
                  onClick={() => onRsvpClick?.('maybe')}
                >
                  <span className="pb-rsvpBtn__emoji" aria-hidden>{getRsvpSymbol(resolvedMood, 'maybe')}</span>
                  <span>Možda</span>
                </button>
              </div>
              {guestRsvpHint ? <p className="pb-inviteHero__rsvpHint pb-inviteHero__rsvpHint--storybook">{guestRsvpHint}</p> : null}
            </div>
          ) : null}

          {showAccessCard ? (
            <div className="pb-inviteHero__accessCard">
              <div className="pb-inviteHero__accessIcon" aria-hidden>
                <IconLock />
              </div>
              <div className="pb-inviteHero__accessBody">
                <div className="pb-inviteHero__accessTitle">{accessTitle}</div>
                <div className="pb-inviteHero__accessText">{accessText}</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
