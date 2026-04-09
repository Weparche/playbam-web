export type CoverTheme = 'konfeti' | 'baloni' | 'zvjezdice'
export type EffectStyle = 'confetti' | 'streamers' | 'glow'
export type TitleFont = 'poster' | 'script' | 'clean'
export type RsvpMood = 'party' | 'sweet' | 'icons' | 'spark'
export type AccentPalette = 'berry' | 'sky' | 'mint'
export type LocationType = 'Igraonica / lokal' | 'Kod kuće' | 'Na otvorenom' | 'Druga lokacija'

export type ShortcutId =
  | 'title'
  | 'dateTime'
  | 'location'
  | 'theme'
  | 'message'
  | 'wishlist'
  | 'rsvp'
  | 'style'
  | 'settings'
  | 'preview'

export type WishlistDraftItem = {
  id: string
  title: string
  note: string
  link: string
}

export type RsvpChoice = 'going' | 'maybe' | 'not_going'

export type InvitationCreateDraft = {
  title: string
  celebrantName: string
  date: string
  time: string
  locationName: string
  locationAddress: string
  locationType: LocationType
  message: string
  theme: CoverTheme
  effect: EffectStyle
  titleFont: TitleFont
  rsvpMood: RsvpMood
  accentPalette: AccentPalette
  wishlistEnabled: boolean
  wishlistItems: WishlistDraftItem[]
  savingsEnabled: boolean
  savingsLabel: string
  rsvpEnabled: boolean
  rsvpPrompt: string
}

export const LOCATION_TYPES: readonly LocationType[] = ['Igraonica / lokal', 'Kod kuće', 'Na otvorenom', 'Druga lokacija']

export const COVER_THEME_OPTIONS = [
  { id: 'konfeti', label: 'Konfeti', description: 'Šaren i veseo poster za klasični party.' },
  { id: 'baloni', label: 'Baloni', description: 'Lagani, prozračni vizual s više topline.' },
  { id: 'zvjezdice', label: 'Zvjezdice', description: 'Čarobniji, sanjiviji smjer za posebniji vibe.' },
] as const satisfies ReadonlyArray<{ id: CoverTheme; label: string; description: string }>

export const EFFECT_OPTIONS = [
  { id: 'confetti', label: 'Konfeti', description: 'Sitni party detalji preko postera.' },
  { id: 'streamers', label: 'Trakice', description: 'Malo više kretanja na rubovima.' },
  { id: 'glow', label: 'Glow', description: 'Mekši premium sjaj bez puno šuma.' },
] as const satisfies ReadonlyArray<{ id: EffectStyle; label: string; description: string }>

export const TITLE_FONT_OPTIONS = [
  { id: 'poster', label: 'Poster', description: 'Deblji naslov za hero riječ.', preview: 'Luka slavi!' },
  { id: 'script', label: 'Rukopis', description: 'Više invitation osjećaja i topline.', preview: 'Luka slavi!' },
  { id: 'clean', label: 'Clean', description: 'Najčišći i najsmireniji naslov.', preview: 'Luka slavi!' },
] as const satisfies ReadonlyArray<{ id: TitleFont; label: string; description: string; preview: string }>

export const RSVP_MOOD_OPTIONS = [
  { id: 'party', label: 'Party', description: 'Najrazigraniji set za klasični rođendan.', symbols: { going: '🥳', maybe: '🤔', not_going: '💔' } },
  { id: 'sweet', label: 'Sweet', description: 'Mekši, slatki mood s više charactera.', symbols: { going: '🧁', maybe: '💭', not_going: '🥲' } },
  { id: 'icons', label: 'Icons', description: 'Čistiji simboli za uredniji preview.', symbols: { going: '✦', maybe: '◌', not_going: '✕' } },
  { id: 'spark', label: 'Spark', description: 'Malo sjaja i više editorial osjećaja.', symbols: { going: '✨', maybe: '👀', not_going: '🌧️' } },
] as const satisfies ReadonlyArray<{
  id: RsvpMood
  label: string
  description: string
  symbols: Record<'going' | 'maybe' | 'not_going', string>
}>

export const ACCENT_OPTIONS = [
  { id: 'berry', label: 'Berry', description: 'Topliji pink-lila akcenti.' },
  { id: 'sky', label: 'Sky', description: 'Svježiji plavi i sunčani ton.' },
  { id: 'mint', label: 'Mint', description: 'Mirniji mint i peach miks.' },
] as const satisfies ReadonlyArray<{ id: AccentPalette; label: string; description: string }>

