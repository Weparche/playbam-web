import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import Button from '../../components/ui/Button'
import { usePartnerData } from '../context/PartnerDataContext'
import { generateAvailableSlots } from '../lib/availability'
import { formatDateHr, formatTimeRange, todayKey } from '../lib/dates'
import { formatPrice } from '../lib/pricing'
import type { BirthdayReservation, ReservationStatus } from '../types'
import StatusBadge from '../components/ui/StatusBadge'
import PartnerSheet from '../components/ui/PartnerSheet'
import PartnerIcon from '../components/ui/PartnerIcon'

const STATUS_OPTIONS: Array<{ value: ReservationStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Sve' },
  { value: 'pending_confirmation', label: 'Čeka potvrdu' },
  { value: 'confirmed', label: 'Potvrđeno' },
  { value: 'waiting_deposit', label: 'Čeka akontaciju' },
  { value: 'animator_assigned', label: 'Animator' },
  { value: 'completed', label: 'Završeno' },
  { value: 'cancelled', label: 'Otkazano' },
]

const NEED_LABELS: Record<string, string> = {
  confirm: 'Čeka potvrdu',
  deposit: 'Bez akontacije',
  animator: 'Bez animatora',
}

function matchesNeed(res: BirthdayReservation, need: string, today: string): boolean {
  if (need === 'confirm') return res.status === 'pending_confirmation'
  if (need === 'deposit')
    return !res.depositPaid && ['waiting_deposit', 'pending_confirmation', 'confirmed'].includes(res.status)
  if (need === 'animator')
    return (
      res.date >= today &&
      res.assignedAnimatorIds.length === 0 &&
      !['completed', 'cancelled', 'new_request'].includes(res.status)
    )
  return true
}

const emptyForm = (
  customerId: string,
  packageId: string,
  date = todayKey(),
  startTime = '14:00',
  endTime = '16:00',
) => ({
  customerMode: 'existing' as 'existing' | 'new',
  customerId,
  newName: '',
  newPhone: '',
  packageId,
  date,
  startTime,
  endTime,
  childName: '',
  childAge: 7,
  childrenCount: 10,
  theme: '',
  notes: '',
  addonIds: [] as string[],
})

