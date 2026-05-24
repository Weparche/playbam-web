import { useLayoutEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import Footer from '../components/landing/Footer'
import Navbar from '../components/landing/Navbar'
import ImageLightbox from '../components/ui/ImageLightbox'
import BookingInquiryModal from '../components/venues/BookingInquiryModal'
import { REGIONS, regionForCity, venues } from '../lib/landing-data'
import { googlePhotoUris, useGooglePlaceEnrichment } from '../lib/useGooglePlaceEnrichment'

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
  const googlePlace = useGooglePlaceEnrichment(venue?.skipGooglePlaces ? undefined : venue, 7)

  const allPhotos = useMemo(
    () => {
      if (!venue) return []
      if (venue.skipGooglePlaces) {
        return [...new Set([venue.coverPhoto, ...venue.photos])]
      }
      const googlePhotos = googlePhotoUris(googlePlace)
      return googlePhotos.length > 0 ? googlePhotos : [venue.coverPhoto, ...venue.photos]
    },
    [googlePlace, venue],
  )

  const [activePhoto, setActivePhoto] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [bookingInquiryOpen, setBookingInquiryOpen] = useState(false)
  const [preselectedPackageName, setPreselectedPackageName] = useState<string | undefined>()
  const activePhotoIndex = allPhotos.length > 0 ? Math.min(activePhoto, allPhotos.length - 1) : 0

  const { leftIndices, rightIndices } = useMemo(() => {
    const n = allPhotos.length
    const split = Math.ceil(n / 2)
    return {
      leftIndices: Array.from({ length: split }, (_, i) => i),
      rightIndices: Array.from({ length: Math.max(0, n - split) }, (_, i) => i + split),
    }
  }, [allPhotos.length])

  useLayoutEffect(() => {
    if (allPhotos.length === 0) return
    const mq = window.matchMedia('(min-width: 900px)')
    const selector = mq.matches
      ? `.ew-vd-viewer__rail button[data-vd-index="${activePhotoIndex}"]`
      : `.ew-vd-viewer__mobile-scroll button[data-vd-index="${activePhotoIndex}"]`
    document.querySelector<HTMLElement>(selector)?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'smooth',
    })
  }, [activePhotoIndex, allPhotos.length])

  if (!venue) return <Navigate to="/igraonice" replace />

  const venueRegion = regionForCity(venue.city)
  const regionMeta = REGIONS[venueRegion]
  const venuesQuery = venueRegion === 'zagreb' ? '' : `?grad=${venueRegion}`
  const displayedRating = venue.skipGooglePlaces ? venue.rating : (googlePlace?.rating ?? venue.rating)
  const displayedReviewCount = venue.skipGooglePlaces ? venue.reviewCount : (googlePlace?.reviewCount ?? venue.reviewCount)
  const displayedAddress = venue.skipGooglePlaces ? venue.address : (googlePlace?.address ?? venue.address)
  const displayedPhone = venue.skipGooglePlaces ? venue.phone : (googlePlace?.phone ?? venue.phone)
  const displayedWebsite = venue.skipGooglePlaces ? venue.website : (googlePlace?.website ?? venue.website)
  const bookingVenue = { ...venue, phone: displayedPhone }
  const venueUrl = `https://vidimose.hr/igraonice/${venue.slug}`
  const openBookingInquiry = (packageName?: string) => {
    setPreselectedPackageName(packageName)
    setBookingInquiryOpen(true)
  }
  const displayedMapsUrl = venue.skipGooglePlaces
    ? `https://maps.google.com/?q=${encodeURIComponent(venue.address)}`
    : (googlePlace?.googleMapsUri ?? `https://maps.google.com/?q=${encodeURIComponent(venue.address)}`)
  const mapQuery =
    venue.skipGooglePlaces
      ? venue.address
      : typeof googlePlace?.lat === 'number' && typeof googlePlace?.lng === 'number'
        ? `${googlePlace.lat},${googlePlace.lng}`
        : displayedAddress
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`

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
            <Link to={`/igraonice${venuesQuery}`} className="ew-vd-breadcrumb__link">Igraonice</Link>
            <span className="ew-vd-breadcrumb__sep">›</span>
            <span className="ew-vd-breadcrumb__current">{venue.name}</span>
          </div>
        </div>

        {/* Photo viewer: desktop — side rails + square center; mobile — horizontal strip */}
        <div className="ew-vd-viewer">
          <div className="ew-container ew-vd-viewer__inner">
            <div className="ew-vd-viewer__rail ew-vd-viewer__rail--left">
              {leftIndices.map(i => (
                <button
                  key={i}
                  type="button"
                  data-vd-index={i}
                  className={`ew-vd-thumb${activePhotoIndex === i ? ' ew-vd-thumb--active' : ''}`}
                  onClick={() => setActivePhoto(i)}
                  aria-label={`Fotografija ${i + 1}`}
                  aria-current={activePhotoIndex === i ? 'true' : undefined}
                >
                  <img src={allPhotos[i]} alt="" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
            <div className="ew-vd-viewer__main">
              <button
                type="button"
                className="ew-vd-viewer__main-btn"
                onClick={() => setLightboxIndex(activePhotoIndex)}
                aria-label={`Otvori fotografiju ${activePhotoIndex + 1}`}
              >
              <img
                src={allPhotos[activePhotoIndex]}
                alt={`${venue.name} — fotografija ${activePhotoIndex + 1}`}
                className="ew-vd-viewer__main-img"
                loading="eager"
                decoding="async"
              />
              </button>
            </div>
            <div className="ew-vd-viewer__rail ew-vd-viewer__rail--right">
              {rightIndices.map(i => (
                <button
                  key={i}
                  type="button"
                  data-vd-index={i}
                  className={`ew-vd-thumb${activePhotoIndex === i ? ' ew-vd-thumb--active' : ''}`}
                  onClick={() => setActivePhoto(i)}
                  aria-label={`Fotografija ${i + 1}`}
                  aria-current={activePhotoIndex === i ? 'true' : undefined}
                >
                  <img src={allPhotos[i]} alt="" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          </div>
          <div className="ew-vd-viewer__mobile-strip">
            <div className="ew-container">
              <div className="ew-vd-viewer__mobile-scroll">
                {allPhotos.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    data-vd-index={i}
                  className={`ew-vd-thumb ew-vd-thumb--strip${activePhotoIndex === i ? ' ew-vd-thumb--active' : ''}`}
                    onClick={() => setActivePhoto(i)}
                    aria-label={`Fotografija ${i + 1}`}
                  aria-current={activePhotoIndex === i ? 'true' : undefined}
                  >
                    <img src={src} alt="" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
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
                    <span className="ew-vd-meta__stars" aria-label={`Ocjena ${displayedRating}`}>
                      {'★'.repeat(Math.round(displayedRating))}{'☆'.repeat(5 - Math.round(displayedRating))}
                    </span>
                    <span className="ew-vd-meta__rating">{displayedRating.toFixed(1)}</span>
                    <span className="ew-vd-meta__reviews">({displayedReviewCount} recenzija)</span>
                    <span className="ew-vd-meta__sep">·</span>
                    <span className="ew-vd-meta__age">Dob {venue.ageRange} god.</span>
                    <span className="ew-vd-meta__sep">·</span>
                    <span className="ew-vd-meta__city">{venue.city}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="ew-vd-desc">{venue.description}</p>
              <div className="ew-vd-actions">
                <button type="button" className="ew-btn-primary" onClick={() => openBookingInquiry()}>
                  Pošalji upit za rođendan
                </button>
                <span>Direktno igraonici preko WhatsAppa, bez automatske potvrde termina.</span>
              </div>

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
                      <button
                        type="button"
                        className="ew-btn-secondary ew-vd-package__inquiry"
                        onClick={() => openBookingInquiry(pkg.name)}
                      >
                        Pošalji upit za ovaj paket
                      </button>
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
                      href={displayedMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ew-vd-contact__link"
                    >
                      {displayedAddress}
                    </a>
                  </div>
                  <div className="ew-vd-contact__row">
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M3 5a2 2 0 0 1 2-2h2l2 4-2 2a12 12 0 0 0 4 4l2-2 4 2v2a2 2 0 0 1-2 2C7 17 3 13 3 7V5z" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <a href={`tel:${displayedPhone.replace(/\s/g, '')}`} className="ew-vd-contact__link">
                      {displayedPhone}
                    </a>
                  </div>
                  {displayedWebsite && (
                    <div className="ew-vd-contact__row">
                      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M10 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16Z" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M2 10h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M10 2c2.5 2.3 4 5 4 8s-1.5 5.7-4 8c-2.5-2.3-4-5-4-8s1.5-5.7 4-8Z" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                      <a href={displayedWebsite} target="_blank" rel="noopener noreferrer" className="ew-vd-contact__link">
                        Web stranica
                      </a>
                    </div>
                  )}
                  {venue.facebook && (
                    <div className="ew-vd-contact__row">
                      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M12 7h2V4h-2a3 3 0 0 0-3 3v2H7v3h2v6h3v-6h2l1-3h-3V7.5c0-.3.2-.5.5-.5H12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      </svg>
                      <a href={venue.facebook} target="_blank" rel="noopener noreferrer" className="ew-vd-contact__link">
                        Facebook
                      </a>
                    </div>
                  )}
                  {venue.instagram && (
                    <div className="ew-vd-contact__row">
                      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <rect x="4" y="4" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="13.8" cy="6.2" r="0.9" fill="currentColor" />
                      </svg>
                      <a href={venue.instagram} target="_blank" rel="noopener noreferrer" className="ew-vd-contact__link">
                        Instagram
                      </a>
                    </div>
                  )}
                  {venue.tiktok && (
                    <div className="ew-vd-contact__row">
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                      <a href={venue.tiktok} target="_blank" rel="noopener noreferrer" className="ew-vd-contact__link">
                        TikTok
                      </a>
                    </div>
                  )}
                  <div className="ew-vd-contact__map">
                    <iframe
                      title={`Karta lokacije za ${venue.name}`}
                      src={mapEmbedUrl}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <a href={displayedMapsUrl} target="_blank" rel="noopener noreferrer">
                      Otvori u Google Maps
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
                  <span aria-hidden="true">★</span> {displayedRating.toFixed(1)}
                  <span className="ew-vd-sidebar__rev"> · {displayedReviewCount} recenzija</span>
                </div>

                <div className="ew-vd-sidebar__divider" />

                <p className="ew-vd-sidebar__hint">
                  Rezerviraj termin i pošalji pozivnicu — sve u 5 minuta.
                </p>

                <Link
                  to={`/kreiraj-pozivnicu?igraonica=${encodeURIComponent(venue.name)}&adresa=${encodeURIComponent(displayedAddress)}`}
                  className="ew-btn-primary ew-vd-sidebar__cta"
                >
                  Kreiraj pozivnicu s ovom lokacijom
                </Link>
                <button type="button" className="ew-btn-secondary ew-vd-sidebar__cta" onClick={() => openBookingInquiry()}>
                  Pošalji upit za rođendan
                </button>

                <div className="ew-vd-sidebar__meta-row">
                  <span>📍 {venue.city}</span>
                  <span>👦 {venue.ageRange} god.</span>
                  <span>👥 do {venue.maxChildren} djece</span>
                </div>

                <a href={`tel:${displayedPhone.replace(/\s/g, '')}`} className="ew-vd-sidebar__phone">
                  {displayedPhone}
                </a>

                {(displayedWebsite || venue.facebook || venue.instagram || venue.tiktok) && (
                  <div className="ew-vd-sidebar__links" aria-label="Poveznice">
                    {displayedWebsite && (
                      <a href={displayedWebsite} target="_blank" rel="noopener noreferrer" className="ew-vd-sidebar__link">
                        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="ew-vd-sidebar__link-icon">
                          <path d="M10 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16Z" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M2 10h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M10 2c2.5 2.3 4 5 4 8s-1.5 5.7-4 8c-2.5-2.3-4-5-4-8s1.5-5.7 4-8Z" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                        <span>Web</span>
                      </a>
                    )}
                    {venue.facebook && (
                      <a href={venue.facebook} target="_blank" rel="noopener noreferrer" className="ew-vd-sidebar__link">
                        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="ew-vd-sidebar__link-icon">
                          <path d="M12 7h2V4h-2a3 3 0 0 0-3 3v2H7v3h2v6h3v-6h2l1-3h-3V7.5c0-.3.2-.5.5-.5H12Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                        </svg>
                        <span>Facebook</span>
                      </a>
                    )}
                    {venue.instagram && (
                      <a href={venue.instagram} target="_blank" rel="noopener noreferrer" className="ew-vd-sidebar__link">
                        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="ew-vd-sidebar__link-icon">
                          <rect x="4" y="4" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" />
                          <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
                          <circle cx="13.8" cy="6.2" r="0.9" fill="currentColor" />
                        </svg>
                        <span>Instagram</span>
                      </a>
                    )}
                    {venue.tiktok && (
                      <a href={venue.tiktok} target="_blank" rel="noopener noreferrer" className="ew-vd-sidebar__link">
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="ew-vd-sidebar__link-icon ew-vd-sidebar__link-icon--tiktok">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                        </svg>
                        <span>TikTok</span>
                      </a>
                    )}
                  </div>
                )}
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
              to={`/kreiraj-pozivnicu?igraonica=${encodeURIComponent(venue.name)}&adresa=${encodeURIComponent(displayedAddress)}`}
              className="ew-btn-primary"
            >
              Kreiraj pozivnicu s ovom lokacijom
            </Link>
          </div>
        </section>

        {/* Other venues */}
        <section className="ew-vd-more">
          <div className="ew-container">
            <h2 className="ew-h3 ew-vd-more__title">
              Ostale igraonice u {venueRegion === 'split' ? 'Splitu i okolici' : venueRegion === 'koprivnica' ? 'Koprivnici i okolici' : 'Zagrebu'}
            </h2>
            <div className="ew-vd-more__grid">
              {venues
                .filter(v => v.id !== venue.id && regionMeta.cities.includes(v.city))
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
            <Link to={`/igraonice${venuesQuery}`} className="ew-vd-more__all">← Sve igraonice</Link>
          </div>
        </section>
      </main>

      {lightboxIndex != null ? (
        <ImageLightbox
          images={allPhotos}
          initialIndex={lightboxIndex}
          altBase={venue.name}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}

      {bookingInquiryOpen ? (
        <BookingInquiryModal
          key={preselectedPackageName ?? 'general-inquiry'}
          venue={bookingVenue}
          isOpen={bookingInquiryOpen}
          onClose={() => setBookingInquiryOpen(false)}
          preselectedPackageName={preselectedPackageName}
          venueUrl={venueUrl}
        />
      ) : null}

      <Footer />
    </div>
  )
}
