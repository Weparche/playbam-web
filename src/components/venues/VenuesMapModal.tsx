import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L, { type LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

import { REGION_CENTERS, type RegionKey, type Venue } from '../../lib/landing-data'
import { formatKm, haversineKm, type LatLng } from '../../lib/distance'
import { lockScroll, unlockScroll } from '../../lib/scrollLock'

import './VenuesMapModal.css'

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
      map.setView(points[0] as LatLngExpression, 13, { animate: false })
      return
    }
    const bounds = L.latLngBounds(points as L.LatLngExpression[])
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
  }, [map, points])
  return null
}

export default function VenuesMapModal({ venues, userLoc, region, onClose }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const previouslyFocused = useRef<Element | null>(null)

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
    if (venues.length > 0) return [venues[0].lat, venues[0].lng]
    const c = REGION_CENTERS[region]
    return [c.lat, c.lng]
  }, [userLoc, venues, region])

  const fitPoints: LatLngExpression[] = useMemo(() => {
    const pts: LatLngExpression[] = venues.map(v => [v.lat, v.lng])
    if (userLoc) pts.push([userLoc.lat, userLoc.lng])
    return pts
  }, [venues, userLoc])

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
          <div>
            <h2 className="ew-vp-mapmodal__title">Igraonice na karti</h2>
            <p className="ew-vp-mapmodal__sub">
              {venues.length} {venues.length === 1 ? 'igraonica' : venues.length < 5 ? 'igraonice' : 'igraonica'}
              {userLoc ? ' · tvoja lokacija je prikazana plavom točkicom' : ''}
            </p>
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

            {userLoc && (
              <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
                <Popup>
                  <strong>Tvoja lokacija</strong>
                </Popup>
              </Marker>
            )}

            {venues.map(v => {
              const km = userLoc ? (v._km ?? haversineKm(userLoc, { lat: v.lat, lng: v.lng })) : null
              return (
                <Marker key={v.id} position={[v.lat, v.lng]} icon={venueIcon}>
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
                        className="ew-vp-map-popup__cta"
                        onClick={onClose}
                      >
                        Detalji →
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
  )
}
