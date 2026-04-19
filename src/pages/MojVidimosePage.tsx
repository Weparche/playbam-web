import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'
import Footer from '../components/layout/Footer'
import { useAuth } from '../context/AuthContext'
import {
  getMyInvitations,
  getMyRsvps,
  getFamilyProfile,
  updateFamilyProfile,
  createFamilyProfile,
  isApiError,
  type MyInvitationSummary,
  type MyRsvpSummary,
  type FamilyProfileResponse,
} from '../lib/invitationApi'
import FamilyProfileForm, { type FamilyProfileDraft } from '../components/invitation/FamilyProfileForm'
import Button from '../components/ui/Button'

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
  const [profile, setProfile] = useState<FamilyProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [addingChild, setAddingChild] = useState(false)
  const [profileDraft, setProfileDraft] = useState<FamilyProfileDraft | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    if (!session) {
      navigate('/kreiraj-pozivnicu', { replace: true })
      return
    }

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [invRes, rsvpRes, profileRes] = await Promise.all([
          getMyInvitations(),
          getMyRsvps(),
          getFamilyProfile(null),
        ])
        setInvitations(invRes.invitations)
        setRsvps(rsvpRes.rsvps)
        setProfile(profileRes)
      } catch {
        setError('Učitavanje nije uspjelo. Pokušaj ponovno.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [session, navigate])

  const handleAddChild = () => {
    if (!profile) return
    setProfileDraft({
      parentName: profile.profile?.parentName ?? '',
      children: [
        ...profile.children.map((c) => ({ id: c.id, name: c.name, age: String(c.age) })),
        { name: '', age: '' },
      ],
    })
    setAddingChild(true)
  }

  const handleSaveProfile = async () => {
    if (!profileDraft) return
    const parentName = profileDraft.parentName.trim()
    const validChildren = profileDraft.children.filter((c) => c.name.trim() && c.age)
    if (!parentName) { setProfileError('Upiši ime mame ili tate.'); return }
    if (validChildren.length === 0) { setProfileError('Dodaj barem jedno dijete.'); return }
    setSavingProfile(true)
    setProfileError('')
    try {
      const payload = {
        parentName,
        children: validChildren.map((c) => ({ ...(c.id ? { id: c.id } : {}), name: c.name.trim(), age: Number(c.age) })),
      }
      const updated = profile?.profile
        ? await updateFamilyProfile(payload, null)
        : await createFamilyProfile(payload, null)
      setProfile(updated)
      setAddingChild(false)
      setProfileDraft(null)
    } catch (err) {
      setProfileError(isApiError(err) ? (err as Error).message : 'Greška pri spremanju.')
    } finally {
      setSavingProfile(false)
    }
  }

  return (
    <>
      <Navbar opaque />
      <main className="pb-main pb-main--demo" style={{ minHeight: '70vh' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 1rem' }}>
          <h1 className="ew-h2" style={{ marginBottom: '2rem' }}>Moj VidimoSe</h1>

          {loading && <p>Učitavam...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {!loading && (
            <>
              {/* Profile section */}
              <section style={{ marginBottom: '3rem' }}>
                <div className="pb-flowCard" style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--color-text-muted, #888)', minWidth: 130, fontSize: '0.875rem' }}>E-mail</span>
                      <span style={{ fontWeight: 500 }}>{session?.email}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--color-text-muted, #888)', minWidth: 130, fontSize: '0.875rem' }}>Ime majke ili oca</span>
                      <span style={{ fontWeight: 500 }}>{profile?.profile?.parentName || <em style={{ color: 'var(--color-text-muted,#888)' }}>nije upisano</em>}</span>
                    </div>
                    {profile && profile.children.length > 0 && profile.children.map((child) => (
                      <div key={child.id} style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--color-text-muted, #888)', minWidth: 130, fontSize: '0.875rem' }}>Dijete</span>
                        <span style={{ fontWeight: 500 }}>{child.name}, {child.age} god.</span>
                      </div>
                    ))}
                    {(!profile || profile.children.length === 0) && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--color-text-muted, #888)', minWidth: 130, fontSize: '0.875rem' }}>Dijete</span>
                        <em style={{ color: 'var(--color-text-muted,#888)' }}>nije upisano</em>
                      </div>
                    )}
                  </div>

                  {!addingChild && (
                    <div style={{ marginTop: '1rem' }}>
                      <Button type="button" variant="ghost" onClick={handleAddChild}>
                        {profile && profile.children.length > 0 ? 'Dodaj dijete' : 'Dodaj dijete i ime roditelja'}
                      </Button>
                    </div>
                  )}

                  {addingChild && profileDraft && (
                    <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--color-border, #e5e5e5)', paddingTop: '1.25rem' }}>
                      <FamilyProfileForm
                        draft={profileDraft}
                        error={profileError}
                        saving={savingProfile}
                        onChange={setProfileDraft}
                        onSave={handleSaveProfile}
                      />
                      <button
                        type="button"
                        className="pb-inlineLink"
                        style={{ marginTop: '0.5rem', display: 'block' }}
                        onClick={() => { setAddingChild(false); setProfileDraft(null); setProfileError('') }}
                      >
                        Odustani
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Invitations */}
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

              {/* RSVPs */}
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
