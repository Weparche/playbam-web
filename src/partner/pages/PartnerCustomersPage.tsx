import { Link } from 'react-router-dom'

import { usePartnerData } from '../context/PartnerDataContext'

export default function PartnerCustomersPage() {
  const { customers, reservations } = usePartnerData()

  return (
    <>
      <header className="partner-topbar"><h1 className="partner-topbar__title">Kupci</h1></header>
      <section className="partner-panel partner-tableWrap">
        <h2 className="partner-panel__title">Popis kupaca</h2>
        <table className="partner-table">
          <thead><tr><th>Ime</th><th>Telefon</th><th>Email</th><th>Djeca</th><th>Rezervacije</th><th></th></tr></thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.fullName}</td>
                <td>{customer.phone}</td>
                <td>{customer.email}</td>
                <td>{customer.children.length}</td>
                <td>{reservations.filter((r) => r.customerId === customer.id).length}</td>
                <td><Link to={`/partner/customers/${customer.id}`}>Detalj</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="partner-panel partner-cardList partner-cardList--mobileOnly">
        <h2 className="partner-panel__title">Popis kupaca</h2>
        {customers.length === 0 ? (
          <p className="partner-empty">Nema kupaca.</p>
        ) : (
          customers.map((customer) => {
            const reservationCount = reservations.filter((r) => r.customerId === customer.id).length
            return (
              <div key={customer.id} className="partner-resCard">
                <div className="partner-eventRow__title">{customer.fullName}</div>
                <div className="partner-eventRow__meta">{customer.phone}</div>
                <div className="partner-eventRow__meta">{customer.email}</div>
                <div className="partner-eventRow__meta">
                  Djeca: {customer.children.length} · Rezervacije: {reservationCount}
                </div>
                <div className="partner-resCard__actions">
                  <Link to={`/partner/customers/${customer.id}`} className="pb-btn pb-btn-ghost">
                    Detalj
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </section>
    </>
  )
}
