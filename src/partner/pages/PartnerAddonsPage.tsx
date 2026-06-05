import { useState } from 'react'

import Button from '../../components/ui/Button'
import { usePartnerData } from '../context/PartnerDataContext'
import { formatPrice } from '../lib/pricing'
import PartnerSetupTabs from '../components/layout/PartnerSetupTabs'
import PartnerSheet from '../components/ui/PartnerSheet'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import PartnerToast from '../components/ui/PartnerToast'
import PartnerIcon from '../components/ui/PartnerIcon'

const blankForm = () => ({ name: '', description: '', price: 0, category: 'Ostalo', isActive: true })

export default function PartnerAddonsPage() {
  const { addons, playroom, createAddon, updateAddon, deleteAddon } = usePartnerData()
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
    const addon = addons.find((a) => a.id === id)
    if (!addon) return
    setEditingId(id)
    setForm({ name: addon.name, description: addon.description, price: addon.price, category: addon.category, isActive: addon.isActive })
    setSheetOpen(true)
  }

  const save = () => {
    if (!form.name.trim()) return
    if (editingId) updateAddon(editingId, form)
    else createAddon(form)
    setSheetOpen(false)
    setToast(editingId ? 'Dodatak spremljen' : 'Dodatak dodan')
  }

  const confirmDelete = () => {
    if (deleteId) {
      deleteAddon(deleteId)
      setToast('Dodatak obrisan')
    }
    setDeleteId(null)
  }

  const deleteTarget = addons.find((a) => a.id === deleteId)

  return (
    <>
      <PartnerSetupTabs />

      <div className="partner-hubBar">
        <p className="partner-hubBar__meta">{addons.length} dodataka</p>
        <Button type="button" leftIcon={<PartnerIcon name="plus" size={18} />} onClick={openNew}>
          Novi dodatak
        </Button>
      </div>

      {addons.length === 0 ? (
        <div className="partner-emptyState">
          <PartnerIcon name="addons" size={28} />
          <p className="partner-emptyState__title">Još nema dodataka</p>
          <p className="partner-emptyState__text">Dodaj torte, balone, fotografa i ostalo što roditelji mogu doplatiti.</p>
          <Button type="button" onClick={openNew}>Novi dodatak</Button>
        </div>
      ) : (
        <>
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
                      <Button variant="ghost" type="button" onClick={() => openEdit(addon.id)}>Uredi</Button>
                      <Button variant="ghost" type="button" className="partner-btnDanger" onClick={() => setDeleteId(addon.id)}>Obriši</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="partner-cardList partner-cardList--mobileOnly">
            {addons.map((addon) => (
              <div key={addon.id} className="partner-resCard">
                <div className="partner-resCard__title">{addon.name}</div>
                <div className="partner-resCard__meta">{addon.category} · {formatPrice(addon.price, playroom.currency)}</div>
                <div className="partner-resCard__meta">{addon.isActive ? 'Aktivan' : 'Neaktivan'}</div>
                <div className="partner-resCard__actions">
                  <Button variant="ghost" type="button" onClick={() => openEdit(addon.id)}>Uredi</Button>
                  <Button variant="ghost" type="button" className="partner-btnDanger" onClick={() => setDeleteId(addon.id)}>Obriši</Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <PartnerSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editingId ? 'Uredi dodatak' : 'Novi dodatak'}
        footer={
          <>
            <Button type="button" onClick={save}>{editingId ? 'Spremi' : 'Dodaj'}</Button>
            <Button variant="ghost" type="button" onClick={() => setSheetOpen(false)}>Odustani</Button>
          </>
        }
      >
        <div className="partner-formStack">
          <label className="partner-field">
            <span className="partner-field__label">Naziv</span>
            <input className="pb-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <div className="partner-formGrid partner-formGrid--2">
            <label className="partner-field">
              <span className="partner-field__label">Cijena ({playroom.currency})</span>
              <input className="pb-input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </label>
            <label className="partner-field">
              <span className="partner-field__label">Kategorija</span>
              <input className="pb-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </label>
          </div>
          <label className="partner-field">
            <span className="partner-field__label">Opis</span>
            <input className="pb-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label className="partner-checkPill" style={{ maxWidth: 'max-content' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            <span>Aktivan (može se dodati uz rezervaciju)</span>
          </label>
        </div>
      </PartnerSheet>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Obrisati dodatak?"
        message={`Dodatak "${deleteTarget?.name ?? ''}" bit će trajno uklonjen.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      <PartnerToast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
