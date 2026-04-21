import { type ChangeEvent, type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'
import { toJpeg } from 'html-to-image'

import { buildGoogleFontsEmbedCss } from '../lib/buildGoogleFontsEmbedCss'
import { useParams } from 'react-router-dom'

import FloatingEditPanel from '../components/create/FloatingEditPanel'
import InvitationLivePreview, { type LivePreviewMode } from '../components/create/InvitationLivePreview'
import InvitationMainEditor from '../components/create/InvitationMainEditor'
import QuickDateTimeEditor from '../components/create/QuickDateTimeEditor'
import QuickLocationEditor from '../components/create/QuickLocationEditor'
import QuickRSVPEditor from '../components/create/QuickRSVPEditor'
import QuickThemeEditor from '../components/create/QuickThemeEditor'
import ShortcutRail from '../components/create/ShortcutRail'
import InvitationCard from '../components/invitation/InvitationCard'
import InvitationLiveChatPanel from '../components/invitation/InvitationLiveChatPanel'
import PrivateInvitationGuest from '../components/invitation/PrivateInvitationGuest'
import { type FamilyProfileDraft } from '../components/invitation/FamilyProfileForm'
import GuestInvitationModal, { getGuestModalStep } from '../components/invitation/GuestInvitationModal'
import Navbar from '../components/landing/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PrivateToggleChevron from '../components/ui/PrivateToggleChevron'
import { useAuth } from '../context/AuthContext'
import {
  cancelInvitationWishlistReservation,
  createFamilyProfile,
  createInvitationChatMessage,
  createInvitationWishlistItem,
  createMembershipRequest,
  deleteInvitationWishlistItem,
  getFamilyProfile,
  getInvitationAccess,
  getInvitationChat,
  getInvitationWishlist,
  getMyMembershipRequest,
  getMyRsvp,
  getPublicInvitation,
  isApiError,
  listMembershipRequests,
  proxyImageUrl,
  updateInvitation,
  reserveInvitationWishlistItem,
  reviewMembershipRequest,
  saveRsvp,
  unfurlLink,
  updateFamilyProfile,
  updateInvitationWishlistItem,
  type FamilyProfilePayload,
  type FamilyProfileResponse,
  type InvitationAccess,
  type InvitationChatMessage,
  type InvitationPartyDetails,
  type InvitationRsvp,
  type InvitationWishlistItem,
  type InvitationWishlistPayload,
  type MembershipRequest,
  type PublicInvitation,
  type UpdateInvitationPayload,
} from '../lib/invitationApi'
import { readStoredHostToken, writeStoredHostToken } from '../lib/hostWebSession'
import { applyInvitationShareMeta, clearInvitationShareMeta } from '../lib/invitationShareMeta'
import type { TemporaryWebIdentity } from '../lib/tempWebIdentity'
import {
  buildTimeRangeValue,
  DEFAULT_CREATE_DRAFT,
  getTitleColorValue,
  isBirthTheme,
  normalizeCreateTheme,
  normalizeRsvpMood,
  normalizeTitleColor,
  normalizeTitleFont,
  normalizeTitleOutline,
  normalizeTitleSize,
  type InvitationCreateDraft,
  type ShortcutId,
} from '../components/create/createTypes'

type WishlistDraft = {
  title: string
  description: string
  url: string
  priceLabel: string
  imageUrl: string
  priorityOrder: string
  linkMeta?: WishlistLinkMeta
}

type WishlistLinkMeta = {
  title?: string
  image?: string
  domain?: string
  favicon?: string
}

type PartyDetailsDraft = {
  parkingLocation: string
  cafeLocation: string
  extraDetails: string
  contactName: string
  contactMobile: string
}

type HostShortcutId = 'wishlist' | 'settings' | 'partyDetails' | 'requests' | 'shareGuest'

type HostAccordionSection = 'update' | 'details' | 'requests' | 'wishlist' | 'chat'

const HOST_SHORTCUT_ITEMS = [
  { id: 'settings', label: 'Ažuriraj', icon: '⚙️' },
  { id: 'partyDetails', label: 'Detalji', icon: '📍' },
  { id: 'requests', label: 'Zahtjevi', icon: '🧾' },
  { id: 'wishlist', label: 'Lista želja', icon: '🎁' },
  { id: 'shareGuest', label: 'Podijeli', icon: '🔗' },
] as const satisfies ReadonlyArray<{ id: HostShortcutId; label: string; icon: string }>

function createEmptyDraft(parentName = '', isBirthInvitation = false): FamilyProfileDraft {
  return {
    parentName,
    children: isBirthInvitation ? [] : [{ name: '', age: '' }],
  }
}

function createDraftFromProfile(
  familyProfile: FamilyProfileResponse,
  fallbackParentName = '',
  isBirthInvitation = false,
): FamilyProfileDraft {
  if (!familyProfile.profile) {
    return createEmptyDraft(fallbackParentName, isBirthInvitation)
  }

  return {
    parentName: familyProfile.profile.parentName || fallbackParentName,
    children: familyProfile.children.length
      ? familyProfile.children.map((child) => ({
          id: child.id,
          name: child.name,
          age: String(child.age),
        }))
      : isBirthInvitation
        ? []
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
    linkMeta: item?.url
      ? {
          title: item.title ?? undefined,
          image: item.imageUrl ?? undefined,
        }
      : undefined,
  }
}

function parseInvitationTimeRange(timeValue: string) {
  const [rawStart = '', rawEnd = ''] = timeValue.split('-')
  const start = rawStart.trim()
  const end = rawEnd.trim()

  return {
    time: start,
    timeEnd: end || start,
  }
}

function splitInvitationLocation(locationValue: string) {
  const parts = locationValue
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length <= 1) {
    return {
      locationName: locationValue.trim(),
      locationAddress: '',
    }
  }

  return {
    locationName: parts[0],
    locationAddress: parts.slice(1).join(', '),
  }
}

function createDraftFromInvitation(invitation: PublicInvitation): InvitationCreateDraft {
  const { time, timeEnd } = parseInvitationTimeRange(invitation.time)
  const { locationName, locationAddress } = splitInvitationLocation(invitation.location)

  return {
    ...DEFAULT_CREATE_DRAFT,
    title: invitation.title,
    celebrantName: invitation.celebrantName,
    titleFont: normalizeTitleFont(typeof invitation.titleFont === 'string' ? invitation.titleFont : DEFAULT_CREATE_DRAFT.titleFont),
    titleColor: normalizeTitleColor(typeof invitation.titleColor === 'string' ? invitation.titleColor : DEFAULT_CREATE_DRAFT.titleColor),
    titleOutline: normalizeTitleOutline(typeof invitation.titleOutline === 'string' ? invitation.titleOutline : DEFAULT_CREATE_DRAFT.titleOutline),
    titleSize: normalizeTitleSize(typeof invitation.titleSize === 'string' ? invitation.titleSize : DEFAULT_CREATE_DRAFT.titleSize),
    date: invitation.date,
    time,
    timeEnd,
    locationName,
    locationAddress,
    locationType: locationName.toLowerCase().includes('igraonica') ? 'Igraonica / lokal' : DEFAULT_CREATE_DRAFT.locationType,
    message: invitation.message ?? '',
    theme: normalizeCreateTheme(invitation.theme || invitation.coverImage || DEFAULT_CREATE_DRAFT.theme),
    rsvpMood: normalizeRsvpMood(typeof invitation.rsvpMood === 'string' ? invitation.rsvpMood : null),
    wishlistItems: [],
  }
}

