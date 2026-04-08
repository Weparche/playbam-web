import { useState, type ChangeEvent } from 'react'

import Button from '../ui/Button'
import type { InvitationWishlistItem, InvitationWishlistPayload } from '../../lib/invitationApi'

type Props = {
  wishlistLoading: boolean
  wishlistError: string
  wishlistItems: InvitationWishlistItem[]
  wishlistActionId: string | null
  currentGuestName: string | null
  onReserve: (item: InvitationWishlistItem) => void
  onCancel: (item: InvitationWishlistItem) => void
  onAddWishlistItem: (payload: InvitationWishlistPayload) => void
  onDeleteWishlistItem: (item: InvitationWishlistItem) => void
  savingWishlistItem: boolean
  savingRsvp: boolean
  requestError: string
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

const PARTY_DETAILS = [
  { label: 'Tema rođendana', value: 'Svemirska avantura' },
  { label: 'Pizza', value: '4 velike pizze za ekipu' },
  { label: 'Torta', value: 'Čokoladna torta sa svemirskim ukrasima' },
  { label: 'Grickalice', value: 'Kokice, flips i mini pereci' },
  { label: 'Piće', value: 'Sokovi, voda i dječji kokteli' },
  { label: 'Ples', value: 'Glazba i mini disco party' },
  { label: 'Crtanje lica', value: 'Da, organizirano tijekom proslave' },
]

const VENUE_GALLERY = [
  'https://jogica.com.hr/Galerija/slika2.jpg',
  'https://jogica.com.hr/Galerija/slika3.jpg',
  'https://jogica.com.hr/Galerija/slika4.jpg',
  'https://jogica.com.hr/Galerija/slika5.jpg',
]

const VENUE_DETAILS = [
  { label: 'Igraonica', value: 'Jogica' },
  { label: 'Lokacija', value: 'Zagreb, s parkingom u blizini' },
  { label: 'Dob djece', value: 'Od 2 do 10 godina' },
  { label: 'Tip prostora', value: 'Unutarnji prostor s kutkom za roditelje' },
  { label: 'Program', value: 'Animatorica, slobodna igra i tematski sadržaji' },
]

export default function PrivateInvitationGuest({
  wishlistLoading,
  wishlistError,
  wishlistItems,
  wishlistActionId,
  currentGuestName,
  onReserve,
  onCancel,
  onAddWishlistItem,
  onDeleteWishlistItem,
  savingWishlistItem,
  savingRsvp,
  requestError,
}: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [venueOpen, setVenueOpen] = useState(false)
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

  const selectedWishImageUrl = selectedWishItem ? resolveWishlistImageUrl(selectedWishItem) : null
  const selectedWishPurchaseLabel = selectedWishItem ? wishlistPurchaseLabel(selectedWishItem) : null
  const selectedVenueImageUrl = selectedVenueImageIndex !== null ? VENUE_GALLERY[selectedVenueImageIndex] : null
  const selectedVenueImageNumber = selectedVenueImageIndex !== null ? selectedVenueImageIndex + 1 : 0

  const showPreviousVenueImage = () => {
    setSelectedVenueImageIndex((current) => {
      if (current === null) return 0
      return current === 0 ? VENUE_GALLERY.length - 1 : current - 1
    })
  }

  const showNextVenueImage = () => {
    setSelectedVenueImageIndex((current) => {
      if (current === null) return 0
      return current === VENUE_GALLERY.length - 1 ? 0 : current + 1
    })
  }

  return (
    <>
      <div className="pb-invitePrivateStack">
        <section className="pb-invitePrivateCard pb-invitePrivateCard--intro" aria-labelledby="private-invite-title">
          <h2 id="private-invite-title" className="pb-invitePrivateCard__title">
            Privatni dio pozivnice
          </h2>
          <span className="pb-invitePrivateCard__lead">
            Odluku možeš promijeniti do 24h prije rođendana.
          </span>
          {savingRsvp ? <div className="pb-inlineNote pb-inlineNote--info">Spremamo tvoj odgovor...</div> : null}
          {requestError ? <div className="pb-inlineNote pb-inlineNote--error">{requestError}</div> : null}
        </section>

        <section className="pb-invitePrivateCard pb-invitePrivateCard--accordion" aria-labelledby="private-details-toggle">
          <button
            id="private-details-toggle"
            type="button"
            className={`pb-privateToggle ${detailsOpen ? 'is-open' : ''}`}
            onClick={() => setDetailsOpen((current) => !current)}
            aria-expanded={detailsOpen}
          >
            <span className="pb-privateToggle__copy">
              <span className="pb-privateToggle__eyebrow">Privatni sadržaj</span>
              <span className="pb-privateToggle__title">Detalji rođendana</span>
            </span>
            <span className="pb-privateToggle__arrow" aria-hidden>
              ↓
            </span>
          </button>

          {detailsOpen ? (
            <div className="pb-privateAccordionBody">
              <section className="pb-privateDetails" aria-labelledby="party-details-title">
                <header className="pb-invitePrivateCard__header">
                  <h3 id="party-details-title" className="pb-invitePrivateCard__title">
                    Detalji tuluma
                  </h3>
                  <p className="pb-invitePrivateCard__subtitle">
                    Sve što trebaš znati o proslavi na jednom mjestu.
                  </p>
                </header>

                <div className="pb-partyFacts">
                  {PARTY_DETAILS.map((item) => (
                    <div key={item.label} className="pb-partyFact">
                      <div className="pb-partyFact__label">{item.label}</div>
                      <div className="pb-partyFact__value">{item.value}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : null}
        </section>

        <section className="pb-invitePrivateCard pb-invitePrivateCard--accordion" aria-labelledby="private-wishlist-toggle">
          <button
            id="private-wishlist-toggle"
            type="button"
            className={`pb-privateToggle ${wishlistOpen ? 'is-open' : ''}`}
            onClick={() => setWishlistOpen((current) => !current)}
            aria-expanded={wishlistOpen}
          >
            <span className="pb-privateToggle__copy">
              <span className="pb-privateToggle__eyebrow">Privatni sadržaj</span>
              <span className="pb-privateToggle__title">Lista želja</span>
            </span>
            <span className="pb-privateToggle__arrow" aria-hidden>
              ↓
            </span>
          </button>

          {wishlistOpen ? (
            <div className="pb-privateAccordionBody">
              <section className="pb-privateWishlist" aria-labelledby="wishlist-heading">
                {wishlistLoading ? <div className="pb-inlineNote pb-inlineNote--info">Učitavanje wishliste...</div> : null}
                {wishlistError ? <div className="pb-inlineNote pb-inlineNote--error">{wishlistError}</div> : null}
                {!wishlistLoading && wishlistItems.length === 0 ? (
                  <div className="pb-inlineNote pb-inlineNote--info">Još nema dodanih želja.</div>
                ) : null}

                {wishlistItems.length > 0 ? (
                  <ul className="pb-inviteWishlist">
                    {wishlistItems.map((item) => {
                      const isBusy = wishlistActionId === item.id
                      const reservationStatus = item.reservation.status
                      const isAddedByCurrentGuest =
                        Boolean(currentGuestName) &&
                        item.addedByName?.trim().toLowerCase() === currentGuestName?.trim().toLowerCase()
                      const canReserve = reservationStatus === 'available'
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
                          <div className="pb-inviteWish__thumbWrap">
                            {imageUrl ? (
                              <img src={imageUrl} alt="" className="pb-inviteWish__thumbImage" loading="lazy" />
                            ) : (
                              <div className="pb-inviteWish__thumb" aria-hidden />
                            )}
                          </div>

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

                          <div className="pb-inviteWish__side">
                            <span className={wishlistBadgeClass(reservationStatus)}>{wishlistBadgeLabel(reservationStatus)}</span>
                            <div className="pb-inviteWish__actions" onClick={(event) => event.stopPropagation()}>
                              <div className="pb-inviteWish__btnRow">
                                {canReserve ? (
                                  <Button type="button" onClick={() => onReserve(item)} disabled={isBusy}>
                                    {isBusy ? 'Spremamo...' : 'Rezerviraj'}
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
                        </li>
                      )
                    })}
                  </ul>
                ) : null}

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
                        <span className="pb-formLabel">Naziv poklona</span>
                        <input className="pb-input" type="text" value={giftTitle} onChange={(event) => setGiftTitle(event.target.value)} />
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

        <section className="pb-invitePrivateCard pb-invitePrivateCard--accordion" aria-labelledby="private-venue-toggle">
          <button
            id="private-venue-toggle"
            type="button"
            className={`pb-privateToggle ${venueOpen ? 'is-open' : ''}`}
            onClick={() => setVenueOpen((current) => !current)}
            aria-expanded={venueOpen}
          >
            <span className="pb-privateToggle__copy">
              <span className="pb-privateToggle__eyebrow">Privatni sadržaj</span>
              <span className="pb-privateToggle__title">Više o igraonici</span>
            </span>
            <span className="pb-privateToggle__arrow" aria-hidden>
              ↓
            </span>
          </button>

          {venueOpen ? (
            <div className="pb-privateAccordionBody">
              <section className="pb-privateVenue" aria-labelledby="venue-details-title">
                <header className="pb-invitePrivateCard__header">
                  <h3 id="venue-details-title" className="pb-invitePrivateCard__title">
                    Igraonica Jogica
                  </h3>
                  <p className="pb-invitePrivateCard__subtitle">
                    Isti tip pregleda kao u mobile detaljima igraonice: slike prostora i ključne informacije na jednom mjestu.
                  </p>
                </header>

                <div className="pb-privateVenue__gallery">
                  {VENUE_GALLERY.map((imageUrl, index) => (
                    <button
                      key={imageUrl}
                      type="button"
                      className="pb-privateVenue__galleryButton"
                      onClick={() => setSelectedVenueImageIndex(index)}
                      aria-label={`Otvori fotografiju igraonice ${index + 1}`}
                    >
                      <img
                        src={imageUrl}
                        alt={`Igraonica Jogica ${index + 1}`}
                        className="pb-privateVenue__image"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>

                <p className="pb-privateVenue__description">
                  Šarena i topla igraonica s animatoricama, kutkom za roditelje i rođendanskim programima prilagođenima
                  manjim i većim ekipama.
                </p>

                <div className="pb-partyFacts pb-partyFacts--venue">
                  {VENUE_DETAILS.map((item) => (
                    <div key={item.label} className="pb-partyFact">
                      <div className="pb-partyFact__label">{item.label}</div>
                      <div className="pb-partyFact__value">{item.value}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : null}
        </section>
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
                    {wishlistBadgeLabel(selectedWishItem.reservation.status)}
                  </span>
                </div>
                {selectedWishPurchaseLabel ? (
                  <div className="pb-inviteWishModal__metaRow">
                    <span className="pb-inviteWishModal__metaLabel">Poklon</span>
                    <span>{selectedWishPurchaseLabel}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {selectedVenueImageUrl ? (
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
                Igraonica Jogica
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
                  alt={`Igraonica Jogica ${selectedVenueImageNumber}`}
                  className="pb-privateVenueModal__image"
                />
              </div>
              <div className="pb-privateVenueModal__footer">
                <button type="button" className="pb-privateVenueModal__nav" onClick={showPreviousVenueImage}>
                  ← Lijevo
                </button>
                <span className="pb-privateVenueModal__counter">
                  {selectedVenueImageNumber} / {VENUE_GALLERY.length}
                </span>
                <button type="button" className="pb-privateVenueModal__nav" onClick={showNextVenueImage}>
                  Desno →
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
