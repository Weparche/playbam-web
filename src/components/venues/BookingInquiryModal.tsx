import { useEffect, useId, useMemo, useState, type FormEvent } from 'react'

import type { Venue } from '../../lib/landing-data'
import { lockScroll, unlockScroll } from '../../lib/scrollLock'
import {
  buildBookingInquiryMessage,
  buildWhatsappUrl,
  normalizeWhatsappPhone,
  type BookingInquiryMessageInput,
} from './bookingInquiryUtils'

type BookingInquiryForm = Omit<BookingInquiryMessageInput, 'venueUrl'>

type BookingInquiryErrors = Partial<Record<keyof BookingInquiryForm, string>>

type Props = {
  venue: Venue
  isOpen: boolean
  onClose: () => void
  preselectedPackageName?: string
  venueUrl: string
}

const EMPTY_FORM: BookingInquiryForm = {
  parentName: '',
  parentPhone: '',
  childName: '',
  desiredDate: '',
  desiredTime: '',
  childrenCount: '',
  packageName: '',
  childAge: '',
  email: '',
  theme: '',
  notes: '',
  allergies: '',
}

const TIME_OPTIONS = ['', 'Jutro', 'Prijepodne', 'Popodne', 'Večer', 'Dogovor', 'Ručno upisujem okvirno vrijeme']

const REQUIRED_FIELDS = [
  'parentName',
  'parentPhone',
  'childName',
  'desiredDate',
  'desiredTime',
  'childrenCount',
] as const

const REQUIRED_LABELS: Record<(typeof REQUIRED_FIELDS)[number], string> = {
  parentName: 'Upišite ime roditelja.',
  parentPhone: 'Upišite telefon roditelja.',
  childName: 'Upišite ime slavljenika.',
  desiredDate: 'Odaberite željeni datum.',
  desiredTime: 'Odaberite okvirno vrijeme ili dio dana.',
  childrenCount: 'Upišite broj djece.',
}

function requiredBadge() {
  return <span className="ew-bookingInquiry__required">Obavezno</span>
}

