import type { PublicInvitation } from '../../lib/invitationApi'

type Props = {
  invitation: PublicInvitation
  access?: 'public' | 'private'
  rsvp?: 'going' | 'not_going' | 'maybe' | null
  onRsvpChange?: (response: 'going' | 'not_going' | 'maybe') => void
}

export default function InvitationCard({ invitation, access = 'public', rsvp = null, onRsvpChange }: Props) {
  const canRsvp = access === 'private' && typeof onRsvpChange === 'function'

  return (
    <section className="pb-inviteCard" aria-label="Web pozivnica za rodendan">
      <div
        className="pb-inviteCard__banner"
        style={{
          background:
            invitation.coverImage || 'linear-gradient(135deg, rgba(30, 123, 230, 0.22), rgba(251, 146, 60, 0.24))',
        }}
      >
        <div className="pb-inviteCard__bannerPattern" aria-hidden="true" />
        <div className="pb-inviteCard__bannerInner">
          <div className="pb-inviteCard__badge">
            <span className="pb-inviteCard__badgeDot" aria-hidden="true" />
            Digitalna pozivnica
          </div>
          <h1 className="pb-inviteCard__title">{invitation.title}</h1>
          <p className="pb-inviteCard__subtitle">{invitation.message || 'Veselimo se druženju i proslavi!'}</p>
        </div>
      </div>

      <div className="pb-inviteCard__content">
        <div className="pb-inviteCard__grid">
          <div className="pb-inviteCard__details">
            <div className="pb-inviteField">
              <div className="pb-inviteField__label">Slavljenik</div>
              <div className="pb-inviteField__value">{invitation.celebrantName}</div>
            </div>
            <div className="pb-inviteField">
              <div className="pb-inviteField__label">Datum</div>
              <div className="pb-inviteField__value">{invitation.date}</div>
            </div>
            <div className="pb-inviteField">
              <div className="pb-inviteField__label">Vrijeme</div>
              <div className="pb-inviteField__value">{invitation.time}</div>
            </div>
            <div className="pb-inviteField">
              <div className="pb-inviteField__label">Lokacija</div>
              <div className="pb-inviteField__value">{invitation.location}</div>
            </div>
            <div className="pb-inviteField">
              <div className="pb-inviteField__label">Tema rodendana</div>
              <div className="pb-inviteField__value">{invitation.theme || 'Playbam pozivnica'}</div>
            </div>
            <div className={`pb-inviteField ${access === 'private' ? 'pb-inviteField--accent' : 'pb-inviteField--muted'}`}>
              <div className="pb-inviteField__label">Pristup</div>
              <div className="pb-inviteField__value">
                {access === 'private'
                  ? 'Privatni dio pozivnice je otključan za tvoju obitelj.'
                  : 'Ovdje prikazujemo samo sigurne javne podatke iz zajedničkog backend zapisa.'}
              </div>
            </div>

            {canRsvp ? (
              <div className="pb-inviteField pb-inviteField--accent">
                <div className="pb-inviteField__label">Potvrdi dolazak</div>
                <div className="pb-inviteRSVP">
                  <button
                    type="button"
                    className={`pb-rsvpBtn ${rsvp === 'going' ? 'is-active' : ''}`}
                    onClick={() => onRsvpChange('going')}
                  >
                    Dolazimo
                  </button>
                  <button
                    type="button"
                    className={`pb-rsvpBtn ${rsvp === 'not_going' ? 'is-active' : ''}`}
                    onClick={() => onRsvpChange('not_going')}
                  >
                    Ne dolazimo
                  </button>
                  <button
                    type="button"
                    className={`pb-rsvpBtn ${rsvp === 'maybe' ? 'is-active' : ''}`}
                    onClick={() => onRsvpChange('maybe')}
                  >
                    Možda
                  </button>
                </div>
                <div className="pb-inviteRSVP__note">
                  {rsvp === 'going'
                    ? 'Označili ste da dolazite.'
                    : rsvp === 'not_going'
                      ? 'Označili ste da ne dolazite.'
                      : rsvp === 'maybe'
                        ? 'Označili ste da još niste sigurni.'
                        : 'Odaberite odgovor za svoju obitelj.'}
                </div>
              </div>
            ) : null}
          </div>

          <div className="pb-inviteCard__mapWrap">
            <div className="pb-inviteCard__mapLabel">Karta / lokacija</div>
            <div className="pb-mapPlaceholder">
              <div className="pb-mapPin" aria-hidden="true" />
            </div>
            <div className="pb-mapCaption">Web ruta čita istu spremljenu pozivnicu koja je nastala u mobilnoj aplikaciji.</div>
          </div>
        </div>
      </div>
    </section>
  )
}
