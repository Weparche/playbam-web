import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import LinkButton from '../ui/LinkButton'

type NavItem = {
  label: string
  href: string
}

const navItems: NavItem[] = [
  { label: 'Kako radi', href: '/#kako-radi' },
  { label: 'Pozivnice', href: '/#pozivnice' },
  { label: 'Igraonice', href: '/#igraonice' },
  { label: 'Zašto Playbam', href: '/#zasto-playbam' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const items = useMemo(() => navItems, [])

  return (
    <header className="pb-nav">
      <div className="pb-container pb-nav__inner">
        <Link to="/" className="pb-brand" aria-label="Playbam">
          <img src="/logo.png" alt="Playbam" className="pb-brand__mark" />
        </Link>

        <nav className="pb-nav__links" aria-label="Glavna navigacija">
          {items.map((it) => (
            <a key={it.href} href={it.href} className="pb-nav__link">
              {it.label}
            </a>
          ))}
        </nav>

        <div className="pb-nav__actions">
          <a href="/#igraonice" className="pb-nav__demoLink">
            Igraonice
          </a>
          <Link to="/kreiraj-pozivnicu" className="pb-nav__download">
            Izradi pozivnicu
          </Link>
        </div>

        <button
          className="pb-nav__hamburger"
          type="button"
          aria-label={open ? 'Zatvori izbornik' : 'Otvori izbornik'}
          aria-expanded={open ? 'true' : 'false'}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {open ? (
        <div className="pb-nav__mobile">
          <div className="pb-container">
            <div className="pb-nav__mobileGrid">
              {items.map((it) => (
                <a
                  key={it.href}
                  href={it.href}
                  className="pb-nav__mobileLink"
                  onClick={() => setOpen(false)}
                >
                  {it.label}
                </a>
              ))}
              <LinkButton
                variant="primary"
                href="/#igraonice"
                onClick={() => setOpen(false)}
                className="pb-nav__mobileBtn"
              >
                Pretraži igraonice
              </LinkButton>
              <LinkButton
                variant="amber"
                href="/kreiraj-pozivnicu"
                onClick={() => setOpen(false)}
                className="pb-nav__mobileBtn"
              >
                Izradi pozivnicu
              </LinkButton>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
