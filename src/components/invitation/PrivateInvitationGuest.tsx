import { useEffect, useMemo, useState, type ChangeEvent } from 'react'

// import { InvitationGuestRosterList, InvitationGuestRosterModal } from './InvitationGuestRoster'
import InvitationLiveChatPanel, { type ChatSenderLabelHint } from './InvitationLiveChatPanel'
import WishlistTipPaymentSection from './WishlistTipPaymentSection'
import Button from '../ui/Button'
import PrivateToggleChevron from '../ui/PrivateToggleChevron'
import PrivateToggleSectionCounts from '../ui/PrivateToggleSectionCounts'
import { findVenueByInvitationLocation } from '../../lib/findVenueByInvitationLocation'
import {
  countUnreadChatForGuest,
  countUnreadWishlistForGuest,
  ensurePrivateSectionBaseline,
  getPrivateSectionReadAt,
  setPrivateSectionReadAt,
} from '../../lib/privateSectionUnread'
import type {
  InvitationChatMessage,
  InvitationChatRead,
  InvitationWishlistItem,
  InvitationWishlistPayload,
  MembershipRequest,
  PublicInvitation,
} from '../../lib/invitationApi'

type Props = {
  invitation: PublicInvitation
  guestRosterRequests: MembershipRequest[]
  guestRosterError?: string
  wishlistLoading: boolean
  wishlistError: string
  wishlistItems: InvitationWishlistItem[]
  wishlistActionId: string | null
  currentGuestName: string | null
  onReserve: (item: InvitationWishlistItem) => void
  onParticipate: (item: InvitationWishlistItem) => void
  onCancel: (item: InvitationWishlistItem) => void
  onAddWishlistItem: (payload: InvitationWishlistPayload) => void
  onDeleteWishlistItem: (item: InvitationWishlistItem) => void
  savingWishlistItem: boolean
  savingRsvp: boolean
  requestError: string
  chatOpen: boolean
  onToggleChatOpen: () => void
  chatLoading: boolean
  chatError: string
  chatMessages: InvitationChatMessage[]
  chatReads: InvitationChatRead[]
  chatDraft: string
  onChatDraftChange: (value: string) => void
  sendingChatMessage: boolean
  onSendChatMessage: () => void
  chatSenderLabelHint?: ChatSenderLabelHint
  /** Rođendanska pozivnica — bez bloka „Više o igraonici”. */
  isBirthInvitation?: boolean
}

function wishlistBadgeClass(status: InvitationWishlistItem['reservation']['status']) {
  if (status === 'available') return 'pb-inviteWish__status pb-inviteWish__status--available'
  if (status === 'reserved_by_you') return 'pb-inviteWish__status pb-inviteWish__status--you'
  if (status === 'reserved') return 'pb-inviteWish__status pb-inviteWish__status--reserved'
  return 'pb-inviteWish__status pb-inviteWish__status--neutral'
}

function wishlistBadgeLabel(status: InvitationWishlistItem['reservation']['status']) {
  if (status === 'available') return 'Dostupno'
  if (status === 'reserved_by_you') return 'Kupljeno'
  if (status === 'reserved') return 'Rezervirano'
  return 'Na listi'
}

function isOrganizerGroupGift(item: InvitationWishlistItem) {
  return item.isGroupGift === true
}

function hasMultipleWishlistParticipants(item: InvitationWishlistItem) {
  return (item.reservation.participants?.length ?? 0) > 1
}

function isGroupGiftDisplay(item: InvitationWishlistItem) {
  return isOrganizerGroupGift(item) || hasMultipleWishlistParticipants(item)
}

function getWishModalStatusLabel(item: InvitationWishlistItem) {
  if (isGroupGiftDisplay(item)) {
    return 'Grupni poklon'
  }

  return wishlistBadgeLabel(item.reservation.status)
}

function getWishCardStatusLabel(item: InvitationWishlistItem) {
  if (isGroupGiftDisplay(item)) {
    return 'Grupni poklon'
  }

  return wishlistBadgeLabel(item.reservation.status)
}

