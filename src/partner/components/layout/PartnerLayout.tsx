import { Link, NavLink, Outlet, Navigate } from 'react-router-dom'

import Button from '../../../components/ui/Button'
import { usePartnerAuth } from '../../context/PartnerAuthContext'
import { PartnerDataProvider, usePartnerData } from '../../context/PartnerDataContext'
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
  const { playroom } = usePartnerData()
  const links = isAnimator ? ANIMATOR_LINKS : OWNER_LINKS

  if (!user) {
    return <Navigate to="/partner/login" replace />
  }

  return (
    <div className="partner-app">
      <div className="partner-shell">
        <aside className="partner-sidebar">
          <div className="partner-brand">
            <Link to="/" className="partner-brand__logo" aria-label="VidimoSe.hr — početna">
              <img src="/logo.png" alt="" width={160} height={42} />
            </Link>
            <p className="partner-brand__kicker">Partner zona</p>
            <h1 className="partner-brand__title">{playroom.name}</h1>
            <p className="partner-brand__sub">Upravljanje rođendanima</p>
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

          <div className="partner-sidebar__footer">
            <p className="partner-sidebar__user">{user.name}</p>
            <span className="partner-roleBadge">{user.role}</span>
            <div style={{ marginTop: '0.75rem' }}>
              <Button variant="ghost" type="button" onClick={logout}>
                Odjava
              </Button>
            </div>
          </div>
        </aside>

        <div className="partner-main">
          <div className="partner-mobileHeader">
            <Link to="/" className="partner-mobileHeader__logo" aria-label="VidimoSe.hr">
              <img src="/logo.png" alt="" width={120} height={32} />
            </Link>
            <div className="partner-mobileHeader__meta">{playroom.name}</div>
          </div>
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
