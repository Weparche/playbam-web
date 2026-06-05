import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { usePartnerData } from '../context/PartnerDataContext'
import { generateAvailableSlots } from '../lib/availability'
import {
  addDays,
  formatDayHeadingHr,
  formatDayShortHr,
  formatMonthYearHr,
  formatTimeRange,
  monthGridDays,
  startOfWeekKey,
  todayKey,
  weekDayKeys,
} from '../lib/dates'
import { statusLabel } from '../lib/status'
import type { BirthdayReservation } from '../types'
import PartnerIcon from '../components/ui/PartnerIcon'

type View = 'month' | 'week' | 'day'

const VIEW_OPTIONS: Array<{ id: View; label: string }> = [
  { id: 'day', label: 'Dan' },
  { id: 'week', label: 'Tjedan' },
  { id: 'month', label: 'Mjesec' },
]

const WEEKDAY_LABELS = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned']

function EventChip({ res }: { res: BirthdayReservation }) {
  return (
    <Link
      to={`/partner/reservations/${res.id}`}
      className="partner-calEvent"
      data-status={res.status}
      title={`${res.startTime} ${res.childName} — ${statusLabel(res.status)}`}
    >
      <span className="partner-calEvent__time">{res.startTime}</span>
      <span className="partner-calEvent__name">{res.childName}</span>
    </Link>
  )
}