function wishlistPurchaseLabel(item: InvitationWishlistItem) {
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

function resolveWishlistImageUrl(item: InvitationWishlistItem) {
  if (item.imageUrl) {
    return item.imageUrl
  }

  if (item.title.toLowerCase().includes('lille')) {
    return '/lille.jpg'
  }

  if (item.title.toLowerCase().includes('zana')) {
    return '/zana.jpg'
  }

  return null
}

type GuestPartyDetailRow = {
  label: string
  value: string
  spanFull?: boolean
  kind?: 'text' | 'phone' | 'maps'
}

function phoneTelHref(value: string) {
  const normalized = value.replace(/[^\d+]/g, '')
  return normalized ? `tel:${normalized}` : ''
}

function googleMapsSearchUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

function renderPartyFactValue(row: GuestPartyDetailRow) {
  if (row.kind === 'phone') {
    const href = phoneTelHref(row.value)
    if (!href) {
      return row.value
    }
    return (
      <a href={href} className="pb-partyFact__link pb-partyFact__link--phone">
        {row.value}
      </a>
    )
  }

  if (row.kind === 'maps') {
    return (
      <a
        href={googleMapsSearchUrl(row.value)}
        className="pb-partyFact__link pb-partyFact__link--maps"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="pb-partyFact__mapsAddress">{row.value}</span>
        <span className="pb-partyFact__mapsHint">Otvori u Google Maps</span>
      </a>
    )
  }

  return row.value
}

export default function PrivateInvitationGuest({
  invitation,
  guestRosterRequests: _guestRosterRequests,
  guestRosterError: _guestRosterError = '',
  wishlistLoading,
  wishlistError,
  wishlistItems,
  wishlistActionId,
  currentGuestName,
  onReserve,
  onParticipate,
  onCancel,
  onAddWishlistItem,
  onDeleteWishlistItem,
  savingWishlistItem,
  savingRsvp,
  requestError,
  chatOpen,
  onToggleChatOpen,
  chatLoading,
  chatError,
  chatMessages,
  chatReads,
  chatDraft,
  onChatDraftChange,
  sendingChatMessage,
  onSendChatMessage,
  chatSenderLabelHint,
  isBirthInvitation = false,
}: Props) {
  const [venueOpen, setVenueOpen] = useState(false)
  // const [rosterOpen, setRosterOpen] = useState(false)
  // const [selectedRosterRequest, setSelectedRosterRequest] = useState<MembershipRequest | null>(null)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [addingGiftOpen, setAddingGiftOpen] = useState(false)
  const [giftTitle, setGiftTitle] = useState('')
  const [giftDescription, setGiftDescription] = useState('')
  const [giftPriceLabel, setGiftPriceLabel] = useState('')
  const [giftImageUrl, setGiftImageUrl] = useState<string | null>(null)
  const [giftImageName, setGiftImageName] = useState('')
  const [giftFormError, setGiftFormError] = useState('')
  const [selectedWishItem, setSelectedWishItem] = useState<InvitationWishlistItem | null>(null)
  const [selectedVenueImageIndex, setSelectedVenueImageIndex] = useState<number | null>(null)
  const [guestPrivateReadAt, setGuestPrivateReadAt] = useState<{ chat: number | null; wishlist: number | null }>({
    chat: null,
    wishlist: null,
  })

  useEffect(() => {
    if (!isBirthInvitation) {
      return
    }
    setVenueOpen(false)
    setSelectedVenueImageIndex(null)
  }, [isBirthInvitation])

  const resetGiftForm = () => {
    setGiftTitle('')
    setGiftDescription('')
    setGiftPriceLabel('')
    setGiftImageUrl(null)
    setGiftImageName('')
    setGiftFormError('')
    setAddingGiftOpen(false)
  }

  const handleGiftImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setGiftImageUrl(null)
      setGiftImageName('')
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

      setGiftFormError('')
      setGiftImageUrl(nextImageUrl)
      setGiftImageName(file.name)
    } catch {
      setGiftFormError('Učitavanje slike nije uspjelo.')
    }
  }

  const handleAddGift = () => {
    const title = giftTitle.trim()

    if (!title) {
      setGiftFormError('Upiši naziv poklona.')
      return
    }

    onAddWishlistItem({
      title,
      description: giftDescription.trim() || null,
      url: null,
      priceLabel: giftPriceLabel.trim() || null,
      imageUrl: giftImageUrl,
      priorityOrder: wishlistItems.length,
      isActive: true,
    })
    resetGiftForm()
  }

  useEffect(() => {
    const id = invitation.id
    ensurePrivateSectionBaseline('guest', 'chat', id)
    ensurePrivateSectionBaseline('guest', 'wishlist', id)
    setGuestPrivateReadAt({
      chat: getPrivateSectionReadAt('guest', 'chat', id),
      wishlist: getPrivateSectionReadAt('guest', 'wishlist', id),
    })
  }, [invitation.id])

  useEffect(() => {
    if (!wishlistOpen) return
    const now = Date.now()
    setPrivateSectionReadAt('guest', 'wishlist', invitation.id, now)
    setGuestPrivateReadAt((current) => ({ ...current, wishlist: now }))
  }, [wishlistOpen, invitation.id])

  useEffect(() => {
    if (!chatOpen) return
    const now = Date.now()
    setPrivateSectionReadAt('guest', 'chat', invitation.id, now)
    setGuestPrivateReadAt((current) => ({ ...current, chat: now }))
  }, [chatOpen, invitation.id])

  const guestChatUnreadCount = useMemo(
    () => countUnreadChatForGuest(chatMessages, guestPrivateReadAt.chat),
    [chatMessages, guestPrivateReadAt.chat],
  )
  const guestWishlistUnreadCount = useMemo(
    () => countUnreadWishlistForGuest(wishlistItems, guestPrivateReadAt.wishlist, currentGuestName),
    [wishlistItems, guestPrivateReadAt.wishlist, currentGuestName],
  )

  const guestWishlistTotalCount = wishlistItems.length
  const guestChatTotalCount = chatMessages.length

  const matchedVenue = useMemo(
    () => findVenueByInvitationLocation(invitation.location),
    [invitation.location],
  )

  const venueGallery = useMemo(() => {
    if (!matchedVenue) {
      return []
    }
    return [matchedVenue.coverPhoto, ...matchedVenue.photos].filter(Boolean)
  }, [matchedVenue])

  const venueDetailRows = useMemo(() => {
    if (!matchedVenue) {
      return []
    }

    return [
      { label: 'Grad', value: matchedVenue.city },
      { label: 'Adresa', value: matchedVenue.address },
      { label: 'Dob djece', value: matchedVenue.ageRange },
      { label: 'Cijena', value: `od ${matchedVenue.pricePerChild} € po djetetu` },
      {
        label: 'Sadržaj',
        value: matchedVenue.amenities.slice(0, 6).join(' · '),
        spanFull: true,
      },
    ].filter((row) => row.value.trim().length > 0)
  }, [matchedVenue])

  const selectedWishImageUrl = selectedWishItem ? resolveWishlistImageUrl(selectedWishItem) : null
  const selectedWishPurchaseLabel = selectedWishItem ? wishlistPurchaseLabel(selectedWishItem) : null
  const selectedVenueImageUrl =
    selectedVenueImageIndex !== null ? (venueGallery[selectedVenueImageIndex] ?? null) : null
  const selectedVenueImageNumber = selectedVenueImageIndex !== null ? selectedVenueImageIndex + 1 : 0
  const pd = invitation.partyDetails
  const guestPartyDetailRows = useMemo(() => {
    if (!pd) return []
    const rows: GuestPartyDetailRow[] = [
      { label: 'Ime kontakta', value: pd.contactName?.trim() ?? '' },
      { label: 'Kontakt mobitel', value: pd.contactMobile?.trim() ?? '', kind: 'phone' },
      { label: 'Lokacija parkinga', value: pd.parkingLocation?.trim() ?? '', kind: 'maps' },
      { label: 'Lokacija kafića', value: pd.cafeLocation?.trim() ?? '' },
      { label: 'Ostali detalji', value: pd.extraDetails?.trim() ?? '', spanFull: true },
    ]
    return rows.filter((row) => row.value.length > 0)
  }, [pd])

  const showPreviousVenueImage = () => {
    setSelectedVenueImageIndex((current) => {
      if (current === null || venueGallery.length === 0) return 0
      return current === 0 ? venueGallery.length - 1 : current - 1
    })
  }

  const showNextVenueImage = () => {
    setSelectedVenueImageIndex((current) => {
      if (current === null || venueGallery.length === 0) return 0
      return current === venueGallery.length - 1 ? 0 : current + 1
    })
  }

  return (
    <>
      <div className="pb-invitePrivateStack">
        {savingRsvp || requestError ? (
          <div className="pb-invitePrivateAlerts" aria-live="polite">
            {savingRsvp ? <div className="pb-inlineNote pb-inlineNote--info">Spremamo tvoj odgovor...</div> : null}
            {requestError ? <div className="pb-inlineNote pb-inlineNote--error">{requestError}</div> : null}
          </div>
        ) : null}

        {guestPartyDetailRows.length > 0 ? (
          <section
            className="pb-invitePrivateCard pb-invitePrivateCard--guestPartyFacts"
            aria-labelledby="guest-party-details-heading"
          >
            <h2 id="guest-party-details-heading" className="pb-invitePrivateCard__guestPartyHeading">
              Detalji tuluma
            </h2>
            <div className="pb-partyFacts pb-partyFacts--guestGrid">
              {guestPartyDetailRows.map((row) => (
                <div
                  key={row.label}
                  className={`pb-partyFact${row.spanFull ? ' pb-partyFact--guestSpanFull pb-partyFact--note' : ''}${row.kind === 'maps' ? ' pb-partyFact--mapsAction' : ''}`}
                >
                  <div className="pb-partyFact__label">{row.label}</div>
                  <div className="pb-partyFact__value">{renderPartyFactValue(row)}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Popis gostiju — privremeno isključeno na gost strani
        <section className="pb-invitePrivateCard pb-invitePrivateCard--accordion" aria-labelledby="private-roster-toggle">
          ...
        </section>
        */}

        <section className="pb-invitePrivateCard pb-invitePrivateCard--accordion pb-invitePrivateCard--wishlist" aria-labelledby="private-wishlist-toggle">
          <button
            id="private-wishlist-toggle"
            type="button"
            className={`pb-privateToggle pb-privateToggle--guestHeading ${wishlistOpen ? 'is-open' : ''}`}
            onClick={() => setWishlistOpen((current) => !current)}
            aria-expanded={wishlistOpen}
          >
            <span className="pb-privateToggle__copy">
              <span className="pb-privateToggle__title">Pokloni</span>
            </span>
            <span className="pb-privateToggle__trail">
              <PrivateToggleSectionCounts
                total={guestWishlistTotalCount}
                newCount={guestWishlistUnreadCount}
                segmentLabel="poklon"
              />
              <span className="pb-privateToggle__arrow" aria-hidden>
                <PrivateToggleChevron />
              </span>
            </span>
          </button>

          {wishlistOpen ? (
            <div className="pb-privateAccordionBody">
              <section className="pb-privateWishlist" aria-label="Pokloni">
                {wishlistLoading ? <div className="pb-inlineNote pb-inlineNote--info">Učitavanje poklona...</div> : null}
                {wishlistError ? <div className="pb-inlineNote pb-inlineNote--error">{wishlistError}</div> : null}
                {!wishlistLoading && wishlistItems.length === 0 ? (
                  <div className="pb-inlineNote pb-inlineNote--info">Još nema dodanih poklona.</div>
                ) : null}

                {wishlistItems.length > 0 ? (
                  <ul className="pb-inviteWishlist">
                    {wishlistItems.map((item) => {
                      const isBusy = wishlistActionId === item.id
                      const reservationStatus = item.reservation.status
                      const isAddedByCurrentGuest =
                        Boolean(currentGuestName) &&
                        item.addedByName?.trim().toLowerCase() === currentGuestName?.trim().toLowerCase()
                      const groupOnly = isOrganizerGroupGift(item)
                      const canReserve = reservationStatus === 'available' && !groupOnly
                      const canParticipate = reservationStatus === 'available' || reservationStatus === 'reserved'
                      const canDelete = reservationStatus === 'reserved_by_you' && isAddedByCurrentGuest
                      const canCancel = reservationStatus === 'reserved_by_you' && !isAddedByCurrentGuest
                      const imageUrl = resolveWishlistImageUrl(item)
                      const purchaseLabel = wishlistPurchaseLabel(item)

                      return (
                        <li
                          key={item.id}
                          className="pb-inviteWish pb-inviteWish--compact pb-inviteWish--clickable"
                          onClick={() => setSelectedWishItem(item)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              setSelectedWishItem(item)
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="pb-inviteWish__mediaCol">
                            <div className="pb-inviteWish__thumbWrap">
                              {imageUrl ? (
                                <img src={imageUrl} alt="" className="pb-inviteWish__thumbImage" loading="lazy" />
                              ) : (
                                <div className="pb-inviteWish__thumb" aria-hidden />
                              )}
                            </div>
                            <span className={wishlistBadgeClass(reservationStatus)}>{getWishCardStatusLabel(item)}</span>
                          </div>

                          <div className="pb-inviteWish__right">
                            <div className="pb-inviteWish__topRow">
                              <div className="pb-inviteWish__body">
                                <h3 className="pb-inviteWish__title">{item.title}</h3>
                                <p className="pb-inviteWish__desc">{item.description || 'Kratki detalji poklona uskoro.'}</p>
                                {item.priceLabel ? <p className="pb-inviteWish__meta">Cijena: {item.priceLabel}</p> : null}
                                {purchaseLabel ? (
                                  <p className="pb-inviteWish__purchaseMeta">
                                    <span className="pb-inviteWish__purchaseIcon" aria-hidden>
                                      +
                                    </span>
                                    <span>{purchaseLabel}</span>
                                  </p>
                                ) : null}
                              </div>
                              <span className="pb-inviteWish__chevron" aria-hidden>
                                <svg className="pb-inviteWish__chevronSvg" viewBox="0 0 24 24" width={22} height={22} fill="none">
                                  <path
                                    d="M9 6l6 6-6 6"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </div>
                            <div className="pb-inviteWish__footer">
                              <div className="pb-inviteWish__actions" onClick={(event) => event.stopPropagation()}>
                                <div className="pb-inviteWish__btnRow">
                                  {canReserve ? (
                                    <>
                                      <Button type="button" onClick={() => onReserve(item)} disabled={isBusy}>
                                        {isBusy ? 'Spremamo...' : 'Rezerviraj'}
                                      </Button>
                                    </>
                                  ) : null}
                                  {canParticipate ? (
                                    <Button
                                      variant="ghost"
                                      type="button"
                                      className="pb-inviteWish__participateBtn"
                                      onClick={() => onParticipate(item)}
                                      disabled={isBusy}
                                    >
                                      {isBusy ? 'Spremamo...' : 'Sudjeluj'}
                                    </Button>
                                  ) : null}
                                  {canCancel ? (
                                    <Button variant="ghost" type="button" onClick={() => onCancel(item)} disabled={isBusy}>
                                      {isBusy ? 'Spremamo...' : 'Otkaži'}
                                    </Button>
                                  ) : null}
                                  {canDelete ? (
                                    <Button
                                      className="pb-inviteWish__deleteBtn"
                                      variant="ghost"
                                      type="button"
                                      onClick={() => onDeleteWishlistItem(item)}
                                      disabled={isBusy}
                                    >
                                      {isBusy ? 'Spremamo...' : 'Obriši'}
                                    </Button>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                ) : null}

                <WishlistTipPaymentSection partyDetails={invitation.partyDetails} />

                <div className="pb-inviteWish__guestAdd">
                  <Button
                    type="button"
                    variant={addingGiftOpen ? 'amber' : 'primary'}
                    leftIcon={
                      <span className="pb-inviteWish__addIcon" aria-hidden>
                        <span className="pb-inviteWish__addIconMark">+</span>
                      </span>
                    }
                    onClick={() => setAddingGiftOpen((current) => !current)}
                  >
                    {addingGiftOpen ? 'Zatvori dodavanje' : 'Dodaj svoj poklon'}
                  </Button>
                </div>

                {addingGiftOpen ? (
                  <div className="pb-profileForm pb-inviteWish__guestForm">
                    <div className="pb-formGrid">
                      <label className="pb-formField">
                        <span className="pb-formLabel">Naziv poklona <span className="pb-formLabel__required">*</span></span>
                        <input className="pb-input" type="text" required aria-required="true" value={giftTitle} onChange={(event) => setGiftTitle(event.target.value)} />
                      </label>
                      <label className="pb-formField">
                        <span className="pb-formLabel">Kratki detalji</span>
                        <input className="pb-input" type="text" value={giftDescription} onChange={(event) => setGiftDescription(event.target.value)} />
                      </label>
                      <label className="pb-formField">
                        <span className="pb-formLabel">Dodaj sliku</span>
                        <input className="pb-input pb-input--file" type="file" accept="image/*" onChange={handleGiftImageChange} />
                        <span className="pb-inviteWish__uploadHint">
                          {giftImageName ? `Odabrano: ${giftImageName}` : 'Odaberi sliku iz kamere ili galerije.'}
                        </span>
                        {giftImageUrl ? (
                          <div className="pb-inviteWish__uploadPreview">
                            <img src={giftImageUrl} alt="Pregled odabrane slike poklona" className="pb-inviteWish__uploadPreviewImage" />
                          </div>
                        ) : null}
                      </label>
                      <label className="pb-formField">
                        <span className="pb-formLabel">Cijena</span>
                        <input className="pb-input" type="text" value={giftPriceLabel} onChange={(event) => setGiftPriceLabel(event.target.value)} />
                      </label>
                    </div>
                    <div className="pb-flowActions">
                      <Button type="button" onClick={handleAddGift} disabled={savingWishlistItem}>
                        {savingWishlistItem ? 'Spremamo...' : 'Spremi poklon'}
                      </Button>
                      <Button variant="ghost" type="button" onClick={resetGiftForm} disabled={savingWishlistItem}>
                        Odustani
                      </Button>
                    </div>
                    {giftFormError ? <div className="pb-inlineNote pb-inlineNote--error">{giftFormError}</div> : null}
                  </div>
                ) : null}
              </section>
            </div>
          ) : null}
        </section>

        <section className="pb-invitePrivateCard pb-invitePrivateCard--accordion pb-invitePrivateCard--liveChat" aria-labelledby="private-chat-toggle">
          <button
            id="private-chat-toggle"
            type="button"
            className={`pb-privateToggle pb-privateToggle--guestHeading ${chatOpen ? 'is-open' : ''}`}
            onClick={onToggleChatOpen}
            aria-expanded={chatOpen}
          >
            <span className="pb-privateToggle__copy">
              <span className="pb-privateToggle__title">Live chat</span>
            </span>
            <span className="pb-privateToggle__trail">
              <PrivateToggleSectionCounts
                total={guestChatTotalCount}
                newCount={guestChatUnreadCount}
                segmentLabel="poruka"
              />
              <span className="pb-privateToggle__arrow" aria-hidden>
                <PrivateToggleChevron />
              </span>
            </span>
          </button>

          {chatOpen ? (
            <div className="pb-privateAccordionBody">
              <InvitationLiveChatPanel
                messages={chatMessages}
                chatReads={chatReads}
                loading={chatLoading}
                error={chatError}
                draft={chatDraft}
                sending={sendingChatMessage}
                onDraftChange={onChatDraftChange}
                onSend={onSendChatMessage}
                viewerRole="guest"
                senderLabelHint={chatSenderLabelHint}
              />
            </div>
          ) : null}
        </section>

        {!isBirthInvitation && matchedVenue ? (
          <section className="pb-invitePrivateCard pb-invitePrivateCard--accordion" aria-labelledby="private-venue-toggle">
            <button
              id="private-venue-toggle"
              type="button"
              className={`pb-privateToggle pb-privateToggle--guestHeading ${venueOpen ? 'is-open' : ''}`}
              onClick={() => setVenueOpen((current) => !current)}
              aria-expanded={venueOpen}
            >
              <span className="pb-privateToggle__copy">
                <span className="pb-privateToggle__title">Više o igraonici</span>
              </span>
              <span className="pb-privateToggle__arrow" aria-hidden>
                <PrivateToggleChevron />
              </span>
            </button>

            {venueOpen ? (
              <div className="pb-privateAccordionBody">
                <section className="pb-privateVenue" aria-labelledby="venue-details-title">
                  <header className="pb-invitePrivateCard__header">
                    <h3 id="venue-details-title" className="pb-invitePrivateCard__title">
                      {matchedVenue.name}
                    </h3>
                    <p className="pb-invitePrivateCard__subtitle">{matchedVenue.description}</p>
                  </header>

                  {venueGallery.length > 0 ? (
                    <div className="pb-privateVenue__gallery">
                      {venueGallery.map((imageUrl, index) => (
                        <button
                          key={`${matchedVenue.id}-${imageUrl}`}
                          type="button"
                          className="pb-privateVenue__galleryButton"
                          onClick={() => setSelectedVenueImageIndex(index)}
                          aria-label={`Otvori fotografiju igraonice ${index + 1}`}
                        >
                          <img
                            src={imageUrl}
                            alt={`${matchedVenue.name} ${index + 1}`}
                            className="pb-privateVenue__image"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <div className="pb-partyFacts pb-partyFacts--venue">
                    {venueDetailRows.map((item) => (
                      <div
                        key={item.label}
                        className={`pb-partyFact${item.spanFull ? ' pb-partyFact--guestSpanFull pb-partyFact--note' : ''}`}
                      >
                        <div className="pb-partyFact__label">{item.label}</div>
                        <div className="pb-partyFact__value">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
      {selectedWishItem ? (
        <div className="pb-modalOverlay" role="presentation" onClick={() => setSelectedWishItem(null)}>
          <div
            className="pb-modalDialog pb-inviteWishModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guest-wish-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pb-modalDialog__head">
              <h2 id="guest-wish-modal-title" className="pb-modalDialog__title">
                {selectedWishItem.title}
              </h2>
              <button
                type="button"
                className="pb-modalDialog__close"
                onClick={() => setSelectedWishItem(null)}
                aria-label="Zatvori detalje poklona"
              >
                ×
              </button>
            </div>
            <div className="pb-modalDialog__body pb-inviteWishModal__body">
              {selectedWishImageUrl ? (
                <img src={selectedWishImageUrl} alt={selectedWishItem.title} className="pb-inviteWishModal__image" />
              ) : null}
              {selectedWishItem.description ? <p className="pb-modalDialog__lead">{selectedWishItem.description}</p> : null}
              <div className="pb-inviteWishModal__meta">
                {selectedWishItem.priceLabel ? (
                  <div className="pb-inviteWishModal__metaRow">
                    <span className="pb-inviteWishModal__metaLabel">Cijena</span>
                    <span>{selectedWishItem.priceLabel}</span>
                  </div>
                ) : null}
                <div className="pb-inviteWishModal__metaRow">
                  <span className="pb-inviteWishModal__metaLabel">Status</span>
                  <span className={wishlistBadgeClass(selectedWishItem.reservation.status)}>
                    {getWishModalStatusLabel(selectedWishItem)}
                  </span>
                </div>
                {selectedWishItem.url ? (
                  <div className="pb-inviteWishModal__metaRow">
                    <span className="pb-inviteWishModal__metaLabel">Link</span>
                    <a href={selectedWishItem.url} target="_blank" rel="noreferrer" className="pb-inviteWish__link">
                      Pogledaj poklon
                    </a>
                  </div>
                ) : null}
                {selectedWishPurchaseLabel ? (
                  <div className="pb-inviteWishModal__metaRow">
                    <span className="pb-inviteWishModal__metaLabel">Poklon</span>
                    <span>{selectedWishPurchaseLabel}</span>
                  </div>
                ) : null}
                {(selectedWishItem.reservation.participants?.length ?? 0) > 0 &&
                (isOrganizerGroupGift(selectedWishItem) || hasMultipleWishlistParticipants(selectedWishItem)) ? (
                  <div className="pb-inviteWishModal__metaRow pb-inviteWishModal__metaRow--stack">
                    <span className="pb-inviteWishModal__metaLabel">Sudjeluju</span>
                    <div className="pb-inviteWishModal__participants">
                      {selectedWishItem.reservation.participants?.map((participant) => (
                        <span key={participant.id} className="pb-inviteWishModal__participant">
                          {participant.childName ? `${participant.name} - ${participant.childName}` : participant.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {matchedVenue && selectedVenueImageUrl ? (
        <div className="pb-modalOverlay" role="presentation" onClick={() => setSelectedVenueImageIndex(null)}>
          <div
            className="pb-modalDialog pb-privateVenueModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guest-venue-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pb-modalDialog__head">
              <h2 id="guest-venue-modal-title" className="pb-modalDialog__title">
                {matchedVenue.name}
              </h2>
              <button
                type="button"
                className="pb-modalDialog__close"
                onClick={() => setSelectedVenueImageIndex(null)}
                aria-label="Zatvori fotografiju igraonice"
              >
                ×
              </button>
            </div>
            <div className="pb-modalDialog__body pb-privateVenueModal__body">
              <div className="pb-privateVenueModal__imageWrap">
                <img
                  src={selectedVenueImageUrl}
                  alt={`${matchedVenue.name} ${selectedVenueImageNumber}`}
                  className="pb-privateVenueModal__image"
                />
              </div>
              <div className="pb-privateVenueModal__footer">
                <button type="button" className="pb-privateVenueModal__nav" onClick={showPreviousVenueImage}>
                  ← Lijevo
                </button>
                <span className="pb-privateVenueModal__counter">
                  {selectedVenueImageNumber} / {venueGallery.length}
                </span>
                <button type="button" className="pb-privateVenueModal__nav" onClick={showNextVenueImage}>
                  Desno →
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {/* {selectedRosterRequest ? (
        <InvitationGuestRosterModal ... />
      ) : null} */}
    </>
  )
}
