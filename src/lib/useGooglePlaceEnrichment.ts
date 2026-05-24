import { useEffect, useMemo, useState } from 'react'

import { getPlaceCoverPhotos, getPlaceEnrichment, type GooglePlaceEnrichment } from './placesApi'

type PlaceSource = {
  id: string
  name: string
  city?: string
  address?: string
  lat?: number
  lng?: number
  googlePlaceId?: string
  skipGooglePlaces?: boolean
}

type CoverPhotoCacheEntry = {
  photo: string | null
  ts: number
}

type CoverPhotoSource = PlaceSource & {
  fallbackPhoto: string
}

const COVER_CACHE_PREFIX = 'vidimose-google-cover:'
const COVER_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7
const COVER_CACHE_MISS_TTL_MS = 1000 * 60 * 60 * 6
const coverPhotoMemoryCache = new Map<string, CoverPhotoCacheEntry>()
const coverPhotoBatchInFlight = new Map<string, Promise<Record<string, string | null>>>()

function getCoverCacheKey(source: PlaceSource) {
  return `${COVER_CACHE_PREFIX}${source.googlePlaceId || source.id}`
}

function isFreshCoverCache(entry: CoverPhotoCacheEntry) {
  const ttl = entry.photo ? COVER_CACHE_TTL_MS : COVER_CACHE_MISS_TTL_MS
  return Date.now() - entry.ts < ttl
}

function readCoverPhotoCache(key: string) {
  const memoryEntry = coverPhotoMemoryCache.get(key)
  if (memoryEntry && isFreshCoverCache(memoryEntry)) return memoryEntry

  if (typeof window === 'undefined') return null

  try {
    const stored = window.localStorage.getItem(key)
    if (!stored) return null

    const parsed = JSON.parse(stored) as CoverPhotoCacheEntry
    if (!parsed || typeof parsed.ts !== 'number' || (parsed.photo !== null && typeof parsed.photo !== 'string')) {
      window.localStorage.removeItem(key)
      return null
    }

    if (!isFreshCoverCache(parsed)) {
      window.localStorage.removeItem(key)
      coverPhotoMemoryCache.delete(key)
      return null
    }

    coverPhotoMemoryCache.set(key, parsed)
    return parsed
  } catch {
    return null
  }
}

function writeCoverPhotoCache(key: string, photo: string | null) {
  const entry: CoverPhotoCacheEntry = { photo, ts: Date.now() }
  coverPhotoMemoryCache.set(key, entry)

  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // localStorage can be unavailable or full; memory cache still prevents duplicate calls in this tab.
  }
}

export function useGooglePlaceEnrichment(source: PlaceSource | undefined, maxPhotos = 6) {
  const [result, setResult] = useState<{ sourceId: string; place: GooglePlaceEnrichment | null } | null>(null)

  const query = useMemo(() => {
    if (!source) return ''
    return [source.name, source.address, source.city, 'Hrvatska'].filter(Boolean).join(' ')
  }, [source])

  useEffect(() => {
    if (!source || !query || source.skipGooglePlaces) return

    let cancelled = false

    getPlaceEnrichment({
      query,
      placeId: source.googlePlaceId,
      lat: source.lat,
      lng: source.lng,
      maxPhotos,
    })
      .then((place) => {
        if (!cancelled) setResult({ sourceId: source.id, place })
      })
      .catch(() => {
        if (!cancelled) setResult({ sourceId: source.id, place: null })
      })

    return () => {
      cancelled = true
    }
  }, [maxPhotos, query, source])

  return result && result.sourceId === source?.id ? result.place : null
}

export function googlePhotoUris(place: GooglePlaceEnrichment | null | undefined) {
  return place?.photos.map((photo) => photo.uri).filter((uri): uri is string => Boolean(uri)) ?? []
}

