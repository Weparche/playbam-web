import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import InvitationCard from '../components/invitation/InvitationCard'
import Footer from '../components/layout/Footer'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import {
  cancelInvitationWishlistReservation,
  createFamilyProfile,
  createInvitationWishlistItem,
  createMembershipRequest,
  deleteInvitationWishlistItem,
  getFamilyProfile,
  getInvitationAccess,
  getInvitationWishlist,
  getMyMembershipRequest,
  getMyRsvp,
  getPublicInvitation,
  isApiError,
  listMembershipRequests,
  reserveInvitationWishlistItem,
  reviewMembershipRequest,
  saveRsvp,
  updateFamilyProfile,
  updateInvitationWishlistItem,
  type FamilyProfilePayload,
  type FamilyProfileResponse,
  type InvitationAccess,
  type InvitationRsvp,
  type InvitationWishlistItem,
  type InvitationWishlistPayload,
  type MembershipRequest,
  type PublicInvitation,
} from '../lib/invitationApi'
import type { TemporaryWebIdentity } from '../lib/tempWebIdentity'

type FamilyDraftChild = {
  id?: string
  name: string
  age: string
}

type FamilyProfileDraft = {
  parentName: string
  children: FamilyDraftChild[]
}

type WishlistDraft = {
  title: string
  description: string
  url: string
  priceLabel: string
  imageUrl: string
  priorityOrder: string
}

function createEmptyDraft(parentName = ''): FamilyProfileDraft {
  return {
    parentName,
    children: [{ name: '', age: '' }],
  }
}

function createDraftFromProfile(familyProfile: FamilyProfileResponse, fallbackParentName = ''): FamilyProfileDraft {
  if (!familyProfile.profile) {
    return createEmptyDraft(fallbackParentName)
  }

  return {
    parentName: familyProfile.profile.parentName || fallbackParentName,
    children: familyProfile.children.length
      ? familyProfile.children.map((child) => ({
          id: child.id,
          name: child.name,
          age: String(child.age),
        }))
      : [{ name: '', age: '' }],
  }
}

function createWishlistDraft(item?: InvitationWishlistItem | null): WishlistDraft {
  return {
    title: item?.title ?? '',
    description: item?.description ?? '',
    url: item?.url ?? '',
    priceLabel: item?.priceLabel ?? '',
    imageUrl: item?.imageUrl ?? '',
    priorityOrder: item ? String(item.priorityOrder) : '0',
  }
}

function getMembershipStatusLabel(status: InvitationAccess['membershipStatus'] | MembershipRequest['status']) {
  if (status === 'approved') {
    return 'Odobreno'
  }

  if (status === 'rejected') {
    return 'Odbijeno'
  }

  return 'Na čekanju'
}

function buildWishlistPayload(draft: WishlistDraft): InvitationWishlistPayload | null {
  const title = draft.title.trim()
  const priorityOrder = Number(draft.priorityOrder)

  if (!title || !Number.isInteger(priorityOrder) || priorityOrder < 0) {
    return null
  }

  return {
    title,
    description: draft.description.trim() || null,
    url: draft.url.trim() || null,
    priceLabel: draft.priceLabel.trim() || null,
    imageUrl: draft.imageUrl.trim() || null,
    priorityOrder,
    isActive: true,
  }
}

function getReserveErrorMessage(error: unknown) {
  if (isApiError(error, 409)) {
    return 'Ovaj poklon je u međuvremenu već rezerviran.'
  }

  return 'Rezervacija poklona trenutno nije uspjela.'
}

function getDeleteErrorMessage(error: unknown) {
  if (isApiError(error, 409)) {
    return 'Poklon nije moguće obrisati dok ima aktivnu rezervaciju.'
  }

  return 'Brisanje poklona trenutno nije uspjelo.'
}

