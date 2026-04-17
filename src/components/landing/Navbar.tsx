import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type NavItem = { label: string; href: string }

const navItems: NavItem[] = [
  { label: 'Pozivnice', href: '#pozivnice' },
  { label: 'Igraonice', href: '#igraonice' },
  { label: 'Kako radi', href: '#kako-radi' },
  { label: 'Prijava', href: '#' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <>
      <header className={`ew-navbar${scrolled ? ' ew-navbar--scrolled' : ''}`}>
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
              <a key={item.href} href={item.href} className="ew-navbar__link">
                {item.label}
              </a>
            ))}
            <Link to="/kreiraj-pozivnicu" className="ew-navbar__cta">
              Napravi pozivnicu
            </Link>
          </div>

          <Link to="/kreiraj-pozivnicu" className="ew-navbar__cta ew-navbar__cta--mobileBar">
            Napravi pozivnicu
          </Link>
        </div>
      </header>

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
              <a key={item.href} href={item.href} className="ew-navbar__sheet-link" onClick={closeMobile}>
                {item.label}
              </a>
            ))}
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