export function useGoogleCoverPhoto(source: PlaceSource | undefined, fallbackPhoto: string) {
  const cacheKey = useMemo(() => (source ? getCoverCacheKey(source) : ''), [source])
  const [coverPhoto, setCoverPhoto] = useState(() => {
    if (!cacheKey) return fallbackPhoto
    return readCoverPhotoCache(cacheKey)?.photo ?? fallbackPhoto
  })

  const query = useMemo(() => {
    if (!source) return ''
    return [source.name, source.address, source.city, 'Hrvatska'].filter(Boolean).join(' ')
  }, [source])

  useEffect(() => {
    if (!source || !query || !cacheKey) {
      setCoverPhoto(fallbackPhoto)
      return
    }

    if (source.skipGooglePlaces) {
      setCoverPhoto(fallbackPhoto)
      return
    }

    const cached = readCoverPhotoCache(cacheKey)
    if (cached) {
      setCoverPhoto(cached.photo ?? fallbackPhoto)
      return
    }

    let cancelled = false

    getPlaceEnrichment({
      query,
      placeId: source.googlePlaceId,
      lat: source.lat,
      lng: source.lng,
      maxPhotos: 1,
    })
      .then((place) => {
        const photo = googlePhotoUris(place)[0] ?? null
        writeCoverPhotoCache(cacheKey, photo)
        if (!cancelled) setCoverPhoto(photo ?? fallbackPhoto)
      })
      .catch(() => {
        writeCoverPhotoCache(cacheKey, null)
        if (!cancelled) setCoverPhoto(fallbackPhoto)
      })

    return () => {
      cancelled = true
    }
  }, [cacheKey, fallbackPhoto, query, source])

  return coverPhoto
}

export function useGoogleCoverPhotos(sources: CoverPhotoSource[]) {
  const signature = useMemo(
    () =>
      sources
        .map((source) =>
          [
            source.id,
            source.googlePlaceId ?? '',
            source.name,
            source.address ?? '',
            source.city ?? '',
            source.lat ?? '',
            source.lng ?? '',
            source.fallbackPhoto,
          ].join('~'),
        )
        .join('|'),
    [sources],
  )

  const [coverPhotos, setCoverPhotos] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const source of sources) {
      if (source.skipGooglePlaces) {
        initial[source.id] = source.fallbackPhoto
        continue
      }
      const cached = readCoverPhotoCache(getCoverCacheKey(source))
      initial[source.id] = cached?.photo ?? source.fallbackPhoto
    }
    return initial
  })

  useEffect(() => {
    const next: Record<string, string> = {}
    const missing: CoverPhotoSource[] = []

    for (const source of sources) {
      if (source.skipGooglePlaces) {
        next[source.id] = source.fallbackPhoto
        continue
      }
      const cached = readCoverPhotoCache(getCoverCacheKey(source))
      next[source.id] = cached?.photo ?? source.fallbackPhoto
      if (!cached) missing.push(source)
    }

    setCoverPhotos(next)

    if (missing.length === 0) return

    let cancelled = false
    const requestKey = missing.map((source) => getCoverCacheKey(source)).sort().join('|')
    let request = coverPhotoBatchInFlight.get(requestKey)

    if (!request) {
      request = getPlaceCoverPhotos(
        missing.map((source) => ({
          id: source.id,
          name: source.name,
          city: source.city,
          address: source.address,
          lat: source.lat,
          lng: source.lng,
          googlePlaceId: source.googlePlaceId,
        })),
      ).finally(() => {
        coverPhotoBatchInFlight.delete(requestKey)
      })
      coverPhotoBatchInFlight.set(requestKey, request)
    }

    request
      .then((covers) => {
        const resolved: Record<string, string> = {}

        for (const source of sources) {
          const cacheKey = getCoverCacheKey(source)
          const photo = source.id in covers ? covers[source.id] : readCoverPhotoCache(cacheKey)?.photo

          if (source.id in covers) {
            writeCoverPhotoCache(cacheKey, photo ?? null)
          }

          resolved[source.id] = photo ?? source.fallbackPhoto
        }

        if (!cancelled) setCoverPhotos(resolved)
      })
      .catch(() => {
        for (const source of missing) {
          writeCoverPhotoCache(getCoverCacheKey(source), null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [signature])

  return coverPhotos
}
