import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type ImageLightboxProps = {
  images: string[]
  initialIndex: number
  altBase: string
  onClose: () => void
}

export default function ImageLightbox({ images, initialIndex, altBase, onClose }: ImageLightboxProps) {
  const safeImages = useMemo(() => images.filter(Boolean), [images])
  const [index, setIndex] = useState(() => Math.min(Math.max(initialIndex, 0), Math.max(safeImages.length - 1, 0)))
  const touchStartX = useRef<number | null>(null)

  const goTo = useCallback((nextIndex: number) => {
    if (safeImages.length === 0) return
    setIndex((nextIndex + safeImages.length) % safeImages.length)
  }, [safeImages.length])

  const goNext = () => goTo(index + 1)
  const goPrev = () => goTo(index - 1)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') goTo(index + 1)
      if (event.key === 'ArrowLeft') goTo(index - 1)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [goTo, index, onClose])

  if (safeImages.length === 0) return null

  return (
    <div className="ew-photo-lightbox" role="dialog" aria-modal="true" aria-label="Pregled fotografija">
      <button type="button" className="ew-photo-lightbox__backdrop" aria-label="Zatvori fotografiju" onClick={onClose} />

      <div className="ew-photo-lightbox__panel">
        <div className="ew-photo-lightbox__top">
          <span>{index + 1} / {safeImages.length}</span>
          <button type="button" className="ew-photo-lightbox__close" aria-label="Zatvori" onClick={onClose}>
            x
          </button>
        </div>

        <button type="button" className="ew-photo-lightbox__nav ew-photo-lightbox__nav--prev" aria-label="Prethodna fotografija" onClick={goPrev}>
          {'<'}
        </button>
        <div
          className="ew-photo-lightbox__stage"
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX ?? null
          }}
          onTouchEnd={(event) => {
            const startX = touchStartX.current
            touchStartX.current = null
            if (startX == null) return
            const endX = event.changedTouches[0]?.clientX ?? startX
            const deltaX = endX - startX
            if (Math.abs(deltaX) < 44) return
            if (deltaX < 0) goNext()
            else goPrev()
          }}
        >
          <img src={safeImages[index]} alt={`${altBase} fotografija ${index + 1}`} />
        </div>
        <button type="button" className="ew-photo-lightbox__nav ew-photo-lightbox__nav--next" aria-label="Sljedeća fotografija" onClick={goNext}>
          {'>'}
        </button>

        {safeImages.length > 1 ? (
          <div className="ew-photo-lightbox__thumbs" aria-label="Sve fotografije">
            {safeImages.map((src, thumbIndex) => (
              <button
                key={`${src}-${thumbIndex}`}
                type="button"
                className={`ew-photo-lightbox__thumb${thumbIndex === index ? ' is-active' : ''}`}
                onClick={() => goTo(thumbIndex)}
                aria-label={`Prikaži fotografiju ${thumbIndex + 1}`}
                aria-current={thumbIndex === index ? 'true' : undefined}
              >
                <img src={src} alt="" loading="lazy" decoding="async" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
