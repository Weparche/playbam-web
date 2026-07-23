import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, Navigate, useLocation } from 'react-router-dom'

import { usePartnerAuth } from '../../context/PartnerAuthContext'
import { PartnerDataProvider, usePartnerData } from '../../context/PartnerDataContext'
import PartnerIcon, { type IconName } from '../ui/PartnerIcon'
import PartnerSheet from '../ui/PartnerSheet'
import PartnerCommandPalette from '../PartnerCommandPalette'
import '../../styles/partner.css'

type NavItem = {
  to: string
  label: string
  icon: IconName
  end?: boolean
}

type NavConfig = {
  daily: NavItem[]
  setup: NavItem[]
  mobilePrimary: NavItem[]
  showFab: boolean
}

const OWNER_NAV: NavConfig = {
  daily: [
    { to: '/partner', label: 'Nadzorna ploča', icon: 'today', end: true },
    { to: '/partner/calendar', label: 'Kalendar', icon: 'calendar' },
    { to: '/partner/reservations', label: 'Rezervacije', icon: 'reservations' },
  ],
  setup: [
    { to: '/partner/customers', label: 'Kupci', icon: 'customers' },
    { to: '/partner/packages', label: 'Paketi', icon: 'packages' },
    { to: '/partner/addons', label: 'Dodaci', icon: 'addons' },
    { to: '/partner/animators', label: 'Animatori', icon: 'animators' },
    { to: '/partner/settings', label: 'Postavke', icon: 'settings' },
    { to: '/partner/pomoc', label: 'Pomoć', icon: 'help' },
    { to: '/partner/prezentacija', label: 'Prezentacija', icon: 'presentation' },
  ],
  mobilePrimary: [
    { to: '/partner', label: 'Nadzorna ploča', icon: 'today', end: true },
    { to: '/partner/calendar', label: 'Kalendar', icon: 'calendar' },
    { to: '/partner/reservations', label: 'Rezervacije', icon: 'reservations' },
  ],
  showFab: true,
}

const ANIMATOR_NAV: NavConfig = {
  daily: [
    { to: '/partner', label: 'Moji eventi', icon: 'today', end: true },
    { to: '/partner/calendar', label: 'Kalendar', icon: 'calendar' },
  ],
  setup: [
    { to: '/partner/settings', label: 'Postavke', icon: 'settings' },
    { to: '/partner/pomoc', label: 'Pomoć', icon: 'help' },
  ],
  mobilePrimary: [
    { to: '/partner', label: 'Eventi', icon: 'today', end: true },
    { to: '/partner/calendar', label: 'Kalendar', icon: 'calendar' },
    { to: '/partner/settings', label: 'Postavke', icon: 'settings' },
  ],
  showFab: false,
}

function roleLabel(role: string) {
  if (role === 'owner') return 'Vlasnik'
  if (role === 'staff') return 'Osoblje'
  if (role === 'animator') return 'Animator'
  if (role === 'super_admin') return 'Admin'
  return role
}

