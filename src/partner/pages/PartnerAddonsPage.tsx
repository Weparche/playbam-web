import { useState } from 'react'

import Button from '../../components/ui/Button'
import { usePartnerData } from '../context/PartnerDataContext'
import { formatPrice } from '../lib/pricing'

export default function PartnerAddonsPage() {
  const { addons, playroom, createAddon, updateAddon, deleteAddon } = usePartnerData()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '', price: 0, category: 'Ostalo', isActive: true })

  const save = () => {
    if (!form.name.trim()) return
    if (editingId) updateAddon(editingId, form)
    else createAddon(form)
    setEditingId(null)
    setForm({ name: '', description: '', price: 0, category: 'Ostalo', isActive: true })
  }

  return (
    <>
      <header className="partner-topbar"><h1 className="partner-topbar__title">Dodaci</h1></header>
      <section className="partner-panel">
        <h2 className="partner-panel__title">{editingId ? 'Uredi dodatak' : 'Novi dodatak'}</h2>
        <div className="partner-formGrid partner-formGrid--2">
          <label className="pb-formField"><span className="pb-formLabel">Naziv</span><input className="pb-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Cijena</span><input className="pb-input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Kategorija</span><input className="pb-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label>
          <label className="pb-formField"><span className="pb-formLabel">Opis</span><input className="pb-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        </div>
        <label><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Aktivan</label>
        <div style={{ marginTop: '0.75rem' }}><Button type="button" onClick={save}>Spremi</Button></div>
      </section>
      <section className="partner-panel partner-tableWrap">
        <table className="partner-table">
          <thead><tr><th>Naziv</th><th>Kategorija</th><th>Cijena</th><th>Aktivan</th><th></th></tr></thead>
          <tbody>
            {addons.map((addon) => (
              <tr key={addon.id}>
                <td>{addon.name}</td>
                <td>{addon.category}</td>
                <td>{formatPrice(addon.price, playroom.currency)}</td>
                <td>{addon.isActive ? 'Da' : 'Ne'}</td>
                <td>
                  <Button variant="ghost" type="button" onClick={() => { setEditingId(addon.id); setForm({ name: addon.name, description: addon.description, price: addon.price, category: addon.category, isActive: addon.isActive }) }}>Uredi</Button>
                  <Button variant="ghost" type="button" onClick={() => deleteAddon(addon.id)}>Obriši</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
