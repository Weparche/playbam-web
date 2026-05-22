import type { Animator, BirthdayReservation, Playroom, TimeSlot, Weekday } from '../types'
import { minutesToTime, parseTimeToMinutes, weekdayFromDateKey } from './dates'

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd
}

export function reservationWindow(reservation: BirthdayReservation, bufferMinutes: number) {
  const start = parseTimeToMinutes(reservation.startTime)
  const end = parseTimeToMinutes(reservation.endTime) + bufferMinutes
  return { start, end }
}

export function isSlotAvailable(
  slot: TimeSlot,
  reservations: BirthdayReservation[],
  maxParallelEvents: number,
  cleanupBufferMinutes: number,
  excludeReservationId?: string,
): boolean {
  const slotStart = parseTimeToMinutes(slot.startTime)
  const slotEnd = parseTimeToMinutes(slot.endTime)
  let parallel = 0

  for (const reservation of reservations) {
    if (reservation.id === excludeReservationId) continue
    if (reservation.date !== slot.date) continue
    if (reservation.status === 'cancelled') continue
    const { start, end } = reservationWindow(reservation, cleanupBufferMinutes)
    if (overlaps(slotStart, slotEnd, start, end)) {
      parallel += 1
    }
  }

  return parallel < maxParallelEvents
}

export function generateAvailableSlots(
  playroom: Playroom,
  date: string,
  reservations: BirthdayReservation[],
  durationMinutes?: number,
): TimeSlot[] {
  const weekday = weekdayFromDateKey(date)
  const hours = playroom.openingHours[weekday]
  if (!hours || hours.closed) return []

  const duration = durationMinutes ?? playroom.slotDurationMinutes
  const open = parseTimeToMinutes(hours.open)
  const close = parseTimeToMinutes(hours.close)
  const slots: TimeSlot[] = []

  for (let start = open; start + duration <= close; start += playroom.slotDurationMinutes) {
    const end = start + duration
    const slot: TimeSlot = {
      date,
      startTime: minutesToTime(start),
      endTime: minutesToTime(end),
    }
    if (
      isSlotAvailable(slot, reservations, playroom.maxParallelEvents, playroom.cleanupBufferMinutes)
    ) {
      slots.push(slot)
    }
  }

  return slots
}

export function suggestAvailableAnimators(
  date: string,
  startTime: string,
  endTime: string,
  animators: Animator[],
  reservations: BirthdayReservation[],
  excludeReservationId?: string,
): Animator[] {
  const weekday = weekdayFromDateKey(date) as Weekday
  const slotStart = parseTimeToMinutes(startTime)
  const slotEnd = parseTimeToMinutes(endTime)

  return animators.filter((animator) => {
    if (!animator.isActive) return false
    if (!animator.availableDays.includes(weekday)) return false

    let eventsToday = 0
    for (const reservation of reservations) {
      if (reservation.id === excludeReservationId) continue
      if (reservation.date !== date) continue
      if (reservation.status === 'cancelled') continue
      if (!reservation.assignedAnimatorIds.includes(animator.id)) continue

      eventsToday += 1
      const rStart = parseTimeToMinutes(reservation.startTime)
      const rEnd = parseTimeToMinutes(reservation.endTime)
      if (overlaps(slotStart, slotEnd, rStart, rEnd)) {
        return false
      }
    }

    return eventsToday < animator.maxEventsPerDay
  })
}
