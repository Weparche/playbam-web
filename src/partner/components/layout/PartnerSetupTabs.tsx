import { NavLink } from 'react-router-dom'

const SETUP_TABS = [
  { to: '/partner/customers', label: 'Kupci' },
  { to: '/partner/packages', label: 'Paketi' },
  { to: '/partner/addons', label: 'Dodaci' },
  { to: '/partner/animators', label: 'Animatori' },
  { to: '/partner/settings', label: 'Postavke' },
]

export default function PartnerSetupTabs() {
  return (
    <>
      <header className="partner-topbar">
        <h1 className="partner-topbar__title">Ponuda i postavke</h1>
      </header>
      <nav className="partner-setupTabs" aria-label="Ponuda i postavke">
        {SETUP_TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end
            className={({ isActive }) => `partner-setupTab${isActive ? ' is-active' : ''}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
