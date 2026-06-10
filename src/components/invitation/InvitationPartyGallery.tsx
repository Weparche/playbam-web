import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'

import Button from '../ui/Button'
import PrivateToggleChevron from '../ui/PrivateToggleChevron'
import PrivateToggleSectionCounts from '../ui/PrivateToggleSectionCounts'
import {
  getInvitationGallery,
  uploadInvitationGalleryPhoto,
  type InvitationGalleryPhoto,
} from '../../lib/invitationApi'

type Props = {
  token: string
  uploaderName?: string | null
  className?: string
}

const MAX_GALLERY_IMAGE_SIDE = 1600
const GALLERY_JPEG_QUALITY = 0.82

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

export default function InvitationPartyGallery({ token, uploaderName, className = '' }: Props) {
  const [open, setOpen] = useState(false)
  const [photos, setPhotos] = useState<InvitationGalleryPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<InvitationGalleryPhoto | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resolvedToken = token.trim()
  const totalPhotos = photos.length
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

    getInvitationGallery(resolvedToken)
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
  }, [resolvedToken])

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file || !resolvedToken) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Odaberi fotku iz kamere ili galerije.')
      setNotice('')
      return
    }

    setUploading(true)
    setError('')
    setNotice('')

    try {
      const imageDataUrl = await compressGalleryImage(file)
      const photo = await uploadInvitationGalleryPhoto(resolvedToken, {
        imageDataUrl,
        uploaderName: uploaderName?.trim() || null,
      })
      setPhotos((current) => [photo, ...current.filter((item) => item.id !== photo.id)])
      setNotice('Fotka je dodana.')
      setOpen(true)
    } catch {
      setError('Upload nije uspio. Pokušaj ponovno.')
    } finally {
      setUploading(false)
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
                  {uploading ? 'Fotka se sprema...' : 'Dodaj fotku'}
                </Button>
                <input
                  ref={fileInputRef}
                  className="pb-partyGallery__fileInput"
                  type="file"
                  accept="image/*"
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
                    <button
                      key={photo.id}
                      type="button"
                      className="pb-partyGallery__photoButton"
                      onClick={() => setSelectedPhoto(photo)}
                      aria-label={`Otvori fotku tuluma ${index + 1}`}
                    >
                      <img className="pb-partyGallery__photo" src={photo.imageUrl} alt="" loading="lazy" />
                    </button>
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
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
