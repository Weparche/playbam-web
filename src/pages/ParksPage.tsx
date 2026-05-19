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

type AgeFilter = 'all' | '0-3' | '3-6' | '6+'

const ageOptions: Array<{ value: AgeFilter; label: string }> = [
  { value: 'all', label: 'Sve dobi' },
  { value: '0-3', label: '0-3 godine' },
  { value: '3-6', label: '3-6 godina' },
  { value: '6+', label: '6+ godina' },
]

const categoryCards: Array<{
  title: string
  subtitle: string
  icon: string
  tone: string
  action: 'small' | 'shade' | 'quiet' | 'cafe' | 'birthday'
}> = [
  { title: 'Za malu djecu', subtitle: '0-3 godine', icon: '👶', tone: 'blue', action: 'small' },
  { title: 'S puno hlada', subtitle: 'Pronadi hlad', icon: '🌳', tone: 'green', action: 'shade' },
  { title: 'Bez velike guzve', subtitle: 'Mirna igralista', icon: '👨‍👩‍👧‍👦', tone: 'amber', action: 'quiet' },
  { title: 'Blizu kafica', subtitle: 'Kava na dohvat', icon: '☕', tone: 'peach', action: 'cafe' },
  { title: 'Za rodendan', subtitle: 'Ideje i lokacije', icon: '🎈', tone: 'purple', action: 'birthday' },
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

function getRecommendation(parks: Park[]) {
  return [...parks].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating
    return b.reviewCount - a.reviewCount
  })[0] ?? null
}

function formatDistance(meters?: number) {
  if (!meters) return null
  return `${meters} m`
}

function placeholderAlert() {
  window.alert('Detaljna stranica parka stize uskoro.')
}

function proposalAlert() {
  window.alert('Predlaganje parkova stize uskoro.')
}

function FitParkBounds({ parks }: { parks: Park[] }) {
  const map = useMap()

  useEffect(() => {
    if (parks.length === 0) {
      map.setView([45.815, 15.978], 11)
      return
    }

    if (parks.length === 1) {
      map.setView([parks[0].lat, parks[0].lng], 14)
      return
    }

    const bounds = L.latLngBounds(parks.map((park) => [park.lat, park.lng] as LatLngExpression))
    map.fitBounds(bounds, { padding: [34, 34], maxZoom: 13 })
  }, [map, parks])

  return null
}

