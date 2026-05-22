import type { BirthdayPackage, BookingAddon } from '../types'

export function calculateReservationPrice(
  pkg: BirthdayPackage,
  childrenCount: number,
  addons: BookingAddon[],
): number {
  const extraChildren = Math.max(0, childrenCount - pkg.includedChildren)
  const packageTotal = pkg.basePrice + extraChildren * pkg.extraChildPrice
  const addonsTotal = addons.reduce((sum, addon) => sum + addon.price, 0)
  return Math.round((packageTotal + addonsTotal) * 100) / 100
}

export function formatPrice(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('hr-HR', { style: 'currency', currency }).format(amount)
}
