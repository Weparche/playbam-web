/**
 * Prvi dio hero naslova pozivnice: posvojni oblik imena (hr.), npr. Luka → Lukin, Petar → Petrov.
 * Koristi se samo za prikaz glavnog naslova kartice.
 */
export function possessiveFirstNameForHero(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0] ?? ''
  if (!first) return ''
  const lower = first.toLowerCase()

  const exact: Record<string, string> = {
    luka: 'Lukin',
    luca: 'Lukin',
    petar: 'Petrov',
    marko: 'Markov',
    ivan: 'Ivanov',
    nikola: 'Nikolin',
    ana: 'Anin',
    ema: 'Emin',
    mara: 'Marin',
    leo: 'Leonov',
  }

  if (exact[lower]) return exact[lower]

  const cap = first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()

  if (lower.endsWith('a')) {
    return cap.slice(0, -1) + 'in'
  }
  if (lower.endsWith('o')) {
    return cap.slice(0, -1) + 'ov'
  }
  return cap + 'ov'
}
