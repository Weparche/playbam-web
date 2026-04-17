import { useCallback, useRef, useState } from 'react'

type PreviewMode = 'digital' | 'print'

const IMG_DIGITAL = '/pozivnica-home-cura.jpg'
const IMG_PRINT = '/pozivnica-home-cura1.jpg'

export default function HeroInvitationPreview() {
  const [mode, setMode] = useState<PreviewMode>('digital')
  const [locked, setLocked] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const captions: Record<PreviewMode, string> = {
    digital: 'Ovako je gosti dobivaju linkom',
    print: 'Ovako ide u vrtićki ormarić',
  }

  const handleHover = useCallback(
    (target: PreviewMode) => {
      if (!locked) setMode(target)
    },
    [locked],
  )

  const handleClick = useCallback((target: PreviewMode) => {
    setMode(target)
    setLocked(true)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const next: PreviewMode = mode === 'digital' ? 'print' : 'digital'
        setMode(next)
        setLocked(true)
        const buttons = containerRef.current?.querySelectorAll<HTMLButtonElement>('.ew-hero-visual__dot')
        if (buttons) {
          const idx = next === 'digital' ? 0 : 1
          buttons[idx]?.focus()
        }
      }
    },
    [mode],
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
              className="ew-hero-visual__photo-img"
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
            onMouseEnter={() => handleHover('digital')}
            onClick={() => handleClick('digital')}
          >
            Digitalno
          </button>
          <button
            type="button"
            className={`ew-hero-visual__dot${mode === 'print' ? ' ew-hero-visual__dot--active' : ''}`}
            aria-pressed={mode === 'print'}
            aria-controls="preview-print"
            onMouseEnter={() => handleHover('print')}
            onClick={() => handleClick('print')}
          >
            Za print
          </button>
        </div>
      </div>
    </div>
  )
}
