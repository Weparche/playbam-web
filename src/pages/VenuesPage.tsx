import { lazy, Suspense, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { REGIONS, venues, type RegionKey, type Venue } from '../lib/landing-data'
import { formatKm, haversineKm, type LatLng } from '../lib/distance'
import { useGoogleCoverPhoto } from '../lib/useGooglePlaceEnrichment'
import Footer from '../components/landing/Footer'
import Navbar from '../components/landing/Navbar'

const VenuesMapModal = lazy(() => import('../components/venues/VenuesMapModal'))

type FilteredVenue = Venue & { _km?: number }

const amenityOptions = ['Parking', 'Animatori', 'Ugostiteljstvo', 'Torta po narudžbi', 'WC za bebe', 'Klima']

function parseRegion(value: string | null): RegionKey {
  if (value === 'split') return 'split'
  if (value === 'koprivnica') return 'koprivnica'
  return 'zagreb'
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="ew-star-rating" aria-label={`Ocjena ${rating}`}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
      <span className="ew-star-rating__num">{rating.toFixed(1)}</span>
    </span>
  )
}

function VenueCoverImage({ venue }: { venue: FilteredVenue }) {
  const coverPhoto = useGoogleCoverPhoto(venue, venue.coverPhoto)

  return (
    <img
      src={coverPhoto}
      alt={venue.name}
      className="ew-vp-card__img"
      loading="lazy"
      decoding="async"
    />
  )
}

