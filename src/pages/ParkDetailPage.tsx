import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L, { type LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { loadParks } from '../data/load-parks'
import { parkFeatureLabels, type NearbyCafe, type Park } from '../data/parks-data'
import { getNearbyCafesFromPlaces, type GooglePlacesCafe } from '../lib/placesApi'
import Footer from '../components/landing/Footer'
import Navbar from '../components/landing/Navbar'
import '../styles/parks.css'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function pinIcon(kind: 'park' | 'cafe', label: string) {
  return L.divIcon({
    className: `ew-pd-pin ew-pd-pin--${kind}`,
    html: `
      <span class="ew-pd-pin__label">${escapeHtml(label)}</span>
      <span class="ew-pd-pin__dot" aria-hidden="true"></span>
    `,
    iconSize: [150, 48],
    iconAnchor: [75, 44],
    popupAnchor: [0, -42],
  })
}

type DetailCafe = NearbyCafe | GooglePlacesCafe

function cafeDistanceLabel(cafe: DetailCafe) {
  if (cafe.distanceMeters >= 1000) {
    return `${(cafe.distanceMeters / 1000).toFixed(1)} km`
  }

  return `${cafe.distanceMeters} m`
}

function mapsUrlForPark(park: Park) {
  return park.googleMapsUri ?? `https://www.google.com/maps/search/?api=1&query=${park.lat},${park.lng}`
}

function FitDetailBounds({ park, cafes }: { park: Park; cafes: DetailCafe[] }) {
  const map = useMap()

  useEffect(() => {
    const points: LatLngExpression[] = [[park.lat, park.lng], ...cafes.map((cafe) => [cafe.lat, cafe.lng] as LatLngExpression)]

    if (points.length === 1) {
      map.setView([park.lat, park.lng], 16)
      return
    }

    map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 17 })
  }, [cafes, map, park])

  return null
}

