import { useEffect, useMemo, useState } from 'react'

import { getPlaceEnrichment, type GooglePlaceEnrichment } from './placesApi'

type PlaceSource = {
  id: string
  name: string
  city?: string
  address?: string
  lat?: number
  lng?: number
  googlePlaceId?: string
}

export function useGooglePlaceEnrichment(source: PlaceSource | undefined, maxPhotos = 6) {
  const [result, setResult] = useState<{ sourceId: string; place: GooglePlaceEnrichment | null } | null>(null)

  const query = useMemo(() => {
    if (!source) return ''
    return [source.name, source.address, source.city, 'Hrvatska'].filter(Boolean).join(' ')
  }, [source])

  useEffect(() => {
    if (!source || !query) return

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
  const googlePlace = useGooglePlaceEnrichment(source, 1)
  return googlePhotoUris(googlePlace)[0] ?? fallbackPhoto
}
