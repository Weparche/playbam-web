export type BookingInquiryMessageInput = {
  parentName: string
  parentPhone: string
  childName: string
  desiredDate: string
  desiredTime: string
  childrenCount: string
  venueUrl: string
  packageName?: string
  childAge?: string
  email?: string
  theme?: string
  notes?: string
  allergies?: string
}

function clean(value?: string) {
  return value?.trim() ?? ''
}

export function normalizeWhatsappPhone(phone: string): string | null {
  const compact = phone.replace(/[\s()+-]/g, '').replace(/[^\d]/g, '')
  if (!compact) return null

  if (/^09\d{7,8}$/.test(compact)) {
    return `385${compact.slice(1)}`
  }

  if (/^00\d{8,15}$/.test(compact)) {
    return compact.slice(2)
  }

  if (/^\d{8,15}$/.test(compact)) {
    return compact
  }

  return null
}

export function buildBookingInquiryMessage(input: BookingInquiryMessageInput): string {
  const requiredLines = [
    'Pozdrav, šaljem upit za dječji rođendan preko VidimoSe.hr.',
    '',
    `Roditelj: ${clean(input.parentName)}`,
    `Telefon: ${clean(input.parentPhone)}`,
    '',
    `Slavljenik: ${clean(input.childName)}`,
    `Datum: ${clean(input.desiredDate)}`,
    `Vrijeme: ${clean(input.desiredTime)}`,
    `Broj djece: ${clean(input.childrenCount)}`,
  ]

  const optionalLines = [
    ['Paket/interes', input.packageName],
    ['Dob slavljenika', input.childAge],
    ['Email', input.email],
    ['Tema', input.theme],
    ['Napomene', input.notes],
    ['Alergije/posebne želje', input.allergies],
  ]
    .map(([label, value]) => [label, clean(value)] as const)
    .filter(([, value]) => value.length > 0)
    .map(([label, value]) => `${label}: ${value}`)

  return [
    ...requiredLines,
    ...(optionalLines.length > 0 ? ['', ...optionalLines] : []),
    '',
    'Molim potvrdu dostupnosti termina i ponudu.',
    '',
    'Stvoreno s VidimoSe.hr',
    clean(input.venueUrl),
  ].join('\n')
}

export function buildWhatsappUrl(phone: string, message: string): string | null {
  const normalizedPhone = normalizeWhatsappPhone(phone)
  if (!normalizedPhone) return null
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`
}
