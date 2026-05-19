import { parks, type Park } from './parks-data'

export type LoadParksParams = {
  city?: string
}

export function loadParks(params: LoadParksParams = {}): Park[] {
  const city = params.city?.trim().toLowerCase()

  // Future handoff point:
  // replace this local return with a backend-backed GET /api/parks?city=...
  // once the API exists. This first phase intentionally performs no fetch.
  if (!city) {
    return parks
  }

  return parks.filter((park) => park.city.toLowerCase() === city)
}
