import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { createPortal } from 'react-dom'

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
import { lockScroll, unlockScroll } from '../../lib/scrollLock'
import type { TemporaryWebIdentity } from '../../lib/tempWebIdentity'

type Props = {
  token: string
  uploaderName?: string | null
  isHost?: boolean
  identity?: TemporaryWebIdentity | null
  className?: string
}

type PendingUpload = {
  localId: string
  previewUrl: string
}

const MAX_GALLERY_IMAGE_SIDE = 1600
const GALLERY_JPEG_QUALITY = 0.82
const MAX_UPLOAD_BATCH = 100
const UPLOAD_CONCURRENCY = 3
const GRID_PREVIEW_COUNT = 12
const MESSAGE_TIMEOUT_MS = 5000
const SWIPE_THRESHOLD_PX = 40

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

function formatRelativeTime(iso: string) {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) {
    return ''
  }

  const diffMs = Date.now() - then
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return 'upravo sad'
  if (minutes < 60) return `prije ${minutes} min`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `prije ${hours} h`

  const days = Math.round(hours / 24)
  if (days < 7) return `prije ${days} d`

  return new Date(then).toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' })
}

function getDayGroupLabel(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const startOfDay = (input: Date) => new Date(input.getFullYear(), input.getMonth(), input.getDate()).getTime()
  const today = startOfDay(new Date())
  const photoDay = startOfDay(date)
  const dayDiff = Math.round((today - photoDay) / 86400000)

  if (dayDiff <= 0) return 'Danas'
  if (dayDiff === 1) return 'Jučer'
  return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' })
}

type PhotoGroup = {
  label: string
  items: { photo: InvitationGalleryPhoto; globalIndex: number }[]
}

function groupPhotosByDay(photos: InvitationGalleryPhoto[]): PhotoGroup[] {
  const groups: PhotoGroup[] = []
  photos.forEach((photo, globalIndex) => {
    const label = getDayGroupLabel(photo.createdAt)
    const last = groups[groups.length - 1]
    if (last && last.label === label) {
      last.items.push({ photo, globalIndex })
    } else {
      groups.push({ label, items: [{ photo, globalIndex }] })
    }
  })
  return groups
}

