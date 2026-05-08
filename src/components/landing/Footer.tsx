import { Link } from 'react-router-dom'

type FooterColumn = {
  title: string
  links: { label: string; href: string; router?: boolean }[]
}

const columns: FooterColumn[] = [
  {
    title: 'Proizvod',
    links: [
      { label: 'Pozivnice', href: '/#pozivnice', router: true },
      { label: 'Igraonice', href: '/#igraonice', router: true },
      { label: 'Kako radi', href: '/#kako-radi', router: true },
    ],
  },
  {
    title: 'Tvrtka',
    links: [
      { label: 'O nama', href: '#' },
      { label: 'Kontakt', href: '/kontakt', router: true },
    ],
  },
  {
    title: 'Pravno',
    links: [
      { label: 'Uvjeti korištenja', href: '#' },
      { label: 'Privatnost', href: '#' },
      { label: 'Kolačići', href: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="ew-footer">
      <div className="ew-container">
        <div className="ew-footer__grid">
          <div>
            <Link to="/" className="ew-footer__brand">VidimoSe</Link>
            <p className="ew-footer__desc">
              Pozivnice i igraonice za dječje rođendane u Hrvatskoj. Sve na jednom mjestu.
            </p>
          </div>
          {columns.map(col => (
            <div key={col.title}>
              <div className="ew-footer__col-title">{col.title}</div>
              {col.links.map(link =>
                link.router ? (
                  <Link key={link.label} to={link.href} className="ew-footer__link">
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.label} href={link.href} className="ew-footer__link">
                    {link.label}
                  </a>
                ),
              )}
            </div>
          ))}
        </div>

        <section className="ew-footer__legal" aria-labelledby="footer-legal-heading">
          <h2 id="footer-legal-heading" className="ew-footer__legal-title">
            Poslovni podaci
          </h2>
          <p className="ew-footer__legal-line">
            <a
              href="https://nepar.hr"
              className="ew-footer__legal-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Nepar, obrt za digitalna rješenja i usluge
            </a>
          </p>
          <ul className="ew-footer__legal-list">
            <li>vl. Ivan Gorupić</li>
            <li>MBO: 99267101</li>
            <li>
              <a href="mailto:nepar@nepar.hr" className="ew-footer__legal-link">nepar@nepar.hr</a>
            </li>
          </ul>
        </section>

        <div className="ew-footer__bottom">
          <span>© 2026 VidimoSe.hr · Hrvatska · EUR</span>
          <div className="ew-footer__socials" aria-label="Društvene mreže">
            <a href="#" aria-label="Instagram">
              <svg className="ew-footer__social-icon" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="17" cy="7" r="1" fill="currentColor" />
              </svg>
            </a>
            <a href="#" aria-label="Facebook">
              <svg className="ew-footer__social-icon" viewBox="0 0 24 24" fill="none">
                <path d="M14 8h2V5h-2a3 3 0 0 0-3 3v2H9v3h2v6h3v-6h2l1-3h-3V8.5c0-.3.2-.5.5-.5H14Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
