import { Link, NavLink, Outlet, Navigate } from 'react-router-dom'

import Button from '../../../components/ui/Button'
import { usePartnerAuth } from '../../context/PartnerAuthContext'
import { PartnerDataProvider } from '../../context/PartnerDataContext'
import '../../styles/partner.css'

const OWNER_LINKS = [
  { to: '/partner', label: 'Pregled', end: true },
  { to: '/partner/calendar', label: 'Kalendar' },
  { to: '/partner/reservations', label: 'Rezervacije' },
  { to: '/partner/packages', label: 'Paketi' },
  { to: '/partner/addons', label: 'Dodaci' },
  { to: '/partner/animators', label: 'Animatori' },
  { to: '/partner/customers', label: 'Kupci' },
  { to: '/partner/settings', label: 'Postavke' },
]

const ANIMATOR_LINKS = [
  { to: '/partner', label: 'Moji eventi', end: true },
  { to: '/partner/calendar', label: 'Kalendar' },
]

function PartnerChrome() {
  const { user, logout, isOwnerLike, isAnimator } = usePartnerAuth()
  const links = isAnimator ? ANIMATOR_LINKS : OWNER_LINKS

  if (!user) {
    return <Navigate to="/partner/login" replace />
  }

  return (
    <div className="partner-app">
      <div className="partner-shell">
        <aside className="partner-sidebar">
          <div className="partner-brand">
            <p className="partner-brand__title">Partner Console</p>
            <p className="partner-brand__sub">VidimoSe.hr</p>
          </div>
          <nav className="partner-nav" aria-label="Partner navigacija">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `partner-nav__link${isActive ? ' is-active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div style={{ marginTop: 'auto', padding: '0 0.65rem' }}>
            <p className="partner-topbar__meta">{user.name}</p>
            <span className="partner-roleBadge">{user.role}</span>
            <div style={{ marginTop: '0.75rem' }}>
              <Button variant="ghost" type="button" onClick={logout}>
                Odjava
              </Button>
            </div>
          </div>
        </aside>

        <div className="partner-main">
          <Outlet context={{ isOwnerLike, isAnimator, user }} />
        </div>
      </div>

      <nav className="partner-mobileNav" aria-label="Partner mobilna navigacija">
        {links.slice(0, 4).map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `partner-mobileNav__link${isActive ? ' is-active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
        {!isAnimator ? (
          <Link to="/partner/settings" className="partner-mobileNav__link">
            Više
          </Link>
        ) : null}
      </nav>
    </div>
  )
}

export default function PartnerLayout() {
  return (
    <PartnerDataProvider>
      <PartnerChrome />
    </PartnerDataProvider>
  )
}
