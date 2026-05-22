import { Link, useParams } from 'react-router-dom'

import { usePartnerData } from '../context/PartnerDataContext'
import { formatDateHr } from '../lib/dates'
import StatusBadge from '../components/ui/StatusBadge'

export default function PartnerCustomerDetailPage() {
  const { id = '' } = useParams()
  const { getCustomer, reservations } = usePartnerData()
  const customer = getCustomer(id)

  if (!customer) {
    return <div className="partner-panel">Kupac nije pronađen. <Link to="/partner/customers">Natrag</Link></div>
  }

  const history = reservations.filter((r) => r.customerId === customer.id)

  return (
    <>
      <header className="partner-topbar">
        <h1 className="partner-topbar__title">{customer.fullName}</h1>
        <p className="partner-topbar__meta">{customer.phone} · {customer.email}</p>
      </header>

      <section className="partner-panel">
        <h2 className="partner-panel__title">Napomene</h2>
        <p>{customer.notes || '—'}</p>
      </section>

      <section className="partner-panel">
        <h2 className="partner-panel__title">Djeca</h2>
        {customer.children.map((child) => (
          <div key={child.id} className="partner-eventRow">
            <div>
              <div className="partner-eventRow__title">{child.name}</div>
              <div className="partner-eventRow__meta">Rođenje: {child.birthDate || '—'} · Alergije: {child.allergies || '—'}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="partner-panel">
        <h2 className="partner-panel__title">Povijest rezervacija</h2>
        {history.map((res) => (
          <div key={res.id} className="partner-eventRow">
            <div>
              <div className="partner-eventRow__title">{res.childName}</div>
              <div className="partner-eventRow__meta">{formatDateHr(res.date)} · {res.startTime}</div>
            </div>
            <StatusBadge status={res.status} />
          </div>
        ))}
      </section>
    </>
  )
}
