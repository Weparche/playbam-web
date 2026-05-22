import { useState } from 'react'

import Button from '../../components/ui/Button'
import { usePartnerData } from '../context/PartnerDataContext'
import { formatDateHr } from '../lib/dates'
import type { Weekday } from '../types'

const DAYS: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export default function PartnerAnimatorsPage() {
  const { animators, createAnimator, updateAnimator, deleteAnimator, reservations } = usePartnerData()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    skills: '',
    availableDays: ['sat', 'sun'] as Weekday[],
    maxEventsPerDay: 2,
    hourlyRate: 15,
    isActive: true,
  })

  const save = () => {
    if (!form.name.trim()) return
    const payload = { ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) }
    if (editingId) updateAnimator(editingId, payload)
    else createAnimator(payload)
    setEditingId(null)
    setForm({ name: '', phone: '', email: '', skills: '', availableDays: ['sat', 'sun'], maxEventsPerDay: 2, hourlyRate: 15, isActive: true })
  }

  return (
    <>
      <header className="partner-topbar"><h1 className="partner-topbar__title">Animatori</h1></header>

      <section className="partner-panel">
        <h2 className="partner-panel__title">{editingId ? 'Uredi animatora' : 'Novi animator'}</h2>
        <div className="partner-formGrid partner-formGrid--2">
          <label className="pb-formField"><span className="pb-formLabel">Ime</span><input className="pb-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Telefon</span><input className="pb-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Email</span><input className="pb-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Vještine (zarez)</span><input className="pb-input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Max eventi/dan</span><input className="pb-input" type="number" value={form.maxEventsPerDay} onChange={(e) => setForm({ ...form, maxEventsPerDay: Number(e.target.value) })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Satnica</span><input className="pb-input" type="number" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: Number(e.target.value) })} /></label>
        </div>
        <div className="partner-checklist">
          {DAYS.map((day) => (
            <label key={day}>
              <input
                type="checkbox"
                checked={form.availableDays.includes(day)}
                onChange={(e) =>
                  setForm({
                    ...form,
                    availableDays: e.target.checked
                      ? [...form.availableDays, day]
                      : form.availableDays.filter((d) => d !== day),
                  })
                }
              />
              {day}
            </label>
          ))}
        </div>
        <div style={{ marginTop: '0.75rem' }}><Button type="button" onClick={save}>Spremi</Button></div>
      </section>

      {animators.map((animator) => {
        const upcoming = reservations.filter(
          (r) => r.assignedAnimatorIds.includes(animator.id) && r.status !== 'cancelled' && r.status !== 'completed',
        )
        return (
          <section key={animator.id} className="partner-panel">
            <div className="partner-eventRow">
              <div>
                <div className="partner-eventRow__title">{animator.name}</div>
                <div className="partner-eventRow__meta">{animator.skills.join(' · ')}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <Button variant="ghost" type="button" onClick={() => { setEditingId(animator.id); setForm({ name: animator.name, phone: animator.phone, email: animator.email, skills: animator.skills.join(', '), availableDays: animator.availableDays, maxEventsPerDay: animator.maxEventsPerDay, hourlyRate: animator.hourlyRate, isActive: animator.isActive }) }}>Uredi</Button>
                <Button variant="ghost" type="button" onClick={() => deleteAnimator(animator.id)}>Obriši</Button>
              </div>
            </div>
            <p className="partner-topbar__meta">Nadolazeći eventi:</p>
            {upcoming.length === 0 ? (
              <p className="partner-topbar__meta">Nema dodijeljenih evenata.</p>
            ) : (
              upcoming.map((res) => (
                <div key={res.id} className="partner-eventRow__meta">
                  {formatDateHr(res.date)} · {res.startTime} · {res.childName}
                </div>
              ))
            )}
          </section>
        )
      })}
    </>
  )
}
