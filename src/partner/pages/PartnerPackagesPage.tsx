import { useState } from 'react'

import Button from '../../components/ui/Button'
import { usePartnerData } from '../context/PartnerDataContext'
import { formatPrice } from '../lib/pricing'

export default function PartnerPackagesPage() {
  const { packages, playroom, createPackage, updatePackage, deletePackage } = usePartnerData()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    durationMinutes: 120,
    basePrice: 200,
    includedChildren: 10,
    extraChildPrice: 10,
    includesAnimator: false,
    isActive: true,
    sortOrder: packages.length + 1,
  })

  const resetForm = () => {
    setEditingId(null)
    setForm({
      name: '',
      description: '',
      durationMinutes: 120,
      basePrice: 200,
      includedChildren: 10,
      extraChildPrice: 10,
      includesAnimator: false,
      isActive: true,
      sortOrder: packages.length + 1,
    })
  }

  const save = () => {
    if (!form.name.trim()) return
    if (editingId) {
      updatePackage(editingId, form)
    } else {
      createPackage(form)
    }
    resetForm()
  }

  return (
    <>
      <header className="partner-topbar">
        <h1 className="partner-topbar__title">Paketi rođendana</h1>
      </header>

      <section className="partner-panel">
        <h2 className="partner-panel__title">{editingId ? 'Uredi paket' : 'Novi paket'}</h2>
        <div className="partner-formGrid partner-formGrid--2">
          <label className="pb-formField"><span className="pb-formLabel">Naziv</span><input className="pb-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Trajanje (min)</span><input className="pb-input" type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Cijena</span><input className="pb-input" type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Uključeno djece</span><input className="pb-input" type="number" value={form.includedChildren} onChange={(e) => setForm({ ...form, includedChildren: Number(e.target.value) })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Dodatno dijete</span><input className="pb-input" type="number" value={form.extraChildPrice} onChange={(e) => setForm({ ...form, extraChildPrice: Number(e.target.value) })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Opis</span><input className="pb-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        </div>
        <label><input type="checkbox" checked={form.includesAnimator} onChange={(e) => setForm({ ...form, includesAnimator: e.target.checked })} /> Uključuje animatora</label>
        <label style={{ marginLeft: '1rem' }}><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Aktivan</label>
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
          <Button type="button" onClick={save}>{editingId ? 'Spremi' : 'Dodaj'}</Button>
          {editingId ? <Button variant="ghost" type="button" onClick={resetForm}>Odustani</Button> : null}
        </div>
      </section>

      <section className="partner-panel partner-tableWrap">
        <table className="partner-table">
          <thead>
            <tr><th>Naziv</th><th>Trajanje</th><th>Cijena</th><th>Djeca</th><th>Aktivan</th><th></th></tr>
          </thead>
          <tbody>
            {packages.map((pkg) => (
              <tr key={pkg.id}>
                <td>{pkg.name}</td>
                <td>{pkg.durationMinutes} min</td>
                <td>{formatPrice(pkg.basePrice, playroom.currency)}</td>
                <td>{pkg.includedChildren}</td>
                <td>{pkg.isActive ? 'Da' : 'Ne'}</td>
                <td>
                  <Button variant="ghost" type="button" onClick={() => { setEditingId(pkg.id); setForm({ ...pkg }) }}>Uredi</Button>
                  <Button variant="ghost" type="button" onClick={() => deletePackage(pkg.id)}>Obriši</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
