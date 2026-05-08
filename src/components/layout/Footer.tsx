import { Link } from 'react-router-dom'

const legalLinks = [
  { to: '/impressum', label: 'Impressum' },
  { to: '/uvjeti-koristenja', label: 'Uvjeti korištenja' },
  { to: '/privatnost', label: 'Privatnost' },
  { to: '/kolacici', label: 'Kolačići' },
] as const

export default function Footer() {
  return (
    <footer className="pb-footer" id="footer">
      <div className="pb-container pb-footer__wrap">
        <div className="pb-footer__inner">
          <div className="pb-footer__brandWrap">
            <div className="pb-footer__brand">VidimoSe</div>
            <p className="pb-footer__text">
              Jednostavniji početak organizacije dječjeg rođendana.
            </p>
          </div>

          <div className="pb-footer__col">
            <div className="pb-footer__label">Navigacija</div>
            <a className="pb-footer__link" href="/#pozivnice">
              Pozivnice
            </a>
            <a className="pb-footer__link" href="/#igraonice">
              Igraonice
            </a>
            <a className="pb-footer__link" href="/#cesta-pitanja">
              Česta pitanja
            </a>
            <Link className="pb-footer__link" to="/kontakt">
              Kontakt
            </Link>
          </div>

          <div className="pb-footer__partner-col">
            <div className="pb-footer__label">Izrada</div>
            <a
              className="pb-footer__link"
              href="https://nepar.hr"
              target="_blank"
              rel="noopener noreferrer"
            >
              nepar.hr
            </a>
          </div>
        </div>

        <nav className="pb-footer__legal-row" aria-label="Pravne informacije">
          {legalLinks.map(({ to, label }, i) => (
            <span key={to} className="pb-footer__legal-row-item">
              {i > 0 ? <span className="pb-footer__legal-row-sep" aria-hidden="true">·</span> : null}
              <Link to={to} className="pb-footer__legal-row-link">
                {label}
              </Link>
            </span>
          ))}
        </nav>
      </div>
    </footer>
  )
}
