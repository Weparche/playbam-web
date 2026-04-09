import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { createInvitation } from '../lib/invitationApi'

const LOCATION_TYPES = ['Igraonica / lokal', 'Kod kuće', 'Na otvorenom', 'Druga lokacija'] as const
const COVER_THEMES = ['konfeti', 'baloni', 'zvjezdice'] as const

const COVER_THEME_META = {
  konfeti: { label: 'Konfeti', eyebrow: 'Theme', description: 'Šaren i veseo poster za klasični party.' },
  baloni: { label: 'Baloni', eyebrow: 'Theme', description: 'Lagani, prozračni vizual s više topline.' },
  zvjezdice: { label: 'Zvjezdice', eyebrow: 'Theme', description: 'Čarobniji, sanjiviji smjer za posebniji vibe.' },
} as const

const TITLE_FONT_OPTIONS = [
  { id: 'poster', label: 'Poster', description: 'Deblji naslov za hero riječ.', preview: 'Luka slavi!' },
  { id: 'script', label: 'Rukopis', description: 'Više invitation osjećaja i topline.', preview: 'Luka slavi!' },
  { id: 'clean', label: 'Clean', description: 'Najčišći i najsmireniji naslov.', preview: 'Luka slavi!' },
] as const

const EFFECT_OPTIONS = [
  { id: 'confetti', label: 'Konfeti', description: 'Sitni party detalji preko postera.' },
  { id: 'streamers', label: 'Trakice', description: 'Malo više kretanja na rubovima.' },
  { id: 'glow', label: 'Glow', description: 'Mekši premium sjaj bez puno šuma.' },
] as const

const RSVP_STYLE_OPTIONS = [
  { id: 'party', label: 'Party', description: 'Najrazigraniji set za klasični rođendan.', symbols: { going: '🥳', maybe: '🤔', not_going: '💔' } },
  { id: 'sweet', label: 'Sweet', description: 'Mekši, slatki mood s više charactera.', symbols: { going: '🧁', maybe: '💭', not_going: '🥲' } },
  { id: 'icons', label: 'Icons', description: 'Čistiji simboli za uredniji preview.', symbols: { going: '✦', maybe: '◌', not_going: '✕' } },
  { id: 'spark', label: 'Spark', description: 'Malo sjaja i više editorial osjećaja.', symbols: { going: '✨', maybe: '👀', not_going: '🌧️' } },
] as const

const RSVP_CHOICES = [
  { id: 'going', label: 'Dolazimo' },
  { id: 'maybe', label: 'Možda' },
  { id: 'not_going', label: 'Ne dolazimo' },
] as const

const STYLE_PRESETS = [
  { id: 'birthday-pop', label: 'Birthday Pop', vibe: 'Šaren i vedar', theme: 'konfeti', font: 'poster', effect: 'confetti' },
  { id: 'soft-party', label: 'Soft Party', vibe: 'Topliji i nježniji', theme: 'baloni', font: 'script', effect: 'glow' },
  { id: 'magic-night', label: 'Magic Night', vibe: 'Malo čarobniji mood', theme: 'zvjezdice', font: 'clean', effect: 'streamers' },
] as const

type CoverTheme = (typeof COVER_THEMES)[number]
type TitleFont = (typeof TITLE_FONT_OPTIONS)[number]['id']
type EffectStyle = (typeof EFFECT_OPTIONS)[number]['id']
type RsvpStyle = (typeof RSVP_STYLE_OPTIONS)[number]['id']
type RsvpChoice = (typeof RSVP_CHOICES)[number]['id']

