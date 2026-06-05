import { useState } from 'react'

import Button from '../../components/ui/Button'
import { usePartnerData } from '../context/PartnerDataContext'
import { formatPrice } from '../lib/pricing'
import PartnerSetupTabs from '../components/layout/PartnerSetupTabs'
import PartnerSheet from '../components/ui/PartnerSheet'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import PartnerToast from '../components/ui/PartnerToast'
import PartnerIcon from '../components/ui/PartnerIcon'

const blankForm = (sortOrder: number) => ({
  name: '',
  description: '',
  durationMinutes: 120,
  basePrice: 200,
  includedChildren: 10,
  extraChildPrice: 10,
  includesAnimator: false,
  isActive: true,
  sortOrder,
})

export default function PartnerPackagesPage() {
  const { packages, playroom, createPackage, updatePackage, deletePackage } = usePartnerData()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [form, setForm] = useState(() => blankForm(packages.length + 1))

  const openNew = () => {
    setEditingId(null)
    setForm(blankForm(packages.length + 1))
    setSheetOpen(true)
  }

  const openEdit = (id: string) => {
    const pkg = packages.find((p) => p.id === id)
    if (!pkg) return
    setEditingId(id)
    setForm({ ...pkg })
    setSheetOpen(true)
  }

  const save = () => {
    if (!form.name.trim()) return
    if (editingId) updatePackage(editingId, form)
    else createPackage(form)
    setSheetOpen(false)
    setToast(editingId ? 'Paket spremljen' : 'Paket dodan')
  }

  const confirmDelete = () => {
    if (deleteId) {
      deletePackage(deleteId)
      setToast('Paket obrisan')
    }
    setDeleteId(null)
  }

  const deleteTarget = packages.find((p) => p.id === deleteId)

  return (
    <>
      <PartnerSetupTabs />

      <div className="partner-hubBar">
        <p className="partner-hubBar__meta">{packages.length} paketa</p>
        <Button type="button" leftIcon={<PartnerIcon name="plus" size={18} />} onClick={openNew}>
          Novi paket
        </Button>
      </div>

      {packages.length === 0 ? (
        <div className="partner-emptyState">
          <PartnerIcon name="packages" size={28} />
          <p className="partner-emptyState__title">Još nema paketa</p>
          <p className="partner-emptyState__text">Dodaj prvi paket rođendana koji nudiš roditeljima.</p>
          <Button type="button" onClick={openNew}>
            Novi paket
          </Button>
        </div>
      ) : (
        <>
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
                      <Button variant="ghost" type="button" onClick={() => openEdit(pkg.id)}>Uredi</Button>
                      <Button variant="ghost" type="button" className="partner-btnDanger" onClick={() => setDeleteId(pkg.id)}>Obriši</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="partner-cardList partner-cardList--mobileOnly">
            {packages.map((pkg) => (
              <div key={pkg.id} className="partner-resCard">
                <div className="partner-resCard__title">{pkg.name}</div>
                <div className="partner-resCard__meta">
                  {pkg.durationMinutes} min · {formatPrice(pkg.basePrice, playroom.currency)} · {pkg.includedChildren} djece
                </div>
                <div className="partner-resCard__meta">{pkg.isActive ? 'Aktivan' : 'Neaktivan'}</div>
                <div className="partner-resCard__actions">
                  <Button variant="ghost" type="button" onClick={() => openEdit(pkg.id)}>Uredi</Button>
                  <Button variant="ghost" type="button" className="partner-btnDanger" onClick={() => setDeleteId(pkg.id)}>Obriši</Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <PartnerSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={editingId ? 'Uredi paket' : 'Novi paket'}
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
          <label className="partner-field">
            <span className="partner-field__label">Opis</span>
            <input className="pb-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <div className="partner-formGrid partner-formGrid--2">
            <label className="partner-field">
              <span className="partner-field__label">Trajanje (min)</span>
              <input className="pb-input" type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} />
            </label>
            <label className="partner-field">
              <span className="partner-field__label">Cijena ({playroom.currency})</span>
              <input className="pb-input" type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} />
            </label>
            <label className="partner-field">
              <span className="partner-field__label">Uključeno djece</span>
              <input className="pb-input" type="number" value={form.includedChildren} onChange={(e) => setForm({ ...form, includedChildren: Number(e.target.value) })} />
            </label>
            <label className="partner-field">
              <span className="partner-field__label">Cijena dodatnog djeteta ({playroom.currency})</span>
              <input className="pb-input" type="number" value={form.extraChildPrice} onChange={(e) => setForm({ ...form, extraChildPrice: Number(e.target.value) })} />
            </label>
          </div>
          <label className="partner-checkPill" style={{ maxWidth: 'max-content' }}>
            <input type="checkbox" checked={form.includesAnimator} onChange={(e) => setForm({ ...form, includesAnimator: e.target.checked })} />
            <span>Uključuje animatora</span>
          </label>
          <label className="partner-checkPill" style={{ maxWidth: 'max-content' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            <span>Aktivan (vidljiv pri upisu)</span>
          </label>
        </div>
      </PartnerSheet>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Obrisati paket?"
        message={`Paket "${deleteTarget?.name ?? ''}" bit će trajno uklonjen. Postojeće rezervacije ostaju.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      <PartnerToast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
