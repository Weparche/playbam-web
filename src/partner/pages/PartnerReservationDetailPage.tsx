import { Link, useParams } from 'react-router-dom'

import Button from '../../components/ui/Button'
import { usePartnerData } from '../context/PartnerDataContext'
import { suggestAvailableAnimators } from '../lib/availability'
import { formatDateHr, formatTimeRange } from '../lib/dates'
import { formatPrice } from '../lib/pricing'
import { STATUS_ORDER, statusLabel } from '../lib/status'
import type { ReservationChecklist } from '../types'
import StatusBadge from '../components/ui/StatusBadge'

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
    updateReservation,
  } = usePartnerData()

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

  const toggleAnimator = (animatorId: string) => {
    const next = reservation.assignedAnimatorIds.includes(animatorId)
      ? reservation.assignedAnimatorIds.filter((x) => x !== animatorId)
      : [...reservation.assignedAnimatorIds, animatorId]
    assignAnimators(reservation.id, next)
  }

  const setChecklistField = (key: keyof ReservationChecklist, value: boolean) => {
    updateChecklist(reservation.id, { ...reservation.checklist, [key]: value })
  }

  return (
    <>
      <header className="partner-topbar">
        <div>
          <h1 className="partner-topbar__title">{reservation.childName}</h1>
          <p className="partner-topbar__meta">
            {formatDateHr(reservation.date)} · {formatTimeRange(reservation.startTime, reservation.endTime)}
          </p>
        </div>
        <StatusBadge status={reservation.status} />
      </header>

      <section className="partner-panel">
        <h2 className="partner-panel__title">Status pipeline</h2>
        <div className="partner-pipeline">
          {STATUS_ORDER.filter((s) => s !== 'cancelled').map((step) => (
            <span
              key={step}
              className={`partner-pipeline__step${
                reservation.status === step ? ' is-active' : STATUS_ORDER.indexOf(reservation.status) > STATUS_ORDER.indexOf(step) ? ' is-done' : ''
              }`}
            >
              {statusLabel(step)}
            </span>
          ))}
        </div>
        <div className="partner-resCard__actions" style={{ marginTop: '0.75rem' }}>
          <Button type="button" onClick={() => confirmReservation(reservation.id)}>Potvrdi</Button>
          <Button type="button" onClick={() => markDepositPaid(reservation.id)}>Akontacija plaćena</Button>
          <Button type="button" onClick={() => completeReservation(reservation.id)}>Završeno</Button>
          <Button variant="ghost" type="button" onClick={() => cancelReservation(reservation.id)}>Otkaži</Button>
        </div>
      </section>

      <div className="partner-twoCol">
        <section className="partner-panel">
          <h2 className="partner-panel__title">Event</h2>
          <p>Tema: {reservation.theme || '—'}</p>
          <p>Dijete: {reservation.childName} ({reservation.childAge})</p>
          <p>Broj djece: {reservation.childrenCount}</p>
          <p>Paket: {pkg?.name ?? '—'}</p>
          <p>Ukupno: {formatPrice(reservation.totalPrice, playroom.currency)}</p>
          <p>Akontacija: {formatPrice(reservation.depositAmount, playroom.currency)} {reservation.depositPaid ? '(plaćeno)' : '(nije plaćeno)'}</p>
        </section>

        <section className="partner-panel">
          <h2 className="partner-panel__title">Roditelj</h2>
          <p>{customer?.fullName ?? '—'}</p>
          <p>{customer?.phone}</p>
          <p>{customer?.email}</p>
          <p>Napomene: {customer?.notes || '—'}</p>
        </section>
      </div>

      <section className="partner-panel">
        <h2 className="partner-panel__title">Dodaci</h2>
        {selectedAddons.length === 0 ? (
          <p className="partner-topbar__meta">Nema dodataka.</p>
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
        <h2 className="partner-panel__title">Animatori</h2>
        <p className="partner-topbar__meta">Predloženi dostupni: {suggested.map((a) => a.name).join(', ') || '—'}</p>
        <div className="partner-checklist">
          {animators.filter((a) => a.isActive).map((animator) => (
            <label key={animator.id}>
              <input
                type="checkbox"
                checked={reservation.assignedAnimatorIds.includes(animator.id)}
                onChange={() => toggleAnimator(animator.id)}
              />
              {animator.name}
            </label>
          ))}
        </div>
      </section>

      <section className="partner-panel">
        <h2 className="partner-panel__title">Checklist</h2>
        <div className="partner-checklist">
          {(
            [
              ['spaceReady', 'Prostor pripremljen'],
              ['decorationReady', 'Dekoracija spremna'],
              ['foodConfirmed', 'Hrana potvrđena'],
              ['childrenCountConfirmed', 'Broj djece potvrđen'],
              ['allergiesChecked', 'Alergije provjerene'],
              ['animatorConfirmed', 'Animator potvrđen'],
              ['paymentChecked', 'Uplata provjerena'],
            ] as Array<[keyof ReservationChecklist, string]>
          ).map(([key, label]) => (
            <label key={key}>
              <input type="checkbox" checked={reservation.checklist[key]} onChange={(e) => setChecklistField(key, e.target.checked)} />
              {label}
            </label>
          ))}
        </div>
      </section>

      <div className="partner-twoCol">
        <section className="partner-panel">
          <h2 className="partner-panel__title">Napomene roditelja</h2>
          <textarea
            className="pb-input"
            rows={4}
            value={reservation.notes}
            onChange={(e) => updateReservation(reservation.id, { notes: e.target.value })}
          />
        </section>
        <section className="partner-panel">
          <h2 className="partner-panel__title">Interne napomene</h2>
          <textarea
            className="pb-input"
            rows={4}
            value={reservation.internalNotes}
            onChange={(e) => updateReservation(reservation.id, { internalNotes: e.target.value })}
          />
        </section>
      </div>
    </>
  )
}
