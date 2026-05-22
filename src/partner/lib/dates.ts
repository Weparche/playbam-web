export function toDateKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

export function addDays(dateKey: string, days: number): string {
  const d = new Date(`${dateKey}T12:00:00`)
  d.setDate(d.getDate() + days)
  return toDateKey(d)
}

export function todayKey(): string {
  return toDateKey()
}

export function tomorrowKey(): string {
  return addDays(todayKey(), 1)
}

export function startOfMonth(dateKey: string): string {
  const [y, m] = dateKey.split('-')
  return `${y}-${m}-01`
}

export function endOfMonth(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`)
  d.setMonth(d.getMonth() + 1, 0)
  return toDateKey(d)
}

export function formatDateHr(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`)
  return d.toLocaleDateString('hr-HR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatMonthYearHr(year: number, month: number): string {
  const d = new Date(year, month - 1, 1)
  const monthName = d.toLocaleDateString('hr-HR', { month: 'long' })
  const capitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1)
  return `${capitalized} ${year}.`
}

export function formatTimeRange(start: string, end: string): string {
  return `${start} – ${end}`
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function weekdayFromDateKey(dateKey: string): import('../types').Weekday {
  const day = new Date(`${dateKey}T12:00:00`).getDay()
  const map: import('../types').Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  return map[day] ?? 'mon'
}

export function isSameMonth(a: string, b: string): boolean {
  return a.slice(0, 7) === b.slice(0, 7)
}

export function monthGridDays(year: number, month: number): Array<{ dateKey: string; inMonth: boolean }> {
  const first = new Date(year, month - 1, 1)
  const startOffset = (first.getDay() + 6) % 7
  const days: Array<{ dateKey: string; inMonth: boolean }> = []
  const gridStart = new Date(first)
  gridStart.setDate(first.getDate() - startOffset)

  for (let i = 0; i < 42; i += 1) {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    const dateKey = toDateKey(d)
    days.push({ dateKey, inMonth: d.getMonth() === month - 1 })
  }
  return days
}
