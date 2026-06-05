import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import Button from '../../components/ui/Button'
import { usePartnerAuth } from '../context/PartnerAuthContext'
import { usePartnerData } from '../context/PartnerDataContext'
import { formatDayHeadingHr, formatTimeRange, todayKey } from '../lib/dates'
import { formatPrice } from '../lib/pricing'
import type { BirthdayReservation, Customer } from '../types'
import PartnerIcon from '../components/ui/PartnerIcon'

function bySchedule(a: BirthdayReservation, b: BirthdayReservation) {
  return `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)
}

function childAllergies(customer: Customer | null, res: BirthdayReservation): string {
  if (!customer) return ''
  const match = customer.children.find(
    (c) => c.name.trim().toLowerCase() === res.childName.trim().toLowerCase(),
  )
  return match?.allergies?.trim() ?? ''
}

function ReadinessChips({ res, customer }: { res: BirthdayReservation; customer: Customer | null }) {
  const hasAnimator = res.assignedAnimatorIds.length > 0
  const allergies = childAllergies(customer, res)
  return (
    <div className="partner-chips">
      <span className="partner-chip" data-variant="muted">
        {res.childrenCount} djece
      </span>
      <span className="partner-chip" data-variant={hasAnimator ? 'ok' : 'warn'}>
        <PartnerIcon name={hasAnimator ? 'check' : 'alert'} size={13} />
        {hasAnimator ? 'Animator' : 'Bez animatora'}
      </span>
      <span className="partner-chip" data-variant={res.depositPaid ? 'ok' : 'warn'}>
        <PartnerIcon name={res.depositPaid ? 'check' : 'alert'} size={13} />
        {res.depositPaid ? 'Akontacija' : 'Bez akontacije'}
      </span>
      {allergies ? (
        <span className="partner-chip" data-variant="danger" title={allergies}>
          <PartnerIcon name="alert" size={13} />
          Alergije
        </span>
      ) : null}
    </div>
  )
}

function TimelineRow({ res }: { res: BirthdayReservation }) {
  const { getCustomer, packages } = usePartnerData()
  const customer = getCustomer(res.customerId)
  const pkg = packages.find((p) => p.id === res.packageId)
  return (
    <Link to={`/partner/reservations/${res.id}`} className="partner-timelineRow">
      <div className="partner-timelineRow__time">
        <span className="partner-timelineRow__start">{res.startTime}</span>
        <span className="partner-timelineRow__end">{res.endTime}</span>
      </div>
      <div className="partner-timelineRow__body">
        <div className="partner-timelineRow__head">
          <span className="partner-timelineRow__title">{res.childName}</span>
          <span className="partner-timelineRow__age">{res.childAge} god.</span>
        </div>
        <p className="partner-timelineRow__meta">
          {customer?.fullName ?? 'Nepoznat roditelj'}
          {pkg ? ` · ${pkg.name}` : ''}
        </p>
        <ReadinessChips res={res} customer={customer} />
      </div>
      <PartnerIcon name="chevronRight" size={18} className="partner-timelineRow__chev" />
    </Link>
  )
}

function AnimatorDashboard() {
  const { user } = usePartnerAuth()
  const { playroom, getCustomer, reservationsForAnimator, updateAnimatorArrival, completeReservation } =
    usePartnerData()
  const myEvents = user?.animatorId
    ? [...reservationsForAnimator(user.animatorId)].sort(bySchedule)
    : []

  return (
    <>
      <header className="partner-dayhead">
        <p className="partner-dayhead__kicker">Tvoji eventi danas</p>
        <h1 className="partner-dayhead__date">{formatDayHeadingHr(todayKey())}</h1>
        <p className="partner-dayhead__meta">{playroom.name}</p>
      </header>

      {myEvents.length === 0 ? (
        <div className="partner-emptyState">
          <PartnerIcon name="today" size={28} />
          <p className="partner-emptyState__title">Danas nemaš dodijeljenih evenata</p>
          <p className="partner-emptyState__text">Kad ti vlasnik dodijeli rođendan, pojavit će se ovdje.</p>
        </div>
      ) : (
        <div className="partner-cardList">
          {myEvents.map((res) => {
            const customer = getCustomer(res.customerId)
            const allergies = childAllergies(customer, res)
            const arrived = res.animatorArrivalStatus
            return (
              <article key={res.id} className="partner-resCard">
                <div className="partner-resCard__top">
                  <div>
                    <h2 className="partner-resCard__title">
                      {res.startTime} · {res.childName} ({res.childAge})
                    </h2>
                    <p className="partner-resCard__meta">
                      {playroom.address}, {playroom.city}
                    </p>
                  </div>
                  <span className="partner-chip" data-variant={arrived === 'completed' ? 'ok' : arrived === 'en_route' ? 'info' : 'muted'}>
                    {arrived === 'completed' ? 'Završeno' : arrived === 'en_route' ? 'Na putu' : 'Najavi se'}
                  </span>
                </div>
                <dl className="partner-factRow">
                  <div><dt>Tema</dt><dd>{res.theme || '—'}</dd></div>
                  <div><dt>Djeca</dt><dd>{res.childrenCount}</dd></div>
                  <div><dt>Roditelj</dt><dd>{customer?.fullName ?? '—'}</dd></div>
                </dl>
                {allergies ? (
                  <p className="partner-resCard__alert">
                    <PartnerIcon name="alert" size={15} /> Alergije: {allergies}
                  </p>
                ) : null}
                {res.notes ? <p className="partner-resCard__note">Napomena: {res.notes}</p> : null}
                <div className="partner-resCard__actions">
                  <Button type="button" onClick={() => updateAnimatorArrival(res.id, 'en_route')}>
                    Krećem
                  </Button>
                  <Button variant="ghost" type="button" onClick={() => completeReservation(res.id)}>
                    Event završen
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}

const TRIAGE_META = {
  confirm: { label: 'Potvrdi', need: 'confirm', variant: 'warn' as const },
  deposit: { label: 'Naplati akontaciju', need: 'deposit', variant: 'warn' as const },
  animator: { label: 'Dodijeli animatora', need: 'animator', variant: 'danger' as const },
}

export default function PartnerDashboardPage() {
  const { isAnimator } = usePartnerAuth()
  const {
    playroom,
    stats,
    todayReservations,
    tomorrowReservations,
    alerts,
    getCustomer,
    confirmReservation,
    markDepositPaid,
  } = usePartnerData()

  const triage = useMemo(() => {
    const seen = new Set<string>()
    const items: Array<{ res: BirthdayReservation; kind: keyof typeof TRIAGE_META }> = []
    const push = (list: BirthdayReservation[], kind: keyof typeof TRIAGE_META) => {
      for (const res of list) {
        if (seen.has(res.id)) continue
        seen.add(res.id)
        items.push({ res, kind })
      }
    }
    push(alerts.pendingConfirmation, 'confirm')
    push(alerts.missingDeposit, 'deposit')
    push(alerts.missingAnimator, 'animator')
    items.sort((a, b) => bySchedule(a.res, b.res))
    return items
  }, [alerts])

  const today = useMemo(() => [...todayReservations].sort(bySchedule), [todayReservations])
  const tomorrow = useMemo(() => [...tomorrowReservations].sort(bySchedule), [tomorrowReservations])

  if (isAnimator) {
    return <AnimatorDashboard />
  }

  const chips = [
    { key: 'confirm', count: alerts.pendingConfirmation.length, label: 'čeka potvrdu', need: 'confirm' },
    { key: 'animator', count: alerts.missingAnimator.length, label: 'bez animatora', need: 'animator' },
    { key: 'deposit', count: alerts.missingDeposit.length, label: 'bez akontacije', need: 'deposit' },
  ].filter((c) => c.count > 0)

  const allClear = triage.length === 0

  return (
    <>
      <header className="partner-dayhead">
        <p className="partner-dayhead__kicker">{playroom.name}</p>
        <h1 className="partner-dayhead__date">{formatDayHeadingHr(todayKey())}</h1>
        <p className="partner-dayhead__meta">
          {stats.todayCount} {stats.todayCount === 1 ? 'rođendan danas' : 'rođendana danas'} · {stats.weekCount} ovaj tjedan
          · Prihod ovaj mjesec {formatPrice(stats.monthRevenue, playroom.currency)}
        </p>
      </header>

      <section className={`partner-triage${allClear ? ' is-clear' : ''}`} aria-labelledby="triage-title">
        <div className="partner-triage__head">
          <h2 className="partner-triage__title" id="triage-title">
            {allClear ? 'Sve je pod kontrolom' : 'Treba te'}
          </h2>
          {!allClear ? (
            <div className="partner-triage__chips">
              {chips.map((chip) => (
                <Link key={chip.key} to={`/partner/reservations?need=${chip.need}`} className="partner-triageChip">
                  <strong>{chip.count}</strong>
                  <span>{chip.label}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {allClear ? (
          <p className="partner-triage__clearText">
            Nema otvorenih zadataka. Potvrde, akontacije i animatori su posloženi.
          </p>
        ) : (
          <ul className="partner-triage__list">
            {triage.slice(0, 6).map(({ res, kind }) => {
              const meta = TRIAGE_META[kind]
              const customer = getCustomer(res.customerId)
              return (
                <li key={res.id} className="partner-triageRow">
                  <div className="partner-triageRow__main">
                    <Link to={`/partner/reservations/${res.id}`} className="partner-triageRow__title">
                      {res.childName}
                    </Link>
                    <span className="partner-triageRow__meta">
                      {formatTimeRange(res.startTime, res.endTime)} · {customer?.fullName ?? '—'}
                    </span>
                  </div>
                  <span className="partner-chip" data-variant={meta.variant}>
                    {kind === 'confirm' ? 'Čeka potvrdu' : kind === 'deposit' ? 'Bez akontacije' : 'Bez animatora'}
                  </span>
                  {kind === 'confirm' ? (
                    <Button size="sm" type="button" onClick={() => confirmReservation(res.id)}>
                      Potvrdi
                    </Button>
                  ) : kind === 'deposit' ? (
                    <Button size="sm" type="button" onClick={() => markDepositPaid(res.id)}>
                      Plaćeno
                    </Button>
                  ) : (
                    <Link to={`/partner/reservations/${res.id}`} className="pb-btn pb-btn-ghost pb-btn-sm">
                      Dodijeli
                    </Link>
                  )}
                </li>
              )
            })}
            {triage.length > 6 ? (
              <li className="partner-triageRow partner-triageRow--more">
                <Link to="/partner/reservations">Još {triage.length - 6} za riješiti →</Link>
              </li>
            ) : null}
          </ul>
        )}
      </section>

      <section className="partner-section">
        <div className="partner-section__head">
          <h2 className="partner-section__title">Danas</h2>
          <Link to="/partner/calendar" className="partner-section__link">
            Otvori kalendar
          </Link>
        </div>
        {today.length === 0 ? (
          <div className="partner-emptyState">
            <PartnerIcon name="today" size={28} />
            <p className="partner-emptyState__title">Danas nema rođendana</p>
            <p className="partner-emptyState__text">Slobodan dan, ili prilika da nazoveš roditelje koji još nisu potvrdili.</p>
          </div>
        ) : (
          <div className="partner-timeline">
            {today.map((res) => (
              <TimelineRow key={res.id} res={res} />
            ))}
          </div>
        )}
      </section>

      {tomorrow.length > 0 ? (
        <section className="partner-section">
          <div className="partner-section__head">
            <h2 className="partner-section__title">Sutra</h2>
            <span className="partner-section__count">{tomorrow.length}</span>
          </div>
          <div className="partner-timeline">
            {tomorrow.map((res) => (
              <TimelineRow key={res.id} res={res} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}