function formatPreviewDate(dateValue: string) {
  if (!dateValue.trim()) return 'Datum još nije odabran'
  const parsedDate = new Date(`${dateValue}T12:00:00`)
  if (Number.isNaN(parsedDate.getTime())) return dateValue
  return parsedDate
    .toLocaleDateString('hr-HR', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(/^./u, (letter) => letter.toUpperCase())
}

function formatShortDate(dateValue: string) {
  if (!dateValue.trim()) return 'Odaberi datum'
  const parsedDate = new Date(`${dateValue}T12:00:00`)
  if (Number.isNaN(parsedDate.getTime())) return dateValue
  return parsedDate
    .toLocaleDateString('hr-HR', { weekday: 'short', day: 'numeric', month: 'numeric' })
    .replace(/^./u, (letter) => letter.toUpperCase())
}

function formatPreviewTime(timeValue: string) {
  return timeValue.trim() ? `${timeValue.trim()} h` : 'Vrijeme uskoro'
}

function buildPreviewLocation(locationName: string, locationAddress: string, locationType: string) {
  const details = [locationName.trim(), locationAddress.trim()].filter(Boolean)
  return details.length > 0 ? details.join(' • ') : locationType.trim() || 'Lokacija uskoro'
}

function getRsvpSymbol(style: RsvpStyle, choice: RsvpChoice) {
  const selectedStyle = RSVP_STYLE_OPTIONS.find((option) => option.id === style) ?? RSVP_STYLE_OPTIONS[0]
  return selectedStyle.symbols[choice]
}

function formatInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildDateTime(date: string, time: string) {
  return `${date}T${time || '15:00'}`
}

function getUpcomingDateOptions(referenceDate: string) {
  const startDate = referenceDate ? new Date(`${referenceDate}T12:00:00`) : new Date()
  const options: Array<{ value: string; label: string }> = []
  for (let offset = 0; options.length < 4; offset += 1) {
    const candidate = new Date(startDate)
    candidate.setDate(startDate.getDate() + offset)
    const day = candidate.getDay()
    if (offset === 0 || day === 6 || day === 0) {
      const value = formatInputDate(candidate)
      options.push({ value, label: formatShortDate(value) })
    }
  }
  return options
}

export default function CreateInvitationPage() {
  const navigate = useNavigate()
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const defaultDateTime = `${today}T15:00`
  const datePopoverRef = useRef<HTMLDivElement | null>(null)
  const themeRef = useRef<HTMLDivElement | null>(null)
  const effectRef = useRef<HTMLDivElement | null>(null)
  const rsvpRef = useRef<HTMLDivElement | null>(null)
  const settingsRef = useRef<HTMLDivElement | null>(null)

  const [title, setTitle] = useState('')
  const [celebrantName, setCelebrantName] = useState('')
  const [dateTime, setDateTime] = useState(defaultDateTime)
  const [locationName, setLocationName] = useState('')
  const [locationAddress, setLocationAddress] = useState('')
  const [locationType, setLocationType] = useState<(typeof LOCATION_TYPES)[number]>('Igraonica / lokal')
  const [message, setMessage] = useState('Vidimo se na tulumu!')
  const [showAdditionalOptions, setShowAdditionalOptions] = useState(false)
  const [coverTheme, setCoverTheme] = useState<CoverTheme>('konfeti')
  const [titleFont, setTitleFont] = useState<TitleFont>('poster')
  const [effectStyle, setEffectStyle] = useState<EffectStyle>('confetti')
  const [rsvpStyle, setRsvpStyle] = useState<RsvpStyle>('party')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const themeMeta = COVER_THEME_META[coverTheme]
  const resolvedTitle = title.trim() || (celebrantName.trim() ? `${celebrantName.trim()} slavi rođendan` : '')
  const previewTitle = resolvedTitle || 'Tvoje slavlje uskoro stiže'
  const [date = '', time = '15:00'] = dateTime.split('T')
  const previewLocation = buildPreviewLocation(locationName, locationAddress, locationType)
  const fullLocation = [locationName.trim(), locationAddress.trim()].filter(Boolean).join(', ')
  const previewMessage = message.trim() || 'Vidimo se na tulumu!'
  const quickDateOptions = useMemo(() => getUpcomingDateOptions(today), [today])
  const activeStylePreset =
    STYLE_PRESETS.find((preset) => preset.theme === coverTheme && preset.font === titleFont && preset.effect === effectStyle)?.id ?? null

  useEffect(() => {
    if (!isDatePickerOpen) return undefined
    const handlePointerDown = (event: MouseEvent) => {
      if (!datePopoverRef.current?.contains(event.target as Node)) setIsDatePickerOpen(false)
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDatePickerOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isDatePickerOpen])

  const jumpTo = (ref: React.RefObject<HTMLDivElement | null>) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const handleDateChange = (nextDate: string) => setDateTime(buildDateTime(nextDate, time))
  const handleTimeChange = (nextTime: string) => setDateTime(buildDateTime(date || today, nextTime))
  const applyStylePreset = (theme: CoverTheme, font: TitleFont, effect: EffectStyle) => {
    setCoverTheme(theme)
    setTitleFont(font)
    setEffectStyle(effect)
  }

  const handleCreate = async () => {
    if (!resolvedTitle || !celebrantName.trim() || !date || !time || !locationName.trim()) {
      setFormError('Upiši naslov, ime slavljenika, datum, vrijeme i naziv lokacije.')
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
        location: fullLocation || locationName.trim(),
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
      <main className="pb-main pb-main--create">
        <section className="pb-section pb-createStudio">
          <div className="pb-createStudio__shell pb-createStudio__shell--dock">
            <header className="pb-createStudio__hero pb-createStudio__hero--center">
              <div className="pb-createStudio__heroCopy pb-createStudio__heroCopy--center">
                <span className="pb-createStudio__eyebrow">VidimOse create</span>
                <h1 className="pb-title pb-createStudio__title pb-createStudio__title--wide">Jednostavno kreiranje pozivnice za tulume!</h1>
              </div>
            </header>

            <div className="pb-createStudio__content">
              <Card className="pb-flowCard pb-createStudio__panel">
                <div className="pb-createStudio__sectionHeader">
                  <div>
                    <span className="pb-createStudio__sectionEyebrow">Osnove</span>
                    <h2 className="pb-flowCard__title">Naslov i font</h2>
                  </div>
                </div>
                <div className="pb-createStudio__stylePresetRow" aria-label="Style presets">
                  {STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`pb-createStudio__stylePreset ${activeStylePreset === preset.id ? 'is-active' : ''}`}
                      onClick={() => applyStylePreset(preset.theme, preset.font, preset.effect)}
                    >
                      <span className={`pb-createStudio__stylePresetPoster pb-createStudio__stylePresetPoster--${preset.theme} pb-createStudio__stylePresetPoster--${preset.effect}`}>
                        <span className={`pb-createStudio__stylePresetWord pb-createStudio__stylePresetWord--${preset.font}`}>{celebrantName.trim() || 'Luka'}</span>
                      </span>
                      <span className="pb-createStudio__stylePresetCopy">
                        <strong>{preset.label}</strong>
                        <span>{preset.vibe}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <div className="pb-createStudio__formGrid">
                  <label className="pb-formField">
                    <span className="pb-formLabel">Naslov pozivnice</span>
                    <input className="pb-input" type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="npr. Luka slavi 6. rođendan" />
                  </label>
                  <label className="pb-formField">
                    <span className="pb-formLabel">Ime slavljenika</span>
                    <input className="pb-input" type="text" value={celebrantName} onChange={(event) => setCelebrantName(event.target.value)} placeholder="Unesi ime slavljenika" />
                  </label>
                </div>
                <div className="pb-createStudio__fontGrid">
                  {TITLE_FONT_OPTIONS.map((option) => (
                    <button key={option.id} type="button" className={`pb-createStudio__fontOption ${titleFont === option.id ? 'is-active' : ''}`} onClick={() => setTitleFont(option.id)}>
                      <span className={`pb-createStudio__fontPreview pb-createStudio__fontPreview--${option.id}`}>{option.preview}</span>
                      <span className="pb-createStudio__fontCopy">
                        <strong>{option.label}</strong>
                        <span>{option.description}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="pb-flowCard pb-createStudio__panel pb-createStudio__panel--highlight">
                <div className="pb-createStudio__sectionHeader">
                  <div>
                    <span className="pb-createStudio__sectionEyebrow">Kada i gdje</span>
                    <h2 className="pb-flowCard__title">Termin i lokacija</h2>
                  </div>
                </div>
                <div className="pb-createStudio__formGrid">
                  <div className="pb-formField pb-createStudio__datePickerField" ref={datePopoverRef}>
                    <span className="pb-formLabel">Datum i vrijeme</span>
                    <button type="button" className={`pb-createStudio__datePickerTrigger ${isDatePickerOpen ? 'is-open' : ''}`} onClick={() => setIsDatePickerOpen((current) => !current)}>
                      <span className="pb-createStudio__datePickerValue">
                        <strong>{formatPreviewDate(date)}</strong>
                        <span>{formatPreviewTime(time)}</span>
                      </span>
                      <span className="pb-createStudio__datePickerMeta">{isDatePickerOpen ? 'Zatvori' : 'Odaberi'}</span>
                    </button>
                    {isDatePickerOpen ? (
                      <div className="pb-createStudio__datePopover">
                        <div className="pb-createStudio__datePopoverHeader">
                          <strong>Odaberi termin</strong>
                          <button type="button" className="pb-createStudio__datePopoverClose" onClick={() => setIsDatePickerOpen(false)}>Gotovo</button>
                        </div>
                        <div className="pb-createStudio__quickDateGrid">
                          {quickDateOptions.map((option) => (
                            <button key={option.value} type="button" className={`pb-createStudio__quickDateChip ${date === option.value ? 'is-active' : ''}`} onClick={() => handleDateChange(option.value)}>
                              {option.label}
                            </button>
                          ))}
                        </div>
                        <div className="pb-createStudio__popoverGrid">
                          <label className="pb-formField">
                            <span className="pb-formLabel">Datum</span>
                            <input className="pb-input" type="date" min={today} value={date} onChange={(event) => handleDateChange(event.target.value)} />
                          </label>
                          <label className="pb-formField">
                            <span className="pb-formLabel">Vrijeme</span>
                            <input className="pb-input" type="time" value={time} onChange={(event) => handleTimeChange(event.target.value)} />
                          </label>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <label className="pb-formField">
                    <span className="pb-formLabel">Naziv lokacije</span>
                    <input className="pb-input" type="text" value={locationName} onChange={(event) => setLocationName(event.target.value)} placeholder="npr. Igraonica Jogica" />
                  </label>
                </div>

                <div className="pb-flowActions">
                  <button type="button" className={`pb-createStudio__plusButton ${showAdditionalOptions ? 'is-open' : ''}`} onClick={() => setShowAdditionalOptions((current) => !current)}>
                    <span className="pb-createStudio__plusMark" aria-hidden="true">+</span>
                    <span>{showAdditionalOptions ? 'Sakrij dodatne opcije' : 'Dodaj dodatne opcije'}</span>
                  </button>
                </div>

                {showAdditionalOptions ? (
                  <div className="pb-createStudio__extraOptions">
                    <div className="pb-formField">
                      <span className="pb-formLabel">Tip lokacije</span>
                      <div className="pb-createStudio__chips">
                        {LOCATION_TYPES.map((option) => (
                          <button key={option} type="button" className={`pb-createStudio__chip ${locationType === option ? 'is-active' : ''}`} onClick={() => setLocationType(option)}>{option}</button>
                        ))}
                      </div>
                    </div>
                    <div className="pb-createStudio__formGrid">
                      <label className="pb-formField">
                        <span className="pb-formLabel">Adresa / detalji lokacije</span>
                        <input className="pb-input" type="text" value={locationAddress} onChange={(event) => setLocationAddress(event.target.value)} placeholder="Adresa ili kratki opis" />
                      </label>
                      <label className="pb-formField">
                        <span className="pb-formLabel">Poruka za goste</span>
                        <textarea className="pb-input pb-createStudio__textarea" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Vidimo se na tulumu!" />
                      </label>
                    </div>
                  </div>
                ) : null}

                <div className="pb-flowActions pb-flowActions--createMain">
                  <Button variant="amber" type="button" onClick={handleCreate} disabled={saving}>{saving ? 'Spremamo...' : 'Izradi pozivnicu'}</Button>
                </div>
                {formError ? <div className="pb-inlineNote pb-inlineNote--error">{formError}</div> : null}
              </Card>

              <div ref={themeRef}>
                <Card className="pb-flowCard pb-createStudio__panel">
                  <div className="pb-createStudio__sectionHeader"><div><span className="pb-createStudio__sectionEyebrow">Theme</span><h2 className="pb-flowCard__title">Poster</h2></div></div>
                  <div className="pb-createStudio__themeGrid">
                    {COVER_THEMES.map((theme) => {
                      const option = COVER_THEME_META[theme]
                      return (
                        <button key={theme} type="button" className={`pb-createStudio__themeOption pb-createStudio__themeOption--${theme} ${coverTheme === theme ? 'is-active' : ''}`} onClick={() => setCoverTheme(theme)}>
                          <span className="pb-createStudio__themePreview" aria-hidden="true" />
                          <span className="pb-createStudio__themeCopy"><strong>{option.label}</strong><span>{option.description}</span></span>
                        </button>
                      )
                    })}
                  </div>
                </Card>
              </div>

              <div ref={effectRef}>
                <Card className="pb-flowCard pb-createStudio__panel">
                  <div className="pb-createStudio__sectionHeader"><div><span className="pb-createStudio__sectionEyebrow">Effect</span><h2 className="pb-flowCard__title">Vizualni sloj</h2></div></div>
                  <div className="pb-createStudio__themeGrid">
                    {EFFECT_OPTIONS.map((option) => (
                      <button key={option.id} type="button" className={`pb-createStudio__themeOption ${effectStyle === option.id ? 'is-active' : ''}`} onClick={() => setEffectStyle(option.id)}>
                        <span className={`pb-createStudio__themePreview pb-createStudio__themePreview--${option.id}`} aria-hidden="true" />
                        <span className="pb-createStudio__themeCopy"><strong>{option.label}</strong><span>{option.description}</span></span>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              <div ref={rsvpRef}>
                <Card className="pb-flowCard pb-createStudio__panel">
                  <div className="pb-createStudio__sectionHeader"><div><span className="pb-createStudio__sectionEyebrow">RSVP</span><h2 className="pb-flowCard__title">Mood picker</h2></div></div>
                  <div className="pb-createStudio__rsvpStyleGrid">
                    {RSVP_STYLE_OPTIONS.map((option) => (
                      <button key={option.id} type="button" className={`pb-createStudio__rsvpStyleOption pb-createStudio__rsvpStyleOption--${option.id} ${rsvpStyle === option.id ? 'is-active' : ''}`} onClick={() => setRsvpStyle(option.id)}>
                        <span className="pb-createStudio__rsvpStylePreview" aria-hidden="true">
                          {RSVP_CHOICES.map((choice) => <span key={choice.id} className="pb-createStudio__rsvpStyleChip">{option.symbols[choice.id]}</span>)}
                        </span>
                        <span className="pb-createStudio__fontCopy"><strong>{option.label}</strong><span>{option.description}</span></span>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              <div ref={settingsRef}>
                <Card className="pb-flowCard pb-createStudio__panel">
                  <div className="pb-createStudio__sectionHeader"><div><span className="pb-createStudio__sectionEyebrow">Settings</span><h2 className="pb-flowCard__title">Rezervirano za sljedeći korak</h2></div></div>
                  <p className="pb-flowCard__text">Ovdje ćemo dodati dodatne postavke poput privatnosti, wishlist pravila, guest access ponašanja i reminder opcija.</p>
                </Card>
              </div>
            </div>

            <aside className="pb-createStudio__dock" aria-label="Create alati">
              <button type="button" className="pb-createStudio__dockButton" onClick={() => jumpTo(themeRef)} aria-label="Theme"><span aria-hidden="true">🎨</span></button>
              <button type="button" className="pb-createStudio__dockButton" onClick={() => jumpTo(effectRef)} aria-label="Effect"><span aria-hidden="true">✨</span></button>
              <button type="button" className="pb-createStudio__dockButton" onClick={() => jumpTo(rsvpRef)} aria-label="RSVP"><span aria-hidden="true">🥳</span></button>
              <button type="button" className="pb-createStudio__dockButton" onClick={() => jumpTo(settingsRef)} aria-label="Settings"><span aria-hidden="true">⚙️</span></button>
              <button type="button" className="pb-createStudio__dockButton pb-createStudio__dockButton--preview" onClick={() => setIsPreviewOpen(true)} aria-label="Preview"><span aria-hidden="true">👁️</span></button>
            </aside>
          </div>
        </section>
      </main>
      <Footer />

      {isPreviewOpen ? (
        <div className="pb-createStudio__previewOverlay" role="dialog" aria-modal="true" aria-label="Preview pozivnice">
          <div className="pb-createStudio__previewDialog">
            <button type="button" className="pb-createStudio__previewClose" onClick={() => setIsPreviewOpen(false)}>Zatvori</button>
            <div className={`pb-createPreviewPhone pb-createPreviewPhone--${coverTheme}`}>
              <div className={`pb-createPreviewPhone__poster pb-createPreviewPhone__poster--${effectStyle}`}>
                <img className="pb-createPreviewPhone__logo" src="/logo.png" alt="Playbam.hr" />
                <span className="pb-createPreviewPhone__themeEyebrow">{themeMeta.eyebrow}</span>
                <span className="pb-createPreviewPhone__themeBadge">{themeMeta.label}</span>
                <h2 className={`pb-createPreviewPhone__title pb-createPreviewPhone__title--${titleFont}`}>{previewTitle}</h2>
                <p className="pb-createPreviewPhone__subtitle">{celebrantName.trim() ? `${celebrantName.trim()} je glavni gost dana` : 'Dodaj ime slavljenika da preview dobije pravi ton.'}</p>
              </div>
              <div className="pb-createPreviewPhone__body">
                <div className="pb-createPreviewPhone__detail"><span className="pb-createPreviewPhone__detailLabel">Datum</span><strong className="pb-createPreviewPhone__detailValue">{formatPreviewDate(date)}</strong></div>
                <div className="pb-createPreviewPhone__detail"><span className="pb-createPreviewPhone__detailLabel">Vrijeme</span><strong className="pb-createPreviewPhone__detailValue">{formatPreviewTime(time)}</strong></div>
                <div className="pb-createPreviewPhone__detail"><span className="pb-createPreviewPhone__detailLabel">Lokacija</span><strong className="pb-createPreviewPhone__detailValue">{previewLocation}</strong></div>
                <div className="pb-createPreviewPhone__message">{previewMessage}</div>
                <div className="pb-createPreviewPhone__rsvpRow" aria-hidden="true">
                  {RSVP_CHOICES.map((choice) => (
                    <span key={choice.id} className={`pb-createPreviewPhone__rsvpPill pb-createPreviewPhone__rsvpPill--${choice.id.replace('_', '-')}`}>
                      <span className="pb-createPreviewPhone__rsvpIcon">{getRsvpSymbol(rsvpStyle, choice.id)}</span>
                      <span>{choice.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
