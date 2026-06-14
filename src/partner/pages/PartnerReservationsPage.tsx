import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import Button from '../../components/ui/Button'
import { usePartnerData } from '../context/PartnerDataContext'
import { generateAvailableSlots } from '../lib/availability'
import { formatDateHr, formatTimeRange, todayKey } from '../lib/dates'
import { formatPrice } from '../lib/pricing'
import { useDebouncedValue } from '../lib/useDebouncedValue'
import type { BirthdayReservation, ReservationStatus } from '../types'
import StatusBadge from '../components/ui/StatusBadge'
import PartnerSheet from '../components/ui/PartnerSheet'
import PartnerIcon from '../components/ui/PartnerIcon'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { PartnerSkeletonRows } from '../components/ui/PartnerSkeleton'

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
    isReady,
    listReservations,
    packages,
    addons,
    customers,
    playroom,
    createReservation,
    createCustomer,
    calculatePrice,
    reservations,
    confirmMany,
    markDepositPaidMany,
    cancelMany,
  } = usePartnerData()

  const today = todayKey()
  const status = (params.get('status') as ReservationStatus | 'all') ?? 'all'
  const need = params.get('need')
  const showNew = params.get('new') === '1'

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 250)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [saving, setSaving] = useState(false)
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
      search: debouncedSearch,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    })
    return need ? base.filter((r) => matchesNeed(r, need, today)) : base
  }, [listReservations, status, debouncedSearch, dateFrom, dateTo, need, today, reservations])

  const statusLabelFor = (s: ReservationStatus | 'all') =>
    STATUS_OPTIONS.find((o) => o.value === s)?.label ?? s
  const hasActiveFilters = status !== 'all' || !!need || !!debouncedSearch || !!dateFrom || !!dateTo
  const statusCounts = useMemo(() => {
    const counts = new Map<ReservationStatus, number>()
    for (const res of reservations) {
      counts.set(res.status, (counts.get(res.status) ?? 0) + 1)
    }
    return counts
  }, [reservations])

  // ----- Selection / bulk actions -----
  const filteredIds = useMemo(() => filtered.map((r) => r.id), [filtered])
  const selectedList = useMemo(() => filtered.filter((r) => selectedIds.has(r.id)), [filtered, selectedIds])
  const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.has(id))

  const toggleRow = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const toggleAll = () =>
    setSelectedIds((prev) => (filteredIds.every((id) => prev.has(id)) ? new Set() : new Set(filteredIds)))

  const clearSelection = () => setSelectedIds(new Set())

  const runBulk = (fn: (ids: string[]) => void) => {
    fn(Array.from(selectedIds))
    clearSelection()
  }

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

  const clearStatus = () => setStatus('all')

  const clearAllFilters = () => {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setParams((prev) => {
      const p = new URLSearchParams(prev)
      p.delete('status')
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

    setSaving(true)
    const customerForCreate = customerId
    // Short delay so the "Spremam…" state is perceptible before navigating away.
    window.setTimeout(() => {
      const created = createReservation({
        customerId: customerForCreate,
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
      setSaving(false)
      closeSheet()
      navigate(`/partner/reservations/${created.id}`)
    }, 400)
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
          <p className="partner-topbar__meta">Pretraži, filtriraj i obradi rođendane.</p>
        </div>
        <Button type="button" leftIcon={<PartnerIcon name="plus" size={18} />} onClick={openSheet}>
          Nova rezervacija
        </Button>
      </header>

      <div className="partner-pipelineSummary" aria-label="Sažetak pipelinea rezervacija">
        {STATUS_OPTIONS.filter((opt) => opt.value !== 'all').map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`partner-pipelineSummary__item${status === opt.value && !need ? ' is-active' : ''}`}
            onClick={() => setStatus(opt.value)}
          >
            <span>{opt.label}</span>
            <strong>{statusCounts.get(opt.value as ReservationStatus) ?? 0}</strong>
          </button>
        ))}
      </div>

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

      <div className="partner-toolbar">
        <div className="partner-toolbar__row">
          <div className="partner-toolbar__search">
            <PartnerIcon name="reservations" size={17} />
            <input
              className="pb-input"
              type="search"
              placeholder="Pretraži roditelja ili dijete"
              aria-label="Pretraži rezervacije"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <label className="partner-filters__date">
            <span>Od</span>
            <input className="pb-input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </label>
          <label className="partner-filters__date">
            <span>Do</span>
            <input className="pb-input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </label>
          <span className="partner-toolbar__count" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'rezultat' : 'rezultata'}
          </span>
        </div>

        {hasActiveFilters ? (
          <div className="partner-activeFilters" aria-label="Aktivni filteri">
            {status !== 'all' && !need ? (
              <span className="partner-filterChip">
                {statusLabelFor(status)}
                <button type="button" onClick={clearStatus} aria-label={`Ukloni filter ${statusLabelFor(status)}`}>✕</button>
              </span>
            ) : null}
            {need ? (
              <span className="partner-filterChip">
                {NEED_LABELS[need] ?? need}
                <button type="button" onClick={clearNeed} aria-label="Ukloni filter potrebe">✕</button>
              </span>
            ) : null}
            {debouncedSearch ? (
              <span className="partner-filterChip">
                „{debouncedSearch}”
                <button type="button" onClick={() => setSearch('')} aria-label="Ukloni pretragu">✕</button>
              </span>
            ) : null}
            {dateFrom ? (
              <span className="partner-filterChip">
                Od {formatDateHr(dateFrom)}
                <button type="button" onClick={() => setDateFrom('')} aria-label="Ukloni datum od">✕</button>
              </span>
            ) : null}
            {dateTo ? (
              <span className="partner-filterChip">
                Do {formatDateHr(dateTo)}
                <button type="button" onClick={() => setDateTo('')} aria-label="Ukloni datum do">✕</button>
              </span>
            ) : null}
            <button type="button" className="partner-toolbar__clear" onClick={clearAllFilters}>
              Očisti sve
            </button>
          </div>
        ) : null}
      </div>

      {selectedIds.size > 0 ? (
        <div className="partner-bulkBar" role="region" aria-label="Skupne akcije">
          <span className="partner-bulkBar__count" aria-live="polite">
            <span>{selectedIds.size}</span> odabrano
          </span>
          <div className="partner-bulkBar__actions">
            <button type="button" className="partner-bulkBar__btn" onClick={() => runBulk(confirmMany)}>
              <PartnerIcon name="check" size={15} /> Potvrdi
            </button>
            <button type="button" className="partner-bulkBar__btn" onClick={() => runBulk(markDepositPaidMany)}>
              <PartnerIcon name="check" size={15} /> Akontacija plaćena
            </button>
            <button
              type="button"
              className="partner-bulkBar__btn partner-bulkBar__btn--danger"
              onClick={() => setConfirmCancel(true)}
            >
              Otkaži
            </button>
          </div>
          <button type="button" className="partner-bulkBar__close" onClick={clearSelection} aria-label="Poništi odabir">
            ✕
          </button>
        </div>
      ) : null}

      {!isReady ? (
        <section className="partner-panel" aria-busy="true">
          <PartnerSkeletonRows rows={6} />
        </section>
      ) : filtered.length === 0 ? (
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
                  <th className="partner-selectCell">
                    <input
                      type="checkbox"
                      className="partner-checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Odaberi sve rezervacije"
                    />
                  </th>
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
                  const selected = selectedIds.has(res.id)
                  return (
                    <tr key={res.id} className={selected ? 'is-selected' : undefined}>
                      <td className="partner-selectCell">
                        <input
                          type="checkbox"
                          className="partner-checkbox"
                          checked={selected}
                          onChange={() => toggleRow(res.id)}
                          aria-label={`Odaberi rezervaciju — ${res.childName}`}
                        />
                      </td>
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
              const selected = selectedIds.has(res.id)
              return (
                <div key={res.id} className={`partner-resCard partner-resCard--selectable${selected ? ' is-selected' : ''}`}>
                  <input
                    type="checkbox"
                    className="partner-checkbox"
                    checked={selected}
                    onChange={() => toggleRow(res.id)}
                    aria-label={`Odaberi rezervaciju — ${res.childName}`}
                  />
                  <Link to={`/partner/reservations/${res.id}`} className="partner-resCard__link">
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
                </div>
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
            <Button type="button" onClick={handleCreate} loading={saving}>
              {saving ? 'Spremam…' : 'Spremi rezervaciju'}
            </Button>
            <Button variant="ghost" type="button" onClick={closeSheet} disabled={saving}>
              Odustani
            </Button>
          </>
        }
      >
        <div className="partner-formStack">
          <div className="partner-sheetIntro">
            <span>Pipeline unos</span>
            <p>Roditelj, termin, dijete i cijena ostaju vidljivi kao jedan brzi tok za telefonski upis.</p>
          </div>

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

      <ConfirmDialog
        open={confirmCancel}
        title="Otkazati odabrane rezervacije?"
        message={`${selectedList.length} ${selectedList.length === 1 ? 'rezervacija bit će označena' : 'rezervacija bit će označeno'} kao otkazano. Ovu radnju nije moguće poništiti skupno.`}
        confirmLabel="Otkaži rezervacije"
        cancelLabel="Odustani"
        onConfirm={() => {
          runBulk(cancelMany)
          setConfirmCancel(false)
        }}
        onCancel={() => setConfirmCancel(false)}
      />
    </>
  )
}
