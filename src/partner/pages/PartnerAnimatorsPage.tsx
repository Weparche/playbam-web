import { useState } from 'react'

import Button from '../../components/ui/Button'
import { usePartnerData } from '../context/PartnerDataContext'
import { formatDateHr, WEEKDAY_LABELS_HR } from '../lib/dates'
import type { Weekday } from '../types'
import PartnerSetupTabs from '../components/layout/PartnerSetupTabs'
import PartnerSheet from '../components/ui/PartnerSheet'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import PartnerToast from '../components/ui/PartnerToast'
import PartnerIcon from '../components/ui/PartnerIcon'

const DAYS: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

const blankForm = () => ({
  name: '',
  phone: '',
  email: '',
  skills: '',
  availableDays: ['sat', 'sun'] as Weekday[],
  maxEventsPerDay: 2,
  hourlyRate: 15,
  isActive: true,
})

export default function PartnerAnimatorsPage() {
  const { animators, createAnimator, updateAnimator, deleteAnimator, reservations } = usePartnerData()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [form, setForm] = useState(blankForm)

  const openNew = () => {
    setEditingId(null)
    setForm(blankForm())
    setSheetOpen(true)
  }

  const openEdit = (id: string) => {
    const animator = animators.find((a) => a.id === id)
    if (!animator) return
    setEditingId(id)
    setForm({
      name: animator.name,
      phone: animator.phone,
      email: animator.email,
      skills: animator.skills.join(', '),
      availableDays: animator.availableDays,
      maxEventsPerDay: animator.maxEventsPerDay,
      hourlyRate: animator.hourlyRate,
      isActive: animator.isActive,
    })
    setSheetOpen(true)
  }

  const save = () => {
    if (!form.name.trim()) return
    const payload = { ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) }
    if (editingId) updateAnimator(editingId, payload)
    else createAnimator(payload)
    setSheetOpen(false)
    setToast(editingId ? 'Animator spremljen' : 'Animator dodan')
  }

  const confirmDelete = () => {
    if (deleteId) {
      deleteAnimator(deleteId)
      setToast('Animator obrisan')
    }
    setDeleteId(null)
  }

  const deleteTarget = animators.find((a) => a.id === deleteId)

  return (
    <>
      <PartnerSetupTabs />

      <div className="partner-hubBar">
        <p className="partner-hubBar__meta">{animators.length} animatora</p>
        <Button type="button" leftIcon={<PartnerIcon name="plus" size={18} />} onClick={openNew}>
          Novi animator
        </Button>
      </div>

      {animators.length === 0 ? (
        <div className="partner-emptyState">
          <PartnerIcon name="animators" size={28} />
          <p className="partner-emptyState__title">Još nema animatora</p>
          <p className="partner-emptyState__text">Dodaj svoje animatore da ih možeš dodjeljivati rođendanima.</p>
          <Button type="button" onClick={openNew}>Novi animator</Button>
        </div>
      ) : (
        <div className="partner-cardList">
          {animators.map((animator) => {
            const upcoming = reservations.filter(
              (r) => r.assignedAnimatorIds.includes(animator.id) && r.status !== 'cancelled' && r.status !== 'completed',
            )
            return (
              <section key={animator.id} className="partner-panel">
                <div className="partner-resCard__top">
                  <div>
                    <div className="partner-resCard__title">
                      {animator.name}
                      {!animator.isActive ? <span className="partner-chip" data-variant="muted" style={{ marginLeft: '0.5rem' }}>neaktivan</span> : null}
                    </div>
                    <div className="partner-resCard__meta">{animator.skills.join(' · ') || 'Bez vještina'}</div>
                    <div className="partner-resCard__meta">
                      Dani: {animator.availableDays.map((d) => WEEKDAY_LABELS_HR[d]).join(', ') || '—'}
                    </div>
                  </div>
                  <div className="partner-resCard__actions">
                    <Button variant="ghost" type="button" onClick={() => openEdit(animator.id)}>Uredi</Button>
                    <Button variant="ghost" type="button" className="partner-btnDanger" onClick={() => setDeleteId(animator.id)}>Obriši</Button>
                  </div>
                </div>
                <p className="partner-fieldHelp" style={{ marginTop: '0.75rem', marginBottom: '0.35rem' }}>
                  Nadolazeći eventi
                </p>
                {upcoming.length === 0 ? (
                  <p className="partner-empty">Nema dodijeljenih evenata.</p>
                ) : (
                  upcoming.map((res) => (
                    <div key={res.id} className="partner-resCard__meta">
                      {formatDateHr(res.date)} · {res.startTime} · {res.childName}
                    </div>
                  ))
                )}
              </section>
            )
          })}
        </div>
      )}

      <PartnerSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editingId ? 'Uredi animatora' : 'Novi animator'}
        footer={
          <>
            <Button type="button" onClick={save}>{editingId ? 'Spremi' : 'Dodaj'}</Button>
            <Button variant="ghost" type="button" onClick={() => setSheetOpen(false)}>Odustani</Button>
          </>
        }
      >
        <div className="partner-formStack">
          <div className="partner-formGrid partner-formGrid--2">
            <label className="partner-field">
              <span className="partner-field__label">Ime</span>
              <input className="pb-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="partner-field">
              <span className="partner-field__label">Telefon</span>
              <input className="pb-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
            <label className="partner-field">
              <span className="partner-field__label">Email</span>
              <input className="pb-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>
            <label className="partner-field">
              <span className="partner-field__label">Vještine</span>
              <input className="pb-input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="odvojeno zarezom" />
            </label>
            <label className="partner-field">
              <span className="partner-field__label">Max eventi / dan</span>
              <input className="pb-input" type="number" value={form.maxEventsPerDay} onChange={(e) => setForm({ ...form, maxEventsPerDay: Number(e.target.value) })} />
            </label>
            <label className="partner-field">
              <span className="partner-field__label">Satnica</span>
              <input className="pb-input" type="number" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: Number(e.target.value) })} />
            </label>
          </div>

          <div className="partner-field">
            <span className="partner-field__label">Dostupni dani</span>
            <div className="partner-dayPicker">
              {DAYS.map((day) => {
                const active = form.availableDays.includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    className={`partner-dayChip${active ? ' is-active' : ''}`}
                    aria-pressed={active}
                    onClick={() =>
                      setForm({
                        ...form,
                        availableDays: active
                          ? form.availableDays.filter((d) => d !== day)
                          : [...form.availableDays, day],
                      })
                    }
                  >
                    {WEEKDAY_LABELS_HR[day]}
                  </button>
                )
              })}
            </div>
          </div>

          <label className="partner-checkPill" style={{ maxWidth: 'max-content' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            <span>Aktivan (može se dodjeljivati)</span>
          </label>
        </div>
      </PartnerSheet>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Obrisati animatora?"
        message={`Animator "${deleteTarget?.name ?? ''}" bit će uklonjen. Provjeri da nije dodijeljen nadolazećim eventima.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      <PartnerToast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
