import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import Button from '../../components/ui/Button'
import { usePartnerData } from '../context/PartnerDataContext'
import { suggestAvailableAnimators } from '../lib/availability'
import { formatDateHr, formatTimeRange } from '../lib/dates'
import { formatPrice } from '../lib/pricing'
import { STATUS_ORDER, statusLabel } from '../lib/status'
import type { ReservationChecklist } from '../types'
import StatusBadge from '../components/ui/StatusBadge'
import PartnerIcon from '../components/ui/PartnerIcon'

const CHECKLIST_FIELDS: Array<[keyof ReservationChecklist, string]> = [
  ['spaceReady', 'Prostor pripremljen'],
  ['decorationReady', 'Dekoracija spremna'],
  ['foodConfirmed', 'Hrana potvrđena'],
  ['childrenCountConfirmed', 'Broj djece potvrđen'],
  ['allergiesChecked', 'Alergije provjerene'],
  ['animatorConfirmed', 'Animator potvrđen'],
  ['paymentChecked', 'Uplata provjerena'],
]

const PIPELINE_STEPS = STATUS_ORDER.filter((s) => s !== 'cancelled' && s !== 'new_request')

function telHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}

function smsHref(phone: string) {
  return `sms:${phone.replace(/[^+\d]/g, '')}`
}