function ParksMap({ parks }: { parks: Park[] }) {
  return (
    <div className="ew-parks-map" aria-label="Parkovi na karti">
      <MapContainer
        center={[45.815, 15.978]}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitParkBounds parks={parks} />
        {parks.map((park) => (
          <Marker key={park.id} position={[park.lat, park.lng]} icon={parkIcon}>
            <Popup>
              <div className="ew-parks-popup">
                <strong>{park.name}</strong>
                <span>{park.neighborhood} · {park.ageRange} god.</span>
                {park.nearestCafeName ? (
                  <span>☕ {park.nearestCafeName}</span>
                ) : null}
                <button type="button" onClick={placeholderAlert}>
                  Vidi detalje
                </button>
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
  park: Park
  isFavorite: boolean
  onFavorite: () => void
}) {
  const cafeDistance = formatDistance(park.nearestCafeDistanceMeters)

  return (
    <article className="ew-parks-card">
      <img className="ew-parks-card__image" src={park.coverPhoto} alt={park.name} loading="lazy" decoding="async" />
      <div className="ew-parks-card__body">
        <div className="ew-parks-card__top">
          <div>
            <h2>{park.name}</h2>
            <p className="ew-parks-card__location">📍 {park.neighborhood}</p>
          </div>
          <button
            type="button"
            className={`ew-parks-card__favorite${isFavorite ? ' is-active' : ''}`}
            aria-label={isFavorite ? 'Ukloni iz favorita' : 'Dodaj u favorite'}
            onClick={onFavorite}
          >
            ♥
          </button>
        </div>

        <div className="ew-parks-card__meta">
          <span>★ {park.rating.toFixed(1)} ({park.reviewCount})</span>
          <span>{park.ageRange} god.</span>
        </div>

        <div className="ew-parks-card__tags" aria-label="Sadrzaji parka">
          {park.features.slice(0, 4).map((feature) => (
            <span key={feature}>{parkFeatureLabels[feature]}</span>
          ))}
        </div>

        <p className="ew-parks-card__description">{park.description}</p>

        {park.nearestCafeName ? (
          <p className="ew-parks-card__cafe">
            ☕ {park.nearestCafeName}{cafeDistance ? ` · ${cafeDistance}` : ''}
          </p>
        ) : null}

        {park.nearbyCafes && park.nearbyCafes.length > 0 ? (
          <div className="ew-parks-card__cafes" aria-label="Kafici u blizini">
            {park.nearbyCafes.slice(0, 3).map((cafe) => (
              <span key={cafe.id}>
                {cafe.name} · {cafe.distanceMeters} m
              </span>
            ))}
          </div>
        ) : null}

        <button type="button" className="ew-parks-card__details" onClick={placeholderAlert}>
          Vidi detalje
        </button>
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
  const [appliedSearch, setAppliedSearch] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const cities = useMemo(() => Array.from(new Set(allParks.map((park) => park.city))).sort(), [allParks])
  const neighborhoods = useMemo(() => {
    const source = city === 'all' ? allParks : allParks.filter((park) => park.city === city)
    return Array.from(new Set(source.map((park) => park.neighborhood))).sort()
  }, [allParks, city])

  const filteredParks = useMemo(() => {
    const query = normalize(appliedSearch.trim())

    return allParks.filter((park) => {
      if (city !== 'all' && park.city !== city) return false
      if (neighborhood !== 'all' && park.neighborhood !== neighborhood) return false
      if (!matchesAge(park, age)) return false
      if (shadeOnly && !park.hasShade) return false
      if (fencedOnly && !park.isFenced) return false
      if (cafeOnly && !park.hasCafeNearby) return false
      if (requiredFeature && !park.features.includes(requiredFeature)) return false

      if (query) {
        const haystack = normalize([
          park.name,
          park.city,
          park.neighborhood,
          park.address,
          park.description,
          ...(park.nearbyCafes?.map((cafe) => cafe.name) ?? []),
        ].join(' '))
        if (!haystack.includes(query)) return false
      }

      return true
    })
  }, [age, allParks, appliedSearch, cafeOnly, city, fencedOnly, neighborhood, requiredFeature, shadeOnly])

  const recommendation = useMemo(() => getRecommendation(filteredParks), [filteredParks])

  const resetFilters = () => {
    setCity('all')
    setNeighborhood('all')
    setAge('all')
    setShadeOnly(false)
    setFencedOnly(false)
    setCafeOnly(false)
    setRequiredFeature(null)
    setSearchInput('')
    setAppliedSearch('')
  }

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCategory = (action: (typeof categoryCards)[number]['action']) => {
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

  return (
    <div className="ew-parks-page">
      <header className="ew-parks-header">
        <Link to="/" className="ew-parks-logo" aria-label="VidimoSe.hr pocetna">
          <img src="/logo.png" alt="" />
        </Link>

        <nav className="ew-parks-nav" aria-label="Glavna navigacija">
          <a href="/#aktivnosti">Aktivnosti</a>
          <Link to="/djecji-parkovi" className="is-active">Djecji parkovi</Link>
          <Link to="/kreiraj-pozivnicu">Rodendani</Link>
          <a href="/#vodic">Obiteljski vodic</a>
          <a href="/#blog">Blog</a>
        </nav>

        <div className="ew-parks-header__actions">
          <button type="button" className="ew-parks-plain-action">♡ Favoriti</button>
          <button type="button" className="ew-parks-plain-action">♙ Prijava</button>
          <button type="button" className="ew-parks-add-button" onClick={proposalAlert}>
            Dodaj park <span>+</span>
          </button>
        </div>
      </header>

      <main className="ew-parks-main">
        <section className="ew-parks-hero" aria-labelledby="parks-title">
          <div>
            <p className="ew-parks-eyebrow">🌿 VidimoSe.hr</p>
            <h1 id="parks-title">Djecji parkovi</h1>
            <p className="ew-parks-subtitle">
              Pronadi najbolji djecji park u blizini - prema dobi djeteta, hladu, sigurnosti i sadrzaju.
            </p>
          </div>
          <div className="ew-parks-hero__scene" aria-hidden="true">
            <span className="ew-parks-hero__sun" />
            <span className="ew-parks-hero__city" />
            <span className="ew-parks-hero__tree ew-parks-hero__tree--one" />
            <span className="ew-parks-hero__tree ew-parks-hero__tree--two" />
            <span className="ew-parks-hero__bench" />
          </div>
        </section>

        <form
          className="ew-parks-filters"
          onSubmit={(event) => {
            event.preventDefault()
            setAppliedSearch(searchInput)
          }}
        >
          <label className="ew-parks-filter">
            <span>📍</span>
            <select value={city} onChange={(event) => {
              setCity(event.target.value)
              setNeighborhood('all')
            }}>
              <option value="all">Grad</option>
              {cities.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="ew-parks-filter">
            <span>🏙️</span>
            <select value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)}>
              <option value="all">Kvart</option>
              {neighborhoods.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label className="ew-parks-filter">
            <span>🧒</span>
            <select value={age} onChange={(event) => setAge(event.target.value as AgeFilter)}>
              {ageOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="ew-parks-filter">
            <span>🌳</span>
            <select value={shadeOnly ? 'yes' : 'all'} onChange={(event) => setShadeOnly(event.target.value === 'yes')}>
              <option value="all">Ima hlad</option>
              <option value="yes">Samo s hladom</option>
            </select>
          </label>

          <label className="ew-parks-filter">
            <span>🪵</span>
            <select value={fencedOnly ? 'yes' : 'all'} onChange={(event) => setFencedOnly(event.target.value === 'yes')}>
              <option value="all">Ogradeno</option>
              <option value="yes">Samo ogradeno</option>
            </select>
          </label>

          <label className="ew-parks-filter">
            <span>☕</span>
            <select value={cafeOnly ? 'yes' : 'all'} onChange={(event) => setCafeOnly(event.target.value === 'yes')}>
              <option value="all">Kafic blizu</option>
              <option value="yes">Samo uz kafic</option>
            </select>
          </label>

          <label className="ew-parks-search">
            <span className="ew-parks-sr-only">Pretraga</span>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Pretrazi park, kvart ili kafic..."
            />
          </label>

          <button type="submit" className="ew-parks-search-button">
            🔍 Pronadi park
          </button>
        </form>

        <section className="ew-parks-layout" aria-label="Rezultati i karta">
          <div className="ew-parks-list">
            <div className="ew-parks-list__bar">
              <strong>{filteredParks.length} {filteredParks.length === 1 ? 'park' : 'parkova'}</strong>
              <button type="button" onClick={resetFilters}>Ocisti filtere</button>
            </div>

            {filteredParks.length === 0 ? (
              <div className="ew-parks-empty">
                <h2>Nismo pronasli parkove za odabrane filtere.</h2>
                <button type="button" onClick={resetFilters}>Ocisti filtere</button>
              </div>
            ) : (
              filteredParks.map((park) => (
                <ParkCard
                  key={park.id}
                  park={park}
                  isFavorite={favorites.has(park.id)}
                  onFavorite={() => toggleFavorite(park.id)}
                />
              ))
            )}
          </div>

          <aside className="ew-parks-side" aria-label="Karta i preporuka">
            <div>
              <h2 className="ew-parks-side__title">Parkovi na karti</h2>
              <ParksMap parks={filteredParks} />
            </div>

            <article className="ew-parks-recommendation">
              {recommendation ? (
                <>
                  <img src={recommendation.coverPhoto} alt="" loading="lazy" decoding="async" />
                  <div className="ew-parks-recommendation__body">
                    <p>✨ Preporuka za danas</p>
                    <h2>{recommendation.name}</h2>
                    <span>{recommendation.description}</span>
                    {recommendation.nearestCafeName ? (
                      <small>☕ {recommendation.nearestCafeName}</small>
                    ) : null}
                  </div>
                  <div className="ew-parks-recommendation__rating">
                    <strong>★ {recommendation.rating.toFixed(1)}</strong>
                    <span>Na temelju {recommendation.reviewCount} recenzija</span>
                  </div>
                </>
              ) : (
                <div className="ew-parks-recommendation__empty">
                  <p>Preporuka za danas</p>
                  <h2>Nema rezultata</h2>
                  <span>Ocisti filtere za novu preporuku.</span>
                </div>
              )}
            </article>
          </aside>
        </section>

        <section className="ew-parks-categories" aria-label="Brze kategorije">
          {categoryCards.map((category) => (
            <button
              key={category.title}
              type="button"
              className={`ew-parks-category ew-parks-category--${category.tone}`}
              onClick={() => handleCategory(category.action)}
            >
              <span>{category.icon}</span>
              <strong>{category.title}</strong>
              <small>{category.subtitle}</small>
              <b>›</b>
            </button>
          ))}
        </section>

        <section className="ew-parks-cta">
          <div>
            <span aria-hidden="true">🌳</span>
            <div>
              <h2>Ne vidis svoj omiljeni park?</h2>
              <p>Pomogni drugim roditeljima i predlozi novo igraliste!</p>
            </div>
          </div>
          <button type="button" onClick={proposalAlert}>
            + Predlozi park
          </button>
        </section>
      </main>
    </div>
  )
}