export default function PartnerCalendarPage() {
  const { reservations, playroom } = usePartnerData()
  const [view, setView] = useState<View>('month')
  const [cursor, setCursor] = useState(todayKey())
  const today = todayKey()

  const active = useMemo(() => reservations.filter((r) => r.status !== 'cancelled'), [reservations])

  const byDate = useMemo(() => {
    const map = new Map<string, BirthdayReservation[]>()
    for (const res of active) {
      const list = map.get(res.date) ?? []
      list.push(res)
      map.set(res.date, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.startTime.localeCompare(b.startTime))
    }
    return map
  }, [active])

  const [cy, cm] = cursor.split('-').map(Number)

  const shift = (delta: number) => {
    if (view === 'day') setCursor(addDays(cursor, delta))
    else if (view === 'week') setCursor(addDays(cursor, delta * 7))
    else {
      const d = new Date(cy, cm - 1 + delta, 1)
      setCursor(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`)
    }
  }

  const title =
    view === 'month'
      ? formatMonthYearHr(cy, cm)
      : view === 'week'
        ? `Tjedan ${formatDayShortHr(startOfWeekKey(cursor))} – ${formatDayShortHr(addDays(startOfWeekKey(cursor), 6))}`
        : formatDayHeadingHr(cursor)

  const monthGrid = useMemo(() => monthGridDays(cy, cm), [cy, cm])
  const monthEvents = useMemo(
    () => active.filter((r) => r.date.startsWith(cursor.slice(0, 7))).sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)),
    [active, cursor],
  )

  const weekDays = useMemo(() => weekDayKeys(cursor), [cursor])

  const daySlots = useMemo(
    () => (view === 'day' ? generateAvailableSlots(playroom, cursor, reservations) : []),
    [view, playroom, cursor, reservations],
  )
  const dayEvents = byDate.get(cursor) ?? []

  return (
    <>
      <header className="partner-topbar">
        <div>
          <h1 className="partner-topbar__title">Kalendar</h1>
          <p className="partner-topbar__meta">{title}</p>
        </div>
        <Link to="/partner/reservations?new=1" className="pb-btn pb-btn-primary">
          <PartnerIcon name="plus" size={18} />
          <span>Nova rezervacija</span>
        </Link>
      </header>

      <div className="partner-calToolbar">
        <div className="partner-segments partner-segments--inline" role="tablist" aria-label="Prikaz kalendara">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={view === opt.id}
              className={`partner-seg${view === opt.id ? ' is-active' : ''}`}
              onClick={() => setView(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="partner-calNav">
          <button type="button" className="partner-calNav__btn" onClick={() => shift(-1)} aria-label="Prethodno">
            ‹
          </button>
          <button type="button" className="partner-calNav__today" onClick={() => setCursor(today)}>
            Danas
          </button>
          <button type="button" className="partner-calNav__btn" onClick={() => shift(1)} aria-label="Sljedeće">
            ›
          </button>
        </div>
      </div>

      {/* MONTH — desktop grid */}
      {view === 'month' ? (
        <>
          <section className="partner-panel partner-calMonth">
            <div className="partner-calWeekHead">
              {WEEKDAY_LABELS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="partner-calGrid">
              {monthGrid.map(({ dateKey, inMonth }) => {
                const events = byDate.get(dateKey) ?? []
                return (
                  <div
                    key={dateKey}
                    className={`partner-calCell${inMonth ? '' : ' is-out'}${dateKey === today ? ' is-today' : ''}`}
                  >
                    <button
                      type="button"
                      className="partner-calCell__num"
                      onClick={() => {
                        setCursor(dateKey)
                        setView('day')
                      }}
                    >
                      {Number(dateKey.split('-')[2])}
                    </button>
                    <div className="partner-calCell__events">
                      {events.slice(0, 3).map((res) => (
                        <EventChip key={res.id} res={res} />
                      ))}
                      {events.length > 3 ? (
                        <button
                          type="button"
                          className="partner-calCell__more"
                          onClick={() => {
                            setCursor(dateKey)
                            setView('day')
                          }}
                        >
                          +{events.length - 3} više
                        </button>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* MONTH — mobile agenda */}
          <div className="partner-agenda">
            {monthEvents.length === 0 ? (
              <div className="partner-emptyState">
                <PartnerIcon name="calendar" size={28} />
                <p className="partner-emptyState__title">Nema rezervacija ovaj mjesec</p>
              </div>
            ) : (
              monthEvents.map((res) => (
                <Link key={res.id} to={`/partner/reservations/${res.id}`} className="partner-agendaRow" data-status={res.status}>
                  <div className="partner-agendaRow__date">{formatDayShortHr(res.date)}</div>
                  <div className="partner-agendaRow__body">
                    <span className="partner-agendaRow__title">{res.childName}</span>
                    <span className="partner-agendaRow__meta">
                      {formatTimeRange(res.startTime, res.endTime)} · {statusLabel(res.status)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </>
      ) : null}

      {/* WEEK */}
      {view === 'week' ? (
        <div className="partner-weekGrid">
          {weekDays.map((dateKey) => {
            const events = byDate.get(dateKey) ?? []
            return (
              <section key={dateKey} className={`partner-panel partner-dayCol${dateKey === today ? ' is-today' : ''}`}>
                <button
                  type="button"
                  className="partner-dayCol__head"
                  onClick={() => {
                    setCursor(dateKey)
                    setView('day')
                  }}
                >
                  {formatDayShortHr(dateKey)}
                </button>
                {events.length === 0 ? (
                  <p className="partner-dayCol__empty">—</p>
                ) : (
                  events.map((res) => <EventChip key={res.id} res={res} />)
                )}
              </section>
            )
          })}
        </div>
      ) : null}

      {/* DAY */}
      {view === 'day' ? (
        <div className="partner-dayView">
          <section className="partner-panel">
            <h2 className="partner-panel__title">Raspored</h2>
            {dayEvents.length === 0 ? (
              <p className="partner-empty">Nema rezervacija ovaj dan.</p>
            ) : (
              <div className="partner-timeline">
                {dayEvents.map((res) => (
                  <Link key={res.id} to={`/partner/reservations/${res.id}`} className="partner-timelineRow">
                    <div className="partner-timelineRow__time">
                      <span className="partner-timelineRow__start">{res.startTime}</span>
                      <span className="partner-timelineRow__end">{res.endTime}</span>
                    </div>
                    <div className="partner-timelineRow__body">
                      <div className="partner-timelineRow__head">
                        <span className="partner-timelineRow__title">{res.childName}</span>
                      </div>
                      <p className="partner-timelineRow__meta">{statusLabel(res.status)}</p>
                    </div>
                    <PartnerIcon name="chevronRight" size={18} className="partner-timelineRow__chev" />
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="partner-panel">
            <h2 className="partner-panel__title">Slobodni termini</h2>
            <p className="partner-fieldHelp">Brzi odgovor roditelju: ovo je slobodno za upis.</p>
            {daySlots.length === 0 ? (
              <p className="partner-empty">Nema slobodnih termina (zatvoreno ili popunjeno).</p>
            ) : (
              <div className="partner-slotGrid">
                {daySlots.map((slot) => (
                  <Link
                    key={`${slot.startTime}-${slot.endTime}`}
                    to={`/partner/reservations?new=1&date=${cursor}&start=${slot.startTime}&end=${slot.endTime}`}
                    className="partner-slot"
                  >
                    <PartnerIcon name="clock" size={15} />
                    {formatTimeRange(slot.startTime, slot.endTime)}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </>
  )
}
