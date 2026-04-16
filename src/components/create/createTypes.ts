export type CoverTheme = 'pozivnica-girl' | 'pozivnica-boy' | 'pozivnica-boys' | 'pozivnica-girls' | 'pozivnica-mix'
export type EffectStyle = 'confetti' | 'streamers' | 'glow'
export type TitleFont =
  | 'lilita'
  | 'fredoka'
  | 'gummy'
  | 'merienda'
  | 'great-vibes'
  | 'playfair'
  | 'libre-baskerville'
  | 'jakarta'
  | 'nunito'
export type TitleColor = 'playbam-blue' | 'ink' | 'berry' | 'mint' | 'sunset'
export type TitleOutline = 'none' | 'soft' | 'bold'
export type TitleSize = 'sm' | 'md' | 'lg'
export type RsvpMood = 'party' | 'sweet' | 'icons' | 'spark' | 'balloon' | 'thumbs' | 'check' | 'zoo' | 'sport' | 'space' | 'music' | 'crown' | 'heart' | 'fire' | 'nature' | 'pirate'
export type AccentPalette = 'berry' | 'sky' | 'mint'
export type LocationType = 'Igraonica / lokal' | 'Kod kuće' | 'Na otvorenom' | 'Druga lokacija'

export type ShortcutId =
  | 'dateTime'
  | 'location'
  | 'theme'
  | 'message'
  | 'wishlist'
  | 'rsvp'
  | 'settings'
  | 'preview'

export type LinkMeta = {
  title?: string
  image?: string
  domain?: string
  favicon?: string
}

export type WishlistDraftItem = {
  id: string
  title: string
  note: string
  link: string
  linkMeta?: LinkMeta
}

export type RsvpChoice = 'going' | 'maybe' | 'not_going'

/** Fiksni tekst koji gosti vide uz RSVP (nije dio quick editora). */
export const RSVP_GUEST_HEADLINE = 'Potvrdi dolazak'

export type InvitationCreateDraft = {
  title: string
  celebrantName: string
  titleFont: TitleFont
  titleColor: TitleColor
  titleOutline: TitleOutline
  titleSize: TitleSize
  date: string
  time: string
  timeEnd: string
  locationName: string
  locationAddress: string
  locationType: LocationType
  message: string
  theme: CoverTheme
  effect: EffectStyle
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
  { id: 'pozivnica-girl', label: 'Cura', description: 'Topla ilustracija za pozivnicu s jednom curom.', image: '/pozivnica-girl.png' },
  { id: 'pozivnica-boy', label: 'Dečko', description: 'Varijanta s jednim dečkom na naslovnici.', image: '/pozivnica-boy.png' },
  { id: 'pozivnica-boys', label: 'Dva dečka', description: 'Tema za dva dječaka na istoj pozivnici.', image: '/pozivnica-boys.png' },
  { id: 'pozivnica-girls', label: 'Dvije cure', description: 'Tema s dvije cure i istim storybook stilom.', image: '/pozivnica-girls.png' },
  { id: 'pozivnica-mix', label: 'Cura i dečko', description: 'Miks ilustracija za pozivnicu s curom i dečkom.', image: '/pozivnica-mix.png' },
] as const satisfies ReadonlyArray<{ id: CoverTheme; label: string; description: string; image: string }>

export const EFFECT_OPTIONS = [
  { id: 'confetti', label: 'Konfeti', description: 'Sitni party detalji preko postera.' },
  { id: 'streamers', label: 'Trakice', description: 'Malo više kretanja na rubovima.' },
  { id: 'glow', label: 'Glow', description: 'Mekši premium sjaj bez puno šuma.' },
] as const satisfies ReadonlyArray<{ id: EffectStyle; label: string; description: string }>

export const TITLE_FONT_OPTIONS = [
  { id: 'lilita', label: 'Lilita One', description: 'Najizraženiji party naslov za hero kadar.', preview: 'Luka slavi!' },
  { id: 'fredoka', label: 'Fredoka', description: 'Zaigran i mekan display font za dječji rođendan.', preview: 'Luka slavi!' },
  { id: 'gummy', label: 'Sour Gummy', description: 'Još više bubble energije i karaktera.', preview: 'Luka slavi!' },
  { id: 'merienda', label: 'Merienda', description: 'Topliji rukopisni ton za nježniji mood.', preview: 'Luka slavi!' },
  { id: 'great-vibes', label: 'Great Vibes', description: 'Klasični invite script koji ostaje čitljiv.', preview: 'Luka slavi!' },
  { id: 'playfair', label: 'Playfair Display', description: 'Elegantni serif za modernije i klasične pozivnice.', preview: 'Luka slavi!' },
  { id: 'libre-baskerville', label: 'Libre Baskerville', description: 'Sofisticirani serif koji dobro nosi detalje pozivnice.', preview: 'Luka slavi!' },
  { id: 'jakarta', label: 'Plus Jakarta Sans', description: 'Čist i moderan naslov s urednim ritmom.', preview: 'Luka slavi!' },
  { id: 'nunito', label: 'Nunito', description: 'Prijateljski rounded sans za smireniji look.', preview: 'Luka slavi!' },
] as const satisfies ReadonlyArray<{ id: TitleFont; label: string; description: string; preview: string }>

