import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { readGoogleAuthCallbackState } from '../../lib/invitationApi'
import OtpLoginModal from '../auth/OtpLoginModal'

type NavItem = { label: string } & ({ href: string; to?: never } | { to: string; href?: never })

const navItems: NavItem[] = [
  { label: 'Pozivnice', href: '/#pozivnice' },
  { label: 'Igraonice', to: '/igraonice' },
  { label: 'Česta pitanja', href: '/#cesta-pitanja' },
]

export default function Navbar({
  opaque = false,
  onLoginClick,
}: {
  opaque?: boolean
  onLoginClick?: () => void
}) {
  const { session, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMobile = useCallback(() => setMobileOpen(false), [])
  const openLogin = useCallback(() => {
    if (onLoginClick) {
      onLoginClick()
      return
    }
    setLoginOpen(true)
  }, [onLoginClick])

  useEffect(() => {
    if (onLoginClick) {
      return
    }
    const callbackState = readGoogleAuthCallbackState()
    if (callbackState.status === 'callback' && callbackState.modal === 'otp') {
      queueMicrotask(() => setLoginOpen(true))
    }
  }, [onLoginClick])

  return (
    <>
      <header className={`ew-navbar${opaque || scrolled ? ' ew-navbar--scrolled' : ''}`}>
        <div className="ew-navbar__inner">
          <div className="ew-navbar__leading">
            <button
              className="ew-navbar__hamburger"
              type="button"
              aria-label={mobileOpen ? 'Zatvori izbornik' : 'Otvori izbornik'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span /><span /><span />
            </button>
            <Link to="/" className="ew-navbar__logo ew-navbar__logo--mark" aria-label="VidimoSe.hr — početna">
              <img src="/logo.png" alt="" className="ew-navbar__logo-img" width={200} height={52} />
            </Link>
          </div>

          <div className="ew-navbar__menu">
            {navItems.map((item) => (
              item.to
                ? <Link key={item.to} to={item.to} className="ew-navbar__link">{item.label}</Link>
                : <a key={item.href} href={item.href} className="ew-navbar__link">{item.label}</a>
            ))}
            <Link to="/kreiraj-pozivnicu" className="ew-navbar__cta">
              Napravi pozivnicu
            </Link>
            {session ? (
              <div className="ew-navbar__auth">
                <Link to="/moj-vidimose" className="ew-navbar__auth-btn ew-navbar__auth-btn--account">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  Moj VidimoSe
                </Link>
                <button type="button" className="ew-navbar__auth-btn ew-navbar__auth-btn--logout" onClick={logout}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Odjava
                </button>
              </div>
            ) : (
              <button type="button" className="ew-navbar__auth-btn ew-navbar__auth-btn--login" onClick={openLogin}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                Prijava
              </button>
            )}
          </div>

          {session ? (
            <Link to="/moj-vidimose" className="ew-navbar__cta ew-navbar__cta--mobileBar">
              Moj VidimoSe
            </Link>
          ) : (
            <button type="button" className="ew-navbar__cta ew-navbar__cta--mobileBar" onClick={openLogin}>
              Prijava
            </button>
          )}
        </div>
      </header>

      {!onLoginClick ? (
        <OtpLoginModal
          open={loginOpen}
          onSuccess={() => setLoginOpen(false)}
          onClose={() => setLoginOpen(false)}
        />
      ) : null}

      {mobileOpen && (
        <div className="ew-navbar__sheet" role="dialog" aria-modal="true" aria-label="Navigacija">
          <div className="ew-navbar__sheet-header">
            <Link to="/" className="ew-navbar__logo ew-navbar__logo--mark" aria-label="VidimoSe.hr — početna" onClick={closeMobile}>
              <img src="/logo.png" alt="" className="ew-navbar__logo-img" width={200} height={52} />
            </Link>
            <button className="ew-navbar__sheet-close" onClick={closeMobile} aria-label="Zatvori">
              ✕
            </button>
          </div>
          <nav className="ew-navbar__sheet-nav">
            {navItems.map((item) => (
              item.to
                ? <Link key={item.to} to={item.to} className="ew-navbar__sheet-link" onClick={closeMobile}>{item.label}</Link>
                : <a key={item.href} href={item.href} className="ew-navbar__sheet-link" onClick={closeMobile}>{item.label}</a>
            ))}
            {session ? (
              <>
                <Link to="/moj-vidimose" className="ew-navbar__sheet-link ew-navbar__sheet-link--auth" onClick={closeMobile}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  Moj VidimoSe
                </Link>
                <button type="button" className="ew-navbar__sheet-link ew-navbar__sheet-link--auth" onClick={() => { logout(); closeMobile() }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Odjava
                </button>
              </>
            ) : (
              <button type="button" className="ew-navbar__sheet-link ew-navbar__sheet-link--auth" onClick={() => { closeMobile(); openLogin() }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                Prijava
              </button>
            )}
          </nav>
          <div className="ew-navbar__sheet-cta">
            <Link to="/kreiraj-pozivnicu" className="ew-btn-primary" onClick={closeMobile} style={{ width: '100%', textAlign: 'center' }}>
              Napravi pozivnicu
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
