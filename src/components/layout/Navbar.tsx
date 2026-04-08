import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import LinkButton from '../ui/LinkButton'

type NavItem = {
  label: string
  href: string
}

const navItems: NavItem[] = [
  { label: 'Kako radi', href: '#kako-radi' },
  { label: 'Što dobivaš', href: '#sto-dobivas' },
  { label: 'Pozivnice', href: '#digitalne-pozivnice' },
  { label: 'FAQ', href: '#faq' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const items = useMemo(() => navItems, [])

  return (
    <header className="pb-nav">
      <div className="pb-container pb-nav__inner">
        <div className="pb-brand" aria-label="Playbam.hr">
          <img src="/playbam-logo.png" alt="Playbam.hr" className="pb-brand__mark" />
        </div>

        <nav className="pb-nav__links" aria-label="Glavna navigacija">
          {items.map((it) => (
            <a key={it.href} href={it.href} className="pb-nav__link">
              {it.label}
            </a>
          ))}
        </nav>

        <div className="pb-nav__actions">
          <Link to="/pozivnica-demo" className="pb-nav__demoLink">
            Pogledaj demo
          </Link>
          <Link to="/kreiraj-pozivnicu" className="pb-nav__download">
            Kreiraj pozivnicu
          </Link>
        </div>

        <button
          className="pb-nav__hamburger"
          type="button"
          aria-label={open ? 'Zatvori izbornik' : 'Otvori izbornik'}
          aria-expanded={open ? 'true' : 'false'}
          onClick={() => setOpen((v) => !v)}
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
                href="/pozivnica-demo"
                onClick={() => setOpen(false)}
                className="pb-nav__mobileBtn"
              >
                Pogledaj demo pozivnicu
              </LinkButton>
              <LinkButton
                variant="amber"
                href="/kreiraj-pozivnicu"
                onClick={() => setOpen(false)}
                className="pb-nav__mobileBtn"
              >
                Kreiraj pozivnicu
              </LinkButton>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
