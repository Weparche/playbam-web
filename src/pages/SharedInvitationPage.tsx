import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { Link, useParams } from 'react-router-dom'

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

function getWishlistReservationLabel(item: InvitationWishlistItem) {
  const reservationStatus = item.reservation.status
  const buyerName = item.reservation.reservedByName?.trim()
  const childName = item.reservation.reservedForChildName?.trim() || item.addedForChildName?.trim()
  const fallbackBuyerName = reservationStatus === 'reserved_by_you' ? 'Ti' : reservationStatus === 'available' ? '' : 'Rezervirano'
  const resolvedBuyerName = buyerName || fallbackBuyerName

  if (!resolvedBuyerName) {
    return null
  }

  return childName ? `${resolvedBuyerName} - ${childName}` : resolvedBuyerName
}

function getWishlistAddedByLabel(item: InvitationWishlistItem) {
  const parentName = item.addedByName?.trim()
  const childName = item.addedForChildName?.trim()

  if (!parentName) {
    return null
  }

  return childName ? `Dodao ${parentName} - ${childName}` : `Dodao ${parentName}`
}

function getWishlistImageUrl(item: InvitationWishlistItem) {
  if (item.imageUrl) {
    return item.imageUrl
  }

  const normalizedTitle = item.title.toLowerCase()
  if (normalizedTitle.includes('lille')) {
    return '/lille.jpg'
  }
  if (normalizedTitle.includes('zana')) {
    return '/zana.jpg'
  }

  return null
}

