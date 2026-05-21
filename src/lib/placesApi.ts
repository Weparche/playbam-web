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
