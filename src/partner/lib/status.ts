import type { ReservationStatus } from '../types'

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  new_request: 'Novi upit',
  pending_confirmation: 'Čeka potvrdu',
  confirmed: 'Potvrđeno',
  waiting_deposit: 'Čeka akontaciju',
  deposit_paid: 'Akontacija plaćena',
  animator_assigned: 'Animator dodijeljen',
  preparing: 'Priprema',
  completed: 'Završeno',
  cancelled: 'Otkazano',
}

export const STATUS_COLORS: Record<ReservationStatus, string> = {
  new_request: '#6366f1',
  pending_confirmation: '#f59e0b',
  confirmed: '#10b981',
  waiting_deposit: '#f97316',
  deposit_paid: '#14b8a6',
  animator_assigned: '#8b5cf6',
  preparing: '#3b82f6',
  completed: '#64748b',
  cancelled: '#ef4444',
}

export const STATUS_ORDER: ReservationStatus[] = [
  'new_request',
  'pending_confirmation',
  'confirmed',
  'waiting_deposit',
  'deposit_paid',
  'animator_assigned',
  'preparing',
  'completed',
  'cancelled',
]

export function statusLabel(status: ReservationStatus): string {
  return STATUS_LABELS[status]
}

export function statusColor(status: ReservationStatus): string {
  return STATUS_COLORS[status]
}

export function canTransition(from: ReservationStatus, to: ReservationStatus): boolean {
  if (from === to) return true
  if (to === 'cancelled') return from !== 'completed'
  const fromIdx = STATUS_ORDER.indexOf(from)
  const toIdx = STATUS_ORDER.indexOf(to)
  if (fromIdx < 0 || toIdx < 0) return false
  return toIdx === fromIdx + 1 || to === 'confirmed'
}