function getPreferredChildName(
  familyProfile: FamilyProfileResponse | null,
  selectedChildIds: string[],
  membershipRequest: MembershipRequest | null,
) {
  const selectedChild =
    membershipRequest?.children.find((child) => selectedChildIds.includes(child.id)) ??
    membershipRequest?.children[0] ??
    familyProfile?.children.find((child) => selectedChildIds.includes(child.id)) ??
    familyProfile?.children[0]

  return selectedChild?.name ?? null
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
  const [hostWishlistImageName, setHostWishlistImageName] = useState('')

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
      return 'Čekamo odobrenje organizatora — zatim možeš potvrditi dolazak.'
    }
    if (membershipRequest?.status === 'rejected') {
      return 'Zahtjev za pristup je odbijen.'
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
    setHostWishlistImageName('')
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

          setHostRequests(requests)
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
          setHostAuthError('Ovaj token nema organizatorski pristup za ovu pozivnicu.')
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
          setHostToken('')
          setHostAuthError('Host token nije valjan.')
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

  const handleHostLogin = () => {
    const nextToken = hostTokenDraft.trim()

    if (!nextToken) {
      setHostAuthError('Upiši host token.')
      return
    }

    logout()
    writeStoredHostToken(nextToken)
    setHostToken(nextToken)
    setHostTokenDraft('')
    setHostAuthError('')
  }

  const handleHostLogout = () => {
    writeStoredHostToken(null)
    setHostToken('')
    setHostAuthError('')
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
    setProfileError('')

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
    if (!invitation || (!user && !hasHostSession)) {
      return
    }

    setReviewingRequestId(requestId)
    setHostError('')

    try {
      const identity = user ?? undefined
      await reviewMembershipRequest(invitation.id, requestId, action, identity)
      const requests = await listMembershipRequests(invitation.id, identity)
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

    const reservedForChildName = getPreferredChildName(familyProfile, selectedChildIds, membershipRequest)

    setWishlistActionId(item.id)
    setWishlistError('')

    try {
      await reserveInvitationWishlistItem(
        invitation.id,
        item.id,
        reservedForChildName ? { reservedForChildName } : undefined,
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

  const handleWishlistSave = async () => {
    if (!invitation || (!user && !hasHostSession)) {
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
        await updateInvitationWishlistItem(invitation.id, editingWishlistItemId, payload, user ?? undefined)
      } else {
        await createInvitationWishlistItem(invitation.id, payload, user ?? undefined)
      }
      resetWishlistForm()
      await refreshWishlist(user ?? undefined)
    } catch {
      setWishlistFormError('Spremanje želje trenutno nije uspjelo.')
    } finally {
      setSavingWishlistItem(false)
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
    } catch {
      setWishlistError('Brisanje poklona trenutno nije uspjelo.')
    } finally {
      setWishlistActionId(null)
    }
  }

  const handleWishlistEdit = (item: InvitationWishlistItem) => {
    setEditingWishlistItemId(item.id)
    setWishlistDraft(createWishlistDraft(item))
    setWishlistFormError('')
    setHostWishlistImageName('')
  }

  const handleHostWishlistImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setWishlistDraft((current) => ({ ...current, imageUrl: '' }))
      setHostWishlistImageName('')
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

      setWishlistDraft((current) => ({ ...current, imageUrl: nextImageUrl }))
      setHostWishlistImageName(file.name)
      setWishlistFormError('')
    } catch {
      setWishlistFormError('Učitavanje slike nije uspjelo.')
    }
  }

  const handleWishlistDelete = async (item: InvitationWishlistItem) => {
    if (!invitation || (!user && !hasHostSession)) {
      return
    }

    setWishlistActionId(item.id)
    setWishlistError('')

    try {
      await deleteInvitationWishlistItem(invitation.id, item.id, user ?? undefined)
      if (editingWishlistItemId === item.id) {
        resetWishlistForm()
      }
      await refreshWishlist(user ?? undefined)
    } catch (caughtError) {
      setWishlistError(getDeleteErrorMessage(caughtError))
    } finally {
      setWishlistActionId(null)
    }
  }

  const handleHostReleaseReservation = async (item: InvitationWishlistItem) => {
    if (!invitation || (!user && !hasHostSession)) {
      return
    }

    setWishlistActionId(item.id)
    setWishlistError('')

    try {
      await cancelInvitationWishlistReservation(invitation.id, item.id, user ?? undefined)
      await refreshWishlist(user ?? undefined)
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
              {user ? (
                <div className="pb-inviteSessionBar">
                  <span className="pb-inviteSessionBar__text">
                    <span className="pb-inviteSessionBar__role">{isHost ? 'Organizator:' : 'Gost:'}</span>{' '}
                    <span className="pb-inviteSessionBar__email">{isHost ? user.email : user.parentName || user.email}</span>
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
                  <span className="pb-inviteSessionBar__text">
                    <span className="pb-inviteSessionBar__role">Organizator:</span>{' '}
                    <span className="pb-inviteSessionBar__email">Host pristup aktivan</span>
                  </span>
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
                onGuestRsvpIntent={isHost ? undefined : openGuestFlow}
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
                  currentGuestName={isHost ? null : user.parentName || null}
                  onReserve={handleReserveWishlistItem}
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
                  <p className="pb-flowCard__text">Unesi host token za odobravanje gostiju i uređivanje privatnog host dijela pozivnice.</p>
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
                <>
                  <section
                    className="pb-invitePrivateCard pb-invitePrivateCard--accordion pb-inviteHostPanel"
                    aria-labelledby="host-requests-toggle"
                  >
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
                        ↓
                      </span>
                    </button>
                    {hostRequestsOpen ? (
                      <div className="pb-privateAccordionBody">
                        <div className="pb-privateDetails">
                          <p className="pb-flowCard__text">
                            Pregledaj tko traži pristup privatnom dijelu pozivnice i odluči kome ćeš ga odobriti.
                          </p>
                          {hostError ? <div className="pb-inlineNote pb-inlineNote--error">{hostError}</div> : null}
                          <HostRequestList
                            requests={hostRequests}
                            reviewingRequestId={reviewingRequestId}
                            onReview={handleReview}
                          />
                        </div>
                      </div>
                    ) : null}
                  </section>
                  <section
                    className="pb-invitePrivateCard pb-invitePrivateCard--accordion pb-inviteHostPanel"
                    aria-labelledby="host-wishlist-toggle"
                  >
                    <button
                      id="host-wishlist-toggle"
                      type="button"
                      className={`pb-privateToggle ${hostWishlistOpen ? 'is-open' : ''}`}
                      onClick={() => setHostWishlistOpen((current) => !current)}
                      aria-expanded={hostWishlistOpen}
                    >
                      <span className="pb-privateToggle__copy">
                        <span className="pb-privateToggle__eyebrow">Organizator</span>
                        <span className="pb-privateToggle__title">Lista želja</span>
                      </span>
                      <span className="pb-privateToggle__arrow" aria-hidden>
                        ↓
                      </span>
                    </button>
                    {hostWishlistOpen ? (
                      <div className="pb-privateAccordionBody">
                        <div className="pb-privateWishlist pb-privateWishlist--host">
                          <p className="pb-flowCard__text pb-flowCard__text--hostWishlist">
                            Dodaj, uredi i organiziraj želje za poklone. Ovdje vidiš i tko je što rezervirao.
                          </p>
                          <section className="pb-inviteHostAddWrap">
                            <button
                              type="button"
                              className={`pb-privateToggle pb-privateToggle--inner ${hostAddGiftOpen ? 'is-open' : ''}`}
                              onClick={() => setHostAddGiftOpen((current) => !current)}
                              aria-expanded={hostAddGiftOpen}
                            >
                              <span className="pb-privateToggle__copy">
                                <span className="pb-privateToggle__eyebrow">Organizator</span>
                                <span className="pb-privateToggle__title">Dodaj poklon</span>
                              </span>
                              <span className="pb-privateToggle__arrow" aria-hidden>
                                ↓
                              </span>
                            </button>
                            {hostAddGiftOpen ? (
                              <div className="pb-inviteHostAddBody">
                                <WishlistForm
                                  draft={wishlistDraft}
                                  error={wishlistFormError}
                                  saving={savingWishlistItem}
                                  isEditing={Boolean(editingWishlistItemId)}
                                  imageName={hostWishlistImageName}
                                  onChange={setWishlistDraft}
                                  onSave={handleWishlistSave}
                                  onCancel={resetWishlistForm}
                                  onImageChange={handleHostWishlistImageChange}
                                />
                              </div>
                            ) : null}
                          </section>
                          {wishlistError ? <div className="pb-inlineNote pb-inlineNote--error">{wishlistError}</div> : null}
                          {wishlistLoading ? <div className="pb-inlineNote pb-inlineNote--info">Učitavanje liste želja...</div> : null}
                          {!wishlistLoading && wishlistItems.length === 0 ? (
                            <div className="pb-inlineNote pb-inlineNote--info">Još nema dodanih želja.</div>
                          ) : null}
                          {wishlistItems.length > 0 ? (
                            <HostWishlistSection
                              items={wishlistItems}
                              actionItemId={wishlistActionId}
                              editingItemId={editingWishlistItemId}
                              onEdit={handleWishlistEdit}
                              onDelete={handleWishlistDelete}
                              onReleaseReservation={handleHostReleaseReservation}
                            />
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </section>
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

function WishlistForm({
  draft,
  error,
  saving,
  isEditing,
  imageName,
  onChange,
  onSave,
  onCancel,
  onImageChange,
}: {
  draft: WishlistDraft
  error: string
  saving: boolean
  isEditing: boolean
  imageName: string
  onChange: (draft: WishlistDraft) => void
  onSave: () => void
  onCancel: () => void
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="pb-profileForm">
      <div className="pb-formGrid">
        <label className="pb-formField">
          <span className="pb-formLabel">Naziv poklona</span>
          <input className="pb-input" type="text" value={draft.title} onChange={(event) => onChange({ ...draft, title: event.target.value })} />
        </label>
        <label className="pb-formField">
          <span className="pb-formLabel">Opis</span>
          <input className="pb-input" type="text" value={draft.description} onChange={(event) => onChange({ ...draft, description: event.target.value })} />
        </label>
        <label className="pb-formField">
          <span className="pb-formLabel">Cijena</span>
          <input className="pb-input" type="text" value={draft.priceLabel} onChange={(event) => onChange({ ...draft, priceLabel: event.target.value })} />
        </label>
        <label className="pb-formField">
          <span className="pb-formLabel">Učitaj sliku</span>
          <input className="pb-input pb-input--file" type="file" accept="image/*" onChange={onImageChange} />
          {imageName ? <span className="pb-inviteWish__uploadHint">Odabrano: {imageName}</span> : null}
          {draft.imageUrl ? (
            <div className="pb-inviteWish__uploadPreview">
              <img src={draft.imageUrl} alt="Pregled odabrane slike poklona" className="pb-inviteWish__uploadPreviewImage" />
            </div>
          ) : null}
        </label>
        <label className="pb-formField">
          <span className="pb-formLabel">Redoslijed</span>
          <input className="pb-input" type="number" min="0" value={draft.priorityOrder} onChange={(event) => onChange({ ...draft, priorityOrder: event.target.value })} />
        </label>
      </div>
      <div className="pb-flowActions">
        <Button type="button" onClick={onSave} disabled={saving}>
          {saving ? 'Spremamo...' : isEditing ? 'Spremi' : 'Dodaj želju'}
        </Button>
        {isEditing ? (
          <Button variant="ghost" type="button" onClick={onCancel}>
            Odustani
          </Button>
        ) : null}
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
    <div className="pb-wishlist pb-wishlist--host">
      {items.map((item) => {
        const isBusy = actionItemId === item.id
        const hasActiveReservation = item.reservation.status === 'active'
        const reservationLabel = getWishlistReservationLabel(item)
        const addedByLabel = getWishlistAddedByLabel(item)
        const imageUrl = getWishlistImageUrl(item)

        return (
          <div key={item.id} className="pb-wishlistItem pb-wishlistItem--host">
            <div className="pb-wishlistItem__main">
              <div className="pb-wishlistItem__header">
                <div className="pb-wishlistItem__title">{item.title}</div>
                <Button variant={editingItemId === item.id ? 'amber' : 'ghost'} type="button" onClick={() => onEdit(item)}>
                  Uredi
                </Button>
              </div>
              {item.description ? <div className="pb-wishlistItem__meta">{item.description}</div> : null}
              {addedByLabel ? <div className="pb-wishlistItem__meta">{addedByLabel}</div> : null}
              {item.priceLabel ? <div className="pb-wishlistItem__meta">Cijena: {item.priceLabel}</div> : null}
              <div className="pb-wishlistItem__meta">Redoslijed: {item.priorityOrder}</div>
              {hasActiveReservation ? (
                <>
                  <div className="pb-wishlistItem__reserved">{reservationLabel ? `+ ${reservationLabel}` : 'Poklon je rezerviran.'}</div>
                  {item.reservation.note ? <div className="pb-wishlistItem__meta">Napomena: {item.reservation.note}</div> : null}
                </>
              ) : (
                <div className="pb-wishlistItem__reserved">Poklon je trenutno slobodan.</div>
              )}
            </div>
            <div className="pb-hostWishlistItem__actions">
              {imageUrl ? <img src={imageUrl} alt={item.title} className="pb-hostWishlistItem__image" /> : null}
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

function HostRequestList({
  requests,
  reviewingRequestId,
  onReview,
}: {
  requests: MembershipRequest[]
  reviewingRequestId: string | null
  onReview: (requestId: string, action: 'approve' | 'reject') => void
}) {
  if (requests.length === 0) {
    return <div className="pb-inlineNote pb-inlineNote--info">Trenutačno nema novih zahtjeva.</div>
  }

  const getRsvpLabel = (request: MembershipRequest) => {
    if (!request.rsvp) {
      return 'Gost još nije odgovorio'
    }
    if (request.rsvp.status === 'going') {
      return 'Dolazi'
    }
    if (request.rsvp.status === 'not_going') {
      return 'Ne dolazi'
    }
    return 'Možda'
  }

  return (
    <div className="pb-hostRequests">
      {requests.map((request) => {
        const isBusy = reviewingRequestId === request.id
        const isApproved = request.status === 'approved'

        return (
          <div key={request.id} className="pb-hostRequestItem">
            <div className="pb-hostRequestItem__main">
              <div className="pb-hostRequestItem__title">
                {request.familyProfile?.parentName ?? request.user?.displayName ?? 'Nepoznata obitelj'}
              </div>
              <div className="pb-hostRequestItem__meta">
                Djeca: {request.children.map((child) => `${child.name} (${child.age})`).join(', ') || 'Nema odabrane djece'}
              </div>
            </div>
            <div className="pb-hostRequestItem__side">
              {isApproved ? (
                <Button
                  className="pb-hostRequestItem__removeBtn"
                  variant="ghost"
                  type="button"
                  onClick={() => onReview(request.id, 'reject')}
                  disabled={isBusy}
                >
                  {isBusy ? 'Spremamo...' : 'Izbaci'}
                </Button>
              ) : (
                <div className="pb-flowActions pb-flowActions--compact">
                  <Button type="button" onClick={() => onReview(request.id, 'approve')} disabled={isBusy}>
                    Odobri
                  </Button>
                  <Button variant="ghost" type="button" onClick={() => onReview(request.id, 'reject')} disabled={isBusy}>
                    Odbij
                  </Button>
                </div>
              )}
              <div className={`pb-statusBadge pb-statusBadge--${request.status}`}>{getMembershipStatusLabel(request.status)}</div>
              <div className="pb-hostRequestItem__rsvp">{getRsvpLabel(request)}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
