import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { usePartnerData } from '../context/PartnerDataContext'
import PartnerSetupTabs from '../components/layout/PartnerSetupTabs'
import PartnerIcon from '../components/ui/PartnerIcon'

type SortKey = 'name' | 'reservations'

export default function PartnerCustomersPage() {
  const { customers, reservations } = usePartnerData()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('name')

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const withCounts = customers.map((c) => ({
      customer: c,
      count: reservations.filter((r) => r.customerId === c.id).length,
    }))
    const filtered = q
      ? withCounts.filter(
          ({ customer }) =>
            customer.fullName.toLowerCase().includes(q) ||
            customer.phone.toLowerCase().includes(q) ||
            customer.email.toLowerCase().includes(q),
        )
      : withCounts
    return [...filtered].sort((a, b) =>
      sort === 'name' ? a.customer.fullName.localeCompare(b.customer.fullName) : b.count - a.count,
    )
  }, [customers, reservations, search, sort])

  return (
    <>
      <PartnerSetupTabs />

      <div className="partner-filters">
        <input
          className="pb-input"
          placeholder="Pretraži po imenu, mobitelu ili emailu"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="partner-filters__date">
          <span>Sortiraj</span>
          <select className="pb-input" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="name">Po imenu</option>
            <option value="reservations">Po broju rezervacija</option>
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <div className="partner-emptyState">
          <PartnerIcon name="customers" size={28} />
          <p className="partner-emptyState__title">{customers.length === 0 ? 'Još nema kupaca' : 'Nema rezultata'}</p>
          <p className="partner-emptyState__text">
            {customers.length === 0
              ? 'Novi roditelj se automatski sprema kad upišeš rezervaciju.'
              : 'Pokušaj s drugim pojmom pretrage.'}
          </p>
        </div>
      ) : (
        <>
          <section className="partner-panel partner-tableWrap">
            <table className="partner-table">
              <thead><tr><th>Ime</th><th>Telefon</th><th>Email</th><th>Djeca</th><th>Rezervacije</th><th></th></tr></thead>
              <tbody>
                {rows.map(({ customer, count }) => (
                  <tr key={customer.id}>
                    <td>{customer.fullName}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.email}</td>
                    <td>{customer.children.length}</td>
                    <td>{count}</td>
                    <td>
                      <Link to={`/partner/customers/${customer.id}`} className="pb-btn pb-btn-ghost pb-btn-sm">
                        Otvori
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="partner-cardList partner-cardList--mobileOnly">
            {rows.map(({ customer, count }) => (
              <Link key={customer.id} to={`/partner/customers/${customer.id}`} className="partner-resCard partner-resCard--link">
                <div className="partner-resCard__title">{customer.fullName}</div>
                <div className="partner-resCard__meta">{customer.phone}{customer.email ? ` · ${customer.email}` : ''}</div>
                <div className="partner-resCard__meta">Djeca: {customer.children.length} · Rezervacije: {count}</div>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  )
}