export default function VenuesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const region = parseRegion(searchParams.get('grad'))
  const regionMeta = REGIONS[region]

  const [query, setQuery] = useState('')
  const [ageMin, setAgeMin] = useState(0)
  const [ageMax, setAgeMax] = useState(12)
  const [priceMax, setPriceMax] = useState(30)
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc' | 'distance'>('rating')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [userLoc, setUserLoc] = useState<LatLng | null>(null)
  const [maxKm, setMaxKm] = useState<number>(50)
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState<string | null>(null)
  const [mapOpen, setMapOpen] = useState(false)

  const requestLocation = () => {
    setLocError(null)
    if (!('geolocation' in navigator)) {
      setLocError('Tvoj browser ne podržava lokaciju')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
        setSortBy('distance')
      },
      err => {
        setLocating(false)
        setLocError(
          err.code === err.PERMISSION_DENIED
            ? 'Lokacija nije dozvoljena. Provjeri postavke browsera.'
            : 'Nije moguće dohvatiti lokaciju. Pokušaj ponovno.'
        )
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    )
  }

  const clearLocation = () => {
    setUserLoc(null)
    setLocError(null)
    if (sortBy === 'distance') setSortBy('rating')
  }

  const toggleAmenity = (a: string) =>
    setSelectedAmenities(prev => {
      const next = new Set(prev)
      if (next.has(a)) { next.delete(a) } else { next.add(a) }
      return next
    })

  const venuesInRegion = useMemo(
    () => venues.filter(v => regionMeta.cities.includes(v.city)),
    [regionMeta]
  )

  const filtered = useMemo<FilteredVenue[]>(() => {
    let list: FilteredVenue[] = venuesInRegion.filter(v => {
      if (query && !v.name.toLowerCase().includes(query.toLowerCase()) &&
          !v.address.toLowerCase().includes(query.toLowerCase())) return false
      if (v.ageMax < ageMin || v.ageMin > ageMax) return false
      if (v.pricePerChild > priceMax) return false
      for (const a of selectedAmenities) {
        if (!v.amenities.includes(a)) return false
      }
      return true
    })

    if (userLoc) {
      list = list
        .map(v => ({ ...v, _km: haversineKm(userLoc, { lat: v.lat, lng: v.lng }) }))
        .filter(v => (v._km ?? Infinity) <= maxKm)
    }

    if (sortBy === 'distance' && userLoc) {
      list = [...list].sort((a, b) => (a._km ?? Infinity) - (b._km ?? Infinity))
    } else if (sortBy === 'rating') {
      list = [...list].sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'price_asc') {
      list = [...list].sort((a, b) => a.pricePerChild - b.pricePerChild)
    } else if (sortBy === 'price_desc') {
      list = [...list].sort((a, b) => b.pricePerChild - a.pricePerChild)
    }

    return list
  }, [venuesInRegion, query, ageMin, ageMax, priceMax, selectedAmenities, sortBy, userLoc, maxKm])
  const activeFilterChips = [
    query ? `Pretraga: ${query}` : null,
    ageMin > 0 || ageMax < 12 ? `Dob ${ageMin}-${ageMax} god.` : null,
    priceMax < 30 ? `Do ${priceMax}€/dijete` : null,
    userLoc ? `Do ${maxKm} km od mene` : null,
    ...Array.from(selectedAmenities),
  ].filter((chip): chip is string => Boolean(chip))
  const resetFilters = () => {
    setQuery('')
    setAgeMin(0)
    setAgeMax(12)
    setPriceMax(30)
    setSelectedAmenities(new Set())
  }
  const handleRegionChange = (next: RegionKey) => {
    if (next === region) return
    const params = new URLSearchParams(searchParams)
    if (next === 'zagreb') params.delete('grad')
    else params.set('grad', next)
    setSearchParams(params, { replace: false })
    resetFilters()
  }

  return (
    <div className="ew-landing">
      <a className="ew-skip-link" href="#main">Preskoči na sadržaj</a>
      <Navbar opaque />

      <main id="main">
        {/* Page hero */}
        <section className="ew-vp-hero ew-grain">
          <div className="ew-container">
            <div className="ew-eyebrow" style={{ marginBottom: 16 }}>Igraonice · {regionMeta.label}</div>
            <h1 className="ew-h1 ew-vp-hero__title">
              Pronađi savršenu <em>igraonicu</em>.
            </h1>
            <p className="ew-body-lg ew-vp-hero__sub">
              {venuesInRegion.length} {venuesInRegion.length === 1 ? 'igraonica' : venuesInRegion.length < 5 ? 'igraonice' : 'igraonica'} u {region === 'split' ? 'Splitu i okolici' : region === 'koprivnica' ? 'Koprivnici i okolici' : 'Zagrebu'} — sortiraj po ocjeni, cijeni i sadržaju.
            </p>

            <div className="ew-vp-region-tabs" role="tablist" aria-label="Odaberi grad">
              {(Object.keys(REGIONS) as RegionKey[]).map(key => {
                const isActive = key === region
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`ew-vp-region-tab${isActive ? ' is-active' : ''}`}
                    onClick={() => handleRegionChange(key)}
                  >
                    {REGIONS[key].label}
                  </button>
                )
              })}
            </div>

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
            <button
              type="button"
              className="ew-vp-filter-toggle"
              onClick={() => setFiltersOpen((value) => !value)}
              aria-expanded={filtersOpen}
            >
              Filteri {activeFilterChips.length > 0 ? `(${activeFilterChips.length})` : ''}
            </button>

            <aside className={`ew-vp-sidebar ${filtersOpen ? 'is-open' : ''}`} aria-label="Filteri">
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

              <div className="ew-vp-filter-group ew-vp-locate-group">
                <div className="ew-vp-filter-label">Moja lokacija</div>
                {!userLoc ? (
                  <>
                    <button
                      type="button"
                      className="ew-btn-secondary ew-vp-locate"
                      onClick={requestLocation}
                      disabled={locating}
                    >
                      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="ew-vp-locate__icon">
                        <circle cx="10" cy="10" r="3" fill="currentColor"/>
                        <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.4" fill="none"/>
                        <path d="M10 1.5V4M10 16V18.5M1.5 10H4M16 10H18.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                      {locating ? 'Tražim…' : 'Pronađi blizu mene'}
                    </button>
                    {locError && <p className="ew-vp-locate-err" role="status">{locError}</p>}
                  </>
                ) : (
                  <>
                    <div className="ew-vp-locate-on">
                      <span className="ew-vp-locate-dot" aria-hidden="true" />
                      Tvoja lokacija aktivna
                    </div>
                    <div className="ew-vp-range-row">
                      <input
                        type="range" min={1} max={100} step={1}
                        value={maxKm}
                        onChange={e => setMaxKm(Number(e.target.value))}
                        aria-label="Maksimalna udaljenost u kilometrima"
                        className="ew-vp-range"
                      />
                      <span className="ew-vp-range-val">do {maxKm} km</span>
                    </div>
                    <button type="button" className="ew-vp-clear-btn" onClick={clearLocation}>
                      Resetiraj lokaciju
                    </button>
                  </>
                )}
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
                  onClick={resetFilters}
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
                <div className="ew-vp-results-actions">
                  <button
                    type="button"
                    className="ew-vp-map-btn"
                    onClick={() => setMapOpen(true)}
                    disabled={filtered.length === 0}
                  >
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="ew-vp-map-btn__icon">
                      <path d="M10 17s-6-5.2-6-9.5A6 6 0 0 1 16 7.5C16 11.8 10 17 10 17Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      <circle cx="10" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    Prikaži na karti
                  </button>
                  <select
                    className="ew-vp-sort"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as typeof sortBy)}
                    aria-label="Sortiraj"
                  >
                    {userLoc && <option value="distance">Najbliže meni</option>}
                    <option value="rating">Najbolja ocjena</option>
                    <option value="price_asc">Cijena: niža → viša</option>
                    <option value="price_desc">Cijena: viša → niža</option>
                  </select>
                </div>
              </div>

              {activeFilterChips.length > 0 ? (
                <div className="ew-vp-activeFilters" aria-label="Aktivni filteri">
                  {activeFilterChips.map((chip) => (
                    <span key={chip} className="ew-vp-activeFilter">{chip}</span>
                  ))}
                  <button type="button" className="ew-vp-activeFilter ew-vp-activeFilter--clear" onClick={resetFilters}>
                    Poništi sve
                  </button>
                </div>
              ) : null}

              {filtered.length === 0 ? (
                <div className="ew-vp-empty">
                  <p>
                    {venuesInRegion.length === 0
                      ? `Trenutno nema igraonica u kategoriji ${regionMeta.label}.`
                      : `Nema igraonica u ${regionMeta.label} koje odgovaraju odabranim filterima.`}
                  </p>
                  <button className="ew-btn-secondary" onClick={() => {
                    resetFilters()
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
                        <VenueCoverImage venue={venue} />
                        <div className="ew-vp-card__badge">
                          {venue.ageRange} god.
                        </div>
                      </div>
                      <div className="ew-vp-card__body">
                        <div className="ew-vp-card__top">
                          <h2 className="ew-vp-card__name">{venue.name}</h2>
                          <StarRating rating={venue.rating} />
                        </div>
                        <p className="ew-vp-card__address">
                          {venue.address}
                          {typeof venue._km === 'number' && (
                            <span className="ew-vp-card__distance" aria-label={`${formatKm(venue._km)} od tebe`}>
                              · {formatKm(venue._km)} od tebe
                            </span>
                          )}
                        </p>
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

      {mapOpen && (
        <Suspense fallback={null}>
          <VenuesMapModal
            venues={filtered}
            userLoc={userLoc}
            region={region}
            onClose={() => setMapOpen(false)}
          />
        </Suspense>
      )}
    </div>
  )
}
