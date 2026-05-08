import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import Footer from './Footer'
import Navbar from './Navbar'

const LEGAL_LINKS = [
  { to: '/impressum', label: 'Impressum' },
  { to: '/uvjeti-koristenja', label: 'Uvjeti korištenja' },
  { to: '/privatnost', label: 'Zaštita privatnosti' },
  { to: '/kolacici', label: 'Kolačići' },
] as const

type Props = {
  title: string
  breadcrumbLabel: string
  children: ReactNode
}

export default function LegalDocLayout({ title, breadcrumbLabel, children }: Props) {
  return (
    <div className="ew-landing">
      <a className="ew-skip-link" href="#main">
        Preskoči na sadržaj
      </a>
      <Navbar opaque />

      <main id="main" className="ew-legal-main">
        <section className="ew-grain ew-legal" aria-labelledby="legal-doc-title">
          <div className="ew-container">
            <nav className="ew-contact__breadcrumb" aria-label="Putanja">
              <Link to="/" className="ew-contact__breadcrumb-link">
                Početna
              </Link>
              <span className="ew-contact__breadcrumb-sep">›</span>
              <span className="ew-contact__breadcrumb-current">{breadcrumbLabel}</span>
            </nav>

            <h1 id="legal-doc-title" className="ew-legal__title ew-h1">
              {title}
            </h1>

            <nav className="ew-legal__subnav" aria-label="Pravni dokumenti">
              {LEGAL_LINKS.map(({ to, label }) => (
                <Link key={to} to={to} className="ew-legal__subnav-link">
                  {label}
                </Link>
              ))}
            </nav>

            <div className="ew-legal__body">{children}</div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
