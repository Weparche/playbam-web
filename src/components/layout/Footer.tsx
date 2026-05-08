import { Link } from 'react-router-dom'

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
            <div className="pb-footer__label">Nepar</div>
            <div className="pb-footer__partner">
              <img
                src="/nepar_logo.png"
                alt=""
                width={44}
                height={44}
                decoding="async"
                className="pb-footer__partner-img pb-footer__partner-img--logo"
              />
              <img
                src="/nepar.png"
                alt=""
                decoding="async"
                className="pb-footer__partner-img pb-footer__partner-img--mark"
              />
            </div>
            <a
              className="pb-footer__link"
              href="https://nepar.hr"
              target="_blank"
              rel="noopener noreferrer"
            >
              O nama
            </a>
          </div>
        </div>

        <section className="pb-footer__impressum" aria-labelledby="pb-footer-impressum-heading">
          <h2 id="pb-footer-impressum-heading" className="pb-footer__impressum-title">
            Impressum
          </h2>
          <nav className="pb-footer__impressum-nav" aria-label="Pravne poveznice">
            <a href="#" className="pb-footer__impressum-link">
              Uvjeti korištenja
            </a>
            <a href="#" className="pb-footer__impressum-link">
              Privatnost
            </a>
            <a href="#" className="pb-footer__impressum-link">
              Kolačići
            </a>
          </nav>
          <h3 id="pb-footer-legal-heading" className="pb-footer__legal-title">
            Poslovni podaci
          </h3>
          <p className="pb-footer__legal-text">
            <a
              href="https://nepar.hr"
              className="pb-footer__legal-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Nepar, obrt za digitalna rješenja i usluge
            </a>
          </p>
          <ul className="pb-footer__legal-list">
            <li>vl. Ivan Gorupić</li>
            <li>MBO: 99267101</li>
            <li>
              <a href="mailto:nepar@nepar.hr" className="pb-footer__legal-link">
                nepar@nepar.hr
              </a>
            </li>
          </ul>
        </section>
      </div>
    </footer>
  )
}
