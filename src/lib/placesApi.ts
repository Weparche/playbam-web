import type { NearbyCafe } from '../data/parks-data'

function shouldUseSameOriginApi() {
  if (typeof window === 'undefined') {
    return false
  }

  const host = window.location.hostname.toLowerCase()
  return host.endsWith('.pages.dev')
}

const RAW_API_BASE = import.meta.env.DEV
  ? ''
  : shouldUseSameOriginApi()
    ? ''
    : (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function getProtocolSafeApiBase(base: string) {
  if (!base || typeof window === 'undefined') {
    return base
  }

  if (window.location.protocol !== 'https:' || !base.startsWith('http://')) {
    return base
  }

  return `https://${base.slice('http://'.length)}`
}

const API_BASE = getProtocolSafeApiBase(RAW_API_BASE)

export type GooglePlacesCafe = NearbyCafe & {
  resourceName?: string | null
  openNow?: boolean | null
  businessStatus?: string | null
  photoName?: string | null
  photoAttributions?: Array<{
    displayName: string | null
    uri: string | null
    photoUri: string | null
  }>
}

export type GooglePlacePhoto = {
  name: string | null
  widthPx: number | null
  heightPx: number | null
  uri: string | null
  attributions: Array<{
    displayName: string | null
    uri: string | null
    photoUri: string | null
  }>
}

export type GooglePlaceEnrichment = {
  id: string
  placeId: string
  resourceName: string | null
  name: string | null
  address: string | null
  shortAddress: string | null
  lat: number | null
  lng: number | null
  rating: number | null
  reviewCount: number | null
  phone: string | null
  website: string | null
  googleMapsUri: string | null
  businessStatus: string | null
  types: string[]
  primaryType: string | null
  goodForChildren: boolean | null
  restroom: boolean | null
  regularOpeningHours: {
    openNow: boolean | null
    weekdayDescriptions: string[]
  } | null
  currentOpeningHours: {
    openNow: boolean | null
    weekdayDescriptions: string[]
  } | null
  photos: GooglePlacePhoto[]
}

export async function getNearbyCafesFromPlaces({
  lat,
  lng,
  radiusMeters = 1500,
  maxResultCount = 6,
}: {
  lat: number
  lng: number
  radiusMeters?: number
  maxResultCount?: number
}) {
  const url = new URL(`${API_BASE}/api/places/nearby-cafes`, window.location.origin)
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lng', String(lng))
  url.searchParams.set('radiusMeters', String(radiusMeters))
  url.searchParams.set('maxResultCount', String(maxResultCount))
  url.searchParams.set('languageCode', 'hr')

  const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`GOOGLE_PLACES_CAFES_${response.status}`)
  }

  const data = (await response.json()) as { cafes?: GooglePlacesCafe[] }
  return Array.isArray(data.cafes) ? data.cafes : []
}

export async function getPlaceEnrichment({
  query,
  placeId,
  lat,
  lng,
  radiusMeters = 2500,
  maxPhotos = 6,
}: {
  query: string
  placeId?: string | null
  lat?: number | null
  lng?: number | null
  radiusMeters?: number
  maxPhotos?: number
}) {
  const url = new URL(`${API_BASE}/api/places/enrich`, window.location.origin)
  url.searchParams.set('query', query)
  if (placeId) url.searchParams.set('placeId', placeId)
  if (typeof lat === 'number') url.searchParams.set('lat', String(lat))
  if (typeof lng === 'number') url.searchParams.set('lng', String(lng))
  url.searchParams.set('radiusMeters', String(radiusMeters))
  url.searchParams.set('maxPhotos', String(maxPhotos))
  url.searchParams.set('languageCode', 'hr')

  const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`GOOGLE_PLACES_ENRICH_${response.status}`)
  }

  const data = (await response.json()) as { place?: GooglePlaceEnrichment | null }
  return data.place ?? null
}

export type GoogleCoverPhotoRequest = {
  id: string
  name: string
  city?: string
  address?: string
  lat?: number
  lng?: number
  googlePlaceId?: string
}

export async function getPlaceCoverPhotos(places: GoogleCoverPhotoRequest[]) {
  if (places.length === 0) return {}

  const url = new URL(`${API_BASE}/api/places/covers`, window.location.origin)
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ places }),
  })

  if (!response.ok) {
    throw new Error(`GOOGLE_PLACES_COVERS_${response.status}`)
  }

  const data = (await response.json()) as { covers?: Record<string, string | null> }
  return data.covers ?? {}
}
