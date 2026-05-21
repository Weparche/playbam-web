import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L, { type LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

import { loadParks } from '../data/load-parks'
import { parkFeatureLabels, type Park, type ParkFeature } from '../data/parks-data'
import { formatKm, haversineKm, type LatLng } from '../lib/distance'
import Footer from '../components/landing/Footer'
import Navbar from '../components/landing/Navbar'
import '../styles/parks.css'

L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

const parkIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const userIcon = L.divIcon({
  className: 'ew-pp-userMarker',
  html: '<span aria-hidden="true"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

type AgeFilter = 'all' | '0-3' | '3-6' | '6+'
type ParkWithDistance = Park & { _km?: number }
type SortMode = 'distance' | 'rating'

const ageOptions: Array<{ value: AgeFilter; label: string }> = [
  { value: 'all', label: 'Sve dobi' },
  { value: '0-3', label: '0–3 godine' },
  { value: '3-6', label: '3–6 godina' },
  { value: '6+', label: '6+ godina' },
]

const quickCategories: Array<{
  title: string
  subtitle: string
  icon: string
  tone: string
  action: 'small' | 'shade' | 'quiet' | 'cafe' | 'birthday'
}> = [
  { title: 'Za malu djecu', subtitle: '0–3 godine', icon: '👶', tone: 'blue', action: 'small' },
  { title: 'S puno hlada', subtitle: 'Pronađi hlad', icon: '🌳', tone: 'green', action: 'shade' },
  { title: 'Bez gužve', subtitle: 'Mirnija igrališta', icon: '👨‍👩‍👧‍👦', tone: 'amber', action: 'quiet' },
  { title: 'Blizu kafića', subtitle: 'Kava na dohvat', icon: '☕', tone: 'peach', action: 'cafe' },
  { title: 'Za rođendan', subtitle: 'Ideje i lokacije', icon: '🎈', tone: 'purple', action: 'birthday' },
]

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function matchesAge(park: Park, age: AgeFilter) {
  if (age === 'all') return true
  if (age === '0-3') return park.ageMin <= 3 && park.ageMax >= 0
  if (age === '3-6') return park.ageMin <= 6 && park.ageMax >= 3
  return park.ageMax >= 6
}

function proposalAlert() {
  window.alert('Predlaganje parkova stiže uskoro.')
}

function FitParkBounds({
  parks,
  userLoc,
}: {
  parks: ParkWithDistance[]
  userLoc: LatLng | null
}) {
  const map = useMap()

  useEffect(() => {
    if (parks.length === 0) {
      if (userLoc) {
        map.setView([userLoc.lat, userLoc.lng], 14)
      } else {
        map.setView([45.815, 15.978], 11)
      }
      return
    }

    if (parks.length === 1) {
      map.setView([parks[0].lat, parks[0].lng], 14)
      return
    }

    const bounds = L.latLngBounds(parks.map((park) => [park.lat, park.lng] as LatLngExpression))
    if (userLoc) {
      bounds.extend([userLoc.lat, userLoc.lng])
    }
    map.fitBounds(bounds, { padding: [34, 34], maxZoom: 14 })
  }, [map, parks, userLoc])

  return null
}

function ParksMap({
  parks,
  userLoc,
}: {
  parks: ParkWithDistance[]
  userLoc: LatLng | null
}) {
  return (
    <div className="ew-pp-map" aria-label="Parkovi na karti">
      <MapContainer
        center={[45.815, 15.978]}
        zoom={11}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitParkBounds parks={parks} userLoc={userLoc} />
        {userLoc ? (
          <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
            <Popup>
              <span className="ew-pp-popupLabel">Tvoja lokacija</span>
            </Popup>
          </Marker>
        ) : null}
        {parks.map((park) => (
          <Marker key={park.id} position={[park.lat, park.lng]} icon={parkIcon}>
            <Popup>
              <div className="ew-pp-popup">
                <strong>{park.name}</strong>
                <span>
                  {typeof park._km === 'number' ? `${formatKm(park._km)} · ` : ''}
                  {park.neighborhood} · {park.ageRange} god.
                </span>
                {park.nearestCafeName ? <span>☕ {park.nearestCafeName}</span> : null}
                <Link to={`/djecji-parkovi/${park.slug}`}>
                  Vidi detalje
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

function ParkCard({
  park,
  isFavorite,
  onFavorite,
}: {
  park: ParkWithDistance
  isFavorite: boolean
  onFavorite: () => void
}) {
  const cafeDistance =
    park.nearestCafeDistanceMeters != null
      ? park.nearestCafeDistanceMeters >= 1000
        ? `${(park.nearestCafeDistanceMeters / 1000).toFixed(1)} km`
        : `${park.nearestCafeDistanceMeters} m`
      : null

  return (
    <article className="ew-pp-card" id={`park-${park.id}`}>
      <img
        className="ew-pp-card__image"
        src={park.coverPhoto}
        alt={park.name}
        title="Foto: Wikimedia Commons"
        loading="lazy"
        decoding="async"
      />
      <div className="ew-pp-card__body">
        <div className="ew-pp-card__top">
          <div>
            <h2 className="ew-pp-card__name">{park.name}</h2>
            <p className="ew-pp-card__location">
              {typeof park._km === 'number' ? (
                <span className="ew-pp-card__distance">{formatKm(park._km)}</span>
              ) : null}
              <span>{park.neighborhood}, {park.city}</span>
            </p>
          </div>
          <button
            type="button"
            className={`ew-pp-card__favorite${isFavorite ? ' is-active' : ''}`}
            aria-label={isFavorite ? 'Ukloni iz favorita' : 'Dodaj u favorite'}
            onClick={onFavorite}
          >
            ♥
          </button>
        </div>

        <div className="ew-pp-card__meta">
          <span>★ {park.rating.toFixed(1)} ({park.reviewCount})</span>
          <span>{park.ageRange} god.</span>
        </div>

        <div className="ew-pp-card__tags" aria-label="Sadržaji parka">
          {park.features.slice(0, 4).map((feature) => (
            <span key={feature}>{parkFeatureLabels[feature]}</span>
          ))}
        </div>

        <p className="ew-pp-card__description">{park.description}</p>

        {park.nearestCafeName ? (
          <p className="ew-pp-card__cafe">
            ☕ {park.nearestCafeName}
            {cafeDistance ? ` · ${cafeDistance}` : ''}
          </p>
        ) : null}

        <Link to={`/djecji-parkovi/${park.slug}`} className="ew-pp-card__details">
          Vidi detalje
        </Link>
      </div>
    </article>
  )
}

export default function ParksPage() {
  const allParks = useMemo(() => loadParks(), [])
  const [city, setCity] = useState('all')
  const [neighborhood, setNeighborhood] = useState('all')
  const [age, setAge] = useState<AgeFilter>('all')
  const [shadeOnly, setShadeOnly] = useState(false)
  const [fencedOnly, setFencedOnly] = useState(false)
  const [cafeOnly, setCafeOnly] = useState(false)
  const [requiredFeature, setRequiredFeature] = useState<ParkFeature | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortMode>('rating')

  const [userLoc, setUserLoc] = useState<LatLng | null>(null)
  const [maxKm, setMaxKm] = useState(8)
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState<string | null>(null)

  const cities = useMemo(() => Array.from(new Set(allParks.map((park) => park.city))).sort(), [allParks])
  const neighborhoods = useMemo(() => {
    const source = city === 'all' ? allParks : allParks.filter((park) => park.city === city)
    return Array.from(new Set(source.map((park) => park.neighborhood))).sort()
  }, [allParks, city])

  const requestLocation = () => {
    setLocError(null)
    if (!('geolocation' in navigator)) {
      setLocError('Tvoj preglednik ne podržava lokaciju.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
        setSortBy('distance')
      },
      (err) => {
        setLocating(false)
        setLocError(
          err.code === err.PERMISSION_DENIED
            ? 'Lokacija nije dozvoljena. Provjeri postavke preglednika.'
            : 'Nije moguće dohvatiti lokaciju. Pokušaj ponovno.',
        )
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
    )
  }

  const clearLocation = () => {
    setUserLoc(null)
    setLocError(null)
    if (sortBy === 'distance') setSortBy('rating')
  }

  const filteredParks = useMemo(() => {
    const query = normalize(searchInput.trim())

    let list: ParkWithDistance[] = allParks.filter((park) => {
      if (city !== 'all' && park.city !== city) return false
      if (neighborhood !== 'all' && park.neighborhood !== neighborhood) return false
      if (!matchesAge(park, age)) return false
      if (shadeOnly && !park.hasShade) return false
      if (fencedOnly && !park.isFenced) return false
      if (cafeOnly && !park.hasCafeNearby) return false
      if (requiredFeature && !park.features.includes(requiredFeature)) return false

      if (query) {
        const haystack = normalize(
          [
            park.name,
            park.city,
            park.neighborhood,
            park.address,
            park.description,
            ...(park.nearbyCafes?.map((cafe) => cafe.name) ?? []),
          ].join(' '),
        )
        if (!haystack.includes(query)) return false
      }

      return true
    })

    if (userLoc) {
      list = list
        .map((park) => ({ ...park, _km: haversineKm(userLoc, { lat: park.lat, lng: park.lng }) }))
        .filter((park) => (park._km ?? Infinity) <= maxKm)
    }

    if (sortBy === 'distance' && userLoc) {
      list = [...list].sort((a, b) => (a._km ?? Infinity) - (b._km ?? Infinity))
    } else {
      list = [...list].sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating
        return b.reviewCount - a.reviewCount
      })
    }

    return list
  }, [
    age,
    allParks,
    cafeOnly,
    city,
    fencedOnly,
    maxKm,
    neighborhood,
    requiredFeature,
    searchInput,
    shadeOnly,
    sortBy,
    userLoc,
  ])

  const recommendation = filteredParks[0] ?? null

  const activeFilterCount = [
    city !== 'all',
    neighborhood !== 'all',
    age !== 'all',
    shadeOnly,
    fencedOnly,
    cafeOnly,
    requiredFeature,
    searchInput.trim(),
    userLoc,
  ].filter(Boolean).length

  const resetFilters = () => {
    setCity('all')
    setNeighborhood('all')
    setAge('all')
    setShadeOnly(false)
    setFencedOnly(false)
    setCafeOnly(false)
    setRequiredFeature(null)
    setSearchInput('')
    clearLocation()
  }

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCategory = (action: (typeof quickCategories)[number]['action']) => {
    if (action === 'small') {
      setAge('0-3')
      setRequiredFeature(null)
      return
    }
    if (action === 'shade') {
      setShadeOnly(true)
      setRequiredFeature(null)
      return
    }
    if (action === 'quiet') {
      setRequiredFeature('quiet')
      return
    }
    if (action === 'cafe') {
      setCafeOnly(true)
      setRequiredFeature(null)
      return
    }
    setRequiredFeature('birthday')
  }

  const parkCountLabel =
    filteredParks.length === 0
      ? 'Nema parkova'
      : filteredParks.length === 1
        ? '1 park'
        : filteredParks.length < 5
          ? `${filteredParks.length} parka`
          : `${filteredParks.length} parkova`

  return (
    <div className="ew-landing ew-pp-page">
      <a className="ew-skip-link" href="#main">
        Preskoči na sadržaj
      </a>
      <Navbar opaque />

      <main id="main">
        <section className="ew-pp-hero ew-grain">
          <div className="ew-container">
            <p className="ew-eyebrow">🌿 Obiteljski izlazak</p>
            <h1 className="ew-h1 ew-pp-hero__title">
              Dječji <em>parkovi</em> u blizini
            </h1>
            <p className="ew-body-lg ew-pp-hero__sub">
              Uključi lokaciju i pronađi igralište prema udaljenosti, dobi djeteta, hladu i sadržaju — bez
              nepotrebnog kopanja po filterima.
            </p>

            <div className="ew-pp-locateCard">
              {!userLoc ? (
                <>
                  <div className="ew-pp-locateCard__copy">
                    <h2 className="ew-pp-locateCard__title">Kreni od svoje lokacije</h2>
                    <p className="ew-pp-locateCard__text">
                      Najbrži način da vidiš što je stvarno blizu — sortirano po udaljenosti i prikazano na karti.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="ew-btn-primary ew-pp-locateCard__btn"
                    onClick={requestLocation}
                    disabled={locating}
                  >
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="ew-vp-locate__icon">
                      <circle cx="10" cy="10" r="3" fill="currentColor" />
                      <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.4" fill="none" />
                      <path
                        d="M10 1.5V4M10 16V18.5M1.5 10H4M16 10H18.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                      />
                    </svg>
                    {locating ? 'Tražim lokaciju…' : 'Pronađi parkove blizu mene'}
                  </button>
                  {locError ? (
                    <p className="ew-vp-locate-err ew-pp-locateCard__err" role="status">
                      {locError}
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  <div className="ew-pp-locateCard__active">
                    <span className="ew-vp-locate-dot" aria-hidden="true" />
                    <div>
                      <strong>Lokacija uključena</strong>
                      <span>Parkovi unutar {maxKm} km, sortirano po udaljenosti</span>
                    </div>
                  </div>
                  <div className="ew-pp-locateCard__range">
                    <label htmlFor="pp-max-km" className="ew-vp-filter-label">
                      Maks. udaljenost
                    </label>
                    <div className="ew-vp-range-row">
                      <input
                        id="pp-max-km"
                        type="range"
                        min={1}
                        max={25}
                        step={1}
                        value={maxKm}
                        onChange={(event) => setMaxKm(Number(event.target.value))}
                        className="ew-vp-range"
                        aria-valuetext={`${maxKm} kilometara`}
                      />
                      <span className="ew-vp-range-val">do {maxKm} km</span>
                    </div>
                  </div>
                  <button type="button" className="ew-vp-clear-btn" onClick={clearLocation}>
                    Isključi lokaciju
                  </button>
                </>
              )}
            </div>

            <div className="ew-pp-hero__search">
              <svg className="ew-vp-hero__search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                className="ew-vp-hero__search-input"
                placeholder="Pretraži park, kvart ili kafić…"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                aria-label="Pretraži dječje parkove"
              />
            </div>

            <div className="ew-pp-quick" aria-label="Brzi odabir">
              {quickCategories.map((category) => (
                <button
                  key={category.title}
                  type="button"
                  className={`ew-pp-quick__chip ew-pp-quick__chip--${category.tone}`}
                  onClick={() => handleCategory(category.action)}
                >
                  <span aria-hidden="true">{category.icon}</span>
                  <span className="ew-pp-quick__label">
                    <strong>{category.title}</strong>
                    <small>{category.subtitle}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="ew-vp-body ew-pp-body">
          <div className="ew-container ew-pp-layout">
            <button
              type="button"
              className="ew-vp-filter-toggle ew-pp-filter-toggle"
              onClick={() => setFiltersOpen((value) => !value)}
              aria-expanded={filtersOpen}
            >
              Filteri{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>

            <aside className={`ew-vp-sidebar ew-pp-sidebar ${filtersOpen ? 'is-open' : ''}`} aria-label="Filteri">
              <div className="ew-vp-filter-group">
                <div className="ew-vp-filter-label">Grad</div>
                <select
                  className="ew-vp-select"
                  value={city}
                  onChange={(event) => {
                    setCity(event.target.value)
                    setNeighborhood('all')
                  }}
                  aria-label="Grad"
                >
                  <option value="all">Svi gradovi</option>
                  {cities.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ew-vp-filter-group">
                <div className="ew-vp-filter-label">Kvart</div>
                <select
                  className="ew-vp-select"
                  value={neighborhood}
                  onChange={(event) => setNeighborhood(event.target.value)}
                  aria-label="Kvart"
                  disabled={neighborhoods.length === 0}
                >
                  <option value="all">Svi kvartovi</option>
                  {neighborhoods.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ew-vp-filter-group">
                <div className="ew-vp-filter-label">Dob djeteta</div>
                <select
                  className="ew-vp-select"
                  value={age}
                  onChange={(event) => setAge(event.target.value as AgeFilter)}
                  aria-label="Dob djeteta"
                >
                  {ageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ew-vp-filter-group">
                <div className="ew-vp-filter-label">Dodatno</div>
                <div className="ew-vp-checkboxes">
                  <label className="ew-vp-checkbox">
                    <input
                      type="checkbox"
                      checked={shadeOnly}
                      onChange={(event) => setShadeOnly(event.target.checked)}
                    />
                    <span>Samo s hladom</span>
                  </label>
                  <label className="ew-vp-checkbox">
                    <input
                      type="checkbox"
                      checked={fencedOnly}
                      onChange={(event) => setFencedOnly(event.target.checked)}
                    />
                    <span>Samo ograđeno</span>
                  </label>
                  <label className="ew-vp-checkbox">
                    <input
                      type="checkbox"
                      checked={cafeOnly}
                      onChange={(event) => setCafeOnly(event.target.checked)}
                    />
                    <span>Kafić u blizini</span>
                  </label>
                </div>
              </div>

              {activeFilterCount > 0 ? (
                <button type="button" className="ew-vp-clear-btn" onClick={resetFilters}>
                  Poništi filtere
                </button>
              ) : null}
            </aside>

            <div className="ew-pp-mainCol">
              <aside className="ew-pp-mapPanel" aria-label="Karta parkova">
                <div className="ew-pp-mapPanel__head">
                  <h2 className="ew-pp-mapPanel__title">Karta</h2>
                  <span className="ew-pp-mapPanel__hint">
                    {userLoc
                      ? 'Zelena točka = tvoja lokacija · kotačić = zum'
                      : 'Uključi lokaciju za udaljenosti · kotačić na karti = zum'}
                  </span>
                </div>
                <ParksMap parks={filteredParks} userLoc={userLoc} />
                {recommendation ? (
                  <article className="ew-pp-spotlight">
                    <p className="ew-pp-spotlight__eyebrow">
                      {userLoc ? 'Najbliži odabranom' : 'Preporuka'}
                    </p>
                    <h3>{recommendation.name}</h3>
                    <p>{recommendation.description}</p>
                    {typeof recommendation._km === 'number' ? (
                      <span className="ew-pp-spotlight__km">{formatKm(recommendation._km)} od tebe</span>
                    ) : (
                      <span className="ew-pp-spotlight__km">★ {recommendation.rating.toFixed(1)}</span>
                    )}
                  </article>
                ) : null}
              </aside>

              <div className="ew-vp-results ew-pp-results">
                <div className="ew-vp-results-bar">
                  <span className="ew-vp-count">{parkCountLabel}</span>
                  <select
                    className="ew-vp-sort"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as SortMode)}
                    aria-label="Sortiraj parkove"
                  >
                    {userLoc ? <option value="distance">Najbliže meni</option> : null}
                    <option value="rating">Najbolja ocjena</option>
                  </select>
                </div>

                {!userLoc ? (
                  <p className="ew-pp-nudge" role="status">
                    Savjet: uključi lokaciju gore za listu sortiranu po udaljenosti i parkove na karti oko tebe.
                  </p>
                ) : null}

                {filteredParks.length === 0 ? (
                  <div className="ew-vp-empty ew-pp-empty">
                    <h2>Nismo pronašli parkove za odabrane filtere</h2>
                    <p>
                      {userLoc
                        ? 'Povećaj radijus ili poništi filtere — možda je igralište malo dalje nego što misliš.'
                        : 'Pokušaj s drugim filterima ili uključi lokaciju za pretragu u blizini.'}
                    </p>
                    <button type="button" className="ew-btn-secondary" onClick={resetFilters}>
                      Poništi filtere
                    </button>
                  </div>
                ) : (
                  <div className="ew-pp-list">
                    {filteredParks.map((park) => (
                      <ParkCard
                        key={park.id}
                        park={park}
                        isFavorite={favorites.has(park.id)}
                        onFavorite={() => toggleFavorite(park.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="ew-pp-cta">
          <div className="ew-container ew-pp-cta__inner">
            <div>
              <h2>Ne vidiš svoj omiljeni park?</h2>
              <p>Pomogni drugim roditeljima i predloži novo igralište u svojem kvartu.</p>
            </div>
            <button type="button" className="ew-btn-primary" onClick={proposalAlert}>
              Predloži park
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
