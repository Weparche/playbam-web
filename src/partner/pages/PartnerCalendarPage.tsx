import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import Button from '../../components/ui/Button'
import { usePartnerData } from '../context/PartnerDataContext'
import { monthGridDays } from '../lib/dates'
import { statusColor } from '../lib/status'

const WEEKDAYS = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned']

export default function PartnerCalendarPage() {
  const { monthReservations } = usePartnerData()
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() + 1 }
  })

  const monthKey = `${cursor.year}-${String(cursor.month).padStart(2, '0')}`
  const events = monthReservations(monthKey)
  const days = useMemo(() => monthGridDays(cursor.year, cursor.month), [cursor.year, cursor.month])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof events>()
    for (const event of events) {
      const list = map.get(event.date) ?? []
      list.push(event)
      map.set(event.date, list)
    }
    return map
  }, [events])

  const shiftMonth = (delta: number) => {
    setCursor((current) => {
      const d = new Date(current.year, current.month - 1 + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() + 1 }
    })
  }

  return (
    <>
      <header className="partner-topbar">
        <div>
          <h1 className="partner-topbar__title">Kalendar rođendana</h1>
          <p className="partner-topbar__meta">
            {cursor.month}.{cursor.year}
          </p>
        </div>
        <Link to="/partner/reservations?new=1" className="pb-btn pb-btn-primary">
          Nova rezervacija
        </Link>
      </header>

      <section className="partner-panel partner-calendar">
        <div className="partner-calendar__head">
          <Button variant="ghost" type="button" onClick={() => shiftMonth(-1)}>
            ←
          </Button>
          <strong>
            {cursor.month}.{cursor.year}
          </strong>
          <Button variant="ghost" type="button" onClick={() => shiftMonth(1)}>
            →
          </Button>
        </div>

        <div className="partner-calendarGrid">
          {WEEKDAYS.map((day) => (
            <div key={day} className="partner-calendarGrid__weekday">
              {day}
            </div>
          ))}
          {days.map(({ dateKey, inMonth }) => {
            const dayEvents = eventsByDate.get(dateKey) ?? []
            return (
              <div key={dateKey} className={`partner-calendarDay${inMonth ? '' : ' is-muted'}`}>
                <div className="partner-calendarDay__num">{Number(dateKey.slice(8))}</div>
                {dayEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={`/partner/reservations/${event.id}`}
                    className="partner-calendarEvent"
                    style={{ backgroundColor: statusColor(event.status) }}
                  >
                    {event.startTime} {event.childName}
                  </Link>
                ))}
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
