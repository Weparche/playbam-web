import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import L, { type LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

import { REGION_CENTERS, type RegionKey, type Venue } from '../../lib/landing-data'
import { formatKm, haversineKm, type LatLng } from '../../lib/distance'

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
  className: 'ew-pp-userMarker',
  html: '<span aria-hidden="true"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

type FilteredVenue = Venue & { _km?: number }

type Props = {
  venues: FilteredVenue[]
  userLoc: LatLng | null
  region: RegionKey
  focusCoords?: LatLng | null
  flyTrigger?: number
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
    map.fitBounds(bounds, { padding: [34, 34], maxZoom: 14 })
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

export default function VenuesMap({
  venues,
  userLoc,
  region,
  focusCoords = null,
  flyTrigger = 0,
}: Props) {
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
    <div className="ew-pp-map" aria-label="Igraonice na karti">
      <MapContainer center={center} zoom={11} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={fitPoints} />
        <FlyToVenue
          lat={focusCoords?.lat ?? null}
          lng={focusCoords?.lng ?? null}
          trigger={flyTrigger}
        />

        {userLoc ? (
          <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon}>
            <Popup>
              <span className="ew-pp-popupLabel">Tvoja lokacija</span>
            </Popup>
          </Marker>
        ) : null}

        {venues.map(v => {
          const km = userLoc ? (v._km ?? haversineKm(userLoc, { lat: v.lat, lng: v.lng })) : null
          const tp = tooltipPlacementForVenueId(v.id)
          return (
            <Marker key={v.id} position={[v.lat, v.lng]} icon={venueIcon}>
              <Tooltip permanent direction={tp.direction} offset={tp.offset} className="ew-pp-map-label">
                <span className="ew-pp-map-label__inner">
                  <span className="ew-pp-map-label__title">{v.name}</span>
                  <span className="ew-pp-map-label__rating">★ {v.rating.toFixed(1)}</span>
                </span>
              </Tooltip>
              <Popup>
                <div className="ew-pp-popup">
                  <strong>{v.name}</strong>
                  <span>
                    ★ {v.rating.toFixed(1)} · {v.ageRange} god. · od {v.pricePerChild}€/dijete
                  </span>
                  <span>{v.address}</span>
                  {km !== null ? <span>{formatKm(km)} od tebe</span> : null}
                  <Link to={`/igraonice/${v.slug}`}>Vidi detalje</Link>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