export const TITLE_COLOR_OPTIONS = [
  {
    id: 'playbam-blue',
    label: 'VidimoSe plava',
    swatch: '#336fd6',
    description: 'Brand plava — jasna i pouzdana na većini naslovnica.',
  },
  {
    id: 'ink',
    label: 'Crna',
    swatch: '#171a21',
    description: 'Duboka crna — jak kontrast na svijetlim i šarenim naslovnicama.',
  },
  {
    id: 'berry',
    label: 'Berry',
    swatch: '#d25687',
    description: 'Pink-lila ton za veseliji, slatkiji dojam.',
  },
  {
    id: 'mint',
    label: 'Mint',
    swatch: '#2aa88d',
    description: 'Svjež mint za mirniji, „proljetni” izgled.',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    swatch: '#ff8a5b',
    description: 'Topli narančasti naglasak za sunčaniji party.',
  },
] as const satisfies ReadonlyArray<{ id: TitleColor; label: string; swatch: string; description: string }>

export const TITLE_OUTLINE_OPTIONS = [
  {
    id: 'none',
    label: 'Bez outlinea',
    description: 'Bez dodatnog obruba oko slova — najčišći, najdiskretniji izgled.',
  },
  {
    id: 'soft',
    label: 'Mekani outline',
    description: 'Blagi svijetli obrub — bolja čitljivost na šarenim ilustracijama.',
  },
  {
    id: 'bold',
    label: 'Jači outline',
    description: 'Deblji obrub za jak kontrast i naglašen naslov.',
  },
] as const satisfies ReadonlyArray<{ id: TitleOutline; label: string; description: string }>

export const TITLE_SIZE_OPTIONS = [
  {
    id: 'sm',
    label: 'Najmanji naslov',
    description: 'Najkompaktnije — kad je tekst jako dugačak ili treba još prostora ispod.',
  },
  {
    id: 'md',
    label: 'Srednji naslov',
    description: 'Srednja veličina — diskretno manje od glavnog (najvećeg) prikaza.',
  },
  {
    id: 'lg',
    label: 'Najveći naslov',
    description: 'Najveća dopuštena veličina naslova — dobar default za većinu pozivnica.',
  },
] as const satisfies ReadonlyArray<{ id: TitleSize; label: string; description: string }>

export const RSVP_MOOD_OPTIONS = [
  { id: 'party', label: 'Party', description: 'Najrazigraniji set za klasični rođendan.', symbols: { going: '🥳', maybe: '🤔', not_going: '💔' } },
  { id: 'sweet', label: 'Sweet', description: 'Mekši, slatki mood s više karaktera.', symbols: { going: '🧁', maybe: '💭', not_going: '🥲' } },
  { id: 'icons', label: 'Icons', description: 'Čistiji simboli za uredniji preview.', symbols: { going: '✦', maybe: '◌', not_going: '✕' } },
  { id: 'spark', label: 'Spark', description: 'Malo sjaja i više editorial osjećaja.', symbols: { going: '✨', maybe: '👀', not_going: '🌧️' } },
  { id: 'balloon', label: 'Baloni', description: 'Baloni i jasni emoji odgovori.', symbols: { going: '🎈', maybe: '🤷', not_going: '🙅' } },
  { id: 'thumbs', label: 'Palčevi', description: 'Palac gore / neutralno / palac dolje.', symbols: { going: '👍', maybe: '🤷', not_going: '👎' } },
  { id: 'check', label: 'Kvačice', description: 'Da / upit / ne u obliku oznaka.', symbols: { going: '✅', maybe: '❔', not_going: '❌' } },
  { id: 'zoo', label: 'Životinje', description: 'Zaigrani set sa životinjama.', symbols: { going: '🐻', maybe: '🦊', not_going: '🐢' } },
  { id: 'sport', label: 'Sport', description: 'Za sportaše i aktivne tulume.', symbols: { going: '⚽', maybe: '🏃', not_going: '🤕' } },
  { id: 'space', label: 'Svemir', description: 'Svemirska tema za male astronaute.', symbols: { going: '🚀', maybe: '🛸', not_going: '🌑' } },
  { id: 'music', label: 'Glazba', description: 'Za glazbeni party i DJ tulume.', symbols: { going: '🎵', maybe: '🎧', not_going: '🔇' } },
  { id: 'crown', label: 'Kruna', description: 'Premium kraljevski set za posebne prilike.', symbols: { going: '👑', maybe: '💎', not_going: '🪨' } },
  { id: 'heart', label: 'Srca', description: 'Nježniji set sa srcima u boji.', symbols: { going: '💖', maybe: '💛', not_going: '🖤' } },
  { id: 'fire', label: 'Vatra', description: 'Energičan vibe za najluđe tulume.', symbols: { going: '🔥', maybe: '⚡', not_going: '🧊' } },
  { id: 'nature', label: 'Priroda', description: 'Sezonski set inspiriran prirodom.', symbols: { going: '🌻', maybe: '🍂', not_going: '❄️' } },
  { id: 'pirate', label: 'Pirati', description: 'Piratska tema za avanturiste.', symbols: { going: '🏴‍☠️', maybe: '⚓', not_going: '🦈' } },
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
  { id: 'birthday-pop', label: 'Birthday Pop', vibe: 'Šaren i vedar', theme: 'pozivnica-girl', font: 'lilita', effect: 'confetti', accent: 'berry' },
  { id: 'soft-party', label: 'Soft Party', vibe: 'Topliji i nježniji', theme: 'pozivnica-boy', font: 'merienda', effect: 'glow', accent: 'mint' },
  { id: 'magic-night', label: 'Magic Night', vibe: 'Malo čarobniji mood', theme: 'pozivnica-mix', font: 'playfair', effect: 'streamers', accent: 'sky' },
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
  { id: 'wishlist', label: 'Lista želja', icon: '🎁' },
  { id: 'settings', label: 'Postavke', icon: '⚙️' },
  { id: 'rsvp', label: 'RSVP', icon: '✅' },
  { id: 'theme', label: 'Tema', icon: '🎨' },
  { id: 'preview', label: 'Pregled', icon: '👁️' },
] as const satisfies ReadonlyArray<{ id: ShortcutId; label: string; icon: string }>

