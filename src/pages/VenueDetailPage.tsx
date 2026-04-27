import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import Footer from '../components/landing/Footer'
import Navbar from '../components/landing/Navbar'
import { venues } from '../lib/landing-data'

const amenityIcons: Record<string, string> = {
  Parking: '🅿',
  Ugostiteljstvo: '🍕',
  Animatori: '🎉',
  'Torta po narudžbi': '🎂',
  Svlačionice: '👕',
  Klima: '❄',
  'Wi-Fi': '📶',
  'WC za bebe': '🚿',
  'Kuhinja za bebe': '🍼',
  Dojilište: '🤱',
  'Kafić za roditelje': '☕',
  'Tematske sobe': '🏰',
  'Roštilj terasa': '🔥',
  'Foto zid': '📸',
  'Foto kutić': '📸',
  'Kreativne radionice': '🎨',
  'Javni prijevoz': '🚌',
  'Parking u blizini': '🅿',
  'Foto rekviziti': '📸',
  'Trampolini': '🏃',
  'Video nadzor': '📹',
  'TÜV certifikat': '✅',
  'PS4 i VR zone': '🎮',
  'Karaoke': '🎤',
  'Bubble/Fog Machine': '✨',
  'Ekskluzivni prostor': '🔒',
  'Air Hockey': '🏒',
  'Labirinti': '🌀',
  'Karting staza': '🏎',
  'Escape room': '🔐',
  'Restoran': '🍽',
  'VR simulator': '🕹',
  'Mini Cars': '🚗',
  'DJ oprema': '🎵',
  'Face painting': '🎨',
}

