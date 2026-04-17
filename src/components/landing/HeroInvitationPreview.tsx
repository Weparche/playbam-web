import { useCallback, useEffect, useRef, useState } from 'react'

type PreviewMode = 'digital' | 'print'

const IMG_DIGITAL = '/pozivnica-home-cura.jpg'
const IMG_PRINT = '/pozivnica-home-cura1.jpg'
const ROTATE_MS = 5000

export default function HeroInvitationPreview() {
  const [mode, setMode] = useState<PreviewMode>('digital')
  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<number | null>(null)

  const startAutoRotate = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    intervalRef.current = window.setInterval(() => {
      setMode((m) => (m === 'digital' ? 'print' : 'digital'))
    }, ROTATE_MS)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      return undefined
    }
    startAutoRotate()
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [startAutoRotate])

  const captions: Record<PreviewMode, string> = {
    digital: 'Ovako je gosti dobivaju linkom',
    print: 'Ovako ide u vrtićki ormarić',
  }

  const setModeAndResetTimer = useCallback(
    (target: PreviewMode) => {
      setMode(target)
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        startAutoRotate()
      }
    },
    [startAutoRotate],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const next: PreviewMode = mode === 'digital' ? 'print' : 'digital'
        setModeAndResetTimer(next)
        const buttons = containerRef.current?.querySelectorAll<HTMLButtonElement>('.ew-hero-visual__dot')
        if (buttons) {
          const idx = next === 'digital' ? 0 : 1
          buttons[idx]?.focus()
        }
      }
    },
    [mode, setModeAndResetTimer],
  )

  return (
    <div className="ew-hero-visual" ref={containerRef}>
      <div
        className={`ew-hero-visual__preview ${mode === 'digital' ? 'ew-hero-visual__preview--active' : 'ew-hero-visual__preview--inactive'}`}
        aria-hidden={mode !== 'digital'}
        id="preview-digital"
      >
        <figure className="ew-hero-visual__photo ew-hero-visual__photo--digital">
          <img
            src={IMG_DIGITAL}
            alt="Primjer digitalne pozivnice"
            className="ew-hero-visual__photo-img"
            width={900}
            height={1200}
            loading="eager"
            decoding="async"
          />
        </figure>
      </div>

      <div
        className={`ew-hero-visual__preview ${mode === 'print' ? 'ew-hero-visual__preview--active' : 'ew-hero-visual__preview--inactive'}`}
        aria-hidden={mode !== 'print'}
        id="preview-print"
      >
        <div className="ew-print-wrapper">
          <figure className="ew-hero-visual__photo ew-hero-visual__photo--print">
            <img
              src={IMG_PRINT}
              alt="Primjer printane pozivnice"
              className="ew-hero-visual__photo-img ew-hero-visual__photo-img--print"
              width={900}
              height={1200}
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>
      </div>

      <div className="ew-hero-visual__caption-area">
        <div className="ew-hero-visual__caption" aria-live="polite">
          {captions[mode]}
        </div>
        <div className="ew-hero-visual__dots" role="group" aria-label="Odaberi vrstu pregleda" onKeyDown={handleKeyDown}>
          <button
            type="button"
            className={`ew-hero-visual__dot${mode === 'digital' ? ' ew-hero-visual__dot--active' : ''}`}
            aria-pressed={mode === 'digital'}
            aria-controls="preview-digital"
            onClick={() => setModeAndResetTimer('digital')}
          >
            Digitalno
          </button>
          <button
            type="button"
            className={`ew-hero-visual__dot${mode === 'print' ? ' ew-hero-visual__dot--active' : ''}`}
            aria-pressed={mode === 'print'}
            aria-controls="preview-print"
            onClick={() => setModeAndResetTimer('print')}
          >
            Za print
          </button>
        </div>
      </div>
    </div>
  )
}
