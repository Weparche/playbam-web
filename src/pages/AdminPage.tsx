import { useEffect, useRef, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'

import Navbar from '../components/landing/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { bulkDeleteAdminInvitations, getAdminInvitations, type AdminInvitationRow } from '../lib/invitationApi'

const ADMIN_EMAIL = 'ig29007@gmail.com'

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}.${m}.${y}`
}

function formatCreatedAt(isoStr: string) {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  return d.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminPage() {
  const { session } = useAuth()
  const [rows, setRows] = useState<AdminInvitationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [deleting, setDeleting] = useState(false)
  const selectAllRef = useRef<HTMLInputElement>(null)

  if (!session || session.email !== ADMIN_EMAIL) {
    return <Navigate to="/" replace />
  }

  useEffect(() => {
    getAdminInvitations()
      .then(setRows)
      .catch(() => setError('Greška pri učitavanju pozivnica.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      r.title.toLowerCase().includes(q) ||
      r.celebrantName.toLowerCase().includes(q) ||
      r.hostEmail.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q)
    )
  })

  const filteredIds = filtered.map((r) => r.id)
  const selectedInFiltered = filteredIds.filter((id) => selectedIds.has(id)).length
  const allFilteredSelected = filtered.length > 0 && selectedInFiltered === filtered.length

  useEffect(() => {
    const el = selectAllRef.current
    if (!el) {
      return
    }
    el.indeterminate = filtered.length > 0 && selectedInFiltered > 0 && selectedInFiltered < filtered.length
  }, [filtered.length, selectedInFiltered])

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allFilteredSelected) {
        for (const id of filteredIds) {
          next.delete(id)
        }
      } else {
        for (const id of filteredIds) {
          next.add(id)
        }
      }
      return next
    })
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) {
      return
    }
    if (
      !window.confirm(
        `Obrisati ${ids.length} pozivnica? Svi povezani podaci (RSVP, lista želja, chat…) bit će uklonjeni. Ova radnja je nepovratna.`,
      )
    ) {
      return
    }
    setDeleting(true)
    setError('')
    try {
      await bulkDeleteAdminInvitations(ids)
      setSelectedIds(new Set())
      const next = await getAdminInvitations()
      setRows(next)
    } catch {
      setError('Brisanje pozivnica nije uspjelo.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh', padding: '2rem 1rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.6rem', fontWeight: 900, color: '#17243b' }}>
            Admin konzola
          </h1>
          <p style={{ margin: 0, color: '#5f6473', fontSize: '0.9rem' }}>
            Ukupno pozivnica: <strong>{rows.length}</strong>
            {loading ? ' — učitavam...' : ''}
          </p>
        </div>

        {error ? (
          <div style={{ padding: '1rem', background: '#fee2e2', borderRadius: 12, color: '#991b1b', marginBottom: '1rem' }}>
            {error}
          </div>
        ) : null}

        <div style={{ marginBottom: '1rem' }}>
          <input
            className="pb-input"
            type="search"
            placeholder="Pretraži po naslovu, slavnjeniku, hostu, lokaciji..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 420 }}
          />
        </div>

        {!loading && selectedIds.size > 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginBottom: '1rem',
              padding: '0.65rem 0.85rem',
              background: '#fef3c7',
              borderRadius: 12,
              border: '1px solid #fcd34d',
            }}
          >
            <span style={{ fontWeight: 700, color: '#92400e' }}>Označeno: {selectedIds.size}</span>
            <Button type="button" variant="amber" onClick={() => void handleBulkDelete()} disabled={deleting}>
              {deleting ? 'Brisanje…' : 'Obriši selektirano'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setSelectedIds(new Set())} disabled={deleting}>
              Poništi odabir
            </Button>
          </div>
        ) : null}

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#5f6473' }}>Učitavam pozivnice…</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f4f6fb', textAlign: 'left' }}>
                  <th style={{ padding: '0.6rem 0.5rem', width: 36, borderBottom: '2px solid #e5e7ef', textAlign: 'center' }}>
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={filtered.length > 0 && allFilteredSelected}
                      disabled={filtered.length === 0}
                      title="Označi sve u tablici (trenutno filtrirano)"
                      aria-label="Označi sve u tablici"
                      onChange={() => toggleSelectAllFiltered()}
                    />
                  </th>
                  {['#', 'Naslov', 'Slavljenik', 'Datum', 'Lokacija', 'Host', 'RSVP', 'Gosti', 'Kreirano', 'Link'].map((h) => (
                    <th key={h} style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#17243b', borderBottom: '2px solid #e5e7ef', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ padding: '2rem', textAlign: 'center', color: '#5f6473' }}>
                      {search ? 'Nema rezultata za tu pretragu.' : 'Nema pozivnica.'}
                    </td>
                  </tr>
                ) : null}
                {filtered.map((row, idx) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #e5e7ef', background: idx % 2 === 0 ? '#fff' : '#f9fafc' }}>
                    <td style={{ padding: '0.55rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                        aria-label={`Označi pozivnicu ${row.title || row.id}`}
                      />
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', color: '#8896b3', fontVariantNumeric: 'tabular-nums' }}>{idx + 1}</td>
                    <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: '#17243b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.title || '—'}
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', color: '#344563', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.celebrantName || '—'}
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', color: '#344563', whiteSpace: 'nowrap' }}>
                      {formatDate(row.date)}
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', color: '#344563', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.location || '—'}
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', color: '#344563', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span title={row.hostEmail}>{row.hostEmail}</span>
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center', fontWeight: 700, color: row.rsvpCount > 0 ? '#1d7a4e' : '#8896b3' }}>
                      {row.rsvpCount}
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center', fontWeight: 700, color: row.guestCount > 0 ? '#1d7a4e' : '#8896b3' }}>
                      {row.guestCount}
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', color: '#8896b3', whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                      {formatCreatedAt(row.createdAt)}
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem' }}>
                      <Link
                        to={`/pozivnica/${row.publicSlug}`}
                        style={{ color: '#1e7be6', fontWeight: 700, textDecoration: 'underline', whiteSpace: 'nowrap' }}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Otvori →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
