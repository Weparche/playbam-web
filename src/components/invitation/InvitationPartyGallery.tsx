import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'

import Button from '../ui/Button'
import PrivateToggleChevron from '../ui/PrivateToggleChevron'
import PrivateToggleSectionCounts from '../ui/PrivateToggleSectionCounts'
import { getGalleryUploaderClientId } from '../../lib/galleryUploaderClientId'
import {
  deleteInvitationGalleryPhoto,
  getInvitationGallery,
  uploadInvitationGalleryPhoto,
  type InvitationGalleryPhoto,
} from '../../lib/invitationApi'
import type { TemporaryWebIdentity } from '../../lib/tempWebIdentity'

type Props = {
  token: string
  uploaderName?: string | null
  isHost?: boolean
  identity?: TemporaryWebIdentity | null
  className?: string
}

const MAX_GALLERY_IMAGE_SIDE = 1600
const GALLERY_JPEG_QUALITY = 0.82
const MAX_UPLOAD_BATCH = 100

function loadImageFromDataUrl(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('IMAGE_LOAD_FAILED'))
    image.src = dataUrl
  })
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error('IMAGE_READ_FAILED'))
    reader.readAsDataURL(file)
  })
}

async function compressGalleryImage(file: File) {
  const sourceDataUrl = await readFileAsDataUrl(file)
  const image = await loadImageFromDataUrl(sourceDataUrl)
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight)
  const ratio = longestSide > MAX_GALLERY_IMAGE_SIDE ? MAX_GALLERY_IMAGE_SIDE / longestSide : 1
  const width = Math.max(1, Math.round(image.naturalWidth * ratio))
  const height = Math.max(1, Math.round(image.naturalHeight * ratio))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('CANVAS_CONTEXT_MISSING')
  }

  context.drawImage(image, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', GALLERY_JPEG_QUALITY)
}

