import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import L, { type LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

import { REGION_CENTERS, type RegionKey, type Venue } from '../../lib/landing-data'
import { formatKm, haversineKm, type LatLng } from '../../lib/distance'
import { lockScroll, unlockScroll } from '../../lib/scrollLock'

import './VenuesMapModal.css'

/** Varijacije smjera + offset za trajne nazive kod pinova — blizu pina, blagi nudge protiv preklapanja */
const LABEL_PLACEMENTS = [
  { direction: 'top' as const, offset: [0, -30] as [number, number] },
  { direction: 'top' as const, offset: [14, -28] as [number, number] },
  { direction: 'top' as const, offset: [-14, -28] as [number, number] },
  { direction: 'top' as const, offset: [10, -32] as [number, number] },
  { direction: 'top' as const, offset: [-10, -32] as [number, number] },
  { direction: 'top' as const, offset: [18, -26] as [number, number] },
  { direction: 'top' as const, offset: [-18, -26] as [number, number] },
  { direction: 'bottom' as const, offset: [0, 36] as [number, number] },
  { direction: 'bottom' as const, offset: [12, 34] as [number, number] },
  { direction: 'left' as const, offset: [-8, -22] as [number, number] },
  { direction: 'right' as const, offset: [8, -22] as [number, number] },
  { direction: 'right' as const, offset: [10, -8] as [number, number] },
]

function tooltipPlacementForVenueId(id: string): (typeof LABEL_PLACEMENTS)[number] {
  let h = 2166136261 >>> 0
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return LABEL_PLACEMENTS[(h >>> 0) % LABEL_PLACEMENTS.length]
}

L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

const venueIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const userIcon = L.divIcon({
  className: 'ew-vp-user-pin',
  html: `<span class="ew-vp-user-pin__core" aria-hidden="true"></span><span class="ew-vp-user-pin__pulse" aria-hidden="true"></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

type FilteredVenue = Venue & { _km?: number }

type Props = {
  venues: FilteredVenue[]
  userLoc: LatLng | null
  region: RegionKey
  onClose: () => void
}

function FitBounds({ points }: { points: LatLngExpression[] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0] as LatLngExpression, 12, { animate: false })
      return
    }
    const bounds = L.latLngBounds(points as L.LatLngExpression[])
    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 13 })
  }, [map, points])
  return null
}

function FlyToVenue({ lat, lng, trigger }: { lat: number | null; lng: number | null; trigger: number }) {
  const map = useMap()
  useEffect(() => {
    if (lat == null || lng == null || trigger === 0) return
    map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 0.45 })
  }, [map, lat, lng, trigger])
  return null
}

const LIST_DESC_MAX = 400

export default function VenuesMapModal({ venues, userLoc, region, onClose }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const previouslyFocused = useRef<Element | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [flyTrigger, setFlyTrigger] = useState(0)
  const [flyCoords, setFlyCoords] = useState<{ lat: number; lng: number } | null>(null)

  const filteredVenues = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return venues
    return venues.filter(
      v => v.name.toLowerCase().includes(q) || v.address.toLowerCase().includes(q),
    )
  }, [venues, searchQuery])

  useEffect(() => {
    previouslyFocused.current = document.activeElement
    lockScroll()
    closeBtnRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      unlockScroll()
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus()
      }
    }
  }, [onClose])

  const center: LatLngExpression = useMemo(() => {
    if (userLoc) return [userLoc.lat, userLoc.lng]
    if (filteredVenues.length > 0) return [filteredVenues[0].lat, filteredVenues[0].lng]
    const c = REGION_CENTERS[region]
    return [c.lat, c.lng]
  }, [userLoc, filteredVenues, region])

  const fitPoints: LatLngExpression[] = useMemo(() => {
    const pts: LatLngExpression[] = filteredVenues.map(v => [v.lat, v.lng])
    if (userLoc) pts.push([userLoc.lat, userLoc.lng])
    return pts
  }, [filteredVenues, userLoc])

  const handleListVenueActivate = (v: FilteredVenue) => {
    setActiveId(v.id)
    setFlyCoords({ lat: v.lat, lng: v.lng })
    setFlyTrigger(t => t + 1)
  }

  const handleMarkerActivate = (v: FilteredVenue) => {
    setActiveId(v.id)
    requestAnimationFrame(() => {
      document.getElementById(`ew-map-list-${v.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  return (
    <div
      className="ew-vp-mapmodal"
      role="dialog"
      aria-modal="true"
      aria-label="Karta igraonica"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="ew-vp-mapmodal__panel">
        <div className="ew-vp-mapmodal__header">
          <div className="ew-vp-mapmodal__header-inner">
            <div>
              <h2 className="ew-vp-mapmodal__title" id="mapmodal-title">
                Igraonice na karti
              </h2>
              <p className="ew-vp-mapmodal__sub">
                Ukupno {venues.length}{' '}
                {venues.length === 1 ? 'igraonica' : venues.length < 5 ? 'igraonice' : 'igraonica'} na karti
                {filteredVenues.length !== venues.length
                  ? ` · prikazano ${filteredVenues.length} uz pretragu`
                  : ''}
                {userLoc ? ' · tvoja lokacija je označena plavom točkicom' : ''}
              </p>
            </div>
            <div className="ew-vp-mapmodal__search-wrap">
              <label className="ew-vp-mapmodal__search-label" htmlFor="ew-vp-map-search">
                Pretraži po imenu ili adresi
              </label>
              <div className="ew-vp-mapmodal__search-inner">
                <svg className="ew-vp-mapmodal__search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  id="ew-vp-map-search"
                  type="search"
                  className="ew-vp-mapmodal__search"
                  placeholder="Tipkaj ime igraonice ili ulicu…"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value)
                    setActiveId(null)
                  }}
                  autoComplete="off"
                  aria-describedby="mapmodal-title"
                />
              </div>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="ew-vp-mapmodal__close"
            onClick={onClose}
            aria-label="Zatvori kartu"
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="ew-vp-mapmodal__body">
          <aside className="ew-vp-mapmodal__aside" aria-label="Popis igraonica">
            <p className="ew-vp-mapmodal__aside-hint ew-vp-mapmodal__aside-hint--desktop">
              {filteredVenues.length === 0
                ? 'Nema igraonica koje odgovaraju pretrazi.'
                : 'Odaberi lokaciju — karta će se približiti.'}
            </p>
            <div className="ew-vp-mapmodal__list" role="list">
              {filteredVenues.map(v => {
                const km = userLoc ? (v._km ?? haversineKm(userLoc, { lat: v.lat, lng: v.lng })) : null
                const desc =
                  v.description.length > LIST_DESC_MAX
                    ? `${v.description.slice(0, LIST_DESC_MAX).trim()}…`
                    : v.description
                return (
                  <div key={v.id} id={`ew-map-list-${v.id}`} role="listitem" className="ew-vp-mapmodal__list-item-wrap">
                    <article className="ew-vp-mapmodal__article">
                      <button
                        type="button"
                        className={`ew-vp-mapmodal__card${activeId === v.id ? ' is-active' : ''}`}
                        onClick={() => handleListVenueActivate(v)}
                      >
                        <img
                          className="ew-vp-mapmodal__card-img"
                          src={v.coverPhoto}
                          alt=""
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="ew-vp-mapmodal__card-body">
                          <div className="ew-vp-mapmodal__card-top">
                            <h3 className="ew-vp-mapmodal__card-name">{v.name}</h3>
                            <span className="ew-vp-mapmodal__card-rating" aria-label={`Ocjena ${v.rating}`}>
                              ★ {v.rating.toFixed(1)}
                            </span>
                          </div>
                          <p className="ew-vp-mapmodal__card-address">{v.address}</p>
                          <p className="ew-vp-mapmodal__card-desc">{desc}</p>
                        </div>
                      </button>
                      <div className="ew-vp-mapmodal__card-meta-row ew-vp-mapmodal__card-meta-row--footer">
                        {km !== null && (
                          <span className="ew-vp-mapmodal__card-km">{formatKm(km)} od tebe</span>
                        )}
                        <Link
                          to={`/igraonice/${v.slug}`}
                          className="ew-vp-mapmodal__cta"
                          onClick={() => onClose()}
                        >
                          <span>Više informacija na webu</span>
                          <svg viewBox="0 0 20 20" fill="none" className="ew-vp-mapmodal__cta-arrow" aria-hidden="true">
                            <path d="M4 10h11M12 6l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Link>
                      </div>
                    </article>
                  </div>
                )
              })}
            </div>
          </aside>

          <div className="ew-vp-mapmodal__map">
            <MapContainer
              center={center}
              zoom={11}
              scrollWheelZoom
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds points={fitPoints} />
              <FlyToVenue
                lat={flyCoords?.lat ?? null}
                lng={flyCoords?.lng ?? null}
                trigger={flyTrigger}
              />

              {userLoc && (
                <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
                  <Popup>
                    <strong>Tvoja lokacija</strong>
                  </Popup>
                </Marker>
              )}

              {filteredVenues.map(v => {
                const km = userLoc ? (v._km ?? haversineKm(userLoc, { lat: v.lat, lng: v.lng })) : null
                const tp = tooltipPlacementForVenueId(v.id)
                return (
                  <Marker
                    key={v.id}
                    position={[v.lat, v.lng]}
                    icon={venueIcon}
                    eventHandlers={{ click: () => handleMarkerActivate(v) }}
                  >
                    <Tooltip permanent direction={tp.direction} offset={tp.offset} className="ew-vp-map-label">
                      <span className="ew-vp-map-label__inner">
                        <span className="ew-vp-map-label__title">{v.name}</span>
                        <span className="ew-vp-map-label__rating">★ {v.rating.toFixed(1)}</span>
                      </span>
                    </Tooltip>
                    <Popup>
                      <div className="ew-vp-map-popup">
                        <div className="ew-vp-map-popup__name">{v.name}</div>
                        <div className="ew-vp-map-popup__meta">
                          ★ {v.rating.toFixed(1)} · {v.ageRange} god. · od {v.pricePerChild}€/dijete
                        </div>
                        <div className="ew-vp-map-popup__address">{v.address}</div>
                        {km !== null && (
                          <div className="ew-vp-map-popup__distance">{formatKm(km)} od tebe</div>
                        )}
                        <Link
                          to={`/igraonice/${v.slug}`}
                          className="ew-vp-mapmodal__cta ew-vp-mapmodal__cta--popup"
                          onClick={onClose}
                        >
                          <span>Detalji na webu</span>
                          <svg viewBox="0 0 20 20" fill="none" className="ew-vp-mapmodal__cta-arrow" aria-hidden="true">
                            <path d="M4 10h11M12 6l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
