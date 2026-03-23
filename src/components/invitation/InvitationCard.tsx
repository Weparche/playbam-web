import { useMemo, useState } from 'react'

type RSVP = 'yes' | 'no' | null

export default function InvitationCard() {
  const [rsvp, setRsvp] = useState<RSVP>(null)

  // Demo vrijednosti (bez backend-a)
  const model = useMemo(
    () => ({
      name: 'Luka',
      date: '22. rujna 2026.',
      time: '17:00',
      location: 'Igraonica Bubamara, Zagreb',
      theme: 'Mali istraživači',
    }),
    [],
  )

  return (
    <section className="pb-inviteCard" aria-label="Web pozivnica za rođendan">
      <div className="pb-inviteCard__banner">
        <div className="pb-inviteCard__bannerPattern" aria-hidden="true" />
        <div className="pb-inviteCard__bannerInner">
          <div className="pb-inviteCard__badge">
            <span className="pb-inviteCard__badgeDot" aria-hidden="true" />
            Digitalna pozivnica
          </div>
          <h1 className="pb-inviteCard__title">
            Pozivamo te na rođendan
          </h1>
          <p className="pb-inviteCard__subtitle">
            Slavlje za {model.name} - u veselom duhu!
          </p>
        </div>
      </div>

      <div className="pb-inviteCard__content">
        <div className="pb-inviteCard__grid">
          <div className="pb-inviteCard__details">
            <div className="pb-inviteField">
              <div className="pb-inviteField__label">Datum</div>
              <div className="pb-inviteField__value">{model.date}</div>
            </div>
            <div className="pb-inviteField">
              <div className="pb-inviteField__label">Vrijeme</div>
              <div className="pb-inviteField__value">{model.time}</div>
            </div>
            <div className="pb-inviteField">
              <div className="pb-inviteField__label">Lokacija</div>
              <div className="pb-inviteField__value">{model.location}</div>
            </div>
            <div className="pb-inviteField">
              <div className="pb-inviteField__label">Tema rođendana</div>
              <div className="pb-inviteField__value">{model.theme}</div>
            </div>

            <div className="pb-inviteRSVP" aria-label="Potvrda dolaska">
              <button
                type="button"
                className={['pb-rsvpBtn', rsvp === 'yes' ? 'is-active' : ''].join(' ')}
                onClick={() => setRsvp('yes')}
              >
                Dolazim
              </button>
              <button
                type="button"
                className={['pb-rsvpBtn', rsvp === 'no' ? 'is-active' : ''].join(' ')}
                onClick={() => setRsvp('no')}
              >
                Ne dolazim
              </button>
            </div>

            <div className="pb-inviteRSVP__note" aria-live="polite">
              {rsvp === 'yes' ? (
                <span>Hvala! Vidimo se na rođendanu.</span>
              ) : rsvp === 'no' ? (
                <span>Šteta. Nadamo se da se vidimo uskoro!</span>
              ) : (
                <span>Odaberi “Dolazim” ili “Ne dolazim”.</span>
              )}
            </div>
          </div>

          <div className="pb-inviteCard__mapWrap">
            <div className="pb-inviteCard__mapLabel">Karta / lokacija</div>
            <div className="pb-mapPlaceholder">
              <div className="pb-mapPin" aria-hidden="true" />
            </div>
            <div className="pb-mapCaption">Točna lokacija bit će prikazana ovdje.</div>
          </div>
        </div>
      </div>
    </section>
  )
}

