type MaybeString = string | null | undefined

const INVITATION_BACKGROUND_MAP: Record<string, string> = {
  baloni: '/pozivnica-bg.png',
  konfeti: '/pozivnica-boys.png',
  zvjezdice: '/pozivnica-bg1.png',
  'pozivnica-bg': '/pozivnica-bg.png',
  'pozivnica-bg1': '/pozivnica-bg1.png',
  'pozivnica-boys': '/pozivnica-boys.png',
  'pozivnica-boys1': '/pozivnica-boys1.png',
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

  return `${dayName}, ${day}-${month}.${year}`
}

export function formatInvitationTimeText(timeValue: string) {
  const normalized = timeValue.trim()
  if (!normalized) {
    return 'Vrijeme uskoro'
  }

  if (normalized.includes('-') || /\bdo\b/i.test(normalized)) {
    return normalized.replace(/\s*-\s*/g, ' - ')
  }

  const [startHour = '15', startMinute = '00'] = normalized.split(':')
  const startTotalMinutes = Number(startHour) * 60 + Number(startMinute)
  const endTotalMinutes = startTotalMinutes + 120
  const endHour = String(Math.floor(endTotalMinutes / 60)).padStart(2, '0')
  const endMinute = String(endTotalMinutes % 60).padStart(2, '0')

  return `${normalized} - ${endHour}:${endMinute}`
}

export function buildInvitationHeroTitle(title: string, celebrantName: string) {
  const normalized = title.trim().replace(/\s+/g, ' ')
  if (normalized.includes('|')) {
    return normalized
  }

  if (normalized) {
    const words = normalized.split(' ')
    if (words.length <= 2) {
      return normalized
    }

    const middleIndex = Math.ceil(words.length / 2)
    return `${words.slice(0, middleIndex).join(' ')}|${words.slice(middleIndex).join(' ')}`
  }

  const fallbackName = celebrantName.trim() || 'Slavljenik'
  return `${fallbackName} slavi|rođendan!`
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

  return '/pozivnica-bg.png'
}
