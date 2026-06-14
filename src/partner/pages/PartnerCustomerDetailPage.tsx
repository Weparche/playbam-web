import { Link, useParams } from 'react-router-dom'

import { usePartnerData } from '../context/PartnerDataContext'
import { formatDateHr } from '../lib/dates'
import StatusBadge from '../components/ui/StatusBadge'
import PartnerIcon from '../components/ui/PartnerIcon'

function telHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}

function smsHref(phone: string) {
  return `sms:${phone.replace(/[^+\d]/g, '')}`
}

export default function PartnerCustomerDetailPage() {
  const { id = '' } = useParams()
  const { getCustomer, reservations } = usePartnerData()
  const customer = getCustomer(id)

  if (!customer) {
    return <div className="partner-panel">Kupac nije pronađen. <Link to="/partner/customers">Natrag</Link></div>
  }

  const history = reservations.filter((r) => r.customerId === customer.id)
  const sortedHistory = [...history].sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`))
  const upcoming = [...history]
    .filter((res) => res.status !== 'completed' && res.status !== 'cancelled')
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))[0]

  return (
    <>
      <header className="partner-topbar">
        <div>
          <Link to="/partner/customers" className="partner-backLink">
            ← Svi kupci
          </Link>
          <h1 className="partner-topbar__title">{customer.fullName}</h1>
          <p className="partner-topbar__meta">{customer.phone}{customer.email ? ` · ${customer.email}` : ''}</p>
        </div>
      </header>

      <section className="partner-panel partner-clientHero">
        <div>
          <p className="partner-kicker">Client card</p>
          <h2 className="partner-clientHero__title">{customer.children.length} {customer.children.length === 1 ? 'dijete' : 'djece'} · {history.length} rezervacija</h2>
          <p className="partner-fieldHelp">{customer.notes || 'Bez posebnih napomena za roditelja.'}</p>
        </div>
        <div className="partner-contactActions">
          {customer.phone ? (
            <>
              <a href={telHref(customer.phone)} className="partner-contactBtn">
                <PartnerIcon name="phone" size={18} />
                <span>Nazovi</span>
              </a>
              <a href={smsHref(customer.phone)} className="partner-contactBtn">
                <PartnerIcon name="message" size={18} />
                <span>SMS</span>
              </a>
            </>
          ) : null}
          {customer.email ? (
            <a href={`mailto:${customer.email}`} className="partner-contactBtn">
              <PartnerIcon name="mail" size={18} />
              <span>Email</span>
            </a>
          ) : null}
        </div>
      </section>

      <div className="partner-detailGrid">
        <div className="partner-detailMain">
          <section className="partner-panel">
            <h2 className="partner-panel__title">Djeca</h2>
            {customer.children.map((child) => (
              <div key={child.id} className="partner-eventRow">
                <div>
                  <div className="partner-eventRow__title">{child.name}</div>
                  <div className="partner-eventRow__meta">Rođenje: {child.birthDate || '—'} · Alergije: {child.allergies || '—'}</div>
                  {child.notes ? <div className="partner-eventRow__meta">{child.notes}</div> : null}
                </div>
                {child.allergies ? <span className="partner-chip" data-variant="danger">Alergije</span> : null}
              </div>
            ))}
          </section>

          <section className="partner-panel">
            <h2 className="partner-panel__title">Povijest rezervacija</h2>
            {sortedHistory.map((res) => (
              <Link key={res.id} to={`/partner/reservations/${res.id}`} className="partner-eventRow partner-eventRow--link">
                <div>
                  <div className="partner-eventRow__title">{res.childName}</div>
                  <div className="partner-eventRow__meta">{formatDateHr(res.date)} · {res.startTime}</div>
                </div>
                <StatusBadge status={res.status} />
              </Link>
            ))}
          </section>
        </div>

        <aside className="partner-detailSide">
          <section className="partner-panel">
            <h2 className="partner-panel__title">Sljedeća rezervacija</h2>
            {upcoming ? (
              <Link to={`/partner/reservations/${upcoming.id}`} className="partner-nextBooking">
                <div className="partner-eventRow__title">{upcoming.childName}</div>
                <div className="partner-eventRow__meta">{formatDateHr(upcoming.date)} · {upcoming.startTime}</div>
                <div className="partner-eventRow__meta">{upcoming.childrenCount} djece · {upcoming.theme || 'Bez teme'}</div>
              </Link>
            ) : (
              <p className="partner-empty">Nema nadolazećih rezervacija.</p>
            )}
          </section>
        </aside>
      </div>
    </>
  )
}