export const DEFAULT_CREATE_DRAFT: InvitationCreateDraft = {
  title: 'Luka slavi 6. rođendan',
  celebrantName: 'Luka',
  titleFont: 'lilita',
  titleColor: 'playbam-blue',
  titleOutline: 'soft',
  titleSize: 'lg',
  date: '2026-06-15',
  time: '15:00',
  timeEnd: '17:00',
  locationName: 'Igraonica Jogica',
  locationAddress: 'Lastovska 2, Zagreb',
  locationType: 'Igraonica / lokal',
  message: 'Vidimo se na tulumu!',
  theme: 'pozivnica-girl',
  effect: 'glow',
  rsvpMood: 'zoo',
  accentPalette: 'sky',
  wishlistEnabled: true,
  wishlistItems: [
    { id: 'wish-1', title: 'Lego raketa', note: 'Mala pomoć oko glavnog poklona.', link: '' },
    { id: 'wish-2', title: 'Knjiga o svemiru', note: 'Manji dodatni poklon.', link: '' },
  ],
  savingsEnabled: false,
  savingsLabel: 'Sudjelovanje u štednji za veliki poklon',
  rsvpEnabled: true,
  rsvpPrompt: RSVP_GUEST_HEADLINE,
}

export function buildEmptyCreateDraft(): InvitationCreateDraft {
  return {
    ...DEFAULT_CREATE_DRAFT,
    title: '',
    celebrantName: '',
    date: '',
    time: '',
    timeEnd: '',
    locationName: '',
    locationAddress: '',
    message: '',
    wishlistEnabled: false,
    wishlistItems: [],
    savingsEnabled: false,
  }
}