export default function InvitationPartyGallery({
  token,
  uploaderName,
  isHost = false,
  identity,
  className = '',
}: Props) {
  const [open, setOpen] = useState(false)
  const [photos, setPhotos] = useState<InvitationGalleryPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<InvitationGalleryPhoto | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resolvedToken = token.trim()
  const totalPhotos = photos.length
  const uploaderClientId = useMemo(
    () => (resolvedToken ? getGalleryUploaderClientId(resolvedToken) : ''),
    [resolvedToken],
  )
  const galleryRequestOptions = useMemo(
    () => ({
      identity,
      attachHostBearer: isHost,
      galleryClientId: uploaderClientId || undefined,
    }),
    [identity, isHost, uploaderClientId],
  )
  const rootClassName = ['pb-invitePrivateCard pb-invitePrivateCard--accordion pb-partyGalleryCard', className.trim()]
    .filter(Boolean)
    .join(' ')

  const selectedPhotoIndex = useMemo(
    () => (selectedPhoto ? photos.findIndex((photo) => photo.id === selectedPhoto.id) : -1),
    [photos, selectedPhoto],
  )

  useEffect(() => {
    if (!resolvedToken) {
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    getInvitationGallery(resolvedToken, galleryRequestOptions)
      .then((nextPhotos) => {
        if (!cancelled) {
          setPhotos(nextPhotos)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Galerija trenutno nije dostupna.')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [galleryRequestOptions, resolvedToken])

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''

    if (!files.length || !resolvedToken) {
      return
    }

    const imageFiles = files.filter((file) => file.type.startsWith('image/'))
    if (!imageFiles.length) {
      setError('Odaberi fotke iz kamere ili galerije.')
      setNotice('')
      return
    }

    if (imageFiles.length > MAX_UPLOAD_BATCH) {
      setError(`Možeš odjednom dodati najviše ${MAX_UPLOAD_BATCH} fotki.`)
      setNotice('')
      return
    }

    setUploading(true)
    setError('')
    setNotice('')

    const uploadedPhotos: InvitationGalleryPhoto[] = []
    let failedCount = 0

    for (const file of imageFiles) {
      try {
        const imageDataUrl = await compressGalleryImage(file)
        const photo = await uploadInvitationGalleryPhoto(
          resolvedToken,
          {
            imageDataUrl,
            uploaderName: uploaderName?.trim() || null,
            uploaderClientId: uploaderClientId || null,
          },
          galleryRequestOptions,
        )
        uploadedPhotos.push(photo)
      } catch {
        failedCount += 1
      }
    }

    if (uploadedPhotos.length) {
      const uploadedIds = new Set(uploadedPhotos.map((photo) => photo.id))
      setPhotos((current) => [...uploadedPhotos, ...current.filter((item) => !uploadedIds.has(item.id))])
      setNotice(
        uploadedPhotos.length === 1
          ? 'Fotka je dodana.'
          : `${uploadedPhotos.length} fotki je dodano.`,
      )
      setOpen(true)
    }

    if (failedCount) {
      setError(
        failedCount === 1
          ? 'Jedna fotka nije uspjela. Pokušaj ponovno.'
          : `${failedCount} fotki nije uspjelo. Pokušaj ponovno.`,
      )
    } else if (!uploadedPhotos.length) {
      setError('Upload nije uspio. Pokušaj ponovno.')
    }

    setUploading(false)
  }

  const handleDeletePhoto = async (photo: InvitationGalleryPhoto) => {
    if (!photo.canDelete || !resolvedToken || deletingPhotoId) {
      return
    }

    if (!window.confirm('Obrisati ovu fotku iz galerije?')) {
      return
    }

    setDeletingPhotoId(photo.id)
    setError('')
    setNotice('')

    try {
      await deleteInvitationGalleryPhoto(resolvedToken, photo.id, galleryRequestOptions)
      setPhotos((current) => current.filter((item) => item.id !== photo.id))
      setSelectedPhoto((current) => (current?.id === photo.id ? null : current))
      setNotice('Fotka je obrisana.')
    } catch {
      setError('Brisanje nije uspjelo. Pokušaj ponovno.')
    } finally {
      setDeletingPhotoId(null)
    }
  }

  const showPreviousPhoto = () => {
    if (selectedPhotoIndex < 0 || photos.length === 0) return
    const nextIndex = selectedPhotoIndex === 0 ? photos.length - 1 : selectedPhotoIndex - 1
    setSelectedPhoto(photos[nextIndex])
  }

  const showNextPhoto = () => {
    if (selectedPhotoIndex < 0 || photos.length === 0) return
    const nextIndex = selectedPhotoIndex === photos.length - 1 ? 0 : selectedPhotoIndex + 1
    setSelectedPhoto(photos[nextIndex])
  }

  return (
    <>
      <section className={rootClassName} aria-labelledby="party-gallery-toggle">
        <button
          id="party-gallery-toggle"
          type="button"
          className={`pb-privateToggle pb-privateToggle--guestHeading ${open ? 'is-open' : ''}`}
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
        >
          <span className="pb-privateToggle__copy">
            <span className="pb-privateToggle__title">Galerija tuluma</span>
          </span>
          <span className="pb-privateToggle__trail">
            <PrivateToggleSectionCounts total={totalPhotos} newCount={0} segmentLabel="fotka" />
            <span className="pb-privateToggle__arrow" aria-hidden>
              <PrivateToggleChevron />
            </span>
          </span>
        </button>

        {open ? (
          <div className="pb-privateAccordionBody">
            <div className="pb-partyGallery">
              <div className="pb-partyGallery__toolbar">
                <Button
                  type="button"
                  variant="primary"
                  className="pb-partyGallery__uploadButton"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Fotke se spremaju...' : 'Dodaj fotke'}
                </Button>
                <input
                  ref={fileInputRef}
                  className="pb-partyGallery__fileInput"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
              </div>

              {notice ? <div className="pb-inlineNote pb-inlineNote--success">{notice}</div> : null}
              {error ? <div className="pb-inlineNote pb-inlineNote--error">{error}</div> : null}
              {loading ? <div className="pb-inlineNote pb-inlineNote--info">Učitavamo fotke...</div> : null}

              {!loading && photos.length === 0 ? (
                <div className="pb-partyGallery__empty">Još nema fotki. Budi prvi koji dodaje uspomenu.</div>
              ) : null}

              {photos.length > 0 ? (
                <div className="pb-partyGallery__grid">
                  {photos.map((photo, index) => (
                    <div key={photo.id} className="pb-partyGallery__photoCell">
                      <button
                        type="button"
                        className="pb-partyGallery__photoButton"
                        onClick={() => setSelectedPhoto(photo)}
                        aria-label={`Otvori fotku tuluma ${index + 1}`}
                      >
                        <img className="pb-partyGallery__photo" src={photo.imageUrl} alt="" loading="lazy" />
                      </button>
                      {photo.canDelete ? (
                        <button
                          type="button"
                          className="pb-partyGallery__deleteButton"
                          onClick={() => void handleDeletePhoto(photo)}
                          disabled={deletingPhotoId === photo.id}
                          aria-label={`Obriši fotku ${index + 1}`}
                        >
                          {deletingPhotoId === photo.id ? '...' : '×'}
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>

      {selectedPhoto ? (
        <div className="pb-modalOverlay" role="presentation" onClick={() => setSelectedPhoto(null)}>
          <div
            className="pb-modalDialog pb-partyGalleryModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="party-gallery-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="pb-modalDialog__head">
              <h2 id="party-gallery-modal-title" className="pb-modalDialog__title">
                Galerija tuluma
              </h2>
              <button
                type="button"
                className="pb-modalDialog__close"
                onClick={() => setSelectedPhoto(null)}
                aria-label="Zatvori fotku"
              >
                x
              </button>
            </div>
            <div className="pb-modalDialog__body pb-partyGalleryModal__body">
              <img className="pb-partyGalleryModal__image" src={selectedPhoto.imageUrl} alt="Fotka iz galerije tuluma" />
              {selectedPhoto.uploaderName ? (
                <p className="pb-partyGalleryModal__meta">Dodao/la: {selectedPhoto.uploaderName}</p>
              ) : null}
              <div className="pb-partyGalleryModal__footer">
                <button type="button" className="pb-partyGalleryModal__nav" onClick={showPreviousPhoto}>
                  Lijevo
                </button>
                <span className="pb-partyGalleryModal__counter">
                  {selectedPhotoIndex + 1} / {photos.length}
                </span>
                <button type="button" className="pb-partyGalleryModal__nav" onClick={showNextPhoto}>
                  Desno
                </button>
              </div>
              {selectedPhoto.canDelete ? (
                <div className="pb-partyGalleryModal__actions">
                  <Button
                    type="button"
                    variant="ghost"
                    className="pb-partyGalleryModal__delete"
                    onClick={() => void handleDeletePhoto(selectedPhoto)}
                    disabled={deletingPhotoId === selectedPhoto.id}
                  >
                    {deletingPhotoId === selectedPhoto.id ? 'Brišemo...' : 'Obriši fotku'}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
