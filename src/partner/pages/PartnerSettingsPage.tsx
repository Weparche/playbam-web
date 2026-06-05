import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Button from '../../components/ui/Button'
import { usePartnerAuth } from '../context/PartnerAuthContext'
import { usePartnerData } from '../context/PartnerDataContext'
import type { Playroom } from '../types'
import PartnerSetupTabs from '../components/layout/PartnerSetupTabs'
import PartnerToast from '../components/ui/PartnerToast'
import ConfirmDialog from '../components/ui/ConfirmDialog'

function roleLabel(role: string) {
  if (role === 'owner') return 'Vlasnik'
  if (role === 'staff') return 'Osoblje'
  if (role === 'animator') return 'Animator'
  if (role === 'super_admin') return 'Admin'
  return role
}

function PartnerSettingsAccountFooter() {
  const { user, logout } = usePartnerAuth()

  if (!user) {
    return null
  }

  return (
    <footer className="partner-settingsAccountFooter" aria-label="Račun i odjava">
      <div className="partner-settingsAccountFooter__meta">
        <p className="partner-settingsAccountFooter__name">{user.name}</p>
        <span className="partner-roleBadge">{roleLabel(user.role)}</span>
      </div>
      <Button variant="ghost" type="button" className="partner-settingsAccountFooter__logout" onClick={logout}>
        Odjavi se
      </Button>
    </footer>
  )
}

function PartnerAnimatorSettings() {
  const { user } = usePartnerAuth()
  const { playroom } = usePartnerData()

  if (!user) {
    return null
  }

  return (
    <>
      <header className="partner-topbar">
        <h1 className="partner-topbar__title">Postavke</h1>
      </header>

      <section className="partner-panel partner-settingsAccount">
        <p className="partner-settingsAccount__kicker">Partner zona</p>
        <h2 className="partner-settingsAccount__playroom">{playroom.name}</h2>

        <dl className="partner-settingsAccount__facts">
          <div className="partner-settingsAccount__fact">
            <dt>Ime</dt>
            <dd>{user.name}</dd>
          </div>
          <div className="partner-settingsAccount__fact">
            <dt>Uloga</dt>
            <dd>{roleLabel(user.role)}</dd>
          </div>
          <div className="partner-settingsAccount__fact">
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          {playroom.phone ? (
            <div className="partner-settingsAccount__fact">
              <dt>Telefon igraonice</dt>
              <dd>{playroom.phone}</dd>
            </div>
          ) : null}
        </dl>

        <div className="partner-settingsAccount__links">
          <Link to="/partner/pomoc" className="partner-settingsAccount__link">
            Upute za rad
          </Link>
          <Link to="/" className="partner-settingsAccount__link">
            Natrag na VidimoSe.hr
          </Link>
        </div>
      </section>

      <PartnerSettingsAccountFooter />
    </>
  )
}

function PartnerOwnerSettings() {
  const { playroom, updatePlayroom, resetDemoData } = usePartnerData()
  const [form, setForm] = useState<Playroom>(playroom)
  const [toast, setToast] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    setForm(playroom)
  }, [playroom])

  const save = () => {
    updatePlayroom(form)
    setToast('Postavke spremljene')
  }

  return (
    <>
      <PartnerSetupTabs />

      <section className="partner-panel">
        <h2 className="partner-panel__title">Osnovni podaci</h2>
        <div className="partner-formGrid partner-formGrid--2">
          <label className="partner-field">
            <span className="partner-field__label">Naziv</span>
            <input className="pb-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="partner-field">
            <span className="partner-field__label">Email obavijesti</span>
            <input className="pb-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="partner-field">
            <span className="partner-field__label">Adresa</span>
            <input className="pb-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>
          <label className="partner-field">
            <span className="partner-field__label">Grad</span>
            <input className="pb-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </label>
          <label className="partner-field">
            <span className="partner-field__label">Telefon</span>
            <input className="pb-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label className="partner-field">
            <span className="partner-field__label">Valuta</span>
            <select className="pb-input" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              <option value="EUR">EUR (€)</option>
              <option value="HRK">HRK (kn)</option>
              <option value="USD">USD ($)</option>
            </select>
          </label>
        </div>
      </section>

      <section className="partner-panel">
        <h2 className="partner-panel__title">Termini i kapacitet</h2>
        <div className="partner-formGrid partner-formGrid--2">
          <label className="partner-field">
            <span className="partner-field__label">Trajanje slota (min)</span>
            <input
              className="pb-input"
              type="number"
              value={form.slotDurationMinutes}
              onChange={(e) => setForm({ ...form, slotDurationMinutes: Number(e.target.value) })}
            />
            <span className="partner-field__hint">Razmak između mogućih početaka rođendana u kalendaru.</span>
          </label>
          <label className="partner-field">
            <span className="partner-field__label">Pauza za čišćenje (min)</span>
            <input
              className="pb-input"
              type="number"
              value={form.cleanupBufferMinutes}
              onChange={(e) => setForm({ ...form, cleanupBufferMinutes: Number(e.target.value) })}
            />
            <span className="partner-field__hint">Vrijeme nakon eventa za pospremanje prije sljedećeg.</span>
          </label>
          <label className="partner-field">
            <span className="partner-field__label">Paralelnih rođendana</span>
            <input
              className="pb-input"
              type="number"
              value={form.maxParallelEvents}
              onChange={(e) => setForm({ ...form, maxParallelEvents: Number(e.target.value) })}
            />
            <span className="partner-field__hint">Koliko rođendana može teći istovremeno (broj prostora).</span>
          </label>
          <label className="partner-field">
            <span className="partner-field__label">Zadana akontacija ({form.currency})</span>
            <input
              className="pb-input"
              type="number"
              value={form.defaultDepositAmount}
              onChange={(e) => setForm({ ...form, defaultDepositAmount: Number(e.target.value) })}
            />
            <span className="partner-field__hint">Predloženi iznos akontacije pri novoj rezervaciji.</span>
          </label>
        </div>
        <div style={{ marginTop: '0.85rem' }}>
          <Button type="button" onClick={save}>
            Spremi postavke
          </Button>
        </div>
      </section>

      <section className="partner-panel partner-dangerZone">
        <div>
          <h2 className="partner-panel__title">Demo podaci</h2>
          <p className="partner-fieldHelp">Vrati sve na početne demo vrijednosti. Korisno za isprobavanje.</p>
        </div>
        <button type="button" className="partner-resetLink" onClick={() => setConfirmReset(true)}>
          Reset demo podataka
        </button>
      </section>

      <PartnerSettingsAccountFooter />

      <ConfirmDialog
        open={confirmReset}
        title="Resetirati demo podatke?"
        message="Sve rezervacije, kupci i postavke vraćaju se na početno stanje. Ovo se ne može poništiti."
        confirmLabel="Resetiraj"
        onConfirm={() => {
          resetDemoData()
          setConfirmReset(false)
          setToast('Demo podaci resetirani')
        }}
        onCancel={() => setConfirmReset(false)}
      />

      <PartnerToast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}

export default function PartnerSettingsPage() {
  const { isAnimator } = usePartnerAuth()

  if (isAnimator) {
    return <PartnerAnimatorSettings />
  }

  return <PartnerOwnerSettings />
}
