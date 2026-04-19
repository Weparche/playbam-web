import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'
import Footer from '../components/layout/Footer'
import { useAuth } from '../context/AuthContext'
import { getMyInvitations, getMyRsvps, type MyInvitationSummary, type MyRsvpSummary } from '../lib/invitationApi'

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function RsvpLabel({ status }: { status: string }) {
  const map: Record<string, string> = { going: 'Dolazim', not_going: 'Ne dolazim', maybe: 'Možda' }
  return <span>{map[status] ?? status}</span>
}

export default function MojVidimosePage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [invitations, setInvitations] = useState<MyInvitationSummary[]>([])
  const [rsvps, setRsvps] = useState<MyRsvpSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) {
      navigate('/kreiraj-pozivnicu', { replace: true })
      return
    }

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [invRes, rsvpRes] = await Promise.all([getMyInvitations(), getMyRsvps()])
        setInvitations(invRes.invitations)
        setRsvps(rsvpRes.rsvps)
      } catch {
        setError('Učitavanje nije uspjelo. Pokušaj ponovno.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [session, navigate])

  return (
    <>
      <Navbar opaque />
      <main className="pb-main pb-main--demo" style={{ minHeight: '70vh' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 1rem' }}>
          <h1 className="ew-h2" style={{ marginBottom: '0.25rem' }}>Moj VidimoSe</h1>
          {session && (
            <p style={{ color: 'var(--color-text-muted, #888)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
              {session.email}
            </p>
          )}

          {loading && <p>Učitavam...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {!loading && (
            <>
              <section style={{ marginBottom: '3rem' }}>
                <h2 className="ew-h3" style={{ marginBottom: '1rem' }}>Moje pozivnice</h2>
                {invitations.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted, #888)' }}>
                    Još nisi kreirao/la pozivnicu.{' '}
                    <Link to="/kreiraj-pozivnicu" style={{ color: 'inherit', textDecoration: 'underline' }}>
                      Kreiraj prvu
                    </Link>
                    .
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {invitations.map((inv) => (
                      <Link
                        key={inv.id}
                        to={`/pozivnica/${inv.publicSlug || inv.shareToken}`}
                        style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                      >
                        <div className="pb-flowCard" style={{ padding: '1rem 1.25rem', cursor: 'pointer' }}>
                          <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{inv.title}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted, #888)' }}>
                            {formatDate(inv.date)} · {inv.location}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h2 className="ew-h3" style={{ marginBottom: '1rem' }}>Moj RSVP</h2>
                {rsvps.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted, #888)' }}>
                    Još nisi potvrdio/la dolazak na nijednu proslavu.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {rsvps.map((rsvp) => (
                      <Link
                        key={rsvp.id}
                        to={`/pozivnica/${rsvp.invitation.publicSlug || rsvp.invitation.shareToken}`}
                        style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                      >
                        <div className="pb-flowCard" style={{ padding: '1rem 1.25rem', cursor: 'pointer' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                            <div>
                              <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{rsvp.invitation.title}</div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted, #888)' }}>
                                {formatDate(rsvp.invitation.date)} · {rsvp.invitation.location}
                              </div>
                            </div>
                            <span style={{
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              padding: '0.2rem 0.6rem',
                              borderRadius: 20,
                              background: rsvp.status === 'going' ? '#d4edda' : rsvp.status === 'not_going' ? '#f8d7da' : '#fff3cd',
                              color: rsvp.status === 'going' ? '#155724' : rsvp.status === 'not_going' ? '#721c24' : '#856404',
                              whiteSpace: 'nowrap',
                            }}>
                              <RsvpLabel status={rsvp.status} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