export default function VenueDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const venue = venues.find(v => v.slug === slug)

  const [activePhoto, setActivePhoto] = useState(0)

  if (!venue) return <Navigate to="/igraonice" replace />

  const allPhotos = [venue.coverPhoto, ...venue.photos]

  return (
    <div className="ew-landing">
      <a className="ew-skip-link" href="#main">Preskoči na sadržaj</a>
      <Navbar opaque />

      <main id="main">
        {/* Breadcrumb */}
        <div className="ew-vd-breadcrumb">
          <div className="ew-container">
            <Link to="/" className="ew-vd-breadcrumb__link">Početna</Link>
            <span className="ew-vd-breadcrumb__sep">›</span>
            <Link to="/igraonice" className="ew-vd-breadcrumb__link">Igraonice</Link>
            <span className="ew-vd-breadcrumb__sep">›</span>
            <span className="ew-vd-breadcrumb__current">{venue.name}</span>
          </div>
        </div>

        {/* Hero photo */}
        <div className="ew-vd-hero">
          <img
            src={allPhotos[activePhoto]}
            alt={`${venue.name} — fotografija ${activePhoto + 1}`}
            className="ew-vd-hero__img"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Photo gallery strip */}
        <div className="ew-vd-gallery">
          <div className="ew-container">
            <div className="ew-vd-gallery__strip">
              {allPhotos.map((src, i) => (
                <button
                  key={i}
                  className={`ew-vd-gallery__thumb${activePhoto === i ? ' ew-vd-gallery__thumb--active' : ''}`}
                  onClick={() => setActivePhoto(i)}
                  aria-label={`Fotografija ${i + 1}`}
                >
                  <img src={src} alt="" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Body: main + sidebar */}
        <div className="ew-vd-body">
          <div className="ew-container ew-vd-layout">

            {/* Main content */}
            <div className="ew-vd-main">

              {/* Header */}
              <div className="ew-vd-header">
                <div>
                  <h1 className="ew-h2 ew-vd-title">{venue.name}</h1>
                  <div className="ew-vd-meta">
                    <span className="ew-vd-meta__stars" aria-label={`Ocjena ${venue.rating}`}>
                      {'★'.repeat(Math.round(venue.rating))}{'☆'.repeat(5 - Math.round(venue.rating))}
                    </span>
                    <span className="ew-vd-meta__rating">{venue.rating.toFixed(1)}</span>
                    <span className="ew-vd-meta__reviews">({venue.reviewCount} recenzija)</span>
                    <span className="ew-vd-meta__sep">·</span>
                    <span className="ew-vd-meta__age">Dob {venue.ageRange} god.</span>
                    <span className="ew-vd-meta__sep">·</span>
                    <span className="ew-vd-meta__city">{venue.city}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="ew-vd-desc">{venue.description}</p>

              {/* Amenities */}
              <section className="ew-vd-section">
                <h2 className="ew-vd-section__title">Sadržaj i usluge</h2>
                <div className="ew-vd-amenities">
                  {venue.amenities.map(a => (
                    <div key={a} className="ew-vd-amenity">
                      <span className="ew-vd-amenity__icon" aria-hidden="true">
                        {amenityIcons[a] ?? '✓'}
                      </span>
                      <span className="ew-vd-amenity__label">{a}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Packages */}
              <section className="ew-vd-section">
                <h2 className="ew-vd-section__title">Paketi za proslavu</h2>
                <div className="ew-vd-packages">
                  {venue.packages.map((pkg, i) => (
                    <div key={pkg.name} className={`ew-vd-package${i === 1 ? ' ew-vd-package--featured' : ''}`}>
                      {i === 1 && <div className="ew-vd-package__badge">Najpopularniji</div>}
                      <div className="ew-vd-package__name">{pkg.name}</div>
                      <div className="ew-vd-package__price">
                        od <strong>{pkg.price}€</strong>
                        <span> / min. {pkg.minChildren} djece</span>
                      </div>
                      <ul className="ew-vd-package__list">
                        {pkg.includes.map(item => (
                          <li key={item}>
                            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                              <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Link
                        to={`/kreiraj-pozivnicu?igraonica=${encodeURIComponent(venue.name)}&paket=${encodeURIComponent(pkg.name)}`}
                        className={i === 1 ? 'ew-btn-primary' : 'ew-btn-secondary'}
                      >
                        Kreiraj pozivnicu s ovim paketom
                      </Link>
                    </div>
                  ))}
                </div>
              </section>

              {/* Contact */}
              <section className="ew-vd-section">
                <h2 className="ew-vd-section__title">Kontakt i lokacija</h2>
                <div className="ew-vd-contact">
                  <div className="ew-vd-contact__row">
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M10 2a6 6 0 0 1 6 6c0 4-6 10-6 10S4 12 4 8a6 6 0 0 1 6-6z" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(venue.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ew-vd-contact__link"
                    >
                      {venue.address}
                    </a>
                  </div>
                  <div className="ew-vd-contact__row">
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M3 5a2 2 0 0 1 2-2h2l2 4-2 2a12 12 0 0 0 4 4l2-2 4 2v2a2 2 0 0 1-2 2C7 17 3 13 3 7V5z" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <a href={`tel:${venue.phone.replace(/\s/g, '')}`} className="ew-vd-contact__link">
                      {venue.phone}
                    </a>
                  </div>
                </div>
              </section>
            </div>

            {/* Sticky sidebar CTA */}
            <aside className="ew-vd-sidebar">
              <div className="ew-vd-sidebar__card">
                <div className="ew-vd-sidebar__venue">{venue.name}</div>
                <div className="ew-vd-sidebar__price-line">
                  Od <strong>{venue.pricePerChild}€</strong> po djetetu
                </div>
                <div className="ew-vd-sidebar__rating">
                  <span aria-hidden="true">★</span> {venue.rating.toFixed(1)}
                  <span className="ew-vd-sidebar__rev"> · {venue.reviewCount} recenzija</span>
                </div>

                <div className="ew-vd-sidebar__divider" />

                <p className="ew-vd-sidebar__hint">
                  Rezerviraj termin i pošalji pozivnicu — sve u 5 minuta.
                </p>

                <Link
                  to={`/kreiraj-pozivnicu?igraonica=${encodeURIComponent(venue.name)}&adresa=${encodeURIComponent(venue.address)}`}
                  className="ew-btn-primary ew-vd-sidebar__cta"
                >
                  Kreiraj pozivnicu s ovom lokacijom
                </Link>

                <div className="ew-vd-sidebar__meta-row">
                  <span>📍 {venue.city}</span>
                  <span>👦 {venue.ageRange} god.</span>
                  <span>👥 do {venue.maxChildren} djece</span>
                </div>

                <a href={`tel:${venue.phone.replace(/\s/g, '')}`} className="ew-vd-sidebar__phone">
                  {venue.phone}
                </a>
              </div>
            </aside>

          </div>
        </div>

        {/* Bottom CTA strip */}
        <section className="ew-vd-bottom-cta ew-grain">
          <div className="ew-container ew-vd-bottom-cta__inner">
            <div>
              <h2 className="ew-h3">Sviđa ti se {venue.name}?</h2>
              <p className="ew-body-lg">Napravi pozivnicu za ovaj prostor i podijeli je s gostima za manje od 2 minute.</p>
            </div>
            <Link
              to={`/kreiraj-pozivnicu?igraonica=${encodeURIComponent(venue.name)}&adresa=${encodeURIComponent(venue.address)}`}
              className="ew-btn-primary"
            >
              Kreiraj pozivnicu s ovom lokacijom
            </Link>
          </div>
        </section>

        {/* Other venues */}
        <section className="ew-vd-more">
          <div className="ew-container">
            <h2 className="ew-h3 ew-vd-more__title">Ostale igraonice u Zagrebu</h2>
            <div className="ew-vd-more__grid">
              {venues
                .filter(v => v.id !== venue.id)
                .slice(0, 3)
                .map(v => (
                  <Link key={v.id} to={`/igraonice/${v.slug}`} className="ew-vd-mini-card">
                    <img src={v.coverPhoto} alt={v.name} className="ew-vd-mini-card__img" loading="lazy" decoding="async" />
                    <div className="ew-vd-mini-card__body">
                      <div className="ew-vd-mini-card__name">{v.name}</div>
                      <div className="ew-vd-mini-card__meta">★ {v.rating} · {v.ageRange} god. · od {v.pricePerChild}€</div>
                    </div>
                  </Link>
                ))}
            </div>
            <Link to="/igraonice" className="ew-vd-more__all">← Sve igraonice</Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