export default function BookingInquiryModal({
  venue,
  isOpen,
  onClose,
  preselectedPackageName,
  venueUrl,
}: Props) {
  const titleId = useId()
  const [form, setForm] = useState<BookingInquiryForm>(() => ({
    ...EMPTY_FORM,
    packageName: preselectedPackageName ?? '',
  }))
  const [errors, setErrors] = useState<BookingInquiryErrors>({})
  const whatsappPhone = useMemo(() => normalizeWhatsappPhone(venue.phone), [venue.phone])
  const hasPackages = venue.packages.length > 0

  useEffect(() => {
    if (!isOpen) return
    lockScroll()
    return () => unlockScroll()
  }, [isOpen])

  if (!isOpen) return null

  const updateField = (field: keyof BookingInquiryForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  const validate = () => {
    const nextErrors: BookingInquiryErrors = {}
    for (const field of REQUIRED_FIELDS) {
      if (!form[field]?.trim()) {
        nextErrors[field] = REQUIRED_LABELS[field]
      }
    }
    if (form.childrenCount.trim() && Number(form.childrenCount) < 1) {
      nextErrors.childrenCount = 'Broj djece mora biti barem 1.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!whatsappPhone || !validate()) return

    const message = buildBookingInquiryMessage({ ...form, venueUrl })
    const whatsappUrl = buildWhatsappUrl(venue.phone, message)
    if (!whatsappUrl) return
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="ew-bookingInquiry" role="presentation" onClick={onClose}>
      <div
        className="ew-bookingInquiry__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ew-bookingInquiry__head">
          <div>
            <p className="ew-bookingInquiry__eyebrow">Upit za rođendan</p>
            <h2 id={titleId} className="ew-bookingInquiry__title">
              Pošaljite upit za {venue.name}
            </h2>
          </div>
          <button type="button" className="ew-bookingInquiry__close" onClick={onClose} aria-label="Zatvori">
            ×
          </button>
        </div>

        <p className="ew-bookingInquiry__lead">
          Pošaljite strukturirani upit igraonici. Osnovni podaci su obavezni, a dodatni detalji pomažu
          igraonici da vam brže pošalje točnu ponudu. Slanje upita ne znači da je termin automatski potvrđen.
        </p>

        {!whatsappPhone ? (
          <div className="ew-bookingInquiry__fallback" role="status">
            <strong>Ova igraonica trenutno nema dostupan WhatsApp kontakt.</strong>
            <span>Kontaktirajte ih putem telefona ili emaila.</span>
            {venue.phone ? <a href={`tel:${venue.phone.replace(/\s/g, '')}`}>{venue.phone}</a> : null}
            {venue.website ? (
              <a href={venue.website} target="_blank" rel="noopener noreferrer">
                Web stranica
              </a>
            ) : null}
          </div>
        ) : (
          <form className="ew-bookingInquiry__form" onSubmit={submit} noValidate>
            <div className="ew-bookingInquiry__grid">
              <label className="ew-bookingInquiry__field">
                <span>Ime roditelja {requiredBadge()}</span>
                <input
                  value={form.parentName}
                  onChange={(event) => updateField('parentName', event.target.value)}
                  aria-invalid={Boolean(errors.parentName)}
                />
                {errors.parentName ? <small>{errors.parentName}</small> : null}
              </label>

              <label className="ew-bookingInquiry__field">
                <span>Telefon roditelja {requiredBadge()}</span>
                <input
                  value={form.parentPhone}
                  onChange={(event) => updateField('parentPhone', event.target.value)}
                  inputMode="tel"
                  aria-invalid={Boolean(errors.parentPhone)}
                />
                {errors.parentPhone ? <small>{errors.parentPhone}</small> : null}
              </label>

              <label className="ew-bookingInquiry__field">
                <span>Ime slavljenika {requiredBadge()}</span>
                <input
                  value={form.childName}
                  onChange={(event) => updateField('childName', event.target.value)}
                  aria-invalid={Boolean(errors.childName)}
                />
                {errors.childName ? <small>{errors.childName}</small> : null}
              </label>

              <label className="ew-bookingInquiry__field">
                <span>Željeni datum {requiredBadge()}</span>
                <input
                  type="date"
                  value={form.desiredDate}
                  onChange={(event) => updateField('desiredDate', event.target.value)}
                  aria-invalid={Boolean(errors.desiredDate)}
                />
                {errors.desiredDate ? <small>{errors.desiredDate}</small> : null}
              </label>

              <label className="ew-bookingInquiry__field">
                <span>Okvirno vrijeme {requiredBadge()}</span>
                <select
                  value={form.desiredTime}
                  onChange={(event) => updateField('desiredTime', event.target.value)}
                  aria-invalid={Boolean(errors.desiredTime)}
                >
                  {TIME_OPTIONS.map((option) => (
                    <option key={option || 'empty'} value={option}>
                      {option || 'Odaberite dio dana'}
                    </option>
                  ))}
                </select>
                {errors.desiredTime ? <small>{errors.desiredTime}</small> : null}
              </label>

              <label className="ew-bookingInquiry__field">
                <span>Broj djece {requiredBadge()}</span>
                <input
                  type="number"
                  min="1"
                  value={form.childrenCount}
                  onChange={(event) => updateField('childrenCount', event.target.value)}
                  inputMode="numeric"
                  aria-invalid={Boolean(errors.childrenCount)}
                />
                {errors.childrenCount ? <small>{errors.childrenCount}</small> : null}
              </label>

              <label className="ew-bookingInquiry__field">
                <span>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                />
              </label>

              <label className="ew-bookingInquiry__field">
                <span>Dob slavljenika</span>
                <input
                  value={form.childAge}
                  onChange={(event) => updateField('childAge', event.target.value)}
                  inputMode="numeric"
                />
              </label>

              {hasPackages ? (
                <label className="ew-bookingInquiry__field ew-bookingInquiry__field--wide">
                  <span>Paket/interes</span>
                  <select value={form.packageName} onChange={(event) => updateField('packageName', event.target.value)}>
                    <option value="">Nisam siguran, pošaljite prijedlog</option>
                    {venue.packages.map((pkg) => (
                      <option key={pkg.name} value={pkg.name}>
                        {pkg.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label className="ew-bookingInquiry__field ew-bookingInquiry__field--wide">
                <span>Tema rođendana</span>
                <input value={form.theme} onChange={(event) => updateField('theme', event.target.value)} />
              </label>

              <label className="ew-bookingInquiry__field ew-bookingInquiry__field--wide">
                <span>Napomene</span>
                <textarea value={form.notes} onChange={(event) => updateField('notes', event.target.value)} rows={3} />
              </label>

              <label className="ew-bookingInquiry__field ew-bookingInquiry__field--wide">
                <span>Alergije ili posebne želje</span>
                <textarea
                  value={form.allergies}
                  onChange={(event) => updateField('allergies', event.target.value)}
                  rows={3}
                />
              </label>
            </div>

            <div className="ew-bookingInquiry__actions">
              <button type="button" className="ew-btn-secondary" onClick={onClose}>
                Odustani
              </button>
              <button type="submit" className="ew-btn-primary">
                Otvori WhatsApp upit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