export const STYLE_PRESETS = [
  { id: 'birthday-pop', label: 'Birthday Pop', vibe: 'Šaren i vedar', theme: 'konfeti', font: 'poster', effect: 'confetti', accent: 'berry' },
  { id: 'soft-party', label: 'Soft Party', vibe: 'Topliji i nježniji', theme: 'baloni', font: 'script', effect: 'glow', accent: 'mint' },
  { id: 'magic-night', label: 'Magic Night', vibe: 'Malo čarobniji mood', theme: 'zvjezdice', font: 'clean', effect: 'streamers', accent: 'sky' },
] as const satisfies ReadonlyArray<{
  id: string
  label: string
  vibe: string
  theme: CoverTheme
  font: TitleFont
  effect: EffectStyle
  accent: AccentPalette
}>

export const SHORTCUT_ITEMS = [
  { id: 'title', label: 'Naslov', icon: '✍️' },
  { id: 'dateTime', label: 'Datum', icon: '🗓️' },
  { id: 'location', label: 'Lokacija', icon: '📍' },
  { id: 'theme', label: 'Tema', icon: '🎨' },
  { id: 'message', label: 'Poruka', icon: '💬' },
  { id: 'wishlist', label: 'Wishlist', icon: '🎁' },
  { id: 'rsvp', label: 'RSVP', icon: '🥳' },
  { id: 'style', label: 'Stil', icon: '✨' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  { id: 'preview', label: 'Preview', icon: '👁️' },
] as const satisfies ReadonlyArray<{ id: ShortcutId; label: string; icon: string }>

export const DEFAULT_CREATE_DRAFT: InvitationCreateDraft = {
  title: 'Luka slavi 6. rođendan',
  celebrantName: 'Luka',
  date: '2026-06-15',
  time: '15:00',
  locationName: 'Igraonica Jogica',
  locationAddress: 'Lastovska 2, Zagreb',
  locationType: 'Igraonica / lokal',
  message: 'Vidimo se na tulumu!',
  theme: 'baloni',
  effect: 'glow',
  titleFont: 'poster',
  rsvpMood: 'party',
  accentPalette: 'sky',
  wishlistEnabled: true,
  wishlistItems: [
    { id: 'wish-1', title: 'Lego raketa', note: 'Mala pomoć oko glavnog poklona.', link: '' },
    { id: 'wish-2', title: 'Knjiga o svemiru', note: 'Manji dodatni poklon.', link: '' },
  ],
  savingsEnabled: false,
  savingsLabel: 'Sudjelovanje u štednji za veliki poklon',
  rsvpEnabled: true,
  rsvpPrompt: 'Potvrdi dolazak i javi dolazite li na proslavu.',
}

export function formatPreviewDate(dateValue: string) {
  if (!dateValue.trim()) return 'Datum još nije odabran'
  const parsedDate = new Date(`${dateValue}T12:00:00`)
  if (Number.isNaN(parsedDate.getTime())) return dateValue
  return parsedDate
    .toLocaleDateString('hr-HR', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(/^./u, (letter) => letter.toUpperCase())
}

export function formatShortDate(dateValue: string) {
  if (!dateValue.trim()) return 'Odaberi datum'
  const parsedDate = new Date(`${dateValue}T12:00:00`)
  if (Number.isNaN(parsedDate.getTime())) return dateValue
  return parsedDate
    .toLocaleDateString('hr-HR', { weekday: 'short', day: 'numeric', month: 'numeric' })
    .replace(/^./u, (letter) => letter.toUpperCase())
}

export function formatPreviewTime(timeValue: string) {
  return timeValue.trim() ? `${timeValue.trim()} h` : 'Vrijeme uskoro'
}

export function formatInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getUpcomingDateOptions(referenceDate: string) {
  const startDate = referenceDate ? new Date(`${referenceDate}T12:00:00`) : new Date()
  const options: Array<{ value: string; label: string }> = []

  for (let offset = 0; options.length < 4; offset += 1) {
    const candidate = new Date(startDate)
    candidate.setDate(startDate.getDate() + offset)
    const day = candidate.getDay()
    if (offset === 0 || day === 6 || day === 0) {
      const value = formatInputDate(candidate)
      options.push({ value, label: formatShortDate(value) })
    }
  }

  return options
}

export function buildPreviewLocation(locationName: string, locationAddress: string, locationType: string) {
  const details = [locationName.trim(), locationAddress.trim()].filter(Boolean)
  return details.length > 0 ? details.join(' • ') : locationType.trim() || 'Lokacija uskoro'
}

export function getRsvpSymbol(style: RsvpMood, choice: RsvpChoice) {
  const selectedStyle = RSVP_MOOD_OPTIONS.find((option) => option.id === style) ?? RSVP_MOOD_OPTIONS[0]
  return selectedStyle.symbols[choice]
}

export function buildDateTime(date: string, time: string) {
  return `${date}T${time || '15:00'}`
}

export function getThemeLabel(theme: CoverTheme) {
  return COVER_THEME_OPTIONS.find((option) => option.id === theme)?.label ?? theme
}

export function getAccentClass(accent: AccentPalette) {
  return `pb-quickCreate--accent-${accent}`
}
