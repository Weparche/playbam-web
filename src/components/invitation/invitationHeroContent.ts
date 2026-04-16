type MaybeString = string | null | undefined

/** Ista mapa za Open Graph (WhatsApp): `functions/_middleware.js` */
const INVITATION_BACKGROUND_MAP: Record<string, string> = {
  baloni: '/pozivnica-girl.png',
  konfeti: '/pozivnica-boys.png',
  zvjezdice: '/pozivnica-mix.png',
  'pozivnica-bg': '/pozivnica-girl.png',
  'pozivnica-bg1': '/pozivnica-mix.png',
  'pozivnica-boys': '/pozivnica-boys.png',
  'pozivnica-boys1': '/pozivnica-girls.png',
  'pozivnica-girl': '/pozivnica-girl.png',
  'pozivnica-boy': '/pozivnica-boy.png',
  'pozivnica-girls': '/pozivnica-girls.png',
  'pozivnica-mix': '/pozivnica-mix.png',
}

export function formatInvitationDateText(dateValue: string) {
  if (!dateValue.trim()) {
    return 'Datum uskoro'
  }

  const parsedDate = new Date(`${dateValue}T12:00:00`)
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue
  }

  const dayName = parsedDate
    .toLocaleDateString('hr-HR', { weekday: 'long' })
    .replace(/^./, (letter) => letter.toUpperCase())
  const [year, month, day] = dateValue.split('-')

  return `${dayName}, ${day}.${month}.${year}`
}

export function formatInvitationTimeText(timeValue: string) {
  const normalized = timeValue.trim()
  if (!normalized) {
    return 'Vrijeme uskoro'
  }

  if (normalized.includes('-') || /\bdo\b/i.test(normalized)) {
    return normalized
      .replace(/\s*-\s*/g, ' - ')
      .replace(/(\d{2}:\d{2})(?!h)/g, '$1h')
  }

  const [startHour = '15', startMinute = '00'] = normalized.split(':')
  const startTotalMinutes = Number(startHour) * 60 + Number(startMinute)
  const endTotalMinutes = startTotalMinutes + 120
  const endHour = String(Math.floor(endTotalMinutes / 60)).padStart(2, '0')
  const endMinute = String(endTotalMinutes % 60).padStart(2, '0')

  return `${normalized}h - ${endHour}:${endMinute}h`
}

/** Jedan red naslova za hero/preview. Znak `|` tretira se kao razmak. */
export function buildInvitationHeroTitle(title: string, celebrantName: string) {
  const normalized = title.trim().replace(/\s+/g, ' ')
  const merged = normalized.replace(/\|/g, ' ').replace(/\s+/g, ' ').trim()

  if (merged) {
    return merged
  }

  const fallbackName = celebrantName.trim() || 'Slavljenik'
  return `${fallbackName} slavi rođendan!`
}

export function resolveInvitationBackgroundImage(coverImage?: MaybeString, theme?: MaybeString) {
  const coverKey = coverImage?.trim().toLowerCase() ?? ''
  const themeKey = theme?.trim().toLowerCase() ?? ''

  if (INVITATION_BACKGROUND_MAP[coverKey]) {
    return INVITATION_BACKGROUND_MAP[coverKey]
  }

  if (INVITATION_BACKGROUND_MAP[themeKey]) {
    return INVITATION_BACKGROUND_MAP[themeKey]
  }

  return '/pozivnica-girl.png'
}
