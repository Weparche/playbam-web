import { Link } from 'react-router-dom'

import Footer from '../components/landing/Footer'
import Navbar from '../components/landing/Navbar'

export default function ContactPage() {
  return (
    <div className="ew-landing">
      <a className="ew-skip-link" href="#main">Preskoči na sadržaj</a>
      <Navbar opaque />

      <main id="main" className="ew-contact-main">
        <section className="ew-contact ew-grain" aria-labelledby="contact-title">
          <div className="ew-container">
            <nav className="ew-contact__breadcrumb" aria-label="Putanja">
              <Link to="/" className="ew-contact__breadcrumb-link">Početna</Link>
              <span className="ew-contact__breadcrumb-sep">›</span>
              <span className="ew-contact__breadcrumb-current">Kontakt</span>
            </nav>
            <h1 id="contact-title" className="ew-contact__title ew-h1">
              Kontakt
            </h1>
            <p className="ew-body-lg ew-contact__lead">
              Imaš pitanje ili prijedlog za VidimoSe? Javi nam se na e‑poštu — odgovaramo što prije možemo.
            </p>
            <div className="ew-contact__card">
              <p className="ew-contact__label">Opći kontakt</p>
              <a className="ew-contact__mailto" href="mailto:info@vidimose.hr">
                info@vidimose.hr
              </a>
              <p className="ew-contact__note">
                U predmet poruke kratak opis problema ili ideje omogući nam brži odgovor.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
