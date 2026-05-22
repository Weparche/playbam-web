import { useEffect, useState } from 'react'

import Button from '../../components/ui/Button'
import { usePartnerData } from '../context/PartnerDataContext'
import type { Playroom } from '../types'

export default function PartnerSettingsPage() {
  const { playroom, updatePlayroom, resetDemoData } = usePartnerData()
  const [form, setForm] = useState<Playroom>(playroom)

  useEffect(() => {
    setForm(playroom)
  }, [playroom])

  return (
    <>
      <header className="partner-topbar"><h1 className="partner-topbar__title">Postavke igraonice</h1></header>
      <section className="partner-panel">
        <div className="partner-formGrid partner-formGrid--2">
          <label className="pb-formField"><span className="pb-formLabel">Naziv</span><input className="pb-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Email obavijesti</span><input className="pb-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Adresa</span><input className="pb-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Grad</span><input className="pb-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Telefon</span><input className="pb-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Trajanje slotova (min)</span><input className="pb-input" type="number" value={form.slotDurationMinutes} onChange={(e) => setForm({ ...form, slotDurationMinutes: Number(e.target.value) })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Buffer (min)</span><input className="pb-input" type="number" value={form.cleanupBufferMinutes} onChange={(e) => setForm({ ...form, cleanupBufferMinutes: Number(e.target.value) })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Max paralelnih rođendana</span><input className="pb-input" type="number" value={form.maxParallelEvents} onChange={(e) => setForm({ ...form, maxParallelEvents: Number(e.target.value) })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Akontacija</span><input className="pb-input" type="number" value={form.defaultDepositAmount} onChange={(e) => setForm({ ...form, defaultDepositAmount: Number(e.target.value) })} /></label>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          <Button type="button" onClick={() => updatePlayroom(form)}>Spremi postavke</Button>
          <Button variant="ghost" type="button" onClick={resetDemoData}>Reset demo podataka</Button>
        </div>
      </section>
    </>
  )
}
