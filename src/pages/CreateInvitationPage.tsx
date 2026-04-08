import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { createInvitation } from '../lib/invitationApi'
import { readStoredHostToken, writeStoredHostToken } from '../lib/hostWebSession'

const LOCATION_TYPES = ['Igraonica / lokal', 'Kod kuće', 'Na otvorenom', 'Druga lokacija'] as const
const COVER_THEMES = ['konfeti', 'baloni', 'zvjezdice'] as const

export default function CreateInvitationPage() {
  const navigate = useNavigate()
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const [hostToken, setHostToken] = useState(() => readStoredHostToken())
  const [hostTokenDraft, setHostTokenDraft] = useState('')
  const [hostError, setHostError] = useState('')
  const [title, setTitle] = useState('')
  const [celebrantName, setCelebrantName] = useState('')
  const [locationType, setLocationType] = useState<(typeof LOCATION_TYPES)[number]>('Igraonica / lokal')
  const [locationName, setLocationName] = useState('')
  const [locationAddress, setLocationAddress] = useState('')
  const [date, setDate] = useState(today)
  const [time, setTime] = useState('15:00')
  const [message, setMessage] = useState('Veselimo se druženju s vama!')
  const [coverTheme, setCoverTheme] = useState<(typeof COVER_THEMES)[number]>('konfeti')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleHostLogin = () => {
    const nextToken = hostTokenDraft.trim()
    if (!nextToken) {
      setHostError('Upiši host token.')
      return
    }

    writeStoredHostToken(nextToken)
    setHostToken(nextToken)
    setHostTokenDraft('')
    setHostError('')
  }

  const handleHostLogout = () => {
    writeStoredHostToken(null)
    setHostToken('')
    setHostError('')
  }

  const handleCreate = async () => {
    const resolvedTitle = title.trim() || (celebrantName.trim() ? `${celebrantName.trim()} slavi rođendan` : '')
    const location = [locationType.trim(), locationName.trim(), locationAddress.trim()].filter(Boolean).join(', ')

    if (!hostToken) {
      setFormError('Prijavi se kao organizator prije spremanja pozivnice.')
      return
    }
    if (!resolvedTitle || !celebrantName.trim() || !date || !time || !location) {
      setFormError('Ispuni naslov, ime slavljenika, datum, vrijeme i lokaciju.')
      return
    }

    setSaving(true)
    setFormError('')

    try {
      const created = await createInvitation({
        title: resolvedTitle,
        celebrantName: celebrantName.trim(),
        date,
        time,
        location,
        message: message.trim() || undefined,
        coverImage: coverTheme,
        theme: coverTheme,
      })
      navigate(`/pozivnica/${created.publicSlug || created.shareToken}`)
    } catch {
      setFormError('Spremanje pozivnice trenutno nije uspjelo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="pb-main">
        <section className="pb-section">
          <div className="pb-container pb-createInvitePage">
            <header className="pb-sectionHeader">
              <h1 className="pb-title">Kreiraj pozivnicu</h1>
              <p className="pb-subtitle">
                Web create flow po uzoru na mobile dio, za brz unos osnovnih detalja rođendana.
              </p>
            </header>

            {!hostToken ? (
              <Card className="pb-flowCard">
                <h2 className="pb-flowCard__title">Organizator pristup</h2>
                <p className="pb-flowCard__text">Unesi host token da možeš spremiti novu pozivnicu.</p>
                <div className="pb-formGrid">
                  <label className="pb-formField">
                    <span className="pb-formLabel">Host token</span>
                    <input
                      className="pb-input"
                      type="password"
                      value={hostTokenDraft}
                      onChange={(event) => setHostTokenDraft(event.target.value)}
                      placeholder="playbam-prod-host-token"
                    />
                  </label>
                </div>
                <div className="pb-flowActions">
                  <Button type="button" onClick={handleHostLogin}>
                    Uđi kao organizator
                  </Button>
                </div>
                {hostError ? <div className="pb-inlineNote pb-inlineNote--error">{hostError}</div> : null}
              </Card>
            ) : (
              <Card className="pb-flowCard">
                <div className="pb-createInvitePage__session">
                  <div>
                    <h2 className="pb-flowCard__title">Host pristup aktivan</h2>
                    <p className="pb-flowCard__text">Kreiraj novu pozivnicu i odmah otvori njezin javni web link.</p>
                  </div>
                  <Button variant="ghost" type="button" onClick={handleHostLogout}>
                    Odjavi host pristup
                  </Button>
                </div>
              </Card>
            )}

            <Card className="pb-flowCard">
              <div className="pb-formGrid">
                <label className="pb-formField">
                  <span className="pb-formLabel">Naslov pozivnice</span>
                  <input
                    className="pb-input"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="npr. Lana slavi rođendan"
                  />
                </label>

                <label className="pb-formField">
                  <span className="pb-formLabel">Ime slavljenika</span>
                  <input
                    className="pb-input"
                    type="text"
                    value={celebrantName}
                    onChange={(event) => setCelebrantName(event.target.value)}
                    placeholder="Unesi ime slavljenika"
                  />
                </label>

                <div className="pb-formField">
                  <span className="pb-formLabel">Tip lokacije</span>
                  <div className="pb-createInvitePage__chips">
                    {LOCATION_TYPES.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`pb-createInvitePage__chip ${locationType === option ? 'is-active' : ''}`}
                        onClick={() => setLocationType(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="pb-formField">
                  <span className="pb-formLabel">Naziv lokacije</span>
                  <input
                    className="pb-input"
                    type="text"
                    value={locationName}
                    onChange={(event) => setLocationName(event.target.value)}
                    placeholder="Naziv igraonice ili lokacije"
                  />
                </label>

                <label className="pb-formField">
                  <span className="pb-formLabel">Adresa ili opis lokacije</span>
                  <input
                    className="pb-input"
                    type="text"
                    value={locationAddress}
                    onChange={(event) => setLocationAddress(event.target.value)}
                    placeholder="Adresa ili kratak opis"
                  />
                </label>

                <div className="pb-createInvitePage__dateTime">
                  <label className="pb-formField">
                    <span className="pb-formLabel">Datum</span>
                    <input className="pb-input" type="date" value={date} min={today} onChange={(event) => setDate(event.target.value)} />
                  </label>
                  <label className="pb-formField">
                    <span className="pb-formLabel">Vrijeme</span>
                    <input className="pb-input" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
                  </label>
                </div>

                <label className="pb-formField">
                  <span className="pb-formLabel">Poruka za uzvanike</span>
                  <textarea
                    className="pb-input pb-createInvitePage__textarea"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Veselimo se druženju s vama!"
                  />
                </label>

                <div className="pb-formField">
                  <span className="pb-formLabel">Tema pozivnice</span>
                  <div className="pb-createInvitePage__chips">
                    {COVER_THEMES.map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        className={`pb-createInvitePage__chip ${coverTheme === theme ? 'is-active' : ''}`}
                        onClick={() => setCoverTheme(theme)}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pb-flowActions">
                <Button type="button" onClick={handleCreate} disabled={saving}>
                  {saving ? 'Spremamo...' : 'Spremi pozivnicu'}
                </Button>
              </div>

              {formError ? <div className="pb-inlineNote pb-inlineNote--error">{formError}</div> : null}
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