export default function PartnerReservationDetailPage() {
  const { id = '' } = useParams()
  const {
    getReservation,
    getCustomer,
    packages,
    addons,
    animators,
    playroom,
    reservations,
    confirmReservation,
    markDepositPaid,
    assignAnimators,
    updateChecklist,
    completeReservation,
    cancelReservation,
    updateReservationStatus,
    updateReservation,
  } = usePartnerData()

  const [busy, setBusy] = useState(false)
  const runAction = (fn: () => void) => {
    setBusy(true)
    window.setTimeout(() => {
      fn()
      setBusy(false)
    }, 300)
  }

  const reservation = getReservation(id)
  if (!reservation) {
    return (
      <div className="partner-panel">
        Rezervacija nije pronađena. <Link to="/partner/reservations">Natrag</Link>
      </div>
    )
  }

  const customer = getCustomer(reservation.customerId)
  const pkg = packages.find((p) => p.id === reservation.packageId)
  const selectedAddons = addons.filter((a) => reservation.addonIds.includes(a.id))
  const suggested = suggestAvailableAnimators(
    reservation.date,
    reservation.startTime,
    reservation.endTime,
    animators,
    reservations,
    reservation.id,
  )
  const suggestedIds = new Set(suggested.map((a) => a.id))
  const activeAnimators = animators.filter((a) => a.isActive)
  const hasAnimator = reservation.assignedAnimatorIds.length > 0
  const isClosed = reservation.status === 'completed' || reservation.status === 'cancelled'

  const toggleAnimator = (animatorId: string) => {
    const next = reservation.assignedAnimatorIds.includes(animatorId)
      ? reservation.assignedAnimatorIds.filter((x) => x !== animatorId)
      : [...reservation.assignedAnimatorIds, animatorId]
    assignAnimators(reservation.id, next)
  }

  const setChecklistField = (key: keyof ReservationChecklist, value: boolean) => {
    updateChecklist(reservation.id, { ...reservation.checklist, [key]: value })
  }

  // Single contextual next action
  type NextAction = { label: string; run: () => void }
  let nextAction: NextAction | null = null
  if (!isClosed) {
    if (reservation.status === 'new_request' || reservation.status === 'pending_confirmation') {
      nextAction = { label: 'Potvrdi rezervaciju', run: () => confirmReservation(reservation.id) }
    } else if (!reservation.depositPaid) {
      nextAction = { label: 'Akontacija plaćena', run: () => markDepositPaid(reservation.id) }
    } else if (!hasAnimator) {
      nextAction = {
        label: 'Dodijeli animatora',
        run: () =>
          document.getElementById('partner-animators')?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      }
    } else {
      nextAction = { label: 'Označi završeno', run: () => completeReservation(reservation.id) }
    }
  }

  const actionButtons = () => (
    <>
      {nextAction ? (
        <Button type="button" onClick={() => runAction(nextAction!.run)} loading={busy}>
          {busy ? 'Spremam…' : nextAction.label}
        </Button>
      ) : null}
      {reservation.status === 'cancelled' ? (
        <Button
          variant="ghost"
          type="button"
          disabled={busy}
          onClick={() => runAction(() => updateReservationStatus(reservation.id, 'pending_confirmation'))}
        >
          Vrati u obradu
        </Button>
      ) : null}
      {!isClosed ? (
        <Button
          variant="ghost"
          type="button"
          className="partner-btnDanger"
          disabled={busy}
          onClick={() => runAction(() => cancelReservation(reservation.id))}
        >
          Otkaži
        </Button>
      ) : null}
    </>
  )

  return (
    <>
      <header className="partner-topbar">
        <div>
          <Link to="/partner/reservations" className="partner-backLink">
            ← Sve rezervacije
          </Link>
          <h1 className="partner-topbar__title">{reservation.childName}</h1>
          <p className="partner-topbar__meta">
            {formatDateHr(reservation.date)} · {formatTimeRange(reservation.startTime, reservation.endTime)}
          </p>
        </div>
        <StatusBadge status={reservation.status} />
      </header>

      <div className="partner-detailGrid">
        <div className="partner-detailMain">
          <section className="partner-panel">
            <h2 className="partner-panel__title">Tijek</h2>
            <div className="partner-pipeline">
              {PIPELINE_STEPS.map((step) => {
                const currentIdx = STATUS_ORDER.indexOf(reservation.status)
                const stepIdx = STATUS_ORDER.indexOf(step)
                const cls =
                  reservation.status === step ? ' is-active' : currentIdx > stepIdx ? ' is-done' : ''
                return (
                  <span key={step} className={`partner-pipeline__step${cls}`}>
                    {statusLabel(step)}
                  </span>
                )
              })}
            </div>
            <div className="partner-detailActions partner-detailActions--inline">{actionButtons()}</div>
          </section>

          <section className="partner-panel" id="partner-animators">
            <h2 className="partner-panel__title">Animatori</h2>
            {activeAnimators.length === 0 ? (
              <p className="partner-empty">Nema aktivnih animatora. Dodaj ih u postavkama.</p>
            ) : (
              <>
                <p className="partner-fieldHelp">
                  {hasAnimator ? 'Dodijeljeni animatori označeni su.' : 'Predloženi su dostupni za ovaj termin.'}
                </p>
                <div className="partner-checkGrid">
                  {activeAnimators.map((animator) => {
                    const checked = reservation.assignedAnimatorIds.includes(animator.id)
                    return (
                      <label key={animator.id} className={`partner-checkPill${checked ? ' is-checked' : ''}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleAnimator(animator.id)} />
                        <span>{animator.name}</span>
                        {suggestedIds.has(animator.id) && !checked ? (
                          <span className="partner-checkPill__tag">predloženo</span>
                        ) : null}
                      </label>
                    )
                  })}
                </div>
              </>
            )}
          </section>

          <section className="partner-panel">
            <h2 className="partner-panel__title">Checklist priprema</h2>
            <div className="partner-checklist">
              {CHECKLIST_FIELDS.map(([key, label]) => (
                <label key={key}>
                  <input
                    type="checkbox"
                    checked={reservation.checklist[key]}
                    onChange={(e) => setChecklistField(key, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="partner-detailSide">
          <section className="partner-panel">
            <h2 className="partner-panel__title">Event</h2>
            <dl className="partner-defList">
              <div><dt>Tema</dt><dd>{reservation.theme || '—'}</dd></div>
              <div><dt>Dijete</dt><dd>{reservation.childName} ({reservation.childAge} god.)</dd></div>
              <div><dt>Broj djece</dt><dd>{reservation.childrenCount}</dd></div>
              <div><dt>Paket</dt><dd>{pkg?.name ?? '—'}</dd></div>
              <div><dt>Ukupno</dt><dd className="partner-defList__strong">{formatPrice(reservation.totalPrice, playroom.currency)}</dd></div>
              <div>
                <dt>Akontacija</dt>
                <dd>
                  {formatPrice(reservation.depositAmount, playroom.currency)}{' '}
                  <span className="partner-chip" data-variant={reservation.depositPaid ? 'ok' : 'warn'}>
                    {reservation.depositPaid ? 'plaćeno' : 'nije plaćeno'}
                  </span>
                </dd>
              </div>
            </dl>
          </section>

          <section className="partner-panel">
            <h2 className="partner-panel__title">Roditelj</h2>
            <p className="partner-contactName">{customer?.fullName ?? '—'}</p>
            {customer?.notes ? <p className="partner-resCard__note">{customer.notes}</p> : null}
            <div className="partner-contactActions">
              {customer?.phone ? (
                <>
                  <a href={telHref(customer.phone)} className="partner-contactBtn">
                    <PartnerIcon name="phone" size={18} />
                    <span>Nazovi</span>
                  </a>
                  <a href={smsHref(customer.phone)} className="partner-contactBtn">
                    <PartnerIcon name="message" size={18} />
                    <span>SMS</span>
                  </a>
                </>
              ) : null}
              {customer?.email ? (
                <a href={`mailto:${customer.email}`} className="partner-contactBtn">
                  <PartnerIcon name="mail" size={18} />
                  <span>Email</span>
                </a>
              ) : null}
            </div>
            {customer?.phone ? <p className="partner-contactMeta">{customer.phone}</p> : null}
            {customer?.email ? <p className="partner-contactMeta">{customer.email}</p> : null}
          </section>

          <section className="partner-panel">
            <h2 className="partner-panel__title">Dodaci</h2>
            {selectedAddons.length === 0 ? (
              <p className="partner-empty">Nema dodataka.</p>
            ) : (
              selectedAddons.map((addon) => (
                <div key={addon.id} className="partner-eventRow">
                  <span>{addon.name}</span>
                  <span>{formatPrice(addon.price, playroom.currency)}</span>
                </div>
              ))
            )}
          </section>

          <section className="partner-panel">
            <h2 className="partner-panel__title">Napomene</h2>
            <label className="partner-field">
              <span className="partner-field__label">Napomena roditelja</span>
              <textarea
                className="pb-input"
                rows={3}
                value={reservation.notes}
                onChange={(e) => updateReservation(reservation.id, { notes: e.target.value })}
              />
            </label>
            <label className="partner-field partner-field--spaced">
              <span className="partner-field__label">Interna napomena</span>
              <textarea
                className="pb-input"
                rows={3}
                value={reservation.internalNotes}
                onChange={(e) => updateReservation(reservation.id, { internalNotes: e.target.value })}
              />
            </label>
          </section>
        </aside>
      </div>

      {!isClosed || reservation.status === 'cancelled' ? (
        <div className="partner-actionBar">{actionButtons()}</div>
      ) : null}
    </>
  )
}
