import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import Button from '../../components/ui/Button'
import { usePartnerData } from '../context/PartnerDataContext'
import { generateAvailableSlots } from '../lib/availability'
import { formatDateHr, formatTimeRange, todayKey } from '../lib/dates'
import { formatPrice } from '../lib/pricing'
import type { ReservationStatus } from '../types'
import StatusBadge from '../components/ui/StatusBadge'

const STATUS_OPTIONS: Array<{ value: ReservationStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Svi statusi' },
  { value: 'pending_confirmation', label: 'Čeka potvrdu' },
  { value: 'confirmed', label: 'Potvrđeno' },
  { value: 'waiting_deposit', label: 'Čeka akontaciju' },
  { value: 'animator_assigned', label: 'Animator dodijeljen' },
  { value: 'completed', label: 'Završeno' },
  { value: 'cancelled', label: 'Otkazano' },
]

export default function PartnerReservationsPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const {
    listReservations,
    packages,
    customers,
    playroom,
    createReservation,
    calculatePrice,
    reservations,
  } = usePartnerData()

  const [status, setStatus] = useState<ReservationStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const showNew = params.get('new') === '1'

  const [form, setForm] = useState({
    customerId: customers[0]?.id ?? '',
    packageId: packages[0]?.id ?? '',
    date: todayKey(),
    startTime: '14:00',
    endTime: '16:00',
    childName: '',
    childAge: 7,
    childrenCount: 10,
    theme: '',
    notes: '',
    addonIds: [] as string[],
  })

  const filtered = useMemo(
    () => listReservations({ status, search, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }),
    [listReservations, status, search, dateFrom, dateTo, reservations],
  )

  const slots = useMemo(
    () => generateAvailableSlots(playroom, form.date, reservations, packages.find((p) => p.id === form.packageId)?.durationMinutes),
    [playroom, form.date, reservations, packages, form.packageId],
  )

  const totalPrice = calculatePrice(form.packageId, form.childrenCount, form.addonIds)

  const handleCreate = () => {
    if (!form.customerId || !form.packageId || !form.childName.trim()) return
    const created = createReservation({
      customerId: form.customerId,
      packageId: form.packageId,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      status: 'pending_confirmation',
      childName: form.childName.trim(),
      childAge: form.childAge,
      childrenCount: form.childrenCount,
      theme: form.theme,
      notes: form.notes,
      internalNotes: '',
      totalPrice,
      depositAmount: playroom.defaultDepositAmount,
      depositPaid: false,
      assignedAnimatorIds: [],
      addonIds: form.addonIds,
    })
    setParams({})
    navigate(`/partner/reservations/${created.id}`)
  }

  return (
    <>
      <header className="partner-topbar">
        <div>
          <h1 className="partner-topbar__title">Rezervacije</h1>
          <p className="partner-topbar__meta">{filtered.length} rezultata</p>
        </div>
        <Button type="button" onClick={() => setParams({ new: '1' })}>
          Nova rezervacija
        </Button>
      </header>

      {showNew ? (
        <section className="partner-panel">
          <h2 className="partner-panel__title">Nova rezervacija</h2>
          <div className="partner-formGrid partner-formGrid--2">
            <label className="pb-formField">
              <span className="pb-formLabel">Kupac</span>
              <select className="pb-input" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.fullName}</option>
                ))}
              </select>
            </label>
            <label className="pb-formField">
              <span className="pb-formLabel">Paket</span>
              <select className="pb-input" value={form.packageId} onChange={(e) => setForm({ ...form, packageId: e.target.value })}>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label className="pb-formField">
              <span className="pb-formLabel">Datum</span>
              <input className="pb-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </label>
            <label className="pb-formField">
              <span className="pb-formLabel">Termin</span>
              <select
                className="pb-input"
                value={form.startTime}
                onChange={(e) => {
                  const slot = slots.find((s) => s.startTime === e.target.value)
                  if (slot) setForm({ ...form, startTime: slot.startTime, endTime: slot.endTime })
                }}
              >
                {slots.map((slot) => (
                  <option key={`${slot.startTime}-${slot.endTime}`} value={slot.startTime}>
                    {formatTimeRange(slot.startTime, slot.endTime)}
                  </option>
                ))}
              </select>
            </label>
            <label className="pb-formField">
              <span className="pb-formLabel">Ime djeteta</span>
              <input className="pb-input" value={form.childName} onChange={(e) => setForm({ ...form, childName: e.target.value })} />
            </label>
            <label className="pb-formField">
              <span className="pb-formLabel">Broj djece</span>
              <input className="pb-input" type="number" min={1} value={form.childrenCount} onChange={(e) => setForm({ ...form, childrenCount: Number(e.target.value) })} />
            </label>
          </div>
          <p className="partner-topbar__meta" style={{ marginTop: '0.75rem' }}>
            Ukupno: {formatPrice(totalPrice, playroom.currency)} · Akontacija: {formatPrice(playroom.defaultDepositAmount, playroom.currency)}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <Button type="button" onClick={handleCreate}>Spremi rezervaciju</Button>
            <Button variant="ghost" type="button" onClick={() => setParams({})}>Odustani</Button>
          </div>
        </section>
      ) : null}

      <div className="partner-filters">
        <select className="pb-input" value={status} onChange={(e) => setStatus(e.target.value as ReservationStatus | 'all')}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input className="pb-input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input className="pb-input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        <input className="pb-input" placeholder="Pretraži roditelja/dijete" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <section className="partner-panel partner-tableWrap">
        <table className="partner-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Vrijeme</th>
              <th>Dijete</th>
              <th>Roditelj</th>
              <th>Paket</th>
              <th>Status</th>
              <th>Cijena</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((res) => {
              const customer = customers.find((c) => c.id === res.customerId)
              const pkg = packages.find((p) => p.id === res.packageId)
              return (
                <tr key={res.id}>
                  <td>{formatDateHr(res.date)}</td>
                  <td>{formatTimeRange(res.startTime, res.endTime)}</td>
                  <td>{res.childName}</td>
                  <td>{customer?.fullName ?? '—'}</td>
                  <td>{pkg?.name ?? '—'}</td>
                  <td><StatusBadge status={res.status} /></td>
                  <td>{formatPrice(res.totalPrice, playroom.currency)}</td>
                  <td><Link to={`/partner/reservations/${res.id}`}>Detalj</Link></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <div className="partner-cardList partner-cardList--mobileOnly">
        {filtered.map((res) => {
          const customer = customers.find((c) => c.id === res.customerId)
          return (
            <div key={res.id} className="partner-resCard">
              <div className="partner-eventRow__title">{res.childName}</div>
              <div className="partner-eventRow__meta">{formatDateHr(res.date)} · {formatTimeRange(res.startTime, res.endTime)}</div>
              <div className="partner-eventRow__meta">{customer?.fullName}</div>
              <StatusBadge status={res.status} />
              <div className="partner-resCard__actions">
                <Link to={`/partner/reservations/${res.id}`} className="pb-btn pb-btn-ghost">Detalj</Link>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
