import { venues, type Venue } from './landing-data'

function normalizeForMatch(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

export function findVenueByInvitationLocation(location: string): Venue | null {
  const raw = location.trim()
  if (!raw) {
    return null
  }

  const normalizedFull = normalizeForMatch(raw)
  const parts = raw.split(',').map((part) => part.trim()).filter(Boolean)
  const primary = parts[0] ?? raw
  const normalizedPrimary = normalizeForMatch(primary)

  let best: { venue: Venue; score: number } | null = null

  for (const venue of venues) {
    const normalizedName = normalizeForMatch(venue.name)
    let score = 0

    if (normalizedPrimary === normalizedName || normalizedFull === normalizedName) {
      score = 100
    } else if (
      normalizedPrimary.includes(normalizedName) ||
      normalizedName.includes(normalizedPrimary) ||
      normalizedFull.includes(normalizedName)
    ) {
      score = 85
    } else if (parts.some((part) => normalizeForMatch(part).includes(normalizedName))) {
      score = 70
    }

    const addressHead = normalizeForMatch(venue.address.split(',')[0] ?? '')
    if (addressHead.length > 4 && normalizedFull.includes(addressHead)) {
      score = Math.max(score, 65)
    }

    if (score > 0 && (!best || score > best.score)) {
      best = { venue, score }
    }
  }

  return best && best.score >= 70 ? best.venue : null
}