export default function PartnerReservationsPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const {
    listReservations,
    packages,
    addons,
    customers,
    playroom,
    createReservation,
    createCustomer,
    calculatePrice,
    reservations,
  } = usePartnerData()

  const today = todayKey()
  const status = (params.get('status') as ReservationStatus | 'all') ?? 'all'
  const need = params.get('need')
  const showNew = params.get('new') === '1'

  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [form, setForm] = useState(() =>
    emptyForm(
      customers[0]?.id ?? '',
      packages[0]?.id ?? '',
      params.get('date') || undefined,
      params.get('start') || undefined,
      params.get('end') || undefined,
    ),
  )
  const [error, setError] = useState('')

  const activeAddons = useMemo(() => addons.filter((a) => a.isActive), [addons])

  const filtered = useMemo(() => {
    const base = listReservations({
      status: status === 'all' ? undefined : status,
      search,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    })
    return need ? base.filter((r) => matchesNeed(r, need, today)) : base
  }, [listReservations, status, search, dateFrom, dateTo, need, today, reservations])

  const slots = useMemo(
    () =>
      generateAvailableSlots(
        playroom,
        form.date,
        reservations,
        packages.find((p) => p.id === form.packageId)?.durationMinutes,
      ),
    [playroom, form.date, reservations, packages, form.packageId],
  )

  const totalPrice = calculatePrice(form.packageId, form.childrenCount, form.addonIds)

  const setStatus = (next: ReservationStatus | 'all') => {
    setParams((prev) => {
      const p = new URLSearchParams(prev)
      if (next === 'all') p.delete('status')
      else p.set('status', next)
      p.delete('need')
      return p
    })
  }

  const clearNeed = () => {
    setParams((prev) => {
      const p = new URLSearchParams(prev)
      p.delete('need')
      return p
    })
  }

  const openSheet = () => {
    setForm(emptyForm(customers[0]?.id ?? '', packages[0]?.id ?? ''))
    setError('')
    setParams((prev) => {
      const p = new URLSearchParams(prev)
      p.set('new', '1')
      return p
    })
  }

  const closeSheet = () => {
    setParams((prev) => {
      const p = new URLSearchParams(prev)
      p.delete('new')
      p.delete('date')
      p.delete('start')
      p.delete('end')
      return p
    })
  }

  const handleCreate = () => {
    if (!form.packageId || !form.childName.trim()) {
      setError('Upiši barem paket i ime djeteta.')
      return
    }

    let customerId = form.customerId
    if (form.customerMode === 'new') {
      if (!form.newName.trim() || !form.newPhone.trim()) {
        setError('Za novog roditelja upiši ime i mobitel.')
        return
      }
      const created = createCustomer({
        fullName: form.newName.trim(),
        phone: form.newPhone.trim(),
        email: '',
        children: [],
        notes: '',
      })
      customerId = created.id
    }

    if (!customerId) {
      setError('Odaberi roditelja ili upiši novog.')
      return
    }

    const created = createReservation({
      customerId,
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
    closeSheet()
    navigate(`/partner/reservations/${created.id}`)
  }

  const toggleAddon = (id: string) => {
    setForm((f) => ({
      ...f,
      addonIds: f.addonIds.includes(id) ? f.addonIds.filter((x) => x !== id) : [...f.addonIds, id],
    }))
  }

  return (
    <>
      <header className="partner-topbar">
        <div>
          <h1 className="partner-topbar__title">Rezervacije</h1>
          <p className="partner-topbar__meta">{filtered.length} rezultata</p>
        </div>
        <Button type="button" leftIcon={<PartnerIcon name="plus" size={18} />} onClick={openSheet}>
          Nova rezervacija
        </Button>
      </header>

      <div className="partner-segments" role="tablist" aria-label="Filter po statusu">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={status === opt.value && !need}
            className={`partner-seg${status === opt.value && !need ? ' is-active' : ''}`}
            onClick={() => setStatus(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {need ? (
        <div className="partner-filterBanner">
          <span>
            Filtrirano: <strong>{NEED_LABELS[need] ?? need}</strong>
          </span>
          <button type="button" onClick={clearNeed} aria-label="Ukloni filter">
            Očisti ✕
          </button>
        </div>
      ) : null}

      <div className="partner-filters">
        <input
          className="pb-input"
          placeholder="Pretraži roditelja ili dijete"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="partner-filters__date">
          <span>Od</span>
          <input className="pb-input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </label>
        <label className="partner-filters__date">
          <span>Do</span>
          <input className="pb-input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="partner-emptyState">
          <PartnerIcon name="reservations" size={28} />
          <p className="partner-emptyState__title">Nema rezervacija</p>
          <p className="partner-emptyState__text">Promijeni filter ili upiši novu rezervaciju.</p>
        </div>
      ) : (
        <>
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
                  <th></th>
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
                      <td>
                        <Link to={`/partner/reservations/${res.id}`} className="pb-btn pb-btn-ghost pb-btn-sm">
                          Otvori
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>

          <div className="partner-cardList partner-cardList--mobileOnly">
            {filtered.map((res) => {
              const customer = customers.find((c) => c.id === res.customerId)
              const pkg = packages.find((p) => p.id === res.packageId)
              return (
                <Link key={res.id} to={`/partner/reservations/${res.id}`} className="partner-resCard partner-resCard--link">
                  <div className="partner-resCard__top">
                    <div>
                      <div className="partner-resCard__title">{res.childName}</div>
                      <div className="partner-resCard__meta">
                        {formatDateHr(res.date)} · {formatTimeRange(res.startTime, res.endTime)}
                      </div>
                    </div>
                    <StatusBadge status={res.status} />
                  </div>
                  <div className="partner-resCard__meta">
                    {customer?.fullName ?? '—'}
                    {pkg ? ` · ${pkg.name}` : ''} · {formatPrice(res.totalPrice, playroom.currency)}
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}

      <PartnerSheet
        open={showNew}
        onClose={closeSheet}
        title="Nova rezervacija"
        description="Upiši rođendan dok si na telefonu s roditeljem."
        footer={
          <>
            <Button type="button" onClick={handleCreate}>
              Spremi rezervaciju
            </Button>
            <Button variant="ghost" type="button" onClick={closeSheet}>
              Odustani
            </Button>
          </>
        }
      >
        <div className="partner-formStack">
          <div className="partner-field">
            <span className="partner-field__label">Roditelj</span>
            <div className="partner-segments partner-segments--inline">
              <button
                type="button"
                className={`partner-seg${form.customerMode === 'existing' ? ' is-active' : ''}`}
                onClick={() => setForm({ ...form, customerMode: 'existing' })}
              >
                Postojeći
              </button>
              <button
                type="button"
                className={`partner-seg${form.customerMode === 'new' ? ' is-active' : ''}`}
                onClick={() => setForm({ ...form, customerMode: 'new' })}
              >
                Novi roditelj
              </button>
            </div>
          </div>

          {form.customerMode === 'existing' ? (
            <label className="partner-field">
              <span className="partner-field__label">Odaberi roditelja</span>
              <select
                className="pb-input"
                value={form.customerId}
                onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="partner-formGrid partner-formGrid--2">
              <label className="partner-field">
                <span className="partner-field__label">Ime i prezime</span>
                <input
                  className="pb-input"
                  value={form.newName}
                  onChange={(e) => setForm({ ...form, newName: e.target.value })}
                  placeholder="npr. Ana Marić"
                />
              </label>
              <label className="partner-field">
                <span className="partner-field__label">Mobitel</span>
                <input
                  className="pb-input"
                  type="tel"
                  value={form.newPhone}
                  onChange={(e) => setForm({ ...form, newPhone: e.target.value })}
                  placeholder="091 234 5678"
                />
              </label>
            </div>
          )}

          <label className="partner-field">
            <span className="partner-field__label">Paket</span>
            <select
              className="pb-input"
              value={form.packageId}
              onChange={(e) => setForm({ ...form, packageId: e.target.value })}
            >
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <div className="partner-formGrid partner-formGrid--2">
            <label className="partner-field">
              <span className="partner-field__label">Datum</span>
              <input
                className="pb-input"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </label>
            <label className="partner-field">
              <span className="partner-field__label">Termin</span>
              <select
                className="pb-input"
                value={form.startTime}
                onChange={(e) => {
                  const slot = slots.find((s) => s.startTime === e.target.value)
                  if (slot) setForm({ ...form, startTime: slot.startTime, endTime: slot.endTime })
                }}
              >
                {slots.length === 0 ? <option value={form.startTime}>Nema slobodnih termina</option> : null}
                {slots.map((slot) => (
                  <option key={`${slot.startTime}-${slot.endTime}`} value={slot.startTime}>
                    {formatTimeRange(slot.startTime, slot.endTime)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="partner-formGrid partner-formGrid--3">
            <label className="partner-field">
              <span className="partner-field__label">Ime djeteta</span>
              <input
                className="pb-input"
                value={form.childName}
                onChange={(e) => setForm({ ...form, childName: e.target.value })}
              />
            </label>
            <label className="partner-field">
              <span className="partner-field__label">Dob</span>
              <input
                className="pb-input"
                type="number"
                min={1}
                value={form.childAge}
                onChange={(e) => setForm({ ...form, childAge: Number(e.target.value) })}
              />
            </label>
            <label className="partner-field">
              <span className="partner-field__label">Broj djece</span>
              <input
                className="pb-input"
                type="number"
                min={1}
                value={form.childrenCount}
                onChange={(e) => setForm({ ...form, childrenCount: Number(e.target.value) })}
              />
            </label>
          </div>

          <label className="partner-field">
            <span className="partner-field__label">Tema (opcionalno)</span>
            <input
              className="pb-input"
              value={form.theme}
              onChange={(e) => setForm({ ...form, theme: e.target.value })}
              placeholder="npr. Svemir, jednorozi…"
            />
          </label>

          {activeAddons.length > 0 ? (
            <div className="partner-field">
              <span className="partner-field__label">Dodaci</span>
              <div className="partner-checkGrid">
                {activeAddons.map((addon) => (
                  <label key={addon.id} className={`partner-checkPill${form.addonIds.includes(addon.id) ? ' is-checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={form.addonIds.includes(addon.id)}
                      onChange={() => toggleAddon(addon.id)}
                    />
                    <span>{addon.name}</span>
                    <span className="partner-checkPill__price">{formatPrice(addon.price, playroom.currency)}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <label className="partner-field">
            <span className="partner-field__label">Napomena (opcionalno)</span>
            <textarea
              className="pb-input"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>

          <div className="partner-priceSummary">
            <div>
              <span className="partner-priceSummary__label">Ukupno</span>
              <span className="partner-priceSummary__value">{formatPrice(totalPrice, playroom.currency)}</span>
            </div>
            <div>
              <span className="partner-priceSummary__label">Akontacija</span>
              <span className="partner-priceSummary__value">
                {formatPrice(playroom.defaultDepositAmount, playroom.currency)}
              </span>
            </div>
          </div>

          {error ? <p className="partner-formError" role="alert">{error}</p> : null}
        </div>
      </PartnerSheet>
    </>
  )
}