function createPartyDetailsDraft(details?: InvitationPartyDetails | null): PartyDetailsDraft {
  return {
    parkingLocation: details?.parkingLocation ?? '',
    cafeLocation: details?.cafeLocation ?? '',
    extraDetails: details?.extraDetails ?? '',
    contactName: details?.contactName ?? '',
    contactMobile: details?.contactMobile ?? '',
  }
}

function buildGuestInvitePageUrl(invitation: PublicInvitation) {
  const slug = (invitation.publicSlug || invitation.shareToken || '').trim()
  if (typeof window === 'undefined') {
    return `/pozivnica/${slug}`
  }
  return `${window.location.origin}/pozivnica/${slug}`
}

function buildInvitationUpdatePayload(
  draft: InvitationCreateDraft,
  partyDetails: PartyDetailsDraft,
): UpdateInvitationPayload {
  return {
    title: draft.title.trim(),
    celebrantName: draft.celebrantName.trim() || draft.title.trim() || 'Slavljenik',
    titleFont: draft.titleFont,
    titleColor: draft.titleColor,
    titleOutline: draft.titleOutline,
    titleSize: draft.titleSize,
    date: draft.date,
    time: buildTimeRangeValue(draft.time, draft.timeEnd),
    location: [draft.locationName.trim(), draft.locationAddress.trim()].filter(Boolean).join(', '),
    message: draft.message.trim() || null,
    rsvpMood: draft.rsvpMood,
    coverImage: draft.theme,
    theme: draft.theme,
    partyDetails: {
      parkingLocation: partyDetails.parkingLocation.trim() || null,
      cafeLocation: partyDetails.cafeLocation.trim() || null,
      extraDetails: partyDetails.extraDetails.trim() || null,
      contactName: partyDetails.contactName.trim() || null,
      contactMobile: partyDetails.contactMobile.trim() || null,
    },
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

type HostLocalDraft = {
  editorDraft: InvitationCreateDraft
  partyDetailsDraft: PartyDetailsDraft
}

function buildHostLocalDraftKey(invitationId: string) {
  return `playbam.host-update.draft.${invitationId}`
}

function readHostLocalDraft(invitationId: string): HostLocalDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(buildHostLocalDraftKey(invitationId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<HostLocalDraft>
    if (!parsed.editorDraft || !parsed.partyDetailsDraft) return null
    return {
      editorDraft: parsed.editorDraft as InvitationCreateDraft,
      partyDetailsDraft: parsed.partyDetailsDraft as PartyDetailsDraft,
    }
  } catch {
    return null
  }
}

function writeHostLocalDraft(invitationId: string, payload: HostLocalDraft) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(buildHostLocalDraftKey(invitationId), JSON.stringify(payload))
}

function clearHostLocalDraft(invitationId: string) {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(buildHostLocalDraftKey(invitationId))
}

export default function SharedInvitationPage() {
  const { token = '' } = useParams()
  const { user, logout } = useAuth()
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [hostToken, setHostToken] = useState(() => readStoredHostToken())
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
  const [chatMessages, setChatMessages] = useState<InvitationChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState('')
  const [chatDraft, setChatDraft] = useState('')
  const [sendingChatMessage, setSendingChatMessage] = useState(false)
  const [guestChatOpen, setGuestChatOpen] = useState(false)
  const [guestModalOpen, setGuestModalOpen] = useState(false)
  const [hostAccordionOpen, setHostAccordionOpen] = useState<HostAccordionSection | null>(null)
  const [hostAddGiftOpen, setHostAddGiftOpen] = useState(false)
  const [selectedHostRequest, setSelectedHostRequest] = useState<MembershipRequest | null>(null)
  const [hostEditorDraft, setHostEditorDraft] = useState<InvitationCreateDraft>(DEFAULT_CREATE_DRAFT)
  const [hostPartyDetailsDraft, setHostPartyDetailsDraft] = useState<PartyDetailsDraft>(createPartyDetailsDraft())
  const [hostLocalSaveState, setHostLocalSaveState] = useState<'idle' | 'saving' | 'saved'>('saved')
  const hostLoadedDraftRef = useRef<InvitationCreateDraft | null>(null)
  const hostLoadedPartyDetailsRef = useRef<PartyDetailsDraft | null>(null)
  const [hostEditorShortcut, setHostEditorShortcut] = useState<ShortcutId | null>(null)
  const hostDateTimeSnapshotRef = useRef<{ date: string; time: string; timeEnd: string } | null>(null)
  const hostLocationSnapshotRef = useRef<{ locationName: string; locationAddress: string; locationType: string } | null>(null)
  const [hostShortcutActive, setHostShortcutActive] = useState<HostShortcutId | null>(null)
  const [hostPreviewMode, setHostPreviewMode] = useState<LivePreviewMode>('guest')
  const [savingHostInvitation, setSavingHostInvitation] = useState(false)
  const [hostUpdateError, setHostUpdateError] = useState('')
  const [hostUpdateNotice, setHostUpdateNotice] = useState('')
  const [hostShareDialogOpen, setHostShareDialogOpen] = useState(false)
  const [hostShareCopyDone, setHostShareCopyDone] = useState(false)
  const [hostJpgExportMessage, setHostJpgExportMessage] = useState<string | null>(null)
  const hostPrintCardRef = useRef<HTMLDivElement>(null)

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
    if (hostPreviewMode !== 'print') {
      setHostJpgExportMessage(null)
    }
  }, [hostPreviewMode])

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

  useEffect(() => {
    if (!invitation) {
      return
    }
    applyInvitationShareMeta(invitation)
    return () => {
      clearInvitationShareMeta()
    }
  }, [invitation])

  useEffect(() => {
    if (!invitation) {
      return
    }

    const baseDraft = createDraftFromInvitation(invitation)
    const basePartyDetails = createPartyDetailsDraft(invitation.partyDetails)
    hostLoadedDraftRef.current = baseDraft
    hostLoadedPartyDetailsRef.current = basePartyDetails

    const stored = readHostLocalDraft(invitation.id)
    if (stored) {
      setHostEditorDraft({ ...baseDraft, ...stored.editorDraft })
      setHostPartyDetailsDraft({ ...basePartyDetails, ...stored.partyDetailsDraft })
      setHostLocalSaveState('saved')
      return
    }

    setHostEditorDraft(baseDraft)
    setHostPartyDetailsDraft(basePartyDetails)
    setHostLocalSaveState('saved')
  }, [invitation])

  useEffect(() => {
    const hostActive = Boolean(access?.isHost)
    if (!invitation || !hostActive) {
      return
    }

    setHostLocalSaveState('saving')
    const timeoutId = window.setTimeout(() => {
      writeHostLocalDraft(invitation.id, { editorDraft: hostEditorDraft, partyDetailsDraft: hostPartyDetailsDraft })
      setHostLocalSaveState('saved')
    }, 420)

    return () => window.clearTimeout(timeoutId)
  }, [access, hostEditorDraft, hostPartyDetailsDraft, invitation])

  const hostAutosaveLabel = hostLocalSaveState === 'saving' ? 'Spremam lokalno…' : 'Spremljeno lokalno'

  const handleHostResetLocalChanges = () => {
    if (!invitation) return
    const confirmed = window.confirm('Resetirati lokalne promjene i vratiti zadnje spremljeno stanje?')
    if (!confirmed) return

    clearHostLocalDraft(invitation.id)
    setHostUpdateError('')
    setHostUpdateNotice('')
    setHostEditorShortcut(null)
    setHostAddGiftOpen(false)
    setHostEditorDraft(hostLoadedDraftRef.current ?? createDraftFromInvitation(invitation))
    setHostPartyDetailsDraft(hostLoadedPartyDetailsRef.current ?? createPartyDetailsDraft(invitation.partyDetails))
    setHostLocalSaveState('saved')
  }

  const hasFamilyProfile = Boolean(familyProfile?.profile)
  const hasHostSession = Boolean(hostToken)
  const isHost = access?.isHost ?? false
  const isBirthInvitation = invitation
    ? isBirthTheme(normalizeCreateTheme(invitation.theme || invitation.coverImage || DEFAULT_CREATE_DRAFT.theme))
    : false
  const hasPrivateAccess = access?.canAccessPrivateInvitation ?? false
  const canViewWishlist = access?.canViewWishlist ?? false
  const canSubmitRsvp = Boolean(user && !isHost && access?.canRsvp)
  const showHostStudio = Boolean((user || hasHostSession) && !loadingPrivateState && isHost)

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
      // Hint više ne prikazujemo unutar pozivnice (prekriva "Privatni dio pozivnice").
      // Pending stanje se prikazuje kao zasebna kartica iznad pozivnice.
      return null
    }
    if (membershipRequest?.status === 'rejected') {
      return 'Zahtjev za pristup je odbijen. Možeš poslati novi zahtjev.'
    }
    return null
  }, [isHost, invitation, canSubmitRsvp, user, hasFamilyProfile, membershipRequest])

  const openGuestFlow = () => {
    setGuestModalOpen(true)
  }

  const updateHostField = <K extends keyof InvitationCreateDraft>(field: K, value: InvitationCreateDraft[K]) => {
    setHostEditorDraft((current) => ({
      ...current,
      [field]: field === 'rsvpEnabled' ? true : value,
    }))
    setHostUpdateError('')
    setHostUpdateNotice('')
  }

  const openHostEditorShortcut = (shortcut: ShortcutId) => {
    if (shortcut === 'dateTime') {
      hostDateTimeSnapshotRef.current = { date: hostEditorDraft.date, time: hostEditorDraft.time, timeEnd: hostEditorDraft.timeEnd }
    } else if (shortcut === 'location') {
      hostLocationSnapshotRef.current = { locationName: hostEditorDraft.locationName, locationAddress: hostEditorDraft.locationAddress, locationType: hostEditorDraft.locationType }
    }
    setHostEditorShortcut(shortcut)
  }

  const updateHostPartyDetails = <K extends keyof PartyDetailsDraft>(field: K, value: PartyDetailsDraft[K]) => {
    setHostPartyDetailsDraft((current) => ({
      ...current,
      [field]: value,
    }))
    setHostUpdateError('')
    setHostUpdateNotice('')
  }

  const scrollToHostSection = (elementId: string) => {
    window.requestAnimationFrame(() => {
      document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const toggleHostAccordion = (section: HostAccordionSection) => {
    setHostAccordionOpen((prev) => {
      const next = prev === section ? null : section
      if (next === 'update') {
        setHostPreviewMode('guest')
      } else if (next === 'details') {
        setHostPreviewMode('print')
      }
      return next
    })
  }

  const openHostAccordion = (section: HostAccordionSection) => {
    setHostAccordionOpen(section)
    if (section === 'update') {
      setHostPreviewMode('guest')
    } else if (section === 'details') {
      setHostPreviewMode('print')
    }
  }

  const handleHostShortcutClick = (shortcut: HostShortcutId) => {
    setHostShortcutActive(shortcut)

    switch (shortcut) {
      case 'wishlist':
        openHostAccordion('wishlist')
        scrollToHostSection('host-wishlist-card')
        return
      case 'settings':
        openHostAccordion('update')
        scrollToHostSection('host-update-card')
        return
      case 'partyDetails':
        openHostAccordion('details')
        scrollToHostSection('host-details-card')
        return
      case 'requests':
        openHostAccordion('requests')
        scrollToHostSection('host-requests-card')
        return
      case 'shareGuest':
        setHostShareDialogOpen(true)
        return
      default:
        return
    }
  }

  const handleHostPrintInvite = async () => {
    if (hostPreviewMode !== 'print') {
      setHostPreviewMode('print')
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      })
    }

    try {
      await document.fonts.ready
    } catch {
      // Nastavi i bez potvrde fontova; cilj je da print preview ipak dobije sadržaj.
    }

    document.documentElement.classList.add('pb-print-host-invite')
    const cleanup = () => {
      document.documentElement.classList.remove('pb-print-host-invite')
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup)
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.print()
      })
    })
  }

  const handleHostExportJpg = async () => {
    setHostJpgExportMessage(null)

    if (hostPreviewMode !== 'print') {
      setHostPreviewMode('print')
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      })
    }

    const root = hostPrintCardRef.current?.querySelector('.pb-inviteCard--storybook') as HTMLElement | null
    if (!root) {
      setHostJpgExportMessage('Pozivnica nije pronađena u pregledu.')
      return
    }

    const rect = root.getBoundingClientRect()
    const width = Math.ceil(Math.max(root.scrollWidth, rect.width))
    const height = Math.ceil(Math.max(root.scrollHeight, rect.height))

    try {
      let fontEmbedCSS = ''
      try {
        fontEmbedCSS = await buildGoogleFontsEmbedCss(document, { cacheBust: true })
      } catch {
        /* mreža / blokada — fallback ispod */
      }

      const dataUrl = await toJpeg(root, {
        quality: 0.92,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        /* fontEmbedCSS: fetch + data URL umjesto cssRules na cross-origin linku */
        ...(fontEmbedCSS ? { fontEmbedCSS } : { skipFonts: true }),
        width,
        height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          overflow: 'visible',
        },
      })
      const anchor = document.createElement('a')
      anchor.href = dataUrl
      anchor.download = 'pozivnica.jpg'
      anchor.click()
      setHostJpgExportMessage('JPG je spremljen u preuzimanja.')
      window.setTimeout(() => setHostJpgExportMessage(null), 4000)
    } catch {
      setHostJpgExportMessage('JPG izvoz nije uspio (slike/CORS ili preglednik). Pokušaj Print pa „Spremi kao PDF”.')
    }
  }

  const guestPageShareUrl = invitation ? buildGuestInvitePageUrl(invitation) : ''
  const guestWhatsAppShareHref = guestPageShareUrl
    ? `https://wa.me/?text=${encodeURIComponent(`Pozivnica: ${guestPageShareUrl}`)}`
    : ''

  const closeHostShareDialog = () => {
    setHostShareDialogOpen(false)
    setHostShortcutActive(null)
  }

  const handleCopyGuestInviteLink = async () => {
    if (!guestPageShareUrl) {
      return
    }

    try {
      await navigator.clipboard.writeText(guestPageShareUrl)
      setHostShareCopyDone(true)
    } catch {
      setHostShareCopyDone(false)
    }
  }

  useEffect(() => {
    if (hostShareDialogOpen) {
      setHostShareCopyDone(false)
    }
  }, [hostShareDialogOpen])

  useEffect(() => {
    if (!hostShareDialogOpen) {
      return undefined
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setHostShareDialogOpen(false)
        setHostShortcutActive(null)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hostShareDialogOpen])

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

  const refreshChat = async (
    identity: TemporaryWebIdentity | null | undefined = user ?? undefined,
    options?: { silent?: boolean },
  ) => {
    if (!invitation || (!isHost && !hasPrivateAccess)) {
      return
    }

    if (!options?.silent) {
      setChatLoading(true)
    }
    setChatError('')

    try {
      const messages = await getInvitationChat(invitation.id, identity)
      setChatMessages(messages)
    } catch (caughtError) {
      setChatError(
        isApiError(caughtError, 403)
          ? 'Live chat je dostupan samo organizatoru i odobrenim gostima.'
          : 'Live chat trenutno nije dostupan.',
      )
    } finally {
      if (!options?.silent) {
        setChatLoading(false)
      }
    }
  }

  useEffect(() => {
    if (!invitation || (!user && !hasHostSession)) {
      setAccess(null)
      setFamilyProfile(null)
      setMembershipRequest(null)
      setHostRequests([])
      setWishlistItems([])
      setChatMessages([])
      setChatError('')
      setChatDraft('')
      setGuestChatOpen(false)
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
          setChatMessages([])
          setChatError('')
          setChatDraft('')
          setGuestChatOpen(false)
          setFamilyProfile(null)
          setMembershipRequest(null)
          setRsvp(null)
          setSelectedChildIds([])
          return
        }

        if (!currentUser) {
          writeStoredHostToken(null)
          setHostToken('')
          setLoadingPrivateState(false)
          return
        }

        const family = await getFamilyProfile(currentUser)
        if (cancelled) {
          return
        }

        setFamilyProfile(family)
        setProfileDraft(createDraftFromProfile(family, currentUser.parentName, isBirthInvitation))

        if (isBirthInvitation || family.children.length > 0) {
          const request = await getMyMembershipRequest(currentInvitation.id, currentUser)
          if (cancelled) {
            return
          }

          setMembershipRequest(request)
          setSelectedChildIds(
            request ? request.children.map((child) => child.id) : family.children.map((child) => child.id),
          )
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
          setProfileDraft(createEmptyDraft(currentUser?.parentName ?? '', isBirthInvitation))
        } else if (isApiError(caughtError, 401)) {
          if (currentUser) {
            logout()
          }
          writeStoredHostToken(null)
          setHostToken("")
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
  }, [invitation, user, hasHostSession, logout, isBirthInvitation])

  useEffect(() => {
    const canPollChat = Boolean(
      invitation &&
        !loadingPrivateState &&
        ((showHostStudio && hostAccordionOpen === 'chat') || (!isHost && hasPrivateAccess && guestChatOpen)),
    )

    if (!canPollChat) {
      return
    }

    const identity = user ?? undefined
    let disposed = false

    const run = async (silent = false) => {
      if (disposed) {
        return
      }
      await refreshChat(identity, { silent })
    }

    void run(false)

    const intervalId = window.setInterval(() => {
      void run(true)
    }, 5_000)

    return () => {
      disposed = true
      window.clearInterval(intervalId)
    }
  }, [guestChatOpen, hasPrivateAccess, hostAccordionOpen, invitation, isHost, loadingPrivateState, showHostStudio, user])

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
    // OTP verification is handled inside GuestInvitationModal — sessionLogin() already called
    setAuthError('')
  }

  const handleUserLogout = () => {
    logout()
    setAuthError('')
    setProfileError('')
    setRequestError('')
    setHostError('')
    setWishlistError('')
    setChatMessages([])
    setChatError('')
    setChatDraft('')
    setGuestChatOpen(false)
    setWishlistFormError('')
    setGuestModalOpen(false)
  }

  const handleHostLogout = () => {
    writeStoredHostToken(null)
    setHostToken("")
    setAccess(null)
    setHostRequests([])
    setWishlistItems([])
    setChatMessages([])
    setChatError('')
    setChatDraft('')
    setGuestChatOpen(false)
    setRsvp(null)
    setMembershipRequest(null)
    setFamilyProfile(null)
  }

  const handleSendChatMessage = async () => {
    if (!invitation || (!isHost && !hasPrivateAccess)) {
      return
    }

    const message = chatDraft.trim()

    if (!message) {
      setChatError('Upiši poruku prije slanja.')
      return
    }

    if (message.length > 500) {
      setChatError('Poruka može imati najviše 500 znakova.')
      return
    }

    setSendingChatMessage(true)
    setChatError('')

    try {
      await createInvitationChatMessage(invitation.id, { message }, user ?? undefined)
      setChatDraft('')
      await refreshChat(user ?? undefined)
    } catch (caughtError) {
      setChatError(
        isApiError(caughtError, 400)
          ? 'Poruka nije valjana. Provjeri unos i pokušaj ponovno.'
          : isApiError(caughtError, 403)
            ? 'Nemaš pristup live chatu za ovu pozivnicu.'
            : 'Slanje poruke trenutno nije uspjelo.',
      )
    } finally {
      setSendingChatMessage(false)
    }
  }

  const handleHostInvitationSave = async () => {
    if (!invitation || (!user && !hasHostSession)) {
      return
    }

    if (
      !hostEditorDraft.title.trim() ||
      !hostEditorDraft.date.trim() ||
      !hostEditorDraft.time.trim() ||
      !hostEditorDraft.timeEnd.trim() ||
      !hostEditorDraft.locationName.trim()
    ) {
      setHostUpdateError('Upiši naslov, datum, vrijeme od-do i naziv lokacije.')
      return
    }

    if (hostEditorDraft.timeEnd <= hostEditorDraft.time) {
      setHostUpdateError('Vrijeme završetka mora biti nakon vremena početka.')
      return
    }

    setSavingHostInvitation(true)
    setHostUpdateError('')
    setHostUpdateNotice('')

    try {
      const updatedInvitation = await updateInvitation(
        invitation.id,
        buildInvitationUpdatePayload(hostEditorDraft, hostPartyDetailsDraft),
        user ?? null,
        invitation,
      )
      setInvitation(updatedInvitation)
      setHostUpdateNotice('Pozivnica je ažurirana.')
    } catch (caughtError) {
      setHostUpdateError('Spremanje promjena trenutno nije uspjelo.')
    } finally {
      setSavingHostInvitation(false)
    }
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

    if (!user || !parentName || (!isBirthInvitation && children.length === 0)) {
      setProfileError(isBirthInvitation ? 'Upiši ime i prezime ili nadimak.' : 'Upiši ime roditelja i barem jedno dijete.')
      return
    }

    setSavingProfile(true)
    setProfileError("")

    try {
      const payload: FamilyProfilePayload = { parentName, children: isBirthInvitation ? [] : children }
      const nextProfile = hasFamilyProfile
        ? await updateFamilyProfile(payload, user)
        : await createFamilyProfile(payload, user)

      setFamilyProfile(nextProfile)
      setProfileDraft(createDraftFromProfile(nextProfile, user.parentName, isBirthInvitation))
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
    if (!user || !invitation || (!isBirthInvitation && selectedChildIds.length === 0)) {
      setRequestError(
        isBirthInvitation
          ? 'Prijavi se i dovrši svoje podatke prije slanja zahtjeva.'
          : 'Odaberi barem jedno dijete prije slanja zahtjeva.',
      )
      return
    }

    setSubmittingRequest(true)
    setRequestError('')

    try {
      const request = await createMembershipRequest(invitation.id, isBirthInvitation ? [] : selectedChildIds, user)
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
      const identity = user ?? undefined
      if (editingWishlistItemId) {
        await updateInvitationWishlistItem(invitation.id, editingWishlistItemId, payload, identity)
      } else {
        await createInvitationWishlistItem(invitation.id, payload, identity)
      }
      resetWishlistForm()
      await refreshWishlist(identity)
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
    if (!invitation || (!user && !hasHostSession)) {
      return
    }

    setWishlistActionId(item.id)
    setWishlistError('')

    try {
      const identity = user ?? undefined
      await deleteInvitationWishlistItem(invitation.id, item.id, identity)
      if (editingWishlistItemId === item.id) {
        resetWishlistForm()
      }
      await refreshWishlist(identity)
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
      const identity = user ?? undefined
      await cancelInvitationWishlistReservation(invitation.id, item.id, identity)
      await refreshWishlist(identity)
    } catch {
      setWishlistError('Otpuštanje rezervacije trenutno nije uspjelo.')
    } finally {
      setWishlistActionId(null)
    }
  }

  const renderHostEditorPanel = () => {
    const closeHostEditorPanel = () => {
      setHostEditorShortcut(null)
    }

    const cancelHostDateTime = () => {
      const snap = hostDateTimeSnapshotRef.current
      if (snap) {
        updateHostField('date', snap.date)
        updateHostField('time', snap.time)
        updateHostField('timeEnd', snap.timeEnd)
      }
      closeHostEditorPanel()
    }

    const cancelHostLocation = () => {
      const snap = hostLocationSnapshotRef.current
      if (snap) {
        updateHostField('locationName', snap.locationName)
        updateHostField('locationAddress', snap.locationAddress)
        updateHostField('locationType', snap.locationType as InvitationCreateDraft['locationType'])
      }
      closeHostEditorPanel()
    }

    switch (hostEditorShortcut) {
      case 'dateTime':
        return (
          <FloatingEditPanel
            open
            title="Datum i vrijeme"
            description="Brzi picker za osnovne informacije koje gost vidi prve."
            onClose={closeHostEditorPanel}
            footer={
              <div className="pb-floatingPanel__footerActions">
                <button type="button" className="pb-btn pb-btn-ghost pb-floatingPanel__footerBtn" onClick={cancelHostDateTime}>Poništi</button>
                <button type="button" className="pb-btn pb-btn-primary pb-floatingPanel__footerBtn" onClick={closeHostEditorPanel}>Potvrdi</button>
              </div>
            }
          >
            <QuickDateTimeEditor draft={hostEditorDraft} today={today} onFieldChange={updateHostField} />
          </FloatingEditPanel>
        )
      case 'location':
        return (
          <FloatingEditPanel
            open
            title="Lokacija"
            description="Naziv lokacije i dodatni detalji dolaska."
            onClose={closeHostEditorPanel}
            footer={
              <div className="pb-floatingPanel__footerActions">
                <button type="button" className="pb-btn pb-btn-ghost pb-floatingPanel__footerBtn" onClick={cancelHostLocation}>Poništi</button>
                <button type="button" className="pb-btn pb-btn-primary pb-floatingPanel__footerBtn" onClick={closeHostEditorPanel}>Potvrdi</button>
              </div>
            }
          >
            <QuickLocationEditor draft={hostEditorDraft} onFieldChange={updateHostField} />
          </FloatingEditPanel>
        )
      case 'theme':
        return (
          <FloatingEditPanel
            open
            title="Tema"
            onClose={closeHostEditorPanel}
          >
            <QuickThemeEditor
              draft={hostEditorDraft}
              onThemeChange={(value) => {
                updateHostField('theme', value)
                closeHostEditorPanel()
              }}
            />
          </FloatingEditPanel>
        )
      case 'rsvp':
        return (
          <FloatingEditPanel
            open
            title="RSVP ikone"
            description="Odaberi set ikona za potvrdu dolaska."
            onClose={closeHostEditorPanel}
          >
            <QuickRSVPEditor
              draft={hostEditorDraft}
              onFieldChange={(field, value) => {
                updateHostField(field, value)
                if (field === 'rsvpMood') {
                  closeHostEditorPanel()
                }
              }}
            />
          </FloatingEditPanel>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Navbar opaque />
      <main className="pb-main pb-main--demo pb-invitePage">
        <div className="pb-invitePage__blobs" aria-hidden>
          <span className="pb-invitePage__blob pb-invitePage__blob--1" />
          <span className="pb-invitePage__blob pb-invitePage__blob--2" />
          <span className="pb-invitePage__blob pb-invitePage__blob--3" />
        </div>
        <div className="pb-container pb-flowLayout">
          {loading ? (
            <Card className="pb-flowCard">
              <h1 className="pb-flowCard__title">Učitavamo pozivnicu...</h1>
              <p className="pb-flowCard__text">Dohvaćamo javne podatke s VidimoSe.hr backend API-ja.</p>
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
              {user && !showHostStudio ? (
                <div className="pb-inviteSessionBar">
                  <span className="pb-inviteSessionBar__text">
                    {isHost ? `Organizator: ${user.email}` : `Gost: ${user.parentName || user.email}`}
                  </span>
                  <Button variant="ghost" onClick={handleUserLogout}>
                    Odjavi se
                  </Button>
                </div>
              ) : null}

              {!user && hasHostSession && !showHostStudio ? (
                <div className="pb-inviteSessionBar">
                  <span className="pb-inviteSessionBar__text">Organizator: host pristup aktivan</span>
                  <Button variant="ghost" onClick={handleHostLogout}>
                    Odjavi host pristup
                  </Button>
                </div>
              ) : null}

              {user && !isHost && membershipRequest?.status === 'pending' ? (
                <Card className="pb-flowCard">
                  <h2 className="pb-flowCard__title">Čekanje na odobrenje organizatora…</h2>
                  <p className="pb-flowCard__text">
                    Zahtjev za pristup privatnom dijelu je poslan. Pozivnica će se automatski otključati kad organizator odobri ili odbije zahtjev.
                  </p>
                </Card>
              ) : null}

              {(!isHost || loadingPrivateState) && !(user && !loadingPrivateState && hasPrivateAccess && !isHost) ? (
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
              ) : null}

              {(user || hasHostSession) && loadingPrivateState ? (
                <Card className="pb-flowCard">
                  <h2 className="pb-flowCard__title">Pripremamo tvoj pristup</h2>
                  <p className="pb-flowCard__text">Provjeravamo profil obitelji, zahtjev za pristup i status odgovora.</p>
                </Card>
              ) : null}

              {user && !loadingPrivateState && hasPrivateAccess && !isHost ? (
                <div className="pb-guestPrivateLayout" aria-label="Privatni dio pozivnice">
                  <div className="pb-guestPrivateLayout__left">
                    <PrivateInvitationGuest
                      invitation={invitation}
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
                      chatOpen={guestChatOpen}
                      onToggleChatOpen={() => setGuestChatOpen((current) => !current)}
                      chatLoading={chatLoading}
                      chatError={chatError}
                      chatMessages={chatMessages}
                      chatDraft={chatDraft}
                      onChatDraftChange={setChatDraft}
                      sendingChatMessage={sendingChatMessage}
                      onSendChatMessage={handleSendChatMessage}
                    />
                  </div>
                  <div className="pb-guestPrivateLayout__right">
                    <InvitationCard
                      invitation={invitation}
                      access="private"
                      isHost={false}
                      rsvp={rsvp?.status ?? null}
                      canSubmitRsvp={canSubmitRsvp}
                      onRsvpChange={canSubmitRsvp ? handleRsvpChange : undefined}
                      onGuestRsvpIntent={handleGuestRsvpIntent}
                      guestRsvpHint={guestRsvpHint}
                    />
                  </div>
                </div>
              ) : null}

              <GuestInvitationModal
                open={guestModalOpen && guestModalStep !== null}
                onClose={() => setGuestModalOpen(false)}
                step={guestModalStep ?? 'login'}
                isBirthInvitation={isBirthInvitation}
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

              {showHostStudio ? (
                <div className="pb-hostStudioShell">
                  <div className="pb-inviteSessionBar pb-inviteSessionBar--host">
                    <span className="pb-inviteSessionBar__text">
                      {user ? `Organizator: ${user.email}` : 'Organizator: host pristup aktivan'}
                    </span>
                    <Button variant="ghost" onClick={user ? handleUserLogout : handleHostLogout}>
                      {user ? 'Odjavi se' : 'Odjavi host pristup'}
                    </Button>
                  </div>

                  <div className="pb-hostStudio">
                  <div className="pb-invitePrivateStack pb-invitePrivateStack--host pb-hostStudio__cards">
                  <Card id="host-update-card" className="pb-flowCard pb-invitePrivateCard pb-invitePrivateCard--accordion pb-inviteHostPanel">
                    <button
                      id="host-update-toggle"
                      type="button"
                      className={`pb-privateToggle ${hostAccordionOpen === 'update' ? 'is-open' : ''}`}
                      onClick={() => toggleHostAccordion('update')}
                      aria-expanded={hostAccordionOpen === 'update'}
                    >
                      <span className="pb-privateToggle__copy">
                        <span className="pb-privateToggle__eyebrow">Organizator</span>
                        <span className="pb-privateToggle__title">Ažuriraj pozivnicu</span>
                      </span>
                      <span className="pb-privateToggle__arrow" aria-hidden>
                        <PrivateToggleChevron />
                      </span>
                    </button>

                    {hostAccordionOpen === 'update' ? (
                      <div className="pb-privateAccordionBody">
                        <p className="pb-flowCard__text">
                          Isti editor kao kod izrade pozivnice, samo bez desnog previewa. Ovdje uređuješ naslov, temu,
                          datum i lokaciju.
                        </p>

                        <div className="pb-hostUpdateEditor">
                          <InvitationMainEditor
                            draft={hostEditorDraft}
                            onFieldChange={updateHostField}
                            onOpenShortcut={openHostEditorShortcut}
                            hideWishlistCard
                            activeShortcut={hostEditorShortcut}
                          />
                        </div>

                        <div className="pb-hostEditorActions">
                          <div className="pb-hostAutosaveRow" aria-label="Lokalno spremanje promjena">
                            <span className="pb-hostAutosaveLabel">{hostAutosaveLabel}</span>
                            <Button type="button" variant="ghost" onClick={handleHostResetLocalChanges}>
                              Resetiraj promjene
                            </Button>
                          </div>
                          <Button type="button" variant="amber" onClick={handleHostInvitationSave} disabled={savingHostInvitation}>
                            {savingHostInvitation ? 'Spremamo...' : 'Spremi promjene'}
                          </Button>
                        </div>

                        {hostUpdateError ? <div className="pb-inlineNote pb-inlineNote--error">{hostUpdateError}</div> : null}
                        {hostUpdateNotice ? <div className="pb-inlineNote pb-inlineNote--info">{hostUpdateNotice}</div> : null}
                      </div>
                    ) : null}
                  </Card>

                  <Card id="host-details-card" className="pb-flowCard pb-invitePrivateCard pb-invitePrivateCard--accordion pb-inviteHostPanel">
                    <button
                      id="host-details-toggle"
                      type="button"
                      className={`pb-privateToggle ${hostAccordionOpen === 'details' ? 'is-open' : ''}`}
                      onClick={() => toggleHostAccordion('details')}
                      aria-expanded={hostAccordionOpen === 'details'}
                    >
                      <span className="pb-privateToggle__copy">
                        <span className="pb-privateToggle__eyebrow">Organizator</span>
                        <span className="pb-privateToggle__title">Detalji tuluma</span>
                      </span>
                      <span className="pb-privateToggle__arrow" aria-hidden>
                        <PrivateToggleChevron />
                      </span>
                    </button>

                    {hostAccordionOpen === 'details' ? (
                      <div className="pb-privateAccordionBody">
                        <section
                          className="pb-privateDetails pb-hostDetailsEditor pb-hostDetailsEditor--matchTitle"
                          aria-labelledby="host-party-details-title"
                          style={
                            {
                              ['--pb-host-details-fg' as string]: getTitleColorValue(
                                normalizeTitleColor(hostEditorDraft.titleColor),
                              ),
                            } as CSSProperties
                          }
                        >
                          <header className="pb-invitePrivateCard__header">
                            <h3 id="host-party-details-title" className="pb-invitePrivateCard__title">
                              Detalji tuluma
                            </h3>
                            <p className="pb-invitePrivateCard__subtitle">
                              Ovo se prikazuje gostima u privatnom dijelu pozivnice.
                            </p>
                          </header>

                          <div className="pb-formGrid">
                            <label className="pb-formField">
                              <span className="pb-formLabel">Lokacija parkinga</span>
                              <input
                                className="pb-input"
                                type="text"
                                value={hostPartyDetailsDraft.parkingLocation}
                                onChange={(event) => updateHostPartyDetails('parkingLocation', event.target.value)}
                                placeholder="npr. parking iza igraonice, ulaz iz Lastovske"
                              />
                            </label>

                            <label className="pb-formField">
                              <span className="pb-formLabel">Lokacija kafića</span>
                              <input
                                className="pb-input"
                                type="text"
                                value={hostPartyDetailsDraft.cafeLocation}
                                onChange={(event) => updateHostPartyDetails('cafeLocation', event.target.value)}
                                placeholder="npr. roditelji mogu pričekati u obližnjem kafiću"
                              />
                            </label>

                            <label className="pb-formField pb-hostDetailsEditor__field--wide">
                              <span className="pb-formLabel">Ostali detalji po želji</span>
                              <textarea
                                className="pb-input pb-hostDetailsEditor__textarea"
                                value={hostPartyDetailsDraft.extraDetails}
                                onChange={(event) => updateHostPartyDetails('extraDetails', event.target.value)}
                                placeholder="npr. ulaz na bočna vrata, ponesite čarape, roditelji dolaze 15 min prije završetka..."
                              />
                            </label>

                            <label className="pb-formField pb-hostDetailsEditor__field--wide">
                              <span className="pb-formLabel">Kontakt mobitel</span>
                              <input
                                className="pb-input"
                                type="text"
                                value={hostPartyDetailsDraft.contactMobile}
                                onChange={(event) => updateHostPartyDetails('contactMobile', event.target.value)}
                                placeholder="npr. +385 99 123 4567"
                                inputMode="tel"
                                autoComplete="tel"
                              />
                            </label>

                            <label className="pb-formField pb-hostDetailsEditor__field--wide">
                              <span className="pb-formLabel">Ime kontakta</span>
                              <input
                                className="pb-input"
                                type="text"
                                value={hostPartyDetailsDraft.contactName}
                                onChange={(event) => updateHostPartyDetails('contactName', event.target.value)}
                                placeholder="npr. Ana"
                                autoComplete="name"
                              />
                            </label>
                          </div>

                          <div className="pb-partyFacts">
                            {hostPartyDetailsDraft.parkingLocation.trim() ? (
                              <div className="pb-partyFact">
                                <div className="pb-partyFact__label">Parking</div>
                                <div className="pb-partyFact__value">{hostPartyDetailsDraft.parkingLocation.trim()}</div>
                              </div>
                            ) : null}
                            {hostPartyDetailsDraft.cafeLocation.trim() ? (
                              <div className="pb-partyFact">
                                <div className="pb-partyFact__label">Kafić</div>
                                <div className="pb-partyFact__value">{hostPartyDetailsDraft.cafeLocation.trim()}</div>
                              </div>
                            ) : null}
                            {hostPartyDetailsDraft.extraDetails.trim() ? (
                              <div className="pb-partyFact">
                                <div className="pb-partyFact__label">Ostali detalji</div>
                                <div className="pb-partyFact__value">{hostPartyDetailsDraft.extraDetails.trim()}</div>
                              </div>
                            ) : null}
                            {hostPartyDetailsDraft.contactMobile.trim() ? (
                              <div className="pb-partyFact">
                                <div className="pb-partyFact__label">Kontakt mobitel</div>
                                <div className="pb-partyFact__value">{hostPartyDetailsDraft.contactMobile.trim()}</div>
                              </div>
                            ) : null}
                            {hostPartyDetailsDraft.contactName.trim() ? (
                              <div className="pb-partyFact">
                                <div className="pb-partyFact__label">Ime kontakta</div>
                                <div className="pb-partyFact__value">{hostPartyDetailsDraft.contactName.trim()}</div>
                              </div>
                            ) : null}
                          </div>

                          <div className="pb-hostEditorActions">
                            <Button type="button" variant="amber" onClick={handleHostInvitationSave} disabled={savingHostInvitation}>
                              {savingHostInvitation ? 'Spremamo...' : 'Spremi detalje'}
                            </Button>
                          </div>

                          {hostUpdateError ? <div className="pb-inlineNote pb-inlineNote--error">{hostUpdateError}</div> : null}
                          {hostUpdateNotice ? <div className="pb-inlineNote pb-inlineNote--info">{hostUpdateNotice}</div> : null}
                        </section>
                      </div>
                    ) : null}
                  </Card>

                  <Card id="host-requests-card" className="pb-flowCard pb-invitePrivateCard pb-invitePrivateCard--accordion pb-inviteHostPanel">
                    <button
                      id="host-requests-toggle"
                      type="button"
                      className={`pb-privateToggle ${hostAccordionOpen === 'requests' ? 'is-open' : ''}`}
                      onClick={() => toggleHostAccordion('requests')}
                      aria-expanded={hostAccordionOpen === 'requests'}
                    >
                      <span className="pb-privateToggle__copy">
                        <span className="pb-privateToggle__eyebrow">Organizator</span>
                        <span className="pb-privateToggle__title">Zahtjevi za pristup</span>
                      </span>
                      <span className="pb-privateToggle__arrow" aria-hidden>
                        <PrivateToggleChevron />
                      </span>
                    </button>

                    {hostAccordionOpen === 'requests' ? (
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

                  <Card id="host-wishlist-card" className="pb-flowCard pb-invitePrivateCard pb-invitePrivateCard--accordion pb-inviteHostPanel">
                    <button
                      id="host-wishlist-toggle"
                      type="button"
                      className={`pb-privateToggle ${hostAccordionOpen === 'wishlist' ? 'is-open' : ''}`}
                      onClick={() => toggleHostAccordion('wishlist')}
                      aria-expanded={hostAccordionOpen === 'wishlist'}
                    >
                      <span className="pb-privateToggle__copy">
                        <span className="pb-privateToggle__eyebrow">Organizator</span>
                        <span className="pb-privateToggle__title">Lista želja</span>
                      </span>
                      <span className="pb-privateToggle__arrow" aria-hidden>
                        <PrivateToggleChevron />
                      </span>
                    </button>

                    {hostAccordionOpen === 'wishlist' ? (
                      <div className="pb-privateAccordionBody">
                        <p className="pb-flowCard__text pb-flowCard__text--hostWishlist">
                          Dodaj, uredi i organiziraj želje za poklone. Ovdje vidiš i tko je što rezervirao.
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
                              <PrivateToggleChevron />
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
                              openHostAccordion('wishlist')
                              setHostAddGiftOpen(true)
                            }}
                            onDelete={handleWishlistDelete}
                            onReleaseReservation={handleHostReleaseReservation}
                          />
                        ) : null}

                        <div className="pb-flowActions pb-flowActions--modal">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              resetWishlistForm()
                              setHostAddGiftOpen(true)
                            }}
                          >
                            Dodaj poklon
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </Card>

                  <Card id="host-chat-card" className="pb-flowCard pb-invitePrivateCard pb-invitePrivateCard--accordion pb-inviteHostPanel">
                    <button
                      id="host-chat-toggle"
                      type="button"
                      className={`pb-privateToggle ${hostAccordionOpen === 'chat' ? 'is-open' : ''}`}
                      onClick={() => toggleHostAccordion('chat')}
                      aria-expanded={hostAccordionOpen === 'chat'}
                    >
                      <span className="pb-privateToggle__copy">
                        <span className="pb-privateToggle__eyebrow">Organizator</span>
                        <span className="pb-privateToggle__title">Live chat</span>
                      </span>
                      <span className="pb-privateToggle__arrow" aria-hidden>
                        <PrivateToggleChevron />
                      </span>
                    </button>

                    {hostAccordionOpen === 'chat' ? (
                      <div className="pb-privateAccordionBody">
                        <InvitationLiveChatPanel
                          messages={chatMessages}
                          loading={chatLoading}
                          error={chatError}
                          draft={chatDraft}
                          sending={sendingChatMessage}
                          onDraftChange={setChatDraft}
                          onSend={handleSendChatMessage}
                        />
                      </div>
                    ) : null}
                  </Card>
                  </div>

                  <div className="pb-hostStudio__previewRail">
                  <div className="pb-hostStudio__previewColumn">
                    <div className="pb-hostPreviewMode" role="tablist" aria-label="Način pregleda pozivnice">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={hostPreviewMode === 'guest'}
                        className={`pb-hostPreviewMode__btn ${hostPreviewMode === 'guest' ? 'is-active' : ''}`}
                        onClick={() => setHostPreviewMode('guest')}
                      >
                        Gost pregled
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={hostPreviewMode === 'print'}
                        className={`pb-hostPreviewMode__btn ${hostPreviewMode === 'print' ? 'is-active' : ''}`}
                        onClick={() => setHostPreviewMode('print')}
                      >
                        Print pregled
                      </button>
                    </div>
                    {hostPreviewMode === 'print' ? (
                      <div className="pb-hostPrintToolbar">
                        <Button type="button" variant="primary" onClick={handleHostPrintInvite}>
                          Print pozivnice
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => void handleHostExportJpg()}>
                          Izvezi u JPG
                        </Button>
                        {hostJpgExportMessage ? (
                          <p className="pb-hostPrintToolbar__hint" role="status">
                            {hostJpgExportMessage}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    <div id="host-live-preview" ref={hostPrintCardRef} className="pb-hostStudio__previewCluster">
                      <div className="pb-hostStudio__preview">
                        <div className="pb-hostScreenPrintPreview">
                          <InvitationLivePreview
                            draft={hostEditorDraft}
                            previewMode={hostPreviewMode}
                            partyDetails={hostPartyDetailsDraft}
                            inviteUrl={guestPageShareUrl || null}
                          />
                        </div>

                        {hostPreviewMode === 'print' ? (
                          <div className="pb-hostPrintOnlySheet" aria-label="A4 ispis (4 pozivnice)">
                            {Array.from({ length: 4 }).map((_, index) => (
                              <div key={index} className="pb-hostPrintOnlySheet__item">
                                <InvitationLivePreview
                                  draft={hostEditorDraft}
                                  previewMode="print"
                                  partyDetails={hostPartyDetailsDraft}
                                  inviteUrl={guestPageShareUrl || null}
                                />
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="pb-hostStudio__rail">
                    <ShortcutRail
                      items={HOST_SHORTCUT_ITEMS}
                      activeShortcut={hostShortcutActive}
                      onShortcutClick={(id) => handleHostShortcutClick(id as HostShortcutId)}
                    />
                  </div>
                  </div>
                </div>
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
              {renderHostEditorPanel()}
            </>
          ) : null}
        </div>
      </main>

      {hostShareDialogOpen && invitation ? (
        <div
          className="pb-modalOverlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeHostShareDialog()
            }
          }}
        >
          <div className="pb-modalDialog pb-hostShareDialog" role="dialog" aria-modal="true" aria-labelledby="host-share-dialog-title">
            <div className="pb-modalDialog__head">
              <h2 id="host-share-dialog-title" className="pb-modalDialog__title">
                Podijeli pozivnicu
              </h2>
              <button type="button" className="pb-modalDialog__close" onClick={closeHostShareDialog} aria-label="Zatvori">
                ×
              </button>
            </div>
            <div className="pb-modalDialog__body">
              <p className="pb-modalDialog__lead">Poveznica za gost prikaz (web pozivnica).</p>
              <label className="pb-formField">
                <span className="pb-formLabel">Link</span>
                <input
                  className="pb-input"
                  readOnly
                  value={guestPageShareUrl}
                  onFocus={(event) => event.currentTarget.select()}
                />
              </label>
              <div className="pb-flowActions pb-hostShareDialog__actions">
                <Button type="button" variant="primary" onClick={() => void handleCopyGuestInviteLink()}>
                  {hostShareCopyDone ? 'Kopirano' : 'Kopiraj link'}
                </Button>
                {guestWhatsAppShareHref ? (
                  <a className="pb-btn pb-btn-ghost" href={guestWhatsAppShareHref} target="_blank" rel="noreferrer">
                    WhatsApp
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Footer />
    </>
  )
}

function isValidWishlistUrl(value: string) {
  if (!value.trim()) return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function WishlistLinkPreview({ meta }: { meta: WishlistLinkMeta }) {
  const [imgOk, setImgOk] = useState(true)
  const hasOgImage = !!meta.image
  const showImage = hasOgImage && imgOk

  if (!meta.image && !meta.favicon && !meta.domain) return null

  return (
    <div className={`pb-quickEditor__linkPreview${showImage ? ' pb-quickEditor__linkPreview--rich' : ''}`}>
      {showImage ? (
        <img
          className="pb-quickEditor__linkOgImage"
          src={proxyImageUrl(meta.image!)}
          alt=""
          aria-hidden="true"
          onError={() => setImgOk(false)}
        />
      ) : null}
      <div className="pb-quickEditor__linkBar">
        {meta.favicon ? (
          <img
            className="pb-quickEditor__linkFavicon"
            src={proxyImageUrl(meta.favicon)}
            alt=""
            aria-hidden="true"
            onError={(event) => { (event.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : null}
        <div className="pb-quickEditor__linkMeta">
          {meta.title ? <span className="pb-quickEditor__linkTitle">{meta.title}</span> : null}
          {meta.domain ? <span className="pb-quickEditor__linkDomain">{meta.domain}</span> : null}
        </div>
      </div>
    </div>
  )
}

function WishlistForm({ draft, error, saving, isEditing, onChange, onSave, onCancel }: { draft: WishlistDraft; error: string; saving: boolean; isEditing: boolean; onChange: (draft: WishlistDraft) => void; onSave: () => void; onCancel: () => void }) {
  const [fetchingLinkMeta, setFetchingLinkMeta] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastFetchedUrlRef = useRef(draft.url)
  const latestDraftRef = useRef(draft)

  latestDraftRef.current = draft

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

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

  const handleUrlChange = (value: string) => {
    const nextDraft = { ...latestDraftRef.current, url: value }
    onChange(nextDraft)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!isValidWishlistUrl(value)) {
      lastFetchedUrlRef.current = ''
      setFetchingLinkMeta(false)
      if (latestDraftRef.current.linkMeta) {
        onChange({ ...nextDraft, linkMeta: undefined })
      }
      return
    }

    if (value === lastFetchedUrlRef.current && latestDraftRef.current.linkMeta) {
      return
    }

    setFetchingLinkMeta(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await unfurlLink(value)
        lastFetchedUrlRef.current = value
        const nextMeta = {
          title: result.title ?? undefined,
          image: result.image ?? undefined,
          domain: result.domain ?? undefined,
          favicon: result.favicon ?? undefined,
        }

        const currentDraft = latestDraftRef.current
        onChange({
          ...currentDraft,
          url: value,
          imageUrl: currentDraft.imageUrl.trim() || result.image || '',
          linkMeta: nextMeta,
        })
      } catch {
        onChange({ ...latestDraftRef.current, url: value, linkMeta: undefined })
      } finally {
        setFetchingLinkMeta(false)
      }
    }, 600)
  }

  return (
    <div className="pb-profileForm pb-inviteHostAddCard">
      <div className="pb-formGrid">
        <label className="pb-formField"><span className="pb-formLabel">Naziv poklona <span className="pb-formLabel__required">*</span></span><input className="pb-input" type="text" required aria-required="true" value={draft.title} onChange={(event) => onChange({ ...draft, title: event.target.value })} /></label>
        <label className="pb-formField"><span className="pb-formLabel">Opis</span><input className="pb-input" type="text" value={draft.description} onChange={(event) => onChange({ ...draft, description: event.target.value })} /></label>
        <div className="pb-formField">
          <span className="pb-formLabel">Link</span>
          {fetchingLinkMeta ? (
            <span className="pb-quickEditor__linkSpinner" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M8 1.5a6.5 6.5 0 1 1-4.6 1.9" />
              </svg>
            </span>
          ) : null}
          {!fetchingLinkMeta && draft.linkMeta ? <WishlistLinkPreview meta={draft.linkMeta} /> : null}
          <input className="pb-input" type="url" value={draft.url} onChange={(event) => handleUrlChange(event.target.value)} />
        </div>
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
    .filter(
      (item) =>
        item.reservation.reservedByUserId === request.userId ||
        Boolean(item.reservation.participants?.some((participant) => participant.userId === request.userId)),
    )
    .map((item) => ({
      id: item.id,
      title: item.title,
      details:
        item.reservation.reservedByUserId === request.userId
          ? item.reservation.note?.trim() ||
            (item.reservation.reservedForChildName ? `Za dijete: ${item.reservation.reservedForChildName}` : 'Kupuje poklon')
          : 'Sudjeluje u grupnom poklonu',
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
                    <div className="pb-hostRequestItem__headRow">
                      <div className="pb-hostRequestItem__title">{parentName}</div>
                      <div className="pb-hostRequestItem__children">Djeca: {childrenText}</div>
                    </div>
                    {canOpenDetails ? (
                      <div className="pb-hostRequestItem__meta">
                        {giftCount > 0 ? `Pokloni: ${giftCount}` : 'Klikni za detalje gosta'}
                      </div>
                    ) : null}

                    <div className="pb-hostRequestItem__footerRow">
                      {request.status === 'pending' ? (
                        <div className="pb-flowActions pb-flowActions--compact pb-hostRequestItem__actions">
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
                      ) : (
                        <span />
                      )}

                      <div className={`pb-hostRequestItem__rsvpBadge ${rsvpToneClass}`}>
                        <span className="pb-hostRequestItem__rsvpLabel">RSVP</span>
                        <span className="pb-hostRequestItem__rsvpValue">{rsvpLabel}</span>
                      </div>
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


