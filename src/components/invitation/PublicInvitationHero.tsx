import { useEffect, useState } from 'react'

type Props = {
  celebrantTitle: string
  dateText: string
  timeText: string
  venueText: string
  messageText: string
  backgroundImage: string
  showRsvp?: boolean
  rsvp?: 'going' | 'not_going' | 'maybe' | null
  guestRsvpHint?: string | null
  onRsvpClick?: (choice: 'going' | 'not_going' | 'maybe') => void
  accessTitle: string
  accessText: string
  showAccessCard?: boolean
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
  dateText,
  timeText,
  venueText,
  messageText,
  backgroundImage,
  showRsvp = false,
  rsvp = null,
  guestRsvpHint = null,
  onRsvpClick,
  accessTitle,
  accessText,
  showAccessCard = true,
}: Props) {
  const fallbackImage = '/pozivnica-bg.png'
  const [heroImage, setHeroImage] = useState(backgroundImage || fallbackImage)
  const [titlePrimary, titleSecondary = ''] = celebrantTitle.split('|')
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueText)}`

  useEffect(() => {
    setHeroImage(backgroundImage || fallbackImage)
  }, [backgroundImage])

  return (
    <section className="pb-inviteHero pb-inviteHero--storybook" aria-label="Hero dio javne rođendanske pozivnice">
      <div className="pb-inviteHero__frame pb-inviteHero__frame--storybook">
        <img
          className="pb-inviteHero__image pb-inviteHero__image--storybook"
          src={heroImage}
          alt=""
          aria-hidden="true"
          onError={() => {
            if (heroImage !== fallbackImage) {
              setHeroImage(fallbackImage)
            }
          }}
        />

        <div className="pb-inviteHero__content pb-inviteHero__content--storybook">
          <img className="pb-inviteHero__logo" src="/logo.png" alt="Playbam.hr" />

          <header className="pb-inviteHero__titleWrap pb-inviteHero__titleWrap--storybook">
            <h1 className="pb-inviteHero__title pb-inviteHero__title--storybook">
              <span className="pb-inviteHero__titleLine">{titlePrimary}</span>
              {titleSecondary ? <span className="pb-inviteHero__titleLine">{titleSecondary}</span> : null}
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
          </div>

          {showRsvp ? (
            <div className="pb-inviteHero__rsvpBlock pb-inviteHero__rsvpBlock--storybook">
              <h2 className="pb-inviteHero__rsvpTitle pb-inviteHero__rsvpTitle--storybook">Potvrdi dolazak</h2>
              <div className="pb-inviteHero__rsvpButtons pb-inviteHero__rsvpButtons--storybook">
                <button
                  type="button"
                  className={`pb-rsvpBtn pb-rsvpBtn--storybook pb-rsvpBtn--storybookGoing ${rsvp === 'going' ? 'is-active' : ''}`}
                  onClick={() => onRsvpClick?.('going')}
                >
                  🥳 Dolazimo
                </button>
                <button
                  type="button"
                  className={`pb-rsvpBtn pb-rsvpBtn--storybook pb-rsvpBtn--storybookNotGoing ${rsvp === 'not_going' ? 'is-active' : ''}`}
                  onClick={() => onRsvpClick?.('not_going')}
                >
                  ❤️ Ne dolazimo
                </button>
                <button
                  type="button"
                  className={`pb-rsvpBtn pb-rsvpBtn--storybook pb-rsvpBtn--storybookMaybe ${rsvp === 'maybe' ? 'is-active' : ''}`}
                  onClick={() => onRsvpClick?.('maybe')}
                >
                  ✨ Možda
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
