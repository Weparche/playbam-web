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
  deleteFamilyProfile,
  deleteMyInvitation,
  deleteMyRsvp,
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
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const [invitations, setInvitations] = useState<MyInvitationSummary[]>([])
  const [rsvps, setRsvps] = useState<MyRsvpSummary[]>([])
  const [profile, setProfile] = useState<FamilyProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [deleteBusyKey, setDeleteBusyKey] = useState<string | null>(null)

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

  const handleDeleteInvitation = async (inv: MyInvitationSummary) => {
    if (!window.confirm(`Obrisati pozivnicu „${inv.title}”? Ova radnja je trajna.`)) {
      return
    }
    setActionError('')
    setDeleteBusyKey(`inv:${inv.id}`)
    try {
      await deleteMyInvitation(inv.id)
      setInvitations((list) => list.filter((i) => i.id !== inv.id))
    } catch (err) {
      setActionError(isApiError(err) ? (err as Error).message : 'Brisanje pozivnice nije uspjelo.')
    } finally {
      setDeleteBusyKey(null)
    }
  }

  const handleDeleteRsvp = async (rsvp: MyRsvpSummary) => {
    if (!window.confirm(`Ukloniti RSVP za „${rsvp.invitation.title}”?`)) {
      return
    }
    setActionError('')
    setDeleteBusyKey(`rsvp:${rsvp.id}`)
    try {
      await deleteMyRsvp(rsvp.id)
      setRsvps((list) => list.filter((r) => r.id !== rsvp.id))
    } catch (err) {
      setActionError(isApiError(err) ? (err as Error).message : 'Brisanje RSVP-a nije uspjelo.')
    } finally {
      setDeleteBusyKey(null)
    }
  }

  const handleDeleteProfile = async () => {
    if (
      !window.confirm(
        'Obrisati obiteljski profil? Uklonit će se spremljeni podaci o tebi i djeci povezani s ovim računom. Pozivnice koje si kreirao/la ostaju na VidimoSe-u osim ako ih posebno ne obrišeš.',
      )
    ) {
      return
    }
    setActionError('')
    setDeleteBusyKey('profile')
    try {
      await deleteFamilyProfile(null)
      logout()
      navigate('/', { replace: true })
    } catch (err) {
      setActionError(isApiError(err) ? (err as Error).message : 'Brisanje profila nije uspjelo.')
    } finally {
      setDeleteBusyKey(null)
    }
  }

  const handleAddChild = () => {
    if (!profile) return
    setProfileDraft({
      parentName: profile.profile?.parentName ?? '',
      children: [
        ...profile.children.map((c) => ({ id: c.id, name: c.name, age: c.age == null ? '' : String(c.age) })),
        { name: '', age: '' },
      ],
    })
    setAddingChild(true)
  }

  const handleSaveProfile = async () => {
    if (!profileDraft) return
    const parentName = profileDraft.parentName.trim()
    if (!parentName) { setProfileError('Upiši ime mame ili tate.'); return }
    const resolvedChildren = profileDraft.children
      .map((c) => ({
        ...(c.id ? { id: c.id } : {}),
        name: c.name.trim(),
        age: c.age.trim() === '' ? null : Number(c.age),
      }))
      .filter((c) => c.name || (c.age != null && Number.isFinite(c.age)))
    setSavingProfile(true)
    setProfileError('')
    try {
      const payload = {
        parentName,
        children: resolvedChildren,
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
          {!loading && actionError ? (
            <p className="pb-mojVidimose__actionError" role="alert">
              {actionError}
            </p>
          ) : null}

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
                        <span style={{ fontWeight: 500 }}>
                          {child.name || '—'}
                          {child.age != null ? `, ${child.age} god.` : ''}
                        </span>
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
                        Ažuriraj profil ili dodaj još jedno dijete
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }} aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
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
              <section className="pb-mojVidimose__inviteSection" aria-labelledby="moj-vs-invites-heading">
                <h2 id="moj-vs-invites-heading" className="ew-h3 pb-mojVidimose__inviteHeading">
                  Moje pozivnice
                </h2>
                {invitations.length === 0 ? (
                  <p className="pb-mojVidimose__inviteEmpty">
                    Još nisi kreirao/la pozivnicu.{' '}
                    <Link to="/kreiraj-pozivnicu" className="pb-mojVidimose__inviteEmptyLink">
                      Kreiraj prvu
                    </Link>
                    .
                  </p>
                ) : (
                  <div className="pb-mojVidimose__inviteList">
                    {invitations.map((inv) => (
                      <div key={inv.id} className="pb-mojVidimose__listRow">
                        <Link
                          to={`/pozivnica/${inv.publicSlug || inv.shareToken}`}
                          className="pb-mojVidimose__inviteLink"
                        >
                          <div className="pb-flowCard pb-mojVidimose__inviteCard">
                            <div className="pb-mojVidimose__inviteCardBody">
                              <div className="pb-mojVidimose__inviteTitle">{inv.title}</div>
                              <div className="pb-mojVidimose__inviteMeta">
                                {formatDate(inv.date)} · {inv.location}
                              </div>
                            </div>
                            <span className="pb-mojVidimose__inviteChevron" aria-hidden>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 6 15 12 9 18" />
                              </svg>
                            </span>
                          </div>
                        </Link>
                        <button
                          type="button"
                          className="pb-mojVidimose__rowDelete"
                          disabled={deleteBusyKey !== null}
                          aria-label={`Obriši pozivnicu ${inv.title}`}
                          onClick={() => void handleDeleteInvitation(inv)}
                        >
                          {deleteBusyKey === `inv:${inv.id}` ? '…' : 'Obriši'}
                        </button>
                      </div>
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
                  <div className="pb-mojVidimose__rsvpList">
                    {rsvps.map((rsvp) => (
                      <div key={rsvp.id} className="pb-mojVidimose__listRow">
                        <Link
                          to={`/pozivnica/${rsvp.invitation.publicSlug || rsvp.invitation.shareToken}`}
                          className="pb-mojVidimose__rsvpLink"
                        >
                          <div className="pb-flowCard pb-mojVidimose__rsvpCard">
                            <div className="pb-mojVidimose__rsvpCardInner">
                              <div>
                                <div className="pb-mojVidimose__rsvpTitle">{rsvp.invitation.title}</div>
                                <div className="pb-mojVidimose__rsvpMeta">
                                  {formatDate(rsvp.invitation.date)} · {rsvp.invitation.location}
                                </div>
                              </div>
                              <span
                                className={`pb-mojVidimose__rsvpPill pb-mojVidimose__rsvpPill--${rsvp.status}`}
                              >
                                <RsvpLabel status={rsvp.status} />
                              </span>
                            </div>
                          </div>
                        </Link>
                        <button
                          type="button"
                          className="pb-mojVidimose__rowDelete"
                          disabled={deleteBusyKey !== null}
                          aria-label={`Obriši RSVP za ${rsvp.invitation.title}`}
                          onClick={() => void handleDeleteRsvp(rsvp)}
                        >
                          {deleteBusyKey === `rsvp:${rsvp.id}` ? '…' : 'Obriši'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="pb-mojVidimose__dangerFoot" aria-label="Brisanje profila">
                <Button
                  type="button"
                  variant="ghost"
                  className="pb-mojVidimose__deleteProfileBtn"
                  disabled={deleteBusyKey !== null}
                  onClick={() => void handleDeleteProfile()}
                >
                  {deleteBusyKey === 'profile' ? 'Brisanje…' : 'Obriši profil'}
                </Button>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