function GalleryCameraIcon() {
  return (
    <svg viewBox="0 0 24 24" width={28} height={28} fill="none" aria-hidden>
      <path
        d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2a1 1 0 0 0 .83-.45l.74-1.1A1 1 0 0 1 10.1 4h3.8a1 1 0 0 1 .83.45l.74 1.1a1 1 0 0 0 .83.45h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function GalleryTrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" aria-hidden>
      <path
        d="M4 7h16M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7m2 0-.7 11.1a1.5 1.5 0 0 1-1.5 1.4H9.2a1.5 1.5 0 0 1-1.5-1.4L7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GalleryDownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" aria-hidden>
      <path
        d="M12 4v10m0 0 4-4m-4 4-4-4M5 19h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GalleryChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} fill="none" aria-hidden>
      <path
        d={direction === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Blur-up fade: slika starta mutna/prozirna i izoštri se kad se učita. */
function GalleryThumbImage({ src, className = '' }: { src: string; className?: string }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <img
      className={`${className} pb-partyGallery__photo ${loaded ? 'is-loaded' : ''}`.trim()}
      src={src}
      alt=""
      loading="lazy"
      onLoad={() => setLoaded(true)}
    />
  )
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
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadTotal, setUploadTotal] = useState(0)
  const [uploadDone, setUploadDone] = useState(0)
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<InvitationGalleryPhoto | null>(null)
  const [slideDir, setSlideDir] = useState<'next' | 'prev' | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isGesturing, setIsGesturing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const confirmResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const swipeStartX = useRef<number | null>(null)
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map())
  const pinchStart = useRef<{ dist: number; zoom: number } | null>(null)
  const panStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null)
  const filmstripRef = useRef<HTMLDivElement>(null)

  const uploading = uploadTotal > 0
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

  const visiblePhotos = showAll ? photos : photos.slice(0, GRID_PREVIEW_COUNT)
  const hiddenCount = Math.max(0, photos.length - GRID_PREVIEW_COUNT)
  const visibleGroups = useMemo(() => groupPhotosByDay(visiblePhotos), [visiblePhotos])
  const showGroupLabels = visibleGroups.length > 1
  const lastVisibleIndex = visiblePhotos.length - 1

  const selectedPhotoIndex = useMemo(
    () => (selectedPhoto ? photos.findIndex((photo) => photo.id === selectedPhoto.id) : -1),
    [photos, selectedPhoto],
  )

  useEffect(() => {
    if (!notice && !error) {
      return
    }
    const timer = setTimeout(() => {
      setNotice('')
      setError('')
    }, MESSAGE_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [notice, error])

  useEffect(() => {
    return () => {
      if (confirmResetTimer.current) {
        clearTimeout(confirmResetTimer.current)
      }
    }
  }, [])

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

  const uploadFiles = useCallback(
    async (rawFiles: File[]) => {
      if (!resolvedToken || uploading) {
        return
      }

      const imageFiles = rawFiles.filter((file) => file.type.startsWith('image/'))
      if (!imageFiles.length) {
        setNotice('')
        setError('Odaberi fotke iz kamere ili galerije.')
        return
      }

      if (imageFiles.length > MAX_UPLOAD_BATCH) {
        setNotice('')
        setError(`Možeš odjednom dodati najviše ${MAX_UPLOAD_BATCH} fotki.`)
        return
      }

      setError('')
      setNotice('')
      setOpen(true)
      setUploadTotal(imageFiles.length)
      setUploadDone(0)

      const queue = imageFiles.map((file, index) => ({
        file,
        localId: `local-${Date.now()}-${index}`,
        previewUrl: URL.createObjectURL(file),
      }))

      setPendingUploads(queue.map(({ localId, previewUrl }) => ({ localId, previewUrl })))

      let failedCount = 0
      let successCount = 0
      let cursor = 0

      const finishPending = (localId: string, previewUrl: string) => {
        setPendingUploads((current) => current.filter((item) => item.localId !== localId))
        URL.revokeObjectURL(previewUrl)
      }

      const worker = async () => {
        while (cursor < queue.length) {
          const current = queue[cursor]
          cursor += 1
          try {
            const imageDataUrl = await compressGalleryImage(current.file)
            const photo = await uploadInvitationGalleryPhoto(
              resolvedToken,
              {
                imageDataUrl,
                uploaderName: uploaderName?.trim() || null,
                uploaderClientId: uploaderClientId || null,
              },
              galleryRequestOptions,
            )
            successCount += 1
            setPhotos((prev) => [photo, ...prev.filter((item) => item.id !== photo.id)])
          } catch {
            failedCount += 1
          } finally {
            finishPending(current.localId, current.previewUrl)
            setUploadDone((prev) => prev + 1)
          }
        }
      }

      const workers = Array.from({ length: Math.min(UPLOAD_CONCURRENCY, queue.length) }, () => worker())
      await Promise.all(workers)

      if (successCount) {
        setNotice(successCount === 1 ? 'Fotka je dodana.' : `${successCount} fotki je dodano.`)
      }

      if (failedCount) {
        setError(
          failedCount === 1
            ? 'Jedna fotka nije uspjela. Pokušaj ponovno.'
            : `${failedCount} fotki nije uspjelo. Pokušaj ponovno.`,
        )
      } else if (!successCount) {
        setError('Upload nije uspio. Pokušaj ponovno.')
      }

      setPendingUploads([])
      setUploadTotal(0)
      setUploadDone(0)
    },
    [galleryRequestOptions, resolvedToken, uploaderClientId, uploaderName, uploading],
  )

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    void uploadFiles(files)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const files = Array.from(event.dataTransfer.files ?? [])
    if (files.length) {
      void uploadFiles(files)
    }
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (event.currentTarget === event.target) {
      setIsDragging(false)
    }
  }

  const requestDelete = (photoId: string) => {
    if (confirmResetTimer.current) {
      clearTimeout(confirmResetTimer.current)
    }
    setConfirmDeleteId(photoId)
    confirmResetTimer.current = setTimeout(() => setConfirmDeleteId(null), 4000)
  }

  const cancelDelete = () => {
    if (confirmResetTimer.current) {
      clearTimeout(confirmResetTimer.current)
    }
    setConfirmDeleteId(null)
  }

  const handleDeletePhoto = async (photo: InvitationGalleryPhoto) => {
    if (!photo.canDelete || !resolvedToken || deletingPhotoId) {
      return
    }

    cancelDelete()
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

  const handleDownload = async (photo: InvitationGalleryPhoto, index: number) => {
    if (downloading) return
    setDownloading(true)
    try {
      const response = await fetch(photo.imageUrl)
      if (!response.ok) {
        throw new Error('DOWNLOAD_FAILED')
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `tulum-fotka-${index + 1}.jpg`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch {
      setError('Preuzimanje nije uspjelo. Pokušaj ponovno.')
    } finally {
      setDownloading(false)
    }
  }

  const showPreviousPhoto = useCallback(() => {
    setSlideDir('prev')
    setSelectedPhoto((current) => {
      if (!current) return current
      const index = photos.findIndex((photo) => photo.id === current.id)
      if (index < 0 || photos.length === 0) return current
      const nextIndex = index === 0 ? photos.length - 1 : index - 1
      return photos[nextIndex]
    })
  }, [photos])

  const showNextPhoto = useCallback(() => {
    setSlideDir('next')
    setSelectedPhoto((current) => {
      if (!current) return current
      const index = photos.findIndex((photo) => photo.id === current.id)
      if (index < 0 || photos.length === 0) return current
      const nextIndex = index === photos.length - 1 ? 0 : index + 1
      return photos[nextIndex]
    })
  }, [photos])

  const openLightbox = (photo: InvitationGalleryPhoto) => {
    setSlideDir(null)
    setSelectedPhoto(photo)
  }

  const jumpToPhoto = (photo: InvitationGalleryPhoto, index: number) => {
    setSlideDir(index > selectedPhotoIndex ? 'next' : 'prev')
    setSelectedPhoto(photo)
  }

  useEffect(() => {
    if (!selectedPhoto) {
      return
    }
    lockScroll()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedPhoto(null)
      else if (event.key === 'ArrowLeft') showPreviousPhoto()
      else if (event.key === 'ArrowRight') showNextPhoto()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      unlockScroll()
    }
  }, [selectedPhoto, showPreviousPhoto, showNextPhoto])

  useEffect(() => {
    if (!selectedPhoto || !filmstripRef.current) {
      return
    }
    const active = filmstripRef.current.querySelector<HTMLElement>('[data-active="true"]')
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [selectedPhoto])

  const resetZoom = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  useEffect(() => {
    resetZoom()
  }, [resetZoom, selectedPhoto?.id])

  const onImagePointerDown = (event: ReactPointerEvent<HTMLImageElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId)
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    setIsGesturing(true)

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom }
      swipeStartX.current = null
    } else if (zoom > 1) {
      panStart.current = { x: event.clientX, y: event.clientY, px: pan.x, py: pan.y }
    } else {
      swipeStartX.current = event.clientX
    }
  }

  const onImagePointerMove = (event: ReactPointerEvent<HTMLImageElement>) => {
    if (!pointers.current.has(event.pointerId)) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (pointers.current.size >= 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const nextZoom = Math.min(4, Math.max(1, (pinchStart.current.zoom * dist) / pinchStart.current.dist))
      setZoom(nextZoom)
      if (nextZoom === 1) {
        setPan({ x: 0, y: 0 })
      }
    } else if (pointers.current.size === 1 && zoom > 1 && panStart.current) {
      setPan({
        x: panStart.current.px + (event.clientX - panStart.current.x),
        y: panStart.current.py + (event.clientY - panStart.current.y),
      })
    }
  }

  const onImagePointerUp = (event: ReactPointerEvent<HTMLImageElement>) => {
    const swipeOrigin = swipeStartX.current
    pointers.current.delete(event.pointerId)

    if (pointers.current.size < 2) {
      pinchStart.current = null
    }

    if (pointers.current.size === 0) {
      panStart.current = null
      setIsGesturing(false)
      if (zoom === 1 && swipeOrigin !== null) {
        const delta = event.clientX - swipeOrigin
        if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) {
          if (delta > 0) showPreviousPhoto()
          else showNextPhoto()
        }
      }
      swipeStartX.current = null
    }
  }

  const toggleZoom = () => {
    setZoom((current) => {
      if (current > 1) {
        setPan({ x: 0, y: 0 })
        return 1
      }
      return 2.5
    })
  }

  const uploadProgressPct = uploadTotal > 0 ? Math.round((uploadDone / uploadTotal) * 100) : 0

  const renderPhotoCell = (photo: InvitationGalleryPhoto, globalIndex: number) => {
    const isLastPreview = !showAll && hiddenCount > 0 && globalIndex === lastVisibleIndex
    return (
      <div key={photo.id} className="pb-partyGallery__photoCell">
        <button
          type="button"
          className="pb-partyGallery__photoButton"
          onClick={() => (isLastPreview ? setShowAll(true) : openLightbox(photo))}
          aria-label={
            isLastPreview ? `Prikaži još ${hiddenCount} fotki` : `Otvori fotku tuluma ${globalIndex + 1}`
          }
        >
          <GalleryThumbImage src={photo.imageUrl} />
          {isLastPreview ? (
            <span className="pb-partyGallery__moreOverlay" aria-hidden>
              +{hiddenCount}
            </span>
          ) : null}
          {!isLastPreview && photo.uploaderName ? (
            <span className="pb-partyGallery__uploaderChip">{photo.uploaderName}</span>
          ) : null}
        </button>
        {photo.canDelete && !isLastPreview ? (
          confirmDeleteId === photo.id ? (
            <div className="pb-partyGallery__confirm" role="group" aria-label="Potvrda brisanja">
              <button
                type="button"
                className="pb-partyGallery__confirmYes"
                onClick={() => void handleDeletePhoto(photo)}
                disabled={deletingPhotoId === photo.id}
              >
                {deletingPhotoId === photo.id ? '...' : 'Obriši'}
              </button>
              <button type="button" className="pb-partyGallery__confirmNo" onClick={cancelDelete}>
                Ne
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="pb-partyGallery__deleteButton"
              onClick={() => requestDelete(photo.id)}
              aria-label={`Obriši fotku ${globalIndex + 1}`}
            >
              <GalleryTrashIcon />
            </button>
          )
        ) : null}
      </div>
    )
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
            <div
              className={`pb-partyGallery ${isDragging ? 'is-dragging' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {photos.length > 0 || loading || uploading ? (
                <div className="pb-partyGallery__toolbar">
                  <Button
                    type="button"
                    variant="primary"
                    className="pb-partyGallery__uploadButton"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <span className="pb-partyGallery__uploadIcon" aria-hidden>
                      <GalleryCameraIcon />
                    </span>
                    {uploading ? 'Fotke se spremaju...' : 'Dodaj fotke'}
                  </Button>
                  {!loading && totalPhotos > 0 ? (
                    <span className="pb-partyGallery__count">
                      {totalPhotos} {totalPhotos === 1 ? 'fotka' : 'fotki'}
                    </span>
                  ) : null}
                </div>
              ) : null}

              <input
                ref={fileInputRef}
                className="pb-partyGallery__fileInput"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />

              {uploading ? (
                <div className="pb-partyGallery__progress" role="status" aria-live="polite">
                  <div className="pb-partyGallery__progressTrack">
                    <div className="pb-partyGallery__progressFill" style={{ width: `${uploadProgressPct}%` }} />
                  </div>
                  <span className="pb-partyGallery__progressLabel">
                    Spremamo {uploadDone} / {uploadTotal} fotki
                  </span>
                </div>
              ) : null}

              <div aria-live="polite">
                {notice ? <div className="pb-inlineNote pb-inlineNote--success">{notice}</div> : null}
                {error ? <div className="pb-inlineNote pb-inlineNote--error">{error}</div> : null}
              </div>

              {loading ? (
                <div className="pb-partyGallery__masonry" aria-hidden>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="pb-partyGallery__skeleton"
                      style={{ height: `${[9, 6.5, 7.5, 6, 8.5, 7][index % 6]}rem` }}
                    />
                  ))}
                </div>
              ) : null}

              {!loading && photos.length === 0 && !uploading ? (
                <button
                  type="button"
                  className="pb-partyGallery__dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="pb-partyGallery__dropzoneIcon" aria-hidden>
                    <GalleryCameraIcon />
                  </span>
                  <span className="pb-partyGallery__dropzoneTitle">Dodaj prve fotke</span>
                  <span className="pb-partyGallery__dropzoneHint">
                    Klikni ili povuci fotke ovamo i podijeli uspomene s tuluma.
                  </span>
                </button>
              ) : null}

              {pendingUploads.length > 0 ? (
                <div className="pb-partyGallery__masonry pb-partyGallery__masonry--pending">
                  {pendingUploads.map((item) => (
                    <div key={item.localId} className="pb-partyGallery__photoCell pb-partyGallery__photoCell--pending">
                      <img className="pb-partyGallery__photo is-loaded" src={item.previewUrl} alt="" />
                      <span className="pb-partyGallery__pendingOverlay" aria-hidden>
                        <span className="pb-partyGallery__spinner" />
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              {!loading && photos.length > 0 ? (
                <>
                  {visibleGroups.map((group) => (
                    <div key={group.label} className="pb-partyGallery__group">
                      {showGroupLabels ? (
                        <h3 className="pb-partyGallery__groupTitle">{group.label}</h3>
                      ) : null}
                      <div className="pb-partyGallery__masonry">
                        {group.items.map(({ photo, globalIndex }) => renderPhotoCell(photo, globalIndex))}
                      </div>
                    </div>
                  ))}

                  {hiddenCount > 0 ? (
                    <button
                      type="button"
                      className="pb-partyGallery__showAll"
                      onClick={() => setShowAll((current) => !current)}
                    >
                      {showAll ? 'Prikaži manje' : `Prikaži sve (${photos.length})`}
                    </button>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>

      {selectedPhoto
        ? createPortal(
        <div className="pb-lightbox" role="dialog" aria-modal="true" aria-label="Galerija tuluma">
          <div className="pb-lightbox__top">
            <span className="pb-lightbox__counter">
              {selectedPhotoIndex + 1} / {photos.length}
            </span>
            <button
              type="button"
              className="pb-lightbox__iconBtn"
              onClick={() => setSelectedPhoto(null)}
              aria-label="Zatvori galeriju"
            >
              ×
            </button>
          </div>

          <div
            className={`pb-lightbox__stage ${zoom > 1 ? 'is-zoomed' : ''}`}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedPhoto(null)
              }
            }}
          >
            {photos.length > 1 && zoom === 1 ? (
              <button
                type="button"
                className="pb-lightbox__edge pb-lightbox__edge--prev"
                onClick={showPreviousPhoto}
                aria-label="Prethodna fotka"
              >
                <GalleryChevronIcon direction="left" />
              </button>
            ) : null}
            <img
              key={selectedPhoto.id}
              className={`pb-lightbox__image ${
                slideDir === 'next'
                  ? 'pb-lightbox__image--fromRight'
                  : slideDir === 'prev'
                    ? 'pb-lightbox__image--fromLeft'
                    : ''
              }`}
              src={selectedPhoto.imageUrl}
              alt="Fotka iz galerije tuluma"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transition: isGesturing ? 'none' : undefined,
                cursor: zoom > 1 ? 'grab' : 'zoom-in',
              }}
              onPointerDown={onImagePointerDown}
              onPointerMove={onImagePointerMove}
              onPointerUp={onImagePointerUp}
              onPointerCancel={onImagePointerUp}
              onDoubleClick={toggleZoom}
              draggable={false}
            />
            {photos.length > 1 && zoom === 1 ? (
              <button
                type="button"
                className="pb-lightbox__edge pb-lightbox__edge--next"
                onClick={showNextPhoto}
                aria-label="Sljedeća fotka"
              >
                <GalleryChevronIcon direction="right" />
              </button>
            ) : null}
            {zoom > 1 ? (
              <button type="button" className="pb-lightbox__zoomReset" onClick={resetZoom} aria-label="Poništi zoom">
                Smanji
              </button>
            ) : null}
          </div>

          <div className="pb-lightbox__bottom">
            <div className="pb-lightbox__metaRow">
              <span className="pb-lightbox__meta">
                {selectedPhoto.uploaderName ? `${selectedPhoto.uploaderName} · ` : ''}
                {formatRelativeTime(selectedPhoto.createdAt)}
              </span>
              <div className="pb-lightbox__actions">
                <button
                  type="button"
                  className="pb-lightbox__action"
                  onClick={() => void handleDownload(selectedPhoto, selectedPhotoIndex)}
                  disabled={downloading}
                >
                  <GalleryDownloadIcon />
                  {downloading ? 'Preuzimamo...' : 'Preuzmi'}
                </button>
                {selectedPhoto.canDelete ? (
                  confirmDeleteId === selectedPhoto.id ? (
                    <>
                      <button
                        type="button"
                        className="pb-lightbox__action pb-lightbox__action--danger"
                        onClick={() => void handleDeletePhoto(selectedPhoto)}
                        disabled={deletingPhotoId === selectedPhoto.id}
                      >
                        {deletingPhotoId === selectedPhoto.id ? 'Brišemo...' : 'Sigurno obriši'}
                      </button>
                      <button type="button" className="pb-lightbox__action" onClick={cancelDelete}>
                        Odustani
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="pb-lightbox__action pb-lightbox__action--danger"
                      onClick={() => requestDelete(selectedPhoto.id)}
                    >
                      <GalleryTrashIcon />
                      Obriši
                    </button>
                  )
                ) : null}
              </div>
            </div>

            {photos.length > 1 ? (
              <div className="pb-lightbox__filmstrip" ref={filmstripRef}>
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    type="button"
                    className={`pb-lightbox__thumb ${photo.id === selectedPhoto.id ? 'is-active' : ''}`}
                    data-active={photo.id === selectedPhoto.id ? 'true' : undefined}
                    onClick={() => jumpToPhoto(photo, index)}
                    aria-label={`Prikaži fotku ${index + 1}`}
                    aria-current={photo.id === selectedPhoto.id}
                  >
                    <img src={photo.imageUrl} alt="" loading="lazy" draggable={false} />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>,
        document.body,
      )
        : null}
    </>
  )
}
