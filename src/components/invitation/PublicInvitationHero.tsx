import { useEffect, useState } from 'react'

type Props = {
  celebrantTitle: string
  /** Podnaslov ispod glavnog naslova (npr. naziv događaja), ako postoji. */
  eventTitle?: string | null
  dateText: string
  timeText: string
  venueText: string
  messageText: string
  backgroundImage: string
  showRsvp?: boolean
  rsvp?: 'going' | 'not_going' | 'maybe' | null
  guestRsvpHint?: string | null
  rsvpNote?: string | null
  onRsvpClick?: (choice: 'going' | 'not_going' | 'maybe') => void
}

function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.5" fill="currentColor" />
    </svg>
  )
}

export default function PublicInvitationHero({
  celebrantTitle,
  eventTitle = null,
  dateText,
  timeText,
  venueText,
  messageText,
  backgroundImage,
  showRsvp = false,
  rsvp = null,
  guestRsvpHint = null,
  rsvpNote = null,
  onRsvpClick,
}: Props) {
  const fallbackImage = '/pozivnica-bg.png'
  const [heroImage, setHeroImage] = useState(backgroundImage || fallbackImage)
  const [titlePrimary, titleSecondary = ''] = celebrantTitle.split('|')
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueText)}`

  useEffect(() => {
    setHeroImage(backgroundImage || fallbackImage)
  }, [backgroundImage])

  return (
    <section className="pb-inviteHero" aria-label="Hero dio javne rođendanske pozivnice">
      <div className="pb-inviteHero__frame">
        <div className="pb-inviteHero__media">
          <img
            className="pb-inviteHero__image"
            src={heroImage}
            alt=""
            aria-hidden="true"
            onError={() => {
              if (heroImage !== fallbackImage) {
                setHeroImage(fallbackImage)
              }
            }}
          />
        </div>

        <div className="pb-inviteHero__body">
          <header className="pb-inviteHero__head">
            <p className="pb-inviteHero__eyebrow">Rođendanska pozivnica</p>
            <h1 className="pb-inviteHero__title">
              <span className="pb-inviteHero__titleLine pb-inviteHero__titleLine--primary">{titlePrimary}</span>
              {titleSecondary ? (
                <span className="pb-inviteHero__titleLine pb-inviteHero__titleLine--secondary">{titleSecondary}</span>
              ) : null}
            </h1>
            {eventTitle ? <p className="pb-inviteHero__eventTitle">{eventTitle}</p> : null}
          </header>

          <div className="pb-inviteHero__details">
            <div className="pb-inviteHero__detailRow">
              <span className="pb-inviteHero__detailIcon" aria-hidden>
                <IconCalendar />
              </span>
              <div className="pb-inviteHero__detailText">
                <span className="pb-inviteHero__detailLabel">Datum</span>
                <span className="pb-inviteHero__detailValue">{dateText}</span>
              </div>
            </div>
            <div className="pb-inviteHero__detailRow">
              <span className="pb-inviteHero__detailIcon" aria-hidden>
                <IconClock />
              </span>
              <div className="pb-inviteHero__detailText">
                <span className="pb-inviteHero__detailLabel">Vrijeme</span>
                <span className="pb-inviteHero__detailValue">{timeText}</span>
              </div>
            </div>
            <a
              className="pb-inviteHero__detailRow pb-inviteHero__detailRow--link"
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span className="pb-inviteHero__detailIcon" aria-hidden>
                <IconPin />
              </span>
              <div className="pb-inviteHero__detailText">
                <span className="pb-inviteHero__detailLabel">Lokacija</span>
                <span className="pb-inviteHero__detailValue pb-inviteHero__detailValue--venue">{venueText}</span>
                <span className="pb-inviteHero__venueHint">Otvori u Google Maps</span>
              </div>
            </a>
          </div>

          <p className="pb-inviteHero__message">{messageText}</p>

          {showRsvp ? (
            <div className="pb-inviteHero__rsvpBlock">
              <h2 className="pb-inviteHero__rsvpTitle">Javi dolazak</h2>
              <div className="pb-inviteHero__rsvpButtons">
                <button
                  type="button"
                  className={`pb-rsvpBtn pb-rsvpBtn--hero pb-rsvpBtn--heroHalf pb-rsvpBtn--going ${rsvp === 'going' ? 'is-active' : ''}`}
                  onClick={() => onRsvpClick?.('going')}
                >
                  <span className="pb-rsvpBtn__emoji" aria-hidden>
                    👍
                  </span>
                  Dolazimo
                </button>
                <button
                  type="button"
                  className={`pb-rsvpBtn pb-rsvpBtn--hero pb-rsvpBtn--heroHalf pb-rsvpBtn--notGoing ${rsvp === 'not_going' ? 'is-active' : ''}`}
                  onClick={() => onRsvpClick?.('not_going')}
                >
                  <span className="pb-rsvpBtn__emoji" aria-hidden>
                    😢
                  </span>
                  Ne dolazimo
                </button>
                <button
                  type="button"
                  className={`pb-rsvpBtn pb-rsvpBtn--hero pb-rsvpBtn--heroFull pb-rsvpBtn--maybe ${rsvp === 'maybe' ? 'is-active' : ''}`}
                  onClick={() => onRsvpClick?.('maybe')}
                >
                  <span className="pb-rsvpBtn__emoji" aria-hidden>
                    🤔
                  </span>
                  Možda
                </button>
              </div>
              {rsvpNote ? <p className="pb-inviteHero__rsvpNote">{rsvpNote}</p> : null}
              {guestRsvpHint ? <p className="pb-inviteHero__rsvpHint">{guestRsvpHint}</p> : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
