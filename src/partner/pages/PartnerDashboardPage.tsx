import { Link } from 'react-router-dom'

import Button from '../../components/ui/Button'
import { usePartnerAuth } from '../context/PartnerAuthContext'
import { usePartnerData } from '../context/PartnerDataContext'
import { formatDateHr, formatTimeRange } from '../lib/dates'
import { formatPrice } from '../lib/pricing'
import StatusBadge from '../components/ui/StatusBadge'
import StatCard from '../components/ui/StatCard'

function ReservationMiniRow({ id, title, meta }: { id: string; title: string; meta: string }) {
  return (
    <div className="partner-eventRow">
      <div>
        <div className="partner-eventRow__title">{title}</div>
        <div className="partner-eventRow__meta">{meta}</div>
      </div>
      <Link to={`/partner/reservations/${id}`} className="pb-btn pb-btn-ghost">
        Otvori
      </Link>
    </div>
  )
}

export default function PartnerDashboardPage() {
  const { user, isAnimator } = usePartnerAuth()
  const {
    playroom,
    stats,
    todayReservations,
    tomorrowReservations,
    alerts,
    getCustomer,
    packages,
    reservationsForAnimator,
    updateAnimatorArrival,
    completeReservation,
  } = usePartnerData()

  if (isAnimator && user?.animatorId) {
    const myEvents = reservationsForAnimator(user.animatorId)
    return (
      <>
        <header className="partner-topbar">
          <div>
            <h1 className="partner-topbar__title">Moji eventi danas</h1>
            <p className="partner-topbar__meta">{playroom.name}</p>
          </div>
        </header>
        <div className="partner-cardList">
          {myEvents.length === 0 ? (
            <div className="partner-panel">Danas nema dodijeljenih evenata.</div>
          ) : (
            myEvents.map((res) => {
              const customer = getCustomer(res.customerId)
              return (
                <div key={res.id} className="partner-resCard">
                  <div className="partner-eventRow__title">
                    {res.startTime} · {res.childName} ({res.childAge})
                  </div>
                  <div className="partner-eventRow__meta">
                    {playroom.address}, {playroom.city}
                  </div>
                  <div className="partner-eventRow__meta">Tema: {res.theme || '—'}</div>
                  <div className="partner-eventRow__meta">Djeca: {res.childrenCount}</div>
                  <div className="partner-eventRow__meta">Roditelj: {customer?.fullName}</div>
                  {res.notes ? <div className="partner-eventRow__meta">Napomena: {res.notes}</div> : null}
                  <div className="partner-resCard__actions">
                    <Button type="button" onClick={() => updateAnimatorArrival(res.id, 'en_route')}>
                      Dolazim
                    </Button>
                    <Button variant="ghost" type="button" onClick={() => completeReservation(res.id)}>
                      Event završen
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <header className="partner-topbar">
        <div>
          <h1 className="partner-topbar__title">Pregled</h1>
          <p className="partner-topbar__meta">{playroom.name}</p>
        </div>
        <Link to="/partner/reservations?new=1" className="pb-btn pb-btn-primary">
          Nova rezervacija
        </Link>
      </header>

      <div className="partner-gridStats">
        <StatCard label="Rezervacije danas" value={stats.todayCount} />
        <StatCard label="Ovaj tjedan" value={stats.weekCount} />
        <StatCard label="Čeka potvrdu" value={stats.pendingConfirmationCount} />
        <StatCard label="Čeka uplatu" value={stats.waitingDepositCount} />
        <StatCard label="Prihod ovaj mjesec" value={formatPrice(stats.monthRevenue, playroom.currency)} />
      </div>

      <div className="partner-twoCol">
        <section className="partner-panel">
          <h2 className="partner-panel__title">Danas</h2>
          {todayReservations.length === 0 ? (
            <p className="partner-topbar__meta">Nema rezervacija.</p>
          ) : (
            todayReservations.map((res) => {
              const customer = getCustomer(res.customerId)
              const pkg = packages.find((p) => p.id === res.packageId)
              return (
                <ReservationMiniRow
                  key={res.id}
                  id={res.id}
                  title={`${res.startTime} · ${res.childName}`}
                  meta={`${customer?.fullName ?? '—'} · ${pkg?.name ?? '—'}`}
                />
              )
            })
          )}
        </section>

        <section className="partner-panel">
          <h2 className="partner-panel__title">Sutra</h2>
          {tomorrowReservations.length === 0 ? (
            <p className="partner-topbar__meta">Nema rezervacija.</p>
          ) : (
            tomorrowReservations.map((res) => {
              const customer = getCustomer(res.customerId)
              return (
                <ReservationMiniRow
                  key={res.id}
                  id={res.id}
                  title={`${formatDateHr(res.date)} ${formatTimeRange(res.startTime, res.endTime)}`}
                  meta={`${res.childName} · ${customer?.fullName ?? '—'}`}
                />
              )
            })
          )}
        </section>
      </div>

      <section className="partner-panel">
        <h2 className="partner-panel__title">Upozorenja</h2>
        <div className="partner-alertList">
          {alerts.missingAnimator.map((res) => (
            <div key={res.id} className="partner-alertItem partner-alertItem--danger">
              Bez animatora: {res.childName} · {formatDateHr(res.date)} {res.startTime}
            </div>
          ))}
          {alerts.missingDeposit.map((res) => (
            <div key={res.id} className="partner-alertItem">
              Bez akontacije: {res.childName} · {formatDateHr(res.date)}
            </div>
          ))}
          {alerts.pendingConfirmation.map((res) => (
            <div key={res.id} className="partner-alertItem">
              Čeka potvrdu: {res.childName} · {formatDateHr(res.date)}
            </div>
          ))}
          {alerts.missingAnimator.length + alerts.missingDeposit.length + alerts.pendingConfirmation.length === 0 ? (
            <p className="partner-topbar__meta">Sve u redu — nema upozorenja.</p>
          ) : null}
        </div>
      </section>

      <section className="partner-panel">
        <h2 className="partner-panel__title">Brzi pregled statusa (danas)</h2>
        {todayReservations.map((res) => (
          <div key={res.id} className="partner-eventRow">
            <div>
              <div className="partner-eventRow__title">{res.childName}</div>
              <div className="partner-eventRow__meta">{formatTimeRange(res.startTime, res.endTime)}</div>
            </div>
            <StatusBadge status={res.status} />
          </div>
        ))}
      </section>
    </>
  )
}