function PartnerChrome() {
  const { user, logout, isAnimator } = usePartnerAuth()
  const { playroom } = usePartnerData()
  const location = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  const nav = isAnimator ? ANIMATOR_NAV : OWNER_NAV
  const paletteNav = [...nav.daily, ...nav.setup]

  // Global ⌘K / Ctrl+K (and "/" when not typing) opens the command palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setPaletteOpen((v) => !v)
        return
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const el = e.target as HTMLElement | null
        const tag = el?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable) return
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  if (!user) {
    return <Navigate to="/partner/login" replace />
  }

  const moreActive = nav.setup.some(
    (item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`),
  )

  // Detail pages and Help already expose their primary action in context.
  const hideFab =
    /^\/partner\/reservations\/[^/]+$/.test(location.pathname) ||
    location.pathname === '/partner/pomoc' ||
    location.pathname === '/partner/prezentacija'
  const showFab = nav.showFab && !hideFab

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
          </div>

          {nav.showFab ? (
            <Link to="/partner/reservations?new=1" className="partner-sidebar__cta pb-btn pb-btn-primary">
              <PartnerIcon name="plus" size={18} />
              <span>Nova rezervacija</span>
            </Link>
          ) : null}

          <button type="button" className="partner-kbdHint" onClick={() => setPaletteOpen(true)}>
            <PartnerIcon name="reservations" size={16} />
            <span>Brza naredba</span>
            <span className="partner-kbdHint__keys">
              <kbd className="partner-kbd">⌘</kbd>
              <kbd className="partner-kbd">K</kbd>
            </span>
          </button>

          <nav className="partner-nav" aria-label="Partner navigacija">
            <p className="partner-nav__groupLabel">Svakodnevno</p>
            {nav.daily.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `partner-nav__link${isActive ? ' is-active' : ''}`}
              >
                <PartnerIcon name={link.icon} size={20} />
                <span>{link.label}</span>
              </NavLink>
            ))}

            <p className="partner-nav__groupLabel">{isAnimator ? 'Račun' : 'Ponuda i postavke'}</p>
            {nav.setup.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `partner-nav__link partner-nav__link--muted${isActive ? ' is-active' : ''}`}
              >
                <PartnerIcon name={link.icon} size={20} />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="partner-sidebar__footer">
            <p className="partner-sidebar__user">{user.name}</p>
            <span className="partner-roleBadge">{roleLabel(user.role)}</span>
            <button type="button" className="partner-sidebar__logout" onClick={logout}>
              <PartnerIcon name="logout" size={16} />
              <span>Odjava</span>
            </button>
          </div>
        </aside>

        <div className="partner-main">
          <div className="partner-mobileHeader">
            <Link to="/" className="partner-mobileHeader__logo" aria-label="VidimoSe.hr">
              <img src="/logo.png" alt="" width={120} height={32} />
            </Link>
            <div className="partner-mobileHeader__meta">{playroom.name}</div>
          </div>
          <div className="partner-content">
            <Outlet context={{ isOwnerLike: !isAnimator, isAnimator, user }} />
          </div>
        </div>
      </div>

      {showFab ? (
        <Link to="/partner/reservations?new=1" className="partner-fab" aria-label="Nova rezervacija">
          <PartnerIcon name="plus" size={24} />
        </Link>
      ) : null}

      <nav className="partner-mobileNav" aria-label="Partner mobilna navigacija">
        {nav.mobilePrimary.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `partner-mobileNav__link${isActive ? ' is-active' : ''}`}
          >
            <PartnerIcon name={link.icon} size={22} />
            <span>{link.label}</span>
          </NavLink>
        ))}
        {!isAnimator ? (
          <button
            type="button"
            className={`partner-mobileNav__link partner-mobileNav__more${moreActive ? ' is-active' : ''}`}
            onClick={() => setMoreOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
          >
            <PartnerIcon name="more" size={22} />
            <span>Više</span>
          </button>
        ) : null}
      </nav>

      <PartnerSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title="Ponuda i postavke"
        description="Paketi, dodaci, animatori i postavke igraonice."
        placement="right"
      >
        <nav className="partner-moreMenu" aria-label="Dodatna navigacija">
          {nav.setup.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `partner-moreMenu__link${isActive ? ' is-active' : ''}`}
              onClick={() => setMoreOpen(false)}
            >
              <span className="partner-moreMenu__icon">
                <PartnerIcon name={link.icon} size={22} />
              </span>
              <span className="partner-moreMenu__label">{link.label}</span>
              <PartnerIcon name="chevronRight" size={18} />
            </NavLink>
          ))}
          <Link to="/" className="partner-moreMenu__link" onClick={() => setMoreOpen(false)}>
            <span className="partner-moreMenu__icon">
              <PartnerIcon name="home" size={22} />
            </span>
            <span className="partner-moreMenu__label">Natrag na VidimoSe.hr</span>
            <PartnerIcon name="chevronRight" size={18} />
          </Link>
        </nav>
        <button type="button" className="partner-moreMenu__logout" onClick={() => { setMoreOpen(false); logout() }}>
          <PartnerIcon name="logout" size={18} />
          <span>Odjava</span>
        </button>
      </PartnerSheet>

      <PartnerCommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} navItems={paletteNav} />
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
