import { Link } from 'react-router-dom'

import { usePartnerData } from '../context/PartnerDataContext'

export default function PartnerCustomersPage() {
  const { customers, reservations } = usePartnerData()

  return (
    <>
      <header className="partner-topbar"><h1 className="partner-topbar__title">Kupci</h1></header>
      <section className="partner-panel partner-tableWrap">
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
    </>
  )
}
