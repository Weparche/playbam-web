import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import InvitationCard from '../components/invitation/InvitationCard'
import PrivateInvitationGuest from '../components/invitation/PrivateInvitationGuest'
import { type FamilyProfileDraft } from '../components/invitation/FamilyProfileForm'
import GuestInvitationModal, { getGuestModalStep } from '../components/invitation/GuestInvitationModal'
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
import { readStoredHostToken, writeStoredHostToken } from '../lib/hostWebSession'
import type { TemporaryWebIdentity } from '../lib/tempWebIdentity'

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
  const [hostToken, setHostToken] = useState(() => readStoredHostToken())
  const [hostTokenDraft, setHostTokenDraft] = useState('')
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
  const [profileDraft, setProfileDraft] = useState<FamilyProfileDraft>(createEmptyDraft(user?.parentName ?? ''))
  const [selectedChildIds, setSelectedChildIds] = useState<string[]>([])
  const [authError, setAuthError] = useState('')
  const [hostAuthError, setHostAuthError] = useState('')
  const [profileError, setProfileError] = useState('')
  const [requestError, setRequestError] = useState('')
  const [hostError, setHostError] = useState('')
  const [wishlistError, setWishlistError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [submittingRequest, setSubmittingRequest] = useState(false)
  const [savingRsvp, setSavingRsvp] = useState(false)
  const [pendingRsvpChoice, setPendingRsvpChoice] = useState<'going' | 'not_going' | 'maybe' | null>(null)
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null)
  const [wishlistActionId, setWishlistActionId] = useState<string | null>(null)
  const [wishlistDraft, setWishlistDraft] = useState<WishlistDraft>(createWishlistDraft())
  const [wishlistFormError, setWishlistFormError] = useState('')
  const [editingWishlistItemId, setEditingWishlistItemId] = useState<string | null>(null)
  const [savingWishlistItem, setSavingWishlistItem] = useState(false)
  const [guestModalOpen, setGuestModalOpen] = useState(false)
  const [hostRequestsOpen, setHostRequestsOpen] = useState(false)
  const [hostWishlistOpen, setHostWishlistOpen] = useState(false)
  const [hostAddGiftOpen, setHostAddGiftOpen] = useState(false)
  const [selectedHostRequest, setSelectedHostRequest] = useState<MembershipRequest | null>(null)

  useEffect(() => {
    setIdentityDraft({
      email: user?.email ?? '',
      parentName: user?.parentName ?? '',
    })
  }, [user])

  useEffect(() => {
    setHostToken(readStoredHostToken())
  }, [])

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
  const hasHostSession = Boolean(hostToken)
  const isHost = access?.isHost ?? false
  const hasPrivateAccess = access?.canAccessPrivateInvitation ?? false
  const canViewWishlist = access?.canViewWishlist ?? false
  const canSubmitRsvp = Boolean(user && !isHost && access?.canRsvp)

  const guestModalStep = useMemo(
    () => getGuestModalStep(invitation, isHost, hasPrivateAccess, user, hasFamilyProfile, membershipRequest),
    [invitation, isHost, hasPrivateAccess, user, hasFamilyProfile, membershipRequest],
  )

  const guestRsvpHint = useMemo(() => {
    if (isHost || !invitation) {
      return null
    }
    if (canSubmitRsvp) {
      return null
    }
    if (!user) {
      return null
    }
    if (!hasFamilyProfile) {
      return 'Dovrši profil obitelji u prozoru.'
    }
    if (membershipRequest?.status === 'pending') {
      return 'Čekanje na odobrenje organizatora, zatim možeš potvrditi dolazak.'
    }
    if (membershipRequest?.status === 'rejected') {
      return 'Zahtjev za pristup je odbijen. Možeš poslati novi zahtjev.'
    }
    return null
  }, [isHost, invitation, canSubmitRsvp, user, hasFamilyProfile, membershipRequest])

  const openGuestFlow = () => {
    setGuestModalOpen(true)
  }

  const handleToggleGuestChild = (childId: string, checked: boolean) => {
    setSelectedChildIds((current) => (checked ? [...current, childId] : current.filter((id) => id !== childId)))
  }

  useEffect(() => {
    if (guestModalOpen && hasPrivateAccess && !isHost) {
      setGuestModalOpen(false)
    }
  }, [guestModalOpen, hasPrivateAccess, isHost])

  useEffect(() => {
    if (guestModalOpen && isHost) {
      setGuestModalOpen(false)
    }
  }, [guestModalOpen, isHost])

  const resetWishlistForm = () => {
    setWishlistDraft(createWishlistDraft())
    setEditingWishlistItemId(null)
    setWishlistFormError('')
  }

  const refreshWishlist = async (identity = user ?? undefined) => {
    if (!invitation || !canViewWishlist) {
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
    if (!invitation || (!user && !hasHostSession)) {
      setAccess(null)
      setFamilyProfile(null)
      setMembershipRequest(null)
      setHostRequests([])
      setWishlistItems([])
      setRsvp(null)
      setSelectedChildIds([])
      setWishlistError('')
      return
    }

    const currentInvitation = invitation
    const currentUser = user
    const currentIdentity = currentUser ?? undefined
    let cancelled = false

    async function loadPrivateState() {
      setLoadingPrivateState(true)
      setRequestError('')
      setHostError('')
      setWishlistError('')

      try {
        const nextAccess = await getInvitationAccess(currentInvitation.id, currentIdentity)
        if (cancelled) {
          return
        }

        setAccess(nextAccess)

        if (nextAccess.isHost) {
          const [requests, wishlist] = await Promise.all([
            listMembershipRequests(currentInvitation.id, currentIdentity),
            getInvitationWishlist(currentInvitation.id, currentIdentity),
          ])
          if (cancelled) {
            return
          }

          setHostRequests(requests.filter((request) => request.status !== 'rejected'))
          setWishlistItems(wishlist)
          setFamilyProfile(null)
          setMembershipRequest(null)
          setRsvp(null)
          setSelectedChildIds([])
          return
        }

        if (!currentUser) {
          writeStoredHostToken(null)
          setHostToken('')
          setHostAuthError('Host token nije valjan za ovu pozivnicu.')
          setLoadingPrivateState(false)
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
          setProfileDraft(createEmptyDraft(currentUser?.parentName ?? ''))
        } else if (isApiError(caughtError, 401)) {
          if (currentUser) {
            logout()
          }
          writeStoredHostToken(null)
          setHostToken("")
          setHostAuthError("Host token nije valjan.")
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
  }, [invitation, user, hasHostSession, logout])

  useEffect(() => {
    if (!invitation || !isHost || loadingPrivateState || (!user && !hasHostSession)) {
      return
    }

    const identity = user ?? null
    let disposed = false

    const refreshHostPanels = async () => {
      try {
        const [requests, wishlist] = await Promise.all([
          listMembershipRequests(invitation.id, identity),
          getInvitationWishlist(invitation.id, identity),
        ])

        if (disposed) {
          return
        }

        setHostRequests(requests.filter((request) => request.status !== 'rejected'))
        setWishlistItems(wishlist)
      } catch {
        // Keep host polling silent to avoid flashing transient network errors.
      }
    }

    const intervalId = window.setInterval(() => {
      void refreshHostPanels()
    }, 10_000)

    const handleFocus = () => {
      void refreshHostPanels()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      disposed = true
      window.clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
    }
  }, [invitation, isHost, loadingPrivateState, user, hasHostSession])

  const handleLogin = () => {
    const email = identityDraft.email.trim().toLowerCase()
    const parentName = identityDraft.parentName.trim()

    if (!email || !parentName) {
      setAuthError('Upiši e-mail adresu i ime roditelja.')
      return
    }

    login({ email, parentName })
    setAuthError("")
  }

  const handleHostLogin = () => {
    const nextToken = hostTokenDraft.trim()

    if (!nextToken) {
      setHostAuthError('Upiši host token.')
      return
    }

    logout()
    writeStoredHostToken(nextToken)
    setHostToken(nextToken)
    setHostTokenDraft("")
    setHostAuthError("")
  }

  const handleHostLogout = () => {
    writeStoredHostToken(null)
    setHostToken("")
    setHostAuthError("")
    setAccess(null)
    setHostRequests([])
    setWishlistItems([])
    setRsvp(null)
    setMembershipRequest(null)
    setFamilyProfile(null)
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
    setProfileError("")

    try {
      const payload: FamilyProfilePayload = { parentName, children }
      const nextProfile = hasFamilyProfile
        ? await updateFamilyProfile(payload, user)
        : await createFamilyProfile(payload, user)

      setFamilyProfile(nextProfile)
      setProfileDraft(createDraftFromProfile(nextProfile, user.parentName))
      setSelectedChildIds(nextProfile.children.map((child) => child.id))
    } catch (caughtError) {
      setProfileError(
        isApiError(caughtError, 400)
          ? 'Provjeri podatke profila i pokušaj ponovno.'
          : "Spremanje profila trenutno nije uspjelo.",
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
          ? 'Zahtjev je ve? poslan organizatoru.'
          : 'Slanje zahtjeva trenutno nije uspjelo.',
      )
    } finally {
      setSubmittingRequest(false)
    }
  }

  const handleReview = async (requestId: string, action: 'approve' | 'reject') => {
    if (!invitation || (!user && !hasHostSession)) {
      return
    }

    setReviewingRequestId(requestId)
    setHostError('')

    try {
      await reviewMembershipRequest(invitation.id, requestId, action, user ?? null)
      const requests = await listMembershipRequests(invitation.id, user ?? null)
      setHostRequests(requests.filter((request) => request.status !== 'rejected'))
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

  const handleGuestRsvpIntent = (status: 'going' | 'not_going' | 'maybe') => {
    setPendingRsvpChoice(status)
    if (!user) {
      openGuestFlow()
      return
    }

    if (!hasPrivateAccess) {
      openGuestFlow()
    }
  }

  useEffect(() => {
    if (!pendingRsvpChoice || !user || !invitation) {
      return
    }

    if (rsvp?.status === pendingRsvpChoice) {
      setPendingRsvpChoice(null)
      return
    }

    let cancelled = false

    const persistPendingRsvp = async () => {
      setSavingRsvp(true)
      try {
        const nextRsvp = await saveRsvp(invitation.id, { status: pendingRsvpChoice }, user)
        if (cancelled) {
          return
        }
        setRsvp(nextRsvp)
        setRequestError('')
        setPendingRsvpChoice(null)
      } catch {
        if (cancelled) {
          return
        }
        setRequestError('Spremanje odgovora trenutno nije uspjelo.')
      } finally {
        if (!cancelled) {
          setSavingRsvp(false)
        }
      }
    }

    void persistPendingRsvp()

    return () => {
      cancelled = true
    }
  }, [pendingRsvpChoice, user, invitation, rsvp])

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

  const handleParticipateWishlistItem = async (item: InvitationWishlistItem) => {
    if (!user || !invitation) {
      return
    }

    setWishlistActionId(item.id)
    setWishlistError('')

    try {
      await reserveInvitationWishlistItem(
        invitation.id,
        item.id,
        { note: 'Sudjeluje u poklonu' },
        user,
      )
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

  const handleGuestWishlistAdd = async (payload: InvitationWishlistPayload) => {
    if (!user || !invitation) {
      return
    }

    setSavingWishlistItem(true)
    setWishlistError('')

    try {
      await createInvitationWishlistItem(invitation.id, payload, user)
      await refreshWishlist(user)
    } catch {
      setWishlistError('Dodavanje poklona trenutno nije uspjelo.')
    } finally {
      setSavingWishlistItem(false)
    }
  }

  const handleGuestWishlistDelete = async (item: InvitationWishlistItem) => {
    if (!user || !invitation) {
      return
    }

    setWishlistActionId(item.id)
    setWishlistError('')

    try {
      await deleteInvitationWishlistItem(invitation.id, item.id, user)
      await refreshWishlist(user)
    } catch (caughtError) {
      setWishlistError(getDeleteErrorMessage(caughtError))
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
      setWishlistFormError('Spremanje ?elje trenutno nije uspjelo.')
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
        <div className="pb-invitePage__blobs" aria-hidden>
          <span className="pb-invitePage__blob pb-invitePage__blob--1" />
          <span className="pb-invitePage__blob pb-invitePage__blob--2" />
          <span className="pb-invitePage__blob pb-invitePage__blob--3" />
        </div>
        <div className="pb-container pb-flowLayout">
          <div className="pb-backRow">
            <a className="pb-backLink" href="https://playbam.hr">
              <span className="pb-backLink__icon" aria-hidden>
                &larr;
              </span>
              <span>Nazad na Playbam.hr</span>
            </a>
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
              {user ? (
                <div className="pb-inviteSessionBar">
                  <span className="pb-inviteSessionBar__text">
                    {isHost ? `Organizator: ${user.email}` : `Gost: ${user.parentName || user.email}`}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      logout()
                      setAuthError('')
                      setProfileError('')
                      setRequestError('')
                      setHostError('')
                      setWishlistError('')
                      setWishlistFormError('')
                      setGuestModalOpen(false)
                    }}
                  >
                    Odjavi se
                  </Button>
                </div>
              ) : null}

              {!user && hasHostSession ? (
                <div className="pb-inviteSessionBar">
                  <span className="pb-inviteSessionBar__text">Organizator: host pristup aktivan</span>
                  <Button variant="ghost" onClick={handleHostLogout}>
                    Odjavi host pristup
                  </Button>
                </div>
              ) : null}

              <InvitationCard
                invitation={invitation}
                access={hasPrivateAccess ? 'private' : 'public'}
                isHost={isHost}
                rsvp={rsvp?.status ?? null}
                canSubmitRsvp={canSubmitRsvp}
                onRsvpChange={canSubmitRsvp ? handleRsvpChange : undefined}
                onGuestRsvpIntent={isHost ? undefined : handleGuestRsvpIntent}
                guestRsvpHint={guestRsvpHint}
              />

              {(user || hasHostSession) && loadingPrivateState ? (
                <Card className="pb-flowCard">
                  <h2 className="pb-flowCard__title">Pripremamo tvoj pristup</h2>
                  <p className="pb-flowCard__text">Provjeravamo profil obitelji, zahtjev za pristup i status odgovora.</p>
                </Card>
              ) : null}

              {user && !loadingPrivateState && hasPrivateAccess && !isHost ? (
                <PrivateInvitationGuest
                  wishlistLoading={wishlistLoading}
                  wishlistError={wishlistError}
                  wishlistItems={wishlistItems}
                  wishlistActionId={wishlistActionId}
                  currentGuestName={user.parentName || null}
                  onReserve={handleReserveWishlistItem}
                  onParticipate={handleParticipateWishlistItem}
                  onCancel={handleCancelWishlistReservation}
                  onAddWishlistItem={handleGuestWishlistAdd}
                  onDeleteWishlistItem={handleGuestWishlistDelete}
                  savingWishlistItem={savingWishlistItem}
                  savingRsvp={savingRsvp}
                  requestError={requestError}
                />
              ) : null}

              <GuestInvitationModal
                open={guestModalOpen && guestModalStep !== null}
                onClose={() => setGuestModalOpen(false)}
                step={guestModalStep ?? 'login'}
                identityDraft={identityDraft}
                onIdentityChange={setIdentityDraft}
                authError={authError}
                onLogin={handleLogin}
                profileDraft={profileDraft}
                onProfileChange={setProfileDraft}
                profileError={profileError}
                savingProfile={savingProfile}
                onProfileSave={handleProfileSave}
                familyProfile={familyProfile}
                selectedChildIds={selectedChildIds}
                onToggleChild={handleToggleGuestChild}
                membershipRequest={membershipRequest}
                requestError={requestError}
                submittingRequest={submittingRequest}
                onRequestSubmit={handleRequestSubmit}
              />

              {!user && !hasHostSession ? (
                <Card className="pb-flowCard pb-hostTokenCard">
                  <h2 className="pb-flowCard__title">Organizator test login</h2>
                  <p className="pb-flowCard__text">Unesi host token za ulazak u organizatorski dio pozivnice.</p>
                  <div className="pb-formGrid">
                    <label className="pb-formField">
                      <span className="pb-formLabel">Host token</span>
                      <input
                        className="pb-input"
                        type="password"
                        value={hostTokenDraft}
                        onChange={(event) => setHostTokenDraft(event.target.value)}
                        placeholder="playbam-prod-host-token"
                      />
                    </label>
                  </div>
                  <div className="pb-flowActions">
                    <Button type="button" onClick={handleHostLogin}>
                      Uđi kao organizator
                    </Button>
                  </div>
                  {hostAuthError ? <div className="pb-inlineNote pb-inlineNote--error">{hostAuthError}</div> : null}
                </Card>
              ) : null}

              {(user || hasHostSession) && !loadingPrivateState && isHost ? (
                <div className="pb-invitePrivateStack pb-invitePrivateStack--host">
                  <Card className="pb-flowCard pb-invitePrivateCard pb-invitePrivateCard--accordion pb-inviteHostPanel">
                    <button
                      id="host-requests-toggle"
                      type="button"
                      className={`pb-privateToggle ${hostRequestsOpen ? 'is-open' : ''}`}
                      onClick={() => setHostRequestsOpen((current) => !current)}
                      aria-expanded={hostRequestsOpen}
                    >
                      <span className="pb-privateToggle__copy">
                        <span className="pb-privateToggle__eyebrow">Organizator</span>
                        <span className="pb-privateToggle__title">Zahtjevi za pristup</span>
                      </span>
                      <span className="pb-privateToggle__arrow" aria-hidden>
                        →
                      </span>
                    </button>

                    {hostRequestsOpen ? (
                      <div className="pb-privateAccordionBody">
                        <p className="pb-flowCard__text">Pregledaj tko traži pristup privatnom dijelu pozivnice i upravljaj gostima.</p>
                        {hostError ? <div className="pb-inlineNote pb-inlineNote--error">{hostError}</div> : null}
                        <HostRequestListV2
                          requests={hostRequests}
                          reviewingRequestId={reviewingRequestId}
                          wishlistItems={wishlistItems}
                          onReview={handleReview}
                          onSelect={setSelectedHostRequest}
                        />
                      </div>
                    ) : null}
                  </Card>

                  <Card className="pb-flowCard pb-invitePrivateCard pb-invitePrivateCard--accordion pb-inviteHostPanel">
                    <button
                      id="host-wishlist-toggle"
                      type="button"
                      className={`pb-privateToggle ${hostWishlistOpen ? 'is-open' : ''}`}
                      onClick={() => setHostWishlistOpen((current) => !current)}
                      aria-expanded={hostWishlistOpen}
                    >
                      <span className="pb-privateToggle__copy">
                        <span className="pb-privateToggle__eyebrow">Organizator</span>
                        <span className="pb-privateToggle__title">Lista ?elja</span>
                      </span>
                      <span className="pb-privateToggle__arrow" aria-hidden>
                        ?
                      </span>
                    </button>

                    {hostWishlistOpen ? (
                      <div className="pb-privateAccordionBody">
                        <p className="pb-flowCard__text pb-flowCard__text--hostWishlist">
                          Dodaj, uredi i organiziraj ?elje za poklone. Ovdje vidi? i tko je ?to rezervirao.
                        </p>

                        <div className="pb-inviteHostAddWrap">
                          <button
                            id="host-add-toggle"
                            type="button"
                            className={`pb-privateToggle pb-privateToggle--inner ${hostAddGiftOpen ? 'is-open' : ''}`}
                            onClick={() => setHostAddGiftOpen((current) => !current)}
                            aria-expanded={hostAddGiftOpen}
                          >
                            <span className="pb-privateToggle__copy">
                              <span className="pb-privateToggle__eyebrow">Organizator</span>
                              <span className="pb-privateToggle__title">
                                {editingWishlistItemId ? 'Uredi poklon' : 'Dodaj poklon'}
                              </span>
                            </span>
                            <span className="pb-privateToggle__arrow" aria-hidden>
                              +
                            </span>
                          </button>

                          {hostAddGiftOpen ? (
                            <div className="pb-inviteHostAddBody">
                              <WishlistForm
                                draft={wishlistDraft}
                                error={wishlistFormError}
                                saving={savingWishlistItem}
                                isEditing={Boolean(editingWishlistItemId)}
                                onChange={setWishlistDraft}
                                onSave={handleWishlistSave}
                                onCancel={() => {
                                  resetWishlistForm()
                                  setHostAddGiftOpen(false)
                                }}
                              />
                            </div>
                          ) : null}
                        </div>

                        {wishlistError ? <div className="pb-inlineNote pb-inlineNote--error">{wishlistError}</div> : null}
                        {wishlistLoading ? <div className="pb-inlineNote pb-inlineNote--info">Učitavanje liste želja...</div> : null}
                        {!wishlistLoading && wishlistItems.length === 0 ? <div className="pb-inlineNote pb-inlineNote--info">Još nema dodanih želja.</div> : null}
                        {wishlistItems.length > 0 ? (
                          <HostWishlistSection
                            items={wishlistItems}
                            actionItemId={wishlistActionId}
                            editingItemId={editingWishlistItemId}
                            onEdit={(item) => {
                              handleWishlistEdit(item)
                              setHostWishlistOpen(true)
                              setHostAddGiftOpen(true)
                            }}
                            onDelete={handleWishlistDelete}
                            onReleaseReservation={handleHostReleaseReservation}
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </Card>
                </div>
              ) : null}

              {selectedHostRequest ? (
                <HostGuestModal
                  request={selectedHostRequest}
                  wishlistItems={wishlistItems}
                  busy={reviewingRequestId === selectedHostRequest.id}
                  onClose={() => setSelectedHostRequest(null)}
                  onRemove={() => void handleReview(selectedHostRequest.id, 'reject')}
                />
              ) : null}
            </>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  )
}

function WishlistForm({ draft, error, saving, isEditing, onChange, onSave, onCancel }: { draft: WishlistDraft; error: string; saving: boolean; isEditing: boolean; onChange: (draft: WishlistDraft) => void; onSave: () => void; onCancel: () => void }) {
  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const nextImageUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
        reader.onerror = () => reject(new Error('IMAGE_READ_FAILED'))
        reader.readAsDataURL(file)
      })

      if (!nextImageUrl) {
        throw new Error('IMAGE_READ_FAILED')
      }

      onChange({ ...draft, imageUrl: nextImageUrl })
    } catch {
      // Form already has a generic error area; keep this input resilient.
    }
  }

  return (
    <div className="pb-profileForm pb-inviteHostAddCard">
      <div className="pb-formGrid">
        <label className="pb-formField"><span className="pb-formLabel">Naziv poklona</span><input className="pb-input" type="text" value={draft.title} onChange={(event) => onChange({ ...draft, title: event.target.value })} /></label>
        <label className="pb-formField"><span className="pb-formLabel">Opis</span><input className="pb-input" type="text" value={draft.description} onChange={(event) => onChange({ ...draft, description: event.target.value })} /></label>
        <label className="pb-formField"><span className="pb-formLabel">Link</span><input className="pb-input" type="url" value={draft.url} onChange={(event) => onChange({ ...draft, url: event.target.value })} /></label>
        <label className="pb-formField"><span className="pb-formLabel">Cijena</span><input className="pb-input" type="text" value={draft.priceLabel} onChange={(event) => onChange({ ...draft, priceLabel: event.target.value })} /></label>
        <label className="pb-formField">
          <span className="pb-formLabel">Dodaj sliku</span>
          <input className="pb-input pb-input--file" type="file" accept="image/*" onChange={handleImageChange} />
          <span className="pb-inviteWish__uploadHint">Odaberi sliku iz kamere ili galerije.</span>
          {draft.imageUrl ? (
            <div className="pb-inviteWish__uploadPreview">
              <img className="pb-inviteWish__uploadPreviewImage" src={draft.imageUrl} alt="Pregled slike poklona" />
            </div>
          ) : null}
        </label>
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

function HostWishlistSection({
  items,
  actionItemId,
  editingItemId,
  onEdit,
  onDelete,
  onReleaseReservation,
}: {
  items: InvitationWishlistItem[]
  actionItemId: string | null
  editingItemId: string | null
  onEdit: (item: InvitationWishlistItem) => void
  onDelete: (item: InvitationWishlistItem) => void
  onReleaseReservation: (item: InvitationWishlistItem) => void
}) {
  return (
    <div className="pb-wishlist">
      {items.map((item) => {
        const isBusy = actionItemId === item.id
        const hasActiveReservation = item.reservation.status === 'active'

        return (
          <div key={item.id} className="pb-wishlistItem">
            <div>
              <div className="pb-wishlistItem__title">{item.title}</div>
              {item.description ? <div className="pb-wishlistItem__meta">{item.description}</div> : null}
              {item.priceLabel ? <div className="pb-wishlistItem__meta">Cijena: {item.priceLabel}</div> : null}
              {item.url ? (
                <div className="pb-wishlistItem__meta">
                  <a href={item.url} target="_blank" rel="noreferrer">
                    Pogledaj link
                  </a>
                </div>
              ) : null}
              <div className="pb-wishlistItem__meta">Redoslijed: {item.priorityOrder}</div>
              {hasActiveReservation ? (
                <>
                  <div className="pb-wishlistItem__reserved">Rezervirao/la: {item.reservation.reservedByName || 'Gost'}</div>
                  {item.reservation.reservedForChildName ? (
                    <div className="pb-wishlistItem__meta">Za dijete: {item.reservation.reservedForChildName}</div>
                  ) : null}
                  {item.reservation.note ? <div className="pb-wishlistItem__meta">Napomena: {item.reservation.note}</div> : null}
                </>
              ) : (
                <div className="pb-wishlistItem__reserved">Poklon je trenutno slobodan.</div>
              )}
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{ width: '100%', maxWidth: 180, borderRadius: 14, objectFit: 'cover' }}
                />
              ) : null}
              <Button variant={editingItemId === item.id ? 'amber' : 'ghost'} type="button" onClick={() => onEdit(item)}>
                Uredi
              </Button>
              <Button variant="ghost" type="button" onClick={() => onDelete(item)} disabled={isBusy}>
                {isBusy ? 'Brisanje...' : 'Obriši'}
              </Button>
              {hasActiveReservation ? (
                <Button type="button" onClick={() => onReleaseReservation(item)} disabled={isBusy}>
                  {isBusy ? 'Spremamo...' : 'Otpusti rezervaciju'}
                </Button>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function getRsvpToneClass(status?: InvitationRsvp['status']) {
  if (status === 'going') return 'pb-hostRequestItem__rsvpBadge--going'
  if (status === 'not_going') return 'pb-hostRequestItem__rsvpBadge--notGoing'
  if (status === 'maybe') return 'pb-hostRequestItem__rsvpBadge--maybe'
  return 'pb-hostRequestItem__rsvpBadge--pending'
}

function rsvpStatusLabelClean(status: 'going' | 'not_going' | 'maybe' | null | undefined) {
  if (status === 'going') return 'Dolazi'
  if (status === 'not_going') return 'Ne dolazi'
  if (status === 'maybe') return 'Možda'
  return 'Odgovor još nije poslan'
}

function groupHostRequestsByRsvpClean(requests: MembershipRequest[]) {
  const pendingRequests = requests.filter((request) => request.status === 'pending')
  const reviewedRequests = requests.filter((request) => request.status !== 'pending')

  return [
    { title: 'Čeka na odobrenje', className: 'pb-hostRequestGroup--pending', requests: pendingRequests },
    { title: 'Dolaze', className: 'pb-hostRequestGroup--going', requests: reviewedRequests.filter((request) => request.rsvp?.status === 'going') },
    { title: 'Možda', className: 'pb-hostRequestGroup--maybe', requests: reviewedRequests.filter((request) => request.rsvp?.status === 'maybe') },
    { title: 'Ne dolaze', className: 'pb-hostRequestGroup--notGoing', requests: reviewedRequests.filter((request) => request.rsvp?.status === 'not_going') },
  ].filter((group) => group.requests.length > 0)
}

function getGuestGiftSummaries(request: MembershipRequest, wishlistItems: InvitationWishlistItem[]) {
  return wishlistItems
    .filter((item) => item.reservation.reservedByUserId === request.userId)
    .map((item) => ({
      id: item.id,
      title: item.title,
      details:
        item.reservation.note?.trim() ||
        (item.reservation.reservedForChildName ? `Za dijete: ${item.reservation.reservedForChildName}` : 'Kupuje poklon'),
    }))
}

function HostRequestListV2({
  requests,
  reviewingRequestId,
  wishlistItems,
  onReview,
  onSelect,
}: {
  requests: MembershipRequest[]
  reviewingRequestId: string | null
  wishlistItems: InvitationWishlistItem[]
  onReview: (requestId: string, action: 'approve' | 'reject') => void
  onSelect: (request: MembershipRequest) => void
}) {
  if (requests.length === 0) {
    return <div className="pb-inlineNote pb-inlineNote--info">Trenutačno nema novih zahtjeva.</div>
  }

  const groupedRequests = groupHostRequestsByRsvpClean(requests)

  return (
    <div className="pb-hostRequestGroups">
      {groupedRequests.map((group) => (
        <section key={group.title} className={`pb-hostRequestGroup ${group.className}`}>
          <h3 className="pb-hostRequestGroup__title">{group.title}</h3>
          <div className="pb-hostRequests">
            {group.requests.map((request) => {
              const isBusy = reviewingRequestId === request.id
              const parentName = request.familyProfile?.parentName ?? request.user?.displayName ?? 'Nepoznata obitelj'
              const childrenText = request.children.map((child) => `${child.name} (${child.age})`).join(', ') || 'Nema odabrane djece'
              const rsvpLabel = rsvpStatusLabelClean(request.rsvp?.status)
              const rsvpToneClass = getRsvpToneClass(request.rsvp?.status)
              const giftCount = getGuestGiftSummaries(request, wishlistItems).length
              const canOpenDetails = request.status === 'approved'

              return (
                <div
                  key={request.id}
                  className={`pb-hostRequestItem ${canOpenDetails ? 'pb-hostRequestItem--clickable' : ''}`}
                  onClick={canOpenDetails ? () => onSelect(request) : undefined}
                  onKeyDown={
                    canOpenDetails
                      ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            onSelect(request)
                          }
                        }
                      : undefined
                  }
                  role={canOpenDetails ? 'button' : undefined}
                  tabIndex={canOpenDetails ? 0 : undefined}
                >
                  <div className="pb-hostRequestItem__main">
                    <div className="pb-hostRequestItem__title">{parentName}</div>
                    <div className="pb-hostRequestItem__meta">Djeca: {childrenText}</div>
                    {canOpenDetails ? (
                      <div className="pb-hostRequestItem__meta">
                        {giftCount > 0 ? `Pokloni: ${giftCount}` : 'Klikni za detalje gosta'}
                      </div>
                    ) : null}
                  </div>

                  <div className="pb-hostRequestItem__side">
                    {request.status === 'pending' ? (
                      <div className="pb-flowActions pb-flowActions--compact">
                        <Button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onReview(request.id, 'approve')
                          }}
                          disabled={isBusy}
                        >
                          Odobri
                        </Button>
                        <Button
                          variant="ghost"
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onReview(request.id, 'reject')
                          }}
                          disabled={isBusy}
                        >
                          Odbij
                        </Button>
                      </div>
                    ) : null}

                    <div className={`pb-hostRequestItem__rsvpBadge ${rsvpToneClass}`}>
                      <span className="pb-hostRequestItem__rsvpLabel">RSVP</span>
                      <span className="pb-hostRequestItem__rsvpValue">{rsvpLabel}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

function HostGuestModal({
  request,
  wishlistItems,
  busy,
  onClose,
  onRemove,
}: {
  request: MembershipRequest
  wishlistItems: InvitationWishlistItem[]
  busy: boolean
  onClose: () => void
  onRemove: () => void
}) {
  const giftSummaries = getGuestGiftSummaries(request, wishlistItems)
  const parentName = request.familyProfile?.parentName ?? request.user?.displayName ?? 'Nepoznata obitelj'
  const childrenText = request.children.map((child) => `${child.name} (${child.age})`).join(', ') || 'Nema odabrane djece'
  const rsvpLabel = rsvpStatusLabelClean(request.rsvp?.status)
  const rsvpToneClass = getRsvpToneClass(request.rsvp?.status)

  return (
    <div className="pb-modalOverlay" role="presentation" onClick={onClose}>
      <div
        className="pb-modalDialog pb-hostGuestModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="host-guest-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pb-modalDialog__head">
          <h2 id="host-guest-modal-title" className="pb-modalDialog__title">
            {parentName}
          </h2>
          <button type="button" className="pb-modalDialog__close" onClick={onClose} aria-label="Zatvori detalje gosta">
            ×
          </button>
        </div>
        <div className="pb-modalDialog__body pb-hostGuestModal__body">
          <div className="pb-hostGuestModal__card">
            <div className="pb-hostGuestModal__row">
              <span className="pb-hostGuestModal__label">Djeca</span>
              <span>{childrenText}</span>
            </div>
            <div className="pb-hostGuestModal__row">
              <span className="pb-hostGuestModal__label">RSVP</span>
              <span className={`pb-hostRequestItem__rsvpBadge ${rsvpToneClass}`}>{rsvpLabel}</span>
            </div>
          </div>

          <div className="pb-hostGuestModal__card">
            <div className="pb-hostGuestModal__sectionTitle">Pokloni</div>
            {giftSummaries.length > 0 ? (
              <div className="pb-hostGuestModal__giftList">
                {giftSummaries.map((gift) => (
                  <div key={gift.id} className="pb-hostGuestModal__giftItem">
                    <div className="pb-hostGuestModal__giftTitle">{gift.title}</div>
                    <div className="pb-hostGuestModal__giftMeta">{gift.details}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pb-hostGuestModal__empty">Gost još nema zabilježen poklon.</div>
            )}
          </div>

          <div className="pb-flowActions pb-flowActions--modal">
            <Button
              variant="ghost"
              type="button"
              className="pb-hostRequestItem__removeBtn"
              onClick={onRemove}
              disabled={busy}
            >
              {busy ? 'Spremamo...' : 'Izbaci'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


