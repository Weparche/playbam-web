import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { venues } from '../lib/landing-data'
import Footer from '../components/landing/Footer'
import Navbar from '../components/landing/Navbar'

const amenityOptions = ['Parking', 'Animatori', 'Ugostiteljstvo', 'Torta po narudžbi', 'WC za bebe', 'Klima']

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="ew-star-rating" aria-label={`Ocjena ${rating}`}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      <span className="ew-star-rating__num">{rating.toFixed(1)}</span>
    </span>
  )
}

export default function VenuesPage() {
  const [query, setQuery] = useState('')
  const [ageMin, setAgeMin] = useState(0)
  const [ageMax, setAgeMax] = useState(12)
  const [priceMax, setPriceMax] = useState(30)
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc'>('rating')

  const toggleAmenity = (a: string) =>
    setSelectedAmenities(prev => {
      const next = new Set(prev)
      if (next.has(a)) { next.delete(a) } else { next.add(a) }
      return next
    })

  const filtered = useMemo(() => {
    let list = venues.filter(v => {
      if (query && !v.name.toLowerCase().includes(query.toLowerCase()) &&
          !v.address.toLowerCase().includes(query.toLowerCase())) return false
      if (v.ageMax < ageMin || v.ageMin > ageMax) return false
      if (v.pricePerChild > priceMax) return false
      for (const a of selectedAmenities) {
        if (!v.amenities.includes(a)) return false
      }
      return true
    })

    if (sortBy === 'rating') list = [...list].sort((a, b) => b.rating - a.rating)
    else if (sortBy === 'price_asc') list = [...list].sort((a, b) => a.pricePerChild - b.pricePerChild)
    else if (sortBy === 'price_desc') list = [...list].sort((a, b) => b.pricePerChild - a.pricePerChild)

    return list
  }, [query, ageMin, ageMax, priceMax, selectedAmenities, sortBy])

  return (
    <div className="ew-landing">
      <a className="ew-skip-link" href="#main">Preskoči na sadržaj</a>
      <Navbar />

      <main id="main">
        {/* Page hero */}
        <section className="ew-vp-hero ew-grain">
          <div className="ew-container">
            <div className="ew-eyebrow" style={{ marginBottom: 16 }}>Igraonice · Zagreb</div>
            <h1 className="ew-h1 ew-vp-hero__title">
              Pronađi savršenu <em>igraonicu</em>.
            </h1>
            <p className="ew-body-lg ew-vp-hero__sub">
              {venues.length} igraonica u Zagrebu — sortiraj po ocjeni, cijeni i sadržaju.
            </p>
            <div className="ew-vp-hero__search">
              <svg className="ew-vp-hero__search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="search"
                className="ew-vp-hero__search-input"
                placeholder="Pretraži po imenu ili ulici…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Pretraži igraonice"
              />
            </div>
          </div>
        </section>

        {/* Layout: sidebar + results */}
        <section className="ew-vp-body">
          <div className="ew-container ew-vp-layout">

            {/* Sidebar filters */}
            <aside className="ew-vp-sidebar" aria-label="Filteri">
              <div className="ew-vp-filter-group">
                <div className="ew-vp-filter-label">Dob djeteta</div>
                <div className="ew-vp-age-row">
                  <div className="ew-vp-age-field">
                    <label htmlFor="age-min">Od</label>
                    <select id="age-min" value={ageMin} onChange={e => setAgeMin(Number(e.target.value))} className="ew-vp-select">
                      {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n} god.</option>)}
                    </select>
                  </div>
                  <div className="ew-vp-age-field">
                    <label htmlFor="age-max">Do</label>
                    <select id="age-max" value={ageMax} onChange={e => setAgeMax(Number(e.target.value))} className="ew-vp-select">
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n} god.</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="ew-vp-filter-group">
                <div className="ew-vp-filter-label">Maks. cijena / dijete</div>
                <div className="ew-vp-range-row">
                  <input
                    type="range" min={10} max={40} step={1}
                    value={priceMax}
                    onChange={e => setPriceMax(Number(e.target.value))}
                    aria-label="Maksimalna cijena po djetetu"
                    className="ew-vp-range"
                  />
                  <span className="ew-vp-range-val">do {priceMax}€/dijete</span>
                </div>
              </div>

              <div className="ew-vp-filter-group">
                <div className="ew-vp-filter-label">Sadržaj</div>
                <div className="ew-vp-checkboxes">
                  {amenityOptions.map(a => (
                    <label key={a} className="ew-vp-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.has(a)}
                        onChange={() => toggleAmenity(a)}
                      />
                      <span>{a}</span>
                    </label>
                  ))}
                </div>
              </div>

              {(query || selectedAmenities.size > 0 || priceMax < 30 || ageMin > 0 || ageMax < 12) && (
                <button
                  className="ew-vp-clear-btn"
                  onClick={() => {
                    setQuery('')
                    setAgeMin(0)
                    setAgeMax(12)
                    setPriceMax(30)
                    setSelectedAmenities(new Set())
                  }}
                >
                  Poništi filtere
                </button>
              )}
            </aside>

            {/* Results */}
            <div className="ew-vp-results">
              <div className="ew-vp-results-bar">
                <span className="ew-vp-count">
                  {filtered.length === 0
                    ? 'Nema rezultata'
                    : `${filtered.length} igraonic${filtered.length === 1 ? 'a' : filtered.length < 5 ? 'e' : 'a'}`}
                </span>
                <select
                  className="ew-vp-sort"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  aria-label="Sortiraj"
                >
                  <option value="rating">Najbolja ocjena</option>
                  <option value="price_asc">Cijena: niža → viša</option>
                  <option value="price_desc">Cijena: viša → niža</option>
                </select>
              </div>

              {filtered.length === 0 ? (
                <div className="ew-vp-empty">
                  <p>Nema igraonica koje odgovaraju odabranim filterima.</p>
                  <button className="ew-btn-secondary" onClick={() => {
                    setQuery('')
                    setAgeMin(0)
                    setAgeMax(12)
                    setPriceMax(30)
                    setSelectedAmenities(new Set())
                  }}>Resetiraj filtere</button>
                </div>
              ) : (
                <div className="ew-vp-grid">
                  {filtered.map(venue => (
                    <Link
                      key={venue.id}
                      to={`/igraonice/${venue.slug}`}
                      className="ew-vp-card"
                      aria-label={`${venue.name} — detalji`}
                    >
                      <div className="ew-vp-card__img-wrap">
                        <img
                          src={venue.coverPhoto}
                          alt={venue.name}
                          className="ew-vp-card__img"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="ew-vp-card__badge">
                          {venue.ageRange} god.
                        </div>
                      </div>
                      <div className="ew-vp-card__body">
                        <div className="ew-vp-card__top">
                          <h2 className="ew-vp-card__name">{venue.name}</h2>
                          <StarRating rating={venue.rating} />
                        </div>
                        <p className="ew-vp-card__address">{venue.address}</p>
                        <p className="ew-vp-card__desc">{venue.description.slice(0, 90)}…</p>
                        <div className="ew-vp-card__amenities">
                          {venue.amenities.slice(0, 4).map(a => (
                            <span key={a} className="ew-vp-card__amenity">{a}</span>
                          ))}
                          {venue.amenities.length > 4 && (
                            <span className="ew-vp-card__amenity ew-vp-card__amenity--more">
                              +{venue.amenities.length - 4}
                            </span>
                          )}
                        </div>
                        <div className="ew-vp-card__footer">
                          <span className="ew-vp-card__price">od {venue.pricePerChild}€<span>/dijete</span></span>
                          <span className="ew-vp-card__cta">Pogledaj →</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
