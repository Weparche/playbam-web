import { useEffect, useRef, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'

import Navbar from '../components/landing/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'
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
  const isAdmin = session?.email === ADMIN_EMAIL
  const [rows, setRows] = useState<AdminInvitationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [deleting, setDeleting] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const selectAllRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false)
      return
    }
    getAdminInvitations()
      .then(setRows)
      .catch(() => setError('Greška pri učitavanju pozivnica.'))
      .finally(() => setLoading(false))
  }, [isAdmin])

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

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

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
    setDeleting(true)
    setError('')
    try {
      await bulkDeleteAdminInvitations(ids)
      setSelectedIds(new Set())
      setConfirmDeleteOpen(false)
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
      <main className="pb-adminPage" id="main">
        <Container size="wide">
        <header className="pb-adminPage__header">
          <div>
            <span className="pb-adminPage__eyebrow">Interno</span>
            <h1 className="pb-adminPage__title">
            Admin konzola
            </h1>
            <p className="pb-adminPage__subtitle">
              Ukupno pozivnica: <strong>{rows.length}</strong>
            {loading ? ' — učitavam...' : ''}
            </p>
          </div>
        </header>

        {error ? (
          <div className="pb-inlineNote pb-inlineNote--error" role="alert">
            {error}
          </div>
        ) : null}

        <div className="pb-adminToolbar">
          <input
            className="pb-input pb-adminToolbar__search"
            type="search"
            placeholder="Pretraži po naslovu, slavnjeniku, hostu, lokaciji..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {!loading && selectedIds.size > 0 ? (
          <div className="pb-adminBulkBar">
            <span>Označeno: {selectedIds.size}</span>
            <Button type="button" variant="amber" onClick={() => setConfirmDeleteOpen(true)} disabled={deleting}>
              {deleting ? 'Brisanje…' : 'Obriši selektirano'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setSelectedIds(new Set())} disabled={deleting}>
              Poništi odabir
            </Button>
          </div>
        ) : null}

        {loading ? (
          <div className="pb-adminState">Učitavam pozivnice…</div>
        ) : (
          <div className="pb-adminTableWrap">
            <table className="pb-adminTable">
              <thead>
                <tr>
                  <th className="pb-adminTable__check">
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
                    <th key={h}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="pb-adminTable__empty">
                      {search ? 'Nema rezultata za tu pretragu.' : 'Nema pozivnica.'}
                    </td>
                  </tr>
                ) : null}
                {filtered.map((row, idx) => (
                  <tr key={row.id}>
                    <td className="pb-adminTable__check">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                        aria-label={`Označi pozivnicu ${row.title || row.id}`}
                      />
                    </td>
                    <td className="pb-adminTable__index">{idx + 1}</td>
                    <td className="pb-adminTable__strong pb-adminTable__truncate">
                      {row.title || '—'}
                    </td>
                    <td className="pb-adminTable__truncate">
                      {row.celebrantName || '—'}
                    </td>
                    <td className="pb-adminTable__nowrap">
                      {formatDate(row.date)}
                    </td>
                    <td className="pb-adminTable__truncate">
                      {row.location || '—'}
                    </td>
                    <td className="pb-adminTable__truncate">
                      <span title={row.hostEmail}>{row.hostEmail}</span>
                    </td>
                    <td className={`pb-adminTable__metric ${row.rsvpCount > 0 ? 'is-active' : ''}`}>
                      {row.rsvpCount}
                    </td>
                    <td className={`pb-adminTable__metric ${row.guestCount > 0 ? 'is-active' : ''}`}>
                      {row.guestCount}
                    </td>
                    <td className="pb-adminTable__muted pb-adminTable__nowrap">
                      {formatCreatedAt(row.createdAt)}
                    </td>
                    <td>
                      <Link
                        to={`/pozivnica/${row.publicSlug}`}
                        className="pb-adminTable__link"
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
        </Container>
      </main>
      {confirmDeleteOpen ? (
        <div className="pb-modalOverlay" role="presentation">
          <div className="pb-modalDialog pb-adminConfirm" role="dialog" aria-modal="true" aria-labelledby="admin-delete-title">
            <div className="pb-modalDialog__head">
              <h2 id="admin-delete-title" className="pb-modalDialog__title">Obrisati pozivnice?</h2>
              <button type="button" className="pb-modalDialog__close" onClick={() => setConfirmDeleteOpen(false)} aria-label="Zatvori">×</button>
            </div>
            <div className="pb-modalDialog__body">
              <p className="pb-modalDialog__lead">
                Obrisat će se {selectedIds.size} pozivnica i svi povezani podaci: RSVP, lista želja i chat. Ova radnja je nepovratna.
              </p>
              <div className="pb-flowActions pb-flowActions--modal">
                <Button type="button" variant="amber" onClick={() => void handleBulkDelete()} disabled={deleting}>
                  {deleting ? 'Brisanje…' : 'Da, obriši'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setConfirmDeleteOpen(false)} disabled={deleting}>
                  Odustani
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <Footer />
    </>
  )
}
