import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Button from '../../components/ui/Button'
import { usePartnerAuth } from '../context/PartnerAuthContext'
import { usePartnerData } from '../context/PartnerDataContext'
import type { Playroom } from '../types'

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

  useEffect(() => {
    setForm(playroom)
  }, [playroom])

  return (
    <>
      <header className="partner-topbar">
        <h1 className="partner-topbar__title">Postavke igraonice</h1>
      </header>
      <section className="partner-panel">
        <div className="partner-formGrid partner-formGrid--2">
          <label className="pb-formField">
            <span className="pb-formLabel">Naziv</span>
            <input className="pb-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="pb-formField">
            <span className="pb-formLabel">Email obavijesti</span>
            <input className="pb-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="pb-formField">
            <span className="pb-formLabel">Adresa</span>
            <input className="pb-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </label>
          <label className="pb-formField">
            <span className="pb-formLabel">Grad</span>
            <input className="pb-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </label>
          <label className="pb-formField">
            <span className="pb-formLabel">Telefon</span>
            <input className="pb-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label className="pb-formField">
            <span className="pb-formLabel">Trajanje slotova (min)</span>
            <input
              className="pb-input"
              type="number"
              value={form.slotDurationMinutes}
              onChange={(e) => setForm({ ...form, slotDurationMinutes: Number(e.target.value) })}
            />
          </label>
          <label className="pb-formField">
            <span className="pb-formLabel">Buffer (min)</span>
            <input
              className="pb-input"
              type="number"
              value={form.cleanupBufferMinutes}
              onChange={(e) => setForm({ ...form, cleanupBufferMinutes: Number(e.target.value) })}
            />
          </label>
          <label className="pb-formField">
            <span className="pb-formLabel">Max paralelnih rođendana</span>
            <input
              className="pb-input"
              type="number"
              value={form.maxParallelEvents}
              onChange={(e) => setForm({ ...form, maxParallelEvents: Number(e.target.value) })}
            />
          </label>
          <label className="pb-formField">
            <span className="pb-formLabel">Akontacija</span>
            <input
              className="pb-input"
              type="number"
              value={form.defaultDepositAmount}
              onChange={(e) => setForm({ ...form, defaultDepositAmount: Number(e.target.value) })}
            />
          </label>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          <Button type="button" onClick={() => updatePlayroom(form)}>
            Spremi postavke
          </Button>
          <Button variant="ghost" type="button" onClick={resetDemoData}>
            Reset demo podataka
          </Button>
        </div>
      </section>

      <PartnerSettingsAccountFooter />
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