function useParkDetailCafes(park: Park | undefined) {
  const fallbackCafes = useMemo<DetailCafe[]>(() => park?.nearbyCafes ?? [], [park])
  const [googleResult, setGoogleResult] = useState<{ parkId: string; cafes: GooglePlacesCafe[] } | null>(null)

  useEffect(() => {
    if (!park) {
      return
    }

    let cancelled = false

    getNearbyCafesFromPlaces({
      lat: park.lat,
      lng: park.lng,
      radiusMeters: 700,
      maxResultCount: 6,
    })
      .then((cafes) => {
        if (!cancelled) setGoogleResult({ parkId: park.id, cafes })
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [park])

  const googleCafes = googleResult && googleResult.parkId === park?.id ? googleResult.cafes : null

  return {
    cafes: googleCafes && googleCafes.length > 0 ? googleCafes : fallbackCafes,
    source: googleCafes && googleCafes.length > 0 ? 'google' : 'local',
  }
}

function ParkDetailMap({ park, cafes }: { park: Park; cafes: DetailCafe[] }) {
  return (
    <div className="ew-pd-map" aria-label={`Karta lokacije za ${park.name}`}>
      <MapContainer
        center={[park.lat, park.lng]}
        zoom={16}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitDetailBounds park={park} cafes={cafes} />
        <Marker position={[park.lat, park.lng]} icon={pinIcon('park', park.name)}>
          <Popup>
            <strong>{park.name}</strong>
            <br />
            {park.address}
          </Popup>
        </Marker>
        {cafes.map((cafe) => (
          <Marker key={cafe.id} position={[cafe.lat, cafe.lng]} icon={pinIcon('cafe', cafe.name)}>
            <Popup>
              <strong>{cafe.name}</strong>
              <br />
              {cafeDistanceLabel(cafe)} od parka
              {cafe.rating ? (
                <>
                  <br />
                  Ocjena {cafe.rating.toFixed(1)}
                  {cafe.reviewCount ? ` (${cafe.reviewCount})` : ''}
                </>
              ) : null}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default function ParkDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const parks = useMemo(() => loadParks(), [])
  const park = parks.find((item) => item.slug === slug)
  const { cafes, source: cafeSource } = useParkDetailCafes(park)

  const relatedParks = useMemo(() => {
    if (!park) return []
    return parks
      .filter((item) => item.id !== park.id && (item.neighborhood === park.neighborhood || item.city === park.city))
      .slice(0, 3)
  }, [park, parks])

  if (!park) return <Navigate to="/djecji-parkovi" replace />

  const mapsUrl = mapsUrlForPark(park)

  return (
    <div className="ew-landing ew-pp-page ew-pd-page">
      <a className="ew-skip-link" href="#main">Preskoči na sadržaj</a>
      <Navbar opaque />

      <main id="main">
        <div className="ew-vd-breadcrumb ew-pd-breadcrumb">
          <div className="ew-container">
            <Link to="/" className="ew-vd-breadcrumb__link">Početna</Link>
            <span className="ew-vd-breadcrumb__sep">›</span>
            <Link to="/djecji-parkovi" className="ew-vd-breadcrumb__link">Dječji parkovi</Link>
            <span className="ew-vd-breadcrumb__sep">›</span>
            <span className="ew-vd-breadcrumb__current">{park.name}</span>
          </div>
        </div>

        <section className="ew-pd-hero">
          <div className="ew-container ew-pd-hero__grid">
            <div className="ew-pd-hero__copy">
              <p className="ew-eyebrow">Park u kvartu {park.neighborhood}</p>
              <h1 className="ew-h1 ew-pd-title">{park.name}</h1>
              <p className="ew-body-lg ew-pd-lead">{park.description}</p>
              <div className="ew-pd-actions">
                <Link
                  to={`/kreiraj-pozivnicu?lokacija=${encodeURIComponent(park.name)}&adresa=${encodeURIComponent(park.address)}`}
                  className="ew-btn-primary"
                >
                  Kreiraj pozivnicu ovdje
                </Link>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="ew-btn-secondary">
                  Otvori u Google Maps
                </a>
              </div>
            </div>
            <img
              className="ew-pd-hero__image"
              src={park.coverPhoto}
              alt={park.name}
              loading="eager"
              decoding="async"
            />
          </div>
        </section>

        <section className="ew-pd-body">
          <div className="ew-container ew-pd-layout">
            <div className="ew-pd-main">
              <section className="ew-pd-section">
                <div className="ew-pd-section__head">
                  <h2>Lokacija i kafići u blizini</h2>
                  <p>
                    Plavi pin označava točnu poziciju parka, a zeleni pinovi najbliže kafiće
                    {cafeSource === 'google' ? ' iz Google Places podataka.' : ' iz lokalnih podataka parka.'}
                  </p>
                </div>
                <ParkDetailMap park={park} cafes={cafes} />
              </section>

              <section className="ew-pd-section">
                <div className="ew-pd-section__head">
                  <h2>Kafići u blizini</h2>
                  <p>Dobro za brz dogovor gdje roditelji čekaju ili uzimaju kavu nakon igre.</p>
                </div>
                {cafes.length > 0 ? (
                  <div className="ew-pd-cafes">
                    {cafes.map((cafe) => (
                      <article key={cafe.id} className="ew-pd-cafe">
                        <div>
                          <h3>{cafe.name}</h3>
                          <p>
                            {cafeDistanceLabel(cafe)}
                            {cafe.address ? ` · ${cafe.address}` : ''}
                          </p>
                        </div>
                        {cafe.rating ? (
                          <span className="ew-pd-cafe__rating">
                            ★ {cafe.rating.toFixed(1)}
                            {cafe.reviewCount ? ` (${cafe.reviewCount})` : ''}
                          </span>
                        ) : null}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="ew-pd-empty">Za ovaj park još nemamo provjerene kafiće u blizini.</p>
                )}
              </section>
            </div>

            <aside className="ew-pd-sidebar" aria-label="Sažetak parka">
              <div className="ew-pd-card">
                <h2>Brzi pregled</h2>
                <dl className="ew-pd-facts">
                  <div>
                    <dt>Ocjena</dt>
                    <dd>★ {park.rating.toFixed(1)} ({park.reviewCount})</dd>
                  </div>
                  <div>
                    <dt>Dob</dt>
                    <dd>{park.ageRange} god.</dd>
                  </div>
                  <div>
                    <dt>Adresa</dt>
                    <dd>{park.address}</dd>
                  </div>
                  <div>
                    <dt>Kafić</dt>
                    <dd>{park.nearestCafeName ?? 'Nije upisan'}</dd>
                  </div>
                </dl>
              </div>

              <div className="ew-pd-card">
                <h2>Sadržaji</h2>
                <div className="ew-pd-tags">
                  {park.features.map((feature) => (
                    <span key={feature}>{parkFeatureLabels[feature]}</span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>

        {relatedParks.length > 0 ? (
          <section className="ew-pd-more">
            <div className="ew-container">
              <h2 className="ew-h3 ew-pd-more__title">Još parkova u blizini</h2>
              <div className="ew-pd-more__grid">
                {relatedParks.map((item) => (
                  <Link key={item.id} to={`/djecji-parkovi/${item.slug}`} className="ew-pd-mini">
                    <img src={item.coverPhoto} alt={item.name} loading="lazy" decoding="async" />
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.neighborhood} · ★ {item.rating.toFixed(1)}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/djecji-parkovi" className="ew-vd-more__all">← Svi dječji parkovi</Link>
            </div>
          </section>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}