export default function SharedInvitationPage() {
  const { token = '' } = useParams()
  const { user, login, logout } = useAuth()
  const [invitation, setInvitation] = useState<PublicInvitation | null>(null)
  const [access, setAccess] = useState<InvitationAccess | null>(null)
  const [familyProfile, setFamilyProfile] = useState<FamilyProfileResponse | null>(null)
  const [membershipRequest, setMembershipRequest] = useState<MembershipRequest | null>(null)
  const [hostRequests, setHostRequests] = useState<MembershipRequest[]>([])
  const [wishlistItems, setWishlistItems] = useState<InvitationWishlistItem[]>([])
  const [rsvp, setRsvp] = useState<InvitationRsvp | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingPrivateState, setLoadingPrivateState] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [identityDraft, setIdentityDraft] = useState<TemporaryWebIdentity>({
    email: user?.email ?? '',
    parentName: user?.parentName ?? '',
  })
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [profileDraft, setProfileDraft] = useState<FamilyProfileDraft>(createEmptyDraft(user?.parentName ?? ''))
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([])
  const [authError, setAuthError] = useState('')
  const [profileError, setProfileError] = useState('')
  const [requestError, setRequestError] = useState('')
  const [hostError, setHostError] = useState('')
  const [wishlistError, setWishlistError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [submittingRequest, setSubmittingRequest] = useState(false)
  const [savingRsvp, setSavingRsvp] = useState(false)
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null)
  const [wishlistActionId, setWishlistActionId] = useState<string | null>(null)
  const [wishlistDraft, setWishlistDraft] = useState<WishlistDraft>(createWishlistDraft())
  const [wishlistFormError, setWishlistFormError] = useState('')
  const [editingWishlistItemId, setEditingWishlistItemId] = useState<string | null>(null)
  const [savingWishlistItem, setSavingWishlistItem] = useState(false)

  useEffect(() => {
    setIdentityDraft({
      email: user?.email ?? '',
      parentName: user?.parentName ?? '',
    })
  }, [user])

  useEffect(() => {
    let cancelled = false

    async function loadPublicInvitation() {
      setLoading(true)
      setError(null)

      try {
        const data = await getPublicInvitation(token)
        if (!cancelled) {
          setInvitation(data)
        }
      } catch (caughtError) {
        if (!cancelled) {
          setInvitation(null)
          setError(isApiError(caughtError, 404) ? 'NOT_FOUND' : 'LOAD_FAILED')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadPublicInvitation()

    return () => {
      cancelled = true
    }
  }, [token])

  const hasFamilyProfile = Boolean(familyProfile?.profile)
  const isHost = access?.isHost ?? false
  const hasPrivateAccess = access?.canAccessPrivateInvitation ?? false
  const canViewWishlist = access?.canViewWishlist ?? false

  const resetWishlistForm = () => {
    setWishlistDraft(createWishlistDraft())
    setEditingWishlistItemId(null)
    setWishlistFormError('')
  }

  const refreshWishlist = async (identity = user) => {
    if (!invitation || !identity || !canViewWishlist) {
      return
    }

    setWishlistLoading(true)
    setWishlistError('')
    try {
      const items = await getInvitationWishlist(invitation.id, identity)
      setWishlistItems(items)
    } catch {
      setWishlistError('Lista želja trenutno nije dostupna.')
    } finally {
      setWishlistLoading(false)
    }
  }

  useEffect(() => {
    if (!invitation || !user) {
      setAccess(null)
      setFamilyProfile(null)
      setMembershipRequest(null)
      setHostRequests([])
      setWishlistItems([])
      setRsvp(null)
      setSelectedChildIds([])
      setShowProfileEditor(false)
      setWishlistError('')
      return
    }

    const currentInvitation = invitation
    const currentUser = user
    let cancelled = false

    async function loadPrivateState() {
      setLoadingPrivateState(true)
      setRequestError('')
      setHostError('')
      setWishlistError('')

      try {
        const nextAccess = await getInvitationAccess(currentInvitation.id, currentUser)
        if (cancelled) {
          return
        }

        setAccess(nextAccess)

        if (nextAccess.isHost) {
          const [requests, wishlist] = await Promise.all([
            listMembershipRequests(currentInvitation.id, currentUser),
            getInvitationWishlist(currentInvitation.id, currentUser),
          ])
          if (cancelled) {
            return
          }

          setHostRequests(requests)
          setWishlistItems(wishlist)
          setFamilyProfile(null)
          setMembershipRequest(null)
          setRsvp(null)
          setSelectedChildIds([])
          return
        }

        const family = await getFamilyProfile(currentUser)
        if (cancelled) {
          return
        }

        setFamilyProfile(family)
        setProfileDraft(createDraftFromProfile(family, currentUser.parentName))

        if (family.children.length > 0) {
          const request = await getMyMembershipRequest(currentInvitation.id, currentUser)
          if (cancelled) {
            return
          }

          setMembershipRequest(request)
          setSelectedChildIds(request ? request.children.map((child) => child.id) : family.children.map((child) => child.id))
        } else {
          setMembershipRequest(null)
          setSelectedChildIds([])
        }

        if (nextAccess.canRsvp) {
          const nextRsvp = await getMyRsvp(currentInvitation.id, currentUser)
          if (!cancelled) {
            setRsvp(nextRsvp)
          }
        } else {
          setRsvp(null)
        }

        if (nextAccess.canViewWishlist) {
          setWishlistLoading(true)
          try {
            const wishlist = await getInvitationWishlist(currentInvitation.id, currentUser)
            if (!cancelled) {
              setWishlistItems(wishlist)
            }
          } catch {
            if (!cancelled) {
              setWishlistItems([])
              setWishlistError('Lista želja trenutno nije dostupna.')
            }
          } finally {
            if (!cancelled) {
              setWishlistLoading(false)
            }
          }
        } else {
          setWishlistItems([])
        }
      } catch (caughtError) {
        if (cancelled) {
          return
        }

        if (isApiError(caughtError, 404)) {
          setFamilyProfile({ profile: null, children: [] })
          setMembershipRequest(null)
          setSelectedChildIds([])
          setProfileDraft(createEmptyDraft(currentUser.parentName))
        } else if (isApiError(caughtError, 401)) {
          logout()
        } else {
          setRequestError('Trenutačno ne možemo učitati privatni dio pozivnice.')
        }
      } finally {
        if (!cancelled) {
          setLoadingPrivateState(false)
          setWishlistLoading(false)
        }
      }
    }

    void loadPrivateState()

    return () => {
      cancelled = true
    }
  }, [invitation, user, logout])

  const selectedChildren = useMemo(() => {
    if (!familyProfile) {
      return []
    }

    return familyProfile.children.filter((child) => selectedChildIds.includes(child.id))
  }, [familyProfile, selectedChildIds])

  const handleLogin = () => {
    const email = identityDraft.email.trim().toLowerCase()
    const parentName = identityDraft.parentName.trim()

    if (!email || !parentName) {
      setAuthError('Upiši e-mail adresu i ime roditelja.')
      return
    }

    login({ email, parentName })
    setAuthError('')
  }

  const handleProfileSave = async () => {
    const parentName = profileDraft.parentName.trim()
    const children = profileDraft.children
      .map((child) => ({
        id: child.id,
        name: child.name.trim(),
        age: Number(child.age),
      }))
      .filter((child) => child.name && Number.isFinite(child.age) && child.age > 0)

    if (!user || !parentName || children.length === 0) {
      setProfileError('Upiši ime roditelja i barem jedno dijete.')
      return
    }

    setSavingProfile(true)
    setProfileError('')

    try {
      const payload: FamilyProfilePayload = { parentName, children }
      const nextProfile = hasFamilyProfile
        ? await updateFamilyProfile(payload, user)
        : await createFamilyProfile(payload, user)

      setFamilyProfile(nextProfile)
      setProfileDraft(createDraftFromProfile(nextProfile, user.parentName))
      setSelectedChildIds(nextProfile.children.map((child) => child.id))
      setShowProfileEditor(false)
    } catch (caughtError) {
      setProfileError(
        isApiError(caughtError, 400)
          ? 'Provjeri podatke profila i pokušaj ponovno.'
          : 'Spremanje profila trenutno nije uspjelo.',
      )
    } finally {
      setSavingProfile(false)
    }
  }

  const handleRequestSubmit = async () => {
    if (!user || !invitation || selectedChildIds.length === 0) {
      setRequestError('Odaberi barem jedno dijete prije slanja zahtjeva.')
      return
    }

    setSubmittingRequest(true)
    setRequestError('')

    try {
      const request = await createMembershipRequest(invitation.id, selectedChildIds, user)
      setMembershipRequest(request)
      setAccess((current) => current ? { ...current, membershipStatus: request.status } : current)
    } catch (caughtError) {
      setRequestError(
        isApiError(caughtError, 409)
          ? 'Zahtjev je već poslan organizatoru.'
          : 'Slanje zahtjeva trenutno nije uspjelo.',
      )
    } finally {
      setSubmittingRequest(false)
    }
  }

  const handleReview = async (requestId: string, action: 'approve' | 'reject') => {
    if (!user || !invitation) {
      return
    }

    setReviewingRequestId(requestId)
    setHostError('')

    try {
      await reviewMembershipRequest(invitation.id, requestId, action, user)
      const requests = await listMembershipRequests(invitation.id, user)
      setHostRequests(requests)
    } catch {
      setHostError('Promjena statusa zahtjeva trenutno nije uspjela.')
    } finally {
      setReviewingRequestId(null)
    }
  }

  const handleRsvpChange = async (status: 'going' | 'not_going' | 'maybe') => {
    if (!user || !invitation) {
      return
    }

    setSavingRsvp(true)

    try {
      const nextRsvp = await saveRsvp(invitation.id, { status }, user)
      setRsvp(nextRsvp)
    } catch {
      setRequestError('Spremanje odgovora trenutno nije uspjelo.')
    } finally {
      setSavingRsvp(false)
    }
  }

  const handleReserveWishlistItem = async (item: InvitationWishlistItem) => {
    if (!user || !invitation) {
      return
    }

    setWishlistActionId(item.id)
    setWishlistError('')

    try {
      await reserveInvitationWishlistItem(invitation.id, item.id, undefined, user)
      await refreshWishlist(user)
    } catch (caughtError) {
      setWishlistError(getReserveErrorMessage(caughtError))
    } finally {
      setWishlistActionId(null)
    }
  }

  const handleCancelWishlistReservation = async (item: InvitationWishlistItem) => {
    if (!user || !invitation) {
      return
    }

    setWishlistActionId(item.id)
    setWishlistError('')

    try {
      await cancelInvitationWishlistReservation(invitation.id, item.id, user)
      await refreshWishlist(user)
    } catch {
      setWishlistError('Otkazivanje rezervacije trenutno nije uspjelo.')
    } finally {
      setWishlistActionId(null)
    }
  }

  const handleWishlistSave = async () => {
    if (!user || !invitation) {
      return
    }

    const payload = buildWishlistPayload(wishlistDraft)
    if (!payload) {
      setWishlistFormError('Unesi naziv poklona i valjan redoslijed.')
      return
    }

    setSavingWishlistItem(true)
    setWishlistFormError('')
    setWishlistError('')

    try {
      if (editingWishlistItemId) {
        await updateInvitationWishlistItem(invitation.id, editingWishlistItemId, payload, user)
      } else {
        await createInvitationWishlistItem(invitation.id, payload, user)
      }
      resetWishlistForm()
      await refreshWishlist(user)
    } catch {
      setWishlistFormError('Spremanje želje trenutno nije uspjelo.')
    } finally {
      setSavingWishlistItem(false)
    }
  }

  const handleWishlistEdit = (item: InvitationWishlistItem) => {
    setEditingWishlistItemId(item.id)
    setWishlistDraft(createWishlistDraft(item))
    setWishlistFormError('')
  }

  const handleWishlistDelete = async (item: InvitationWishlistItem) => {
    if (!user || !invitation) {
      return
    }

    setWishlistActionId(item.id)
    setWishlistError('')

    try {
      await deleteInvitationWishlistItem(invitation.id, item.id, user)
      if (editingWishlistItemId === item.id) {
        resetWishlistForm()
      }
      await refreshWishlist(user)
    } catch (caughtError) {
      setWishlistError(getDeleteErrorMessage(caughtError))
    } finally {
      setWishlistActionId(null)
    }
  }

  const handleHostReleaseReservation = async (item: InvitationWishlistItem) => {
    if (!user || !invitation) {
      return
    }

    setWishlistActionId(item.id)
    setWishlistError('')

    try {
      await cancelInvitationWishlistReservation(invitation.id, item.id, user)
      await refreshWishlist(user)
    } catch {
      setWishlistError('Otpuštanje rezervacije trenutno nije uspjelo.')
    } finally {
      setWishlistActionId(null)
    }
  }

  return (
    <>
      <Navbar />
      <main className="pb-main pb-main--demo">
        <div className="pb-container pb-flowLayout">
          <div className="pb-backRow">
            <Link className="pb-backLink" to="/">
              ← Nazad na Playbam.hr
            </Link>
          </div>

          {loading ? (
            <Card className="pb-flowCard">
              <h1 className="pb-flowCard__title">Učitavamo pozivnicu...</h1>
              <p className="pb-flowCard__text">Dohvaćamo javne podatke s Playbam backend API-ja.</p>
            </Card>
          ) : null}

          {!loading && error === 'NOT_FOUND' ? (
            <Card className="pb-flowCard">
              <h1 className="pb-flowCard__title">Pozivnica nije pronađena.</h1>
              <p className="pb-flowCard__text">Provjeri poveznicu ili se vrati na naslovnicu.</p>
            </Card>
          ) : null}

          {!loading && error === 'LOAD_FAILED' ? (
            <Card className="pb-flowCard">
              <h1 className="pb-flowCard__title">Pozivnica trenutno nije dostupna.</h1>
              <p className="pb-flowCard__text">Nismo uspjeli dohvatiti podatke sa servisa. Pokušaj ponovno za nekoliko trenutaka.</p>
            </Card>
          ) : null}

          {invitation ? (
            <>
              <Card className="pb-fallbackCard" hover>
                <div className="pb-fallbackCard__inner">
                  <div className="pb-fallbackCard__title">Jedna poveznica za grupu, privatni pristup tek nakon prijave i odobrenja.</div>
                  <div className="pb-fallbackCard__meta">Javni token: {invitation.publicSlug}</div>
                </div>
              </Card>

              <Card className="pb-sessionCard">
                <div className="pb-sessionCard__row">
                  <div>
                    <div className="pb-sessionCard__label">Status pristupa</div>
                    <div className="pb-sessionCard__value">
                      {!user ? 'Otvoren je javni pregled pozivnice.' : isHost ? `Prijavljeni ste kao organizator: ${user.email}` : `Prijavljeni ste kao gost: ${user.email}`}
                    </div>
                  </div>
                  {user ? (
                    <Button variant="ghost" onClick={() => { logout(); setAuthError(''); setProfileError(''); setRequestError(''); setHostError(''); setWishlistError(''); setWishlistFormError('') }}>
                      Odjavi se
                    </Button>
                  ) : null}
                </div>
              </Card>

              <InvitationCard invitation={invitation} access={hasPrivateAccess ? 'private' : 'public'} rsvp={rsvp?.status ?? null} onRsvpChange={hasPrivateAccess && !isHost ? handleRsvpChange : undefined} />

              {!user ? (
                <Card className="pb-flowCard">
                  <h2 className="pb-flowCard__title">Nastavi za puni pristup</h2>
                  <p className="pb-flowCard__text">Javna poveznica otvara samo pregled. Za privatni dio pozivnice prijavi se privremenim web identitetom.</p>
                  <div className="pb-formGrid">
                    <label className="pb-formField"><span className="pb-formLabel">E-mail adresa</span><input className="pb-input" type="email" placeholder="ime@primjer.hr" value={identityDraft.email} onChange={(event) => setIdentityDraft((current) => ({ ...current, email: event.target.value }))} /></label>
                    <label className="pb-formField"><span className="pb-formLabel">Ime mame ili tate</span><input className="pb-input" type="text" placeholder="Ana Horvat" value={identityDraft.parentName} onChange={(event) => setIdentityDraft((current) => ({ ...current, parentName: event.target.value }))} /></label>
                  </div>
                  {authError ? <div className="pb-inlineNote pb-inlineNote--error">{authError}</div> : null}
                  <div className="pb-flowActions"><Button onClick={handleLogin}>Nastavi</Button></div>
                  <div className="pb-helperText">Ovaj privremeni korak šalje identity header-e backendu i kasnije će biti zamijenjen pravom prijavom.</div>
                </Card>
              ) : null}

              {user && loadingPrivateState ? (
                <Card className="pb-flowCard">
                  <h2 className="pb-flowCard__title">Pripremamo tvoj pristup</h2>
                  <p className="pb-flowCard__text">Provjeravamo profil obitelji, zahtjev za pristup i status odgovora.</p>
                </Card>
              ) : null}

              {user && !loadingPrivateState && !isHost && !hasFamilyProfile ? (
                <Card className="pb-flowCard">
                  <h2 className="pb-flowCard__title">Kreiraj obiteljski profil</h2>
                  <p className="pb-flowCard__text">Prije slanja zahtjeva trebamo profil obitelji s djecom koja žele pristupiti pozivnici.</p>
                  <FamilyProfileForm draft={profileDraft} error={profileError} saving={savingProfile} onChange={setProfileDraft} onSave={handleProfileSave} />
                </Card>
              ) : null}

              {user && !loadingPrivateState && !isHost && hasFamilyProfile && !hasPrivateAccess ? (
                <Card className="pb-flowCard">
                  <h2 className="pb-flowCard__title">Pridruži se pozivnici</h2>
                  <p className="pb-flowCard__text">Odaberi koja djeca žele pristupiti ovoj pozivnici i pošalji zahtjev organizatoru.</p>
                  <div className="pb-summaryCard">
                    <div className="pb-summaryCard__title">Obiteljski profil</div>
                    <div className="pb-summaryCard__line">Ime mame ili tate: {familyProfile?.profile?.parentName}</div>
                    <div className="pb-summaryCard__line">Djeca: {familyProfile?.children.map((child) => `${child.name} (${child.age})`).join(', ')}</div>
                  </div>
                  <div className="pb-checkList" role="group" aria-label="Odaberi djecu za zahtjev pristupa">
                    {familyProfile?.children.map((child) => (
                      <label key={child.id} className="pb-checkItem">
                        <input type="checkbox" checked={selectedChildIds.includes(child.id)} onChange={(event) => setSelectedChildIds((current) => event.target.checked ? [...current, child.id] : current.filter((item) => item !== child.id))} disabled={membershipRequest?.status === 'pending'} />
                        <span>{child.name} ({child.age})</span>
                      </label>
                    ))}
                  </div>
                  {membershipRequest?.status === 'pending' ? <div className="pb-inlineNote pb-inlineNote--info">Zahtjev je poslan organizatoru. Pristup će biti omogućen nakon odobrenja.</div> : null}
                  {membershipRequest?.status === 'rejected' ? <div className="pb-inlineNote pb-inlineNote--error">Zahtjev nije odobren.</div> : null}
                  {requestError ? <div className="pb-inlineNote pb-inlineNote--error">{requestError}</div> : null}
                  <div className="pb-flowActions">
                    <Button onClick={handleRequestSubmit} disabled={selectedChildren.length === 0 || membershipRequest?.status === 'pending' || submittingRequest}>{submittingRequest ? 'Šaljemo zahtjev...' : 'Pošalji zahtjev organizatoru'}</Button>
                    <Button variant="ghost" onClick={() => setShowProfileEditor((current) => !current)}>{showProfileEditor ? 'Zatvori uređivanje profila' : 'Uredi profil'}</Button>
                  </div>
                  {showProfileEditor ? <div className="pb-flowCard__subsection"><FamilyProfileForm draft={profileDraft} error={profileError} saving={savingProfile} onChange={setProfileDraft} onSave={handleProfileSave} /></div> : null}
                </Card>
              ) : null}

              {user && !loadingPrivateState && hasPrivateAccess && !isHost ? (
                <>
                  <Card className="pb-flowCard">
                    <h2 className="pb-flowCard__title">Privatni dio pozivnice</h2>
                    <p className="pb-flowCard__text">Pristup je odobren. Sada možeš potvrditi dolazak i vidjeti dodatni privatni sadržaj.</p>
                    {savingRsvp ? <div className="pb-inlineNote pb-inlineNote--info">Spremamo tvoj odgovor...</div> : null}
                    {requestError ? <div className="pb-inlineNote pb-inlineNote--error">{requestError}</div> : null}
                  </Card>
                  <Card className="pb-flowCard">
                    <div className="pb-flowCard__headerRow"><h2 className="pb-flowCard__title">Lista želja</h2></div>
                    {wishlistLoading ? <div className="pb-inlineNote pb-inlineNote--info">Učitavanje liste želja...</div> : null}
                    {wishlistError ? <div className="pb-inlineNote pb-inlineNote--error">{wishlistError}</div> : null}
                    {!wishlistLoading && wishlistItems.length === 0 ? <div className="pb-inlineNote pb-inlineNote--info">Još nema dodanih želja.</div> : null}
                    {wishlistItems.length > 0 ? <GuestWishlistSection items={wishlistItems} actionItemId={wishlistActionId} onReserve={handleReserveWishlistItem} onCancel={handleCancelWishlistReservation} /> : null}
                  </Card>
                </>
              ) : null}

              {user && !loadingPrivateState && isHost ? (
                <>
                  <Card className="pb-flowCard">
                    <h2 className="pb-flowCard__title">Zahtjevi za pristup</h2>
                    <p className="pb-flowCard__text">Pregledaj tko traži pristup privatnom dijelu pozivnice i odluči kome ćeš ga odobriti.</p>
                    {hostError ? <div className="pb-inlineNote pb-inlineNote--error">{hostError}</div> : null}
                    <HostRequestList requests={hostRequests} reviewingRequestId={reviewingRequestId} onReview={handleReview} />
                  </Card>
                  <Card className="pb-flowCard">
                    <div className="pb-flowCard__headerRow"><h2 className="pb-flowCard__title">Lista želja</h2></div>
                    <p className="pb-flowCard__text">Dodaj, uredi i organiziraj želje za poklone. Ovdje vidiš i tko je što rezervirao.</p>
                    {wishlistError ? <div className="pb-inlineNote pb-inlineNote--error">{wishlistError}</div> : null}
                    <WishlistForm draft={wishlistDraft} error={wishlistFormError} saving={savingWishlistItem} isEditing={Boolean(editingWishlistItemId)} onChange={setWishlistDraft} onSave={handleWishlistSave} onCancel={resetWishlistForm} />
                    {wishlistLoading ? <div className="pb-inlineNote pb-inlineNote--info">Učitavanje liste želja...</div> : null}
                    {!wishlistLoading && wishlistItems.length === 0 ? <div className="pb-inlineNote pb-inlineNote--info">Još nema dodanih želja.</div> : null}
                    {wishlistItems.length > 0 ? <HostWishlistSection items={wishlistItems} actionItemId={wishlistActionId} editingItemId={editingWishlistItemId} onEdit={handleWishlistEdit} onDelete={handleWishlistDelete} onReleaseReservation={handleHostReleaseReservation} /> : null}
                  </Card>
                </>
              ) : null}
            </>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  )
}

function FamilyProfileForm({ draft, error, saving, onChange, onSave }: { draft: FamilyProfileDraft; error: string; saving: boolean; onChange: (draft: FamilyProfileDraft) => void; onSave: () => void }) {
  return (
    <div className="pb-profileForm">
      <div className="pb-formGrid">
        <label className="pb-formField"><span className="pb-formLabel">Ime mame ili tate</span><input className="pb-input" type="text" value={draft.parentName} onChange={(event) => onChange({ ...draft, parentName: event.target.value })} /></label>
        {draft.children.map((child, index) => (
          <div key={child.id ?? `child-${index}`} className="pb-childEditor">
            <label className="pb-formField"><span className="pb-formLabel">Ime djeteta</span><input className="pb-input" type="text" value={child.name} onChange={(event) => { const nextChildren = [...draft.children]; nextChildren[index] = { ...child, name: event.target.value }; onChange({ ...draft, children: nextChildren }) }} /></label>
            <label className="pb-formField"><span className="pb-formLabel">Koliko godina ima dijete?</span><input className="pb-input" type="number" min="1" max="18" value={child.age} onChange={(event) => { const nextChildren = [...draft.children]; nextChildren[index] = { ...child, age: event.target.value }; onChange({ ...draft, children: nextChildren }) }} /></label>
          </div>
        ))}
      </div>
      <div className="pb-flowActions">
        <Button variant="ghost" type="button" onClick={() => onChange({ ...draft, children: [...draft.children, { name: '', age: '' }] })}>Dodaj još jedno dijete</Button>
        <Button type="button" onClick={onSave} disabled={saving}>{saving ? 'Spremamo...' : 'Spremi profil'}</Button>
      </div>
      {error ? <div className="pb-inlineNote pb-inlineNote--error">{error}</div> : null}
    </div>
  )
}

function WishlistForm({ draft, error, saving, isEditing, onChange, onSave, onCancel }: { draft: WishlistDraft; error: string; saving: boolean; isEditing: boolean; onChange: (draft: WishlistDraft) => void; onSave: () => void; onCancel: () => void }) {
  return (
    <div className="pb-profileForm">
      <div className="pb-formGrid">
        <label className="pb-formField"><span className="pb-formLabel">Naziv poklona</span><input className="pb-input" type="text" value={draft.title} onChange={(event) => onChange({ ...draft, title: event.target.value })} /></label>
        <label className="pb-formField"><span className="pb-formLabel">Opis</span><input className="pb-input" type="text" value={draft.description} onChange={(event) => onChange({ ...draft, description: event.target.value })} /></label>
        <label className="pb-formField"><span className="pb-formLabel">Link</span><input className="pb-input" type="url" value={draft.url} onChange={(event) => onChange({ ...draft, url: event.target.value })} /></label>
        <label className="pb-formField"><span className="pb-formLabel">Cijena</span><input className="pb-input" type="text" value={draft.priceLabel} onChange={(event) => onChange({ ...draft, priceLabel: event.target.value })} /></label>
        <label className="pb-formField"><span className="pb-formLabel">Slika</span><input className="pb-input" type="url" value={draft.imageUrl} onChange={(event) => onChange({ ...draft, imageUrl: event.target.value })} /></label>
        <label className="pb-formField"><span className="pb-formLabel">Redoslijed</span><input className="pb-input" type="number" min="0" value={draft.priorityOrder} onChange={(event) => onChange({ ...draft, priorityOrder: event.target.value })} /></label>
      </div>
      <div className="pb-flowActions">
        <Button type="button" onClick={onSave} disabled={saving}>{saving ? 'Spremamo...' : isEditing ? 'Spremi' : 'Dodaj želju'}</Button>
        {isEditing ? <Button variant="ghost" type="button" onClick={onCancel}>Odustani</Button> : null}
      </div>
      {error ? <div className="pb-inlineNote pb-inlineNote--error">{error}</div> : null}
    </div>
  )
}

function GuestWishlistSection({ items, actionItemId, onReserve, onCancel }: { items: InvitationWishlistItem[]; actionItemId: string | null; onReserve: (item: InvitationWishlistItem) => void; onCancel: (item: InvitationWishlistItem) => void }) {
  return <div className="pb-wishlist">{items.map((item) => { const isBusy = actionItemId === item.id; const reservationStatus = item.reservation.status; const canReserve = reservationStatus === 'available'; const canCancel = reservationStatus === 'reserved_by_you'; return <div key={item.id} className="pb-wishlistItem"><div><div className="pb-wishlistItem__title">{item.title}</div>{item.description ? <div className="pb-wishlistItem__meta">{item.description}</div> : null}{item.priceLabel ? <div className="pb-wishlistItem__meta">Cijena: {item.priceLabel}</div> : null}{item.url ? <div className="pb-wishlistItem__meta"><a href={item.url} target="_blank" rel="noreferrer">Pogledaj link</a></div> : null}{reservationStatus === 'reserved' ? <div className="pb-wishlistItem__reserved">Već rezervirano</div> : null}{reservationStatus === 'reserved_by_you' ? <div className="pb-wishlistItem__reserved">Rezervirali ste ovaj poklon.</div> : null}</div><div style={{ display: 'grid', gap: 10 }}>{item.imageUrl ? <img src={item.imageUrl} alt={item.title} style={{ width: '100%', maxWidth: 180, borderRadius: 14, objectFit: 'cover' }} /> : null}{canReserve ? <Button type="button" onClick={() => onReserve(item)} disabled={isBusy}>{isBusy ? 'Spremamo...' : 'Rezerviraj poklon'}</Button> : null}{canCancel ? <Button variant="ghost" type="button" onClick={() => onCancel(item)} disabled={isBusy}>{isBusy ? 'Spremamo...' : 'Otkaži rezervaciju'}</Button> : null}{!canReserve && !canCancel && reservationStatus === 'reserved' ? <Button type="button" disabled>Već rezervirano</Button> : null}</div></div> })}</div>
}

function HostWishlistSection({ items, actionItemId, editingItemId, onEdit, onDelete, onReleaseReservation }: { items: InvitationWishlistItem[]; actionItemId: string | null; editingItemId: string | null; onEdit: (item: InvitationWishlistItem) => void; onDelete: (item: InvitationWishlistItem) => void; onReleaseReservation: (item: InvitationWishlistItem) => void }) {
  return <div className="pb-wishlist">{items.map((item) => { const isBusy = actionItemId === item.id; const hasActiveReservation = item.reservation.status === 'active'; return <div key={item.id} className="pb-wishlistItem"><div><div className="pb-wishlistItem__title">{item.title}</div>{item.description ? <div className="pb-wishlistItem__meta">{item.description}</div> : null}{item.priceLabel ? <div className="pb-wishlistItem__meta">Cijena: {item.priceLabel}</div> : null}{item.url ? <div className="pb-wishlistItem__meta"><a href={item.url} target="_blank" rel="noreferrer">Pogledaj link</a></div> : null}<div className="pb-wishlistItem__meta">Redoslijed: {item.priorityOrder}</div>{hasActiveReservation ? <><div className="pb-wishlistItem__reserved">Rezervirala: {item.reservation.reservedByName}</div>{item.reservation.reservedForChildName ? <div className="pb-wishlistItem__meta">Za dijete: {item.reservation.reservedForChildName}</div> : null}{item.reservation.note ? <div className="pb-wishlistItem__meta">Napomena: {item.reservation.note}</div> : null}</> : <div className="pb-wishlistItem__reserved">Poklon je trenutno slobodan.</div>}</div><div style={{ display: 'grid', gap: 10 }}>{item.imageUrl ? <img src={item.imageUrl} alt={item.title} style={{ width: '100%', maxWidth: 180, borderRadius: 14, objectFit: 'cover' }} /> : null}<Button variant={editingItemId === item.id ? 'amber' : 'ghost'} type="button" onClick={() => onEdit(item)}>Uredi</Button><Button variant="ghost" type="button" onClick={() => onDelete(item)} disabled={isBusy}>{isBusy ? 'Brisanje...' : 'Obriši'}</Button>{hasActiveReservation ? <Button type="button" onClick={() => onReleaseReservation(item)} disabled={isBusy}>{isBusy ? 'Spremamo...' : 'Otpusti rezervaciju'}</Button> : null}</div></div> })}</div>
}

function HostRequestList({ requests, reviewingRequestId, onReview }: { requests: MembershipRequest[]; reviewingRequestId: string | null; onReview: (requestId: string, action: 'approve' | 'reject') => void }) {
  if (requests.length === 0) {
    return <div className="pb-inlineNote pb-inlineNote--info">Trenutačno nema novih zahtjeva.</div>
  }

  return <div className="pb-hostRequests">{requests.map((request) => <div key={request.id} className="pb-hostRequestItem"><div><div className="pb-hostRequestItem__title">{request.familyProfile?.parentName ?? request.user?.displayName ?? 'Nepoznata obitelj'}</div><div className="pb-hostRequestItem__meta">Djeca: {request.children.map((child) => `${child.name} (${child.age})`).join(', ') || 'Nema odabrane djece'}</div><div className={`pb-statusBadge pb-statusBadge--${request.status}`}>{getMembershipStatusLabel(request.status)}</div></div><div className="pb-flowActions pb-flowActions--compact"><Button type="button" onClick={() => onReview(request.id, 'approve')} disabled={request.status === 'approved' || reviewingRequestId === request.id}>Odobri</Button><Button variant="ghost" type="button" onClick={() => onReview(request.id, 'reject')} disabled={request.status === 'rejected' || reviewingRequestId === request.id}>Odbij</Button></div></div>)}</div>
}