export function formatPreviewDate(dateValue: string) {
  if (!dateValue.trim()) return 'Odaberi datum'
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

export function formatPreviewTime(timeValue: string, timeEndValue = '') {
  const start = timeValue.trim()
  const end = timeEndValue.trim()

  if (start && end) return `${start}h - ${end}h`
  if (start) return `${start}h - ...`
  if (end) return `... - ${end}h`
  return 'Odaberi vrijeme'
}

export function buildTimeRangeValue(timeValue: string, timeEndValue: string) {
  const start = timeValue.trim()
  const end = timeEndValue.trim()

  if (start && end) return `${start} - ${end}`
  return start || end || ''
}

export function formatInputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getRelativeDayLabel(offset: number, dayOfWeek: number) {
  if (offset === 0) return 'Danas'
  if (offset === 1) return 'Sutra'
  if (offset <= 6) {
    if (dayOfWeek === 6) return 'Ova subota'
    if (dayOfWeek === 0) return 'Ova nedjelja'
    return `Za ${offset} dana`
  }
  if (offset <= 13) {
    if (dayOfWeek === 6) return 'Sljedeća sub.'
    if (dayOfWeek === 0) return 'Sljedeća ned.'
    return `Za ${offset} dana`
  }
  return `Za ${offset} dana`
}

export function getUpcomingDateOptions(referenceDate: string) {
  const startDate = referenceDate ? new Date(`${referenceDate}T12:00:00`) : new Date()
  const options: Array<{ value: string; label: string; relative: string; dayNumber: number }> = []

  for (let offset = 0; options.length < 4; offset += 1) {
    const candidate = new Date(startDate)
    candidate.setDate(startDate.getDate() + offset)
    const day = candidate.getDay()
    if (offset === 0 || day === 6 || day === 0) {
      const value = formatInputDate(candidate)
      options.push({
        value,
        label: formatShortDate(value),
        relative: getRelativeDayLabel(offset, day),
        dayNumber: candidate.getDate(),
      })
    }
  }

  return options
}

export function buildPreviewLocation(locationName: string, locationAddress: string, locationType: string) {
  const details = [locationName.trim(), locationAddress.trim()].filter(Boolean)
  if (details.length > 0) {
    return details.join(' • ')
  }

  const normalizedType = locationType.trim()
  if (!normalizedType || normalizedType === 'Igraonica / lokal') {
    return 'Odaberi lokaciju događaja'
  }

  return normalizedType
}

export function normalizeTitleFont(fontValue: string | null | undefined): TitleFont {
  const normalized = fontValue?.trim().toLowerCase() ?? ''

  switch (normalized) {
    case 'lilita':
    case 'fredoka':
    case 'gummy':
    case 'merienda':
    case 'great-vibes':
    case 'playfair':
    case 'libre-baskerville':
    case 'jakarta':
    case 'nunito':
      return normalized
    case 'poster':
      return 'lilita'
    case 'script':
      return 'merienda'
    case 'clean':
      return 'jakarta'
    default:
      return 'lilita'
  }
}

export function normalizeTitleColor(value: string | null | undefined): TitleColor {
  const normalized = value?.trim().toLowerCase() ?? ''

  switch (normalized) {
    case 'playbam-blue':
    case 'ink':
    case 'berry':
    case 'mint':
    case 'sunset':
      return normalized
    case 'snow':
      return 'ink'
    default:
      return 'playbam-blue'
  }
}

export function normalizeTitleOutline(value: string | null | undefined): TitleOutline {
  const normalized = value?.trim().toLowerCase() ?? ''

  switch (normalized) {
    case 'none':
    case 'soft':
    case 'bold':
      return normalized
    default:
      return 'soft'
  }
}

export function normalizeTitleSize(value: string | null | undefined): TitleSize {
  const normalized = value?.trim().toLowerCase() ?? ''

  switch (normalized) {
    case 'sm':
    case 'md':
    case 'lg':
      return normalized
    default:
      return 'lg'
  }
}

export function getTitleColorValue(color: TitleColor) {
  return TITLE_COLOR_OPTIONS.find((option) => option.id === color)?.swatch ?? '#336fd6'
}

export function normalizeRsvpMood(value: string | null | undefined): RsvpMood {
  const key = (value ?? '').trim().toLowerCase()
  const match = RSVP_MOOD_OPTIONS.find((option) => option.id === key)
  return (match?.id ?? 'party') as RsvpMood
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

export function normalizeCreateTheme(themeValue: string | null | undefined): CoverTheme {
  const normalized = themeValue?.trim().toLowerCase() ?? ''

  switch (normalized) {
    case 'pozivnica-girl':
    case 'pozivnica-boy':
    case 'pozivnica-boys':
    case 'pozivnica-girls':
    case 'pozivnica-mix':
      return normalized
    case 'konfeti':
      return 'pozivnica-boys'
    case 'zvjezdice':
    case 'pozivnica-bg1':
      return 'pozivnica-mix'
    case 'baloni':
    case 'pozivnica-bg':
    case 'pozivnica-boys1':
    default:
      return 'pozivnica-girl'
  }
}

export function buildCreateProgress(draft: InvitationCreateDraft) {
  const titleReady = Boolean(draft.title.trim())
  const dateReady = Boolean(draft.date.trim() && draft.time.trim() && draft.timeEnd.trim())
  const locationReady = Boolean(draft.locationName.trim())
  const messageReady = Boolean(draft.message.trim())
  const wishlistReady = draft.wishlistEnabled ? draft.wishlistItems.length > 0 || draft.savingsEnabled : true
  const rsvpReady = draft.rsvpEnabled

  const steps = [titleReady, dateReady, locationReady]
  const completedSteps = steps.filter(Boolean).length
  const totalSteps = steps.length

  return {
    titleReady,
    dateReady,
    locationReady,
    messageReady,
    wishlistReady,
    rsvpReady,
    completedSteps,
    totalSteps,
    progressPercent: Math.round((completedSteps / totalSteps) * 100),
  }
}
